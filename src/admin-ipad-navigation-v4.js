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

const CSS=`<style id="kz-admin-ipad-nav-v4">
aside nav{gap:0!important;margin-top:22px!important;overflow-y:auto!important;overscroll-behavior:contain;scrollbar-width:thin;padding-bottom:8px}
aside nav .nav{position:relative;min-height:35px!important;padding:0 10px!important;font-size:13.8px!important;line-height:1.15!important;border:0!important;border-bottom:1px solid rgba(255,255,255,.12)!important;color:rgba(255,255,255,.68)!important;text-decoration:none!important}
aside nav .nav span{display:block!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
aside nav .nav small{display:block!important;font-size:8px!important;line-height:1!important;color:rgba(255,255,255,.34)!important;margin-left:8px}
aside nav .nav:hover,aside nav .nav:focus-visible{color:#fff!important;background:rgba(255,255,255,.045)!important;outline:none}
aside nav .nav.active,aside nav .nav.kz-current,aside nav .nav[aria-current="page"]{color:#fff!important;background:#17191b!important;border-bottom:2px solid #fff!important;font-weight:600!important}
aside nav .nav.active small,aside nav .nav.kz-current small,aside nav .nav[aria-current="page"] small{color:rgba(255,255,255,.62)!important}
@media (min-width:701px) and (max-width:1180px){
  .shell{grid-template-columns:218px minmax(0,1fr)!important}
  aside{position:sticky!important;top:0!important;height:100svh!important;padding:18px 14px!important;display:flex!important;flex-direction:column!important}
  aside .brand{font-size:18px!important;display:block!important}
  aside .brand:after{display:none!important;content:none!important}
  aside .label{display:block!important;margin-top:5px!important;font-size:8px!important}
  aside nav{display:grid!important;margin-top:18px!important;flex:1 1 auto!important;min-height:0!important}
  aside nav .nav{justify-content:space-between!important;min-height:34px!important;font-size:13.5px!important}
  aside nav .nav:before{display:none!important;content:none!important}
  aside nav .nav span,aside nav .nav small{display:block!important}
  aside .side{display:block!important;margin-top:8px!important;padding-top:10px!important;font-size:8px!important;flex:0 0 auto!important}
  aside .side a{margin-top:7px!important}
}
@media (min-width:701px) and (max-height:900px){
  aside{padding-top:14px!important;padding-bottom:12px!important}
  aside nav{margin-top:12px!important}
  aside nav .nav{min-height:31px!important;font-size:13px!important}
  aside .side{padding-top:7px!important}
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
        if(isActive)cls.push("active","kz-current");
        e.setAttribute("class",[...new Set(cls)].join(" "));
        if(isActive)e.setAttribute("aria-current","page");else e.removeAttribute("aria-current");
      }})
      .transform(response);
  },
  async email(message,env,ctx){if(typeof app.email==="function")return app.email(message,env,ctx)}
};
