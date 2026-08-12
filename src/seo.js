const SITE_URL = "https://kaizuro.com";

const homepageDescription = "KAIZURO builds premium offshore casting rods for GT, tuna, dogtooth tuna and large pelagics. Explore ASSAULT PE6-8, HALO PE10-12, engineering validation and Founder 100 allocation.";
const builtDescription = "How KAIZURO offshore fishing rods are designed in Australia, developed through physical prototypes, tested under load and manufactured with a specialist high-performance rod partner.";
const temporaryNoIndexMarkup = '<meta name="robots" content="noindex,follow,noarchive">';
const siteIconMarkup = '<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="mask-icon" href="/safari-pinned-tab.svg" color="#050505"><meta name="apple-mobile-web-app-title" content="KAIZURO"><meta name="application-name" content="KAIZURO"><meta name="theme-color" content="#050505">';
const homepageLayoutFixMarkup = '<style>#proof.kz-performance-merged>.kz-performance-grid{grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important}</style>';
const assaultPreviewHeroFixMarkup = `<style>
@media (min-width:1001px){
  .assault-hero{height:640px!important;min-height:0!important;display:block!important;align-items:initial!important;background:#111315!important}
  .assault-hero>img{inset:0 0 auto 0!important;width:100%!important;height:230px!important;object-fit:cover!important;object-position:center 56%!important;transform:none!important;filter:brightness(.72) contrast(1.05)!important}
  .assault-hero::after{background:linear-gradient(180deg,rgba(8,9,10,.04) 0,rgba(8,9,10,.10) 38%,rgba(8,9,10,.22) 100%)!important}
  .assault-hero .assault-hero-copy{box-sizing:border-box!important;width:min(760px,calc(100% - 96px))!important;margin:0 auto!important;padding:258px 0 30px!important;transform:none!important}
  .assault-hero h1{font-size:clamp(56px,4.7vw,74px)!important;line-height:.92!important}
  .assault-hero .assault-lead{max-width:720px!important;margin-top:20px!important;font-size:18px!important;line-height:1.5!important}
  .assault-hero .assault-actions{margin-top:24px!important}
}
</style>`;

function jsonLd(value) {
  return `<script type="application/ld+json">${JSON.stringify(value)}</script>`;
}

function applyImagePerformance(rewriter, pathname) {
  const isHomepage = pathname === "/" || pathname === "/index.html";
  const isBuiltPage = pathname === "/how-kaizuro-is-built" || pathname === "/how-kaizuro-is-built/" || pathname === "/how-kaizuro-is-built/index.html";

  if (isHomepage) {
    return rewriter.on(
      '#story img, #assault img, #details img, #technical img, #grip img, #reel img, #founder img, #halo img',
      {
        element(element) {
          element.setAttribute("loading", "lazy");
          element.setAttribute("fetchpriority", "low");
          if (!element.getAttribute("decoding")) {
            element.setAttribute("decoding", "async");
          }
        },
      },
    );
  }

  if (isBuiltPage) {
    return rewriter.on('.built-section img, .built-statement img, .built-quote img, .built-close img', {
      element(element) {
        element.setAttribute("loading", "lazy");
        element.setAttribute("fetchpriority", "low");
        if (!element.getAttribute("decoding")) {
          element.setAttribute("decoding", "async");
        }
      },
    });
  }

  return rewriter;
}

export const homepageSeoMarkup = `
<link rel="canonical" href="${SITE_URL}/">
${siteIconMarkup}
${temporaryNoIndexMarkup}
${homepageLayoutFixMarkup}
<meta property="og:type" content="website">
<meta property="og:site_name" content="KAIZURO">
<meta property="og:locale" content="en_AU">
<meta property="og:title" content="KAIZURO | Premium GT & Tuna Offshore Casting Rods">
<meta property="og:description" content="${homepageDescription}">
<meta property="og:url" content="${SITE_URL}/">
<meta property="og:image" content="${SITE_URL}/assets/kaizuro-site/hero/kaizuro-website-hero-final.png">
<meta property="og:image:alt" content="KAIZURO premium offshore casting rod">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="KAIZURO | Premium GT & Tuna Offshore Casting Rods">
<meta name="twitter:description" content="${homepageDescription}">
<meta name="twitter:image" content="${SITE_URL}/assets/kaizuro-site/hero/kaizuro-website-hero-final.png">
${jsonLd({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      "name": "KAIZURO",
      "url": `${SITE_URL}/`,
      "email": "info@kaizuro.com",
      "description": "Premium offshore casting rods engineered for GT, tuna, dogtooth tuna and large pelagic fishing."
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      "url": `${SITE_URL}/`,
      "name": "KAIZURO",
      "publisher": { "@id": `${SITE_URL}/#organization` },
      "inLanguage": "en-AU"
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      "url": `${SITE_URL}/`,
      "name": "KAIZURO | Premium GT & Tuna Offshore Casting Rods",
      "description": homepageDescription,
      "isPartOf": { "@id": `${SITE_URL}/#website` },
      "about": { "@id": `${SITE_URL}/#organization` },
      "primaryImageOfPage": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/assets/kaizuro-site/hero/kaizuro-website-hero-final.png`
      },
      "inLanguage": "en-AU"
    }
  ]
})}
`;

export const builtSeoMarkup = `
<link rel="canonical" href="${SITE_URL}/how-kaizuro-is-built/">
${siteIconMarkup}
${temporaryNoIndexMarkup}
<meta property="og:type" content="website">
<meta property="og:site_name" content="KAIZURO">
<meta property="og:locale" content="en_AU">
<meta property="og:title" content="How KAIZURO Fishing Rods Are Built | Offshore Rod Engineering">
<meta property="og:description" content="${builtDescription}">
<meta property="og:url" content="${SITE_URL}/how-kaizuro-is-built/">
<meta property="og:image" content="${SITE_URL}/assets/kaizuro-site/AA59F765-F210-4454-B8BB-364E0ED42E3A.jpeg">
<meta property="og:image:alt" content="KAIZURO offshore rod development and manufacturing">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="How KAIZURO Fishing Rods Are Built | Offshore Rod Engineering">
<meta name="twitter:description" content="${builtDescription}">
<meta name="twitter:image" content="${SITE_URL}/assets/kaizuro-site/AA59F765-F210-4454-B8BB-364E0ED42E3A.jpeg">
${jsonLd({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/how-kaizuro-is-built/#webpage`,
      "url": `${SITE_URL}/how-kaizuro-is-built/`,
      "name": "How KAIZURO Fishing Rods Are Built | Offshore Rod Engineering",
      "description": builtDescription,
      "isPartOf": { "@id": `${SITE_URL}/#website` },
      "about": { "@id": `${SITE_URL}/#organization` },
      "primaryImageOfPage": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/assets/kaizuro-site/AA59F765-F210-4454-B8BB-364E0ED42E3A.jpeg`
      },
      "inLanguage": "en-AU"
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "KAIZURO",
          "item": `${SITE_URL}/`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "How KAIZURO Is Built",
          "item": `${SITE_URL}/how-kaizuro-is-built/`
        }
      ]
    }
  ]
})}
`;

export function applySeoHead(rewriter, pathname) {
  const isHomepage = pathname === "/" || pathname === "/index.html";
  const isBuiltPage = pathname === "/how-kaizuro-is-built" || pathname === "/how-kaizuro-is-built/" || pathname === "/how-kaizuro-is-built/index.html";
  const isAssaultPreview = pathname === "/assault-pe6-8-preview" || pathname === "/assault-pe6-8-preview/" || pathname === "/assault-pe6-8-preview/index.html";

  rewriter = applyImagePerformance(rewriter, pathname);

  if (isHomepage) {
    return rewriter
      .on("title", { element(element) { element.setInnerContent("KAIZURO | Premium GT & Tuna Offshore Casting Rods"); } })
      .on('meta[name="description"]', { element(element) { element.setAttribute("content", homepageDescription); } })
      .on("head", { element(element) { element.append(homepageSeoMarkup, { html: true }); } });
  }

  if (isBuiltPage) {
    return rewriter
      .on("title", { element(element) { element.setInnerContent("How KAIZURO Fishing Rods Are Built | Offshore Rod Engineering"); } })
      .on('meta[name="description"]', { element(element) { element.setAttribute("content", builtDescription); } })
      .on("head", { element(element) { element.append(builtSeoMarkup, { html: true }); } });
  }

  if (isAssaultPreview) {
    return rewriter.on("head", {
      element(element) {
        element.append(siteIconMarkup + temporaryNoIndexMarkup + assaultPreviewHeroFixMarkup, { html: true });
      },
    });
  }

  return rewriter.on("head", {
    element(element) {
      element.append(siteIconMarkup + temporaryNoIndexMarkup, { html: true });
    },
  });
}

export function withNoIndexHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set("X-Robots-Tag", "noindex, follow, noarchive");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
