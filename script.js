const header = document.querySelector("[data-site-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const chapterTitle = document.querySelector("[data-chapter-title]");
const chapterText = document.querySelector("[data-chapter-text]");
const chapterIndex = document.querySelector("[data-chapter-index]");
const chapterEyebrow = document.querySelector("[data-chapter-eyebrow]");
const chapters = [...document.querySelectorAll("[data-chapter]")];
const reviewSection = new URLSearchParams(window.location.search).get("section");
const brandLink = document.querySelector(".brand-word");

if (reviewSection) {
  const selectedSection = document.getElementById(reviewSection);
  if (selectedSection) {
    document.body.classList.add("section-review");
    document.querySelectorAll("main > section").forEach((section) => {
      section.hidden = section !== selectedSection;
    });
  }
}

const chapterCopy = [
  { eyebrow: "01 · Frame", title: "Strength without careless mass.", text: "Heavy offshore guides must withstand impact, repeated loading and lateral force. The objective is sufficient frame strength and bracing without unnecessary weight in the working section." },
  { eyebrow: "02 · Wrap", title: "Secure where it matters. Controlled everywhere else.", text: "Guide security depends on wrap length, thread build, resin control and preparation beneath the foot. Low-build construction manages avoidable weight and stiffness around the guide location." },
  { eyebrow: "03 · Progression", title: "From line coil to controlled path.", text: "A large offshore spinning reel releases broad coils of braid. Guide size and progression gradually control that movement while maintaining clearance and supporting the blank under load." },
  { eyebrow: "04 · Power", title: "Power carried through the working section.", text: "The main working section balances blank authority, guide support and controlled load transfer. It is where casting recovery becomes sustained pressure when the fight moves under load." }
];

function getChapterData() {
  return Array.isArray(window.kzChapterData) && window.kzChapterData.length ? window.kzChapterData : chapterCopy;
}

let activeChapterIndex = -1;
let chapterScrollTicking = false;

function setHeaderState() { header.classList.toggle("scrolled", window.scrollY > 18); }
function setMenu(open) {
  mobileMenu.classList.toggle("open", open);
  header.classList.toggle("menu-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
}
function setChapter(index) {
  const next = getChapterData()[index];
  if (!next || !chapterTitle || !chapterText || !chapterIndex || index === activeChapterIndex) return;
  activeChapterIndex = index;
  chapterTitle.textContent = next.title;
  chapterText.textContent = next.text;
  chapterIndex.textContent = `${String(index + 1).padStart(2, "0")} / ${String(getChapterData().length).padStart(2, "0")}`;
  if (chapterEyebrow) chapterEyebrow.textContent = next.eyebrow;
}
function updateChapterFromScroll() {
  if (!chapters.length) return;
  const headerHeight = header?.offsetHeight || 0;
  const activationY = headerHeight + ((window.innerHeight - headerHeight) * 0.52);
  const resetY = activationY + Math.min(96, window.innerHeight * 0.09);
  let nextIndex = activeChapterIndex;
  if (nextIndex < 0) {
    nextIndex = 0;
    chapters.forEach((chapter) => {
      if (chapter.getBoundingClientRect().top <= activationY) nextIndex = Number(chapter.dataset.chapter);
    });
  } else {
    while (nextIndex < chapters.length - 1 && chapters[nextIndex + 1].getBoundingClientRect().top <= activationY) nextIndex += 1;
    while (nextIndex > 0 && chapters[nextIndex].getBoundingClientRect().top > resetY) nextIndex -= 1;
  }
  setChapter(nextIndex);
}
function requestChapterUpdate() {
  if (chapterScrollTicking) return;
  chapterScrollTicking = true;
  window.requestAnimationFrame(() => {
    chapterScrollTicking = false;
    updateChapterFromScroll();
  });
}

window.addEventListener("scroll", setHeaderState, { passive: true });
window.addEventListener("scroll", requestChapterUpdate, { passive: true });
window.addEventListener("resize", requestChapterUpdate);
window.addEventListener("kaizuro:content-loaded", () => { activeChapterIndex = -1; updateChapterFromScroll(); });
setHeaderState();
updateChapterFromScroll();

menuToggle.addEventListener("click", () => setMenu(!mobileMenu.classList.contains("open")));
mobileMenu.addEventListener("click", (event) => { if (event.target.closest("a")) setMenu(false); });

function scrollToHashTarget(hash, behavior = "smooth") {
  if (!hash || hash === "#") return;
  const target = document.querySelector(hash);
  if (!target) return;
  const headerHeight = header.offsetHeight || 0;
  const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
  window.scrollTo({ top: Math.max(0, top), behavior });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const hash = link.getAttribute("href");
    const target = hash && document.querySelector(hash);
    if (!target) return;
    event.preventDefault();
    if (link === brandLink) {
      history.pushState(null, "", `${window.location.pathname}${window.location.search}`);
      setMenu(false);
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      return;
    }
    history.pushState(null, "", hash);
    setMenu(false);
    scrollToHashTarget(hash);
  });
});

window.addEventListener("load", () => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
window.addEventListener("hashchange", () => scrollToHashTarget(window.location.hash));

const productLightbox = document.querySelector("[data-product-lightbox]");
const lightboxImage = productLightbox?.querySelector("[data-lightbox-image]");
const lightboxCaption = productLightbox?.querySelector("[data-lightbox-caption]");
const lightboxClose = productLightbox?.querySelector("[data-lightbox-close]");
let lightboxTrigger = null;
const founderForm = document.querySelector(".founder-form");
const founderChoiceTriggers = document.querySelectorAll("[data-founder-field][data-founder-value]");

function setFounderSelection(fieldName, value) {
  const field = founderForm?.elements.namedItem(fieldName);
  if (field && "value" in field) field.value = value;
  founderChoiceTriggers.forEach((trigger) => {
    if (trigger.dataset.founderField !== fieldName) return;
    const selected = trigger.dataset.founderValue === value;
    trigger.classList.toggle("is-selected", selected);
    trigger.setAttribute("aria-pressed", String(selected));
    trigger.closest(".founder-payment-card")?.classList.toggle("is-selected", selected);
    trigger.closest("figure")?.classList.toggle("is-selected", selected);
  });
  document.querySelectorAll("[data-selection-summary]").forEach((summary) => {
    if (summary.dataset.selectionSummary === fieldName) summary.textContent = value || "Not selected";
  });
}
founderChoiceTriggers.forEach((trigger) => trigger.addEventListener("click", () => setFounderSelection(trigger.dataset.founderField, trigger.dataset.founderValue)));
["Preferred rod", "Preferred cap", "Preferred offshore pack"].forEach((fieldName) => {
  const field = founderForm?.elements.namedItem(fieldName);
  if (!field || !("value" in field)) return;
  field.addEventListener("change", () => setFounderSelection(fieldName, field.value));
  setFounderSelection(fieldName, field.value);
});
function closeProductLightbox() { if (productLightbox?.open) productLightbox.close(); }
document.querySelectorAll("[data-lightbox-src]").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    if (!productLightbox || !lightboxImage || !lightboxCaption) return;
    lightboxTrigger = trigger;
    lightboxImage.src = trigger.dataset.lightboxSrc;
    lightboxImage.alt = trigger.dataset.lightboxAlt || "KAIZURO Founder product";
    lightboxCaption.textContent = trigger.dataset.lightboxCaption || "KAIZURO Founder product";
    productLightbox.showModal();
  });
});
lightboxClose?.addEventListener("click", closeProductLightbox);
productLightbox?.addEventListener("click", (event) => { if (event.target === productLightbox) closeProductLightbox(); });
productLightbox?.addEventListener("close", () => {
  lightboxImage?.removeAttribute("src");
  lightboxTrigger?.focus();
  lightboxTrigger = null;
});

(function bootstrapCmsLoader() {
  if (document.querySelector('script[data-kaizuro-cms-loader]')) return;
  const loader = document.createElement("script");
  loader.src = "content-loader.js";
  loader.defer = true;
  loader.dataset.kaizuroCmsLoader = "true";
  loader.addEventListener("error", () => console.warn("[KAIZURO] CMS content loader was unavailable; using HTML fallback content."));
  document.head.appendChild(loader);
})();

(function installSiteCtas() {
  const styleId = "kaizuro-site-cta-styles";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .kaizuro-section-cta{display:inline-flex;align-items:center;justify-content:center;width:fit-content;min-height:52px;margin-top:30px;padding:0 22px;border:1px solid rgba(255,255,255,.34);background:transparent;color:#f5f5f3;font-size:12px;font-weight:700;line-height:1.2;letter-spacing:.03em;text-decoration:none;text-transform:uppercase;transition:transform .18s ease,border-color .18s ease,background .18s ease,color .18s ease}
      .section-light .kaizuro-section-cta{border-color:rgba(15,15,15,.28);color:#111}
      .kaizuro-section-cta:hover,.kaizuro-section-cta:focus-visible{transform:translateY(-2px);border-color:currentColor}
      .kaizuro-section-cta[data-cta-tone="primary"]{border-color:#f2f2ef;background:#f2f2ef;color:#090909}
      .section-light .kaizuro-section-cta[data-cta-tone="primary"]{border-color:#111;background:#111;color:#f5f5f3}
      #founder .founder-roadmap .kaizuro-section-cta,#evolution .roadmap-copy .kaizuro-section-cta,#specifications .specifications-intro .kaizuro-section-cta,#proof .proof-grid>div:first-child .kaizuro-section-cta,#assault .assault-copy .kaizuro-section-cta{margin-top:30px}
      @media(max-width:1100px){.kaizuro-section-cta{min-height:50px;margin-top:26px}}
      @media(max-width:640px){.kaizuro-section-cta{width:100%;min-height:52px;margin-top:24px;padding:0 18px;box-sizing:border-box}}
    `;
    document.head.appendChild(style);
  }
  function bindHashLink(link) {
    if (!link || link.dataset.kaizuroHashBound === "true") return;
    link.dataset.kaizuroHashBound = "true";
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href");
      const target = hash && document.querySelector(hash);
      if (!target) return;
      event.preventDefault();
      history.pushState(null, "", hash);
      setMenu(false);
      scrollToHashTarget(hash);
    });
  }
  function addCta(selector, label, href, tone = "secondary") {
    const host = document.querySelector(selector);
    if (!host) return;
    const key = `${selector}|${label}`;
    if (document.querySelector(`[data-kaizuro-cta="${CSS.escape(key)}"]`)) return;
    const link = document.createElement("a");
    link.className = "kaizuro-section-cta";
    link.href = href;
    link.textContent = label;
    link.dataset.ctaTone = tone;
    link.dataset.kaizuroCta = key;
    host.appendChild(link);
    bindHashLink(link);
  }
  function applyCtas() {
    const headerJoin = document.querySelector(".nav-action");
    if (headerJoin && /Join Founder 100/i.test(headerJoin.textContent)) { headerJoin.href = "#founder-deposit"; bindHashLink(headerJoin); }
    document.querySelectorAll('.hero-actions a').forEach((link) => {
      if (/Join Founder 100/i.test(link.textContent)) { link.href = "#founder-deposit"; bindHashLink(link); }
    });
    addCta("#assault .assault-copy", "Explore ASSAULT Engineering", "#details");
    addCta("#proof .proof-grid > div:first-child", "View ASSAULT Specifications", "#specifications");
    addCta("#specifications .specifications-intro", "Secure Founder Allocation", "#founder-deposit", "primary");
    addCta("#evolution .roadmap-copy", "Join Founder 100", "#founder-deposit", "primary");
    addCta("#founder .founder-roadmap > div:first-child", "Secure Founder Allocation", "#founder-deposit", "primary");
    const founderIntroCta = document.querySelector('#founder .founder-intro a[href="#founder-deposit"]');
    if (founderIntroCta) founderIntroCta.textContent = "Secure Founder Allocation";
    const haloCta = document.querySelector("#halo .halo-copy a");
    if (haloCta) {
      haloCta.href = "#updates";
      haloCta.textContent = "Follow HALO Development";
      haloCta.classList.add("kaizuro-section-cta");
      haloCta.dataset.ctaTone = "secondary";
      bindHashLink(haloCta);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", applyCtas, { once: true }); else applyCtas();
  window.addEventListener("kaizuro:content-loaded", applyCtas);
  window.setTimeout(applyCtas, 150);
  window.setTimeout(applyCtas, 600);
})();

(function installFooterAndSocials() {
  const instagram = "https://www.instagram.com/kaizuro_official/";
  const linkedin = "https://www.linkedin.com/in/gregorygriffiths/";

  function ensureStyles() {
    if (document.getElementById("kaizuro-footer-social-styles")) return;
    const style = document.createElement("style");
    style.id = "kaizuro-footer-social-styles";
    style.textContent = `
      .footer-socials{display:grid;gap:13px;align-content:start}
      .footer-socials b{color:rgba(255,255,255,.54);font-size:11px;letter-spacing:.16em;text-transform:uppercase}
      .footer-socials a{width:fit-content;color:rgba(255,255,255,.78);font-size:14px;text-decoration:none;transition:color .18s ease,transform .18s ease}
      .footer-socials a:hover,.footer-socials a:focus-visible{color:#fff;transform:translateX(2px)}
      .mobile-socials{display:none}
      @media(min-width:1101px){.site-footer .footer-links{grid-template-columns:repeat(4,minmax(0,1fr))!important}}
      @media(max-width:1100px){.footer-socials{margin-top:30px}.mobile-socials{display:grid;gap:12px;margin-top:26px;padding-top:22px;border-top:1px solid rgba(255,255,255,.14)}.mobile-socials span{color:rgba(255,255,255,.48);font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase}.mobile-socials a{color:rgba(255,255,255,.8);font-size:15px;text-decoration:none}}
      @media(max-width:640px){.site-footer .footer-links{grid-template-columns:1fr 1fr!important;gap:34px 26px!important}.footer-socials{grid-column:1/-1}}
    `;
    document.head.appendChild(style);
  }

  function makeLink(label, href) {
    const a = document.createElement("a");
    a.textContent = label;
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    return a;
  }

  function applyFooter() {
    ensureStyles();
    const footer = document.querySelector(".site-footer");
    if (!footer) return;
    const links = footer.querySelector(".footer-links");
    if (!links) return;

    const productNav = links.querySelector('nav[aria-label="Products"]');
    if (productNav) productNav.innerHTML = '<b>Products</b><a href="#assault">ASSAULT PE6-8</a><a href="#founder">Founder 100</a><a href="#halo">HALO PE10-12</a>';

    const brandNav = links.querySelector('nav[aria-label="KAIZURO"]');
    if (brandNav) brandNav.innerHTML = '<b>KAIZURO</b><a href="#story">Our Story</a><a href="#details">Engineering</a><a href="#proof">Physical Proof</a><a href="#evolution">Development</a>';

    const supportNav = links.querySelector('nav[aria-label="Support"]');
    if (supportNav) supportNav.innerHTML = '<b>Support</b><a href="#terms">Founder Terms</a><a href="mailto:info@kaizuro.com">Contact</a><a href="mailto:info@kaizuro.com?subject=Warranty">Warranty</a><a href="mailto:info@kaizuro.com?subject=Shipping">Shipping</a><a href="mailto:info@kaizuro.com?subject=Privacy">Privacy</a>';

    let socials = links.querySelector(".footer-socials");
    if (!socials) {
      socials = document.createElement("nav");
      socials.className = "footer-socials";
      socials.setAttribute("aria-label", "Follow KAIZURO");
      const title = document.createElement("b");
      title.textContent = "Follow KAIZURO";
      socials.append(title, makeLink("Instagram", instagram), makeLink("LinkedIn · Greg Griffiths", linkedin));
      links.appendChild(socials);
    }

    const bottom = footer.querySelector(".footer-bottom");
    if (bottom) bottom.textContent = "KAIZURO · Over-engineered on purpose. © 2026 KAIZURO. All rights reserved.";

    if (mobileMenu && !mobileMenu.querySelector(".mobile-socials")) {
      const mobileSocials = document.createElement("div");
      mobileSocials.className = "mobile-socials";
      const label = document.createElement("span");
      label.textContent = "Follow KAIZURO";
      mobileSocials.append(label, makeLink("Instagram", instagram), makeLink("LinkedIn · Greg Griffiths", linkedin));
      mobileMenu.appendChild(mobileSocials);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", applyFooter, { once: true }); else applyFooter();
  window.addEventListener("kaizuro:content-loaded", applyFooter);
  window.setTimeout(applyFooter, 200);
})();