(function(){
  "use strict";

  function harmonizeFounder(){
    document.querySelectorAll('#founder-deposit [data-lead-model="true"]').forEach(function(card){
      card.removeAttribute("data-lead-model");
    });

    var terms=document.getElementById("terms");
    if(terms){
      terms.querySelectorAll("p").forEach(function(p){
        if(p.textContent.includes("It is not a purchase, deposit or guaranteed allocation.")){
          p.textContent=p.textContent.replace("It is not a purchase, deposit or guaranteed allocation.","It is not a purchase or guaranteed allocation.");
        }
      });
    }
  }

  function installPlatforms(){
    harmonizeFounder();
    if(document.getElementById("platforms")) return;
    var halo=document.getElementById("halo");
    if(!halo) return;

    var section=document.createElement("section");
    section.id="platforms";
    section.className="kz-platforms";
    section.setAttribute("aria-labelledby","kz-platform-title");
    section.innerHTML=`
      <div class="kz-platform-shell">
        <div class="kz-platform-intro">
          <p class="kz-platform-eyebrow">THE KAIZURO PLATFORM</p>
          <h2 id="kz-platform-title">THREE PLATFORMS.<br>ONE STANDARD.</h2>
          <span class="kz-platform-rule" aria-hidden="true"></span>
          <p>KAIZURO is developing three offshore casting platforms spanning PE4-6, PE6-8 and PE10-12.</p>
          <p>PHANTOM PE4-6, ASSAULT PE6-8 and HALO PE10-12 are all in active development, with each platform being evaluated through prototype testing and manufacturing validation.</p>
          <a class="kz-platform-cta" href="#founder-deposit">REGISTER PLATFORM INTEREST</a>

          <div class="kz-platform-principles" aria-label="KAIZURO platform principles">
            <div><span class="kz-icon" aria-hidden="true">◎</span><b>PURPOSE BUILT</b><small>Each platform designed around a specific fishing application.</small></div>
            <div><span class="kz-icon" aria-hidden="true">≋</span><b>ENGINEERED WITHOUT COMPROMISE</b><small>High modulus carbon, precise tapers and load optimised design.</small></div>
            <div><span class="kz-icon" aria-hidden="true">⬡</span><b>TESTED. PROVEN. REFINED.</b><small>Prototype validated with destructive and real world testing.</small></div>
          </div>
        </div>

        <div class="kz-platform-cards">
          <article class="kz-platform-card">
            <header><span>PE4-6</span><h3>PHANTOM</h3><small>ACTIVE DEVELOPMENT</small></header>
            <img src="/assets/kaizuro-site/platforms/phantom-pe4-6.svg" alt="Coral trout breaking through dark offshore water" loading="lazy">
            <p>A lighter, faster platform for high-frequency casting, responsive lure work and serious offshore fishing for coral trout and reef species.</p>
          </article>

          <article class="kz-platform-card">
            <header><span>PE6-8</span><h3>ASSAULT</h3><small>ACTIVE DEVELOPMENT</small></header>
            <img src="/assets/kaizuro-site/platforms/assault-pe6-8.svg" alt="Giant trevally breaking through dark offshore water" loading="lazy">
            <p>The core offshore platform. Designed around high-output topwater casting, progressive load control and the demands of GT, tuna, kingfish and large pelagics.</p>
          </article>

          <article class="kz-platform-card">
            <header><span>PE10-12</span><h3>HALO</h3><small>ACTIVE DEVELOPMENT</small></header>
            <img src="/assets/kaizuro-site/platforms/halo-pe10-12.svg" alt="Large tuna breaking through dark offshore water" loading="lazy">
            <p>An extreme offshore platform for heavy topwater work, high drag pressure and species such as dogtooth tuna and giant tuna.</p>
          </article>
        </div>

        <div class="kz-platform-status">
          <span class="kz-status-icon" aria-hidden="true">▣</span><b>DEVELOPMENT STATUS</b><i aria-hidden="true"></i>
          <p>All three platforms are currently in prototype development, subject to component refinement, testing and manufacturing confirmation.</p>
        </div>
      </div>`;

    halo.replaceWith(section);

    document.querySelectorAll('.desktop-nav a[href="#halo"], .mobile-menu a[href="#halo"]').forEach(function(link){
      link.href="#platforms";
      link.textContent="PLATFORMS";
    });

    if(!document.getElementById("kz-platform-style")){
      var style=document.createElement("style");
      style.id="kz-platform-style";
      style.textContent=`
#platforms.kz-platforms{background:#000;color:#f4f4f2;padding:clamp(72px,7vw,112px) clamp(24px,4vw,64px);font-family:Inter,Arial,sans-serif}
#platforms .kz-platform-shell{max-width:1560px;margin:0 auto;display:grid;grid-template-columns:minmax(320px,.95fr) minmax(620px,1.65fr);gap:clamp(38px,5vw,82px);align-items:start}
#platforms .kz-platform-intro{min-width:0}
#platforms .kz-platform-eyebrow{margin:0 0 22px;color:rgba(244,244,242,.58);font-size:12px;font-weight:700;letter-spacing:.17em;text-transform:uppercase}
#platforms h2{margin:0;color:#f4f4f2;font-size:clamp(44px,4.1vw,72px);font-weight:400;line-height:.98;letter-spacing:-.035em}
#platforms .kz-platform-rule{display:block;width:54px;height:2px;background:rgba(244,244,242,.65);margin:32px 0 28px}
#platforms .kz-platform-intro>p:not(.kz-platform-eyebrow){max-width:500px;margin:0 0 22px;color:rgba(244,244,242,.70);font-size:16px;line-height:1.65}
#platforms .kz-platform-cta{display:inline-flex;align-items:center;min-height:48px;margin:14px 0 36px;padding:0 22px;border:1px solid rgba(244,244,242,.62);color:#f4f4f2;font-size:11px;font-weight:700;letter-spacing:.08em;text-decoration:none;transition:border-color .2s ease,background .2s ease}
#platforms .kz-platform-cta:hover,#platforms .kz-platform-cta:focus-visible{border-color:#f4f4f2;background:rgba(244,244,242,.06)}
#platforms .kz-platform-principles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;max-width:540px}
#platforms .kz-platform-principles>div{display:grid;justify-items:center;text-align:center;gap:9px;padding:0 18px;border-right:1px solid rgba(244,244,242,.20)}
#platforms .kz-platform-principles>div:first-child{padding-left:0}#platforms .kz-platform-principles>div:last-child{border-right:0;padding-right:0}
#platforms .kz-icon{font-size:28px;font-weight:300;color:rgba(244,244,242,.82)}
#platforms .kz-platform-principles b{color:rgba(244,244,242,.84);font-size:10px;line-height:1.35;letter-spacing:.035em}
#platforms .kz-platform-principles small{color:rgba(244,244,242,.52);font-size:10px;line-height:1.45}
#platforms .kz-platform-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
#platforms .kz-platform-card{overflow:hidden;border:1px solid rgba(244,244,242,.16);border-radius:4px;background:#050607;display:grid;grid-template-rows:auto minmax(260px,1fr) auto;min-width:0}
#platforms .kz-platform-card header{padding:22px 24px 16px}
#platforms .kz-platform-card header>span{display:block;color:rgba(244,244,242,.82);font-size:13px;font-weight:700;letter-spacing:.08em}
#platforms .kz-platform-card h3{margin:10px 0 7px;color:#f4f4f2;font-size:clamp(26px,2vw,38px);font-weight:400;line-height:1;letter-spacing:-.02em}
#platforms .kz-platform-card header small{color:rgba(244,244,242,.62);font-size:10px;font-weight:700;letter-spacing:.08em}
#platforms .kz-platform-card img{width:100%;height:100%;min-height:300px;object-fit:cover;object-position:center;display:block;filter:saturate(.88) contrast(1.04)}
#platforms .kz-platform-card>p{margin:0;padding:20px 24px 24px;color:rgba(244,244,242,.70);font-size:13px;line-height:1.62}
#platforms .kz-platform-status{grid-column:1/-1;display:flex;align-items:center;gap:18px;margin-top:28px;padding:22px 28px;background:#121416;border:1px solid rgba(244,244,242,.06)}
#platforms .kz-status-icon{color:rgba(244,244,242,.82);font-size:20px}#platforms .kz-platform-status b{font-size:12px;letter-spacing:.08em;white-space:nowrap}#platforms .kz-platform-status i{width:1px;height:24px;background:rgba(244,244,242,.22)}#platforms .kz-platform-status p{margin:0;color:rgba(244,244,242,.65);font-size:12px;line-height:1.5}
@media(max-width:1100px){#platforms.kz-platforms{padding:70px 42px}#platforms .kz-platform-shell{grid-template-columns:1fr;gap:40px}#platforms .kz-platform-intro>p:not(.kz-platform-eyebrow){max-width:760px}#platforms .kz-platform-principles{max-width:760px}#platforms .kz-platform-card{grid-template-rows:auto 260px auto}#platforms .kz-platform-card img{min-height:260px}#platforms .kz-platform-status{margin-top:0}}
@media(max-width:640px){#platforms.kz-platforms{padding:58px 20px}#platforms .kz-platform-shell{gap:30px}#platforms .kz-platform-eyebrow{margin-bottom:16px;font-size:10px}#platforms h2{font-size:clamp(38px,12vw,52px);line-height:.96}#platforms .kz-platform-rule{margin:24px 0 22px;width:42px}#platforms .kz-platform-intro>p:not(.kz-platform-eyebrow){font-size:14px;line-height:1.6;margin-bottom:17px}#platforms .kz-platform-cta{width:100%;justify-content:center;margin:8px 0 28px;box-sizing:border-box}#platforms .kz-platform-principles{grid-template-columns:1fr;gap:0}#platforms .kz-platform-principles>div{grid-template-columns:38px minmax(0,1fr);justify-items:start;text-align:left;align-items:center;padding:16px 0;border-right:0;border-bottom:1px solid rgba(244,244,242,.13)}#platforms .kz-platform-principles>div:first-child{padding-left:0}#platforms .kz-platform-principles>div:last-child{border-bottom:0;padding-right:0}#platforms .kz-icon{grid-row:1/3;font-size:24px}#platforms .kz-platform-principles small{font-size:11px}#platforms .kz-platform-cards{grid-template-columns:1fr;gap:12px}#platforms .kz-platform-card{grid-template-columns:minmax(0,1fr) 128px;grid-template-rows:auto auto;min-height:168px}#platforms .kz-platform-card header{padding:18px 18px 6px}#platforms .kz-platform-card h3{font-size:26px}#platforms .kz-platform-card img{grid-column:2;grid-row:1/3;width:128px;height:100%;min-height:168px}#platforms .kz-platform-card>p{padding:7px 18px 18px;font-size:11px;line-height:1.5}#platforms .kz-platform-status{display:grid;grid-template-columns:24px 1fr;gap:8px 10px;padding:18px;margin-top:4px}#platforms .kz-platform-status b{font-size:10px}#platforms .kz-platform-status i{display:none}#platforms .kz-platform-status p{grid-column:1/-1;font-size:10px}}
      `;
      document.head.appendChild(style);
    }
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",installPlatforms,{once:true});
  else installPlatforms();
  window.addEventListener("kaizuro:content-loaded",function(){harmonizeFounder();installPlatforms();});
})();