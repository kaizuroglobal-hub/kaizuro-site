import app from "./dealer-leads.js";
export { PartnerReferrals } from "./dealer-leads.js";

const HOST = "portal.kaizuro.com";
const STORE = "kaizuro-partner-submissions";
const TEST_EMAIL = "w3protocol@proton.me";
const TEST_TOKEN_HASH = "1feb9872467b3980fd0c0185d2820078f6809a1e44a1dd72059fe2ec209b2835";
const TEST_SALT = "5569b45ae6ea7f157b712fb648d827ad";
const TEST_PASSWORD_HASH = "bf0d8f40a94572fa5d1c5eaf190b93f8feca853c6ccdc817703abe5b68977086";

async function sha(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(value || "")));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sign(value, secret) {
  if (!secret) throw new Error("PARTNER_SESSION_SECRET is not configured");
  const key = await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{ name: "HMAC", hash: "SHA-256" },false,["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function handle(env) {
  if (!env.PARTNER_REFERRALS) throw new Error("Partner storage is not configured");
  const id = env.PARTNER_REFERRALS.idFromName(STORE);
  return env.PARTNER_REFERRALS.get(id);
}

async function latestAccount(env) {
  const rows = await handle(env).listForPartner(TEST_EMAIL, "account");
  return rows[0] || null;
}

async function sessionCookie(env) {
  const exp = Date.now() + 12 * 60 * 60 * 1000;
  const payload = `${TEST_EMAIL}|${exp}`;
  const signature = await sign(payload, env.PARTNER_SESSION_SECRET || "");
  const value = encodeURIComponent(`${payload}|${signature}`);
  return `kz_partner=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`;
}

async function bootstrap(request, env) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  if (!token || (await sha(token)) !== TEST_TOKEN_HASH) {
    return new Response("Bootstrap link unavailable.", { status: 403, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex,nofollow,noarchive" } });
  }
  const existing = await latestAccount(env);
  if (existing?.bootstrapComplete) {
    return new Response("Bootstrap link has already been used.", { status: 410, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex,nofollow,noarchive" } });
  }
  const createdAt = new Date().toISOString();
  const account = {
    ...(existing || {}), id: existing?.id || "account-kz-test-dealer", type: "account", partnerId: TEST_EMAIL,
    assignedPartnerId: existing?.assignedPartnerId || "KZP-TEST-0001", username: TEST_EMAIL,
    dealerName: existing?.dealerName || "KAIZURO Test Dealer", contactName: existing?.contactName || "Greg", email: TEST_EMAIL,
    mobile: existing?.mobile || "", partnerType: existing?.partnerType || "Dealer", location: existing?.location || "Australia",
    region: existing?.region || "Australia", website: existing?.website || "", referralCode: existing?.referralCode || "KZTEST01",
    status: "Active", salt: TEST_SALT, passwordHash: TEST_PASSWORD_HASH, activationNonce: "", tempPasswordHash: "",
    tempPasswordSalt: "", tempPasswordExpiresAt: "", resetNonce: "", passwordSetAt: createdAt, bootstrapComplete: true, createdAt,
  };
  await handle(env).createSubmission(account);
  return new Response(null,{status:302,headers:{Location:"/partners/portal","Set-Cookie":await sessionCookie(env),"Cache-Control":"no-store","X-Robots-Tag":"noindex,nofollow,noarchive"}});
}

export default { async fetch(request, env, ctx) {
  const url = new URL(request.url);
  if (request.method === "GET" && url.hostname.toLowerCase() === HOST && url.pathname === "/admin/test-dealer-bootstrap") return bootstrap(request, env);
  return app.fetch(request, env, ctx);
}};
