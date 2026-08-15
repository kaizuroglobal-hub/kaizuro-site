import app, { PartnerReferrals } from "./admin-ops-v5.js";
export { PartnerReferrals };

const ADMIN_ROOT = "/kaizuro-admin";
const HOSTS = new Set(["kaizuro.com", "www.kaizuro.com", "portal.kaizuro.com"]);
const SIDEBAR_CSS = `<style id="kz-admin-sidebar-compact-fix">
aside{overflow:hidden!important;}
aside nav{
  display:grid!important;
  grid-auto-flow:row!important;
  grid-auto-rows:25px!important;
  align-content:start!important;
  row-gap:0!important;
  column-gap:0!important;
  margin-top:18px!important;
  overflow-y:auto!important;
  overflow-x:hidden!important;
  min-height:0!important;
  flex:1 1 auto!important;
  padding-right:4px!important;
  scrollbar-width:thin!important;
}
aside nav > a.nav,
aside nav .nav{
  min-height:25px!important;
  height:25px!important;
  max-height:25px!important;
  box-sizing:border-box!important;
  padding:0 12px!important;
  margin:0!important;
  line-height:25px!important;
  align-items:center!important;
}
aside nav .nav span,
aside nav .nav small{line-height:1!important;margin:0!important;}
aside .side{flex:0 0 auto!important;margin-top:8px!important;padding-top:8px!important;}
@media(max-height:900px) and (min-width:701px){
  aside{padding-top:18px!important;padding-bottom:14px!important;}
  aside nav{margin-top:14px!important;grid-auto-rows:24px!important;}
  aside nav > a.nav,aside nav .nav{min-height:24px!important;height:24px!important;max-height:24px!important;line-height:24px!important;}
}
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
