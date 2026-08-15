import app, { PartnerReferrals } from "./admin-ops-v5.js";
export { PartnerReferrals };

const ADMIN_ROOT = "/kaizuro-admin";
const HOSTS = new Set(["kaizuro.com", "www.kaizuro.com", "portal.kaizuro.com"]);
const SIDEBAR_CSS = `<style id="kz-admin-sidebar-compact-fix">
aside{overflow:hidden!important;}
aside nav{margin-top:24px!important;gap:2px!important;overflow-y:auto!important;overflow-x:hidden!important;min-height:0!important;flex:1 1 auto!important;padding-right:4px!important;scrollbar-width:thin!important;}
aside nav .nav{min-height:26px!important;height:26px!important;padding-top:0!important;padding-bottom:0!important;margin:0!important;line-height:1.1!important;}
aside .side{flex:0 0 auto!important;margin-top:10px!important;padding-top:10px!important;}
@media(max-height:900px) and (min-width:701px){aside{padding-top:20px!important;padding-bottom:16px!important;}aside nav{margin-top:18px!important;}aside nav .nav{min-height:25px!important;height:25px!important;}}
</style>`;

export default {
  async fetch(request, env, ctx) {
    const response = await app.fetch(request, env, ctx);
    const url = new URL(request.url);
    if (!HOSTS.has(url.hostname.toLowerCase()) || !url.pathname.startsWith(ADMIN_ROOT)) return response;
    const type = response.headers.get("Content-Type") || "";
    if (request.method !== "GET" || response.status !== 200 || !type.includes("text/html")) return response;
    return new HTMLRewriter()
      .on("head", { element(el) { el.append(SIDEBAR_CSS, { html: true }); } })
      .transform(response);
  }
};
