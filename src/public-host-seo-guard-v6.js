import legacy from "./public-host-seo-guard-v5.js";
import portal from "./admin-partnership-je-v1.js";

const PORTAL_HOST = "portal.kaizuro.com";
const ROOT = "/kaizuro-admin";
const JE_PATH = "/je-wilds";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();
    const path = url.pathname.replace(/\/$/, "");

    if (host === PORTAL_HOST && (path === JE_PATH || path.startsWith(`${ROOT}/`))) {
      return portal.fetch(request, env, ctx);
    }

    return legacy.fetch(request, env, ctx);
  },
  async email(message, env, ctx) {
    if (typeof portal.email === "function") return portal.email(message, env, ctx);
    if (typeof legacy.email === "function") return legacy.email(message, env, ctx);
  },
};
