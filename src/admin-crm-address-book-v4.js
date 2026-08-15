import app, { PartnerReferrals } from "./admin-crm-inbox-v4.js";
export { PartnerReferrals };

const ROOT="/kaizuro-admin", COMMS=`${ROOT}/communications`, STORE="kaizuro-partner-submissions";
const HOSTS=new Set(["kaizuro.com","www.kaizuro.com","portal.kaizuro.com"]);
const MAIL_FROM="notifications@portal.kaizuro.com", MAIL_REPLY="info@kaizuro.com";
const lower=v=>String(v||"").trim().toLowerCase();
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function db(env){return env.PARTNER_REFERRALS.get(env.PARTNER_REFERRALS.idFromName(STORE));}
async function all(env,t){try{return await db(env).listAll(t)}catch{return[]}}
async function save(env,r){return db(env).createSubmission({...r,createdAt:r.createdAt||new Date().toISOString()});}
function id(p){return `${p}-${Date.now().toString(36)}-${crypto.randomUUID().slice(0,8)}`;}
function emailAddress(v){const s=String(v||"").trim();const m=s.match(/<([^>]+@[^>]+)>/);return lower(m?m[1]:s.replace(/^mailto:/i,""));}
function validEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress(v));}
function validOrigin(r){const o=r.headers.get("Origin");return !o||o===new URL(r.url).origin;}
async function authed(r,env,ctx){const u=new URL(r.url);u.pathname=ROOT;u.search="";return (await app.fetch(new Request(u,{method:"GET",headers:r.headers}),env,ctx)).status===200;}
function normalizeSubject(v){return lower(String(v||"").replace(/^\s*((re|fw|fwd)\s*:\s*)+/ig,"").replace(/\s+/g," "));}
function threadKey(subject,email){return `${normalizeSubject(subject)||"(no subject)"}|${lower(email)}`;}
function accountKey(a){return String(a?.partnerId||a?.email||a?.username||"");}
function accountName(a){return a?.businessName||a?.dealerName||a?.contactName||a?.email||"Dealer";}
function customerKey(x){return lower(x.customerEmail||x.customerMobile||x.customerName||x.customer||x.email||x.mobile||x.name);}
function customerName(x){return x.customerName||x.customer||x.name||x.customerEmail||x.email||x.customerMobile||"Customer";}

async function addressData(env){const types=["account","referral","sale","crm-email","dealer-communication"];const d={};await Promise.all(types.map(async t=>d[t]=await all(env,t)));return d;}
function addressBook(d){
 const map=new Map();
 const add=(email,name,type,key,last="")=>{email=emailAddress(email);if(!validEmail(email)||email===lower(MAIL_FROM)||email===lower(MAIL_REPLY))return;const old=map.get(email)||{};map.set(email,{email,name:name||old.name||email,type:type||old.type||"Recent",key:key||old.key||email,last:String(last||old.last||"")>String(old.last||"")?String(last||""):String(old.last||"")});};
 for(const a of d.account)add(a.email||a.username,accountName(a),"Dealer",accountKey(a),a.createdAt);
 for(const x of [...d.referral,...d.sale])add(x.customerEmail,customerName(x),"Customer",customerKey(x)||x.customerEmail,x.createdAt);
 for(const x of d["crm-email"]){if(x.direction==="Inbound")add(x.from,x.entityName||x.from,x.entityType||"Recent",x.entityRef||x.from,x.createdAt);else add(x.to,x.entityName||x.to,x.entityType||"Recent",x.entityRef||x.to,x.createdAt);}
 for(const x of d["dealer-communication"])add(x.to,x.partnerName||x.to,"Dealer",x.partnerId||x.to,x.createdAt);
 return [...map.values()].sort((a,b)=>{const rank=t=>t==="Dealer"?0:t==="Customer"?1:2;return rank(a.type)-rank(b.type)||String(b.last).localeCompare(String(a.last))||a.name.localeCompare(b.name);});
}
function findEntity(book,email){const e=emailAddress(email),x=book.find(c=>c.email===e);return x||{email:e,name:e,type:"Contact",key:e};}
function unpackRecipient(raw){const s=String(raw||"").trim();if(s.includes("|")&&s.split("|").length>=3){const [type,key,...rest]=s.split("|");const email=emailAddress(rest.join("|"));return{type,key,email};}return{type:"",key:"",email:emailAddress(s)};}

const ADDR_CSS=`<style id="kz-crm-address-book-v4">.kz-recipient-wrap{display:grid;gap:5px}.kz-recipient-wrap input{width:100%;padding:9px;border:1px solid #bbb;background:#fff;font:inherit;font-size:13px}.kz-recipient-hint{font-size:10px;color:#777;font-weight:400;line-height:1.45}.kz-address-count{display:inline-block;margin-left:6px;font-size:10px;color:#777;font-weight:400}</style>`;
function datalist(book){return `<datalist id="kz-crm-addresses">${book.map(x=>`<option value="${esc(x.email)}" label="${esc(`${x.name} · ${x.type}`)}"></option>`).join("")}</datalist>`;}
async function decorateCompose(resp,env){const ct=resp.headers.get("Content-Type")||"";if(resp.status!==200||!ct.includes("text/html"))return resp;const book=addressBook(await addressData(env));return new HTMLRewriter()
 .on("head",{element(e){e.append(ADDR_CSS,{html:true})}})
 .on(`form[action="${COMMS}/email/send"] select[name="recipient"]`,{element(e){e.replace(`<div class="kz-recipient-wrap"><input type="email" name="recipient" list="kz-crm-addresses" autocomplete="email" placeholder="Start typing a name or email address" required>${datalist(book)}<div class="kz-recipient-hint">Searches ${book.length} remembered CRM address${book.length===1?"":"es"}: dealers, customers and previous email contacts. New addresses are remembered after use.</div></div>`,{html:true})}})
 .transform(resp);}

async function send(r,env,ctx){
 if(!validOrigin(r)||!(await authed(r,env,ctx)))return new Response("Unauthorized",{status:403});
 const f=await r.formData(),packed=unpackRecipient(f.get("recipient")),to=packed.email,subject=String(f.get("subject")||"").trim().slice(0,180),body=String(f.get("body")||"").trim().slice(0,20000);
 if(!validEmail(to))return new Response("A valid recipient email address is required",{status:400});
 if(!subject||!body)return new Response("Subject and message are required",{status:400});
 if(!env.PARTNER_NOTIFICATIONS)return new Response("Email binding is not configured",{status:503});
 const d=await addressData(env),entity=findEntity(addressBook(d),to),type=packed.type||entity.type||"Contact",key=packed.key||entity.key||to,name=entity.name||to,ref=id("KZMAIL"),createdAt=new Date().toISOString();
 await env.PARTNER_NOTIFICATIONS.send({to,from:{email:MAIL_FROM,name:"KAIZURO"},replyTo:MAIL_REPLY,subject,text:body});
 await save(env,{id:ref,type:"crm-email",direction:"Outbound",from:MAIL_FROM,to,subject,body,entityType:type,entityRef:key,entityName:name,threadKey:threadKey(subject,to),sentBy:"KAIZURO Admin",messageId:`<${ref}@portal.kaizuro.com>`,createdAt});
 await save(env,{id:id("KZCRM"),type:"crm-activity",channel:"Email",direction:"Outbound",entityType:type,entityRef:key,entityName:name,subject,notes:body,outcome:"Information sent",owner:"KAIZURO Admin",actor:"KAIZURO Admin",emailRef:ref,createdAt});
 await save(env,{id:id("KZAUD"),type:"admin-activity",partnerId:type==="Dealer"?key:"network",action:"CRM email sent",contextType:lower(type||"contact"),contextRef:key||to,details:`${to} · ${subject}`,actor:"KAIZURO Admin",createdAt});
 const u=new URL(`${COMMS}?view=sent`,r.url);u.searchParams.set("sent","1");return Response.redirect(u.toString(),303);
}

export default {
 async fetch(r,env,ctx){
  const u=new URL(r.url),path=u.pathname.replace(/\/$/,"");
  if(!HOSTS.has(u.hostname.toLowerCase()))return app.fetch(r,env,ctx);
  if(r.method==="POST"&&path===`${COMMS}/email/send`)return send(r,env,ctx);
  const resp=await app.fetch(r,env,ctx);
  if(r.method==="GET"&&(path===COMMS||path===`${COMMS}/email`))return decorateCompose(resp,env);
  return resp;
 },
 async email(message,env,ctx){if(typeof app.email==="function")return app.email(message,env,ctx);}
};