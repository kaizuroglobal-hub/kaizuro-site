import app from "./dealer-dashboard.js";
export { PartnerReferrals } from "./dealer-dashboard.js";

const PORTAL_HOST = "portal.kaizuro.com";
const LEADS_PATH = "/partners/portal/leads";
const STATUS_PATH = "/partners/portal/leads/status";
const STORE_NAME = "kaizuro-partner-submissions";
const STAGES = ["New", "Contacted", "Qualified", "Quoted", "Won", "Lost"];

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function decode(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]*>/g, "")
    .trim();
}

function cookieUsername(request) {
  const cookie = (request.headers.get("Cookie") || "")
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith("kz_partner="));
  if (!cookie) return "";
  try {
    return decodeURIComponent(cookie.split("=").slice(1).join("=")).split("|")[0] || "";
  } catch {
    return "";
  }
}

function validOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}

function store(env) {
  if (!env.PARTNER_REFERRALS) return null;
  const id = env.PARTNER_REFERRALS.idFromName(STORE_NAME);
  return env.PARTNER_REFERRALS.get(id);
}

async function accountProbe(request, env, ctx) {
  const url = new URL(request.url);
  const probeUrl = new URL("/partners/portal/account", url);
  const probe = new Request(probeUrl.toString(), { method: "GET", headers: request.headers });
  return app.fetch(probe, env, ctx);
}

function parseReferrals(html = "") {
  const rows = [];
  const re = /<tr>\s*<td>(KZR-[^<]+)<\/td>\s*<td>([^<]*)<\/td>\s*<td>([^<]*)<\/td>\s*<td>([^<]*)<\/td>\s*<td>([^<]*)<\/td>\s*<\/tr>/gi;
  let match;
  while ((match = re.exec(html))) {
    rows.push({
      id: decode(match[1]),
      date: decode(match[2]),
      customerName: decode(match[3]),
      productInterest: decode(match[4]),
      status: decode(match[5]) || "New",
    });
  }
  return rows;
}

async function leadStatusMap(env, email) {
  const result = new Map();
  const s = store(env);
  if (!s || !email) return result;
  try {
    const events = await s.listForPartner(String(email).toLowerCase(), "lead-status");
    for (const event of events) {
      if (!event?.leadId || result.has(event.leadId)) continue;
      if (!STAGES.includes(event.status)) continue;
      result.set(event.leadId, event.status);
    }
  } catch {
    return result;
  }
  return result;
}

function withStatuses(referrals, map) {
  return referrals.map((lead) => ({ ...lead, status: map.get(lead.id) || lead.status || "New" }));
}

function stats(referrals) {
  const counts = Object.fromEntries(STAGES.map((stage) => [stage, 0]));
  for (const lead of referrals) counts[STAGES.includes(lead.status) ? lead.status : "New"] += 1;
  const total = referrals.length;
  const won = counts.Won;
  const lost = counts.Lost;
  const active = Math.max(0, total - won - lost);
  const conversion = total ? Math.round((won / total) * 100) : 0;
  return { counts, total, won, lost, active, conversion };
}

function demoLeads() {
  return [
    { id: "KZR-DEMO-0001", date: "12 Aug 2026", customerName: "Demo · Reef GT angler", productInterest: "ASSAULT PE6-8", status: "New" },
    { id: "KZR-DEMO-0002", date: "10 Aug 2026", customerName: "Demo · Charter client", productInterest: "HALO PE10-12", status: "Contacted" },
    { id: "KZR-DEMO-0003", date: "8 Aug 2026", customerName: "Demo · Tuna customer", productInterest: "ASSAULT PE6-8", status: "Qualified" },
    { id: "KZR-DEMO-0004", date: "5 Aug 2026", customerName: "Demo · Offshore customer", productInterest: "HALO PE10-12", status: "Won" },
  ];
}

function nav(email, active, leadCount) {
  return `<aside>
    <a class="brand" href="/partners/portal">KAIZURO</a>
    <span class="portal-label">Dealer Command Centre</span>
    <nav aria-label="Dealer portal">
      <a class="nav-link ${active === "dashboard" ? "active" : ""}" href="/partners/portal"><span>Dashboard</span><small>Live</small></a>
      <a class="nav-link ${active === "leads" ? "active" : ""}" href="${LEADS_PATH}"><span>Leads</span><small>${leadCount}</small></a>
      <a class="nav-link" href="/partners/portal#earnings"><span>Earnings</span><small>Next</small></a>
      <a class="nav-link" href="/partners/portal#products"><span>Products</span><small>Next</small></a>
      <a class="nav-link" href="/partners/portal#allocation"><span>Allocation</span><small>Next</small></a>
      <a class="nav-link" href="/partners/portal#marketing"><span>Marketing Studio</span><small>Next</small></a>
      <a class="nav-link" href="/partners/portal#academy"><span>KAIZURO Academy</span><small>Next</small></a>
      <a class="nav-link" href="/partners/portal/account"><span>Account</span></a>
    </nav>
    <div class="side-bottom"><div class="side-email">${esc(email)}</div><div class="side-links"><a href="/partners/portal/support">Support</a><a href="/">Portal home</a></div></div>
  </aside>`;
}

function stageOptions(current, disabled) {
  return STAGES.map((stage) => `<option ${stage === current ? "selected" : ""}>${stage}</option>`).join("");
}

function leadCard(lead, staging) {
  const statusClass = lead.status.toLowerCase().replace(/[^a-z]+/g, "-");
  return `<article class="lead-card">
    <div class="lead-card-top"><span class="lead-id">${esc(lead.id)}</span><span class="status-pill status-${statusClass}">${esc(lead.status)}</span></div>
    <h3>${esc(lead.customerName || "Unnamed lead")}</h3>
    <div class="lead-meta"><span>${esc(lead.productInterest || "Product not set")}</span><span>${esc(lead.date || "")}</span></div>
    <form method="post" action="${STATUS_PATH}">
      <input type="hidden" name="leadId" value="${esc(lead.id)}">
      <label>Pipeline stage
        <select name="status" ${staging ? "disabled" : ""}>${stageOptions(lead.status, staging)}</select>
      </label>
      <button type="submit" ${staging ? "disabled" : ""}>${staging ? "Demo only" : "Save stage"}</button>
    </form>
  </article>`;
}

function leadsHtml({ email, referrals, staging, message = "" }) {
  const s = stats(referrals);
  const columns = STAGES.map((stage) => {
    const leads = referrals.filter((lead) => lead.status === stage);
    return `<section class="kanban-col">
      <div class="col-head"><span>${stage}</span><b>${leads.length}</b></div>
      <div class="col-body">${leads.length ? leads.map((lead) => leadCard(lead, staging)).join("") : '<div class="empty-col">No leads</div>'}</div>
    </section>`;
  }).join("");

  return `<!doctype html><html lang="en"><head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><meta name="theme-color" content="#08090a">
    <title>KAIZURO | Dealer Leads</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
      :root{--bg:#ecece8;--ink:#101113;--muted:#6d7175;--line:#d2d3cf;--card:#f8f8f5;--dark:#08090a}*{box-sizing:border-box}html,body{margin:0;min-height:100%;font-family:Inter,Arial,sans-serif;background:var(--bg);color:var(--ink)}a{color:inherit}.shell{display:grid;grid-template-columns:250px minmax(0,1fr);min-height:100svh}aside{position:sticky;top:0;height:100svh;display:flex;flex-direction:column;padding:30px 22px;background:var(--dark);color:#fff}.brand{font-size:20px;font-weight:600;letter-spacing:.17em;text-decoration:none}.portal-label{margin-top:7px;color:rgba(255,255,255,.42);font-size:9px;font-weight:700;letter-spacing:.17em;text-transform:uppercase}aside nav{display:grid;gap:4px;margin-top:44px}.nav-link{display:flex;align-items:center;justify-content:space-between;min-height:42px;padding:0 12px;color:rgba(255,255,255,.58);font-size:12px;text-decoration:none;border:1px solid transparent}.nav-link.active{background:#17191b;color:#fff;border-color:rgba(255,255,255,.1)}.nav-link small{font-size:8px;color:rgba(255,255,255,.32);letter-spacing:.09em;text-transform:uppercase}.side-bottom{margin-top:auto;padding-top:22px;border-top:1px solid rgba(255,255,255,.12)}.side-email{overflow:hidden;text-overflow:ellipsis;color:rgba(255,255,255,.7);font-size:11px;white-space:nowrap}.side-links{display:flex;gap:16px;margin-top:13px}.side-links a{color:rgba(255,255,255,.42);font-size:10px;text-decoration:none}main{min-width:0;padding-bottom:70px}.topbar{display:flex;align-items:center;justify-content:space-between;min-height:74px;padding:0 clamp(24px,4vw,58px);background:#f6f6f3;border-bottom:1px solid var(--line)}.topbar-title{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}.test-badge{display:inline-flex;margin-left:10px;padding:5px 8px;border:1px solid #bd9a45;color:#7b6020;font-size:8px;font-weight:800;letter-spacing:.11em;text-transform:uppercase}.content{width:min(1600px,calc(100% - clamp(40px,6vw,90px)));margin:auto;padding-top:46px}.head{display:flex;align-items:end;justify-content:space-between;gap:24px;padding-bottom:30px;border-bottom:1px solid var(--line)}.eyebrow{margin:0 0 11px;color:#777b7f;font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase}h1{margin:0;font-size:clamp(42px,5vw,68px);font-weight:300;line-height:.98;letter-spacing:-.05em}.head p{max-width:530px;margin:14px 0 0;color:var(--muted);font-size:13px;line-height:1.65}.primary{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 18px;background:#111315;color:#fff;font-size:10px;font-weight:700;letter-spacing:.08em;text-decoration:none;text-transform:uppercase}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;margin:24px 0;background:var(--line);border:1px solid var(--line)}.metric{padding:19px 20px;background:var(--card)}.metric small{display:block;color:#74787b;font-size:8px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}.metric strong{display:block;margin-top:14px;font-size:30px;font-weight:400}.notice{margin:0 0 18px;padding:13px 16px;border:1px solid #c8ab69;background:#f7f1df;color:#6b5420;font-size:11px}.kanban{display:grid;grid-template-columns:repeat(6,minmax(245px,1fr));gap:12px;overflow-x:auto;padding-bottom:16px}.kanban-col{min-height:430px;border:1px solid var(--line);background:#e5e5e1}.col-head{display:flex;justify-content:space-between;align-items:center;padding:14px 15px;background:#f5f5f2;border-bottom:1px solid var(--line);font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.col-head b{display:grid;place-items:center;min-width:24px;height:24px;border:1px solid #cfd0cc;font-size:9px}.col-body{display:grid;gap:9px;padding:9px}.lead-card{padding:15px;background:#fff;border:1px solid #d4d5d1}.lead-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px}.lead-id{color:#8b8f92;font-size:8px}.status-pill{padding:5px 7px;background:#ecece8;color:#54585b;font-size:7px;font-weight:800;letter-spacing:.06em;text-transform:uppercase}.status-won{background:#e3f2e8;color:#21683e}.status-lost{background:#f1e6e6;color:#874040}.status-quoted{background:#eee8d8;color:#755d22}.lead-card h3{margin:17px 0 10px;font-size:15px;font-weight:600;line-height:1.25}.lead-meta{display:grid;gap:4px;min-height:38px;color:#777b7f;font-size:9px}.lead-card form{display:grid;gap:8px;margin-top:15px;padding-top:13px;border-top:1px solid #e3e3df}.lead-card label{display:grid;gap:5px;color:#6a6e71;font-size:8px;font-weight:700;text-transform:uppercase}.lead-card select{width:100%;height:35px;padding:0 8px;border:1px solid #cfd0cc;background:#fff;font:inherit;font-size:10px}.lead-card button{height:34px;border:1px solid #17191b;background:#17191b;color:#fff;font:inherit;font-size:8px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.lead-card button:disabled,.lead-card select:disabled{opacity:.55}.empty-col{display:grid;place-items:center;min-height:120px;color:#979b9d;font-size:9px}.message{margin:0 0 18px;padding:13px 16px;border:1px solid #88ad91;background:#edf5ef;color:#285a34;font-size:11px}
      @media(max-width:1050px){.shell{grid-template-columns:80px 1fr}aside{padding:28px 13px}.brand{font-size:0}.brand:after{content:"K";font-size:20px}.portal-label,.nav-link span,.nav-link small,.side-email,.side-links{display:none}.nav-link{justify-content:center}.metrics{grid-template-columns:1fr 1fr}.content{width:calc(100% - 40px)}}@media(max-width:700px){.shell{display:block}aside{position:static;height:auto;padding:17px 18px}.brand{font-size:15px}.brand:after,.portal-label,aside nav,.side-bottom{display:none}.topbar{min-height:58px;padding:0 18px}.content{width:calc(100% - 28px);padding-top:30px}.head{display:block}h1{font-size:42px}.primary{margin-top:20px}.metrics{grid-template-columns:1fr 1fr}.kanban{grid-template-columns:repeat(6,260px)}}
    </style></head><body><div class="shell">${nav(email, "leads", s.active)}<main><div class="topbar"><div class="topbar-title">Lead Centre ${staging ? '<span class="test-badge">Staging demo</span>' : ""}</div><div>${s.total} registered</div></div><div class="content">
      <section class="head"><div><p class="eyebrow">Pipeline control</p><h1>Turn interest<br>into customers.</h1><p>Every KAIZURO referral now has a clear pipeline stage. Move leads through the process and the dashboard recalculates active opportunities and conversion automatically.</p></div><a class="primary" href="/partners/portal/account#customer-referral">+ Register customer lead</a></section>
      <section class="metrics"><div class="metric"><small>Total leads</small><strong>${s.total}</strong></div><div class="metric"><small>Active</small><strong>${s.active}</strong></div><div class="metric"><small>Won</small><strong>${s.won}</strong></div><div class="metric"><small>Conversion</small><strong>${s.conversion}%</strong></div></section>
      ${staging ? '<div class="notice"><b>Staging demo data.</b> These four leads are visual examples only. Nothing here is written to dealer records.</div>' : ""}${message ? `<div class="message">${esc(message)}</div>` : ""}
      <div class="kanban">${columns}</div>
    </div></main></div></body></html>`;
}

function htmlResponse(html) {
  return new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "no-store, no-cache, must-revalidate", "X-Robots-Tag": "noindex,nofollow,noarchive" } });
}

async function realLeadContext(request, env, ctx) {
  const probe = await accountProbe(request, env, ctx);
  if (probe.status !== 200) return { response: probe };
  const email = cookieUsername(request).toLowerCase();
  if (!email) return { response: Response.redirect(new URL("/", request.url), 302) };
  const accountHtml = await probe.text();
  const referrals = parseReferrals(accountHtml);
  const map = await leadStatusMap(env, email);
  return { email, referrals: withStatuses(referrals, map) };
}

async function saveStatus(request, env, ctx) {
  if (!validOrigin(request)) return new Response("Invalid request", { status: 403 });
  const context = await realLeadContext(request, env, ctx);
  if (context.response) return context.response;
  const form = await request.formData();
  const leadId = String(form.get("leadId") || "").trim();
  const status = String(form.get("status") || "").trim();
  if (!STAGES.includes(status) || !context.referrals.some((lead) => lead.id === leadId)) return new Response("Invalid lead update", { status: 400 });
  const s = store(env);
  if (!s) return new Response("Lead storage unavailable", { status: 503 });
  const createdAt = new Date().toISOString();
  await s.createSubmission({
    id: `KZLS-${createdAt.slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`,
    type: "lead-status",
    partnerId: context.email,
    leadId,
    status,
    createdAt,
  });
  const target = new URL(LEADS_PATH, request.url);
  target.searchParams.set("updated", `${leadId} → ${status}`);
  return Response.redirect(target.toString(), 303);
}

async function decorateDashboard(response, referrals) {
  const type = response.headers.get("Content-Type") || "";
  if (!type.includes("text/html") || response.status !== 200) return response;
  const s = stats(referrals);
  const widths = [s.total ? 100 : 0, s.total ? Math.round((s.active / s.total) * 100) : 0, s.total ? Math.round((s.won / s.total) * 100) : 0];
  let rewriter = new HTMLRewriter()
    .on('aside nav .nav-link:nth-child(2)', { element(el) { el.setAttribute("href", LEADS_PATH); } })
    .on('aside nav .nav-link:nth-child(2) small', { element(el) { el.setInnerContent(String(s.active)); } })
    .on('.metrics .metric:nth-child(3) .metric-value', { element(el) { el.setInnerContent(String(s.active)); } })
    .on('.metrics .metric:nth-child(3) .metric-note', { element(el) { el.setInnerContent(`${s.total} total referral${s.total === 1 ? "" : "s"} registered`); } })
    .on('.metrics .metric:nth-child(4) .metric-value', { element(el) { el.setInnerContent(`${s.conversion}%`); } })
    .on('.metrics .metric:nth-child(4) .metric-note', { element(el) { el.setInnerContent(`${s.won} lead${s.won === 1 ? "" : "s"} currently marked won`); } });
  for (let i = 0; i < 3; i += 1) {
    rewriter = rewriter
      .on(`.funnel-row:nth-child(${i + 1}) b`, { element(el) { el.setInnerContent(String([s.total, s.active, s.won][i])); } })
      .on(`.funnel-row:nth-child(${i + 1}) .track i`, { element(el) { el.setAttribute("style", `width:${widths[i]}%`); } });
  }
  return rewriter.transform(response);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const staging = env.KZ_ENVIRONMENT === "staging";

    if (request.method === "GET" && (url.pathname === LEADS_PATH || url.pathname === `${LEADS_PATH}/`)) {
      if (staging) return htmlResponse(leadsHtml({ email: env.KZ_TEST_DEALER_EMAIL || "w3protocol@proton.me", referrals: demoLeads(), staging: true }));
      if (url.hostname.toLowerCase() !== PORTAL_HOST) return app.fetch(request, env, ctx);
      const context = await realLeadContext(request, env, ctx);
      if (context.response) return context.response;
      return htmlResponse(leadsHtml({ email: context.email, referrals: context.referrals, staging: false, message: url.searchParams.get("updated") || "" }));
    }

    if (request.method === "POST" && url.pathname === STATUS_PATH) {
      if (staging) return new Response("Demo lead stages are read-only", { status: 403 });
      if (url.hostname.toLowerCase() !== PORTAL_HOST) return new Response("Not found", { status: 404 });
      return saveStatus(request, env, ctx);
    }

    const response = await app.fetch(request, env, ctx);
    const dashboardPath = request.method === "GET" && ["/partners/portal", "/partners/portal/", "/partners/portal/dashboard", "/partners/portal/dashboard/"].includes(url.pathname);
    if (!dashboardPath) return response;

    if (staging) return decorateDashboard(response, demoLeads());
    if (url.hostname.toLowerCase() !== PORTAL_HOST) return response;
    const context = await realLeadContext(request, env, ctx);
    if (context.response) return response;
    return decorateDashboard(response, context.referrals);
  },
};
