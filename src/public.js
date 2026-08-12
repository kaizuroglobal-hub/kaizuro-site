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
    const text=p.textContent.replace(/\s+/g,' ').trim().toLowerCase();
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

const mergedPerformanceMarkup = `<style>
  #proof.kz-performance-merged{box-sizing:border-box;min-height:0!important;height:auto!important;padding:clamp(78px,7vw,112px) var(--pad)!important;background:#070707!important}
  #proof.kz-performance-merged>.kz-performance-grid{display:grid;grid-template-columns:minmax(0,.86fr) minmax(0,1.14fr);column-gap:clamp(72px,7vw,110px);width:100%;max-width:var(--max);margin:0 auto;border-top:1px solid rgba(244,244,242,.18)}
  #proof.kz-performance-merged .kz-performance-proof{min-width:0;padding:clamp(34px,3vw,48px) 0 0}
  #proof.kz-performance-merged #specifications.kz-performance-specs{display:block!important;box-sizing:border-box!important;min-width:0!important;min-height:0!important;height:auto!important;margin:0!important;padding:clamp(34px,3vw,48px) 0 0!important;border:0!important;background:transparent!important;align-content:start!important;position:relative!important}
  #proof.kz-performance-merged #specifications.kz-performance-specs:before{content:"";position:absolute;top:0;bottom:0;left:calc(clamp(72px,7vw,110px)/-2);width:1px;background:rgba(244,244,242,.22)}
  #proof.kz-performance-merged .kz-performance-proof>div:first-child{margin-bottom:clamp(28px,3vw,42px)}
  #proof.kz-performance-merged .kz-performance-proof>div:first-child>.eyebrow{margin-bottom:clamp(24px,2vw,32px)}
  #proof.kz-performance-merged .kz-performance-proof h2,
  #proof.kz-performance-merged .kz-performance-specs h2{max-width:none!important;margin:0 0 clamp(22px,2vw,30px)!important;font-size:clamp(42px,4vw,64px)!important;font-weight:300!important;line-height:1.02!important;letter-spacing:-.03em!important;color:#f4f4f2!important}
  #proof.kz-performance-merged .kz-performance-specs h2{display:flex!important;flex-wrap:wrap!important;gap:0 .18em!important;white-space:normal!important}
  #proof.kz-performance-merged .kz-performance-specs h2 span{display:inline!important;white-space:nowrap!important}
  #proof.kz-performance-merged .kz-performance-proof>div:first-child>p:not(.eyebrow){max-width:620px;color:rgba(244,244,242,.68)}
  #proof.kz-performance-merged .proof-panel{border-top:1px solid rgba(244,244,242,.18)!important}
  #proof.kz-performance-merged .metric-row{padding:clamp(14px,1.3vw,19px) 0!important;border-bottom:1px solid rgba(244,244,242,.16)!important}
  #proof.kz-performance-merged .metric-row strong{font-size:clamp(34px,3.2vw,50px)!important}
  #proof.kz-performance-merged .load-curve{box-sizing:border-box;width:100%!important;max-width:none!important;height:auto!important;aspect-ratio:2.05/1!important;margin:clamp(24px,2.5vw,36px) 0 0!important;padding:0!important;overflow:hidden!important;border:1px solid rgba(244,244,242,.18)!important;border-radius:8px!important;background:#050505!important}
  #proof.kz-performance-merged .load-curve svg{display:block!important;width:100%!important;height:100%!important}
  #proof.kz-performance-merged .curve-heading{max-width:680px;margin:18px 0 10px!important;font-size:clamp(17px,1.4vw,21px)!important;color:rgba(244,244,242,.72)!important}
  #proof.kz-performance-merged .proof-disclosure{max-width:680px;color:rgba(244,244,242,.48)!important}
  #proof.kz-performance-merged #specifications .specifications-intro{margin:0 0 clamp(34px,3vw,44px)!important}
  #proof.kz-performance-merged #specifications .specifications-intro>.eyebrow{margin-bottom:clamp(24px,2vw,32px)!important}
  #proof.kz-performance-merged #specifications .specifications-summary{max-width:680px;margin:0!important;color:rgba(244,244,242,.64)!important}
  #proof.kz-performance-merged #specifications .specifications-list{margin:0!important;border-top:1px solid rgba(244,244,242,.24)!important}
  #proof.kz-performance-merged #specifications .specifications-list div{grid-template-columns:minmax(132px,.48fr) minmax(0,1.52fr)!important;gap:28px!important;padding:17px 0!important;border-bottom:1px solid rgba(244,244,242,.14)!important}
  #proof.kz-performance-merged #specifications dt{color:rgba(244,244,242,.56)!important}
  #proof.kz-performance-merged #specifications dd{color:#f4f4f2!important}
  #proof.kz-performance-merged #specifications .specifications-list div:nth-child(n+8) dd{white-space:nowrap!important;font-size:clamp(15px,1.1vw,18px)!important}
  #proof.kz-performance-merged #specifications .specifications-note{grid-column:auto!important;max-width:680px;margin:18px 0 0!important;color:rgba(244,244,242,.46)!important}
  #proof.kz-performance-merged .kz-performance-proof>div:first-child .kaizuro-section-cta{display:none!important}
  #proof.kz-performance-merged #specifications .kaizuro-section-cta[data-cta-tone="primary"]{box-sizing:border-box;min-height:54px;margin-top:clamp(34px,3vw,42px)!important;padding:0 26px!important;border:1px solid rgba(205,205,202,.72)!important;background:transparent!important;color:#cdcdca!important}
  #proof.kz-performance-merged #specifications .kaizuro-section-cta[data-cta-tone="primary"]:hover,
  #proof.kz-performance-merged #specifications .kaizuro-section-cta[data-cta-tone="primary"]:focus-visible{border-color:#e0e0dd!important;color:#e0e0dd!important;background:transparent!important}
  @media(max-width:1100px){
    #proof.kz-performance-merged{padding:64px 24px!important}
    #proof.kz-performance-merged>.kz-performance-grid{grid-template-columns:1fr;column-gap:0}
    #proof.kz-performance-merged .kz-performance-proof{padding:34px 0 54px}
    #proof.kz-performance-merged #specifications.kz-performance-specs{padding:52px 0 0!important;border-top:1px solid rgba(244,244,242,.22)!important}
    #proof.kz-performance-merged #specifications.kz-performance-specs:before{display:none}
    #proof.kz-performance-merged .kz-performance-proof h2,#proof.kz-performance-merged .kz-performance-specs h2{font-size:clamp(40px,7vw,58px)!important}
    #proof.kz-performance-merged #specifications .specifications-list div:nth-child(n+8) dd{white-space:normal!important;font-size:inherit!important}
  }
  @media(max-width:640px){
    #proof.kz-performance-merged{padding:52px 20px!important}
    #proof.kz-performance-merged .kz-performance-proof{padding-top:28px;padding-bottom:44px}
    #proof.kz-performance-merged #specifications.kz-performance-specs{padding-top:44px!important}
    #proof.kz-performance-merged .kz-performance-proof h2,#proof.kz-performance-merged .kz-performance-specs h2{font-size:clamp(38px,10vw,48px)!important}
    #proof.kz-performance-merged #specifications .specifications-list div{grid-template-columns:1fr!important;gap:7px!important;padding:15px 0!important}
    #proof.kz-performance-merged #specifications .kaizuro-section-cta[data-cta-tone="primary"]{width:100%!important}
  }
</style>
<script>
(function(){
  const proof=document.querySelector('#proof');
  const specifications=document.querySelector('#specifications');
  const proofGrid=proof?.querySelector('.proof-grid');
  const specificationsGrid=specifications?.querySelector('.specifications-grid');
  if(!proof||!specifications||!proofGrid||!specificationsGrid||proof.classList.contains('kz-performance-merged'))return;

  const performanceGrid=document.createElement('div');
  performanceGrid.className='kz-performance-grid';

  const proofColumn=document.createElement('div');
  proofColumn.className='kz-performance-proof';
  while(proofGrid.firstChild)proofColumn.appendChild(proofGrid.firstChild);

  const specsColumn=document.createElement('div');
  specsColumn.className='kz-performance-specs';
  specsColumn.id='specifications';
  while(specificationsGrid.firstChild)specsColumn.appendChild(specificationsGrid.firstChild);

  const performanceEyebrow=proofColumn.querySelector(':scope>div:first-child>.eyebrow');
  if(performanceEyebrow)performanceEyebrow.textContent='Performance & Specifications';

  performanceGrid.appendChild(proofColumn);
  performanceGrid.appendChild(specsColumn);
  proofGrid.replaceWith(performanceGrid);
  specifications.remove();
  proof.classList.add('kz-performance-merged');
})();
</script>`;

const commercialTermsLightMarkup = `<style>
  #terms.terms-section{background:#f4f4f2!important;color:#050505!important}
  #terms .eyebrow{color:rgba(5,5,5,.52)!important}
  #terms h2,#terms .terms-list summary{color:#050505!important}
  #terms .terms-list{border-top-color:rgba(5,5,5,.22)!important}
  #terms .terms-list details{border-bottom-color:rgba(5,5,5,.22)!important}
  #terms .terms-list p{color:rgba(5,5,5,.66)!important}
</style>`;

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
                element.append(mergedStoryMarkup + mergedEngineeringMarkup + mergedPerformanceMarkup + commercialTermsLightMarkup, { html: true });
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