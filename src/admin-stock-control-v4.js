import app, { PartnerReferrals } from "./admin-inventory-v4.js";
export { PartnerReferrals };

const ROOT="/kaizuro-admin", ALLOC=`${ROOT}/allocation`, STORE="kaizuro-partner-submissions";
const HOSTS=new Set(["kaizuro.com","www.kaizuro.com","portal.kaizuro.com"]);
function db(env){return env.PARTNER_REFERRALS.get(env.PARTNER_REFERRALS.idFromName(STORE));}
async function all(env,t){try{return await db(env).listAll(t)}catch{return[]}}
const lower=v=>String(v||"").trim().toLowerCase();
function latest(rows,key){const m=new Map();for(const r of rows){const k=key(r);if(k&&!m.has(k))m.set(k,r)}return m;}
function productName(v){const s=String(v||"").toUpperCase();if(s.includes("ASSAULT"))return"ASSAULT";if(s.includes("HALO"))return"HALO";return String(v||"").toUpperCase();}
function qty(r){return Math.max(0,Number(r.quantity||r.qty||r.units||r.requestedQuantity||r.requestedUnits||0));}
function stockValue(p){for(const k of ["onHand","available","availableUnits","stock","stockOnHand","inventory"]){if(p?.[k]!==undefined&&p?.[k]!==null&&p?.[k]!=="")return Math.max(0,Number(p[k])||0);}return 0;}
function validOrigin(r){const o=r.headers.get("Origin");return !o||o===new URL(r.url).origin;}
async function authed(r,env,ctx){const u=new URL(r.url);u.pathname=ROOT;u.search="";return (await app.fetch(new Request(u,{method:"GET",headers:r.headers}),env,ctx)).status===200;}
function grossSupply(product,configs,batches){const key=productName(product),cfg=latest(configs,x=>productName(x.product||x.name||x.id)).get(key)||{};const onHand=stockValue(cfg);let incoming=0;for(const b of batches){if(productName(b.product)!==key||lower(b.stage)==="received")continue;incoming+=Math.max(0,Number(b.quantity||0)-Number(b.committed||0));}return{onHand,incoming,total:onHand+incoming};}

async function guardAllocation(request,env,ctx){
  if(!validOrigin(request)||!(await authed(request,env,ctx)))return new Response("Unauthorized",{status:403});
  const clone=request.clone(),f=await clone.formData(),status=String(f.get("status")||""),ref=String(f.get("ref")||""),product=productName(f.get("product")),requested=Math.max(0,Number(f.get("quantity")||0));
  if(!["Approved","Reserved"].includes(status))return null;
  const [configs,batches,requests,statuses]=await Promise.all(["product-config","production-batch","allocation-request","allocation-status"].map(t=>all(env,t)));
  const supply=grossSupply(product,configs,batches),sm=latest(statuses,x=>String(x.allocationRef||x.requestId||x.id||""));
  let otherCommitted=0;
  for(const r of requests){if(String(r.id)===ref||productName(r.product||r.productName||r.model)!==product)continue;const s=sm.get(String(r.id))||{},current=s.status||r.status||"Submitted";if(["approved","reserved"].includes(lower(current)))otherCommitted+=qty(r);}
  const remaining=Math.max(0,supply.total-otherCommitted);
  if(requested>remaining){const u=new URL(ALLOC,request.url);u.searchParams.set("error",`Cannot ${status.toLowerCase()} ${requested} ${product}: ${otherCommitted} units are already approved/reserved and only ${remaining} units remain from ${supply.onHand} on hand + ${supply.incoming} uncommitted incoming.`);return Response.redirect(u.toString(),303);}
  return null;
}

export default {async fetch(request,env,ctx){const url=new URL(request.url),path=url.pathname.replace(/\/$/,"");if(!HOSTS.has(url.hostname.toLowerCase()))return app.fetch(request,env,ctx);if(request.method==="POST"&&path===`${ALLOC}/status`){const blocked=await guardAllocation(request,env,ctx);if(blocked)return blocked;}return app.fetch(request,env,ctx);}};
