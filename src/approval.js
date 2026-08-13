import app from "./submission-status.js";
export { PartnerReferrals } from "./submission-status.js";

const ORIGIN = "https://portal.kaizuro.com";
const HOST = "portal.kaizuro.com";
const TO = "info@kaizuro.com";
const FROM = "notifications@portal.kaizuro.com";
const STORE = "kaizuro-partner-submissions";
const TTL = 7 * 24 * 60 * 60 * 1000;

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fld = (f,n,m=500) => String(f.get(n)||"").trim().slice(0,m);
const now = () => new Date().toISOString();

function handle(env){
  if(!env.PARTNER_REFERRALS) throw new Error("Partner storage is not configured");
  return env.PARTNER_REFERRALS.get(env.PARTNER_REFERRALS.idFromName(STORE));
}
async function put(env,x){ return handle(env).createSubmission(x); }
async function latest(env,id,type){ const rows=await handle(env).listForPartner(id,type); return rows[0]||null; }

async function sha(v){const d=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v));return [...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,"0")).join("")}
async function sign(v,secret){
  if(!secret) throw new Error("PARTNER_SESSION_SECRET is not configured");
  const k=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const s=await crypto.subtle.sign("HMAC",k,new TextEncoder().encode(v));
  return [...new Uint8Array(s)].map(b=>b.toString(16).padStart(2,"0")).join("");
}
async function signedUrl(env,path,purpose,params,ttl=TTL){
  const exp=Date.now()+ttl;
  const body=Object.entries(params).map(([k,v])=>`${k}=${String(v)}`).join("&");
  const sig=await sign(`${purpose}|${body}|exp=${exp}`,env.PARTNER_SESSION_SECRET||"");
  const u=new URL(path,ORIGIN);Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,String(v)));u.searchParams.set("exp",String(exp));u.searchParams.set("sig",sig);return u.toString();
}
async function verify(env,url,purpose,keys){
  const exp=Number(url.searchParams.get("exp")||0), sig=url.searchParams.get("sig")||"";
  if(!exp||exp<Date.now()||!sig)return false;
  const params={};for(const k of keys){const v=url.searchParams.get(k);if(!v)return false;params[k]=v}
  const body=Object.entries(params).map(([k,v])=>`${k}=${String(v)}`).join("&");
  return (await sign(`${purpose}|${body}|exp=${exp}`,env.PARTNER_SESSION_SECRET||""))===sig;
}

function staticAccounts(env){try{const r=env.PARTNER_ACCOUNTS;if(!r)return[];if(Array.isArray(r))return r;if(typeof r==="object")return[r];const p=JSON.parse(r);return Array.isArray(p)?p:[p]}catch{return[]}}
function cookieUser(request){
  const c=(request.headers.get("Cookie")||"").split(";").map(v=>v.trim()).find(v=>v.startsWith("kz_partner="));if(!c)return"";
  try{return decodeURIComponent(c.split("=").slice(1).join("=")).split("|")[0]||""}catch{return""}
}
async function dyn(env,user){if(!user)return null;try{return await latest(env,user.toLowerCase(),"account")}catch{return null}}
function forApp(a){return {...a,partnerId:a.assignedPartnerId||a.partnerId,region:a.region||a.location||""}}
async function effectiveEnv(request,env){
  const a=await dyn(env,cookieUser(request));if(!a||a.status!=="Active"||!a.passwordHash)return env;
  const e=Object.create(env);Object.defineProperty(e,"PARTNER_ACCOUNTS",{value:[...staticAccounts(env),forApp(a)],enumerable:true});return e;
}
async function session(user,env){const exp=Date.now()+43200000,p=`${user}|${exp}`;return `${p}|${await sign(p,env.PARTNER_SESSION_SECRET||"")}`}

function html(title,body){return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>${esc(title)}</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"><style>*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:#f4f4f1;color:#111214;font-family:Inter,Arial,sans-serif}header{height:70px;display:flex;align-items:center;justify-content:space-between;padding:0 clamp(20px,5vw,70px);background:#050606;color:#fff}.brand{font-size:19px;font-weight:600;letter-spacing:.16em;text-decoration:none;color:#fff}.tag{font-size:10px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:#999}main{width:min(760px,calc(100% - 30px));margin:auto;padding:clamp(40px,7vw,80px) 0}.card{padding:clamp(24px,4vw,40px);border:1px solid #d7d8d6;background:#fff}.eyebrow{margin:0 0 12px;color:#777;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase}h1{margin:0 0 16px;font-size:clamp(34px,6vw,52px);font-weight:300;line-height:1.02;letter-spacing:-.04em}h2{margin:28px 0 10px;font-size:21px}.copy{color:#5d6266;font-size:14px;line-height:1.7}.details{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin:24px 0;background:#ddd}.detail{padding:14px;background:#fafaf8}.detail small{display:block;margin-bottom:5px;color:#777;font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.detail b{font-size:14px}.btn{display:flex;align-items:center;justify-content:center;min-height:54px;width:100%;padding:0 18px;border:1px solid #111;background:#111;color:#fff;text-decoration:none;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}.btn.danger{background:#8d3030;border-color:#8d3030}.success,.warn{padding:18px 20px;font-size:14px;line-height:1.6}.success{border:1px solid #7aaa84;background:#edf7ef;color:#17391f}.warn{border:1px solid #d2bd80;background:#fff9e8;color:#604f18}label{display:grid;gap:7px;margin-top:15px;font-size:11px;font-weight:600}input{min-height:52px;padding:12px;border:1px solid #bbb;font:inherit;font-size:16px}.actions{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:24px}@media(max-width:620px){.details,.actions{grid-template-columns:1fr}.card{padding:23px 18px}}</style></head><body><header><a class="brand" href="/">KAIZURO</a><span class="tag">Partner Portal</span></header><main>${body}</main></body></html>`}
const page=(title,body,status=200)=>new Response(html(title,body),{status,headers:{"Content-Type":"text/html; charset=UTF-8","Cache-Control":"no-store","X-Robots-Tag":"noindex,nofollow,noarchive"}});

function ref(){const d=new Date().toISOString().slice(0,10).replaceAll("-","");return `KZP-${d}-${crypto.randomUUID().replaceAll("-","").slice(0,8).toUpperCase()}`}
function code(r){return `KZ${r.replace(/[^A-Z0-9]/gi,"").slice(-8).toUpperCase()}`}

async function send(env,msg){if(!env.PARTNER_NOTIFICATIONS)throw new Error("Email binding is not configured");return env.PARTNER_NOTIFICATIONS.send(msg)}
async function emailRegistration(env,a){
  const approve=await signedUrl(env,"/admin/partner-review","approve",{ref:a.id,email:a.email});
  const decline=await signedUrl(env,"/admin/partner-review","decline",{ref:a.id,email:a.email});
  const text=["NEW KAIZURO PARTNER REGISTRATION","",`Reference: ${a.id}`,`Business: ${a.businessName}`,`Contact: ${a.contactName}`,`Email: ${a.email}`,`Mobile: ${a.mobile}`,`Partner type: ${a.partnerType}`,`Location: ${a.location}`,`Website / social: ${a.website||"—"}`,"","Why KAIZURO fits:",a.notes||"—","",`APPROVE: ${approve}`,`DECLINE: ${decline}`].join("\n");
  const h=`<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#111"><p style="font-size:11px;letter-spacing:.12em;color:#777">KAIZURO PARTNER PORTAL</p><h1 style="font-size:28px">New partner registration</h1><p><b>${esc(a.businessName)}</b> · ${esc(a.partnerType)}</p><p style="line-height:1.7">Contact: ${esc(a.contactName)}<br>Email: ${esc(a.email)}<br>Mobile: ${esc(a.mobile)}<br>Location: ${esc(a.location)}<br>Website / social: ${esc(a.website||"—")}<br>Reference: ${esc(a.id)}</p><div style="padding:16px;background:#f3f3f1;line-height:1.6"><b>Why KAIZURO fits</b><br>${esc(a.notes||"—")}</div><p style="margin:28px 0"><a href="${esc(approve)}" style="display:inline-block;padding:15px 22px;background:#111;color:#fff;text-decoration:none;font-size:12px;font-weight:bold">APPROVE PARTNER</a>&nbsp;&nbsp;<a href="${esc(decline)}" style="display:inline-block;padding:14px 22px;border:1px solid #933;color:#933;text-decoration:none;font-size:12px;font-weight:bold">DECLINE</a></p><p style="font-size:11px;color:#777">Each button opens a signed confirmation page so email security scanners cannot approve a partner accidentally.</p></div>`;
  return send(env,{to:TO,from:{email:FROM,name:"KAIZURO Partner Portal"},replyTo:a.email,subject:`KAIZURO Partner Registration · ${a.businessName} · ${a.id}`,html:h,text});
}

async function register(request,env){
  const origin=request.headers.get("Origin");if(origin&&origin!==new URL(request.url).origin)return page("Registration error",`<section class="card"><h1>Registration rejected.</h1></section>`,403);
  const f=await request.formData();if(fld(f,"companyFax",100))return page("Registration submitted",`<section class="card"><h1>Registration submitted.</h1></section>`);
  const a={id:ref(),type:"application",partnerId:fld(f,"email",254).toLowerCase(),businessName:fld(f,"businessName",140),contactName:fld(f,"contactName",140),email:fld(f,"email",254).toLowerCase(),mobile:fld(f,"mobile",60),partnerType:fld(f,"partnerType",80),location:fld(f,"location",140),website:fld(f,"website",300),notes:fld(f,"notes",2000),status:"Pending review",createdAt:now()};
  if(!a.businessName||!a.contactName||!a.email||!a.mobile||!a.partnerType||!a.location||!a.notes||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email))return page("Registration error",`<section class="card"><h1>Check your registration.</h1><p class="warn">Please complete all required fields and enter a valid email address.</p><div class="actions"><a class="btn" href="/">Back to registration</a></div></section>`,400);
  try{await put(env,a);await emailRegistration(env,a)}catch(e){console.error("Partner registration failed",e);return page("Registration issue",`<section class="card"><h1>We saved your details but hit an email issue.</h1><p class="warn">Reference: <b>${esc(a.id)}</b>. Please email info@kaizuro.com with this reference.</p></section>`,502)}
  return page("Registration submitted",`<section class="card"><p class="eyebrow">KAIZURO Partner Network</p><h1>Registration submitted.</h1><div class="success">We have received your application.<br><b>Reference: ${esc(a.id)}</b></div><p class="copy">KAIZURO will review your application. If approved, you will receive an email with a secure link to create your own password and activate the Partner Portal.</p><div class="actions"><a class="btn" href="/">Done</a></div></section>`);
}

async function review(request,env){
  const u=new URL(request.url);
  const okApprove=await verify(env,u,"approve",["ref","email"]),okDecline=okApprove?false:await verify(env,u,"decline",["ref","email"]);
  if(!okApprove&&!okDecline)return page("Review link expired",`<section class="card"><h1>Review link unavailable.</h1><p class="warn">This signed link is invalid or expired. Use the latest registration email.</p></section>`,403);
  const action=okApprove?"approve":"decline",email=(u.searchParams.get("email")||"").toLowerCase(),r=u.searchParams.get("ref")||"";
  const a=await latest(env,email,"application");if(!a||a.id!==r)return page("Application not found",`<section class="card"><h1>Application not found.</h1></section>`,404);
  if(request.method==="GET"){
    const q=esc(u.searchParams.toString()),verb=action==="approve"?"Approve":"Decline",cls=action==="approve"?"btn":"btn danger";
    return page(`${verb} partner`,`<section class="card"><p class="eyebrow">KAIZURO Partner Approval</p><h1>${verb} this partner?</h1><div class="details"><div class="detail"><small>Business</small><b>${esc(a.businessName)}</b></div><div class="detail"><small>Partner type</small><b>${esc(a.partnerType)}</b></div><div class="detail"><small>Contact</small><b>${esc(a.contactName)}</b></div><div class="detail"><small>Email</small><b>${esc(a.email)}</b></div><div class="detail"><small>Location</small><b>${esc(a.location)}</b></div><div class="detail"><small>Reference</small><b>${esc(a.id)}</b></div></div><h2>Application notes</h2><p class="copy">${esc(a.notes||"—")}</p><form method="post" action="/admin/partner-review?${q}"><button class="${cls}" type="submit">Confirm ${verb.toLowerCase()}</button></form><p class="copy" style="font-size:11px">No decision is applied until you press confirm.</p></section>`)
  }
  if(request.method!=="POST")return new Response("Method not allowed",{status:405});
  return action==="approve"?approve(env,a):decline(env,a);
}

async function applicant(env,to,subject,h,text){return send(env,{to,from:{email:FROM,name:"KAIZURO Partner Portal"},replyTo:TO,subject,html:h,text})}
async function approve(env,a){
  const email=a.email.toLowerCase();let old=await dyn(env,email);
  if(old?.status==="Active"&&old.passwordHash)return page("Already active",`<section class="card"><h1>Partner already active.</h1><div class="success">${esc(a.businessName)} already has an active portal account.</div></section>`);
  const nonce=crypto.randomUUID().replaceAll("-",""),pid=old?.assignedPartnerId||a.id,rc=old?.referralCode||code(a.id),t=now();
  const acct={...(old||{}),id:`account-${a.id}`,type:"account",partnerId:email,assignedPartnerId:pid,username:email,dealerName:a.businessName,contactName:a.contactName,email,mobile:a.mobile,partnerType:a.partnerType,location:a.location,region:a.location,website:a.website||"",referralCode:rc,status:"Approved - activation pending",passwordHash:"",salt:"",activationNonce:nonce,applicationRef:a.id,approvedAt:t,createdAt:t};
  await put(env,acct);await put(env,{...a,partnerId:email,status:"Approved",reviewedAt:t,createdAt:t});
  const link=await signedUrl(env,"/activate","activate",{ref:a.id,email,nonce});
  const h=`<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#111"><p style="font-size:11px;letter-spacing:.12em;color:#777">KAIZURO PARTNER NETWORK</p><h1 style="font-size:30px">Welcome to KAIZURO.</h1><p>Your application for <b>${esc(a.businessName)}</b> has been approved.</p><p style="line-height:1.7">Partner ID: <b>${esc(pid)}</b><br>Partner code: <b>${esc(rc)}</b><br>Login email: <b>${esc(email)}</b></p><p style="margin:30px 0"><a href="${esc(link)}" style="display:inline-block;padding:16px 24px;background:#111;color:#fff;text-decoration:none;font-size:12px;font-weight:bold">SET PASSWORD & ACTIVATE PORTAL</a></p><p style="font-size:11px;color:#777">This secure link expires in 7 days.</p></div>`;
  const text=`Welcome to the KAIZURO Partner Network.\n\nYour application has been approved.\nPartner ID: ${pid}\nPartner code: ${rc}\nLogin email: ${email}\n\nSet your password and activate the portal: ${link}\n\nThis link expires in 7 days.`;
  try{await applicant(env,email,"KAIZURO Partner Approved · Activate Your Portal",h,text)}catch(e){console.error("Approval email failed",e);return page("Approved - email failed",`<section class="card"><h1>Approved, but email failed.</h1><p class="warn">The account was created. Confirm approval again from the application email to generate and resend a fresh activation link.</p></section>`,502)}
  return page("Partner approved",`<section class="card"><p class="eyebrow">KAIZURO Partner Approval</p><h1>Partner approved.</h1><div class="success"><b>${esc(a.businessName)}</b> has been approved and the activation email has been sent to <b>${esc(email)}</b>.</div><div class="details"><div class="detail"><small>Partner ID</small><b>${esc(pid)}</b></div><div class="detail"><small>Partner code</small><b>${esc(rc)}</b></div></div><p class="copy">They now create their own password. No manual credential setup is required.</p></section>`)
}

async function decline(env,a){
  const t=now();await put(env,{...a,partnerId:a.email.toLowerCase(),status:"Declined",reviewedAt:t,createdAt:t});
  const h=`<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#111"><p style="font-size:11px;letter-spacing:.12em;color:#777">KAIZURO PARTNER NETWORK</p><h1>Partner application update</h1><p>Thank you for your interest in KAIZURO.</p><p>After reviewing the application for <b>${esc(a.businessName)}</b>, we are not proceeding with Partner Portal access at this time.</p><p>You are welcome to contact info@kaizuro.com if circumstances change.</p></div>`;
  try{await applicant(env,a.email,"KAIZURO Partner Application Update",h,`Thank you for your interest in KAIZURO. After reviewing the application for ${a.businessName}, we are not proceeding with Partner Portal access at this time.`)}catch(e){console.error("Decline email failed",e)}
  return page("Application declined",`<section class="card"><h1>Application declined.</h1><div class="success">${esc(a.businessName)} has been marked declined.</div></section>`)
}

async function activate(request,env){
  const u=new URL(request.url);if(!(await verify(env,u,"activate",["ref","email","nonce"])))return page("Activation link expired",`<section class="card"><h1>Activation link unavailable.</h1><p class="warn">This link is invalid or expired. Contact info@kaizuro.com for a fresh activation link.</p></section>`,403);
  const email=(u.searchParams.get("email")||"").toLowerCase(),nonce=u.searchParams.get("nonce")||"",r=u.searchParams.get("ref")||"";const a=await dyn(env,email);
  if(!a||a.applicationRef!==r||a.activationNonce!==nonce||a.status!=="Approved - activation pending"){
    if(a?.status==="Active")return page("Already active",`<section class="card"><h1>Your account is already active.</h1><p class="copy">Sign in with ${esc(email)} and your KAIZURO password.</p><div class="actions"><a class="btn" href="/">Go to sign in</a></div></section>`);
    return page("Activation unavailable",`<section class="card"><h1>Activation unavailable.</h1></section>`,409)
  }
  if(request.method==="GET")return page("Set your password",`<section class="card"><p class="eyebrow">KAIZURO Partner Portal</p><h1>Create your password.</h1><p class="copy">Your application is approved. Create your password to activate portal access.</p><div class="details"><div class="detail"><small>Partner</small><b>${esc(a.dealerName)}</b></div><div class="detail"><small>Partner ID</small><b>${esc(a.assignedPartnerId)}</b></div><div class="detail"><small>Login email</small><b>${esc(email)}</b></div><div class="detail"><small>Partner code</small><b>${esc(a.referralCode)}</b></div></div><form method="post" action="/activate?${esc(u.searchParams.toString())}"><label>Password<input type="password" name="password" minlength="10" autocomplete="new-password" required></label><label>Confirm password<input type="password" name="confirmPassword" minlength="10" autocomplete="new-password" required></label><div class="actions"><button class="btn" type="submit">Activate partner portal</button></div><p class="copy" style="font-size:11px">Use at least 10 characters.</p></form></section>`);
  if(request.method!=="POST")return new Response("Method not allowed",{status:405});
  const f=await request.formData(),p=fld(f,"password",300),c=fld(f,"confirmPassword",300);if(p.length<10||p!==c)return page("Password not accepted",`<section class="card"><h1>Password not accepted.</h1><p class="warn">Passwords must match and contain at least 10 characters. Return to the activation email and try again.</p></section>`,400);
  const salt=crypto.randomUUID().replaceAll("-",""),passwordHash=await sha(`${salt}:${p}`),t=now();await put(env,{...a,partnerId:email,status:"Active",salt,passwordHash,activationNonce:"",passwordSetAt:t,createdAt:t});
  try{await applicant(env,email,"KAIZURO Partner Portal Is Active",`<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto"><h1>Your KAIZURO portal is active.</h1><p>Sign in at <b>portal.kaizuro.com</b> using <b>${esc(email)}</b> and the password you just created.</p></div>`,`Your KAIZURO Partner Portal is active. Sign in at ${ORIGIN} using ${email} and the password you just created.`)}catch(e){console.error("Activation confirmation failed",e)}
  return page("Portal activated",`<section class="card"><h1>Portal activated.</h1><div class="success">Your KAIZURO partner account is active.</div><p class="copy">Sign in using <b>${esc(email)}</b> and the password you just created.</p><div class="actions"><a class="btn" href="/">Sign in to partner portal</a></div></section>`)
}

async function dynamicLogin(request,env){
  const f=await request.clone().formData(),user=fld(f,"username",254).toLowerCase(),password=fld(f,"password",300),a=await dyn(env,user);if(!a)return null;
  if(a.status!=="Active"||!a.passwordHash||!a.salt)return page("Account not activated",`<section class="card"><h1>Account not activated.</h1><p class="warn">Your application may be approved, but you still need to use the activation email to create your password.</p><div class="actions"><a class="btn" href="/">Back</a></div></section>`,401);
  if((await sha(`${a.salt}:${password}`))!==a.passwordHash)return page("Sign in failed",`<section class="card"><h1>Sign in failed.</h1><p class="warn">Invalid email / username or password.</p><div class="actions"><a class="btn" href="/">Try again</a></div></section>`,401);
  const s=await session(user,env);return new Response(null,{status:302,headers:{Location:"/partners/portal","Set-Cookie":`kz_partner=${encodeURIComponent(s)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`,"Cache-Control":"no-store"}})
}

export default{async fetch(request,env,ctx){
  const u=new URL(request.url),portal=u.hostname.toLowerCase()===HOST;
  if(portal&&u.pathname==="/partners/register"&&request.method==="POST")return register(request,env);
  if(portal&&u.pathname==="/admin/partner-review")return review(request,env);
  if(portal&&u.pathname==="/activate")return activate(request,env);
  if(portal&&u.pathname==="/partners/login"&&request.method==="POST"){
    const d=await dynamicLogin(request,env);if(d)return d;return app.fetch(request,env,ctx);
  }
  return app.fetch(request,await effectiveEnv(request,env),ctx);
}};
