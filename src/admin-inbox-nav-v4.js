import app, { PartnerReferrals } from "./admin-crm-address-book-v4.js";
export { PartnerReferrals };

const ROOT="/kaizuro-admin", STORE="kaizuro-partner-submissions";
const HOSTS=new Set(["kaizuro.com","www.kaizuro.com","portal.kaizuro.com"]);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function db(env){return env.PARTNER_REFERRALS.get(env.PARTNER_REFERRALS.idFromName(STORE));}
async function all(env,t){try{return await db(env).listAll(t)}catch{return[]}}
function activeFor(path){const p=path.replace(/\/$/,"");if(p===ROOT)return"overview";if(p===`${ROOT}/dealer`||p===`${ROOT}/dealers`)return"dealers";if(p===`${ROOT}/application`||p===`${ROOT}/applications`)return"applications";if(p===`${ROOT}/lead`||p===`${ROOT}/leads`)return"leads";if(p===`${ROOT}/order`||p===`${ROOT}/orders`)return"orders";if(p===`${ROOT}/supplier-production`||p.startsWith(`${ROOT}/supplier-production/`))return"supplier-production";if(p===`${ROOT}/email`||p===`${ROOT}/communications`||p.startsWith(`${ROOT}/communications/`))return"communications";if(p===`${ROOT}/health`)return"health";return p.slice(ROOT.length+1).split("/")[0]||"overview";}
async function nav(env,path){
 const [accounts,applications,leads,orders,allocation,support,products,tasks]=await Promise.all(["account","application","referral","sale","allocation-request","support","product-config","dealer-task"].map(t=>all(env,t)));
 const active=activeFor(path),openTasks=tasks.filter(t=>!t.completed).length,productCount=Math.max(2,new Set(products.map(p=>p.product||p.id).filter(Boolean)).size||0);
 const items=[
  ["overview","Overview","Live"],
  ["attention","Attention",String(openTasks)],
  ["communications","INBOX",""],
  ["marketing","Sales & Marketing",""],
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
  ["academy","Academy",""],
  ["performance","Performance",""],
  ["production","Production",""],
  ["supplier-production","Supplier Production",""],
  ["customers","Customers",""],
  ["team","Team",""],
  ["paperwork","Paperwork",""],
  ["search","Search",""],
  ["health","Dealer Health",""]
 ];
 return items.map(([id,label,badge])=>`<a class="nav${active===id?" kz-current":""}" href="${id==="overview"?ROOT:`${ROOT}/${id}`}"><span>${esc(label)}</span>${badge?`<small>${esc(badge)}</small>`:"<small></small>"}</a>`).join("");
}

export default {
 async fetch(r,env,ctx){
  const u=new URL(r.url),path=u.pathname.replace(/\/$/,"");
  const resp=await app.fetch(r,env,ctx);
  if(r.method!=="GET"||!HOSTS.has(u.hostname.toLowerCase())||!path.startsWith(ROOT))return resp;
  const ct=resp.headers.get("Content-Type")||"";
  if(resp.status!==200||!ct.includes("text/html"))return resp;
  const menu=await nav(env,path);
  return new HTMLRewriter().on("aside nav",{element(e){e.setInnerContent(menu,{html:true});}}).transform(resp);
 },
 async email(message,env,ctx){if(typeof app.email==="function")return app.email(message,env,ctx);}
};