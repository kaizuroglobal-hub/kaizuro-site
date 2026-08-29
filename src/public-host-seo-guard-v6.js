import legacy from "./public-host-seo-guard-v5.js";
import portal from "./admin-partnership-je-v1.js";
import { PartnerReferrals } from "./kaizuro-admin.js";

export { PartnerReferrals };

const PORTAL_HOST = "portal.kaizuro.com";
const ROOT = "/kaizuro-admin";
const JE_PATH = "/je-wilds";

const JE_LIGHT_OVERRIDE = `<style id="kz-je-light-override">
html:has(body.je),body.je{background:#ecece8!important;color:#101113!important}
.je .kz-wrap{width:min(1180px,calc(100% - 44px))!important}
.je .kz-top{border-color:#d1d2ce!important}
.je .kz-eyebrow{color:#777!important}
.je .kz-top h1{color:#101113!important}
.je .kz-top p,.je .kz-card p{color:#6f7477!important}
.je .kz-card{background:#f8f8f5!important;border-color:#d1d2ce!important;color:#101113!important}
.je .kz-row,.je .kz-mini,.je .kz-equity div{background:#fff!important;border-color:#d1d2ce!important;color:#101113!important}
.je .kz-list,.je .kz-equity{background:#d1d2ce!important}
.je .kz-row span{color:#555!important}
.je .kz-mini .num{color:#777!important}
.je .kz-quote{background:#f5f0df!important;color:#101113!important}
.je .kz-btn{border-color:#111!important;background:#111!important;color:#fff!important}
.je .kz-btn.light{background:#fff!important;color:#111!important;border-color:#111!important}
.je .kz-footer{color:#888!important}
</style>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();
    const path = url.pathname.replace(/\/$/, "");

    if (host === PORTAL_HOST && (path === JE_PATH || path.startsWith(`${ROOT}/`))) {
      const response = await portal.fetch(request, env, ctx);
      if (path === JE_PATH && (response.headers.get("Content-Type") || "").includes("text/html")) {
        return new HTMLRewriter()
          .on("head", {
            element(el) {
              el.append(JE_LIGHT_OVERRIDE, { html: true });
            },
          })
          .transform(response);
      }
      if (path.startsWith(ROOT) && (response.headers.get("Content-Type") || "").includes("text/html")) {
        let inserted = false;
        return new HTMLRewriter()
          .on("aside a", {
            element(el) {
              const href = (el.getAttribute("href") || "").toLowerCase();
              if (href.includes("/partnership")) el.remove();
            },
          })
          .on("aside nav", {
            element(el) {
              if (!inserted) {
                inserted = true;
                el.append(`<a class="nav kz-partnership-canonical" href="${ROOT}/partnership"><span>Partnerships</span><small>JE</small></a>`, { html: true });
              }
            },
          })
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
