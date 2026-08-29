import legacy from "./public-host-seo-guard-v5.js";
import portal from "./admin-partnership-je-v1.js";
import { PartnerReferrals } from "./kaizuro-admin.js";

export { PartnerReferrals };

const PORTAL_HOST = "portal.kaizuro.com";
const ROOT = "/kaizuro-admin";
const JE_PATH = "/je-wilds";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();
    const path = url.pathname.replace(/\/$/, "");

    if (host === PORTAL_HOST && (path === JE_PATH || path.startsWith(`${ROOT}/`))) {
      const response = await portal.fetch(request, env, ctx);
      if (path.startsWith(ROOT) && (response.headers.get("Content-Type") || "").includes("text/html")) {
        return new HTMLRewriter()
          .on("aside nav a", {
            element(el) {
              const href = el.getAttribute("href") || "";
              if (href === `${ROOT}/partnership` || href === `${ROOT}/partnerships`) el.remove();
            },
          })
          .on("aside nav", {
            element(el) {
              el.append(`<a class="nav kz-partnership-canonical" href="${ROOT}/partnerships"><span>Partnerships</span><small>JE</small></a>`, { html: true });
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
