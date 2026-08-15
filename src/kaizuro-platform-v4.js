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
    const response = await app.fetch(request, env, ctx);
    const url = new URL(request.url);
    if (!HOSTS.has(url.hostname.toLowerCase()) || !isPortalPath(url.pathname)) return response;

    const headers = new Headers(response.headers);
    headers.set("X-KAIZURO-Platform-Version", VERSION);
    headers.set("X-KAIZURO-Admin-Version", VERSION);
    headers.set("X-KAIZURO-Dealer-Portal-Version", VERSION);
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");

    const contentType = headers.get("Content-Type") || "";
    if (request.method === "GET" && response.status === 200 && contentType.includes("text/html")) {
      return new HTMLRewriter()
        .on("head", {
          element(el) {
            el.append(`<meta name="kaizuro-platform-version" content="${VERSION}">`, { html: true });
          }
        })
        .transform(new Response(response.body, { status: response.status, statusText: response.statusText, headers }));
    }

    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }
};
