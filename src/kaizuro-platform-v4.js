import app, { PartnerReferrals } from "./admin-sidebar-fix.js";
export { PartnerReferrals };

const VERSION = "V4";
const ADMIN_ROOT = "/kaizuro-admin";
const DEALER_ROOT = "/partners/portal";
const HOSTS = new Set(["kaizuro.com", "www.kaizuro.com", "portal.kaizuro.com"]);

function isPortalPath(pathname) {
  return pathname === ADMIN_ROOT || pathname.startsWith(`${ADMIN_ROOT}/`) || pathname === DEALER_ROOT || pathname.startsWith(`${DEALER_ROOT}/`);
}

export default {
  async fetch(request, env, ctx) {
    // V4 is intentionally a transparent platform boundary. Route handling,
    // redirects, HTML rewriting, forms and authentication remain owned by
    // the proven Admin + Dealer Portal stack below this layer.
    const response = await app.fetch(request, env, ctx);
    const url = new URL(request.url);
    if (!HOSTS.has(url.hostname.toLowerCase()) || !isPortalPath(url.pathname)) return response;

    const headers = new Headers(response.headers);
    headers.set("X-KAIZURO-Platform-Version", VERSION);
    if (url.pathname === ADMIN_ROOT || url.pathname.startsWith(`${ADMIN_ROOT}/`)) {
      headers.set("X-KAIZURO-Admin-Version", VERSION);
    }
    if (url.pathname === DEALER_ROOT || url.pathname.startsWith(`${DEALER_ROOT}/`)) {
      headers.set("X-KAIZURO-Dealer-Portal-Version", VERSION);
    }

    // Preserve the original body, status, redirects, cookies and content exactly.
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};
