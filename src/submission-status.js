import app from "./notify.js";
export { PartnerReferrals } from "./notify.js";

const PORTAL_HOST = "portal.kaizuro.com";
const NOTIFY_TO = "info@kaizuro.com";
const NOTIFY_FROM = "notifications@portal.kaizuro.com";
const STORE_NAME = "kaizuro-partner-submissions";

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function field(form, name, maxLength = 500) {
  return String(form.get(name) || "").trim().slice(0, maxLength);
}

function validOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}

function applicationReference() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const random = crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase();
  return `KZP-${date}-${random}`;
}

function accessPage({ error = "", success = "", reference = "" } = {}) {
  const safeError = esc(error);
  const safeSuccess = esc(success);
  const safeReference = esc(reference);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <title>KAIZURO | Partner Portal</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root{--ink:#111214;--muted:#666b70;--line:#d8d9d6;--paper:#f4f4f1;--white:#fff;--dark:#070809;--accent:#111214}
    *{box-sizing:border-box}
    html,body{margin:0;min-height:100%;font-family:Inter,Arial,sans-serif;background:var(--paper);color:var(--ink)}
    body{min-height:100svh}
    a{color:inherit}
    header{height:72px;display:flex;align-items:center;justify-content:space-between;padding:0 clamp(20px,5vw,72px);background:#050606;color:#f4f4f2;border-bottom:1px solid rgba(255,255,255,.12)}
    .brand{font-size:20px;font-weight:600;letter-spacing:.16em;text-decoration:none}
    .secure{font-size:10px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:rgba(255,255,255,.58)}
    main{width:min(1180px,calc(100% - 40px));margin:0 auto;padding:clamp(54px,7vw,96px) 0 80px}
    .intro{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(320px,.9fr);gap:42px;align-items:end;padding-bottom:42px;border-bottom:1px solid var(--line)}
    .eyebrow{margin:0 0 14px;font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#777b7f}
    h1{max-width:760px;margin:0;font-size:clamp(42px,6vw,76px);font-weight:300;line-height:.98;letter-spacing:-.05em}
    .intro-copy{margin:0;color:var(--muted);font-size:15px;line-height:1.72}
    .grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(320px,.65fr);gap:22px;margin-top:28px;align-items:start}
    .panel{background:var(--white);border:1px solid var(--line);padding:clamp(26px,3vw,38px)}
    .panel h2{margin:0 0 9px;font-size:clamp(25px,3vw,34px);font-weight:400;letter-spacing:-.03em}
    .panel>p{margin:0 0 24px;color:var(--muted);font-size:14px;line-height:1.65}
    form{display:grid;gap:16px}
    .two{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    label{display:grid;gap:7px;color:#383b3e;font-size:11px;font-weight:600;letter-spacing:.02em}
    input,select,textarea{width:100%;min-height:50px;padding:12px 13px;border:1px solid #c5c7c8;background:#fff;color:#111214;font:inherit;font-size:14px;outline:none;border-radius:0}
    textarea{min-height:112px;resize:vertical}
    input:focus,select:focus,textarea:focus{border-color:#111214;box-shadow:0 0 0 1px #111214}
    button{min-height:54px;padding:0 20px;border:1px solid #111214;background:#111214;color:#fff;font:inherit;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}
    button:hover,button:focus-visible{background:#26282a}
    .note{margin:2px 0 0!important;color:#777b7f!important;font-size:11px!important;line-height:1.55!important}
    .login-panel{background:#0b0c0d;color:#f4f4f2;border-color:#0b0c0d;position:sticky;top:20px}
    .login-panel h2{color:#fff}
    .login-panel>p{color:rgba(255,255,255,.6)}
    .login-panel label{color:rgba(255,255,255,.72)}
    .login-panel input{background:#060708;color:#fff;border-color:rgba(255,255,255,.24)}
    .login-panel input:focus{border-color:#fff;box-shadow:none}
    .login-panel button{background:#f4f4f2;color:#08090a;border-color:#f4f4f2}
    .login-panel button:hover{background:#fff}
    .success{display:grid;gap:8px;margin:0 0 28px;padding:22px 24px;border:1px solid #7eb58a;background:#edf7ef;color:#17391f}
    .success strong{font-size:18px;font-weight:600}
    .success span{font-size:12px;line-height:1.5;color:#3b6544}
    .error{margin:0 0 22px;padding:16px 18px;border-left:2px solid #b64e4e;background:#fff2f2;color:#8e2f2f;font-size:13px;line-height:1.55}
    .process{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:18px}
    .step{padding:16px 0;border-top:1px solid rgba(255,255,255,.18);color:rgba(255,255,255,.62);font-size:11px;line-height:1.5}
    .step b{display:block;margin-bottom:5px;color:#fff;font-size:10px;letter-spacing:.08em;text-transform:uppercase}
    .hp{position:absolute!important;left:-9999px!important;width:1px!important;height:1px!important;overflow:hidden!important}
    footer{padding:24px clamp(20px,5vw,72px) 34px;background:#050606;color:rgba(255,255,255,.48);font-size:11px;line-height:1.6}
    @media(max-width:820px){.intro,.grid{grid-template-columns:1fr}.login-panel{position:static}.intro{gap:22px}.grid{gap:18px}.process{grid-template-columns:1fr}.step{padding:12px 0}.two{grid-template-columns:1fr}}
    @media(max-width:520px){header{height:66px}.brand{font-size:17px}.secure{font-size:9px}main{width:min(100% - 28px,1180px);padding-top:38px}.panel{padding:24px 18px}h1{font-size:42px}.intro-copy{font-size:14px}input,select,textarea{font-size:16px}}
  </style>
</head>
<body>
  <header><a class="brand" href="/">KAIZURO</a><span class="secure">Partner Portal</span></header>
  <main>
    <section class="intro">
      <div>
        <p class="eyebrow">KAIZURO Partner Network</p>
        <h1>Register. Get approved. Start partnering.</h1>
      </div>
      <p class="intro-copy">For boat dealers, offshore charters, guides and selected fishing partners. Submit your details below. KAIZURO reviews every application and approved partners receive private portal access.</p>
    </section>

    <div class="grid">
      <section class="panel" id="register">
        ${safeSuccess ? `<div class="success" role="status"><strong>✓ ${safeSuccess}</strong><span>${safeReference ? `Application reference: ${safeReference}. ` : ""}KAIZURO has received your registration and will contact you by email after review.</span></div>` : ""}
        ${safeError ? `<div class="error" role="alert">${safeError}</div>` : ""}
        <p class="eyebrow">New partner</p>
        <h2>Register now.</h2>
        <p>Tell us who you are and how you work in the fishing industry. Registration does not automatically grant portal access.</p>
        <form method="post" action="/partners/register">
          <div class="two">
            <label>Business / organisation
              <input name="businessName" autocomplete="organization" maxlength="140" required>
            </label>
            <label>Your name
              <input name="contactName" autocomplete="name" maxlength="140" required>
            </label>
          </div>
          <div class="two">
            <label>Email
              <input type="email" name="email" autocomplete="email" maxlength="254" required>
            </label>
            <label>Mobile
              <input name="mobile" autocomplete="tel" maxlength="60" required>
            </label>
          </div>
          <div class="two">
            <label>Partner type
              <select name="partnerType" required>
                <option value="">Select</option>
                <option>Boat dealer</option>
                <option>Offshore charter</option>
                <option>Fishing guide</option>
                <option>Fishing club</option>
                <option>Marine / fishing industry</option>
                <option>Other</option>
              </select>
            </label>
            <label>Location
              <input name="location" autocomplete="country-name" maxlength="140" placeholder="City, State / Region, Country" required>
            </label>
          </div>
          <label>Website / social
            <input name="website" inputmode="url" maxlength="300" placeholder="Website, Instagram or LinkedIn">
          </label>
          <label>Tell us about your business and why KAIZURO fits
            <textarea name="notes" maxlength="2000" required></textarea>
          </label>
          <label class="hp" aria-hidden="true">Leave this blank<input name="companyFax" tabindex="-1" autocomplete="off"></label>
          <button type="submit">Submit partner registration</button>
          <p class="note">Applications are reviewed by KAIZURO. Approved partners are contacted directly by email with portal access.</p>
        </form>
      </section>

      <aside class="panel login-panel" id="login">
        <p class="eyebrow">Approved partner</p>
        <h2>Sign in.</h2>
        <p>Already approved? Use your KAIZURO partner credentials.</p>
        <form method="post" action="/partners/login">
          <label>Username
            <input name="username" autocomplete="username" required>
          </label>
          <label>Password
            <input type="password" name="password" autocomplete="current-password" required>
          </label>
          <button type="submit">Sign in to portal</button>
        </form>
        <div class="process">
          <div class="step"><b>01 · Register</b>Submit your business details.</div>
          <div class="step"><b>02 · Review</b>KAIZURO reviews the application.</div>
          <div class="step"><b>03 · Access</b>Approved partners receive portal access.</div>
        </div>
      </aside>
    </div>
  </main>
  <footer>KAIZURO™ Partner Portal · Applications are subject to review and approval by KAIZURO.</footer>
</body>
</html>`;
}

function accessResponse(options = {}, status = 200) {
  return new Response(accessPage(options), {
    status,
    headers: {
      "Content-Type": "text/html; charset=UTF-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}

async function storeApplication(env, submission) {
  if (!env.PARTNER_REFERRALS) return;
  const id = env.PARTNER_REFERRALS.idFromName(STORE_NAME);
  const store = env.PARTNER_REFERRALS.get(id);
  await store.createSubmission(submission);
}

async function emailApplication(env, submission) {
  if (!env.PARTNER_NOTIFICATIONS) throw new Error("Partner notification email binding is not configured");
  const text = [
    "NEW KAIZURO PARTNER REGISTRATION",
    "",
    `Reference: ${submission.id}`,
    `Business / organisation: ${submission.businessName}`,
    `Contact: ${submission.contactName}`,
    `Email: ${submission.email}`,
    `Mobile: ${submission.mobile}`,
    `Partner type: ${submission.partnerType}`,
    `Location: ${submission.location}`,
    `Website / social: ${submission.website || "—"}`,
    "",
    "About the business / KAIZURO fit:",
    submission.notes || "—",
    "",
    "APPROVAL WORKFLOW",
    "Review this application. Reply directly to this email to contact the applicant because Reply-To is set to their email address.",
    "If approved, provision their KAIZURO Partner Portal credentials and send access details by email.",
  ].join("\n");

  return env.PARTNER_NOTIFICATIONS.send({
    to: NOTIFY_TO,
    from: { email: NOTIFY_FROM, name: "KAIZURO Partner Portal" },
    replyTo: submission.email,
    subject: `KAIZURO Partner Registration · ${submission.businessName} · ${submission.id}`,
    text,
  });
}

async function submitRegistration(request, env) {
  if (!validOrigin(request)) return accessResponse({ error: "Invalid registration request. Please try again." }, 403);

  const form = await request.formData();
  if (field(form, "companyFax", 100)) {
    return accessResponse({ success: "Registration submitted." });
  }

  const submission = {
    id: applicationReference(),
    type: "application",
    partnerId: field(form, "email", 254).toLowerCase(),
    businessName: field(form, "businessName", 140),
    contactName: field(form, "contactName", 140),
    email: field(form, "email", 254).toLowerCase(),
    mobile: field(form, "mobile", 60),
    partnerType: field(form, "partnerType", 80),
    location: field(form, "location", 140),
    website: field(form, "website", 300),
    notes: field(form, "notes", 2000),
    status: "Pending review",
    createdAt: new Date().toISOString(),
  };

  if (!submission.businessName || !submission.contactName || !submission.email || !submission.mobile || !submission.partnerType || !submission.location || !submission.notes) {
    return accessResponse({ error: "Please complete all required registration fields." }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submission.email)) {
    return accessResponse({ error: "Please enter a valid email address." }, 400);
  }

  let stored = false;
  try {
    await storeApplication(env, submission);
    stored = true;
  } catch (error) {
    console.error("KAIZURO partner registration storage failed", error);
  }

  try {
    await emailApplication(env, submission);
  } catch (error) {
    console.error("KAIZURO partner registration notification failed", error);
    if (stored) {
      return accessResponse({
        error: `Your application was saved with reference ${submission.id}, but the notification email could not be sent. Please email info@kaizuro.com with this reference.`,
      }, 502);
    }
    return accessResponse({ error: "We could not submit your application. Please try again or email info@kaizuro.com." }, 502);
  }

  return accessResponse({
    success: "Partner registration submitted.",
    reference: submission.id,
  });
}

function successMarkup(reference) {
  const safeReference = esc(reference);
  return `<span class="kz-submit-success" role="status" aria-live="polite">✓ Successfully submitted <small>Reference: ${safeReference}</small></span>`;
}

function confirmationMarkup(reference, cleanHref) {
  const safeReference = esc(reference);
  const safeHref = esc(cleanHref);
  return `<div class="kz-submit-confirmation" role="dialog" aria-modal="true" aria-labelledby="kz-submit-confirmation-title">
    <div class="kz-submit-confirmation__card">
      <div class="kz-submit-confirmation__icon" aria-hidden="true">✓</div>
      <p class="kz-submit-confirmation__eyebrow">KAIZURO PARTNER PORTAL</p>
      <strong id="kz-submit-confirmation-title">Successfully submitted</strong>
      <p>Your submission has been received and saved to your partner account.</p>
      <small>Reference: ${safeReference}</small>
      <a class="kz-submit-confirmation__button" href="${safeHref}">DONE</a>
    </div>
  </div>`;
}

const successStyles = `<style>
.kz-submit-button-success{border-color:rgba(82,190,116,.78)!important;background:#163720!important;color:#effff3!important;box-shadow:0 0 0 1px rgba(82,190,116,.12) inset!important}
.kz-submit-success{display:inline-flex;align-items:center;gap:10px;min-height:50px;margin-left:12px;padding:0 18px;border:1px solid rgba(82,190,116,.62);background:rgba(82,190,116,.12);color:#dff7e6;font-size:13px;font-weight:700;vertical-align:middle}
.kz-submit-success small{color:rgba(223,247,230,.72);font-size:11px;font-weight:600;letter-spacing:.02em}
.kz-submit-confirmation{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:22px;background:rgba(0,0,0,.72);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.kz-submit-confirmation__card{display:grid;justify-items:center;width:min(460px,100%);padding:34px 30px 28px;border:1px solid rgba(82,190,116,.72);background:#0d1710;color:#f4fff6;box-shadow:0 24px 70px rgba(0,0,0,.52);text-align:center}
.kz-submit-confirmation__icon{display:grid;place-items:center;width:58px;height:58px;margin-bottom:18px;border:1px solid rgba(82,190,116,.78);border-radius:50%;background:rgba(82,190,116,.14);color:#a8efba;font-size:30px;font-weight:800}
.kz-submit-confirmation__eyebrow{margin:0 0 10px;color:rgba(223,247,230,.58);font-size:10px;font-weight:800;letter-spacing:.16em;text-transform:uppercase}
.kz-submit-confirmation__card strong{font-size:clamp(26px,6vw,38px);font-weight:600;line-height:1.05;letter-spacing:-.025em}
.kz-submit-confirmation__card p:not(.kz-submit-confirmation__eyebrow){max-width:360px;margin:14px 0 9px;color:rgba(239,255,243,.74);font-size:14px;line-height:1.55}
.kz-submit-confirmation__card small{color:rgba(239,255,243,.58);font-size:11px;font-weight:600;letter-spacing:.02em}
.kz-submit-confirmation__button{display:flex;align-items:center;justify-content:center;width:100%;min-height:56px;margin-top:24px;border:1px solid #b8f2c7;background:#b8f2c7;color:#071109;font-size:12px;font-weight:800;letter-spacing:.08em;text-decoration:none;transition:transform .18s ease,background .18s ease}
.kz-submit-confirmation__button:hover,.kz-submit-confirmation__button:focus-visible{transform:translateY(-1px);background:#d3f8dc}
@media(max-width:640px){.kz-submit-success{display:flex;width:100%;margin:10px 0 0;justify-content:center}.kz-submit-confirmation{padding:16px}.kz-submit-confirmation__card{padding:30px 22px 22px}.kz-submit-confirmation__button{min-height:58px}}
@media print{.kz-submit-success,.kz-submit-confirmation{display:none!important}}
</style>`;

function decorateSuccess(response, reference, buttonSelector, cleanHref) {
  if (!reference) return response;
  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes("text/html")) return response;

  return new HTMLRewriter()
    .on("head", {
      element(element) {
        element.append(successStyles, { html: true });
      },
    })
    .on(buttonSelector, {
      element(element) {
        element.setInnerContent("✓ Successfully submitted");
        element.setAttribute("disabled", "");
        element.setAttribute("aria-disabled", "true");
        element.setAttribute("class", `${element.getAttribute("class") || ""} kz-submit-button-success`.trim());
        element.after(successMarkup(reference), { html: true });
      },
    })
    .on("body", {
      element(element) {
        element.append(confirmationMarkup(reference, cleanHref), { html: true });
      },
    })
    .transform(response);
}

function canonicalPortalRedirect(request, url) {
  const host = url.hostname.toLowerCase();
  const isPortalHost = host === PORTAL_HOST;
  const isMainHost = host === "kaizuro.com" || host === "www.kaizuro.com";

  if (isMainHost && (url.pathname === "/partners" || url.pathname === "/partners/")) {
    return Response.redirect("https://portal.kaizuro.com/", 301);
  }

  if (isMainHost && url.pathname.startsWith("/partners/")) {
    const target = new URL(request.url);
    target.protocol = "https:";
    target.hostname = PORTAL_HOST;
    target.port = "";
    return Response.redirect(target.toString(), request.method === "GET" || request.method === "HEAD" ? 301 : 308);
  }

  if (isPortalHost && url.pathname === "/partners/login" && request.method === "GET") {
    return Response.redirect("https://portal.kaizuro.com/", 302);
  }

  return null;
}

async function portalLanding(request, env, ctx) {
  const url = new URL(request.url);
  const probeUrl = new URL("/partners", url);
  const probe = new Request(probeUrl.toString(), {
    method: "GET",
    headers: request.headers,
  });
  const existing = await app.fetch(probe, env, ctx);
  if (existing.status >= 300 && existing.status < 400) return existing;
  return accessResponse();
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();
    const isPortalHost = host === PORTAL_HOST;

    const redirect = canonicalPortalRedirect(request, url);
    if (redirect) return redirect;

    if (isPortalHost && request.method === "GET" && (url.pathname === "/" || url.pathname === "/partners" || url.pathname === "/partners/")) {
      return portalLanding(request, env, ctx);
    }

    if (isPortalHost && url.pathname === "/partners/register" && request.method === "POST") {
      return submitRegistration(request, env);
    }

    if (isPortalHost && url.pathname === "/partners/login" && request.method === "POST") {
      const response = await app.fetch(request, env, ctx);
      if (response.status === 401) {
        return accessResponse({ error: "Invalid username or password, or this partner account has not yet been approved." }, 401);
      }
      return response;
    }

    const response = await app.fetch(request, env, ctx);

    if ((url.pathname === "/partners/portal/account" || url.pathname === "/partners/portal/account/") && request.method === "GET") {
      return decorateSuccess(response, url.searchParams.get("referral") || "", '#customer-referral form button[type="submit"]', url.pathname);
    }

    if ((url.pathname === "/partners/portal/support" || url.pathname === "/partners/portal/support/") && request.method === "GET") {
      return decorateSuccess(response, url.searchParams.get("support") || "", '#support-form form button[type="submit"]', url.pathname);
    }

    return response;
  },
};
