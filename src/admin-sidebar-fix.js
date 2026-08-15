import app, { PartnerReferrals } from "./admin-ops-v5.js";
export { PartnerReferrals };

const ADMIN_ROOT = "/kaizuro-admin";
const STORE = "kaizuro-partner-submissions";
const HOSTS = new Set(["kaizuro.com", "www.kaizuro.com", "portal.kaizuro.com"]);

function db(env){return env.PARTNER_REFERRALS.get(env.PARTNER_REFERRALS.idFromName(STORE));}
async function all(env,type){try{return await db(env).listAll(type)}catch{return[]}}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function when(v){try{return new Date(v).toLocaleString("en-AU",{day:"numeric",month:"short",year:"numeric",hour:"numeric",minute:"2-digit"})}catch{return "—"}}
function activeId(path){
  const p=path.replace(/\/$/,"");
  if(p===ADMIN_ROOT)return "overview";
  if(p===`${ADMIN_ROOT}/dealer`||p===`${ADMIN_ROOT}/dealers`)return "dealers";
  if(p===`${ADMIN_ROOT}/application`||p===`${ADMIN_ROOT}/applications`)return "applications";
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
    ["overview","Overview","Live"],["attention","Attention",String(openTasks)],["dealers","Dealers",String(accounts.length)],
    ["applications","Applications",String(applications.length)],["leads","Leads",String(leads.length)],["orders","Orders",String(orders.length)],
    ["allocation","Allocation",String(allocation.length)],["inventory","Inventory",String(productCount)],["products","Products",String(productCount)],
    ["support","Support",String(support.length)],["territories","Territories",""],["activity","Activity","Live"],["marketing","Marketing",""],
    ["academy","Academy",""],["performance","Performance",""],["production","Production",""],["customers","Customers",""],
    ["communications","Communications",""],["team","Team",""],["paperwork","Paperwork",""],["search","Search",""],["health","Dealer Health",""]
  ];
  return items.map(([id,label,badge])=>{
    const href=id==="overview"?ADMIN_ROOT:`${ADMIN_ROOT}/${id}`;
    return `<a class="nav${active===id?" kz-current":""}" href="${href}"><span>${esc(label)}</span>${badge?`<small>${esc(badge)}</small>`:"<small></small>"}</a>`;
  }).join("");
}

async function overviewActivity(env){
  const rows=(await all(env,"admin-activity")).slice(0,8);
  if(!rows.length)return `<div class="kz-live-activity-empty">No Admin activity recorded yet.</div>`;
  return `<div class="kz-live-activity">${rows.map(x=>`<div class="kz-live-row"><small>${esc(when(x.createdAt))}</small><div><b>${esc(x.action||"Admin activity")}</b><p>${esc(x.details||x.contextRef||x.partnerId||"")}</p></div></div>`).join("")}</div>`;
}

function latest(rows,key){const m=new Map();for(const r of rows){const k=key(r);if(k&&!m.has(k))m.set(k,r)}return m;}
function applicationName(a){return a.businessName||a.dealerName||a.company||a.business||"Dealer application";}
function applicationContact(a){return a.contactName||a.name||a.fullName||"—";}
function applicationEmail(a){return a.email||a.contactEmail||a.username||"";}
function applicationRegion(a){return a.region||a.location||a.state||a.country||"—";}
function accountMatches(a,application){const vals=[applicationEmail(application),application.partnerId,application.assignedPartnerId].map(v=>String(v||"").trim().toLowerCase()).filter(Boolean);return vals.some(v=>[a.email,a.username,a.partnerId,a.assignedPartnerId].some(x=>String(x||"").trim().toLowerCase()===v));}
function safeApplicationFields(a){
  const hidden=new Set(["type","password","passwordHash","token","secret","session","auth","credential"]);
  return Object.entries(a).filter(([k,v])=>!hidden.has(k)&&!/(password|token|secret|credential)/i.test(k)&&v!==undefined&&v!==null&&String(v)!=="");
}
function fieldLabel(k){return String(k).replace(/([a-z])([A-Z])/g,"$1 $2").replace(/[_-]+/g," ").replace(/^./,c=>c.toUpperCase());}

async function applicationsContent(env){
  const [apps,decisions,accounts]=await Promise.all([all(env,"application"),all(env,"application-decision"),all(env,"account")]);
  const dm=latest(decisions,x=>String(x.applicationId||x.applicationRef||""));
  return `<section class="hero"><div><p class="eyebrow">KAIZURO Network Control</p><h1>Turn approval<br>into onboarding.</h1><p>Open the full application first, then approve, request more information or decline.</p></div></section>
  <section class="panel kz-app-section" style="margin-top:18px"><h2>Dealer applications</h2><p>Click <b>View Application</b> to review every submitted answer before making a decision.</p><div class="table-wrap"><table class="kz-app-table"><thead><tr><th>Applicant</th><th>Contact</th><th>Region</th><th>Status</th><th>Provisioned</th><th>Application</th><th>Decision</th></tr></thead><tbody>${apps.map(a=>{const d=dm.get(String(a.id))||{},existing=accounts.find(x=>accountMatches(x,a)),status=d.status||a.status||"Pending review";return `<tr><td><b>${esc(applicationName(a))}</b><br><small>${esc(a.id||"")}</small></td><td>${esc(applicationContact(a))}<br><small>${esc(applicationEmail(a))}</small></td><td>${esc(applicationRegion(a))}</td><td>${esc(status)}</td><td>${existing?`<span class="kz-app-pill">${esc(existing.assignedPartnerId||existing.partnerId||"Dealer created")}</span>`:"—"}</td><td><a class="btn light" href="${ADMIN_ROOT}/application?ref=${encodeURIComponent(a.id||"")}">View Application</a></td><td><form method="post" action="${ADMIN_ROOT}/application/v4" class="kz-app-actions"><input type="hidden" name="application" value="${esc(a.id||"")}"><select name="status"><option ${status==="Approved"?"selected":""}>Approved</option><option ${status==="More information required"?"selected":""}>More information required</option><option ${status==="Declined"?"selected":""}>Declined</option></select><button class="btn" type="submit">Save</button></form></td></tr>`}).join("")||`<tr><td colspan="7">No applications yet.</td></tr>`}</tbody></table></div></section>`;
}

async function applicationDetailContent(env,ref){
  const [apps,decisions,accounts]=await Promise.all([all(env,"application"),all(env,"application-decision"),all(env,"account")]);
  const a=apps.find(x=>String(x.id)===String(ref));
  if(!a)return null;
  const dm=latest(decisions,x=>String(x.applicationId||x.applicationRef||""));
  const d=dm.get(String(a.id))||{};
  const existing=accounts.find(x=>accountMatches(x,a));
  const status=d.status||a.status||"Pending review";
  const fields=safeApplicationFields(a);
  return `<section class="hero"><div><p class="eyebrow">Dealer Application</p><h1>${esc(applicationName(a))}</h1><p>Review the complete dealer application before making a decision.</p></div></section>
  <div class="kz-app-detail-grid">
    <section class="panel"><div class="kz-app-detail-head"><div><small>APPLICATION REFERENCE</small><b>${esc(a.id||"—")}</b></div><div><small>STATUS</small><b>${esc(status)}</b></div><div><small>PROVISIONED</small><b>${existing?esc(existing.assignedPartnerId||existing.partnerId||"Yes"):"No"}</b></div></div></section>
    <section class="panel"><h2>Submitted application</h2><div class="kz-app-fields">${fields.map(([k,v])=>`<div class="kz-app-field"><small>${esc(fieldLabel(k))}</small><div>${esc(Array.isArray(v)?v.join(", "):typeof v==="object"?JSON.stringify(v):v)}</div></div>`).join("")}</div></section>
    <section class="panel"><h2>Decision</h2><p>Approve only after reviewing the application above. Approval provisions the dealer record and starts onboarding.</p><form method="post" action="${ADMIN_ROOT}/application/v4" class="kz-app-decision"><input type="hidden" name="application" value="${esc(a.id||"")}"><label>Status<select name="status"><option ${status==="Approved"?"selected":""}>Approved</option><option ${status==="More information required"?"selected":""}>More information required</option><option ${status==="Declined"?"selected":""}>Declined</option></select></label><div class="kz-app-actions"><button class="btn" type="submit">Save decision</button><a class="btn light" href="${ADMIN_ROOT}/applications">Back to applications</a>${existing?`<a class="btn light" href="${ADMIN_ROOT}/dealer?partner=${encodeURIComponent(existing.partnerId||existing.email||"")}">Open dealer profile</a>`:""}</div></form></section>
  </div>`;
}

const SIDEBAR_CSS = `<style id="kz-admin-sidebar-canonical-fix">
aside{overflow:hidden!important;}aside nav{display:grid!important;grid-auto-flow:row!important;grid-auto-rows:25px!important;align-content:start!important;row-gap:0!important;column-gap:0!important;margin-top:18px!important;overflow-y:auto!important;overflow-x:hidden!important;min-height:0!important;flex:1 1 auto!important;padding-right:4px!important;scrollbar-width:thin!important}aside nav > a.nav,aside nav .nav{min-height:25px!important;height:25px!important;max-height:25px!important;box-sizing:border-box!important;padding:0 12px!important;margin:0!important;line-height:25px!important;align-items:center!important;background:transparent!important;border:0!important;outline:0!important;box-shadow:none!important;border-radius:0!important}aside nav .nav span,aside nav .nav small{line-height:1!important;margin:0!important}aside nav .nav.kz-current,aside nav .nav.kz-current:hover,aside nav .nav.kz-current:focus{background:transparent!important;border:0!important;outline:0!important;box-shadow:none!important}aside nav .nav.kz-current span{display:inline-block!important;color:#fff!important;text-decoration:none!important;border-bottom:1px solid #fff!important;padding-bottom:2px!important}aside .side{flex:0 0 auto!important;margin-top:8px!important;padding-top:8px!important}.kz-live-activity{display:grid}.kz-live-row{display:grid;grid-template-columns:110px 1fr;gap:14px;padding:12px 0;border-bottom:1px solid #ddd}.kz-live-row small{color:#888;font-size:9px}.kz-live-row b{font-size:10px}.kz-live-row p{margin:4px 0 0!important;font-size:9px!important;color:#777!important}.kz-live-activity-empty{padding:28px;text-align:center;border:1px dashed #ccc;color:#888;font-size:10px}.kz-app-table{width:100%;border-collapse:collapse;background:#fff}.kz-app-table th,.kz-app-table td{padding:11px;border-bottom:1px solid #ddd;text-align:left;font-size:12px;vertical-align:middle}.kz-app-table th{font-size:10px;color:#777;text-transform:uppercase;letter-spacing:.05em}.kz-app-table small{font-size:10px;color:#777}.kz-app-actions{display:flex;gap:6px;align-items:center}.kz-app-actions select,.kz-app-decision select{min-height:38px;padding:7px;border:1px solid #bbb;background:#fff}.kz-app-pill{display:inline-flex;padding:5px 8px;background:#e4f1e8;color:#276542;font-size:10px;font-weight:700}.kz-app-detail-grid{display:grid;gap:18px;margin-top:18px}.kz-app-detail-head{display:grid;grid-template-columns:2fr 1fr 1fr;gap:18px}.kz-app-detail-head small,.kz-app-field small{display:block;color:#777;font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase}.kz-app-detail-head b{display:block;margin-top:6px;font-size:13px}.kz-app-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;background:#ddd;border:1px solid #ddd;margin-top:16px}.kz-app-field{background:#fff;padding:14px;min-height:72px}.kz-app-field div{margin-top:7px;font-size:13px;line-height:1.45;white-space:pre-wrap;overflow-wrap:anywhere}.kz-app-decision{display:grid;gap:12px}.kz-app-decision label{display:grid;gap:6px;font-size:12px;font-weight:600;max-width:420px}@media(max-height:900px) and (min-width:701px){aside{padding-top:18px!important;padding-bottom:14px!important}aside nav{margin-top:14px!important;grid-auto-rows:24px!important}aside nav > a.nav,aside nav .nav{min-height:24px!important;height:24px!important;max-height:24px!important;line-height:24px!important}}@media(max-width:800px){.kz-app-detail-head,.kz-app-fields{grid-template-columns:1fr}}
</style>`;

async function rewriteAdmin(response,env,url,contentOverride=""){
  const nav=await canonicalNav(env,url.pathname);
  const isOverview=url.pathname.replace(/\/$/,"")===ADMIN_ROOT;
  const activity=isOverview?await overviewActivity(env):"";
  const rewriter=new HTMLRewriter().on("head",{element(el){el.append(SIDEBAR_CSS,{html:true})}}).on("aside nav",{element(el){el.setInnerContent(nav,{html:true})}});
  if(contentOverride)rewriter.on(".content",{element(el){el.setInnerContent(contentOverride,{html:true})}});
  else if(isOverview)rewriter.on(".grid2 .panel .empty",{element(el){el.setInnerContent(activity,{html:true})}});
  return rewriter.transform(response);
}

export default {
  async fetch(request, env, ctx) {
    const url=new URL(request.url);
    if(!HOSTS.has(url.hostname.toLowerCase())||!url.pathname.startsWith(ADMIN_ROOT))return app.fetch(request,env,ctx);

    if(request.method==="GET"&&url.pathname.replace(/\/$/,"")===`${ADMIN_ROOT}/application`){
      const shellUrl=new URL(request.url);shellUrl.pathname=`${ADMIN_ROOT}/applications`;shellUrl.search="";
      const shell=await app.fetch(new Request(shellUrl,{method:"GET",headers:request.headers}),env,ctx);
      if(shell.status!==200||(shell.headers.get("Content-Type")||"").includes("text/html")===false)return shell;
      const detail=await applicationDetailContent(env,url.searchParams.get("ref")||"");
      if(!detail)return new Response("Application not found",{status:404,headers:{"Content-Type":"text/plain; charset=UTF-8","Cache-Control":"no-store"}});
      return rewriteAdmin(shell,env,url,detail);
    }

    const response=await app.fetch(request,env,ctx);
    const type=response.headers.get("Content-Type")||"";
    if(request.method!=="GET"||response.status!==200||!type.includes("text/html"))return response;

    if(url.pathname.replace(/\/$/,"")===`${ADMIN_ROOT}/applications`){
      return rewriteAdmin(response,env,url,await applicationsContent(env));
    }
    return rewriteAdmin(response,env,url);
  }
};
