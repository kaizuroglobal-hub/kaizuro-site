import { PartnerReferrals } from "./admin-partner-referrals.js";

export { PartnerReferrals };

const PORTAL_HOST = "portal.kaizuro.com";
const ROOT = "/kaizuro-admin";
const LOGIN_PATH = ROOT + "/login";
const JE_ADMIN_ROOT = "/kaizuro-admin-je";
const JE_PATH = "/je-wilds";
const ADMIN_EMAIL = "kaizuroglobal@gmail.com";
const ADMIN_PASSWORD_SHA = "505606478ea56d72999fbc7f9d32dbb0d61d3423b0735e6d467c86f34a13cbf9";

const LOGIN_HTML = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>KAIZURO | Admin</title><style>:root{--bg:#ecece8;--ink:#101113;--muted:#73777a;--line:#d1d2ce;--card:#fff}*{box-sizing:border-box}html,body{margin:0;min-height:100%;font-family:Inter,Arial,sans-serif;background:var(--bg);color:var(--ink)}.login{width:min(480px,calc(100% - 30px));margin:10vh auto;padding:34px;background:var(--card);border:1px solid var(--line)}.brand{font-size:19px;font-weight:600;letter-spacing:.17em}.eyebrow{margin:8px 0 0;color:#777;font-size:9px;font-weight:800;letter-spacing:.15em;text-transform:uppercase}.login h1{margin:40px 0 0;font-size:42px;font-weight:300;line-height:.98;letter-spacing:-.05em}.login p{color:#777;font-size:12px;line-height:1.6}.notice{margin-top:16px;padding:13px 15px;border:1px solid #c9b06e;background:#f8f1de;color:#69521b;font-size:10px}.login label{display:grid;gap:7px;margin-top:15px;font-size:10px;font-weight:700}.login input{min-height:50px;padding:12px;border:1px solid #bbb;font:inherit}.login button{width:100%;min-height:50px;margin-top:18px;border:1px solid #111;background:#111;color:#fff;font:inherit;font-size:9px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}</style></head><body><main class="login"><div class="brand">KAIZURO</div><p class="eyebrow">Internal Admin</p><h1>Network control.</h1><p>Restricted KAIZURO access. Dealer credentials cannot access this area.</p><form method="post" action="/kaizuro-admin/login"><label>Email<input type="email" name="email" autocomplete="username" required></label><label>Password<input type="password" name="password" autocomplete="current-password" required></label><button type="submit">Sign in</button></form></main></body></html>`;

function loginPage(message="") {
  if (!message) return LOGIN_HTML;
  return LOGIN_HTML.replace("<form method=", `<div class="notice">${String(message).replace(/[&<>\"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;","'":"&#39;"}[c]))}</div><form method=`);
}

async function digest(value) {
  const data = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(data)].map(b=>b.toString(16).padStart(2,"0")).join("");
}

async function signSession(value, env) {
  const secret = String(env.PARTNER_SESSION_SECRET || "") + "|kaizuro-admin-v1";
  if (secret.length < 24) throw new Error("Admin session signing unavailable");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), {name:"HMAC",hash:"SHA-256"}, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return [...new Uint8Array(signature)].map(b=>b.toString(16).padStart(2,"0")).join("");
}

async function portalLogin(request, env) {
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) return htmlResponse(loginPage("Invalid sign-in request."),403);
  const form = await request.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  if (email !== ADMIN_EMAIL || await digest(password) !== ADMIN_PASSWORD_SHA) return htmlResponse(loginPage("Email or password is incorrect."),401);
  const expires = Date.now() + 8*60*60*1000;
  const body = `${ADMIN_EMAIL}|${expires}`;
  const cookie = encodeURIComponent(`${body}|${await signSession(body,env)}`);
  return new Response(null,{status:303,headers:{"Location":ROOT,"Set-Cookie":`kz_admin=${cookie}; Path=${ROOT}; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`,`Cache-Control":"no-store"}});
}

function htmlResponse(html,status=200) {
  return new Response(html,{status,headers:{"Content-Type":"text/html; charset=UTF-8","Cache-Control":"no-store, no-cache, must-revalidate","X-Robots-Tag":"noindex,nofollow,noarchive","X-KAIZURO-Portal":"v8-isolated-login"}});
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();
    const path = url.pathname.replace(/\/$/, "") || "/";

    if (host === PORTAL_HOST && (path === "/" || path === "/admin" || path === "/admin/login" || path === LOGIN_PATH)) {
      if (request.method === "GET") return htmlResponse(LOGIN_HTML);
      if (request.method === "POST" && path === LOGIN_PATH) return portalLogin(request, env);
      return new Response("Method not allowed",{status:405,headers:{Allow:"GET, POST"}});
    }

    if (host === PORTAL_HOST && (path === JE_ADMIN_ROOT || path.startsWith(`${JE_ADMIN_ROOT}/`))) {
      const { default: jeViewer } = await import("./je-admin-viewer.js");
      return jeViewer.fetch(request,env,ctx);
    }

    if (host === PORTAL_HOST && (path === `${ROOT}/partnerships` || path.startsWith(`${ROOT}/partnerships/`) || path === JE_PATH)) {
      const { default: partnerships } = await import("./admin-partnership-shell-v1.js");
      return partnerships.fetch(request,env,ctx);
    }

    if (host === PORTAL_HOST && (path === ROOT || path.startsWith(`${ROOT}/`))) {
      const { default: baseAdmin } = await import("./kaizuro-admin.js");
      return baseAdmin.fetch(request,env,ctx);
    }

    const { default: legacy } = await import("./public-host-seo-guard-v5.js");
    return legacy.fetch(request,env,ctx);
  },

  async email(message,env,ctx) {
    const { default: baseAdmin } = await import("./kaizuro-admin.js");
    if (typeof baseAdmin.email === "function") return baseAdmin.email(message,env,ctx);
    const { default: partnerships } = await import("./admin-partnership-shell-v1.js");
    if (typeof partnerships.email === "function") return partnerships.email(message,env,ctx);
    const { default: legacy } = await import("./public-host-seo-guard-v5.js");
    if (typeof legacy.email === "function") return legacy.email(message,env,ctx);
  },
};
