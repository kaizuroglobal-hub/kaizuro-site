const SITE_URL = "https://kaizuro.com";

const homepageDescription = "KAIZURO builds premium offshore casting rods for GT, tuna, dogtooth tuna and large pelagics. Explore ASSAULT PE6-8, HALO PE10-12, engineering validation and Founder 100 allocation.";
const builtDescription = "How KAIZURO offshore fishing rods are designed in Australia, developed through physical prototypes, tested under load and manufactured with a specialist high-performance rod partner.";
const temporaryNoIndexMarkup = '<meta name="robots" content="noindex,follow,noarchive">';
const publicIndexMarkup = '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">';
const siteIconMarkup = '<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="mask-icon" href="/safari-pinned-tab.svg" color="#050505"><meta name="apple-mobile-web-app-title" content="KAIZURO"><meta name="application-name" content="KAIZURO"><meta name="theme-color" content="#050505">';
const homepageLayoutFixMarkup = '<style>#proof.kz-performance-merged>.kz-performance-grid{grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important}</style>';
const assaultPreviewHeroFixMarkup = `<style>
@media (min-width:1001px){
  .assault-hero{height:840px!important;min-height:0!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:36px!important;position:relative!important;overflow:hidden!important;background:#050606!important}
  .assault-hero>img{position:relative!important;inset:auto!important;display:block!important;width:100%!important;height:300px!important;flex:0 0 300px!important;object-fit:cover!important;object-position:center 56%!important;transform:none!important;margin:0!important;filter:brightness(.72) contrast(1.05)!important;-webkit-mask-image:linear-gradient(to bottom,#000 0%,#000 78%,transparent 100%)!important;mask-image:linear-gradient(to bottom,#000 0%,#000 78%,transparent 100%)!important}
  .assault-hero::after{content:""!important;position:absolute!important;inset:0!important;background:linear-gradient(180deg,rgba(8,9,10,.04) 0%,rgba(8,9,10,.06) 34%,rgba(8,9,10,.16) 58%,rgba(8,9,10,.34) 100%)!important;pointer-events:none!important}
  .assault-hero .assault-hero-copy{position:relative!important;z-index:2!important;box-sizing:border-box!important;width:min(900px,calc(100% - 96px))!important;margin:0 auto!important;padding:0!important;transform:none!important;flex:0 0 auto!important}
  .assault-hero h1{font-size:clamp(54px,4.5vw,70px)!important;line-height:.92!important;white-space:nowrap!important}
  .assault-hero h1 span{display:inline!important}
  .assault-hero h1 span+span{margin-left:.18em!important}
  .assault-hero .assault-lead{max-width:860px!important;margin-top:18px!important;font-size:17px!important;line-height:1.5!important}
  .assault-hero .assault-actions{margin-top:44px!important}
  .assault-status div{text-align:center!important}

  .assault-section{padding-top:110px!important;padding-bottom:110px!important}

  .assault-intro-grid{display:block!important}
  .assault-intro-grid>div:first-child{margin-bottom:48px!important}
  .assault-intro-grid .assault-copy{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:1px!important;max-width:none!important;padding:0 1px!important;box-sizing:border-box!important;border-top:0!important;align-items:start!important}
  .assault-intro-grid .assault-copy p,
  .assault-intro-grid .assault-copy strong{box-sizing:border-box!important;display:block!important;max-width:none!important;margin:0!important;padding:28px 30px 30px!important;border:0!important;color:var(--assault-muted)!important;font-size:15px!important;font-weight:400!important;line-height:1.65!important;letter-spacing:normal!important;text-align:left!important}
  .assault-intro-grid .assault-copy strong{color:#fff!important;font-size:22px!important;font-weight:600!important;line-height:1.18!important;letter-spacing:-.02em!important}
  .assault-principles{margin-top:0!important}

  #specifications .assault-note{font-size:20px!important;line-height:1.5!important;color:#fff!important}
  #specifications .assault-specs-list dt,
  #specifications .assault-specs-list dd{font-size:15px!important;line-height:1.5!important}

  .assault-proof-grid>div:first-child .assault-copy{margin-left:0!important;padding-left:0!important;text-align:left!important}
  .assault-proof-grid>div:first-child .assault-copy p{margin-left:0!important;padding-left:0!important;text-align:left!important}
}
</style>`;

const assaultPreviewFooterFixMarkup = `<style>
.footer-socials{display:grid;gap:13px;align-content:start}
.footer-socials b{color:rgba(255,255,255,.54);font-size:11px;letter-spacing:.16em;text-transform:uppercase}
.footer-socials a{width:fit-content;color:rgba(255,255,255,.78);font-size:14px;text-decoration:none;transition:color .18s ease,transform .18s ease}
.footer-socials a:hover,.footer-socials a:focus-visible{color:#fff;transform:translateX(2px)}
.mobile-socials{display:none}
@media(min-width:1101px){.site-footer .footer-links{grid-template-columns:repeat(4,minmax(0,1fr))!important}}
@media(max-width:1100px){.footer-socials{margin-top:30px}.mobile-socials{display:grid;gap:12px;margin-top:26px;padding-top:22px;border-top:1px solid rgba(255,255,255,.14)}.mobile-socials span{color:rgba(255,255,255,.48);font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase}.mobile-socials a{color:rgba(255,255,255,.8);font-size:15px;text-decoration:none}}
@media(max-width:640px){.site-footer .footer-links{grid-template-columns:1fr 1fr!important;gap:34px 26px!important}.footer-socials{grid-column:1/-1}}
</style>`;

const depositTermsFixMarkup = `<script>
(function(){
  const assaultFounderSource="ASSAULT PE6-8 is available within KAIZURO Founder 100 at a Founder price of $799 AUD, with a 25% deposit of $199.75 credited in full against the final purchase price.";
  const assaultFounderTarget="ASSAULT PE6-8 is available within KAIZURO Founder 100 at a Founder price of $799 AUD, with a 30% deposit of $240 credited in full against the final purchase price. The remaining balance is $559 AUD.";
  const replacements=[
    ["$199.75","$240"],
    ["$599.25","$559"],
    ["$249.75","$300"],
    ["$749.25","$699"],
    ["25%","30%"],
    ["75%","70%"]
  ];
  const fixTextNode=(node)=>{
    const parent=node.parentElement;
    if(!parent||/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/i.test(parent.tagName))return;
    let next=node.nodeValue||"";
    if(next.includes(assaultFounderSource))next=next.split(assaultFounderSource).join(assaultFounderTarget);
    for(const [from,to] of replacements)next=next.split(from).join(to);
    if(next!==node.nodeValue)node.nodeValue=next;
  };
  const apply=(root=document.body)=>{
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(fixTextNode);
  };
  const start=()=>{
    apply();
    if(!document.body)return;
    const observer=new MutationObserver((mutations)=>{
      for(const mutation of mutations){
        if(mutation.type==="characterData")fixTextNode(mutation.target);
        for(const node of mutation.addedNodes||[]){
          if(node.nodeType===Node.TEXT_NODE)fixTextNode(node);
          else if(node.nodeType===Node.ELEMENT_NODE)apply(node);
        }
      }
    });
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
  window.addEventListener("kaizuro:content-loaded",()=>apply());
})();
</script>`;

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
${publicIndexMarkup}
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
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/favicon.svg`
      },
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
${publicIndexMarkup}
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
  const isHaloPreview = pathname === "/halo-pe10-12-preview" || pathname === "/halo-pe10-12-preview/" || pathname === "/halo-pe10-12-preview/index.html";

  rewriter = applyImagePerformance(rewriter, pathname);

  if (isHomepage) {
    return rewriter
      .on("title", { element(element) { element.setInnerContent("KAIZURO | Premium GT & Tuna Offshore Casting Rods"); } })
      .on('meta[name="description"]', { element(element) { element.setAttribute("content", homepageDescription); } })
      .on("head", { element(element) { element.append(homepageSeoMarkup + depositTermsFixMarkup, { html: true }); } });
  }

  if (isBuiltPage) {
    return rewriter
      .on("title", { element(element) { element.setInnerContent("How KAIZURO Fishing Rods Are Built | Offshore Rod Engineering"); } })
      .on('meta[name="description"]', { element(element) { element.setAttribute("content", builtDescription); } })
      .on("head", { element(element) { element.append(builtSeoMarkup, { html: true }); } });
  }

  if (isAssaultPreview) {
    return rewriter
      .on("head", {
        element(element) {
          element.append(siteIconMarkup + temporaryNoIndexMarkup + assaultPreviewHeroFixMarkup + assaultPreviewFooterFixMarkup + depositTermsFixMarkup, { html: true });
        },
      })
      .on('.site-footer .footer-links nav[aria-label="Products"]', {
        element(element) {
          element.setInnerContent('<b>Products</b><a href="/#assault">ASSAULT PE6-8</a><a href="/#founder">Founder 100</a><a href="/#halo">HALO PE10-12</a>', { html: true });
        },
      })
      .on('.site-footer .footer-links nav[aria-label="KAIZURO"]', {
        element(element) {
          element.setInnerContent('<b>KAIZURO</b><a href="/#story">Our Story</a><a href="/#details">Engineering</a><a href="/#proof">Physical Proof</a><a href="/how-kaizuro-is-built/">How KAIZURO Is Built</a><a href="/partners/portal">Partners</a><a href="/#evolution">Development</a>', { html: true });
        },
      })
      .on('.site-footer .footer-links nav[aria-label="Support"]', {
        element(element) {
          element.setInnerContent('<b>Support</b><a href="/#terms">Founder Terms</a><a href="mailto:info@kaizuro.com">Contact</a><a href="mailto:info@kaizuro.com?subject=Warranty">Warranty</a><a href="mailto:info@kaizuro.com?subject=Shipping">Shipping</a><a href="mailto:info@kaizuro.com?subject=Privacy">Privacy</a>', { html: true });
        },
      })
      .on('.site-footer .footer-links', {
        element(element) {
          element.append('<nav class="footer-socials" aria-label="Follow KAIZURO"><b>Follow KAIZURO</b><a href="https://www.instagram.com/kaizuro_official/" target="_blank" rel="noopener noreferrer">Instagram</a><a href="https://www.linkedin.com/in/gregorygriffiths/" target="_blank" rel="noopener noreferrer">Founder Profile</a></nav>', { html: true });
        },
      })
      .on('.site-footer .footer-bottom', {
        element(element) {
          element.setInnerContent('KAIZURO · Over-engineered on purpose. © 2026 KAIZURO. All rights reserved.');
        },
      });
  }

  if (isHaloPreview) {
    return rewriter.on("head", {
      element(element) {
        element.append(siteIconMarkup + temporaryNoIndexMarkup + depositTermsFixMarkup, { html: true });
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
