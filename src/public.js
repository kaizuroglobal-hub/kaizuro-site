import app from "./index.js";

const backToTopMarkup = `<style>
  .kz-back-to-top{position:fixed;right:24px;bottom:24px;z-index:70;width:48px;height:48px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.3);background:rgba(5,5,5,.82);color:#f4f4f2;font:400 24px/1 Arial,sans-serif;cursor:pointer;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);opacity:0;visibility:hidden;transform:translateY(8px);pointer-events:none;transition:opacity .2s ease,transform .2s ease,visibility .2s ease,border-color .2s ease}
  .kz-back-to-top.is-visible{opacity:1;visibility:visible;transform:translateY(0);pointer-events:auto}
  .kz-back-to-top:hover,.kz-back-to-top:focus-visible{border-color:rgba(255,255,255,.85);outline:none}
  @media(max-width:640px){.kz-back-to-top{right:16px;bottom:16px;width:44px;height:44px;font-size:22px}}
</style>
<button class="kz-back-to-top" type="button" aria-label="Back to top" title="Back to top">↑</button>
<script>
(function(){
  const button=document.querySelector('.kz-back-to-top');
  if(!button)return;
  const update=()=>button.classList.toggle('is-visible',window.scrollY>500);
  button.addEventListener('click',()=>window.scrollTo({top:0,left:0,behavior:'smooth'}));
  window.addEventListener('scroll',update,{passive:true});
  update();
})();
</script>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Secure same-domain handoff for the Follow the Build email field.
    if (url.pathname === "/join" && request.method === "POST") {
      const form = await request.formData();
      const email = String(form.get("email") || "").trim();
      const mailto = new URL("mailto:info@kaizuro.com");
      mailto.searchParams.set("subject", "KAIZURO Follow the Build");
      mailto.searchParams.set("body", `Please add this email to the KAIZURO update list:\n\n${email}`);
      return Response.redirect(mailto.toString(), 303);
    }

    if (!url.pathname.startsWith("/partners")) {
      const response = await env.ASSETS.fetch(request);
      const isHtml = response.headers.get("Content-Type")?.includes("text/html");
      const isHomepage = url.pathname === "/" || url.pathname === "/index.html";

      if (isHtml) {
        const rewriter = new HTMLRewriter()
          .on("body", {
            element(element) {
              element.append(backToTopMarkup, { html: true });
            },
          });

        if (isHomepage) {
          rewriter
            .on('#updates form', {
              element(element) {
                element.setAttribute("action", "/join");
                element.setAttribute("method", "post");
                element.removeAttribute("enctype");
              },
            })
            .on('#specifications .specifications-list > div:nth-child(9) dd', {
              element(element) {
                element.setInnerContent("FUJI DPSSD GM Deluxe Seat");
              },
            })
            .on('script[src^="script.js"]', {
              element(element) {
                // Force production browsers onto the current CTA-enabled script.
                element.setAttribute("src", "script.js?v=20260811-cta-restore");
              },
            })
            .on('footer nav[aria-label="KAIZURO"] a[href="#evolution"]', {
              element(element) {
                element.before('<a href="/how-kaizuro-is-built/">How KAIZURO Is Built</a><a href="/partners/portal">Partners</a>', { html: true });
              },
            });
        }

        return rewriter.transform(response);
      }

      if (url.pathname === "/script.js" && response.headers.get("Content-Type")?.includes("javascript")) {
        const source = await response.text();
        const before = 'brandNav.innerHTML = \'<b>KAIZURO</b><a href="#story">Our Story</a><a href="#details">Engineering</a><a href="#proof">Physical Proof</a><a href="#evolution">Development</a>\';';
        const after = 'brandNav.innerHTML = \'<b>KAIZURO</b><a href="#story">Our Story</a><a href="#details">Engineering</a><a href="#proof">Physical Proof</a><a href="/how-kaizuro-is-built/">How KAIZURO Is Built</a><a href="/partners/portal">Partners</a><a href="#evolution">Development</a>\';';
        const headers = new Headers(response.headers);
        headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
        return new Response(source.replace(before, after), {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      }

      return response;
    }

    return app.fetch(request, env);
  },
};
