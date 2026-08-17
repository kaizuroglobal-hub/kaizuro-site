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
  .kz-why-list{list-style:none;margin:22px 0 0;padding:0;display:grid;gap:10px;max-width:620px}
  .kz-why-list li{position:relative;margin:0;padding:0 0 0 22px;color:inherit;font:inherit;line-height:inherit}
  .kz-why-list li::before{content:"•";position:absolute;left:0;top:0;color:rgba(244,244,242,.88);font-size:1em;line-height:inherit}
  .kz-why-list strong{font-weight:700}
  @media(max-width:640px){.kz-why-list{gap:12px;margin-top:20px}.kz-why-list li{padding-left:20px}}
</style>
<script>
(function(){
  function applyWhyKaizuroBullets(){
    const paragraphs=[...document.querySelectorAll('p')];
    const target=paragraphs.find((p)=>{
      const text=p.textContent.replace(/\\s+/g,' ').trim();
      return text.includes('1. Remove Compromise')&&text.includes('2. Prove the structure')&&text.includes('3. Refine relentlessly');
    });
    if(!target||target.dataset.kzWhyBullets==='true')return;

    const list=document.createElement('ul');
    list.className='kz-why-list';
    list.setAttribute('aria-label','Why KAIZURO principles');
    list.innerHTML=`
      <li><strong>Remove Compromise.</strong> Every component must justify its weight, geometry and function.</li>
      <li><strong>Prove the structure.</strong> Physical prototype testing informs every meaningful decision.</li>
      <li><strong>Refine relentlessly.</strong> Test, learn, correct and repeat until the complete system performs as intended.</li>`;
    target.dataset.kzWhyBullets='true';
    target.replaceWith(list);
  }
  applyWhyKaizuroBullets();
  window.addEventListener('DOMContentLoaded',applyWhyKaizuroBullets,{once:true});
  window.addEventListener('kaizuro:content-loaded',applyWhyKaizuroBullets);
  window.setTimeout(applyWhyKaizuroBullets,100);
  window.setTimeout(applyWhyKaizuroBullets,500);
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
