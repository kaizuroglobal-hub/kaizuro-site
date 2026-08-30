import legacy from "./public-host-seo-guard-v5.js";
import portal from "./admin-partnership-je-v1.js";
import { PartnerReferrals } from "./kaizuro-admin.js";

export { PartnerReferrals };

const PORTAL_HOST = "portal.kaizuro.com";
const ROOT = "/kaizuro-admin";
const JE_PATH = "/je-wilds";
const JE_ACCESS = "KZJE-2026-7F3K9P";

const PARTNERSHIP_NAV = `<a class="nav" href="${ROOT}/partnerships"><span>Partnerships</span><small>Strategic</small></a>`;

const JE_LIGHT_OVERRIDE = `<style id="kz-je-light-override">
html,body{background:#ecece8!important;color:#101113!important}
body{margin:0!important}
body>.hero{width:min(1180px,calc(100% - 64px))!important;margin:0 auto!important;padding:70px 0 30px!important;border-bottom:1px solid #d1d2ce!important;box-sizing:border-box!important}
body>.hero>div{max-width:1180px!important;margin:0 auto!important}
body>.hero h1{margin:0!important;color:#101113!important;font-size:clamp(56px,7vw,92px)!important;font-weight:300!important;line-height:.96!important;letter-spacing:-.05em!important}
body>.hero p{color:#6f7477!important;max-width:800px!important;font-size:13px!important;line-height:1.7!important}
body>.hero p.eyebrow,.kz-eyebrow{color:#777!important;font-size:9px!important;font-weight:800!important;letter-spacing:.15em!important;text-transform:uppercase!important}
body>.hero .kz-actions{display:flex!important;gap:9px!important;flex-wrap:wrap!important;margin-top:22px!important}
body>.hero .kz-btn{min-height:40px!important;padding:0 14px!important;border:1px solid #111!important;background:#111!important;color:#fff!important;text-decoration:none!important}
body>.hero .kz-btn.light{background:#fff!important;color:#111!important}
.kz-private{width:min(1180px,calc(100% - 64px))!important;margin:0 auto!important;padding:0 0 70px!important;box-sizing:border-box!important}
.kz-private .kz-section{margin-top:18px!important}
.kz-private .kz-grid{gap:18px!important;margin-top:18px!important}
.kz-private .kz-card{background:#f8f8f5!important;border-color:#d1d2ce!important;color:#101113!important;padding:24px!important}
.kz-private .kz-card h2{margin:0 0 10px!important;color:#101113!important;font-size:23px!important;font-weight:500!important;line-height:1.15!important;letter-spacing:-.025em!important}
.kz-private .kz-card p{color:#6f7477!important;line-height:1.65!important}
.kz-private .kz-list{background:#d1d2ce!important}
.kz-private .kz-row{background:#fff!important;border-color:#d1d2ce!important;color:#101113!important;padding:14px!important}
.kz-private .kz-row span{color:#555!important}
.kz-private .kz-table{width:100%!important;border-collapse:collapse!important;background:#fff!important;margin-top:16px!important}
.kz-private .kz-table th,.kz-private .kz-table td{padding:12px!important;border-bottom:1px solid #ddd!important;text-align:left!important;font-size:12px!important}
.kz-private .kz-table th{font-size:9px!important;color:#777!important;text-transform:uppercase!important;letter-spacing:.08em!important}
.kz-private .kz-quote{background:#f5f0df!important;color:#20211f!important;border-left-color:#d8b65b!important;padding:20px!important;margin-top:18px!important}
.kz-private .kz-eyebrow{color:#777!important}
.kz-private .kz-equity{background:#d1d2ce!important}
.kz-private .kz-equity div{background:#fff!important;border-color:#d1d2ce!important}
.kz-private .kz-footer{color:#888!important}
@media(max-width:900px){body>.hero,.kz-private{width:min(100% - 36px,720px)!important}.kz-private .kz-grid{grid-template-columns:1fr!important}.kz-private .kz-equity{grid-template-columns:1fr 1fr!important}}
@media(max-width:600px){body>.hero,.kz-private{width:calc(100% - 28px)!important}.kz-private .kz-equity{grid-template-columns:1fr!important}body>.hero{padding-top:42px!important}.kz-private .kz-card{padding:20px!important}.kz-private .kz-row{grid-template-columns:1fr!important;gap:7px!important}}
</style>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();
    const path = url.pathname.replace(/\/$/, "");

    if (host === PORTAL_HOST && (path === `${ROOT}/partnerships` || path === `${ROOT}/partnerships/je-wilds`)) {
      return Response.redirect(`${JE_PATH}?access=${JE_ACCESS}`, 302);
    }

    if (host === PORTAL_HOST && path === JE_PATH) {
      const response = await portal.fetch(request, env, ctx);
      if ((response.headers.get("Content-Type") || "").includes("text/html")) {
        return new HTMLRewriter()
          .on("head", { element(el) { el.append(JE_LIGHT_OVERRIDE, { html: true }); } })
          .transform(response);
      }
      return response;
    }

    if (host === PORTAL_HOST && path.startsWith(`${ROOT}/`)) {
      const response = await portal.fetch(request, env, ctx);
      if ((response.headers.get("Content-Type") || "").includes("text/html")) {
        return new HTMLRewriter()
          .on("aside nav", { element(el) { el.append(PARTNERSHIP_NAV, { html: true }); } })
          .transform(response);
      }
      return response;
    }

    return legacy.fetch(request, env, ctx);
  },
  async email(message, env, ctx) {
    if (typeof portal.email === "function") return portal.email(message, env, ctx);
    if (typeof legacy.email === "function") return legacy.email(message, env, ctx);
  },
};
