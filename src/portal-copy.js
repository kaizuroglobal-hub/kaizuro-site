import app from "./approval-guard.js";
export { PartnerReferrals } from "./approval-guard.js";

const PORTAL_HOST = "portal.kaizuro.com";

function decoratePortalPage(response, stackHero = false) {
  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes("text/html")) return response;

  const rewriter = new HTMLRewriter()
    .on("head", {
      element(element) {
        element.append(`
          <link rel="icon" href="/favicon.svg" type="image/svg+xml">
          <link rel="shortcut icon" href="/favicon.svg">
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#050505">
          <meta name="theme-color" content="#050505">
          ${stackHero ? `<style>
            .intro h1.kz-portal-hero{max-width:760px;line-height:.96}
            .intro h1.kz-portal-hero span{display:block}
            @media(max-width:520px){.intro h1.kz-portal-hero{line-height:1.01}}
          </style>` : ""}
        `, { html: true });
      },
    });

  if (stackHero) {
    rewriter.on(".intro h1", {
      element(element) {
        element.setAttribute("class", `${element.getAttribute("class") || ""} kz-portal-hero`.trim());
        element.setInnerContent("<span>Register.</span><span>Get approved.</span><span>Start partnering.</span>", { html: true });
      },
    });
  }

  return rewriter.transform(response);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const response = await app.fetch(request, env, ctx);
    const host = url.hostname.toLowerCase();

    if (host !== PORTAL_HOST) return response;

    const isLanding = request.method === "GET" && (url.pathname === "/" || url.pathname === "/partners" || url.pathname === "/partners/");
    return decoratePortalPage(response, isLanding && response.status === 200);
  },
};
