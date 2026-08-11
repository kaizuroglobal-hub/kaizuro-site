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

const mergedStoryMarkup = `<style>
  #story.kz-story-merged{padding-bottom:0;row-gap:clamp(56px,7vw,96px)}
  #story>#principles.kz-principles-merged{grid-column:1/-1;width:100vw;margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw);padding:clamp(96px,11vw,154px) 0}
  @media(max-width:900px){#story.kz-story-merged{padding-bottom:0;row-gap:52px}#story>#principles.kz-principles-merged{grid-column:1/-1;padding:78px 0}}
  @media(max-width:640px){#story.kz-story-merged{row-gap:40px}#story>#principles.kz-principles-merged{padding:64px 0}}
</style>
<script>
(function(){
  const story=document.querySelector('#story');
  const principles=document.querySelector('#principles');
  if(!story||!principles||principles.parentElement===story)return;
  const duplicate=[...story.querySelectorAll('.story-copy>p:not(.eyebrow)')].find((p)=>{
    const text=p.textContent.replace(/\\s+/g,' ').trim().toLowerCase();
    return text.includes('remove compromise')&&text.includes('prove the structure')&&text.includes('refine relentlessly');
  });
  if(duplicate)duplicate.remove();
  story.classList.add('kz-story-merged');
  principles.classList.add('kz-principles-merged');
  story.appendChild(principles);
})();
</script>`;

const mergedEngineeringMarkup = `<script>
(function(){
  const main=document.querySelector('main');
  const details=document.querySelector('#details');
  const technical=document.querySelector('#technical');
  const grip=document.querySelector('#grip');
  const reel=document.querySelector('#reel');
  if(!main||!details||!technical||!grip||!reel)return;
  if(details.closest('#engineering'))return;
  const sections=[details,technical,grip,reel];
  if(!sections.every((section)=>section.parentElement===main))return;
  const engineering=document.createElement('section');
  engineering.id='engineering';
  engineering.className='kz-engineering-chapter';
  engineering.setAttribute('aria-label','ASSAULT Engineering');
  main.insertBefore(engineering,details);
  sections.forEach((section,index)=>{
    section.dataset.engineeringSubsection=String(index+1).padStart(2,'0');
    engineering.appendChild(section);
  });
  window.dispatchEvent(new Event('resize'));
})();
</script>`;

const mergedHaloUpdatesMarkup = `<style>
  #halo.kz-halo-follow-merged>#updates.kz-halo-follow-panel{box-sizing:border-box;background:#f4f4f2;color:#050505}
  #halo.kz-halo-follow-merged>#updates.kz-halo-follow-panel .capture-box{box-sizing:border-box}
  #halo.kz-halo-follow-merged>#updates.kz-halo-follow-panel .capture-box>p:not(.eyebrow){color:rgba(5,5,5,.68)}
  #halo.kz-halo-follow-merged>#updates.kz-halo-follow-panel .capture-box>small{color:rgba(5,5,5,.54)}
  @media(min-width:901px){
    #halo.kz-halo-follow-merged{grid-template-rows:auto auto!important;align-items:center!important}
    html body main #halo.kz-halo-follow-merged>#updates.kz-halo-follow-panel{grid-column:1/-1!important;grid-row:2!important;width:100%!important;max-width:none!important;min-height:0!important;height:auto!important;margin:clamp(38px,4vw,62px) 0 0!important;padding:clamp(48px,5vw,72px)!important;align-self:stretch!important}
    html body main #halo.kz-halo-follow-merged>#updates.kz-halo-follow-panel>.capture-box.content-grid{display:grid!important;justify-items:center!important;align-content:center!important;width:min(760px,100%)!important;max-width:760px!important;margin:0 auto!important;padding:0!important;text-align:center!important}
    html body main #halo.kz-halo-follow-merged>#updates.kz-halo-follow-panel .capture-box form{width:min(680px,100%)!important;margin:26px auto 0!important}
  }
  @media(max-width:900px){
    #halo.kz-halo-follow-merged{display:grid!important;grid-template-columns:1fr!important;min-height:0!important;height:auto!important;padding:48px 0!important;overflow:hidden!important}
    #halo.kz-halo-follow-merged .halo-copy{position:relative!important;grid-column:1!important;grid-row:1!important;width:calc(100% - 48px)!important;max-width:none!important;margin:0 auto!important;padding:0!important}
    #halo.kz-halo-follow-merged .full-bleed-image{position:relative!important;inset:auto!important;grid-column:1!important;grid-row:2!important;width:calc(100% - 48px)!important;height:auto!important;margin:34px auto 0!important}
    #halo.kz-halo-follow-merged .focal-halo img{display:block!important;width:100%!important;height:auto!important;aspect-ratio:16/10!important;object-fit:cover!important;object-position:center!important}
    #halo.kz-halo-follow-merged .hero-scrim,#halo.kz-halo-follow-merged::after{display:none!important}
    html body main #halo.kz-halo-follow-merged>#updates.kz-halo-follow-panel{grid-column:1!important;grid-row:3!important;width:calc(100% - 48px)!important;min-height:0!important;height:auto!important;margin:36px auto 0!important;padding:40px 24px!important}
    html body main #halo.kz-halo-follow-merged>#updates.kz-halo-follow-panel>.capture-box.content-grid{width:100%!important;max-width:720px!important;margin:0 auto!important;padding:0!important;text-align:left!important}
  }
  @media(max-width:640px){
    #halo.kz-halo-follow-merged{padding:40px 0!important}
    #halo.kz-halo-follow-merged .halo-copy,#halo.kz-halo-follow-merged .full-bleed-image{width:calc(100% - 40px)!important}
    html body main #halo.kz-halo-follow-merged>#updates.kz-halo-follow-panel{width:calc(100% - 40px)!important;margin-top:30px!important;padding:34px 20px!important}
  }
</style>
<script>
(function(){
  const halo=document.querySelector('#halo');
  const updates=document.querySelector('#updates');
  if(!halo||!updates||updates.parentElement===halo)return;
  const repeatedEyebrow=updates.querySelector('.capture-box>.eyebrow');
  if(repeatedEyebrow)repeatedEyebrow.remove();
  halo.classList.add('kz-halo-follow-merged');
  updates.classList.add('kz-halo-follow-panel');
  halo.appendChild(updates);
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
            .on("body", {
              element(element) {
                element.append(mergedStoryMarkup + mergedEngineeringMarkup + mergedHaloUpdatesMarkup, { html: true });
              },
            })
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