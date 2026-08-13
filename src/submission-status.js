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
  return `<span class="kz-submit-success" role="status" aria-live="polite">✓ Submitted successfully <small>${safeReference}</small></span>`;
}

function toastMarkup(reference) {
  const safeReference = esc(reference);
  return `<div class="kz-submit-toast" role="status" aria-live="polite"><strong>✓ Submitted successfully</strong><span>Reference: ${safeReference}</span></div>`;
}

const successStyles = `<style>
.kz-submit-success{display:inline-flex;align-items:center;gap:10px;min-height:50px;margin-left:12px;padding:0 18px;border:1px solid rgba(82,190,116,.62);background:rgba(82,190,116,.12);color:#dff7e6;font-size:13px;font-weight:700;vertical-align:middle}
.kz-submit-success small{color:rgba(223,247,230,.72);font-size:11px;font-weight:600;letter-spacing:.02em}
.kz-submit-toast{position:fixed;right:24px;bottom:24px;z-index:9999;display:grid;gap:5px;max-width:min(380px,calc(100vw - 32px));padding:16px 18px;border:1px solid rgba(82,190,116,.7);background:#102417;color:#effff3;box-shadow:0 16px 40px rgba(0,0,0,.28);font-size:13px;line-height:1.4}
.kz-submit-toast strong{font-size:14px}.kz-submit-toast span{color:rgba(239,255,243,.72);font-size:11px}
@media(max-width:640px){.kz-submit-success{display:flex;width:100%;margin:10px 0 0;justify-content:center}.kz-submit-toast{right:16px;bottom:16px;left:16px;max-width:none}}
@media print{.kz-submit-success,.kz-submit-toast{display:none!important}}
</style>`;

function decorateSuccess(response, reference, buttonSelector) {
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
        element.after(successMarkup(reference), { html: true });
      },
    })
    .on("body", {
      element(element) {
        element.append(toastMarkup(reference), { html: true });
      },
    })
    .transform(response);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const response = await app.fetch(request, env, ctx);

    if ((url.pathname === "/partners/portal/account" || url.pathname === "/partners/portal/account/") && request.method === "GET") {
      return decorateSuccess(response, url.searchParams.get("referral") || "", '#customer-referral form button[type="submit"]');
    }

    if ((url.pathname === "/partners/portal/support" || url.pathname === "/partners/portal/support/") && request.method === "GET") {
      return decorateSuccess(response, url.searchParams.get("support") || "", '#support-form form button[type="submit"]');
    }

    return response;
  },
};
