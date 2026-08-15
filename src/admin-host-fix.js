import app from "./kaizuro-admin.js";
export { PartnerReferrals } from "./kaizuro-admin.js";

const ADMIN_PREFIX = "/kaizuro-admin";
const PUBLIC_HOSTS = new Set(["kaizuro.com", "www.kaizuro.com"]);
const INTERNAL_ADMIN_HOST = "portal.kaizuro.com";

function rewriteLocation(response, request) {
  const location = response.headers.get("Location");
  if (!location) return response;
  const source = new URL(location, request.url);
  if (source.hostname !== INTERNAL_ADMIN_HOST) return response;
  const targetBase = new URL(request.url);
  source.protocol = targetBase.protocol;
  source.hostname = targetBase.hostname;
  source.port = targetBase.port;
  const headers = new Headers(response.headers);
  headers.set("Location", source.toString());
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const isAdminPath = url.pathname === ADMIN_PREFIX || url.pathname.startsWith(`${ADMIN_PREFIX}/`);
    if (!PUBLIC_HOSTS.has(url.hostname.toLowerCase()) || !isAdminPath) {
      return app.fetch(request, env, ctx);
    }

    const internalUrl = new URL(request.url);
    internalUrl.hostname = INTERNAL_ADMIN_HOST;
    const internalRequest = new Request(internalUrl.toString(), request);
    const response = await app.fetch(internalRequest, env, ctx);
    return rewriteLocation(response, request);
  },
};
