import { DurableObject } from "cloudflare:workers";

export class PartnerReferrals extends DurableObject {
  async listForPartner(partnerId, type) {
    const entries = await this.ctx.storage.list({ prefix: `${type}:${partnerId}:`, limit: 5000, reverse: true });
    return [...entries.values()].sort((a, b) => String(b?.createdAt || "").localeCompare(String(a?.createdAt || "")));
  }
  async listAll(type, limit = 5000) {
    const entries = await this.ctx.storage.list({ prefix: `${type}:`, reverse: true, limit });
    return [...entries.values()].sort((a, b) => String(b?.createdAt || "").localeCompare(String(a?.createdAt || "")));
  }
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/list") return Response.json(await this.listAll(url.searchParams.get("type") || "account"));
    return new Response("Not found", { status: 404 });
  }
}

const HOST = "portal.kaizuro.com";
const ROOT = "/kaizuro-admin";
const LOGIN = `${ROOT}/login`;
const JE_ROOT = "/kaizuro-admin-je";
const JE_PATH = "/je-wilds";
const ADMIN_EMAIL = "kaizuroglobal@gmail.com";
const ADMIN_PASSWORD_SHA = "505606478ea56d72999fbc7f9d32dbb0d61d3423b0735e6d467c86f34a13cbf9";

const PAGE = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>KAIZURO | Admin</title><style>body{margin:0;background:#ecece8;color:#101113;font-family:Inter,Arial,sans-serif}.login{width:min(480px,calc(100% - 30px));margin:10vh auto;padding:34px;background:#fff;border:1px solid #d1d2ce}.brand{font-size:19px;font-weight:600;letter-spacing:.17em}.eyebrow{margin:8px 0 0;color:#777;font-size:9px;font-weight:800;letter-spacing:.15em;text-transform:uppercase}.login h1{margin:40px 0 0;font-size:42px;font-weight:300;line-height:.98}.login p{color:#777;font-size:12px;line-height:1.6}.notice{margin-top:16px;padding:13px 15px;border:1px solid #c9b06e;background:#f8f1de;color:#69521b;font-size:10px}.login label{display:grid;gap:7px;margin-top:15px;font-size:10px;font-weight:700}.login input{min-height:50px;padding:12px;border:1px solid #bbb;font:inherit}.login button{width:100%;min-height:50px;margin-top:18px;border:1px solid #111;background:#111;color:#fff;font:inherit;font-size:9px;font-weight:800;text-transform:uppercase}</style></head><body><main class="login"><div class="brand">KAIZURO</div><p class="eyebrow">Internal Admin</p><h1>Network control.</h1><p>Restricted KAIZURO access. Dealer credentials cannot access this area.</p><form method="post" action="/kaizuro-admin/login"><label>Email<input type="email" name="email" autocomplete="username" required></label><label>Password<input type="password" name="password" autocomplete="current-password" required></label><button type="submit">Sign in</button></form></main></body></html>`;

function page(message="") {
  if (!message) return PAGE;
  const safe = String(message).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  return PAGE.replace("<form method=",`<div class="notice">${safe}</div><form method=`);
}
function html(value,status=200){return new Response(value,{status,headers:{"Content-Type":"text/html; charset=UTF-8","Cache-Control":"no-store, no-cache, must-revalidate","X-Robots-Tag":"noindex,nofollow,noarchive"}})}
async function sha(value){const d=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));return [...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,"0")).join("")}
async function sign(value,env){const secret=String(env.PARTNER_SESSION_SECRET||"")+"|kaizuro-admin-v1";if(secret.length<24)throw new Error("Admin session signing unavailable");const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);const sig=await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(value));return [...new Uint8Array(sig)].map(b=>b.toString(16).padStart(2,"0")).join("")}
async function hasValidAdminCookie(request,env){const c=(request.headers.get("Cookie")||"").split(";").map(v=>v.trim()).find(v=>v.startsWith("kz_admin="));if(!c)return false;try{const [email,exp,sig]=decodeURIComponent(c.split("=").slice(1).join("=")).split("|");if(String(email).trim().toLowerCase()!==ADMIN_EMAIL||Number(exp)<Date.now())return false;return sig===await sign(`${email}|${exp}`,env)}catch{return false}}
async function login(request,env){const origin=request.headers.get("Origin");if(origin&&origin!==new URL(request.url).origin)return html(page("Invalid sign-in request."),403);const f=await request.formData();const email=String(f.get("email")||"").trim().toLowerCase();const password=String(f.get("password")||"");if(email!==ADMIN_EMAIL||await sha(password)!==ADMIN_PASSWORD_SHA)return html(page("Email or password is incorrect."),401);try{const exp=Date.now()+8*60*60*1000;const body=`${ADMIN_EMAIL}|${exp}`;const value=encodeURIComponent(`${body}|${await sign(body,env)}`);return new Response(null,{status:303,headers:{"Location":ROOT,"Set-Cookie":`kz_admin=${value}; Path=${ROOT}; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`,"Cache-Control":"no-store"}})}catch{return html(page("Admin session signing is unavailable."),503)}}

export default {async fetch(request,env,ctx){const url=new URL(request.url);const host=url.hostname.toLowerCase();const path=url.pathname.replace(/\/$/,"")||"/";
  if(host===HOST&&(path==="/"||path==="/admin"||path==="/admin/login"||path===LOGIN)){if(request.method==="GET")return html(PAGE);if(request.method==="POST"&&path===LOGIN)return login(request,env);return new Response("Method not allowed",{status:405,headers:{Allow:"GET, POST"}})}
  if(host===HOST&&(path===JE_ROOT||path.startsWith(`${JE_ROOT}/`))){const {default:viewer}=await import("./je-admin-viewer.js");return viewer.fetch(request,env,ctx)}
  if(host===HOST&&(path===`${ROOT}/partnerships`||path.startsWith(`${ROOT}/partnerships/`)||path===JE_PATH)){const {default:partnerships}=await import("./admin-partnership-shell-v1.js");return partnerships.fetch(request,env,ctx)}
  if(host===HOST&&(path===ROOT||path.startsWith(`${ROOT}/`))){if(!(await hasValidAdminCookie(request,env)))return Response.redirect(new URL(LOGIN,request.url).toString(),302);const {default:admin}=await import("./kaizuro-admin.js");return admin.fetch(request,env,ctx)}
  const {default:legacy}=await import("./public-host-seo-guard-v5.js");return legacy.fetch(request,env,ctx)},
  async email(message,env,ctx){const {default:admin}=await import("./kaizuro-admin.js");if(typeof admin.email==="function")return admin.email(message,env,ctx);const {default:partnerships}=await import("./admin-partnership-shell-v1.js");if(typeof partnerships.email==="function")return partnerships.email(message,env,ctx);const {default:legacy}=await import("./public-host-seo-guard-v5.js");if(typeof legacy.email==="function")return legacy.email(message,env,ctx)}};
