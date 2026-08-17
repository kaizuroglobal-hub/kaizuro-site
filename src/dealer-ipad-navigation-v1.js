import app,{PartnerReferrals}from"./dealer-portal-v1-fixed.js";
export{PartnerReferrals};

const HOST="portal.kaizuro.com";
const ROOT="/partners/portal";

const CSS=`<style id="kz-dealer-ipad-nav-v1">
/* iPad keeps the full dealer sidebar, with desktop visuals and touch-safe targets. */
@media (min-width:701px) and (max-width:1180px){
  .layout{grid-template-columns:250px minmax(0,1fr)!important}
  aside{position:sticky!important;top:0!important;height:100svh!important;padding:24px 22px 18px!important;display:flex!important;flex-direction:column!important}
  aside .brand{display:block!important;font-size:20px!important;font-weight:600!important;letter-spacing:.17em!important}
  aside .brand:after{display:none!important;content:none!important}
  aside .label{display:block!important;margin-top:7px!important;color:#777!important;font-size:9px!important;font-weight:700!important;letter-spacing:.17em!important}
  aside nav{display:grid!important;gap:5px!important;margin-top:30px!important;overflow-y:auto!important;min-height:0!important;overscroll-behavior:contain!important;scrollbar-width:thin!important;padding:2px 0 8px!important}
  aside nav .nav,aside nav .nav:link,aside nav .nav:visited,aside nav .nav:hover,aside nav .nav:focus,aside nav .nav:focus-visible,aside nav .nav:active{
    position:relative!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;min-height:48px!important;padding:0 12px!important;border:0!important;color:#999!important;background:transparent!important;background-color:transparent!important;background-image:none!important;box-shadow:none!important;outline:none!important;text-decoration:none!important;font-size:12px!important;font-weight:400!important;line-height:1.2!important;-webkit-tap-highlight-color:transparent!important;touch-action:manipulation!important
  }
  aside nav .nav:before{display:none!important;content:none!important}
  aside nav .nav span{display:inline-block!important;position:relative!important;white-space:nowrap!important;overflow:visible!important;text-overflow:clip!important}
  aside nav .nav.active,aside nav .nav.active:link,aside nav .nav.active:visited,aside nav .nav.active:hover,aside nav .nav.active:focus,aside nav .nav.active:focus-visible,aside nav .nav.active:active{color:#fff!important;background:transparent!important;background-color:transparent!important;background-image:none!important;border:0!important;box-shadow:none!important}
  aside nav .nav.active span:after{content:""!important;position:absolute!important;left:0!important;right:0!important;bottom:-7px!important;height:2px!important;background:#fff!important;pointer-events:none!important}
  aside .side{display:block!important;margin-top:auto!important;padding-top:14px!important;border-top:1px solid #26282a!important}
  aside .side b{display:block!important;font-size:11px!important}
  aside .side small{display:block!important;margin-top:5px!important;color:#777!important;font-size:9px!important}
  aside .side a{display:inline-block!important;margin-top:10px!important;color:#777!important;font-size:10px!important;text-decoration:none!important;min-height:44px!important;padding-top:12px!important}
  .grid{grid-template-columns:1fr!important}
  .metrics{grid-template-columns:1fr 1fr!important}
  .content{width:calc(100% - 48px)!important;padding-top:36px!important}
  .top{padding:0 28px!important}
  .btn,.form input,.form select{min-height:46px!important}
  .form textarea{min-height:110px!important}
}
@media (min-width:701px) and (max-height:900px){
  aside{padding-top:18px!important;padding-bottom:12px!important}
  aside nav{margin-top:20px!important;gap:4px!important}
  aside nav .nav{min-height:46px!important}
  aside .side{padding-top:9px!important}
}
</style>`;

export default{
  async fetch(request,env,ctx){
    const url=new URL(request.url);
    const response=await app.fetch(request,env,ctx);
    if(request.method!=="GET"||url.hostname.toLowerCase()!==HOST||!url.pathname.startsWith(ROOT))return response;
    const ct=response.headers.get("Content-Type")||"";
    if(response.status!==200||!ct.includes("text/html"))return response;
    return new HTMLRewriter().on("head",{element(e){e.append(CSS,{html:true})}}).transform(response);
  },
  async email(message,env,ctx){if(typeof app.email==="function")return app.email(message,env,ctx)}
};
