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

async function replacePublicGripNaming(response, isHomepage = false) {
  const type = response.headers.get("Content-Type") || "";
  if (!type.includes("text/html") || !response.body) return response;

  const headers = new Headers(response.headers);
  headers.delete("Content-Length");
  const html = await response.text();
  let updated = html.replaceAll(OLD_GRIP_NAME, NEW_GRIP_NAME);

  if (isHomepage) {
    const whyKaizuroBulletFix = `
<style id="kz-why-kaizuro-bullet-fix">
  .kz-why-kaizuro-bullet{font-size:22px!important;font-weight:400!important;line-height:1!important;letter-spacing:0!important;color:rgba(244,244,242,.86)!important;transform:none!important}
  @media(max-width:640px){.kz-why-kaizuro-bullet{font-size:20px!important}}
</style>
<script>
(function(){
  const targets=[
    ['Confidence before volume.','1'],
    ['Pressure before stock.','2'],
    ['Founder 100 before scale.','3']
  ];
  function applyWhyKaizuroBullets(){
    const elements=[...document.querySelectorAll('body *')];
    targets.forEach(([labelText,numberText])=>{
      const label=elements.find((el)=>el.children.length===0&&el.textContent.trim()===labelText);
      if(!label)return;
      let scope=label.parentElement;
      let marker=null;
      for(let level=0;level<3&&scope&&!marker;level+=1){
        marker=[...scope.querySelectorAll('*')].find((el)=>el.children.length===0&&el.textContent.trim()===numberText);
        if(!marker)scope=scope.parentElement;
      }
      if(!marker)return;
      marker.textContent='•';
      marker.classList.add('kz-why-kaizuro-bullet');
      marker.setAttribute('aria-hidden','true');
    });
  }
  applyWhyKaizuroBullets();
  window.addEventListener('kaizuro:content-loaded',applyWhyKaizuroBullets);
  window.setTimeout(applyWhyKaizuroBullets,150);
  window.setTimeout(applyWhyKaizuroBullets,700);
})();
</script>`;
    updated = updated.replace("</body>", `${whyKaizuroBulletFix}\n</body>`);
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
        const response = await publicSite.fetch(canonicalPublicRequest(request, url), env, ctx);
        const publicResponse = withHeaders(response, {
          "X-KAIZURO-Public": normalizedPath === "/" ? "homepage" : "how-kaizuro-is-built",
          "X-Robots-Tag": "all",
          Link: `<${PUBLIC_PAGES.get(normalizedPath)}>; rel="canonical"`,
        });
        const withoutGripSection = normalizedPath === "/" ? removeGripSection(publicResponse) : publicResponse;
        return replacePublicGripNaming(withoutGripSection, normalizedPath === "/");
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
