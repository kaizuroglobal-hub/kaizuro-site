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

function forcePortalReadability(response, pathname) {
  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes("text/html") || response.status !== 200) return response;

  const isAdmin = pathname === "/kaizuro-admin" || pathname.startsWith("/kaizuro-admin/");
  const isDealer = pathname === "/partners/portal" || pathname.startsWith("/partners/portal/");
  if (!isAdmin && !isDealer) return response;

  return new HTMLRewriter()
    .on("head", {
      element(element) {
        element.append(`<style id="kz-portal-readability-v3">
          /* Final response-layer override: Admin + Dealer readability */
          body .shell > aside {
            width:auto!important;
          }
          body .shell > aside .brand {
            color:#fff!important;
            font-size:24px!important;
            font-weight:700!important;
            line-height:1.1!important;
            letter-spacing:.17em!important;
            opacity:1!important;
          }
          body .shell > aside .label,
          body .shell > aside .portal-label {
            display:block!important;
            color:#fff!important;
            font-size:11px!important;
            font-weight:800!important;
            line-height:1.3!important;
            letter-spacing:.16em!important;
            opacity:.9!important;
          }
          body .shell > aside nav {
            display:grid!important;
            gap:7px!important;
            margin-top:38px!important;
          }
          body .shell > aside .nav {
            display:flex!important;
            align-items:center!important;
            justify-content:space-between!important;
            min-height:54px!important;
            padding:0 14px!important;
            color:#fff!important;
            font-size:15px!important;
            font-weight:600!important;
            line-height:1.25!important;
            opacity:1!important;
          }
          body .shell > aside .nav span {
            display:block!important;
            color:#fff!important;
            font-size:15px!important;
            font-weight:600!important;
            opacity:1!important;
          }
          body .shell > aside .nav small {
            display:block!important;
            color:#fff!important;
            font-size:11px!important;
            font-weight:800!important;
            line-height:1!important;
            letter-spacing:.04em!important;
            opacity:1!important;
          }
          body .shell > aside .nav.active {
            background:#1b1d1f!important;
            border-color:#45484b!important;
            color:#fff!important;
          }
          body .shell > aside .nav.active span,
          body .shell > aside .nav.active small {
            color:#fff!important;
          }
          body .shell > aside .side {
            display:block!important;
            color:#fff!important;
            font-size:12px!important;
            font-weight:500!important;
            line-height:1.6!important;
            border-top-color:#5b5d60!important;
            opacity:1!important;
          }
          body .shell > aside .side a {
            display:block!important;
            margin:12px 0 0!important;
            color:#fff!important;
            font-size:12px!important;
            font-weight:600!important;
            line-height:1.45!important;
            text-decoration:none!important;
            opacity:1!important;
          }

          /* Keep full readable sidebar on iPad/tablet sizes. */
          @media (max-width:1100px) and (min-width:701px) {
            body .shell {
              grid-template-columns:240px minmax(0,1fr)!important;
            }
            body .shell > aside {
              padding:26px 18px!important;
            }
            body .shell > aside .brand {
              font-size:22px!important;
            }
            body .shell > aside .brand:after {
              content:none!important;
              display:none!important;
            }
            body .shell > aside .label,
            body .shell > aside .portal-label,
            body .shell > aside .nav span,
            body .shell > aside .nav small,
            body .shell > aside .side {
              display:block!important;
            }
            body .shell > aside .nav {
              justify-content:space-between!important;
              min-height:52px!important;
              font-size:14px!important;
            }
            body .shell > aside .nav span {
              font-size:14px!important;
            }
          }

          /* Existing mobile layout remains compact below 700px. */
          @media (max-width:700px) {
            body .shell > aside .brand {
              color:#fff!important;
              font-size:18px!important;
            }
          }
        </style>`, { html: true });
      },
    })
    .transform(response);
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
