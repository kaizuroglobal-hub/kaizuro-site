import app, { PartnerReferrals as BasePartnerReferrals } from "./dealer-nav-fix.js";

const PORTAL_HOST = "portal.kaizuro.com";
const LEADS_PATH = "/partners/portal/leads";
const STATUS_PATH = "/partners/portal/leads/status";
const STORE_NAME = "kaizuro-partner-submissions";
const STAGES = ["New", "Contacted", "Qualified", "Quoted", "Won", "Lost"];
const PAGE_SIZE = 50;
const PIPELINE_LIMIT = 25;
const STORAGE_LIMIT = 5000;
const DAY = 24 * 60 * 60 * 1000;

function normaliseStoredRow(row, type) {
  if (!row || typeof row !== "object") return row;
  if (type === "lead-status" && row.leadId && !row.leadRef) return { ...row, leadRef: row.leadId };
  return row;
}

export class PartnerReferrals extends BasePartnerReferrals {
  async listForPartner(partnerId, type) {
    const entries = await this.ctx.storage.list({
      prefix: `${type}:${partnerId}:`,
      reverse: true,
      limit: STORAGE_LIMIT,
    });
    return [...entries.values()]
      .map((row) => normaliseStoredRow(row, type))
      .sort((left, right) => String(right?.createdAt || "").localeCompare(String(left?.createdAt || "")));
  }

  async listForPartnerAll(partnerId, type) {
    return this.listForPartner(partnerId, type);
  }
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}
function lower(value) { return String(value || "").trim().toLowerCase(); }
function cookieUsername(request) {
  const cookie = (request.headers.get("Cookie") || "").split(";").map((v) => v.trim()).find((v) => v.startsWith("kz_partner="));
  if (!cookie) return "";
  try { return decodeURIComponent(cookie.split("=").slice(1).join("=")).split("|")[0] || ""; } catch { return ""; }
}
function validOrigin(request) {
  const origin = request.headers.get("Origin");
  return !origin || origin === new URL(request.url).origin;
}
function store(env) {
  if (!env.PARTNER_REFERRALS) throw new Error("Partner storage is not configured");
  return env.PARTNER_REFERRALS.get(env.PARTNER_REFERRALS.idFromName(STORE_NAME));
}
function response(html, status = 200) {
  return new Response(html, { status, headers: {
    "Content-Type": "text/html; charset=UTF-8",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "X-Robots-Tag": "noindex,nofollow,noarchive",
  }});
}
function safeDate(value) {
  const d = new Date(value || 0);
  return Number.isNaN(d.getTime()) ? null : d;
}
function dateLabel(value) {
  const d = safeDate(value);
  return d ? d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : "—";
}
function dateTimeLabel(value) {
  const d = safeDate(value);
  return d ? d.toLocaleString("en-AU", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "—";
}
function productGroup(lead) {
  const product = String(lead.productInterest || "").toUpperCase();
  if (product.includes("ASSAULT")) return "ASSAULT";
  if (product.includes("HALO")) return "HALO";
  return "OTHER";
}
function currentStatus(lead) { return STAGES.includes(lead.currentStatus) ? lead.currentStatus : "New"; }
function statusClass(status) { return lower(status).replace(/[^a-z]+/g, "-"); }

async function authContext(request, env, ctx) {
  if (env.KZ_ENVIRONMENT === "staging") {
    const email = lower(env.KZ_TEST_DEALER_EMAIL || "w3protocol@proton.me");
    return { staging: true, email, partnerId: email, account: { dealerName: "KAIZURO Test Dealer", email, partnerId: email } };
  }
  const url = new URL(request.url);
  const probe = new Request(new URL("/partners/portal/support", url).toString(), { method: "GET", headers: request.headers });
  const verified = await app.fetch(probe, env, ctx);
  if (verified.status >= 300 && verified.status < 400) return { redirect: verified };
  if (verified.status !== 200) return null;
  const email = lower(cookieUsername(request));
  if (!email) return null;
  let account = null;
  try {
    const accounts = await store(env).listForPartner(email, "account");
    account = accounts[0] || null;
  } catch {}
  const partnerId = String(account?.partnerId || email);
  return { staging: false, email, partnerId, account: account || { dealerName: email, email, partnerId } };
}

function demoLeads() {
  const statuses = ["New", "Contacted", "Qualified", "Quoted", "Won", "Lost"];
  const products = ["ASSAULT PE6-8", "HALO PE10-12", "ASSAULT PE6-8", "Unsure / needs recommendation"];
  const species = ["GT", "Bluefin tuna", "Dogtooth tuna", "Yellowfin tuna", "Kingfish"];
  return Array.from({ length: 137 }, (_, i) => {
    const createdAt = new Date(Date.now() - i * 19 * 60 * 60 * 1000).toISOString();
    const status = statuses[i % statuses.length];
    return {
      id: `KZR-DEMO-${String(i + 1).padStart(4, "0")}`,
      customerName: `Demo Customer ${i + 1}`,
      customerEmail: `customer${i + 1}@example.com`,
      customerMobile: `04${String(10000000 + i).slice(-8)}`,
      productInterest: products[i % products.length],
      targetSpecies: species[i % species.length],
      typicalPeClass: ["PE6", "PE8", "PE10", "PE12"][i % 4],
      fishingRequirements: "Staging-only example lead used to test large lead lists and pipeline behaviour.",
      status,
      currentStatus: status,
      createdAt,
      lastActivityAt: createdAt,
    };
  });
}

async function loadLeads(env, ctx) {
  if (ctx.staging) return demoLeads();
  const s = store(env);
  const [referrals, statuses] = await Promise.all([
    s.listForPartner(ctx.partnerId, "referral"),
    s.listForPartner(ctx.partnerId, "lead-status"),
  ]);
  const latest = new Map();
  for (const event of statuses) {
    const id = String(event?.leadId || event?.leadRef || "");
    if (!id || latest.has(id) || !STAGES.includes(event.status)) continue;
    latest.set(id, event);
  }
  return referrals.map((lead) => {
    const event = latest.get(String(lead.id));
    const status = event?.status || lead.status || "New";
    return { ...lead, currentStatus: STAGES.includes(status) ? status : "New", lastActivityAt: event?.createdAt || lead.createdAt };
  });
}

function leadStats(leads) {
  const counts = Object.fromEntries(STAGES.map((stage) => [stage, 0]));
  let attention = 0;
  for (const lead of leads) {
    counts[currentStatus(lead)] += 1;
    if (needsAttention(lead)) attention += 1;
  }
  const total = leads.length;
  const won = counts.Won;
  const lost = counts.Lost;
  const active = Math.max(0, total - won - lost);
  const conversion = total ? Math.round((won / total) * 100) : 0;
  return { counts, total, won, lost, active, conversion, attention };
}
function needsAttention(lead) {
  const status = currentStatus(lead);
  if (status === "Won" || status === "Lost") return false;
  if (status === "New" || status === "Quoted") return true;
  const last = safeDate(lead.lastActivityAt || lead.createdAt);
  if (!last) return false;
  return Date.now() - last.getTime() >= 7 * DAY;
}

function queryHref(url, changes = {}) {
  const next = new URL(url.toString());
  next.pathname = LEADS_PATH;
  next.hash = "";
  for (const [key, value] of Object.entries(changes)) {
    if (value === null || value === undefined || value === "") next.searchParams.delete(key);
    else next.searchParams.set(key, String(value));
  }
  return `${next.pathname}${next.search}`;
}
function filterLeads(leads, url) {
  const q = lower(url.searchParams.get("q"));
  const stage = url.searchParams.get("stage") || "";
  const product = url.searchParams.get("product") || "";
  const date = url.searchParams.get("date") || "all";
  const attention = url.searchParams.get("attention") === "1";
  const now = Date.now();
  const yearStart = new Date(new Date().getFullYear(), 0, 1).getTime();
  let rows = leads.filter((lead) => {
    if (stage && currentStatus(lead) !== stage) return false;
    if (product && productGroup(lead) !== product) return false;
    if (attention && !needsAttention(lead)) return false;
    const created = safeDate(lead.createdAt)?.getTime() || 0;
    if (date === "7d" && created < now - 7 * DAY) return false;
    if (date === "30d" && created < now - 30 * DAY) return false;
    if (date === "90d" && created < now - 90 * DAY) return false;
    if (date === "ytd" && created < yearStart) return false;
    if (q) {
      const haystack = [lead.id, lead.customerName, lead.customerEmail, lead.customerMobile, lead.productInterest, lead.targetSpecies, lead.typicalPeClass, lead.fishingRequirements, currentStatus(lead)].join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
  const sort = url.searchParams.get("sort") || "newest";
  const stageOrder = Object.fromEntries(STAGES.map((s, i) => [s, i]));
  rows = [...rows].sort((a, b) => {
    if (sort === "oldest") return String(a.createdAt || "").localeCompare(String(b.createdAt || ""));
    if (sort === "name") return String(a.customerName || "").localeCompare(String(b.customerName || ""));
    if (sort === "stage") return (stageOrder[currentStatus(a)] - stageOrder[currentStatus(b)]) || String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
    if (sort === "activity") return String(b.lastActivityAt || b.createdAt || "").localeCompare(String(a.lastActivityAt || a.createdAt || ""));
    return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
  });
  return rows;
}

function nav(email, active, leadCount) {
  const items = [
    ["dashboard", "/partners/portal", "Dashboard", "Live"],
    ["leads", LEADS_PATH, "Leads", String(leadCount)],
    ["earnings", "/partners/portal/earnings", "Earnings", "Live"],
    ["products", "/partners/portal/products", "Products", "2"],
    ["allocation", "/partners/portal/allocation", "Allocation", ""],
    ["marketing", "/partners/portal/marketing", "Marketing Studio", "Tools"],
    ["academy", "/partners/portal/academy", "KAIZURO Academy", ""],
    ["account", "/partners/portal/account", "Account", ""],
  ];
  return `<aside><a class="brand" href="/partners/portal">KAIZURO</a><span class="portal-label">Dealer Dashboard</span><nav>${items.map(([id, href, label, badge]) => `<a class="nav ${id === active ? "active" : ""}" href="${href}"><span>${label}</span>${badge ? `<small>${esc(badge)}</small>` : ""}</a>`).join("")}</nav><div class="side"><div class="side-email">${esc(email)}</div><a href="/partners/portal/support">Support</a><a href="/partners/logout">Sign out</a></div></aside>`;
}
function stageOptions(current) {
  return STAGES.map((stage) => `<option value="${stage}" ${stage === current ? "selected" : ""}>${stage}</option>`).join("");
}
function statusForm(lead, returnTo, compact = false) {
  return `<form class="stage-form ${compact ? "compact" : ""}" method="post" action="${STATUS_PATH}"><input type="hidden" name="leadId" value="${esc(lead.id)}"><input type="hidden" name="returnTo" value="${esc(returnTo)}"><select name="status" aria-label="Stage for ${esc(lead.customerName || lead.id)}">${stageOptions(currentStatus(lead))}</select><button type="submit">Save</button></form>`;
}

const CSS = `<style>
:root{--bg:#ecece8;--ink:#101113;--muted:#707477;--line:#d2d3cf;--card:#f8f8f5;--dark:#08090a;--green:#236a42;--gold:#7d6123;--red:#8a4242}*{box-sizing:border-box}html,body{margin:0;min-height:100%;font-family:Inter,Arial,sans-serif;background:var(--bg);color:var(--ink)}a{color:inherit}.shell{display:grid;grid-template-columns:250px minmax(0,1fr);min-height:100svh}aside{position:sticky;top:0;height:100svh;display:flex;flex-direction:column;padding:30px 22px;background:var(--dark);color:#fff}.brand{font-size:20px;font-weight:600;letter-spacing:.17em;text-decoration:none}.portal-label{margin-top:7px;color:#737373;font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase}aside nav{display:grid;gap:4px;margin-top:42px}.nav{display:flex;align-items:center;justify-content:space-between;min-height:42px;padding:0 12px;color:#8b8b8b;font-size:12px;text-decoration:none;border:1px solid transparent}.nav:hover{color:#fff}.nav.active{background:#17191b;color:#fff;border-color:#292b2d}.nav small{color:#555;font-size:8px;font-weight:800;letter-spacing:.09em;text-transform:uppercase}.side{margin-top:auto;padding-top:20px;border-top:1px solid #292929}.side-email{overflow:hidden;text-overflow:ellipsis;color:#aaa;font-size:10px;white-space:nowrap}.side a{display:inline-block;margin:12px 14px 0 0;color:#747474;font-size:9px;text-decoration:none}main{min-width:0;padding-bottom:70px}.topbar{display:flex;align-items:center;justify-content:space-between;min-height:72px;padding:0 clamp(22px,4vw,56px);background:#f6f6f3;border-bottom:1px solid var(--line)}.topbar b{font-size:10px;letter-spacing:.12em;text-transform:uppercase}.topbar span{color:#666;font-size:10px}.test{margin-left:9px;padding:4px 7px;border:1px solid #bd9a45;color:#7b6020!important;font-size:8px!important;text-transform:uppercase}.content{width:min(1550px,calc(100% - clamp(40px,6vw,90px)));margin:auto;padding-top:clamp(34px,4vw,52px)}.hero{display:flex;align-items:flex-end;justify-content:space-between;gap:30px;padding-bottom:26px;border-bottom:1px solid var(--line)}.eyebrow{margin:0 0 9px;color:#777;font-size:9px;font-weight:800;letter-spacing:.15em;text-transform:uppercase}.hero h1{margin:0;font-size:clamp(42px,5vw,64px);font-weight:300;line-height:1;letter-spacing:-.05em}.hero p{max-width:590px;margin:13px 0 0;color:var(--muted);font-size:13px;line-height:1.6}.hero h3{margin:0}.cta{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 17px;background:#111315;color:#fff;font-size:9px;font-weight:800;letter-spacing:.07em;text-decoration:none;text-transform:uppercase;border:1px solid #111315}.tabs{display:flex;gap:6px;overflow-x:auto;margin:22px 0 0;padding-bottom:4px}.tab{flex:0 0 auto;display:inline-flex;gap:8px;align-items:center;padding:10px 12px;border:1px solid #ccc;background:#f5f5f2;color:#626669;font-size:9px;text-decoration:none}.tab b{font-size:10px}.tab.active{background:#17191b;color:#fff;border-color:#17191b}.toolbar{display:grid;grid-template-columns:minmax(220px,1.5fr) repeat(4,minmax(120px,.55fr)) auto auto;gap:8px;margin-top:12px;padding:12px;background:#f7f7f4;border:1px solid var(--line)}.toolbar input,.toolbar select{width:100%;height:42px;padding:0 11px;border:1px solid #c8cac6;background:#fff;font:inherit;font-size:10px}.toolbar button{height:42px;padding:0 15px;border:1px solid #17191b;background:#17191b;color:#fff;font:inherit;font-size:8px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.toolbar-clear{display:grid;place-items:center;height:42px;padding:0 12px;border:1px solid #c8cac6;background:#fff;color:#666;font-size:8px;font-weight:800;text-decoration:none;text-transform:uppercase}.viewbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:14px 0}.viewtoggle{display:flex;gap:4px}.viewtoggle a{padding:9px 12px;border:1px solid #c8cac6;background:#f7f7f4;color:#686c6f;font-size:8px;font-weight:800;text-decoration:none;text-transform:uppercase}.viewtoggle a.active{background:#17191b;color:#fff;border-color:#17191b}.result-count{color:#777;font-size:9px}.message{margin:14px 0;padding:13px 15px;border:1px solid #9ec3aa;background:#eaf4ed;color:#285c39;font-size:10px}.detail{display:grid;grid-template-columns:1.1fr .9fr;gap:1px;margin:16px 0;background:var(--line);border:1px solid var(--line)}.detail>div{background:#fff;padding:20px}.detail h2{margin:5px 0 8px;font-size:25px;font-weight:400;letter-spacing:-.03em}.detail .id{color:#888;font-size:8px}.detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin-top:15px;background:#ddd}.detail-grid div{padding:12px;background:#f8f8f5}.detail-grid small{display:block;color:#888;font-size:7px;font-weight:800;text-transform:uppercase}.detail-grid b{display:block;margin-top:5px;font-size:10px;font-weight:500}.requirements{white-space:pre-wrap;color:#666;font-size:10px;line-height:1.6}.table-wrap{overflow:auto;border:1px solid var(--line);background:#fff}.lead-table{width:100%;min-width:1050px;border-collapse:collapse}.lead-table th,.lead-table td{padding:12px 12px;border-bottom:1px solid #e1e2de;text-align:left;vertical-align:middle}.lead-table th{position:sticky;top:0;background:#f5f5f2;color:#777;font-size:7px;font-weight:800;letter-spacing:.09em;text-transform:uppercase}.lead-table td{font-size:10px}.customer{font-weight:600;text-decoration:none}.ref{display:block;margin-top:4px;color:#999;font-size:7px}.contact{display:grid;gap:3px;color:#676b6e;font-size:9px}.stage-pill{display:inline-flex;padding:6px 8px;background:#ecece8;color:#54585b;font-size:7px;font-weight:800;text-transform:uppercase}.stage-won{background:#e3f2e8;color:#21683e}.stage-lost{background:#f1e6e6;color:#874040}.stage-quoted{background:#f3ead2;color:#725816}.attention{display:inline-flex;align-items:center;gap:5px;margin-top:5px;color:#7b5c1d;font-size:7px;font-weight:800;text-transform:uppercase}.attention:before{content:"";width:6px;height:6px;border-radius:50%;background:#b58522}.stage-form{display:flex;gap:5px;min-width:185px}.stage-form select{min-width:115px;height:34px;border:1px solid #c8cac6;background:#fff;font:inherit;font-size:9px}.stage-form button{height:34px;padding:0 10px;border:1px solid #17191b;background:#17191b;color:#fff;font:inherit;font-size:7px;font-weight:800;text-transform:uppercase}.stage-form.compact{margin-top:12px;min-width:0}.stage-form.compact select{min-width:0;flex:1}.pagination{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:12px}.pages{display:flex;gap:5px}.pages a,.pages span{display:grid;place-items:center;min-width:36px;height:36px;padding:0 10px;border:1px solid #c8cac6;background:#f7f7f4;color:#64686b;font-size:8px;text-decoration:none}.pages span{background:#17191b;color:#fff;border-color:#17191b}.empty{display:grid;place-items:center;min-height:260px;border:1px dashed #cfd0cc;background:#f4f4f1;text-align:center;color:#818588}.empty strong{display:block;margin-bottom:7px;color:#44484b;font-size:14px}.empty span{font-size:10px}.kanban{display:grid;grid-template-columns:repeat(6,minmax(245px,1fr));gap:11px;overflow-x:auto;padding-bottom:14px}.col{min-height:390px;border:1px solid var(--line);background:#e6e6e2}.col-head{display:flex;align-items:center;justify-content:space-between;padding:13px 14px;background:#f5f5f2;border-bottom:1px solid var(--line);font-size:9px;font-weight:800;text-transform:uppercase}.col-head b{display:grid;place-items:center;min-width:24px;height:24px;border:1px solid #ccc;font-size:8px}.col-body{display:grid;gap:8px;padding:8px}.lead-card{padding:14px;background:#fff;border:1px solid #d3d4d0}.lead-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px}.lead-card h3{margin:14px 0 8px;font-size:14px}.lead-meta{display:grid;gap:3px;color:#777;font-size:8px}.col-more{display:block;padding:11px;text-align:center;color:#64686b;font-size:8px;font-weight:800;text-decoration:none;text-transform:uppercase}.notice{margin:14px 0;padding:13px 15px;border:1px solid #c8ab69;background:#f7f1df;color:#6b5420;font-size:10px}
@media(max-width:1200px){.toolbar{grid-template-columns:1.3fr repeat(2,1fr);}.toolbar button,.toolbar-clear{width:100%}.detail{grid-template-columns:1fr}}
@media(max-width:1050px){.shell{grid-template-columns:80px 1fr}aside{padding:26px 12px}.brand{font-size:0}.brand:after{content:"K";font-size:20px}.portal-label,.nav span,.nav small,.side-email,.side a{display:none}.nav{justify-content:center}.nav:before{content:"•";font-size:18px}.content{width:calc(100% - 40px)}}
@media(max-width:700px){.shell{display:block}aside{position:static;height:auto;padding:17px 18px}.brand{font-size:15px}.brand:after,.portal-label,aside nav,.side{display:none}.topbar{min-height:58px;padding:0 18px}.content{width:calc(100% - 28px);padding-top:28px}.hero{display:block}.hero h1{font-size:43px}.hero .cta{margin-top:18px}.toolbar{grid-template-columns:1fr 1fr}.toolbar input{grid-column:1/-1}.viewbar{align-items:flex-start;flex-direction:column}.detail-grid{grid-template-columns:1fr}.kanban{grid-template-columns:repeat(6,260px)}.pagination{align-items:flex-start;flex-direction:column}}
</style>`;

function detailPanel(lead, returnTo) {
  if (!lead) return "";
  return `<section class="detail"><div><span class="id">${esc(lead.id)}</span><h2>${esc(lead.customerName || "Unnamed lead")}</h2><span class="stage-pill stage-${statusClass(currentStatus(lead))}">${esc(currentStatus(lead))}</span>${needsAttention(lead) ? '<div class="attention">Needs attention</div>' : ""}<div class="detail-grid"><div><small>Email</small><b>${esc(lead.customerEmail || "—")}</b></div><div><small>Mobile</small><b>${esc(lead.customerMobile || "—")}</b></div><div><small>Product</small><b>${esc(lead.productInterest || "—")}</b></div><div><small>Target species</small><b>${esc(lead.targetSpecies || "—")}</b></div><div><small>PE class</small><b>${esc(lead.typicalPeClass || "—")}</b></div><div><small>Created</small><b>${esc(dateTimeLabel(lead.createdAt))}</b></div></div></div><div><p class="eyebrow">Lead management</p><h3 style="margin:0 0 12px">Update stage</h3>${statusForm(lead, returnTo)}<h3 style="margin:24px 0 8px">Fishing requirements</h3><div class="requirements">${esc(lead.fishingRequirements || "No additional requirements recorded.")}</div><p style="margin:20px 0 0;color:#888;font-size:9px">Last activity: ${esc(dateTimeLabel(lead.lastActivityAt || lead.createdAt))}</p></div></section>`;
}

function listView(rows, url, staging) {
  const requestedPage = Math.max(1, Number(url.searchParams.get("page") || 1));
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const page = Math.min(requestedPage, pageCount);
  const start = (page - 1) * PAGE_SIZE;
  const pageRows = rows.slice(start, start + PAGE_SIZE);
  if (!pageRows.length) return `<div class="empty"><div><strong>No leads match these filters.</strong><span>Clear filters or register a new opportunity.</span></div></div>`;
  const returnTo = `${url.pathname}${url.search}`;
  const body = pageRows.map((lead) => {
    const detailHref = queryHref(url, { lead: lead.id });
    return `<tr><td><a class="customer" href="${esc(detailHref)}">${esc(lead.customerName || "Unnamed lead")}</a><span class="ref">${esc(lead.id)}</span></td><td>${esc(lead.productInterest || "—")}</td><td><span class="stage-pill stage-${statusClass(currentStatus(lead))}">${esc(currentStatus(lead))}</span>${needsAttention(lead) ? '<span class="attention">Needs attention</span>' : ""}</td><td><div class="contact"><span>${esc(lead.customerEmail || "—")}</span><span>${esc(lead.customerMobile || "")}</span></div></td><td><div class="contact"><span>${esc(lead.targetSpecies || "—")}</span><span>${esc(lead.typicalPeClass || "")}</span></div></td><td>${esc(dateLabel(lead.createdAt))}</td><td>${staging ? '<span style="color:#999;font-size:8px">Demo only</span>' : statusForm(lead, returnTo, true)}</td></tr>`;
  }).join("");
  const prev = page > 1 ? `<a href="${esc(queryHref(url, { page: page - 1, lead: null }))}">←</a>` : "";
  const next = page < pageCount ? `<a href="${esc(queryHref(url, { page: page + 1, lead: null }))}">→</a>` : "";
  const nums = [];
  const from = Math.max(1, page - 2), to = Math.min(pageCount, page + 2);
  for (let p = from; p <= to; p += 1) nums.push(p === page ? `<span>${p}</span>` : `<a href="${esc(queryHref(url, { page: p, lead: null }))}">${p}</a>`);
  return `<div class="table-wrap"><table class="lead-table"><thead><tr><th>Customer</th><th>Product</th><th>Stage</th><th>Contact</th><th>Target / PE</th><th>Created</th><th>Update</th></tr></thead><tbody>${body}</tbody></table></div><div class="pagination"><div class="result-count">Showing ${start + 1}–${Math.min(start + PAGE_SIZE, rows.length)} of ${rows.length} leads</div><div class="pages">${prev}${nums.join("")}${next}</div></div>`;
}

function pipelineView(rows, url, staging) {
  const returnTo = `${url.pathname}${url.search}`;
  const columns = STAGES.map((stage) => {
    const stageRows = rows.filter((lead) => currentStatus(lead) === stage);
    const cards = stageRows.slice(0, PIPELINE_LIMIT).map((lead) => `<article class="lead-card"><div class="lead-card-top"><span class="ref">${esc(lead.id)}</span><span class="stage-pill stage-${statusClass(stage)}">${esc(stage)}</span></div><h3><a class="customer" href="${esc(queryHref(url, { lead: lead.id, view: "pipeline" }))}">${esc(lead.customerName || "Unnamed lead")}</a></h3><div class="lead-meta"><span>${esc(lead.productInterest || "—")}</span><span>${esc(lead.targetSpecies || "—")} ${esc(lead.typicalPeClass || "")}</span><span>${esc(dateLabel(lead.createdAt))}</span></div>${needsAttention(lead) ? '<div class="attention">Needs attention</div>' : ""}${staging ? "" : statusForm(lead, returnTo, true)}</article>`).join("");
    const more = stageRows.length > PIPELINE_LIMIT ? `<a class="col-more" href="${esc(queryHref(url, { view: "list", stage, page: 1, lead: null }))}">View all ${stageRows.length} →</a>` : "";
    return `<section class="col"><div class="col-head"><span>${stage}</span><b>${stageRows.length}</b></div><div class="col-body">${cards || '<div class="empty" style="min-height:110px;border:0"><span>No leads</span></div>'}</div>${more}</section>`;
  }).join("");
  return `<div class="kanban">${columns}</div>`;
}

function tabs(url, stats) {
  const configs = [
    ["All", stats.total, { stage: null, attention: null, page: 1 }],
    ["Needs attention", stats.attention, { stage: null, attention: 1, page: 1 }],
    ["New", stats.counts.New, { stage: "New", attention: null, page: 1 }],
    ["Qualified", stats.counts.Qualified, { stage: "Qualified", attention: null, page: 1 }],
    ["Quoted", stats.counts.Quoted, { stage: "Quoted", attention: null, page: 1 }],
    ["Won", stats.counts.Won, { stage: "Won", attention: null, page: 1 }],
  ];
  const selectedStage = url.searchParams.get("stage") || "";
  const selectedAttention = url.searchParams.get("attention") === "1";
  return configs.map(([label, count, changes], index) => {
    const active = index === 0 ? !selectedStage && !selectedAttention : label === "Needs attention" ? selectedAttention : selectedStage === changes.stage && !selectedAttention;
    return `<a class="tab ${active ? "active" : ""}" href="${esc(queryHref(url, changes))}"><span>${label}</span><b>${count}</b></a>`;
  }).join("");
}

function leadsPage(ctx, leads, url) {
  const stats = leadStats(leads);
  const rows = filterLeads(leads, url);
  const view = url.searchParams.get("view") === "pipeline" ? "pipeline" : "list";
  const selectedId = url.searchParams.get("lead") || "";
  const selectedLead = leads.find((lead) => String(lead.id) === selectedId) || null;
  const updated = url.searchParams.get("updated") || "";
  const created = url.searchParams.get("created") || "";
  const message = updated ? `Lead updated · ${updated}` : created ? `Lead registered successfully · ${created}` : "";
  const selectedStage = url.searchParams.get("stage") || "";
  const selectedProduct = url.searchParams.get("product") || "";
  const selectedDate = url.searchParams.get("date") || "all";
  const selectedSort = url.searchParams.get("sort") || "newest";
  const returnTo = `${url.pathname}${url.search}`;
  const clearHref = `${LEADS_PATH}?view=${view}`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>KAIZURO | Dealer Leads</title><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">${CSS}</head><body><div class="shell">${nav(ctx.email, "leads", stats.active)}<main><div class="topbar"><b>Leads ${ctx.staging ? '<span class="test">Staging</span>' : ""}</b><span>${stats.total} registered</span></div><div class="content"><section class="hero"><div><p class="eyebrow">Lead management</p><h1>Leads</h1><p>Search, filter and manage every KAIZURO opportunity. List is the default for scale; Pipeline is there when you want to see movement by stage.</p></div><a class="cta" href="/partners/portal/leads/new">+ New lead</a></section><div class="tabs">${tabs(url, stats)}</div><form class="toolbar" method="get" action="${LEADS_PATH}"><input type="hidden" name="view" value="${view}"><input type="search" name="q" value="${esc(url.searchParams.get("q") || "")}" placeholder="Search customer, email, phone, lead ID, species..."><select name="stage"><option value="">All stages</option>${STAGES.map((s) => `<option ${s === selectedStage ? "selected" : ""}>${s}</option>`).join("")}</select><select name="product"><option value="">All products</option><option value="ASSAULT" ${selectedProduct === "ASSAULT" ? "selected" : ""}>ASSAULT</option><option value="HALO" ${selectedProduct === "HALO" ? "selected" : ""}>HALO</option><option value="OTHER" ${selectedProduct === "OTHER" ? "selected" : ""}>Other / unsure</option></select><select name="date"><option value="all" ${selectedDate === "all" ? "selected" : ""}>All dates</option><option value="7d" ${selectedDate === "7d" ? "selected" : ""}>Last 7 days</option><option value="30d" ${selectedDate === "30d" ? "selected" : ""}>Last 30 days</option><option value="90d" ${selectedDate === "90d" ? "selected" : ""}>Last 90 days</option><option value="ytd" ${selectedDate === "ytd" ? "selected" : ""}>YTD</option></select><select name="sort"><option value="newest" ${selectedSort === "newest" ? "selected" : ""}>Newest</option><option value="activity" ${selectedSort === "activity" ? "selected" : ""}>Last activity</option><option value="oldest" ${selectedSort === "oldest" ? "selected" : ""}>Oldest</option><option value="name" ${selectedSort === "name" ? "selected" : ""}>Customer A–Z</option><option value="stage" ${selectedSort === "stage" ? "selected" : ""}>Stage</option></select><button type="submit">Apply</button><a class="toolbar-clear" href="${esc(clearHref)}">Clear</a></form><div class="viewbar"><div class="viewtoggle"><a class="${view === "list" ? "active" : ""}" href="${esc(queryHref(url, { view: "list", page: 1, lead: null }))}">List</a><a class="${view === "pipeline" ? "active" : ""}" href="${esc(queryHref(url, { view: "pipeline", page: null, lead: null }))}">Pipeline</a></div><div class="result-count">${rows.length} matching · ${stats.attention} need attention · ${stats.active} active · ${stats.conversion}% conversion</div></div>${ctx.staging ? `<div class="notice"><b>Staging scale test.</b> ${stats.total} demo leads are generated only to prove pagination, search and Pipeline behaviour. No dealer data is written.</div>` : ""}${message ? `<div class="message">${esc(message)}</div>` : ""}${detailPanel(selectedLead, returnTo)}${view === "pipeline" ? pipelineView(rows, url, ctx.staging) : listView(rows, url, ctx.staging)}</div></main></div></body></html>`;
}

async function saveStatus(request, env, ctx) {
  if (!validOrigin(request)) return response("Invalid request", 403);
  if (ctx.staging) return response("Staging demo leads are read-only", 403);
  const form = await request.formData();
  const leadId = String(form.get("leadId") || "").trim();
  const status = String(form.get("status") || "").trim();
  if (!leadId || !STAGES.includes(status)) return response("Invalid lead update", 400);
  const referrals = await store(env).listForPartner(ctx.partnerId, "referral");
  if (!referrals.some((lead) => String(lead.id) === leadId)) return response("Lead not found", 404);
  const createdAt = new Date().toISOString();
  await store(env).createSubmission({
    id: `KZLS-${createdAt.slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`,
    type: "lead-status",
    partnerId: ctx.partnerId,
    leadId,
    leadRef: leadId,
    status,
    createdAt,
  });
  let target = String(form.get("returnTo") || LEADS_PATH);
  if (!target.startsWith(LEADS_PATH)) target = LEADS_PATH;
  const targetUrl = new URL(target, request.url);
  targetUrl.searchParams.set("updated", `${leadId} → ${status}`);
  targetUrl.searchParams.delete("lead");
  return Response.redirect(targetUrl.toString(), 303);
}

async function decorateDashboard(responseValue, leads) {
  const type = responseValue.headers.get("Content-Type") || "";
  if (!type.includes("text/html") || responseValue.status !== 200) return responseValue;
  const s = leadStats(leads);
  const widths = [s.total ? 100 : 0, s.total ? Math.round((s.active / s.total) * 100) : 0, s.total ? Math.round((s.won / s.total) * 100) : 0];
  let rw = new HTMLRewriter()
    .on('aside nav a[href="/partners/portal/leads"] small', { element(el) { el.setInnerContent(String(s.active)); } })
    .on('.metrics .metric:nth-child(3) .metric-value', { element(el) { el.setInnerContent(String(s.active)); } })
    .on('.metrics .metric:nth-child(3) .metric-note', { element(el) { el.setInnerContent(`${s.total} total referral${s.total === 1 ? "" : "s"} registered`); } })
    .on('.metrics .metric:nth-child(4) .metric-value', { element(el) { el.setInnerContent(`${s.conversion}%`); } })
    .on('.metrics .metric:nth-child(4) .metric-note', { element(el) { el.setInnerContent(`${s.won} lead${s.won === 1 ? "" : "s"} currently marked won`); } });
  for (let i = 0; i < 3; i += 1) {
    const values = [s.total, s.active, s.won];
    rw = rw.on(`.funnel-row:nth-child(${i + 1}) b`, { element(el) { el.setInnerContent(String(values[i])); } })
      .on(`.funnel-row:nth-child(${i + 1}) .track i`, { element(el) { el.setAttribute("style", `width:${widths[i]}%`); } });
  }
  return rw.transform(responseValue);
}

export default {
  async fetch(request, env, executionCtx) {
    const url = new URL(request.url);
    const allowedHost = url.hostname.toLowerCase() === PORTAL_HOST || env.KZ_ENVIRONMENT === "staging";
    if (!allowedHost) return app.fetch(request, env, executionCtx);

    const isLeadsGet = request.method === "GET" && (url.pathname === LEADS_PATH || url.pathname === `${LEADS_PATH}/`);
    const isStatusPost = request.method === "POST" && url.pathname === STATUS_PATH;
    const isDashboard = request.method === "GET" && ["/partners/portal", "/partners/portal/", "/partners/portal/dashboard", "/partners/portal/dashboard/"].includes(url.pathname);

    if (isLeadsGet || isStatusPost) {
      const ctx = await authContext(request, env, executionCtx);
      if (ctx?.redirect) return ctx.redirect;
      if (!ctx) return Response.redirect(new URL("/", url).toString(), 302);
      if (isStatusPost) return saveStatus(request, env, ctx);
      const leads = await loadLeads(env, ctx);
      return response(leadsPage(ctx, leads, url));
    }

    const inner = await app.fetch(request, env, executionCtx);
    if (!isDashboard) return inner;
    const ctx = await authContext(request, env, executionCtx);
    if (!ctx || ctx.redirect) return inner;
    const leads = await loadLeads(env, ctx);
    return decorateDashboard(inner, leads);
  },
};
