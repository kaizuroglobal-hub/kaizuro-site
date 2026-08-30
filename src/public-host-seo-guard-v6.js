import legacy from "./public-host-seo-guard-v5.js";
import portal from "./admin-partnership-je-v1.js";
import { PartnerReferrals } from "./kaizuro-admin.js";

export { PartnerReferrals };

const PORTAL_HOST = "portal.kaizuro.com";
const ROOT = "/kaizuro-admin";
const JE_PATH = "/je-wilds";
const ADMIN_HIDE_PARTNERSHIPS = `<style id="kz-admin-hide-partnerships">aside nav a[href*="/partnership"]~a[href*="/partnership"]{display:none!important}</style>`;

const JE_LIGHT_OVERRIDE = `<style id="kz-je-light-override">
html:has(body.je),body.je{background:#ecece8!important;color:#101113!important}
.je .kz-wrap{width:min(1180px,calc(100% - 64px))!important;margin:0 auto!important;padding:0!important}
.je .kz-top{padding:64px 0 34px!important;margin:0 0 18px!important;border-color:#d1d2ce!important}
.je .kz-eyebrow{color:#777!important}
.je .kz-top h1{color:#101113!important;font-size:clamp(56px,7vw,88px)!important;line-height:.94!important;letter-spacing:-.05em!important;margin:0!important}
.je .kz-top p,.je .kz-card p{color:#6f7477!important}
.je .kz-top>div>p:not(.kz-eyebrow){max-width:720px!important;margin-top:18px!important;font-size:13px!important;line-height:1.7!important}
.je .kz-actions{display:flex!important;gap:9px!important;flex-wrap:wrap!important;margin-top:24px!important}
.je .kz-btn{border-color:#111!important;background:#111!important;color:#fff!important}
.je .kz-btn.light{background:#fff!important;color:#111!important;border-color:#111!important}
.je .kz-grid{gap:18px!important;margin:18px 0!important}
.je .kz-card{background:#f8f8f5!important;border-color:#d1d2ce!important;color:#101113!important;padding:24px!important}
.je .kz-card h2{margin:0 0 10px!important;color:#101113!important;font-size:23px!important;font-weight:500!important;line-height:1.15!important}
.je .kz-row,.je .kz-mini,.je .kz-equity div{background:#fff!important;border-color:#d1d2ce!important;color:#101113!important}
.je .kz-list,.je .kz-equity{background:#d1d2ce!important}
.je .kz-row{padding:14px!important}
.je .kz-row span{color:#555!important}
.je .kz-mini .num{color:#777!important}
.je .kz-quote{background:#f5f0df!important;color:#101113!important;border-left-color:#d8b65b!important}
.je .kz-card .kz-eyebrow{color:#777!important}
.je .kz-card .kz-eyebrow:first-child{margin-bottom:10px!important}
.je .kz-hero{background:#111!important;color:#fff!important;padding:28px!important;margin-top:18px!important}
.je .kz-hero .kz-eyebrow{color:#d8b65b!important}
.je .kz-hero h2{color:#fff!important}
.je .kz-hero p{color:#c5c8ca!important}
.je .kz-footer{color:#888!important}
@media(max-width:900px){.je .kz-wrap{width:min(100% - 36px,720px)!important}.je .kz-top{padding-top:42px!important}.je .kz-grid{grid-template-columns:1fr!important}.je .kz-cols,.je .kz-equity{grid-template-columns:1fr 1fr!important}}
@media(max-width:600px){.je .kz-wrap{width:calc(100% - 28px)!important}.je .kz-top h1{font-size:clamp(46px,15vw,68px)!important}.je .kz-top{padding-top:30px!important}.je .kz-cols,.je .kz-equity{grid-template-columns:1fr!important}.je .kz-card{padding:20px!important}.je .kz-row{grid-template-columns:1fr!important;gap:7px!important}}
</style>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();
    const path = url.pathname.replace(/\/$/, "");

    if (host === PORTAL_HOST && (path === JE_PATH || path.startsWith(`${ROOT}/`))) {
      const response = await portal.fetch(request, env, ctx);
      if ((response.headers.get("Content-Type") || "").includes("text/html")) {
        let partnershipSeen = false;
        const rw = new HTMLRewriter()
          .on("head", {
            element(el) {
              if (path === JE_PATH || path.endsWith("/je-wilds")) el.append(JE_LIGHT_OVERRIDE, { html: true });
              if (path.startsWith(ROOT)) el.append(ADMIN_HIDE_PARTNERSHIPS, { html: true });
            },
          })
          .on('aside nav a[href*="/partnership"]', {
            element(el) {
              if (partnershipSeen) el.remove();
              else partnershipSeen = true;
            },
          });
        return rw.transform(response);
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
