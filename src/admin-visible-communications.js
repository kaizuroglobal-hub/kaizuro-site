import app, { PartnerReferrals } from "./site-spacing.js";
export { PartnerReferrals };

const ROOT = "/kaizuro-admin";
const STORE_NAME = "kaizuro-partner-submissions";
const ADMIN_HOSTS = new Set(["kaizuro.com", "www.kaizuro.com", "portal.kaizuro.com"]);
const ADMIN_RENDER_VERSION = "2026-08-15-dealer-identity-v4";
const LEGACY_TEST_CODE = "kz-au-001";
const LEGACY_TEST_EMAIL = "w3protocol@proton.me";
const LEGACY_TEST_ACCOUNT = {
  partnerId: LEGACY_TEST_EMAIL,
  username: LEGACY_TEST_EMAIL,
  email: LEGACY_TEST_EMAIL,
  assignedPartnerId: "KZP-TEST-0001",
  dealerName: "KAIZURO Test Dealer",
  businessName: "KAIZURO Test Dealer",
  contactName: "Greg",
  status: "Active"
};

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const lower = (v) => String(v || "").trim().toLowerCase();
const date = (v) => { try { return new Date(v).toLocaleDateString("en-AU", { day:"numeric", month:"short", year:"numeric" }); } catch { return "—"; } };
function store(env){ return env.PARTNER_REFERRALS.get(env.PARTNER_REFERRALS.idFromName(STORE_NAME)); }
async function listAll(env,type){ try { return await store(env).listAll(type); } catch { return []; } }
function configuredAccounts(env){
  try {
    const raw=env.PARTNER_ACCOUNTS;
    if(!raw)return [];
    if(Array.isArray(raw))return raw;
    if(typeof raw==="object")return [raw];
    const parsed=JSON.parse(raw);
    return Array.isArray(parsed)?parsed:[parsed];
  } catch { return []; }
}
function looksLikeDealerCode(value){
  const v=String(value||"").trim();
  return /^KZ(?:P|TEST|[-_A-Z0-9])*$/i.test(v) || /^KZ-[A-Z]{2,}-\d+$/i.test(v);
}
function matches(account,value){
  const p=lower(value);
  if(!p)return false;
  return [account.partnerId,account.username,account.email,account.assignedPartnerId,account.referralCode,account.partnerCode,account.dealerCode,account.dealerName,account.businessName,account.contactName].some(v=>lower(v)===p);
}
function canonical(account,fallback){ return String(account?.partnerId||account?.username||account?.email||fallback||""); }
function dealerEmail(account){ return String(account?.email||account?.username||"").trim(); }
function dealerDisplayName(account,row){
  const candidates=[account?.businessName,account?.dealerName,account?.contactName,row?.partnerName];
  for(const value of candidates){
    const text=String(value||"").trim();
    if(text&&!looksLikeDealerCode(text))return text;
  }
  const email=dealerEmail(account);
  if(email)return email;
  return "Dealer account";
}
function dealerContactName(account){
  const value=String(account?.contactName||"").trim();
  return value&&!looksLikeDealerCode(value)?value:"";
}
function dealerHref(partner){ return `${ROOT}/dealer?partner=${encodeURIComponent(partner)}`; }
function emailHref(partner,context,ref){ return `${ROOT}/email?partner=${encodeURIComponent(partner)}&context=${encodeURIComponent(context)}${ref?`&ref=${encodeURIComponent(ref)}`:""}`; }

async function directory(env){
  const stored=await listAll(env,"account");
  const configured=configuredAccounts(env);
  const all=[...stored,...configured];
  const unique=[]; const seen=new Set();
  for(const account of all){
    const key=lower(account.email||account.username||account.partnerId||account.assignedPartnerId||account.contactName||account.businessName||account.dealerName);
    if(!key||seen.has(key))continue;
    seen.add(key); unique.push(account);
  }
  const active=unique.filter(a=>lower(a.status||"active")==="active");
  const single=active.length===1?active[0]:(unique.length===1?unique[0]:null);
  return { find(value){ return unique.find(a=>matches(a,value))||null; }, single };
}
function rowHasLegacyTestCode(row){
  return [row?.partnerId,row?.partnerCode,row?.partnerName].some(value=>lower(value)===LEGACY_TEST_CODE);
}
function resolveAccount(dir,row){
  if(rowHasLegacyTestCode(row)) return dir.find(LEGACY_TEST_EMAIL)||LEGACY_TEST_ACCOUNT;
  return dir.find(row.partnerId)||dir.find(row.partnerCode)||dir.find(row.partnerName)||dir.single||null;
}
function dealerCell(row,account,context,ref){
  const partner=canonical(account,row.partnerId||row.partnerCode||row.partnerName);
  const name=dealerDisplayName(account,row);
  const contact=dealerContactName(account);
  const email=dealerEmail(account);
  const code=String(row.partnerCode||account?.referralCode||account?.partnerCode||account?.assignedPartnerId||row.partnerId||"");
  const secondary=[contact&&contact!==name?contact:"",email,code].filter(Boolean);
  return {
    html:`<a class="kz-dealer-link" href="${esc(dealerHref(partner))}">${esc(name)}</a>${secondary.length?`<br><small>${secondary.map(esc).join(" · ")}</small>`:""}`,
    action:email?`<a class="btn light kz-email-dealer" href="${esc(emailHref(partner,context,ref))}">Email dealer</a>`:`<span class="kz-email-missing">Email unavailable</span>`
  };
}

async function leadsRows(env){
  const [leads,statuses]=await Promise.all([listAll(env,"referral"),listAll(env,"lead-status")]);
  const dir=await directory(env); const latest=new Map();
  for(const s of statuses){ const id=String(s.leadRef||s.leadId||""); if(id&&!latest.has(id))latest.set(id,s.status); }
  return leads.slice(0,500).map(x=>{
    const account=resolveAccount(dir,x); const dealer=dealerCell(x,account,"lead",x.id);
    const stage=latest.get(String(x.id))||x.status||"New";
    return `<tr><td>${esc(date(x.createdAt))}</td><td class="mono">${esc(x.id)}</td><td><b>${esc(x.customerName||"—")}</b><br><small>${esc(x.customerEmail||x.customerMobile||"")}</small></td><td>${dealer.html}</td><td>${esc(x.productInterest||"—")}</td><td>${esc(x.targetSpecies||"—")}</td><td><span class="badge">${esc(stage)}</span></td><td>${dealer.action}</td></tr>`;
  }).join("");
}

async function supportRows(env){
  const support=await listAll(env,"support"); const dir=await directory(env);
  return support.map(x=>{
    const account=resolveAccount(dir,x); const dealer=dealerCell(x,account,"support",x.id); const status=x.status||"Open";
    return `<tr><td>${esc(date(x.createdAt))}</td><td class="mono">${esc(x.id)}</td><td>${dealer.html}</td><td>${esc(x.requestType||"—")}</td><td>${esc(x.customerReference||"—")}</td><td style="max-width:300px">${esc(x.details||"—")}</td><td><span class="badge">${esc(status)}</span></td><td><form method="post" action="${ROOT}/support/status" style="display:flex;gap:6px"><input type="hidden" name="partnerId" value="${esc(x.partnerId)}"><input type="hidden" name="id" value="${esc(x.id)}"><select name="status"><option ${status==="Open"?"selected":""}>Open</option><option ${status==="Waiting dealer"?"selected":""}>Waiting dealer</option><option ${status==="Resolved"?"selected":""}>Resolved</option></select><button class="btn" type="submit">Save</button></form></td><td>${dealer.action}</td></tr>`;
  }).join("");
}

async function decorate(response,env,type){
  const ct=response.headers.get("Content-Type")||"";
  if(response.status!==200||!ct.includes("text/html"))return response;
  const rows=type==="leads"?await leadsRows(env):await supportRows(env);
  const transformed=new HTMLRewriter()
    .on("head",{element(el){el.append(`<meta name="kz-admin-render" content="${ADMIN_RENDER_VERSION}"><style id="kz-admin-communications-visible">.kz-dealer-link{font-weight:600;text-decoration:underline;text-underline-offset:3px}.kz-email-dealer{white-space:nowrap}.kz-email-missing{font-size:12px;color:#777}</style>`,{html:true});}})
    .on(".panel .table thead tr",{element(el){el.append("<th>Contact</th>",{html:true});}})
    .on(".panel .table tbody",{element(el){el.setInnerContent(rows,{html:true});}})
    .transform(response);
  const headers=new Headers(transformed.headers);
  headers.set("Cache-Control","no-store, no-cache, must-revalidate, max-age=0");
  headers.set("Pragma","no-cache");
  headers.set("Expires","0");
  headers.set("X-KAIZURO-Admin-Render",ADMIN_RENDER_VERSION);
  return new Response(transformed.body,{status:transformed.status,statusText:transformed.statusText,headers});
}

function rewriteLegacyDealerRequest(request){
  const url=new URL(request.url);
  const path=url.pathname.replace(/\/$/,"");
  if((path===`${ROOT}/dealer`||path===`${ROOT}/email`) && lower(url.searchParams.get("partner"))===LEGACY_TEST_CODE){
    url.searchParams.set("partner",LEGACY_TEST_EMAIL);
    return new Request(url.toString(),request);
  }
  return request;
}

export default { async fetch(request,env,ctx){
  const originalUrl=new URL(request.url);
  const host=originalUrl.hostname.toLowerCase();
  const effectiveRequest=ADMIN_HOSTS.has(host)?rewriteLegacyDealerRequest(request):request;
  const effectiveUrl=new URL(effectiveRequest.url);
  let response=await app.fetch(effectiveRequest,env,ctx);
  if(request.method!=="GET"||!ADMIN_HOSTS.has(host))return response;
  const path=effectiveUrl.pathname.replace(/\/$/,"");
  if(path===`${ROOT}/leads`)return decorate(response,env,"leads");
  if(path===`${ROOT}/support`)return decorate(response,env,"support");
  return response;
}};
