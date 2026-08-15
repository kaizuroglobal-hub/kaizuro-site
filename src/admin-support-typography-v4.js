import app, { PartnerReferrals } from "./admin-support-v4.js";
export { PartnerReferrals };

const ROOT = "/kaizuro-admin/support";
const HOSTS = new Set(["kaizuro.com", "www.kaizuro.com", "portal.kaizuro.com"]);

const CSS = `<style id="kz-admin-support-typography-v4">
/* Support V4 readability pass */
.hero > div > p:not(.eyebrow){font-size:14px!important;line-height:1.65!important;max-width:660px!important;}

.kz-sup-metrics>div{padding:18px 20px!important;min-height:104px!important;}
.kz-sup-metrics small{font-size:11px!important;line-height:1.3!important;letter-spacing:.04em!important;}
.kz-sup-metrics strong{margin-top:15px!important;font-size:30px!important;line-height:1!important;}

.kz-sup-search{padding:16px!important;gap:8px!important;}
.kz-sup-search input{min-height:44px!important;padding:10px 11px!important;font-size:13px!important;}
.kz-sup-search .btn{min-height:44px!important;font-size:11px!important;padding:0 15px!important;}

.kz-sup-tabs{padding:12px 16px!important;gap:7px!important;}
.kz-sup-tab{padding:8px 10px!important;font-size:11px!important;line-height:1.2!important;}
.kz-sup-tab small{font-size:10px!important;}

.kz-sup-ticket{padding:17px 16px!important;}
.kz-sup-ticket:hover{background:#ecece7!important;}
.kz-sup-ticket.active{background:#e7e7e1!important;box-shadow:inset 4px 0 0 #111!important;}
.kz-sup-ticket-top b{font-size:13px!important;line-height:1.3!important;}
.kz-sup-ticket-top span{font-size:10px!important;line-height:1.3!important;}
.kz-sup-type{margin-top:6px!important;font-size:10px!important;line-height:1.4!important;}
.kz-sup-ticket p{margin:9px 0!important;font-size:12px!important;line-height:1.55!important;color:#444!important;}
.kz-sup-ticket>small{font-size:10px!important;line-height:1.35!important;}

.kz-sup-head{padding:25px 26px!important;}
.kz-sup-head>div>small{font-size:10px!important;letter-spacing:.06em!important;}
.kz-sup-head h2{margin:7px 0 5px!important;font-size:24px!important;line-height:1.15!important;}
.kz-sup-head p{font-size:14px!important;line-height:1.4!important;}
.kz-sup-contact{gap:5px!important;}
.kz-sup-contact b{font-size:13px!important;line-height:1.3!important;}
.kz-sup-contact span,.kz-sup-contact a{font-size:11px!important;line-height:1.4!important;}
.kz-sup-contact .btn{font-size:10px!important;min-height:36px!important;}

.kz-sup-meta{gap:24px!important;padding:14px 26px!important;}
.kz-sup-meta span{font-size:11px!important;line-height:1.4!important;}
.kz-sup-meta b{font-size:11px!important;}

.kz-sup-thread{padding:26px!important;gap:18px!important;max-width:1040px!important;}
.kz-sup-message header{padding:14px 17px!important;}
.kz-sup-message header b{font-size:12px!important;line-height:1.3!important;}
.kz-sup-message header small{margin-top:4px!important;font-size:10px!important;line-height:1.4!important;}
.kz-sup-message header>span{font-size:10px!important;line-height:1.3!important;}
.kz-sup-body{padding:18px!important;font-size:15px!important;line-height:1.6!important;}
.kz-sup-message footer{padding:11px 17px!important;font-size:10px!important;line-height:1.45!important;}

.kz-sup-compose{grid-template-columns:minmax(0,1fr) 270px!important;gap:16px!important;padding:25px 26px!important;}
.kz-sup-compose form{gap:10px!important;}
.kz-sup-compose label{gap:8px!important;font-size:12px!important;line-height:1.3!important;}
.kz-sup-compose textarea{min-height:170px!important;padding:14px!important;font-size:14px!important;line-height:1.55!important;}
.kz-sup-compose textarea::placeholder{font-size:14px!important;color:#777!important;}
.kz-sup-status-form select{min-height:48px!important;padding:10px!important;font-size:13px!important;}
.kz-sup-compose .btn{min-height:44px!important;font-size:11px!important;letter-spacing:.04em!important;}

.kz-sup-empty{font-size:12px!important;line-height:1.55!important;}

@media(max-width:1000px){
  .kz-sup-compose{grid-template-columns:1fr!important;}
}
@media(max-width:700px){
  .hero > div > p:not(.eyebrow){font-size:13px!important;}
  .kz-sup-body{font-size:14px!important;}
  .kz-sup-thread{padding:18px!important;}
  .kz-sup-head,.kz-sup-compose{padding:20px!important;}
}
</style>`;

export default {
  async fetch(request, env, ctx) {
    const response = await app.fetch(request, env, ctx);
    const url = new URL(request.url);
    if (!HOSTS.has(url.hostname.toLowerCase())) return response;
    if (request.method !== "GET" || url.pathname.replace(/\/$/, "") !== ROOT) return response;
    if (response.status !== 200 || !(response.headers.get("Content-Type") || "").includes("text/html")) return response;
    return new HTMLRewriter()
      .on("head", { element(el) { el.append(CSS, { html: true }); } })
      .transform(response);
  }
};
