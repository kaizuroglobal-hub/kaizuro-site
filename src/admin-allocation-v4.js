import app, { PartnerReferrals } from "./kaizuro-platform-v4.js";
export { PartnerReferrals };

const ROOT="/kaizuro-admin";
const PATH=`${ROOT}/allocation`;
const STORE="kaizuro-partner-submissions";
const STATES=["Submitted","Approved","Reserved","Shipped","Declined"];
const HOSTS=new Set(["kaizuro.com","www.kaizuro.com","portal.kaizuro.com"]);

function db(env){return env.PARTNER_REFERRALS.get(env.PARTNER_REFERRALS.idFromName(STORE));}
async function all(env,type){try{return await db(env).listAll(type)}catch{return[]}}
async function save(env,row){return db(env).createSubmission({...row,createdAt:new Date().toISOString()});}
const lower=v=>String(v||"").trim().toLowerCase();
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=v=>{try{return new Date(v).toLocaleDateString("en-AU",{day:"numeric",month:"short",year:"numeric"})}catch{return"—"}};
function latest(rows,key){const m=new Map();for(const r of rows){const k=key(r);if(k&&!m.has(k))m.set(k,r)}return m;}
function productName(v){const s=String(v||"").toUpperCase();if(s.includes("ASSAULT"))return"ASSAULT";if(s.includes("HALO"))return"HALO";return String(v||"—");}
function qty(r){return Math.max(0,Number(r.quantity||r.qty||r.units||r.requestedQuantity||r.requestedUnits||0));}
function partnerName(a){return a?.businessName||a?.dealerName||a?.contactName||a?.email||"Dealer";}
function partnerKey(a){return lower(a?.partnerId||a?.email||a?.username||a?.assignedPartnerId);}
function matchAccount(accounts,r){const vals=[r.partnerId,r.partnerCode,r.partnerName,r.email].map(lower).filter(Boolean);return accounts.find(a=>vals.some(v=>[a.partnerId,a.email,a.username,a.assignedPartnerId,a.referralCode,a.partnerCode,a.dealerCode,a.dealerName,a.businessName,a.contactName].map(lower).includes(v)));}
function validOrigin(r){const o=r.headers.get("Origin");return !o||o===new URL(r.url).origin;}
async function adminAuthed(r,env,ctx){const u=new URL(r.url);u.pathname=ROOT;u.search="";const res=await app.fetch(new Request(u,{method:"GET",headers:r.headers}),env,ctx);return res.status===200;}

function supplyValue(p){for(const k of ["available","availableUnits","stock","stockOnHand","inventory","onHand"]){if(p?.[k]!==undefined&&p?.[k]!==null&&p?.[k]!=="")return Number(p[k])||0;}return null;}
function supplyFor(product,configs,batches){
  const key=productName(product);
  const cfg=configs.find(x=>productName(x.product||x.name||x.id)===key);
  const onHand=supplyValue(cfg);
  let incoming=0,hasIncoming=false;
  for(const b of batches){if(productName(b.product)!==key)continue;const stage=lower(b.stage);if(stage==="received")continue;const q=Number(b.quantity||0),committed=Number(b.committed||0);if(Number.isFinite(q)){incoming+=Math.max(0,q-committed);hasIncoming=true;}}
  const known=onHand!==null||hasIncoming;
  return{known,onHand:onHand??0,incoming,total:(onHand??0)+incoming};
}

async function content(env,url){
  const [requests,statuses,accounts,configs,batches]=await Promise.all(["allocation-request","allocation-status","account","product-config","production-batch"].map(t=>all(env,t)));
  const sm=latest(statuses,x=>String(x.allocationRef||x.requestId||x.id||""));
  const rows=requests.map(r=>{const s=sm.get(String(r.id))||{};return{...r,currentStatus:s.status||r.status||"Submitted",statusAt:s.createdAt||r.createdAt,adminNotes:s.notes||""};});
  const filter=String(url.searchParams.get("status")||"All");
  const shown=filter==="All"?rows:rows.filter(r=>lower(r.currentStatus)===lower(filter));
  const pending=rows.filter(r=>lower(r.currentStatus)==="submitted");
  const reservedUnits=rows.filter(r=>lower(r.currentStatus)==="reserved").reduce((n,r)=>n+qty(r),0);
  const shippedUnits=rows.filter(r=>lower(r.currentStatus)==="shipped").reduce((n,r)=>n+qty(r),0);
  const approvedUnits=rows.filter(r=>lower(r.currentStatus)==="approved").reduce((n,r)=>n+qty(r),0);
  const tabs=["All",...STATES].map(s=>`<a class="kz-alloc-tab ${filter===s?"current":""}" href="${PATH}${s==="All"?"":`?status=${encodeURIComponent(s)}`}">${esc(s)}${s==="All"?` (${rows.length})`:` (${rows.filter(r=>lower(r.currentStatus)===lower(s)).length})`}</a>`).join("");
  const table=shown.length?`<div class="table-wrap"><table class="kz-alloc-table"><thead><tr><th>Date</th><th>Dealer</th><th>Product</th><th>Qty</th><th>Status</th><th>Supply position</th><th>Dealer notes</th><th>Admin action</th></tr></thead><tbody>${shown.map(r=>{const a=matchAccount(accounts,r),p=productName(r.product||r.productName||r.model),q=qty(r),s=supplyFor(p,configs,batches);return `<tr><td>${esc(fmt(r.createdAt))}<br><small>${esc(r.id||"")}</small></td><td><b>${esc(a?partnerName(a):(r.partnerName||r.partnerId||"Dealer"))}</b>${a?.email?`<br><small>${esc(a.email)}</small>`:""}</td><td><b>${esc(p)}</b></td><td>${q||"—"}</td><td><span class="kz-alloc-status">${esc(r.currentStatus)}</span>${r.statusAt?`<br><small>${esc(fmt(r.statusAt))}</small>`:""}</td><td>${s.known?`<b>${s.total} units</b><br><small>${s.onHand} on hand + ${s.incoming} incoming</small>`:`<span class="kz-alloc-warn">Stock quantity not configured</span>`}</td><td>${esc(r.notes||r.reason||r.comments||r.details||"—")}</td><td><form class="kz-alloc-form" method="post" action="${PATH}/status"><input type="hidden" name="ref" value="${esc(r.id||"")}"><input type="hidden" name="partner" value="${esc(r.partnerId||a?.partnerId||a?.email||"")}"><input type="hidden" name="product" value="${esc(p)}"><input type="hidden" name="quantity" value="${q}"><select name="status">${STATES.map(x=>`<option ${x===r.currentStatus?"selected":""}>${x}</option>`).join("")}</select><input name="notes" placeholder="Admin note" value="${esc(r.adminNotes)}"><button class="btn" type="submit">Save</button></form></td></tr>`}).join("")}</tbody></table></div>`:`<div class="kz-alloc-empty"><b>${filter==="All"?"No allocation requests yet.":`No ${esc(filter.toLowerCase())} allocation requests.`}</b><span>Dealer stock requests submitted from the Dealer Portal will appear here. KAIZURO can then move them through Submitted → Approved → Reserved → Shipped, or Declined.</span></div>`;
  return `<section class="hero"><div><p class="eyebrow">KAIZURO Network Control</p><h1>Control dealer<br>stock allocation.</h1><p>Review dealer requests against physical and incoming stock before committing units. Allocation is the bridge between dealer demand, Inventory and Production.</p></div></section><div class="kz-alloc-metrics"><div><small>Pending requests</small><strong>${pending.length}</strong></div><div><small>Approved units</small><strong>${approvedUnits}</strong></div><div><small>Units reserved</small><strong>${reservedUnits}</strong></div><div><small>Units shipped</small><strong>${shippedUnits}</strong></div></div><section class="panel kz-alloc-section"><div class="kz-alloc-head"><div><h2>Allocation requests</h2><p><b>Submitted → Approved → Reserved → Shipped.</b> Decline requests that should not proceed.</p></div><div class="kz-alloc-links"><a class="btn light" href="${ROOT}/inventory">Inventory</a><a class="btn light" href="${ROOT}/production">Production</a></div></div><div class="kz-alloc-tabs">${tabs}</div>${table}<div class="kz-alloc-note"><b>Allocation safeguard:</b> Approved and Reserved requests are checked against configured stock on hand plus uncommitted incoming production. If no quantity is configured, KAIZURO must update Inventory or Production before committing the allocation.</div></section>`;
}

const CSS=`<style id="kz-allocation-v4">.kz-alloc-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;margin-top:18px;background:#d1d2ce;border:1px solid #d1d2ce}.kz-alloc-metrics>div{min-height:108px;padding:18px;background:#fff}.kz-alloc-metrics small{display:block;color:#777;font-size:10px;font-weight:700;text-transform:uppercase}.kz-alloc-metrics strong{display:block;margin-top:17px;font-size:28px;font-weight:400}.kz-alloc-section{margin-top:18px}.kz-alloc-head{display:flex;justify-content:space-between;gap:18px;align-items:start}.kz-alloc-links{display:flex;gap:7px}.kz-alloc-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:16px 0}.kz-alloc-tab{padding:7px 9px;border:1px solid #ccc;background:#fff;text-decoration:none;font-size:11px}.kz-alloc-tab.current{border-color:#111;font-weight:700}.kz-alloc-table{width:100%;min-width:1150px;border-collapse:collapse;background:#fff}.kz-alloc-table th,.kz-alloc-table td{padding:10px;border-bottom:1px solid #ddd;text-align:left;vertical-align:top;font-size:12px}.kz-alloc-table th{font-size:10px;color:#777;text-transform:uppercase}.kz-alloc-table small{font-size:10px;color:#777}.kz-alloc-status{display:inline-flex;padding:5px 7px;background:#ecece8;font-size:10px;font-weight:700;text-transform:uppercase}.kz-alloc-warn{color:#7a5c17;font-weight:700}.kz-alloc-form{display:grid;grid-template-columns:120px minmax(140px,1fr) auto;gap:6px;min-width:370px}.kz-alloc-form select,.kz-alloc-form input{min-height:36px;padding:7px;border:1px solid #bbb;background:#fff;font:inherit;font-size:11px}.kz-alloc-empty{display:grid;place-items:center;min-height:210px;padding:30px;border:1px dashed #bbb;background:#f2f2ef;text-align:center;color:#777}.kz-alloc-empty b{display:block;color:#333;font-size:15px}.kz-alloc-empty span{display:block;max-width:620px;margin-top:8px;font-size:11px;line-height:1.6}.kz-alloc-note{margin-top:14px;padding:12px 14px;border:1px solid #c9b06e;background:#f8f1de;color:#69521b;font-size:11px;line-height:1.55}@media(max-width:900px){.kz-alloc-metrics{grid-template-columns:1fr 1fr}.kz-alloc-head{display:block}.kz-alloc-links{margin-top:12px}}@media(max-width:700px){.kz-alloc-metrics{grid-template-columns:1fr}}</style>`;

async function postStatus(request,env,ctx){
  if(!validOrigin(request)||!(await adminAuthed(request,env,ctx)))return new Response("Unauthorized",{status:403});
  const f=await request.formData(),ref=String(f.get("ref")||""),status=String(f.get("status")||""),partner=String(f.get("partner")||""),product=productName(f.get("product")),quantity=Math.max(0,Number(f.get("quantity")||0)),notes=String(f.get("notes")||"").trim().slice(0,1000);
  if(!ref||!STATES.includes(status))return new Response("Invalid allocation update",{status:400});
  if(status==="Approved"||status==="Reserved"){
    const [configs,batches]=await Promise.all([all(env,"product-config"),all(env,"production-batch")]);
    const supply=supplyFor(product,configs,batches);
    if(!supply.known){const u=new URL(PATH,request.url);u.searchParams.set("error",`Cannot ${status.toLowerCase()} ${product}: configure stock in Inventory or incoming units in Production first.`);return Response.redirect(u.toString(),303);}
    if(quantity>supply.total){const u=new URL(PATH,request.url);u.searchParams.set("error",`Cannot ${status.toLowerCase()} ${quantity} ${product}: only ${supply.total} units are currently available or uncommitted incoming.`);return Response.redirect(u.toString(),303);}
  }
  await save(env,{id:`KZALLOC-${crypto.randomUUID()}`,type:"allocation-status",partnerId:partner||"network",allocationRef:ref,status,product,quantity,notes,actor:"KAIZURO Admin"});
  await save(env,{id:`KZAUD-${crypto.randomUUID()}`,type:"admin-activity",partnerId:partner||"network",action:`Allocation ${status}`,contextType:"allocation",contextRef:ref,details:`${quantity} ${product}${notes?` · ${notes}`:""}`,actor:"KAIZURO Admin"});
  const u=new URL(PATH,request.url);u.searchParams.set("saved",ref);return Response.redirect(u.toString(),303);
}

export default {async fetch(request,env,ctx){
  const url=new URL(request.url),host=url.hostname.toLowerCase(),path=url.pathname.replace(/\/$/,"");
  if(!HOSTS.has(host))return app.fetch(request,env,ctx);
  if(request.method==="POST"&&path===`${PATH}/status`)return postStatus(request,env,ctx);
  if(request.method!=="GET"||path!==PATH)return app.fetch(request,env,ctx);
  const base=await app.fetch(request,env,ctx);if(base.status!==200||!(base.headers.get("Content-Type")||"").includes("text/html"))return base;
  let body=await content(env,url);const error=url.searchParams.get("error"),saved=url.searchParams.get("saved");if(error)body=`<div class="notice" style="margin-bottom:16px"><b>Allocation not changed.</b><br>${esc(error)}</div>`+body;if(saved)body=`<div class="success" style="margin-bottom:16px"><b>Allocation updated.</b><br>${esc(saved)}</div>`+body;
  return new HTMLRewriter().on("head",{element(e){e.append(CSS,{html:true})}}).on(".top b",{element(e){e.setInnerContent("Allocation")}}).on(".content",{element(e){e.setInnerContent(body,{html:true})}}).transform(base);
}};
