import app from "./approval-guard.js";
export { PartnerReferrals } from "./approval-guard.js";

const PORTAL_HOST = "portal.kaizuro.com";

function stackPortalHero(response) {
  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes("text/html")) return response;

  return new HTMLRewriter()
    .on("head", {
      element(element) {
        element.append(`<style>
          .intro h1.kz-portal-hero{max-width:760px;line-height:.96}
          .intro h1.kz-portal-hero span{display:block}
          @media(max-width:520px){.intro h1.kz-portal-hero{line-height:1.01}}
        </style>`, { html: true });
      },
    })
    .on(".intro h1", {
      element(element) {
        element.setAttribute("class", `${element.getAttribute("class") || ""} kz-portal-hero`.trim());
        element.setInnerContent("<span>Register.</span><span>Get approved.</span><span>Start partnering.</span>", { html: true });
      },
    })
    .transform(response);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const response = await app.fetch(request, env, ctx);
    const host = url.hostname.toLowerCase();
    const isLanding = request.method === "GET" && (url.pathname === "/" || url.pathname === "/partners" || url.pathname === "/partners/");

    if (host === PORTAL_HOST && isLanding && response.status === 200) {
      return stackPortalHero(response);
    }

    return response;
  },
};
