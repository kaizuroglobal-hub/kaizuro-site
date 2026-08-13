import app from "./main.js";
export { PartnerReferrals } from "./main.js";

const NOTIFY_TO = "info@kaizuro.com";
const NOTIFY_FROM = "info@kaizuro.com";
const TRANSIENT_PARAMS = ["referral", "referral_error", "support", "support_error", "notify"];

function field(form, name) {
  return String(form.get(name) || "").trim();
}

function referralEmail(form, reference) {
  const partner = field(form, "Partner") || "Unknown partner";
  const partnerId = field(form, "Partner ID") || "—";
  const partnerCode = field(form, "Partner code") || "—";
  const customerName = field(form, "Customer name") || "—";
  const customerEmail = field(form, "Customer email") || "—";
  const customerMobile = field(form, "Customer mobile") || "—";
  const productInterest = field(form, "Product interest") || "—";
  const targetSpecies = field(form, "Target species") || "—";
  const typicalPeClass = field(form, "Typical PE class") || "—";
  const fishingRequirements = field(form, "Fishing requirements") || "—";

  return {
    subject: `KAIZURO Partner Referral · ${reference}`,
    text: [
      "A new KAIZURO partner customer referral has been registered.",
      "",
      `Reference: ${reference}`,
      `Partner: ${partner}`,
      `Partner ID: ${partnerId}`,
      `Partner code: ${partnerCode}`,
      "",
      `Customer: ${customerName}`,
      `Email: ${customerEmail}`,
      `Mobile: ${customerMobile}`,
      `Product interest: ${productInterest}`,
      `Target species: ${targetSpecies}`,
      `Typical PE class: ${typicalPeClass}`,
      "",
      "Fishing requirements / notes:",
      fishingRequirements,
      "",
      "This submission is also saved in the KAIZURO Partner Portal.",
    ].join("\n"),
  };
}

function supportEmail(form, reference) {
  const partner = field(form, "Partner") || "Unknown partner";
  const partnerId = field(form, "Partner ID") || "—";
  const partnerCode = field(form, "Partner code") || "—";
  const requestType = field(form, "Request type") || "—";
  const customerReference = field(form, "Customer or reference") || "—";
  const details = field(form, "Details") || "—";

  return {
    subject: `KAIZURO Partner Support · ${requestType} · ${reference}`,
    text: [
      "A new KAIZURO partner support request has been submitted.",
      "",
      `Reference: ${reference}`,
      `Partner: ${partner}`,
      `Partner ID: ${partnerId}`,
      `Partner code: ${partnerCode}`,
      `Request type: ${requestType}`,
      `Customer / reference: ${customerReference}`,
      "",
      "Details:",
      details,
      "",
      "This submission is also saved in the KAIZURO Partner Portal.",
    ].join("\n"),
  };
}

function referenceFromRedirect(response, requestUrl, key) {
  const location = response.headers.get("Location");
  if (!location) return "";
  try {
    const redirect = new URL(location, requestUrl);
    return redirect.searchParams.get(key) || "";
  } catch {
    return "";
  }
}

function withNotifyStatus(response, requestUrl, status) {
  const location = response.headers.get("Location");
  if (!location) return response;
  try {
    const redirect = new URL(location, requestUrl);
    redirect.searchParams.set("notify", status);
    const headers = new Headers(response.headers);
    headers.set("Location", redirect.toString());
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch {
    return response;
  }
}

async function sendNotification(env, message) {
  if (!env.PARTNER_NOTIFICATIONS) throw new Error("Partner notification email binding is not configured");
  return env.PARTNER_NOTIFICATIONS.send({
    to: NOTIFY_TO,
    from: { email: NOTIFY_FROM, name: "KAIZURO Partner Portal" },
    replyTo: NOTIFY_TO,
    subject: message.subject,
    text: message.text,
  });
}

function transientCleanupMarkup() {
  return `<script>(function(){try{const u=new URL(window.location.href);let changed=false;${JSON.stringify(TRANSIENT_PARAMS)}.forEach(function(k){if(u.searchParams.has(k)){u.searchParams.delete(k);changed=true}});if(changed){const q=u.searchParams.toString();history.replaceState(null,"",u.pathname+(q?"?"+q:"")+u.hash)}}catch(e){}})();</script>`;
}

function decorateResultPage(response, url, selector) {
  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes("text/html")) return response;

  const status = url.searchParams.get("notify");
  const markup = status === "sent"
    ? '<div class="callout"><b>Email notification sent.</b><br>KAIZURO has been notified at info@kaizuro.com.</div>'
    : status === "failed"
      ? '<div class="callout"><b>Email notification not sent.</b><br>Your submission was saved successfully in the Partner Portal, but the email notification could not be delivered.</div>'
      : "";

  const rewriter = new HTMLRewriter();
  if (markup) {
    rewriter.on(selector, {
      element(element) {
        element.prepend(markup, { html: true });
      },
    });
  }
  rewriter.on("body", {
    element(element) {
      element.append(transientCleanupMarkup(), { html: true });
    },
  });
  return rewriter.transform(response);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const isReferral = url.pathname === "/partners/portal/referrals" && request.method === "POST";
    const isSupport = url.pathname === "/partners/portal/support-requests" && request.method === "POST";

    if (isReferral || isSupport) {
      const form = await request.clone().formData();
      const response = await app.fetch(request, env, ctx);
      if (response.status !== 303) return response;

      const key = isReferral ? "referral" : "support";
      const reference = referenceFromRedirect(response, request.url, key);
      if (!reference) return response;

      const message = isReferral ? referralEmail(form, reference) : supportEmail(form, reference);
      try {
        await sendNotification(env, message);
        return withNotifyStatus(response, request.url, "sent");
      } catch (error) {
        console.error("KAIZURO partner notification email failed", error);
        return withNotifyStatus(response, request.url, "failed");
      }
    }

    const response = await app.fetch(request, env, ctx);
    if ((url.pathname === "/partners/portal/account" || url.pathname === "/partners/portal/account/") && request.method === "GET") {
      return decorateResultPage(response, url, "#customer-referral");
    }
    if ((url.pathname === "/partners/portal/support" || url.pathname === "/partners/portal/support/") && request.method === "GET") {
      return decorateResultPage(response, url, "#support-form");
    }
    return response;
  },
};
