import app from "./admin-host-fix.js";
export { PartnerReferrals } from "./admin-host-fix.js";

const PUBLIC_HOSTS = new Set(["kaizuro.com", "www.kaizuro.com"]);

function tightenFollowBuild(response) {
  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes("text/html")) return response;

  return new HTMLRewriter()
    .on("head", {
      element(element) {
        element.append(`<style id="kz-follow-build-spacing">
          @media (min-width:1101px) {
            html body main section#updates#updates.capture-section {
              display:grid!important;
              place-items:center!important;
              min-height:0!important;
              height:auto!important;
              padding:56px var(--pad)!important;
            }
            html body main section#updates#updates > .capture-box.content-grid {
              align-content:center!important;
              margin:0 auto!important;
              padding:0!important;
            }
            html body main section#updates#updates .capture-box form {
              margin-top:22px!important;
            }
            html body main section#updates#updates .capture-box > small {
              margin-top:14px!important;
            }
          }
        </style>`, { html: true });
      },
    })
    .transform(response);
}

function noStore(response) {
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  headers.set("Pragma", "no-cache");
  headers.set("Expires", "0");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function forcePortalReadability(response, pathname) {
  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes("text/html") || response.status !== 200) return response;

  const isAdmin = pathname === "/kaizuro-admin" || pathname.startsWith("/kaizuro-admin/");
  const isDealer = pathname === "/partners/portal" || pathname.startsWith("/partners/portal/");
  if (!isAdmin && !isDealer) return response;

  let rewriter = new HTMLRewriter()
    .on("head", {
      element(element) {
        element.append(`<style id="kz-portal-readability-v6">
          /* Shared Admin + Dealer sidebar treatment. */
          html body .shell > aside,
          html body .shell > aside *,
          html body .shell > aside a,
          html body .shell > aside a:link,
          html body .shell > aside a:visited,
          html body .shell > aside a:hover,
          html body .shell > aside a:active {
            color:#fff!important;
            -webkit-text-fill-color:#fff!important;
          }

          html body .shell > aside .brand {
            font-size:24px!important;
            font-weight:700!important;
            line-height:1.1!important;
            letter-spacing:.17em!important;
            opacity:1!important;
            text-decoration:none!important;
          }
          html body .shell > aside .label,
          html body .shell > aside .portal-label {
            display:block!important;
            font-size:11px!important;
            font-weight:700!important;
            line-height:1.3!important;
            letter-spacing:.16em!important;
            opacity:1!important;
          }
          html body .shell > aside nav {
            display:grid!important;
            gap:7px!important;
            margin-top:38px!important;
          }
          html body .shell > aside nav a,
          html body .shell > aside .nav {
            display:flex!important;
            align-items:center!important;
            justify-content:space-between!important;
            min-height:54px!important;
            padding:0 14px!important;
            font-size:15px!important;
            font-weight:400!important;
            line-height:1.25!important;
            opacity:1!important;
            text-decoration:none!important;
          }
          html body .shell > aside nav a span,
          html body .shell > aside .nav span,
          html body .shell > aside nav a small,
          html body .shell > aside .nav small {
            display:block!important;
            font-size:15px!important;
            font-weight:400!important;
            line-height:1.25!important;
            letter-spacing:0!important;
            text-transform:none!important;
            opacity:1!important;
            text-decoration:none!important;
          }
          html body .shell > aside .nav.active,
          html body .shell > aside nav a.active {
            background:#1b1d1f!important;
            border-color:#45484b!important;
          }
          html body .shell > aside .side {
            display:block!important;
            font-size:12px!important;
            font-weight:400!important;
            line-height:1.6!important;
            border-top-color:#5b5d60!important;
            opacity:1!important;
          }
          html body .shell > aside .side a {
            display:block!important;
            margin:12px 0 0!important;
            font-size:12px!important;
            font-weight:400!important;
            line-height:1.45!important;
            text-decoration:none!important;
            opacity:1!important;
          }

          /* Global operational typography: readable minimums across Admin + Dealer. */
          html body .shell > main .top b,
          html body .shell > main .topbar b {
            font-size:12px!important;
          }
          html body .shell > main .top span,
          html body .shell > main .topbar span {
            font-size:12px!important;
          }
          html body .shell > main .eyebrow {
            font-size:11px!important;
            line-height:1.4!important;
          }
          html body .shell > main .hero p {
            font-size:14px!important;
            line-height:1.65!important;
          }
          html body .shell > main .panel h2 {
            font-size:24px!important;
          }
          html body .shell > main .panel h3 {
            font-size:18px!important;
          }
          html body .shell > main .panel p,
          html body .shell > main .requirements,
          html body .shell > main .notice,
          html body .shell > main .success,
          html body .shell > main .message,
          html body .shell > main .empty,
          html body .shell > main .empty span {
            font-size:14px!important;
            line-height:1.6!important;
          }
          html body .shell > main .empty strong {
            font-size:16px!important;
          }

          html body .shell > main .metric small,
          html body .shell > main .commercial small,
          html body .shell > main .profile small,
          html body .shell > main .asset small,
          html body .shell > main .detail-grid small {
            font-size:11px!important;
            line-height:1.35!important;
          }
          html body .shell > main .metric em {
            font-size:12px!important;
            line-height:1.45!important;
          }
          html body .shell > main .commercial b,
          html body .shell > main .profile b,
          html body .shell > main .detail-grid b {
            font-size:14px!important;
            line-height:1.45!important;
          }

          html body .shell > main table th,
          html body .shell > main .table th,
          html body .shell > main .lead-table th {
            font-size:11px!important;
            line-height:1.35!important;
          }
          html body .shell > main table td,
          html body .shell > main .table td,
          html body .shell > main .lead-table td {
            font-size:13px!important;
            line-height:1.45!important;
          }
          html body .shell > main .contact,
          html body .shell > main .activity-row b,
          html body .shell > main .activity-row small,
          html body .shell > main .lead-meta,
          html body .shell > main .result-count,
          html body .shell > main .ref,
          html body .shell > main .detail .id,
          html body .shell > main .mono {
            font-size:12px!important;
            line-height:1.45!important;
          }

          html body .shell > main .badge,
          html body .shell > main .stage-pill,
          html body .shell > main .attention,
          html body .shell > main .test {
            font-size:11px!important;
            line-height:1.2!important;
          }

          html body .shell > main .btn,
          html body .shell > main .cta,
          html body .shell > main button,
          html body .shell > main .toolbar button,
          html body .shell > main .toolbar-clear,
          html body .shell > main .viewtoggle a,
          html body .shell > main .col-more,
          html body .shell > main .stage-form button {
            font-size:12px!important;
            line-height:1.2!important;
          }

          html body .shell > main input,
          html body .shell > main select,
          html body .shell > main textarea,
          html body .shell > main .toolbar input,
          html body .shell > main .toolbar select,
          html body .shell > main .stage-form select {
            font-size:14px!important;
            line-height:1.35!important;
          }
          html body .shell > main .form label,
          html body .shell > main form label {
            font-size:12px!important;
            line-height:1.4!important;
          }

          html body .shell > main .tab,
          html body .shell > main .tab b,
          html body .shell > main .pages a,
          html body .shell > main .pages span,
          html body .shell > main .col-head,
          html body .shell > main .col-head b {
            font-size:12px!important;
            line-height:1.3!important;
          }
          html body .shell > main .lead-card h3 {
            font-size:16px!important;
          }
          html body .shell > main .security a {
            font-size:14px!important;
          }
          html body .shell > main .product ul {
            font-size:14px!important;
            line-height:1.65!important;
          }

          @media (max-width:1100px) and (min-width:701px) {
            html body .shell {
              grid-template-columns:240px minmax(0,1fr)!important;
            }
            html body .shell > aside {
              padding:26px 18px!important;
            }
            html body .shell > aside .brand {
              font-size:22px!important;
            }
            html body .shell > aside .brand:after {
              content:none!important;
              display:none!important;
            }
            html body .shell > aside .label,
            html body .shell > aside .portal-label,
            html body .shell > aside .nav span,
            html body .shell > aside .nav small,
            html body .shell > aside .side {
              display:block!important;
            }
          }

          @media (max-width:700px) {
            html body .shell > aside .brand {
              font-size:18px!important;
            }
            html body .shell > main .hero p,
            html body .shell > main .panel p,
            html body .shell > main .requirements {
              font-size:14px!important;
            }
          }
        </style>`, { html: true });
      },
    });

  if (isDealer) {
    rewriter = rewriter
      .on('a[href="/partners/portal/marketing"] span', {
        element(element) { element.setInnerContent("Marketing"); },
      })
      .on('a[href="/partners/portal/academy"] span', {
        element(element) { element.setInnerContent("Academy"); },
      });
  }

  return noStore(rewriter.transform(response));
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let response = await app.fetch(request, env, ctx);

    response = forcePortalReadability(response, url.pathname);

    const host = url.hostname.toLowerCase();
    if (!PUBLIC_HOSTS.has(host) || request.method !== "GET" || response.status !== 200) return response;
    return tightenFollowBuild(response);
  },
};
