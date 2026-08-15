import app, { PartnerReferrals } from "./admin-support-typography-v4.js";
export { PartnerReferrals };

const HOSTS = new Set(["kaizuro.com", "www.kaizuro.com", "portal.kaizuro.com"]);
const ROOT = "/kaizuro-admin";

const BACK_ROUTES = new Map([
  [`${ROOT}/application`, { href: `${ROOT}/applications`, label: "Back to Applications" }],
  [`${ROOT}/dealer`, { href: `${ROOT}/dealers`, label: "Back to Dealers" }],
  [`${ROOT}/lead`, { href: `${ROOT}/leads`, label: "Back to Leads" }],
  [`${ROOT}/order`, { href: `${ROOT}/orders`, label: "Back to Orders" }],
  [`${ROOT}/support-thread`, { href: `${ROOT}/support`, label: "Back to Support" }],
  [`${ROOT}/production-batch`, { href: `${ROOT}/production`, label: "Back to Production" }],
  [`${ROOT}/customer`, { href: `${ROOT}/customers`, label: "Back to Customers" }],
]);

const CSS = `<style id="kz-admin-back-navigation-v4">
.kz-admin-back-wrap{margin:0 0 22px;}
.kz-admin-back{
  display:inline-flex;
  align-items:center;
  gap:8px;
  color:#4f5355;
  text-decoration:none;
  font-size:12px;
  font-weight:600;
  line-height:1.2;
  letter-spacing:.01em;
}
.kz-admin-back::before{
  content:'←';
  display:inline-block;
  color:#111;
  font-size:15px;
  font-weight:400;
  line-height:1;
  transform:translateY(-1px);
}
.kz-admin-back:hover{color:#111;}
.kz-admin-back span{border-bottom:1px solid transparent;padding-bottom:2px;}
.kz-admin-back:hover span{border-bottom-color:#111;}
@media(max-width:700px){
  .kz-admin-back-wrap{margin-bottom:18px;}
  .kz-admin-back{font-size:12px;}
}
</style>`;

export default {
  async fetch(request, env, ctx) {
    const response = await app.fetch(request, env, ctx);
    const url = new URL(request.url);
    if (!HOSTS.has(url.hostname.toLowerCase())) return response;
    if (request.method !== "GET") return response;

    const route = BACK_ROUTES.get(url.pathname.replace(/\/$/, ""));
    if (!route) return response;
    if (response.status !== 200 || !(response.headers.get("Content-Type") || "").includes("text/html")) return response;

    const control = `<div class="kz-admin-back-wrap"><a class="kz-admin-back" href="${route.href}"><span>${route.label}</span></a></div>`;
    return new HTMLRewriter()
      .on("head", { element(el) { el.append(CSS, { html: true }); } })
      .on(".content", { element(el) { el.prepend(control, { html: true }); } })
      .transform(response);
  }
};
