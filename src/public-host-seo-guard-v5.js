import app, { PartnerReferrals } from "./public-host-seo-guard-v4.js";
import publicSite from "./public.js";

export { PartnerReferrals };

const APEX = "kaizuro.com";
const WWW = "www.kaizuro.com";
const PORTAL = "portal.kaizuro.com";
const PUBLIC_HOSTS = new Set([APEX, WWW]);
const PUBLIC_PAGES = new Map([
  ["/", "https://kaizuro.com/"],
  ["/how-kaizuro-is-built/", "https://kaizuro.com/how-kaizuro-is-built/"],
]);
const OLD_GRIP_NAME = "KAIZURO Rounded Pentagonal EVA Grip";
const NEW_GRIP_NAME = "KAIZURO Ergonomic EVA Grip";

function normalizePublicPath(pathname) {
  if (pathname === "/index.html") return "/";
  if (pathname === "/how-kaizuro-is-built" || pathname === "/how-kaizuro-is-built/index.html") {
    return "/how-kaizuro-is-built/";
  }
  return pathname;
}

function canonicalRedirect(url) {
  const target = new URL(url.toString());
  target.protocol = "https:";
  target.hostname = APEX;
  target.port = "";
  target.pathname = normalizePublicPath(target.pathname);
  return new Response(null, {
    status: 301,
    headers: {
      Location: target.toString(),
      "Cache-Control": "public, max-age=3600",
      "X-Robots-Tag": "all",
    },
  });
}

function canonicalPublicRequest(request, url) {
  const target = new URL(request.url);
  target.protocol = "https:";
  target.hostname = APEX;
  target.port = "";
  target.pathname = normalizePublicPath(url.pathname);
  return new Request(target.toString(), request);
}

function withHeaders(response, values) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(values)) headers.set(name, value);
  headers.delete("WWW-Authenticate");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function removeGripSection(response) {
  const type = response.headers.get("Content-Type") || "";
  if (!type.includes("text/html") || !response.body) return response;

  return new HTMLRewriter()
    .on("#grip", {
      element(element) {
        element.remove();
      },
    })
    .transform(response);
}

async function rewritePublicHtml(response, isHomepage = false, canonicalUrl = null) {
  const type = response.headers.get("Content-Type") || "";
  if (!type.includes("text/html") || !response.body) return response;

  const headers = new Headers(response.headers);
  headers.delete("Content-Length");
  const html = await response.text();
  let updated = html.replaceAll(OLD_GRIP_NAME, NEW_GRIP_NAME);

  if (canonicalUrl && !/<link\s+[^>]*rel=["']canonical["']/i.test(updated)) {
    const canonicalTag = `\n    <link rel="canonical" href="${canonicalUrl}">`;
    updated = updated.replace("</head>", canonicalTag + "\n  </head>");
  }

  const publicCopyReplacements = [
    [
      "Choose your Founder rod, pay the correct 25% deposit through\n                Square, then submit your ownership details below. Your deposit\n                is credited in full against the final Founder purchase price.",
      "Choose your Founder rod, complete the initial 25% payment through\n                Square, then submit your ownership details below. The payment\n                is credited in full against the final Founder purchase price."
    ],
    ["Pay 25% deposit", "Pay 25% initial payment"],
    ["Founder deposit options", "Founder payment options"],
    ["Deposit today (25%)", "Initial payment (25%)"],
    [
      "I understand that my Founder allocation is only secured\n                  after the correct 25% deposit has been successfully paid\n                  through Square.",
      "I understand that my Founder allocation is only secured\n                  after the correct initial 25% payment has been successfully completed\n                  through Square."
    ],
  ];

  for (const [from, to] of publicCopyReplacements) {
    updated = updated.replaceAll(from, to);
  }

  if (isHomepage) {
    const oldWhyBlock = "          <p>\n            1. Remove Compromise\n            Every component must justify its weight, geometry and function.\n            2. Prove the structure\n            Physical prototype testing informs every meaningful decision.\n            3. Refine relentlessly\n            Test, learn, correct and repeat until the complete system performs as intended.\n\n          </p>";

    const newWhyBlock = "          <div class=\"kz-why-bullets\" aria-label=\"Why KAIZURO principles\">\n            <p><span class=\"kz-why-dot\" aria-hidden=\"true\">•</span><span><span class=\"kz-why-title\">Remove Compromise.</span> Every component must justify its weight, geometry and function.</span></p>\n            <p><span class=\"kz-why-dot\" aria-hidden=\"true\">•</span><span><span class=\"kz-why-title\">Prove the structure.</span> Physical prototype testing informs every meaningful decision.</span></p>\n            <p><span class=\"kz-why-dot\" aria-hidden=\"true\">•</span><span><span class=\"kz-why-title\">Refine relentlessly.</span> Test, learn, correct and repeat until the complete system performs as intended.</span></p>\n          </div>";

    updated = updated.replace(oldWhyBlock, newWhyBlock);

    const homepageStyle = "\n<style id=\"kz-homepage-production-overrides\">\n#story .kz-why-bullets{display:grid;gap:10px;margin:22px 0 0;max-width:620px}\n#story .kz-why-bullets p{display:grid;grid-template-columns:12px minmax(0,1fr);gap:8px;margin:0!important;padding:0!important;max-width:none!important;color:inherit!important;font-size:inherit!important;font-weight:400!important;line-height:1.55!important;letter-spacing:normal!important}\n#story .kz-why-dot{font-size:14px;line-height:1.55;color:rgba(244,244,242,.82)}\n#story .kz-why-title{font-weight:600;color:#f4f4f2}\n#platforms,#halo,.founder-roadmap{display:none!important}\n.desktop-nav a[href=\"#platforms\"],.desktop-nav a[href=\"#halo\"],.mobile-menu a[href=\"#platforms\"],.mobile-menu a[href=\"#halo\"]{display:none!important}\n@media(max-width:640px){#story .kz-why-bullets{gap:9px;margin-top:18px}#story .kz-why-bullets p{grid-template-columns:11px minmax(0,1fr);gap:7px}}\n</style>";
    updated = updated.replace("</head>", homepageStyle + "\n</head>");

    if (!updated.includes('/platform-section.js')) {
      updated = updated.replace("</body>", '<script src="/platform-section.js?v=20260818-remove-platforms"></script>\n</body>');
    } else {
      updated = updated.replace(/\/platform-section\.js\?v=[^"']+/g, '/platform-section.js?v=20260818-remove-platforms');
    }
  }

  return new Response(updated, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function forceNoIndex(response) {
  const headers = new Headers(response.headers);
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  headers.set("Cache-Control", headers.get("Cache-Control") || "no-store");
  const type = headers.get("Content-Type") || "";

  if (!type.includes("text/html") || !response.body) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  const rewritten = new HTMLRewriter()
    .on("head", {
      element(element) {
        element.append('<meta name="robots" content="noindex,nofollow,noarchive">', { html: true });
      },
    })
    .transform(new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    }));

  return rewritten;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();
    const isRead = request.method === "GET" || request.method === "HEAD";

    if (host === PORTAL && isRead && url.pathname === "/robots.txt") {
      return new Response("User-agent: *\nDisallow: /\n", {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=UTF-8",
          "Cache-Control": "public, max-age=3600",
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      });
    }

    if (PUBLIC_HOSTS.has(host) && isRead) {
      const normalizedPath = normalizePublicPath(url.pathname);
      if (url.protocol !== "https:" || host === WWW || normalizedPath !== url.pathname) {
        return canonicalRedirect(url);
      }

      if (host === APEX && PUBLIC_PAGES.has(normalizedPath)) {
        const canonicalUrl = PUBLIC_PAGES.get(normalizedPath);
        const response = await publicSite.fetch(canonicalPublicRequest(request, url), env, ctx);
        const publicResponse = withHeaders(response, {
          "X-KAIZURO-Public": normalizedPath === "/" ? "homepage" : "how-kaizuro-is-built",
          "X-Robots-Tag": "all",
          Link: `<${canonicalUrl}>; rel="canonical"`,
        });
        const withoutGripSection = normalizedPath === "/" ? removeGripSection(publicResponse) : publicResponse;
        return rewritePublicHtml(withoutGripSection, normalizedPath === "/", canonicalUrl);
      }
    }

    const response = await app.fetch(request, env, ctx);

    if (host === PORTAL) return forceNoIndex(response);

    if (host === APEX && (response.headers.get("Content-Type") || "").includes("text/html")) {
      return forceNoIndex(response);
    }

    return response;
  },

  async email(message, env, ctx) {
    if (typeof app.email === "function") return app.email(message, env, ctx);
  },
};
