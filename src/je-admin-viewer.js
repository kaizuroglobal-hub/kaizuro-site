import admin from "./kaizuro-admin.js";

const HOST = "portal.kaizuro.com";
const ROOT = "/kaizuro-admin-je";
const ADMIN_ROOT = "/kaizuro-admin";
const VIEWER_USERNAME = "jewilds";
const VIEWER_PASSWORD_SHA = "4849ce0482febc102664480b5ef3c03295de1bf11860234eae42f91c2a39bcae";
const SESSION_TTL = 8 * 60 * 60;

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

async function digest(v) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v));
  return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, "0")).join("");
}

async function sign(v, env) {
  const secret = String(env.PARTNER_SESSION_SECRET || "") + "|kaizuro-je-viewer-v1";
  if (secret.length < 24) throw new Error("Viewer session signing unavailable");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(v));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, "0")).join("");
}

async function makeSession(env) {
  const exp = Date.now() + SESSION_TTL * 1000;
  const body = `${VIEWER_USERNAME}|${exp}`;
  return `${body}|${await sign(body, env)}`;
}

async function isViewer(request, env) {
  const cookie = (request.headers.get("Cookie") || "")
    .split(";")
    .map(v => v.trim())
    .find(v => v.startsWith("kz_je_viewer="));
  if (!cookie) return false;
  try {
    const [username, exp, sig] = decodeURIComponent(cookie.split("=").slice(1).join("=")).split("|");
    if (username !== VIEWER_USERNAME || !exp || Number(exp) < Date.now()) return false;
    return sig === await sign(`${username}|${exp}`, env);
  } catch {
    return false;
  }
}

function response(html, status = 200, headers = {}) {
  return new Response(html, { status, headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "no-store, no-cache, must-revalidate", "X-Robots-Tag": "noindex,nofollow,noarchive", ...headers } });
}

function redirect(request, path, status = 303) {
  return Response.redirect(new URL(path, request.url).toString(), status);
}

function redirectWithCookie(request, path, cookie) {
  return new Response(null, { status: 303, headers: { Location: new URL(path, request.url).toString(), "Set-Cookie": cookie, "Cache-Control": "no-store" } });
}

function loginPage(message = "") {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>KAIZURO | JE WILDS</title><style>html,body{margin:0;min-height:100%;font-family:Inter,Arial,sans-serif;background:#ecece8;color:#101113}.login{width:min(480px,calc(100% - 30px));margin:10vh auto;padding:34px;background:#fff;border:1px solid #d4d5d1}.brand{font-size:19px;font-weight:600;letter-spacing:.17em}.eyebrow{margin:8px 0 10px;color:#777;font-size:9px;font-weight:800;letter-spacing:.15em;text-transform:uppercase}.login h1{margin:40px 0 0;font-size:42px;font-weight:300;line-height:.98;letter-spacing:-.05em}.login p{color:#777;font-size:12px;line-height:1.6}.login label{display:grid;gap:7px;margin-top:15px;font-size:10px;font-weight:700}.login input{min-height:50px;padding:12px;border:1px solid #bbb;font:inherit}.login button{width:100%;min-height:50px;margin-top:18px;border:1px solid #111;background:#111;color:#fff;font:inherit;font-size:9px;font-weight:800;letter-spacing:.06em;text-transform:uppercase}.notice{margin-top:16px;padding:13px 15px;border:1px solid #c9b06e;background:#f8f1de;color:#69521b;font-size:10px;line-height:1.55}</style></head><body><main class="login"><div class="brand">KAIZURO</div><p class="eyebrow">JE WILDS · View Only</p><h1>Network control.</h1><p>Read-only access to the KAIZURO Admin Dashboard. Commercial controls and data-changing actions are disabled.</p>${message?`<div class="notice">${esc(message)}</div>`:""}<form method="post" action="${ROOT}/login"><label>Username<input type="text" name="username" autocomplete="username" required></label><label>Password<input type="password" name="password" autocomplete="current-password" required></label><button type="submit">Sign in</button></form></main></body></html>`;
}

async function login(request, env) {
  const form = await request.formData();
  const username = String(form.get("username") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  if (username !== VIEWER_USERNAME || await digest(password) !== VIEWER_PASSWORD_SHA) return response(loginPage("Username or password is incorrect."), 401);
  const cookie = encodeURIComponent(await makeSession(env));
  return redirectWithCookie(request, ROOT, `kz_je_viewer=${cookie}; Path=${ROOT}; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_TTL}`);
}

function stripControls(responseValue) {
  const type = responseValue.headers.get("Content-Type") || "";
  if (!type.includes("text/html") || responseValue.status !== 200) return responseValue;
  return new HTMLRewriter()
    .on("form[method=post]", { element(el) { el.replace('<span class="kz-view-only-badge">View only</span>', { html: true }); } })
    .on(".top", { element(el) { el.append('<span class="kz-view-only-label">JE WILDS · VIEW ONLY</span>', { html: true }); } })
    .on("head", { element(el) { el.append('<style>.kz-view-only-badge{display:inline-flex;align-items:center;min-height:30px;padding:0 10px;border:1px solid #d1d2ce;background:#f2f2ef;color:#777;font:800 8px Inter,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase}.kz-view-only-label{margin-left:auto;color:#785e1f;font:800 9px Inter,Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase}</style>', { html: true }); } })
    .transform(responseValue);
}

async function proxyViewer(request, env, ctx) {
  const url = new URL(request.url);
  const suffix = url.pathname.slice(ROOT.length);
  const target = new URL(`${ADMIN_ROOT}${suffix || ""}${url.search}`, request.url);
  const sessionExp = Date.now() + SESSION_TTL * 1000;
  const adminBody = `kaizuroglobal@gmail.com|${sessionExp}`;
  const adminSecret = String(env.PARTNER_SESSION_SECRET || "") + "|kaizuro-admin-v1";
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(adminSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = [...new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(adminBody)))].map(b => b.toString(16).padStart(2, "0")).join("");
  const adminCookie = encodeURIComponent(`${adminBody}|${sig}`);
  const headers = new Headers(request.headers);
  headers.set("Cookie", `kz_admin=${adminCookie}`);
  headers.set("Cache-Control", "no-store");
  const proxied = new Request(target.toString(), { method: "GET", headers, redirect: "manual" });
  return stripControls(await admin.fetch(proxied, env, ctx));
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.hostname.toLowerCase() !== HOST) return new Response("Not found", { status: 404 });

    if (url.pathname === `${ROOT}/login` && request.method === "GET") return response(loginPage());
    if (url.pathname === `${ROOT}/login` && request.method === "POST") return login(request, env);
    if (url.pathname === `${ROOT}/logout` && request.method === "GET") return redirectWithCookie(request, `${ROOT}/login`, `kz_je_viewer=; Path=${ROOT}; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);

    if (!url.pathname.startsWith(ROOT)) return new Response("Not found", { status: 404 });
    if (!await isViewer(request, env)) return redirect(request, `${ROOT}/login`, 302);
    if (request.method !== "GET") return response("This account is view-only. No changes can be made from this login.", 403);
    return proxyViewer(request, env, ctx);
  },
};
