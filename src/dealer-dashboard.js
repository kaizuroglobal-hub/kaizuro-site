import app from "./portal-copy.js";
export { PartnerReferrals } from "./portal-copy.js";

const PORTAL_HOST = "portal.kaizuro.com";
const DASHBOARD_PATHS = new Set([
  "/partners/portal",
  "/partners/portal/",
  "/partners/portal/dashboard",
  "/partners/portal/dashboard/",
]);

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
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

function referralStats(accountHtml = "") {
  const refs = [...new Set(accountHtml.match(/KZR-\d{8}-[A-Z0-9]{8}/g) || [])];
  const won = (accountHtml.match(/<td>\s*Won\s*<\/td>/gi) || []).length;
  const lost = (accountHtml.match(/<td>\s*Lost\s*<\/td>/gi) || []).length;
  const active = Math.max(0, refs.length - won - lost);
  const conversion = refs.length ? Math.round((won / refs.length) * 100) : 0;
  return { total: refs.length, active, won, conversion };
}

function money(value) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function dashboardHtml({ email, stats, staging }) {
  const safeEmail = esc(email || "KAIZURO Partner");
  const sales = 0;
  const grossProfit = 0;
  const momentum = stats.total ? Math.min(100, 20 + stats.active * 5 + stats.won * 15) : 0;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <meta name="theme-color" content="#070809">
  <title>KAIZURO | Dealer Command Centre</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root{--bg:#ecece8;--ink:#101113;--muted:#6d7175;--line:#d2d3cf;--card:#f8f8f5;--dark:#08090a;--dark2:#111315;--white:#f7f7f4;--green:#1d7a47;--gold:#9b7a2d}
    *{box-sizing:border-box}html,body{margin:0;min-height:100%;font-family:Inter,Arial,sans-serif;background:var(--bg);color:var(--ink)}body{min-height:100svh}a{color:inherit}
    .shell{display:grid;grid-template-columns:250px minmax(0,1fr);min-height:100svh}
    aside{position:sticky;top:0;height:100svh;display:flex;flex-direction:column;padding:30px 22px;background:var(--dark);color:#fff;border-right:1px solid rgba(255,255,255,.08)}
    .brand{display:block;margin:0 0 7px;font-size:20px;font-weight:600;letter-spacing:.17em;text-decoration:none}.portal-label{color:rgba(255,255,255,.42);font-size:9px;font-weight:700;letter-spacing:.17em;text-transform:uppercase}
    nav{display:grid;gap:4px;margin-top:44px}.nav-link{display:flex;align-items:center;justify-content:space-between;min-height:42px;padding:0 12px;color:rgba(255,255,255,.58);font-size:12px;text-decoration:none;border:1px solid transparent}.nav-link:hover{color:#fff}.nav-link.active{background:#17191b;color:#fff;border-color:rgba(255,255,255,.1)}.nav-link small{font-size:8px;color:rgba(255,255,255,.32);letter-spacing:.09em;text-transform:uppercase}
    .side-bottom{margin-top:auto;padding-top:22px;border-top:1px solid rgba(255,255,255,.12)}.side-email{overflow:hidden;text-overflow:ellipsis;color:rgba(255,255,255,.7);font-size:11px;white-space:nowrap}.side-links{display:flex;gap:16px;margin-top:13px}.side-links a{color:rgba(255,255,255,.42);font-size:10px;text-decoration:none}
    main{min-width:0;padding:0 0 80px}.topbar{display:flex;align-items:center;justify-content:space-between;min-height:74px;padding:0 clamp(24px,4vw,58px);background:#f6f6f3;border-bottom:1px solid var(--line)}.topbar-title{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}.status{display:inline-flex;align-items:center;gap:8px;color:#55595d;font-size:10px;font-weight:600}.status:before{content:"";width:7px;height:7px;border-radius:50%;background:#2b995d}.test-badge{display:inline-flex;margin-left:10px;padding:5px 8px;border:1px solid #bd9a45;color:#7b6020;font-size:8px;font-weight:800;letter-spacing:.11em;text-transform:uppercase}
    .content{width:min(1450px,calc(100% - clamp(40px,7vw,100px)));margin:0 auto;padding-top:clamp(38px,5vw,68px)}
    .hero{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:40px;align-items:end;padding-bottom:34px;border-bottom:1px solid var(--line)}.eyebrow{margin:0 0 12px;color:#767a7d;font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase}.hero h1{margin:0;font-size:clamp(39px,5vw,68px);font-weight:300;line-height:.98;letter-spacing:-.048em}.hero-copy{max-width:470px;margin:16px 0 0;color:var(--muted);font-size:13px;line-height:1.65}.momentum{width:150px;height:150px;display:grid;place-items:center;border:1px solid #c8c9c5;border-radius:50%;background:#f5f5f1;position:relative}.momentum:before{content:"";position:absolute;inset:9px;border:8px solid #e1e2de;border-top-color:#252729;border-radius:50%;transform:rotate(${Math.max(0, Math.min(100, momentum)) * 1.8 - 45}deg)}.momentum-inner{position:relative;z-index:1;text-align:center}.momentum strong{display:block;font-size:36px;font-weight:400;letter-spacing:-.04em}.momentum span{font-size:8px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#777b7f}
    .metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;margin-top:26px;background:var(--line);border:1px solid var(--line)}.metric{min-height:155px;padding:23px 22px;background:var(--card)}.metric-label{display:flex;justify-content:space-between;gap:10px;color:#666a6e;font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}.metric-label b{color:#8c9093;font-size:8px}.metric-value{display:block;margin-top:30px;font-size:clamp(30px,3vw,44px);font-weight:400;line-height:1;letter-spacing:-.045em}.metric-note{display:block;margin-top:12px;color:#85898c;font-size:10px;line-height:1.4}
    .dashboard-grid{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(300px,.55fr);gap:20px;margin-top:20px}.panel{background:var(--card);border:1px solid var(--line)}.panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;padding:22px 24px 18px;border-bottom:1px solid var(--line)}.panel-head h2{margin:0;font-size:19px;font-weight:500;letter-spacing:-.025em}.panel-head p{margin:6px 0 0;color:#7b7f82;font-size:10px}.range{display:flex;gap:4px}.range span{padding:7px 8px;border:1px solid #d5d6d2;color:#777b7f;font-size:8px;font-weight:700}.range span.active{background:#17191b;color:#fff;border-color:#17191b}
    .chart{position:relative;height:270px;margin:0 24px 24px;padding-top:30px}.chart-grid{position:absolute;inset:30px 0 30px;display:grid;grid-template-rows:repeat(4,1fr);pointer-events:none}.chart-grid i{border-top:1px solid #e0e1dd}.chart-zero{position:absolute;left:0;right:0;bottom:30px;border-top:2px solid #202224}.months{position:absolute;left:0;right:0;bottom:0;display:grid;grid-template-columns:repeat(6,1fr);color:#85898c;font-size:8px;text-align:center}.empty-chart{position:absolute;inset:55px 20px 50px;display:grid;place-items:center;text-align:center;color:#8c9093}.empty-chart strong{display:block;margin-bottom:7px;color:#4d5154;font-size:14px;font-weight:500}.empty-chart span{font-size:10px;line-height:1.5}
    .actions{padding:8px 22px 20px}.action{display:grid;grid-template-columns:36px minmax(0,1fr) auto;gap:13px;align-items:center;padding:15px 0;border-bottom:1px solid #dedfdb;text-decoration:none}.action:last-child{border-bottom:0}.action-num{display:grid;place-items:center;width:32px;height:32px;border:1px solid #c9cbc7;color:#777b7f;font-size:9px}.action strong{display:block;font-size:12px;font-weight:600}.action span{display:block;margin-top:4px;color:#85898c;font-size:9px;line-height:1.35}.action-arrow{color:#55595d;font-size:16px}
    .lower{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;margin-top:20px}.mini-panel{min-height:220px;padding:23px;background:var(--card);border:1px solid var(--line)}.mini-panel h3{margin:0;font-size:17px;font-weight:500;letter-spacing:-.02em}.mini-panel>p{margin:8px 0 22px;color:#7c8083;font-size:10px;line-height:1.5}.funnel{display:grid;gap:8px}.funnel-row{display:grid;grid-template-columns:90px 1fr 24px;gap:10px;align-items:center;color:#626669;font-size:9px}.track{height:7px;background:#e1e2de}.track i{display:block;height:100%;background:#242628}.code-card{display:grid;align-content:space-between;height:140px;padding:17px;background:#111315;color:#fff}.code-card small{color:rgba(255,255,255,.45);font-size:8px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}.code-card strong{font-size:19px;font-weight:500;letter-spacing:.04em}.coming{display:flex;gap:8px;flex-wrap:wrap}.coming span{padding:8px 9px;background:#e8e8e4;color:#676b6e;font-size:8px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
    @media(max-width:1050px){.shell{grid-template-columns:80px minmax(0,1fr)}aside{padding:28px 13px}.brand{font-size:0}.brand:after{content:"K";font-size:20px}.portal-label,.nav-link span,.nav-link small,.side-email,.side-links{display:none}.nav-link{justify-content:center;padding:0}.nav-link:before{content:"•";font-size:18px}.metrics{grid-template-columns:repeat(2,1fr)}.dashboard-grid{grid-template-columns:1fr}.lower{grid-template-columns:1fr 1fr}.lower .mini-panel:last-child{grid-column:1/-1}}
    @media(max-width:700px){.shell{display:block}aside{position:static;height:auto;display:flex;flex-direction:row;align-items:center;padding:17px 18px}.brand{font-size:15px;margin:0}.brand:after{display:none}.portal-label{display:block;margin-left:12px}.side-bottom,aside nav{display:none}.topbar{min-height:58px;padding:0 18px}.content{width:min(100% - 28px,1450px);padding-top:30px}.hero{grid-template-columns:1fr}.momentum{display:none}.hero h1{font-size:42px}.metrics{grid-template-columns:1fr 1fr}.metric{min-height:130px;padding:18px}.metric-value{margin-top:23px;font-size:31px}.lower{grid-template-columns:1fr}.lower .mini-panel:last-child{grid-column:auto}.panel-head{padding:18px}.chart{margin:0 18px 20px}.range{display:none}}
    @media(max-width:430px){.metrics{grid-template-columns:1fr}.hero h1{font-size:38px}.topbar-title{font-size:9px}.status{font-size:9px}.test-badge{display:none}}
  </style>
</head>
<body>
  <div class="shell">
    <aside>
      <a class="brand" href="/partners/portal">KAIZURO</a>
      <span class="portal-label">Dealer Command Centre</span>
      <nav aria-label="Dealer portal">
        <a class="nav-link active" href="/partners/portal"><span>Dashboard</span><small>Live</small></a>
        <a class="nav-link" href="/partners/portal/account#customer-referral"><span>Leads</span><small>${stats.active}</small></a>
        <a class="nav-link" href="#earnings"><span>Earnings</span><small>Next</small></a>
        <a class="nav-link" href="#products"><span>Products</span><small>Next</small></a>
        <a class="nav-link" href="#allocation"><span>Allocation</span><small>Next</small></a>
        <a class="nav-link" href="#marketing"><span>Marketing Studio</span><small>Next</small></a>
        <a class="nav-link" href="#academy"><span>KAIZURO Academy</span><small>Next</small></a>
        <a class="nav-link" href="/partners/portal/account"><span>Account</span></a>
      </nav>
      <div class="side-bottom">
        <div class="side-email">${safeEmail}</div>
        <div class="side-links"><a href="/partners/portal/support">Support</a><a href="/">Sign out / portal</a></div>
      </div>
    </aside>

    <main>
      <div class="topbar">
        <div class="topbar-title">Your KAIZURO Business ${staging ? '<span class="test-badge">Staging test</span>' : ""}</div>
        <div class="status">Partner account active</div>
      </div>

      <div class="content">
        <section class="hero">
          <div>
            <p class="eyebrow">Dealer performance</p>
            <h1>Command your<br>KAIZURO business.</h1>
            <p class="hero-copy">One view of leads, revenue, dealer profit, conversion and the next actions that grow your KAIZURO business. Sales values remain at zero until real attributed transactions are connected.</p>
          </div>
          <div class="momentum" aria-label="Dealer momentum score ${momentum} out of 100"><div class="momentum-inner"><strong>${momentum}</strong><span>Momentum / 100</span></div></div>
        </section>

        <section class="metrics" aria-label="Dealer metrics">
          <article class="metric"><div class="metric-label"><span>Dealer sales</span><b>YTD</b></div><strong class="metric-value">${money(sales)}</strong><span class="metric-note">Attributed KAIZURO revenue</span></article>
          <article class="metric"><div class="metric-label"><span>Est. gross profit</span><b>YTD</b></div><strong class="metric-value">${money(grossProfit)}</strong><span class="metric-note">Activates when dealer pricing + sales connect</span></article>
          <article class="metric"><div class="metric-label"><span>Active leads</span><b>Live</b></div><strong class="metric-value">${stats.active}</strong><span class="metric-note">${stats.total} total referral${stats.total === 1 ? "" : "s"} registered</span></article>
          <article class="metric"><div class="metric-label"><span>Conversion</span><b>Live</b></div><strong class="metric-value">${stats.conversion}%</strong><span class="metric-note">${stats.won} lead${stats.won === 1 ? "" : "s"} currently marked won</span></article>
        </section>

        <div class="dashboard-grid">
          <section class="panel" id="earnings">
            <div class="panel-head"><div><h2>Revenue & dealer earnings</h2><p>Real attributed transaction data only.</p></div><div class="range"><span>30D</span><span>90D</span><span class="active">YTD</span><span>ALL</span></div></div>
            <div class="chart">
              <div class="chart-grid"><i></i><i></i><i></i><i></i></div><div class="chart-zero"></div>
              <div class="empty-chart"><div><strong>No attributed sales yet.</strong><span>Your first attributed KAIZURO sale will start this graph automatically.</span></div></div>
              <div class="months"><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span></div>
            </div>
          </section>

          <section class="panel">
            <div class="panel-head"><div><h2>What to do next</h2><p>Actions that move the dealer business forward.</p></div></div>
            <div class="actions">
              <a class="action" href="/partners/portal/account#customer-referral"><span class="action-num">01</span><span><strong>Register a customer lead</strong><span>Add the next qualified offshore customer.</span></span><span class="action-arrow">→</span></a>
              <a class="action" href="#dealer-code"><span class="action-num">02</span><span><strong>Activate dealer attribution</strong><span>Connect orders to your unique dealer code.</span></span><span class="action-arrow">→</span></a>
              <a class="action" href="#marketing"><span class="action-num">03</span><span><strong>Launch your KAIZURO content</strong><span>Marketing Studio comes next.</span></span><span class="action-arrow">→</span></a>
            </div>
          </section>
        </div>

        <div class="lower">
          <section class="mini-panel">
            <h3>Lead funnel</h3><p>Existing Partner Portal referrals now feed the command centre.</p>
            <div class="funnel">
              <div class="funnel-row"><span>Registered</span><div class="track"><i style="width:${stats.total ? 100 : 0}%"></i></div><b>${stats.total}</b></div>
              <div class="funnel-row"><span>Active</span><div class="track"><i style="width:${stats.total ? Math.round((stats.active / stats.total) * 100) : 0}%"></i></div><b>${stats.active}</b></div>
              <div class="funnel-row"><span>Won</span><div class="track"><i style="width:${stats.total ? Math.round((stats.won / stats.total) * 100) : 0}%"></i></div><b>${stats.won}</b></div>
            </div>
          </section>

          <section class="mini-panel" id="dealer-code">
            <h3>Dealer attribution</h3><p>The next revenue layer connects each sale back to this partner.</p>
            <div class="code-card"><small>Test / login identity</small><strong>${safeEmail}</strong><small>Unique sales code + QR attribution is next</small></div>
          </section>

          <section class="mini-panel" id="marketing">
            <h3>Coming into this portal</h3><p>We build these modules progressively after the dashboard foundation is approved.</p>
            <div class="coming"><span>Territory opportunity</span><span>Stock allocation</span><span>Product mix</span><span>Rewards</span><span>Marketing studio</span><span>QR generator</span><span>Academy</span><span>Leaderboard</span></div>
          </section>
        </div>
      </div>
    </main>
  </div>
</body>
</html>`;
}

function dashboardResponse(data) {
  return new Response(dashboardHtml(data), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=UTF-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Robots-Tag": "noindex,nofollow,noarchive",
    },
  });
}

async function authenticatedAccountProbe(request, env, ctx) {
  const url = new URL(request.url);
  const probeUrl = new URL("/partners/portal/account", url);
  const probe = new Request(probeUrl.toString(), {
    method: "GET",
    headers: request.headers,
  });
  return app.fetch(probe, env, ctx);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const isDashboard = request.method === "GET" && DASHBOARD_PATHS.has(url.pathname);
    if (!isDashboard) return app.fetch(request, env, ctx);

    const staging = env.KZ_ENVIRONMENT === "staging";
    if (staging) {
      return dashboardResponse({
        email: env.KZ_TEST_DEALER_EMAIL || "w3protocol@proton.me",
        stats: { total: 0, active: 0, won: 0, conversion: 0 },
        staging: true,
      });
    }

    if (url.hostname.toLowerCase() !== PORTAL_HOST) return app.fetch(request, env, ctx);

    const probe = await authenticatedAccountProbe(request, env, ctx);
    if (probe.status >= 300 && probe.status < 400) return probe;
    if (probe.status !== 200) return app.fetch(request, env, ctx);

    const accountHtml = await probe.text();
    return dashboardResponse({
      email: cookieUsername(request),
      stats: referralStats(accountHtml),
      staging: false,
    });
  },
};
