import app, { PartnerReferrals } from "./admin-crm-address-book-v4.js";
export { PartnerReferrals };

const ROOT="/kaizuro-admin", STORE="kaizuro-partner-submissions";
const HOSTS=new Set(["kaizuro.com","www.kaizuro.com","portal.kaizuro.com"]);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function db(env){return env.PARTNER_REFERRALS.get(env.PARTNER_REFERRALS.idFromName(STORE));}
async function all(env,t){try{return await db(env).listAll(t)}catch{return[]}}
function activeFor(path){
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
async function nav(env,path){
 const [accounts,orders,support,products,tasks,retailCustomers]=await Promise.all(["account","sale","support","product-config","dealer-task","retail-customer"].map(t=>all(env,t)));
 const active=activeFor(path),openTasks=tasks.filter(t=>!t.completed).length,productCount=Math.max(2,new Set(products.map(p=>p.product||p.id).filter(Boolean)).size||0);
 const items=[
  ["overview","Overview","Live",ROOT],
  ["attention","Attention",String(openTasks),`${ROOT}/attention`],
  ["communications","Inbox","",`${ROOT}/communications`],
  ["marketing","Sales & Marketing","",`${ROOT}/marketing`],
  ["dealers","Dealers",String(accounts.length),`${ROOT}/dealers`],
  ["customers","Customers",String(retailCustomers.length),`${ROOT}/customers`],
  ["orders","Orders",String(orders.length),`${ROOT}/orders`],
  ["inventory","Inventory & Products",String(productCount),`${ROOT}/inventory`],
  ["production","Production","",`${ROOT}/supplier-production`],
  ["support","Support",String(support.length),`${ROOT}/support`],
  ["activity","Activity","Live",`${ROOT}/activity`],
  ["performance","Performance","",`${ROOT}/performance`],
  ["team","Team","",`${ROOT}/team`],
  ["paperwork","Paperwork","",`${ROOT}/paperwork`],
  ["search","Search","",`${ROOT}/search`]
 ];
 return items.map(([id,label,badge,href])=>`<a class="nav${active===id?" kz-current":""}" href="${href}"><span>${esc(label)}</span>${badge?`<small>${esc(badge)}</small>`:"<small></small>"}</a>`).join("");
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