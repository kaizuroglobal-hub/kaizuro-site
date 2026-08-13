import app from "./main.js";
export { PartnerReferrals } from "./main.js";

const HOMEPAGE_PATHS = new Set(["/", "/index.html"]);

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
