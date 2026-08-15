import app, { PartnerReferrals } from "./admin-ops-v5.js";
export { PartnerReferrals };

const ADMIN_ROOT = "/kaizuro-admin";
const STORE = "kaizuro-partner-submissions";
const HOSTS = new Set(["kaizuro.com", "www.kaizuro.com", "portal.kaizuro.com"]);

function db(env){return env.PARTNER_REFERRALS.get(env.PARTNER_REFERRALS.idFromName(STORE));}
async function all(env,type){try{return await db(env).listAll(type)}catch{return[]}}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function activeId(path){
  const p=path.replace(/\/$/,"");
  if(p===ADMIN_ROOT)return "overview";
  if(p===`${ADMIN_ROOT}/dealer`||p===`${ADMIN_ROOT}/dealers`)return "dealers";
  if(p===`${ADMIN_ROOT}/lead`||p===`${ADMIN_ROOT}/leads`)return "leads";
  if(p===`${ADMIN_ROOT}/order`||p===`${ADMIN_ROOT}/orders`)return "orders";
  if(p===`${ADMIN_ROOT}/email`)return "communications";
  if(p===`${ADMIN_ROOT}/health`)return "health";
  return p.slice(ADMIN_ROOT.length+1).split("/")[0]||"overview";
}
async function canonicalNav(env,path){
  const [accounts,applications,leads,orders,allocation,support,products,tasks]=await Promise.all([
    "account","application","referral","sale","allocation-request","support","product-config","dealer-task"
  ].map(t=>all(env,t)));
  const openTasks=tasks.filter(t=>!t.completed).length;
  const active=activeId(path);
  const productCount=Math.max(2,new Set(products.map(p=>p.product||p.id).filter(Boolean)).size||0);
  const items=[
    ["overview","Overview","Live"],
    ["attention","Attention",String(openTasks)],
    ["dealers","Dealers",String(accounts.length)],
    ["applications","Applications",String(applications.length)],
    ["leads","Leads",String(leads.length)],
    ["orders","Orders",String(orders.length)],
    ["allocation","Allocation",String(allocation.length)],
    ["inventory","Inventory",String(productCount)],
    ["products","Products",String(productCount)],
    ["support","Support",String(support.length)],
    ["territories","Territories",""],
    ["activity","Activity","Live"],
    ["marketing","Marketing",""],
    ["academy","Academy",""],
    ["performance","Performance",""],
    ["production","Production",""],
    ["customers","Customers",""],
    ["communications","Communications",""],
    ["team","Team",""],
    ["paperwork","Paperwork",""],
    ["search","Search",""],
    ["health","Dealer Health",""]
  ];
  return items.map(([id,label,badge])=>{
    const href=id==="overview"?ADMIN_ROOT:`${ADMIN_ROOT}/${id}`;
    return `<a class="nav ${active===id?"active":""}" href="${href}"><span>${esc(label)}</span>${badge?`<small>${esc(badge)}</small>`:"<small></small>"}</a>`;
  }).join("");
}

const SIDEBAR_CSS = `<style id="kz-admin-sidebar-canonical-fix">
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
  background:transparent!important;
  border:0!important;
  outline:0!important;
  box-shadow:none!important;
  border-radius:0!important;
}
aside nav .nav span,
aside nav .nav small{line-height:1!important;margin:0!important;}
aside nav .nav.active,
aside nav .nav.active:hover,
aside nav .nav.active:focus{
  background:transparent!important;
  border:0!important;
  outline:0!important;
  box-shadow:none!important;
}
aside nav .nav.active span{
  color:#fff!important;
  text-decoration:underline!important;
  text-decoration-color:#fff!important;
  text-decoration-thickness:1px!important;
  text-underline-offset:4px!important;
}
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
    const nav = await canonicalNav(env,url.pathname);
    return new HTMLRewriter()
      .on("head", { element(el) { el.append(SIDEBAR_CSS, { html: true }); } })
      .on("aside nav", { element(el) { el.setInnerContent(nav, { html: true }); } })
      .transform(response);
  }
};
