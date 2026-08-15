import app from "./kaizuro-admin.js";
export { PartnerReferrals } from "./kaizuro-admin.js";

const ROOT = "/kaizuro-admin";
const HOST = "portal.kaizuro.com";
const STORE_NAME = "kaizuro-partner-submissions";
const MAIL_FROM = "notifications@portal.kaizuro.com";
const MAIL_REPLY = "info@kaizuro.com";

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const lower = (v) => String(v || "").trim().toLowerCase();
const date = (v) => { try { return new Date(v).toLocaleString("en-AU", { day:"numeric", month:"short", year:"numeric", hour:"numeric", minute:"2-digit" }); } catch { return "—"; } };
function validOrigin(request){ const origin=request.headers.get("Origin"); return !origin || origin===new URL(request.url).origin; }
function store(env){ return env.PARTNER_REFERRALS.get(env.PARTNER_REFERRALS.idFromName(STORE_NAME)); }
async function listAll(env,type){ try { return await store(env).listAll(type); } catch { return []; } }
async function list(env,partnerId,type){ try { return await store(env).listForPartner(String(partnerId),type); } catch { return []; } }
function response(html,status=200){ return new Response(html,{status,headers:{"Content-Type":"text/html; charset=UTF-8","Cache-Control":"no-store, no-cache, must-revalidate","X-Robots-Tag":"noindex,nofollow,noarchive"}}); }
function redirect(request,path){ return Response.redirect(new URL(path,request.url).toString(),303); }

async function authenticated(request,env,ctx){
  const probeUrl=new URL(request.url); probeUrl.pathname=ROOT; probeUrl.search="";
  const probe=new Request(probeUrl.toString(),{method:"GET",headers:request.headers});
  const result=await app.fetch(probe,env,ctx);
  return result.status===200;
}

async function accounts(env){ return listAll(env,"account"); }
function matchesAccount(account,partner){
  const p=lower(partner);
  return [account.partnerId,account.username,account.email,account.assignedPartnerId,account.referralCode,account.partnerCode].some(v=>lower(v)===p);
}
async function accountFor(env,partner){
  const rows=await accounts(env);
  return rows.find(a=>matchesAccount(a,partner))||null;
}
function accountPartner(account){ return String(account?.partnerId||account?.username||account?.email||""); }
function dealerName(account, fallback="Dealer"){ return account?.dealerName||account?.businessName||account?.contactName||account?.email||fallback; }
function dealerEmail(account){ return String(account?.email||account?.username||"").trim(); }
function dealerHref(partner){ return `${ROOT}/dealer?partner=${encodeURIComponent(partner)}`; }
function emailHref(partner,type="dealer",ref=""){ return `${ROOT}/email?partner=${encodeURIComponent(partner)}&context=${encodeURIComponent(type)}${ref?`&ref=${encodeURIComponent(ref)}`:""}`; }

async function dealerLookup(env){
  const rows=await accounts(env);
  return (partner)=>rows.find(a=>matchesAccount(a,partner))||null;
}

async function decorateLeads(responseValue,env){
  const contentType=responseValue.headers.get("Content-Type")||"";
  if(responseValue.status!==200||!contentType.includes("text/html")) return responseValue;
  const [leads,statuses]=await Promise.all([listAll(env,"referral"),listAll(env,"lead-status")]);
  const statusMap=new Map(); for(const s of statuses){const id=String(s.leadRef||s.leadId||"");if(id&&!statusMap.has(id))statusMap.set(id,s.status);}
  const findDealer=await dealerLookup(env);
  const rows=leads.slice(0,500).map(x=>{
    const account=findDealer(x.partnerId); const partner=accountPartner(account)||String(x.partnerId||"");
    const name=dealerName(account,String(x.partnerId||"—")); const email=dealerEmail(account);
    const stage=statusMap.get(String(x.id))||x.status||"New";
    return `<tr><td>${esc(date(x.createdAt))}</td><td class="mono">${esc(x.id)}</td><td><b>${esc(x.customerName||"—")}</b><br><small>${esc(x.customerEmail||x.customerMobile||"")}</small></td><td><a href="${esc(dealerHref(partner))}"><b>${esc(name)}</b></a>${email?`<br><small>${esc(email)}</small>`:""}</td><td>${esc(x.productInterest||"—")}</td><td>${esc(x.targetSpecies||"—")}</td><td><span class="badge">${esc(stage)}</span></td><td><a class="btn light" href="${esc(emailHref(partner,"lead",x.id))}">Email dealer</a></td></tr>`;
  }).join("");
  return new HTMLRewriter()
    .on(".panel .table thead tr",{element(el){el.append("<th>Contact</th>",{html:true});}})
    .on(".panel .table tbody",{element(el){el.setInnerContent(rows,{html:true});}})
    .transform(responseValue);
}

async function decorateSupport(responseValue,env){
  const contentType=responseValue.headers.get("Content-Type")||"";
  if(responseValue.status!==200||!contentType.includes("text/html")) return responseValue;
  const support=await listAll(env,"support"); const findDealer=await dealerLookup(env);
  const rows=support.map(x=>{
    const account=findDealer(x.partnerId); const partner=accountPartner(account)||String(x.partnerId||"");
    const name=dealerName(account,String(x.partnerId||"—")); const email=dealerEmail(account);
    return `<tr><td>${esc(date(x.createdAt))}</td><td class="mono">${esc(x.id)}</td><td><a href="${esc(dealerHref(partner))}"><b>${esc(name)}</b></a>${email?`<br><small>${esc(email)}</small>`:""}</td><td>${esc(x.requestType||"—")}</td><td>${esc(x.customerReference||"—")}</td><td style="max-width:300px">${esc(x.details||"—")}</td><td><span class="badge">${esc(x.status||"Open")}</span></td><td><form method="post" action="${ROOT}/support/status" style="display:flex;gap:6px"><input type="hidden" name="partnerId" value="${esc(x.partnerId)}"><input type="hidden" name="id" value="${esc(x.id)}"><select name="status"><option ${x.status==="Open"?"selected":""}>Open</option><option ${x.status==="Waiting dealer"?"selected":""}>Waiting dealer</option><option ${x.status==="Resolved"?"selected":""}>Resolved</option></select><button class="btn" type="submit">Save</button></form></td><td><a class="btn light" href="${esc(emailHref(partner,"support",x.id))}">Email dealer</a></td></tr>`;
  }).join("");
  return new HTMLRewriter()
    .on(".panel .table thead tr",{element(el){el.append("<th>Contact</th>",{html:true});}})
    .on(".panel .table tbody",{element(el){el.setInnerContent(rows,{html:true});}})
    .transform(responseValue);
}

async function baseAdminPage(request,env,ctx){
  const u=new URL(request.url); u.pathname=`${ROOT}/dealers`; u.search="";
  return app.fetch(new Request(u.toString(),{method:"GET",headers:request.headers}),env,ctx);
}
function communicationStyles(){ return `<style>
.kzc-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}.kzc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;margin-top:18px;background:#d1d2ce;border:1px solid #d1d2ce}.kzc-cell{background:#fff;padding:18px}.kzc-cell small{display:block;color:#777;font-size:11px;text-transform:uppercase;letter-spacing:.06em}.kzc-cell b{display:block;margin-top:7px;font-size:14px;font-weight:500}.kzc-timeline{display:grid;margin-top:12px}.kzc-event{display:grid;grid-template-columns:160px 1fr;gap:18px;padding:16px 0;border-bottom:1px solid #ddd}.kzc-event small{color:#777}.kzc-email{max-width:900px}.kzc-email textarea{min-height:260px}.kzc-subject{margin-bottom:12px}.kzc-link{font-weight:600;text-decoration:underline;text-underline-offset:3px}@media(max-width:700px){.kzc-grid{grid-template-columns:1fr}.kzc-event{grid-template-columns:1fr;gap:5px}}
</style>`; }

async function dealerProfile(request,env,ctx){
  const url=new URL(request.url),partner=url.searchParams.get("partner")||""; const account=await accountFor(env,partner);
  if(!account)return response("Dealer not found",404);
  const canonical=accountPartner(account)||partner;
  const [leads,sales,allocations,support,comms]=await Promise.all([list(env,canonical,"referral"),list(env,canonical,"sale"),list(env,canonical,"allocation-request"),list(env,canonical,"support"),list(env,canonical,"dealer-communication")]);
  const base=await baseAdminPage(request,env,ctx); if(base.status!==200)return base;
  const name=dealerName(account,canonical),email=dealerEmail(account);
  const body=`<section class="hero"><div><p class="eyebrow">Dealer Profile</p><h1>${esc(name)}</h1><p>One KAIZURO record for this dealer, including commercial activity and communication history.</p><div class="kzc-actions">${email?`<a class="btn" href="${esc(emailHref(canonical,"dealer",""))}">Email dealer</a>`:""}<a class="btn light" href="${ROOT}/dealers">Back to dealers</a></div></div></section><div class="kzc-grid"><div class="kzc-cell"><small>Email</small><b>${esc(email||"—")}</b></div><div class="kzc-cell"><small>Partner ID</small><b>${esc(account.assignedPartnerId||account.partnerId||"—")}</b></div><div class="kzc-cell"><small>Dealer code</small><b>${esc(account.referralCode||account.partnerCode||"—")}</b></div><div class="kzc-cell"><small>Region</small><b>${esc(account.region||account.location||"—")}</b></div><div class="kzc-cell"><small>Leads</small><b>${leads.length}</b></div><div class="kzc-cell"><small>Orders</small><b>${sales.length}</b></div><div class="kzc-cell"><small>Allocation requests</small><b>${allocations.length}</b></div><div class="kzc-cell"><small>Support requests</small><b>${support.length}</b></div></div><section class="panel" style="margin-top:18px"><h2>Communications</h2><p>Emails sent from KAIZURO Admin are logged here automatically.</p>${comms.length?`<div class="kzc-timeline">${comms.map(c=>`<div class="kzc-event"><small>${esc(date(c.createdAt))}</small><div><b>${esc(c.subject||"Email")}</b><p>${esc(c.contextType||"dealer")}${c.contextRef?` · ${esc(c.contextRef)}`:""} · sent to ${esc(c.to||email)}</p></div></div>`).join("")}</div>`:`<div class="empty">No admin communications logged yet.</div>`}</section>`;
  return new HTMLRewriter().on("head",{element(el){el.append(communicationStyles(),{html:true});}}).on(".content",{element(el){el.setInnerContent(body,{html:true});}}).transform(base);
}

function defaults(context,ref,name){
  if(context==="lead") return {subject:`KAIZURO Lead Follow-up · ${ref}`,body:`Hi ${name},\n\nFollowing up regarding KAIZURO lead ${ref}.\n\n\nRegards,\nKAIZURO`};
  if(context==="support") return {subject:`KAIZURO Support · ${ref}`,body:`Hi ${name},\n\nFollowing up regarding KAIZURO support request ${ref}.\n\n\nRegards,\nKAIZURO`};
  if(context==="allocation") return {subject:`KAIZURO Allocation · ${ref}`,body:`Hi ${name},\n\nFollowing up regarding KAIZURO allocation request ${ref}.\n\n\nRegards,\nKAIZURO`};
  if(context==="order") return {subject:`KAIZURO Order · ${ref}`,body:`Hi ${name},\n\nFollowing up regarding KAIZURO order ${ref}.\n\n\nRegards,\nKAIZURO`};
  return {subject:"KAIZURO Dealer Update",body:`Hi ${name},\n\n\nRegards,\nKAIZURO`};
}
async function compose(request,env,ctx){
  const url=new URL(request.url),partner=url.searchParams.get("partner")||"",context=url.searchParams.get("context")||"dealer",ref=url.searchParams.get("ref")||""; const account=await accountFor(env,partner);
  if(!account)return response("Dealer not found",404); const email=dealerEmail(account); if(!email)return response("Dealer email not configured",400);
  const canonical=accountPartner(account)||partner,name=dealerName(account,canonical),d=defaults(context,ref,account.contactName||name); const sent=url.searchParams.get("sent")==="1";
  const base=await baseAdminPage(request,env,ctx); if(base.status!==200)return base;
  const body=`<section class="hero"><div><p class="eyebrow">Dealer Communications</p><h1>Email ${esc(name)}</h1><p>Send directly from KAIZURO Admin. Every sent email is saved to the dealer communication history.</p></div></section>${sent?`<div class="success"><b>Email sent.</b> The communication has been logged against ${esc(name)}.</div>`:""}<section class="panel kzc-email" style="margin-top:18px"><form class="form" method="post" action="${ROOT}/email/send"><input type="hidden" name="partner" value="${esc(canonical)}"><input type="hidden" name="context" value="${esc(context)}"><input type="hidden" name="ref" value="${esc(ref)}"><label>To<input value="${esc(email)}" disabled></label><label>Subject<input class="kzc-subject" name="subject" maxlength="180" required value="${esc(d.subject)}"></label><label>Message<textarea name="body" maxlength="10000" required>${esc(d.body)}</textarea></label><div class="kzc-actions"><button class="btn" type="submit">Send email</button><a class="btn light" href="${esc(dealerHref(canonical))}">Dealer profile</a></div></form></section>`;
  return new HTMLRewriter().on("head",{element(el){el.append(communicationStyles(),{html:true});}}).on(".content",{element(el){el.setInnerContent(body,{html:true});}}).transform(base);
}

async function sendEmail(request,env){
  if(!validOrigin(request))return response("Invalid request",403);
  const f=await request.formData(),partner=String(f.get("partner")||""),context=String(f.get("context")||"dealer").slice(0,40),ref=String(f.get("ref")||"").slice(0,160),subject=String(f.get("subject")||"").trim().slice(0,180),body=String(f.get("body")||"").trim().slice(0,10000);
  if(!subject||!body)return response("Subject and message are required",400);
  const account=await accountFor(env,partner); if(!account)return response("Dealer not found",404); const to=dealerEmail(account); if(!to||!to.includes("@"))return response("Dealer email not configured",400);
  if(!env.PARTNER_NOTIFICATIONS)return response("Email binding is not configured",503);
  await env.PARTNER_NOTIFICATIONS.send({to,from:{email:MAIL_FROM,name:"KAIZURO"},replyTo:MAIL_REPLY,subject,text:body});
  const canonical=accountPartner(account)||partner;
  await store(env).createSubmission({id:`KZCOM-${crypto.randomUUID().slice(0,10).toUpperCase()}`,type:"dealer-communication",partnerId:canonical,to,subject,body,contextType:context,contextRef:ref,createdAt:new Date().toISOString(),sentBy:"KAIZURO Admin"});
  return redirect(request,`${ROOT}/email?partner=${encodeURIComponent(canonical)}&context=${encodeURIComponent(context)}${ref?`&ref=${encodeURIComponent(ref)}`:""}&sent=1`);
}

export default {async fetch(request,env,ctx){
  const url=new URL(request.url),path=url.pathname.replace(/\/$/,"");
  if(url.hostname.toLowerCase()!==HOST)return app.fetch(request,env,ctx);
  if(path===`${ROOT}/email/send`&&request.method==="POST"){
    if(!await authenticated(request,env,ctx))return redirect(request,`${ROOT}/login`);
    try{return await sendEmail(request,env);}catch(error){console.error("KAIZURO admin dealer email failed",error?.code,error?.message,error);return response(`Email could not be sent: ${esc(error?.message||"Unknown email error")}`,502);}
  }
  if(path===`${ROOT}/dealer`&&request.method==="GET"){
    if(!await authenticated(request,env,ctx))return redirect(request,`${ROOT}/login`);
    return dealerProfile(request,env,ctx);
  }
  if(path===`${ROOT}/email`&&request.method==="GET"){
    if(!await authenticated(request,env,ctx))return redirect(request,`${ROOT}/login`);
    return compose(request,env,ctx);
  }
  const inner=await app.fetch(request,env,ctx);
  if(request.method==="GET"&&path===`${ROOT}/leads`)return decorateLeads(inner,env);
  if(request.method==="GET"&&path===`${ROOT}/support`)return decorateSupport(inner,env);
  return inner;
}};
