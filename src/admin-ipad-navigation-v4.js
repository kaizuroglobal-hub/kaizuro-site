import app,{PartnerReferrals}from"./dealer-portal-v1-fixed.js";
export{PartnerReferrals};

const ROOT="/kaizuro-admin";
const HOST="portal.kaizuro.com";

function sectionFor(path){
  const p=path.replace(/\/$/,"");
  if(p===ROOT)return"overview";
  if([`${ROOT}/dealer`,`${ROOT}/dealers`,`${ROOT}/application`,`${ROOT}/applications`,`${ROOT}/lead`,`${ROOT}/leads`,`${ROOT}/allocation`,`${ROOT}/territories`,`${ROOT}/academy`,`${ROOT}/health`].some(x=>p===x||p.startsWith(`${x}/`)))return"dealers";
  if(p===`${ROOT}/customer`||p===`${ROOT}/customers`||p.startsWith(`${ROOT}/customer/`)||p.startsWith(`${ROOT}/customers/`))return"customers";
  if(p===`${ROOT}/order`||p===`${ROOT}/orders`||p.startsWith(`${ROOT}/order/`)||p.startsWith(`${ROOT}/orders/`))return"orders";
  if(p===`${ROOT}/inventory`||p===`${ROOT}/products`||p.startsWith(`${ROOT}/inventory/`)||p.startsWith(`${ROOT}/products/`))return"inventory";
  if(p===`${ROOT}/production`||p===`${ROOT}/supplier-production`||p.startsWith(`${ROOT}/production/`)||p.startsWith(`${ROOT}/supplier-production/`))return"production";
  if(p===`${ROOT}/email`||p===`${ROOT}/communications`||p.startsWith(`${ROOT}/communications/`))return"communications";
  return p.slice(ROOT.length+1).split("/")[0]||"overview";
}

function idForHref(href=""){
  const p=href.split("?")[0].replace(/\/$/,"");
  if(p===ROOT)return"overview";
  if(p===`${ROOT}/communications`||p===`${ROOT}/email`)return"communications";
  if(p===`${ROOT}/marketing`)return"marketing";
  if(p===`${ROOT}/dealers`||p===`${ROOT}/dealer`||p===`${ROOT}/leads`||p===`${ROOT}/allocation`||p===`${ROOT}/territories`||p===`${ROOT}/academy`||p===`${ROOT}/health`)return"dealers";
  if(p===`${ROOT}/customers`||p===`${ROOT}/customer`)return"customers";
  if(p===`${ROOT}/orders`||p===`${ROOT}/order`)return"orders";
  if(p===`${ROOT}/inventory`||p===`${ROOT}/products`)return"inventory";
  if(p===`${ROOT}/supplier-production`||p===`${ROOT}/production`)return"production";
  return p.slice(ROOT.length+1).split("/")[0]||"overview";
}

const CSS=`<style id="kz-admin-ipad-nav-v6">
/* Desktop visual treatment, touch-safe iPad hit targets. */
aside nav .nav,aside nav .nav:link,aside nav .nav:visited,aside nav .nav:hover,aside nav .nav:focus,aside nav .nav:focus-visible,aside nav .nav:active{
  position:relative!important;
  min-height:42px!important;
  padding:0 12px!important;
  border:0!important;
  color:#8a8d8f!important;
  background:transparent!important;
  background-color:transparent!important;
  background-image:none!important;
  box-shadow:none!important;
  outline:none!important;
  text-decoration:none!important;
  font-size:12px!important;
  font-weight:400!important;
  line-height:1.2!important;
  -webkit-tap-highlight-color:transparent!important;
  -webkit-appearance:none!important;
  appearance:none!important;
  touch-action:manipulation!important;
}
aside nav .nav:hover,aside nav .nav:focus-visible{color:#fff!important}
aside nav .nav span{display:inline-block!important;position:relative!important;white-space:nowrap!important;overflow:visible!important;text-overflow:clip!important;background:transparent!important}
aside nav .nav small{display:block!important;margin-left:10px!important;color:#555!important;font-size:8px!important;line-height:1!important;background:transparent!important}
aside nav .nav[aria-current="page"]{color:#fff!important;font-weight:500!important}
aside nav .nav[aria-current="page"] span:after{content:""!important;position:absolute!important;left:0!important;right:0!important;bottom:-7px!important;height:2px!important;background:#fff!important;pointer-events:none!important}
aside nav .nav[aria-current="page"] small{color:#777!important}

@media (min-width:701px) and (max-width:1180px){
  .shell{grid-template-columns:245px minmax(0,1fr)!important}
  aside{position:sticky!important;top:0!important;height:100svh!important;padding:24px 20px 18px!important;display:flex!important;flex-direction:column!important}
  aside .brand{display:block!important;font-size:19px!important}
  aside .brand:after{display:none!important;content:none!important}
  aside .label{display:block!important;margin-top:7px!important;color:#777!important;font-size:9px!important;font-weight:800!important;letter-spacing:.16em!important;text-transform:uppercase!important}
  aside nav{display:grid!important;gap:5px!important;margin-top:30px!important;overflow-y:auto!important;min-height:0!important;overscroll-behavior:contain!important;scrollbar-width:thin!important;padding:2px 0 8px!important}
  aside nav .nav{display:flex!important;align-items:center!important;justify-content:space-between!important;min-height:48px!important;padding:0 12px!important;font-size:12px!important}
  aside nav .nav:before{display:none!important;content:none!important}
  aside nav .nav span,aside nav .nav small{display:block!important}
  aside .side{display:block!important;margin-top:auto!important;padding-top:14px!important;border-top:1px solid #292b2d!important;color:#999!important;font-size:9px!important;flex:0 0 auto!important}
  aside .side a{display:block!important;margin-top:10px!important;color:#777!important;text-decoration:none!important}
}

@media (min-width:701px) and (max-height:900px){
  aside{padding-top:18px!important;padding-bottom:12px!important}
  aside nav{margin-top:20px!important;gap:4px!important}
  aside nav .nav{min-height:46px!important}
  aside .side{padding-top:9px!important}
  aside .side a{margin-top:7px!important}
}

@media (max-width:700px){
  aside nav .nav,aside nav .nav *{-webkit-tap-highlight-color:transparent!important;background:transparent!important;background-color:transparent!important;background-image:none!important;box-shadow:none!important;touch-action:manipulation!important}
}
</style>`;

export default{
  async fetch(request,env,ctx){
    const url=new URL(request.url);
    const response=await app.fetch(request,env,ctx);
    if(request.method!=="GET"||url.hostname.toLowerCase()!==HOST||!url.pathname.startsWith(ROOT))return response;
    const ct=response.headers.get("Content-Type")||"";
    if(response.status!==200||!ct.includes("text/html"))return response;
    const active=sectionFor(url.pathname);
    return new HTMLRewriter()
      .on("head",{element(e){e.append(CSS,{html:true})}})
      .on("aside nav a.nav",{element(e){
        const id=idForHref(e.getAttribute("href")||"");
        const isActive=id===active;
        const cls=(e.getAttribute("class")||"").split(/\s+/).filter(Boolean).filter(x=>x!=="active"&&x!=="kz-current");
        e.setAttribute("class",[...new Set(cls)].join(" "));
        e.removeAttribute("style");
        if(isActive)e.setAttribute("aria-current","page");else e.removeAttribute("aria-current");
      }})
      .transform(response);
  },
  async email(message,env,ctx){if(typeof app.email==="function")return app.email(message,env,ctx)}
};
