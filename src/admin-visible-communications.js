import app, { PartnerReferrals } from "./site-spacing.js";
export { PartnerReferrals };

const ROOT = "/kaizuro-admin";
const STORE_NAME = "kaizuro-partner-submissions";
const PUBLIC_HOSTS = new Set(["kaizuro.com", "www.kaizuro.com"]);

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const lower = (v) => String(v || "").trim().toLowerCase();
const date = (v) => { try { return new Date(v).toLocaleDateString("en-AU", { day:"numeric", month:"short", year:"numeric" }); } catch { return "—"; } };
function store(env){ return env.PARTNER_REFERRALS.get(env.PARTNER_REFERRALS.idFromName(STORE_NAME)); }
async function listAll(env,type){ try { return await store(env).listAll(type); } catch { return []; } }
function matches(account, value){ const p=lower(value); return [account.partnerId,account.username,account.email,account.assignedPartnerId,account.referralCode,account.partnerCode].some(v=>lower(v)===p); }
function canonical(account,fallback){ return String(account?.partnerId||account?.username||account?.email||fallback||""); }
function dealerName(account,fallback){ return account?.dealerName||account?.businessName||account?.contactName||account?.email||fallback||"—"; }
function dealerEmail(account){ return String(account?.email||account?.username||"").trim(); }
function dealerHref(partner){ return `${ROOT}/dealer?partner=${encodeURIComponent(partner)}`; }
function emailHref(partner,context,ref){ return `${ROOT}/email?partner=${encodeURIComponent(partner)}&context=${encodeURIComponent(context)}${ref?`&ref=${encodeURIComponent(ref)}`:""}`; }

async function lookup(env){ const accounts=await listAll(env,"account"); return (value)=>accounts.find(a=>matches(a,value))||null; }

async function leadsRows(env){
  const [leads,statuses]=await Promise.all([listAll(env,"referral"),listAll(env,"lead-status")]);
  const find=await lookup(env); const latest=new Map();
  for(const s of statuses){ const id=String(s.leadRef||s.leadId||""); if(id&&!latest.has(id)) latest.set(id,s.status); }
  return leads.slice(0,500).map(x=>{ const account=find(x.partnerId); const partner=canonical(account,x.partnerId); const name=dealerName(account,x.partnerId); const email=dealerEmail(account); const stage=latest.get(String(x.id))||x.status||"New"; return `<tr><td>${esc(date(x.createdAt))}</td><td class="mono">${esc(x.id)}</td><td><b>${esc(x.customerName||"—")}</b><br><small>${esc(x.customerEmail||x.customerMobile||"")}</small></td><td><a class="kz-dealer-link" href="${esc(dealerHref(partner))}">${esc(name)}</a>${email?`<br><small>${esc(email)}</small>`:""}</td><td>${esc(x.productInterest||"—")}</td><td>${esc(x.targetSpecies||"—")}</td><td><span class="badge">${esc(stage)}</span></td><td><a class="btn light kz-email-dealer" href="${esc(emailHref(partner,"lead",x.id))}">Email dealer</a></td></tr>`; }).join("");
}

async function supportRows(env){
  const support=await listAll(env,"support"); const find=await lookup(env);
  return support.map(x=>{ const account=find(x.partnerId); const partner=canonical(account,x.partnerId); const name=dealerName(account,x.partnerId); const email=dealerEmail(account); const status=x.status||"Open"; return `<tr><td>${esc(date(x.createdAt))}</td><td class="mono">${esc(x.id)}</td><td><a class="kz-dealer-link" href="${esc(dealerHref(partner))}">${esc(name)}</a>${email?`<br><small>${esc(email)}</small>`:""}</td><td>${esc(x.requestType||"—")}</td><td>${esc(x.customerReference||"—")}</td><td style="max-width:300px">${esc(x.details||"—")}</td><td><span class="badge">${esc(status)}</span></td><td><form method="post" action="${ROOT}/support/status" style="display:flex;gap:6px"><input type="hidden" name="partnerId" value="${esc(x.partnerId)}"><input type="hidden" name="id" value="${esc(x.id)}"><select name="status"><option ${status==="Open"?"selected":""}>Open</option><option ${status==="Waiting dealer"?"selected":""}>Waiting dealer</option><option ${status==="Resolved"?"selected":""}>Resolved</option></select><button class="btn" type="submit">Save</button></form></td><td><a class="btn light kz-email-dealer" href="${esc(emailHref(partner,"support",x.id))}">Email dealer</a></td></tr>`; }).join("");
}

async function decorate(response,env,type){
  const ct=response.headers.get("Content-Type")||""; if(response.status!==200||!ct.includes("text/html")) return response;
  const rows=type==="leads"?await leadsRows(env):await supportRows(env);
  const contactHeader="<th>Contact</th>";
  return new HTMLRewriter()
    .on("head",{element(el){el.append(`<style id="kz-admin-communications-visible">.kz-dealer-link{font-weight:600;text-decoration:underline;text-underline-offset:3px}.kz-email-dealer{white-space:nowrap}</style>`,{html:true});}})
    .on(".panel .table thead tr",{element(el){el.append(contactHeader,{html:true});}})
    .on(".panel .table tbody",{element(el){el.setInnerContent(rows,{html:true});}})
    .transform(response);
}

export default { async fetch(request,env,ctx){
  const url=new URL(request.url); let response=await app.fetch(request,env,ctx);
  if(request.method!=="GET"||!PUBLIC_HOSTS.has(url.hostname.toLowerCase())) return response;
  if(url.pathname.replace(/\/$/,"")===`${ROOT}/leads`) return decorate(response,env,"leads");
  if(url.pathname.replace(/\/$/,"")===`${ROOT}/support`) return decorate(response,env,"support");
  return response;
}};
