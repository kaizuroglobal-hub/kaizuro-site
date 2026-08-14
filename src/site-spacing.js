import app from "./dealer-bootstrap.js";
export { PartnerReferrals } from "./dealer-bootstrap.js";

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

export default {
  async fetch(request, env, ctx) {
    const response = await app.fetch(request, env, ctx);
    const host = new URL(request.url).hostname.toLowerCase();
    if (!PUBLIC_HOSTS.has(host) || request.method !== "GET" || response.status !== 200) return response;
    return tightenFollowBuild(response);
  },
};
