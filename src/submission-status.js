import app from "./notify.js";
export { PartnerReferrals } from "./notify.js";

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
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
  const isPortalHost = host === "portal.kaizuro.com";
  const isMainHost = host === "kaizuro.com" || host === "www.kaizuro.com";

  if (isPortalHost && (url.pathname === "/" || url.pathname === "")) {
    const target = new URL("/partners", url);
    return Response.redirect(target.toString(), 302);
  }

  if (isMainHost && url.pathname.startsWith("/partners/portal")) {
    const target = new URL(request.url);
    target.protocol = "https:";
    target.hostname = "portal.kaizuro.com";
    target.port = "";
    return Response.redirect(target.toString(), 301);
  }

  return null;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const redirect = canonicalPortalRedirect(request, url);
    if (redirect) return redirect;

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
