import app from "./approval.js";
export { PartnerReferrals } from "./approval.js";

const STORE = "kaizuro-partner-submissions";

function store(env) {
  if (!env.PARTNER_REFERRALS) return null;
  const id = env.PARTNER_REFERRALS.idFromName(STORE);
  return env.PARTNER_REFERRALS.get(id);
}

async function latestApplication(env, email) {
  const s = store(env);
  if (!s || !email) return null;
  const rows = await s.listForPartner(String(email).toLowerCase(), "application");
  return rows[0] || null;
}

function blockedPage() {
  return new Response(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>KAIZURO | Activation unavailable</title><style>*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:#f4f4f1;color:#111214;font-family:Arial,sans-serif}main{width:min(680px,calc(100% - 30px));margin:auto;padding:70px 0}.card{padding:34px;border:1px solid #d7d8d6;background:#fff}h1{margin:0 0 14px;font-size:40px;font-weight:400}p{color:#5d6266;line-height:1.65}a{display:inline-flex;margin-top:16px;padding:15px 20px;background:#111;color:#fff;text-decoration:none;font-size:12px;font-weight:700}</style></head><body><main><section class="card"><h1>Activation unavailable.</h1><p>This partner application is no longer approved for activation. Contact info@kaizuro.com if you believe this is an error.</p><a href="/">Return to Partner Portal</a></section></main></body></html>`, {
    status: 403,
    headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex,nofollow,noarchive" },
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.hostname.toLowerCase() === "portal.kaizuro.com" && url.pathname === "/activate") {
      const email = url.searchParams.get("email") || "";
      const ref = url.searchParams.get("ref") || "";
      const application = await latestApplication(env, email);
      if (application && application.id === ref && application.status === "Declined") return blockedPage();
    }
    return app.fetch(request, env, ctx);
  },
};
