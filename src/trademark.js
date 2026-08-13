import app from "./public.js";

const HOMEPAGE_PATHS = new Set(["/", "/index.html"]);

const PARTNER_LIGHT_STYLES = `<style id="kz-partner-light-theme">
  body{background:#f3f3f0!important;color:#111214!important}
  .main,.resource-main,.login{background:#f3f3f0!important;color:#111214!important}
  .site-header{background:rgba(5,5,5,.96)!important;border-bottom-color:rgba(255,255,255,.14)!important;color:#f4f4f2!important}
  .site-header a{color:#f4f4f2!important}
  .copy,.small-copy,.section p,.tile p,.resource-card p,.form-note{color:#55595d!important}
  .kicker,.resource-card .mini,.step:before,.tile .tile-link{color:#7c621f!important}
  .title,.resource-title,.section h2,.section h3,.tile h2,.resource-card h3,.card h1{color:#111214!important}
  .card,.meta div,.tile,.resource-card,.step,.quote{background:#fff!important;border-color:#d7d8d6!important;color:#111214!important;box-shadow:0 1px 0 rgba(0,0,0,.02)}
  .tile:hover,.tile:focus-visible{background:#fafaf8!important;border-color:#8f9396!important}
  .meta small,.tile span,.breadcrumb{color:#707478!important}
  .resource-head,.section,.compare th,.compare td{border-color:#d7d8d6!important}
  .breadcrumb{color:#666a6e!important}
  .action,.print-btn{border-color:#1a1b1d!important;background:#fff!important;color:#111214!important}
  .action.primary,.btn{border-color:#111214!important;background:#111214!important;color:#fff!important}
  .action:hover,.print-btn:hover{border-color:#111214!important;background:#f0f0ed!important}
  .card label,.form-grid label{color:#333639!important}
  .card input,.form-grid input,.form-grid textarea,.form-grid select{background:#fff!important;color:#111214!important;border-color:#bfc2c4!important}
  .card input:focus,.form-grid input:focus,.form-grid textarea:focus,.form-grid select:focus{outline:2px solid rgba(17,18,20,.16)!important;outline-offset:1px!important;border-color:#55595d!important}
  .callout{background:#f7f4ea!important;border-left-color:#8c6d20!important;color:#333639!important}
  .quote{color:#111214!important}
  .resource-card ul,.checklist{color:#42464a!important}
  .compare{background:#fff!important;border:1px solid #d7d8d6!important}
  .compare th{background:#f5f5f2!important;color:#666a6e!important}
  .compare td{color:#222426!important}
  .compare td:first-child{color:#606468!important}
  .step{background:#fff!important}
  .error{color:#a42828!important}
  .site-footer{background:#050505!important;color:#fff!important;border-top-color:rgba(255,255,255,.16)!important}
  .site-footer .footer-brand p,.site-footer nav a{color:rgba(255,255,255,.74)!important}
  .site-footer .footer-bottom,.site-footer .footer-legal,.site-footer .kz-global-legal{color:#fff!important;opacity:1!important}
  @media(max-width:640px){.card{padding:28px 22px!important}.main,.resource-main{padding-bottom:70px!important}}
</style>`;

function replaceFirstKaizuroInMain(rewriter) {
  let replaced = false;
  return rewriter.on("main p", {
    text(text) {
      if (replaced || !text.text.includes("KAIZURO") || text.text.includes("KAIZURO™")) return;
      text.replace(text.text.replace("KAIZURO", "KAIZURO™"));
      replaced = true;
    },
  });
}

function setText(rewriter, selector, value) {
  return rewriter.on(selector, {
    element(element) {
      element.setInnerContent(value);
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    const response = await app.fetch(request, env, ctx);
    const contentType = response.headers.get("Content-Type") || "";
    if (!contentType.includes("text/html")) return response;

    const url = new URL(request.url);
    let rewriter = new HTMLRewriter();

    // Keep the copyright and legal/IP lines fully legible on the dark footer.
    rewriter = rewriter.on("head", {
      element(element) {
        element.append(
          '<style>footer .footer-bottom,footer .footer-legal,footer .kz-global-legal{color:#fff!important;opacity:1!important}</style>',
          { html: true },
        );
        if (url.pathname.startsWith("/partners")) {
          element.append(PARTNER_LIGHT_STYLES, { html: true });
        }
      },
    });

    // Every standalone/product/partner page gets one deliberate first-use ™
    // in visible body copy, rather than marking every brand mention.
    rewriter = replaceFirstKaizuroInMain(rewriter);

    if (HOMEPAGE_PATHS.has(url.pathname)) {
      rewriter = setText(
        rewriter,
        '[data-cms-text="hero:eyebrow"]',
        "KAIZURO™ ASSAULT · PE6-8",
      );
      rewriter = setText(
        rewriter,
        '[data-cms-text="story:eyebrow"]',
        "Why KAIZURO™",
      );
      rewriter = setText(
        rewriter,
        '[data-cms-text="assault:lead"]',
        "The first physical expression of the KAIZURO™ philosophy.",
      );
      rewriter = setText(
        rewriter,
        "#proof .content-grid > div:first-child > p:not(.eyebrow)",
        "KAIZURO™ is being developed through physical prototypes, controlled loading and documented revision. The purpose is not to promote one maximum number. It is to understand how the blank, components and finished rod behave as one system.",
      );
      rewriter = setText(
        rewriter,
        "#founder .founder-intro > p:nth-of-type(2)",
        "Founder 100 is the first production allocation in KAIZURO™ history. Each Founder becomes part of the transition from prototype to production and part of the group that proves KAIZURO can exist on its own terms.",
      );
      rewriter = setText(
        rewriter,
        "#terms .terms-list details:nth-of-type(5) p",
        "A numbered Founder rod, Founder Cap, Founder Offshore Pack, Premium Rod Wraps, Offshore Gloves, Large KAIZURO Tackle Box, Founder Certificate and registered Digital Rod Passport.",
      );
      rewriter = setText(
        rewriter,
        "#terms .terms-list details:nth-of-type(6) p",
        "Final warranty coverage, delivery arrangements, shipping costs, applicable duties or taxes, and any ownership transfer conditions will be confirmed in writing before the final balance is requested. Founders will have the opportunity to review these terms before completing their purchase.",
      );
      rewriter = setText(
        rewriter,
        "#halo .halo-copy > p:not(.eyebrow)",
        "HALO is the future KAIZURO™ chapter: a heavier PE10-12 platform for giant GT, very large tuna and expedition pressure. The same philosophy, carried further.",
      );
    }

    return rewriter.transform(response);
  },
};
