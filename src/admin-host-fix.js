import app from "./kaizuro-admin.js";
export { PartnerReferrals } from "./kaizuro-admin.js";

const ADMIN_PREFIX = "/kaizuro-admin";
const PUBLIC_HOSTS = new Set(["kaizuro.com", "www.kaizuro.com"]);
const INTERNAL_ADMIN_HOST = "portal.kaizuro.com";

function rewriteLocation(response, request) {
  const location = response.headers.get("Location");
  if (!location) return response;
  const source = new URL(location, request.url);
  if (source.hostname !== INTERNAL_ADMIN_HOST) return response;
  const targetBase = new URL(request.url);
  source.protocol = targetBase.protocol;
  source.hostname = targetBase.hostname;
  source.port = targetBase.port;
  const headers = new Headers(response.headers);
  headers.set("Location", source.toString());
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function improveAdminReadability(response) {
  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes("text/html") || response.status !== 200) return response;

  return new HTMLRewriter()
    .on("head", {
      element(element) {
        element.append(`<style id="kz-admin-readability-v2">
          /* KAIZURO Admin: high-contrast, larger navigation for desktop/tablet */
          .shell > aside .brand {
            color:#fff!important;
            font-size:23px!important;
            font-weight:700!important;
            letter-spacing:.18em!important;
            line-height:1.1!important;
          }
          .shell > aside .label {
            color:#fff!important;
            opacity:.82!important;
            font-size:11px!important;
            font-weight:800!important;
            letter-spacing:.17em!important;
            line-height:1.25!important;
          }
          .shell > aside nav {
            gap:7px!important;
            margin-top:40px!important;
          }
          .shell > aside .nav {
            min-height:52px!important;
            padding:0 14px!important;
            color:#fff!important;
            font-size:14px!important;
            font-weight:600!important;
            line-height:1.2!important;
            border-color:transparent!important;
          }
          .shell > aside .nav span {
            color:#fff!important;
            opacity:1!important;
          }
          .shell > aside .nav small {
            color:#fff!important;
            opacity:.92!important;
            font-size:10px!important;
            font-weight:800!important;
            letter-spacing:.05em!important;
          }
          .shell > aside .nav.active {
            background:#1a1c1e!important;
            border-color:#3a3d40!important;
            color:#fff!important;
          }
          .shell > aside .nav.active span,
          .shell > aside .nav.active small {
            color:#fff!important;
            opacity:1!important;
          }
          .shell > aside .side {
            color:#fff!important;
            font-size:11px!important;
            line-height:1.55!important;
            border-top-color:#555!important;
          }
          .shell > aside .side a {
            color:#fff!important;
            font-size:11px!important;
            font-weight:600!important;
            line-height:1.45!important;
            opacity:1!important;
          }

          /* Tablet: retain readable labels rather than collapsing too early */
          @media (max-width:1000px) and (min-width:701px) {
            .shell { grid-template-columns:220px 1fr!important; }
            .shell > aside { padding:24px 16px!important; }
            .shell > aside .brand {
              font-size:20px!important;
            }
            .shell > aside .brand:after { content:none!important; }
            .shell > aside .label,
            .shell > aside .nav span,
            .shell > aside .nav small,
            .shell > aside .side {
              display:block!important;
            }
            .shell > aside .nav {
              justify-content:space-between!important;
              font-size:13px!important;
              min-height:50px!important;
            }
          }

          /* Mobile menu/header remains compact, but any visible sidebar text stays white */
          @media (max-width:700px) {
            .shell > aside .brand {
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
    const isAdminPath = url.pathname === ADMIN_PREFIX || url.pathname.startsWith(`${ADMIN_PREFIX}/`);
    if (!PUBLIC_HOSTS.has(url.hostname.toLowerCase()) || !isAdminPath) {
      return app.fetch(request, env, ctx);
    }

    const internalUrl = new URL(request.url);
    internalUrl.hostname = INTERNAL_ADMIN_HOST;
    const internalRequest = new Request(internalUrl.toString(), request);
    let response = await app.fetch(internalRequest, env, ctx);
    response = rewriteLocation(response, request);
    return improveAdminReadability(response);
  },
};
