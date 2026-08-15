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

  const transformed = new HTMLRewriter()
    .on("head", {
      element(element) {
        element.append(`<style id="kz-portal-readability-v5">
          /* Final portal sidebar treatment shared by Admin + Dealer. */
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
          html body .shell > aside .nav span {
            display:block!important;
            font-size:15px!important;
            font-weight:400!important;
            line-height:1.25!important;
            letter-spacing:0!important;
            opacity:1!important;
            text-decoration:none!important;
          }
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
          }
        </style>`, { html: true });
      },
    })
    .transform(response);

  return noStore(transformed);
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
