const SITE_URL = "https://kaizuro.com";

const homepageDescription = "KAIZURO builds premium offshore casting rods for GT, tuna, dogtooth tuna and large pelagics. Explore ASSAULT PE6-8, HALO PE10-12, engineering validation and Founder 100 allocation.";
const builtDescription = "How KAIZURO offshore fishing rods are designed in Australia, developed through physical prototypes, tested under load and manufactured with a specialist high-performance rod partner.";

function jsonLd(value) {
  return `<script type="application/ld+json">${JSON.stringify(value)}</script>`;
}

export const homepageSeoMarkup = `
<link rel="canonical" href="${SITE_URL}/">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
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
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
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

  return rewriter;
}

export function withNoIndexHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
