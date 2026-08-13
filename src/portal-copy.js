import app from "./approval-guard.js";
export { PartnerReferrals } from "./approval-guard.js";

const PORTAL_HOST = "portal.kaizuro.com";

const productionFooterMarkup = `
  <div class="footer-brand">
    <strong>KAIZURO</strong>
    <p>Over-engineered on purpose.</p>
  </div>

  <div class="footer-links">
    <nav aria-label="Products">
      <b>Products</b>
      <a href="https://kaizuro.com/#assault">ASSAULT PE6-8</a>
      <a href="https://kaizuro.com/#founder">Founder 100</a>
      <a href="https://kaizuro.com/#halo">HALO PE10-12</a>
    </nav>

    <nav aria-label="KAIZURO">
      <b>KAIZURO</b>
      <a href="https://kaizuro.com/#story">Our Story</a>
      <a href="https://kaizuro.com/#details">Engineering</a>
      <a href="https://kaizuro.com/#proof">Physical Proof</a>
      <a href="https://kaizuro.com/#evolution">Development</a>
    </nav>

    <nav aria-label="Support">
      <b>Support</b>
      <a href="https://kaizuro.com/#terms">Founder Terms</a>
      <a href="mailto:info@kaizuro.com">Contact</a>
      <a href="mailto:info@kaizuro.com?subject=Warranty">Warranty</a>
      <a href="mailto:info@kaizuro.com?subject=Shipping">Shipping</a>
      <a href="mailto:info@kaizuro.com?subject=Privacy">Privacy</a>
    </nav>

    <nav class="footer-socials" aria-label="Follow KAIZURO">
      <b>Follow KAIZURO</b>
      <a href="https://www.instagram.com/kaizuro_official/" target="_blank" rel="noopener noreferrer">Instagram</a>
      <a href="https://www.linkedin.com/in/gregorygriffiths/" target="_blank" rel="noopener noreferrer">Founder Profile</a>
    </nav>
  </div>

  <p class="footer-bottom">KAIZURO · Over-engineered on purpose. © 2026 KAIZURO. All rights reserved.</p>
  <p class="kz-global-legal">KAIZURO™ is a trade mark of KAIZURO. Selected KAIZURO product technologies and designs are patent pending.</p>
`;

const productionFooterStyles = `<style id="kz-production-footer-styles">
  .site-footer.kz-production-footer{
    display:grid!important;
    grid-template-columns:minmax(260px,.8fr) minmax(580px,1.2fr)!important;
    align-items:start!important;
    gap:32px!important;
    padding:clamp(80px,8vw,120px) clamp(64px,5.5vw,80px) 70px!important;
    background:#050505!important;
    border-top:1px solid rgba(255,255,255,.16)!important;
    color:#f4f4f2!important;
  }
  .kz-production-footer .footer-brand strong{display:block;color:#f4f4f2;font-size:clamp(34px,4vw,58px);font-weight:500;letter-spacing:.08em}
  .kz-production-footer .footer-brand p{margin:18px 0 0;color:#a4a4a4!important;font-size:16px;line-height:1.5}
  .kz-production-footer .footer-links{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:44px!important}
  .kz-production-footer .footer-links nav{display:grid!important;gap:14px!important;align-content:start!important}
  .kz-production-footer .footer-links nav b{margin:0 0 8px!important;color:#f4f4f2!important;font-size:11px!important;font-weight:700!important;letter-spacing:.16em!important;text-transform:uppercase!important}
  .kz-production-footer .footer-links nav a{width:fit-content;color:rgba(244,244,242,.72)!important;font-size:14px!important;line-height:1.4!important;text-decoration:none!important;transition:color .18s ease,transform .18s ease}
  .kz-production-footer .footer-links nav a:hover,.kz-production-footer .footer-links nav a:focus-visible{color:#fff!important;transform:translateX(2px)}
  .kz-production-footer .footer-bottom{grid-column:1/-1!important;margin:58px 0 0!important;padding:24px 0 0!important;border-top:1px solid rgba(255,255,255,.16)!important;color:rgba(244,244,242,.48)!important;font-size:12px!important;line-height:1.5!important;letter-spacing:.08em!important;text-transform:uppercase!important}
  .kz-production-footer .kz-global-legal{grid-column:1/-1!important;margin:10px 0 0!important;color:rgba(244,244,242,.45)!important;font-size:12px!important;line-height:1.5!important}
  @media(max-width:1100px){
    .site-footer.kz-production-footer{grid-template-columns:1fr!important;padding:72px 24px 54px!important}
    .kz-production-footer .footer-links{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:42px 32px!important}
  }
  @media(max-width:640px){
    .site-footer.kz-production-footer{padding:58px 20px 44px!important}
    .kz-production-footer .footer-links{grid-template-columns:1fr 1fr!important;gap:34px 26px!important}
    .kz-production-footer .footer-socials{grid-column:1/-1!important}
    .kz-production-footer .footer-bottom{margin-top:30px!important}
  }
</style>`;

function decoratePortalPage(response, stackHero = false) {
  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes("text/html")) return response;

  const rewriter = new HTMLRewriter()
    .on("head", {
      element(element) {
        element.append(`
          <link rel="icon" href="/favicon.svg" type="image/svg+xml">
          <link rel="shortcut icon" href="/favicon.svg">
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#050505">
          <meta name="theme-color" content="#050505">
          ${stackHero ? `${productionFooterStyles}<style>
            .intro h1.kz-portal-hero{max-width:760px;line-height:.96}
            .intro h1.kz-portal-hero span{display:block}
            @media(max-width:520px){.intro h1.kz-portal-hero{line-height:1.01}}
          </style>` : ""}
        `, { html: true });
      },
    });

  if (stackHero) {
    rewriter.on(".intro h1", {
      element(element) {
        element.setAttribute("class", `${element.getAttribute("class") || ""} kz-portal-hero`.trim());
        element.setInnerContent("<span>Register.</span><span>Get approved.</span><span>Start partnering.</span>", { html: true });
      },
    });

    rewriter.on("footer", {
      element(element) {
        element.setAttribute("class", "site-footer kz-production-footer");
        element.setInnerContent(productionFooterMarkup, { html: true });
      },
    });
  }

  return rewriter.transform(response);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const response = await app.fetch(request, env, ctx);
    const host = url.hostname.toLowerCase();

    if (host !== PORTAL_HOST) return response;

    const isLanding = request.method === "GET" && (url.pathname === "/" || url.pathname === "/partners" || url.pathname === "/partners/");
    return decoratePortalPage(response, isLanding && response.status === 200);
  },
};
