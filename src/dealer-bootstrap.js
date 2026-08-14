import app from "./portal-copy.js";
export { PartnerReferrals } from "./portal-copy.js";

const HOST = "portal.kaizuro.com";
const STORE = "kaizuro-partner-submissions";
const TEST_EMAIL = "w3protocol@proton.me";
const TEST_TOKEN_HASH = "eabdea971484829c2104b99db9506c48fe468f752ae2647b2b69a3063ef902f0";
const TEST_SALT = "a048de99bf14904acc7becff6138c399";
const TEST_PASSWORD_HASH = "29ce5faebacdd13bd5b2766307322000064d346a15ff4d8ac39baecb2763f0e9";

async function sha(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(value || "")));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sign(value, secret) {
  if (!secret) throw new Error("PARTNER_SESSION_SECRET is not configured");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
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
    return new Response("Bootstrap link unavailable.", {
      status: 403,
      headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex,nofollow,noarchive" },
    });
  }

  const existing = await latestAccount(env);
  const createdAt = new Date().toISOString();
  const account = {
    ...(existing || {}),
    id: existing?.id || "account-kz-test-dealer",
    type: "account",
    partnerId: TEST_EMAIL,
    assignedPartnerId: existing?.assignedPartnerId || "KZP-TEST-0001",
    username: TEST_EMAIL,
    dealerName: existing?.dealerName || "KAIZURO Test Dealer",
    contactName: existing?.contactName || "Greg",
    email: TEST_EMAIL,
    mobile: existing?.mobile || "",
    partnerType: existing?.partnerType || "Dealer",
    location: existing?.location || "Australia",
    region: existing?.region || "Australia",
    website: existing?.website || "",
    referralCode: existing?.referralCode || "KZTEST01",
    status: "Active",
    salt: TEST_SALT,
    passwordHash: TEST_PASSWORD_HASH,
    activationNonce: "",
    tempPasswordHash: "",
    tempPasswordSalt: "",
    tempPasswordExpiresAt: "",
    resetNonce: "",
    passwordSetAt: createdAt,
    createdAt,
  };

  await handle(env).createSubmission(account);
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/partners/portal",
      "Set-Cookie": await sessionCookie(env),
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex,nofollow,noarchive",
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (
      request.method === "GET" &&
      url.hostname.toLowerCase() === HOST &&
      url.pathname === "/admin/test-dealer-bootstrap"
    ) {
      return bootstrap(request, env);
    }
    return app.fetch(request, env, ctx);
  },
};
