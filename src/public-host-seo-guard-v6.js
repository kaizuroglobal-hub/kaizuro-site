import legacy from "./public-host-seo-guard-v5.js";
import baseAdmin, { PartnerReferrals } from "./kaizuro-admin.js";
import partnerships from "./admin-partnership-shell-v1.js";
import jeViewer from "./je-admin-viewer.js";

export { PartnerReferrals };

const PORTAL_HOST = "portal.kaizuro.com";
const ROOT = "/kaizuro-admin";
const JE_ADMIN_ROOT = "/kaizuro-admin-je";
const JE_PATH = "/je-wilds";

function redirect(request, path) {
  return Response.redirect(new URL(path, request.url).toString(), 302);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();
    const path = url.pathname.replace(/\/$/, "") || "/";

    // portal.kaizuro.com is the dedicated admin portal. Keep the entry URL simple.
    if (host === PORTAL_HOST && (path === "/" || path === "/admin" || path === "/admin/login")) {
      return redirect(request, `${ROOT}/login`);
    }

    // JE WILDS has a completely separate read-only session and route.
    if (host === PORTAL_HOST && (path === JE_ADMIN_ROOT || path.startsWith(`${JE_ADMIN_ROOT}/`))) {
      return jeViewer.fetch(request, env, ctx);
    }

    // Strategic Partnerships remains isolated from the real admin authentication.
    if (host === PORTAL_HOST && (path === `${ROOT}/partnerships` || path.startsWith(`${ROOT}/partnerships/`))) {
      return partnerships.fetch(request, env, ctx);
    }

    // IMPORTANT: send every other /kaizuro-admin request directly to the real admin app.
    // No HTML rewriting or intermediary wrapper is used here.
    if (host === PORTAL_HOST && (path === ROOT || path.startsWith(`${ROOT}/`))) {
      return baseAdmin.fetch(request, env, ctx);
    }

    // Private JE WILDS presentation page.
    if (host === PORTAL_HOST && path === JE_PATH) {
      return partnerships.fetch(request, env, ctx);
    }

    return legacy.fetch(request, env, ctx);
  },

  async email(message, env, ctx) {
    if (typeof baseAdmin.email === "function") return baseAdmin.email(message, env, ctx);
    if (typeof partnerships.email === "function") return partnerships.email(message, env, ctx);
    if (typeof legacy.email === "function") return legacy.email(message, env, ctx);
  },
};
