import legacy from "./public-host-seo-guard-v5.js";
import baseAdmin, { PartnerReferrals } from "./kaizuro-admin.js";
import partnerships from "./admin-partnership-shell-v1.js";
import jeViewer from "./je-admin-viewer.js";

export { PartnerReferrals };

const PORTAL_HOST = "portal.kaizuro.com";
const ROOT = "/kaizuro-admin";
const JE_ADMIN_ROOT = "/kaizuro-admin-je";
const JE_PATH = "/je-wilds";

const PARTNERSHIP_NAV = `<a class="nav" href="${ROOT}/partnerships"><span>Partnerships</span><small>Strategic</small></a>`;

function transformAdmin(response) {
  const type = response.headers.get("Content-Type") || "";
  if (response.status !== 200 || !type.includes("text/html")) return response;
  return new HTMLRewriter()
    .on("aside nav", {
      element(el) {
        el.append(PARTNERSHIP_NAV, { html: true });
      },
    })
    .transform(response);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();
    const path = url.pathname.replace(/\/$/, "");

    // JE WILDS read-only account is isolated from the real admin account.
    if (host === PORTAL_HOST && (path === JE_ADMIN_ROOT || path.startsWith(`${JE_ADMIN_ROOT}/`))) {
      return jeViewer.fetch(request, env, ctx);
    }

    // Preserve the real KAIZURO Admin authentication and dashboard exactly as built.
    if (host === PORTAL_HOST && (path === ROOT || path.startsWith(`${ROOT}/`))) {
      if (path === `${ROOT}/partnerships` || path.startsWith(`${ROOT}/partnerships/`)) {
        return partnerships.fetch(request, env, ctx);
      }
      return transformAdmin(await baseAdmin.fetch(request, env, ctx));
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
