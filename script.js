const header = document.querySelector("[data-site-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const brandLink = document.querySelector(".brand-word");

function loadEnhancementStyles() {
  if (document.querySelector('link[href*="site-enhancements.css"]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "styles/site-enhancements.css?v=20260731-commercial-restructure";
  document.head.appendChild(link);
}
loadEnhancementStyles();

function setHeaderState() {
  header?.classList.toggle("scrolled", window.scrollY > 18);
}

function setMenu(open) {
  mobileMenu?.classList.toggle("open", open);
  header?.classList.toggle("menu-open", open);
  menuToggle?.setAttribute("aria-expanded", String(open));
}

menuToggle?.addEventListener("click", () => setMenu(!mobileMenu?.classList.contains("open")));
mobileMenu?.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenu(false);
});
window.addEventListener("scroll", setHeaderState, { passive: true });
setHeaderState();

function scrollToHashTarget(hash, behavior = "smooth") {
  if (!hash || hash === "#") return;
  const target = document.querySelector(hash);
  if (!target) return;
  const top = target.getBoundingClientRect().top + window.scrollY - (header?.offsetHeight || 0);
  window.scrollTo({ top: Math.max(0, top), behavior });
}

document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  const hash = link.getAttribute("href");
  const target = hash && document.querySelector(hash);
  if (!target) return;
  event.preventDefault();
  if (link === brandLink) {
    history.pushState(null, "", `${window.location.pathname}${window.location.search}`);
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  history.pushState(null, "", hash);
  setMenu(false);
  scrollToHashTarget(hash);
});

window.addEventListener("hashchange", () => scrollToHashTarget(window.location.hash));

const chapterCopy = [
  { eyebrow: "01 · Frame", title: "Strength without careless mass.", text: "Heavy offshore guides must withstand impact, repeated loading and lateral force without unnecessary weight in the working section." },
  { eyebrow: "02 · Wrap", title: "Secure where it matters. Controlled everywhere else.", text: "Wrap length, thread build, resin control and preparation beneath the foot manage security, stiffness and avoidable mass." },
  { eyebrow: "03 · Progression", title: "From line coil to controlled path.", text: "Guide size and progression gradually control broad coils of braid while supporting the blank under load." },
  { eyebrow: "04 · Power", title: "Power carried through the working section.", text: "The working section balances blank authority, guide support and controlled load transfer under sustained pressure." }
];

const chapters = [...document.querySelectorAll("[data-chapter]")];
const chapterTitle = document.querySelector("[data-chapter-title]");
const chapterText = document.querySelector("[data-chapter-text]");
const chapterIndex = document.querySelector("[data-chapter-index]");
const chapterEyebrow = document.querySelector("[data-chapter-eyebrow]");
let activeChapterIndex = -1;
let chapterTicking = false;

function setChapter(index) {
  const next = chapterCopy[index];
  if (!next || index === activeChapterIndex) return;
  activeChapterIndex = index;
  if (chapterTitle) chapterTitle.textContent = next.title;
  if (chapterText) chapterText.textContent = next.text;
  if (chapterIndex) chapterIndex.textContent = `${String(index + 1).padStart(2, "0")} / 04`;
  if (chapterEyebrow) chapterEyebrow.textContent = next.eyebrow;
}

function updateChapterFromScroll() {
  if (!chapters.length) return;
  const activationY = (header?.offsetHeight || 0) + (window.innerHeight * 0.52);
  let nextIndex = 0;
  chapters.forEach((chapter) => {
    if (chapter.getBoundingClientRect().top <= activationY) nextIndex = Number(chapter.dataset.chapter);
  });
  setChapter(nextIndex);
}

function requestChapterUpdate() {
  if (chapterTicking) return;
  chapterTicking = true;
  requestAnimationFrame(() => {
    chapterTicking = false;
    updateChapterFromScroll();
  });
}
window.addEventListener("scroll", requestChapterUpdate, { passive: true });
window.addEventListener("resize", requestChapterUpdate);
updateChapterFromScroll();

const productLightbox = document.querySelector("[data-product-lightbox]");
const lightboxImage = productLightbox?.querySelector("[data-lightbox-image]");
const lightboxCaption = productLightbox?.querySelector("[data-lightbox-caption]");
const lightboxClose = productLightbox?.querySelector("[data-lightbox-close]");
let lightboxTrigger = null;

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
function closeProductLightbox() { if (productLightbox?.open) productLightbox.close(); }
lightboxClose?.addEventListener("click", closeProductLightbox);
productLightbox?.addEventListener("click", (event) => { if (event.target === productLightbox) closeProductLightbox(); });
productLightbox?.addEventListener("close", () => {
  lightboxImage?.removeAttribute("src");
  lightboxTrigger?.focus();
  lightboxTrigger = null;
});

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

function textMatch(root, selector, match) {
  return [...root.querySelectorAll(selector)].find((el) => el.textContent.trim().toLowerCase() === match.toLowerCase());
}

function enhanceHero() {
  const hero = document.querySelector("#purpose .hero-copy");
  if (!hero) return;
  const eyebrow = hero.querySelector(".eyebrow");
  if (eyebrow) eyebrow.textContent = "KAIZURO OFFSHORE SYSTEMS · ASSAULT PE6-8 · HALO PE10-12";
  const body = hero.querySelector("h1 + p");
  if (body) body.textContent = "Premium offshore casting rods created for anglers who refuse to accept the usual compromises.";
  if (!hero.querySelector(".hero-credibility")) {
    const credibility = document.createElement("p");
    credibility.className = "hero-credibility";
    credibility.textContent = "Designed in Australia. Inspired by Japanese rod-building precision. Developed through physical prototype testing for serious offshore casting.";
    body?.after(credibility);
  }
  const status = document.querySelector(".hero-status");
  if (status) status.innerHTML = "<span>ASSAULT prototype physically tested</span><span>HALO development underway</span>";
}

function consolidateBrandStory() {
  const storyCopy = document.querySelector("#story .story-copy");
  if (!storyCopy || storyCopy.querySelector(".kaizuro-principles-inline")) return;
  const grid = document.createElement("div");
  grid.className = "kaizuro-principles-inline";
  grid.innerHTML = `
    <article><span>01</span><h3>Remove compromise</h3><p>Every material, component and dimension must justify its weight, position and purpose.</p></article>
    <article><span>02</span><h3>Prove the structure</h3><p>Physical prototypes, static loading and offshore feedback guide development decisions.</p></article>
    <article><span>03</span><h3>Refine relentlessly</h3><p>Prototype learning is carried forward before any production specification is locked.</p></article>`;
  storyCopy.appendChild(grid);
  const principles = document.getElementById("principles");
  if (principles) principles.hidden = true;
}

function addRodComparison() {
  if (document.getElementById("rods")) return;
  const grip = document.getElementById("grip");
  if (!grip) return;
  const section = document.createElement("section");
  section.id = "rods";
  section.className = "rod-comparison-section";
  section.innerHTML = `
    <div class="rod-comparison-shell">
      <div class="rod-comparison-intro">
        <p class="eyebrow">Choose Your Platform</p>
        <h2>Two rods. Two levels of offshore authority.</h2>
        <p>Choose ASSAULT for versatile, repeated PE6-8 topwater casting. Choose HALO when maximum PE10-12 authority for giant GT, dogtooth tuna and very large tuna is the priority.</p>
      </div>
      <div class="rod-comparison-grid">
        <article class="rod-comparison-card">
          <span class="rod-comparison-card__status">Physical prototype delivered and tested</span>
          <h3>ASSAULT <small>PE6-8</small></h3>
          <p class="rod-comparison-card__lead">High-output offshore casting for GT, tuna, kingfish and demanding pelagic applications.</p>
          <dl><div><dt>Best for</dt><dd>Versatility and repeated casting</dd></div><div><dt>Published lure range</dt><dd>80-180 g</dd></div><div><dt>Founder price</dt><dd>$799 AUD</dd></div></dl>
          <a class="rod-comparison-action" href="#founder-deposit">Reserve ASSAULT →</a>
        </article>
        <article class="rod-comparison-card">
          <span class="rod-comparison-card__status">Development platform</span>
          <h3>HALO <small>PE10-12</small></h3>
          <p class="rod-comparison-card__lead">Extreme heavy-tackle authority for giant GT, dogtooth tuna, expedition fishing and very large tuna.</p>
          <dl><div><dt>Best for</dt><dd>Maximum power and expedition pressure</dd></div><div><dt>Specifications</dt><dd>Final targets under validation</dd></div><div><dt>Founder price</dt><dd>$999 AUD</dd></div></dl>
          <a class="rod-comparison-action" href="#founder-deposit">Reserve HALO →</a>
        </article>
      </div>
    </div>`;
  grip.before(section);
}

function correctTechnicalClaims() {
  const specs = document.querySelector("#specifications .specifications-list");
  if (specs) {
    const dragDt = textMatch(specs, "dt", "Drag rating");
    if (dragDt) {
      dragDt.textContent = "Validated static-load reference";
      const dd = dragDt.parentElement?.querySelector("dd");
      if (dd) dd.textContent = "24 kg at approximately 60°";
      const target = document.createElement("div");
      target.innerHTML = "<dt>Target sustained fishing drag</dt><dd>Approx. 15-18 kg, subject to final validation</dd>";
      dragDt.parentElement?.after(target);
    }
    const reelDt = textMatch(specs, "dt", "Reel seat");
    if (reelDt) {
      const dd = reelDt.parentElement?.querySelector("dd");
      if (dd) dd.textContent = "Fuji DPS heavy-duty graphite configuration with double-locking hardware";
    }
  }
  const gripTitle = document.querySelector("#grip h2");
  if (gripTitle) gripTitle.textContent = "Proprietary grip geometry.";
  const gripCopy = document.querySelector("#grip .story-copy > p:not(.eyebrow)");
  if (gripCopy) gripCopy.textContent = "KAIZURO’s rounded-pentagonal grip concept, with a patent application in development, combines a predominantly rounded profile with a subtle tactile index. It is designed to support natural hand orientation, resist unwanted rotation and improve control during repeated offshore casting.";
}

function consolidateProof() {
  const proofGrid = document.querySelector("#proof .proof-grid");
  if (!proofGrid || proofGrid.querySelector(".proof-development-grid")) return;
  const heading = document.querySelector("#proof h2");
  if (heading) heading.textContent = "Tested. Learned. Refined.";
  const intro = document.querySelector("#proof h2 + p");
  if (intro) intro.textContent = "The delivered ASSAULT prototype established the structural foundation, exposed the next opportunities and defined the remaining work before production.";
  const development = document.createElement("div");
  development.className = "proof-development-grid";
  development.innerHTML = `
    <article><span>01 · Tested</span><h3>Physical proof</h3><p>Controlled static loading, destructive blank testing and finished-prototype review established the baseline.</p></article>
    <article><span>02 · Learned</span><h3>Evidence over ego</h3><p>Weight, recovery, guide construction and grip geometry were reviewed against the original targets.</p></article>
    <article><span>03 · Remaining</span><h3>Production validation</h3><p>Final component, recovery and real-world offshore validation must be completed before the first run is locked.</p></article>`;
  proofGrid.appendChild(development);
  const evolution = document.getElementById("evolution");
  if (evolution) evolution.hidden = true;
}

function restructureFounder() {
  const shell = document.querySelector("#founder .founder-shell");
  const intro = document.querySelector("#founder .founder-intro");
  const deposit = document.getElementById("founder-deposit");
  const options = document.querySelector("#founder .founder-options");
  if (intro) {
    const counter = intro.querySelector(".allocation-counter b");
    if (counter) counter.textContent = "100 total across ASSAULT and HALO";
    const paragraphs = intro.querySelectorAll(":scope > p:not(.eyebrow)");
    if (paragraphs[0]) paragraphs[0].textContent = "Founder 100 is the first production allocation in KAIZURO history: only 100 individually numbered Founder Edition rods across ASSAULT PE6-8 and HALO PE10-12 combined.";
    if (paragraphs[1]) paragraphs[1].textContent = "Every Founder rod includes one original Founder Pack, direct development updates, priority support and traceable first-production ownership. Once all 100 allocations are secured, this offer closes permanently.";
  }
  if (intro && deposit && intro.nextElementSibling !== deposit) intro.after(deposit);
  if (deposit && options && deposit.nextElementSibling !== options) deposit.after(options);

  const depositIntroText = document.querySelector("#founder .deposit-intro > p:not(.eyebrow)");
  if (depositIntroText) depositIntroText.textContent = "Choose your Founder rod, pay the 25% deposit through KAIZURO’s secure Square checkout, then return to submit your ownership details. The deposit is credited in full against the final Founder price.";

  const paymentGrid = document.querySelector("#founder .founder-payment-grid");
  if (paymentGrid && !document.querySelector(".founder-trust-row")) {
    const trust = document.createElement("div");
    trust.className = "founder-trust-row";
    trust.innerHTML = `
      <span><b>Square secured</b>Payment handled through KAIZURO’s Square checkout.</span>
      <span><b>Deposit protected</b>Refunded in full if KAIZURO does not proceed to production.</span>
      <span><b>Credited in full</b>Your 25% deposit reduces the final Founder balance.</span>
      <span><b>Founder support</b>Direct production communication from KAIZURO.</span>`;
    paymentGrid.before(trust);
  }

  const collection = document.querySelector("#founder .founder-collection");
  if (collection && !collection.querySelector(".founder-value-panel")) {
    const panel = document.createElement("div");
    panel.className = "founder-value-panel";
    panel.innerHTML = `
      <strong>Exclusive Founder Pack · indicative combined RRP $345</strong>
      <div class="founder-value-list"><span>Founder cap<b>$49</b></span><span>Offshore backpack<b>$199</b></span><span>Offshore gloves<b>$49</b></span><span>Rod wraps<b>$19</b></span><span>KAIZURO tackle box<b>$29</b></span></div>`;
    collection.appendChild(panel);
  }

  if (founderForm && !founderForm.querySelector('[name="Square receipt reference"]')) {
    const notes = founderForm.querySelector('textarea[name="Notes"]')?.closest("label");
    const field = document.createElement("label");
    field.className = "square-reference-field";
    field.innerHTML = `Square receipt / order reference<input type="text" name="Square receipt reference" placeholder="Enter the reference from your Square receipt"><small>This helps KAIZURO match your payment to your Founder allocation.</small>`;
    notes?.before(field);
  }

  const roadmap = document.querySelector("#founder .founder-roadmap");
  if (roadmap && !document.querySelector(".founder-support-block")) {
    const support = document.createElement("section");
    support.className = "founder-support-block";
    support.innerHTML = `
      <p class="eyebrow">Direct Founder Support</p>
      <div class="founder-support-grid"><div><h3>A real person behind every allocation.</h3><p>KAIZURO is being developed in Sydney, Australia. Founder customers receive direct production communication and can contact Greg throughout development, manufacturing and delivery.</p></div><div><h3>Contact KAIZURO</h3><p><a href="mailto:info@kaizuro.com?subject=Founder%20100%20support">info@kaizuro.com</a><br>Sydney, Australia</p></div></div>`;
    roadmap.before(support);
  }
}

function updateCommercialTerms() {
  const details = [...document.querySelectorAll("#terms details")];
  const updates = new Map([
    ["What does the Founder payment secure?", "It secures one of only 100 individually numbered Founder Edition rods across ASSAULT PE6-8 and HALO PE10-12 combined, together with the original Founder ownership package."],
    ["When will production begin?", "Production begins only after the final production specification, component package and remaining prototype validation are complete."],
    ["What happens if production does not proceed?", "If KAIZURO determines that the Founder production run will not proceed, Founder deposits paid to KAIZURO will be refunded in full to the original payment method."],
    ["How will progress be communicated?", "Founder customers receive direct validation, manufacturing and delivery updates before wider public release."],
    ["What is included?", "A numbered Founder rod, original Founder Pack, selected cap and offshore pack colourway, Founder certificate, registered digital rod passport and Founder Priority Support."],
    ["What warranty and delivery terms apply?", "Every Founder rod is supported by KAIZURO’s five-year limited manufacturing warranty, Founder Priority Support and applicable rights under Australian Consumer Law. Shipping costs, duties and taxes are handled under the published Shipping terms."]
  ]);
  details.forEach((detail) => {
    const summary = detail.querySelector("summary")?.textContent.trim();
    const copy = updates.get(summary);
    if (copy) {
      const p = detail.querySelector("p");
      if (p) p.textContent = copy;
    }
  });
}

function updateNavigationAndFooter() {
  const desktopLinks = [...document.querySelectorAll(".desktop-nav a")];
  const assault = desktopLinks.find((a) => a.textContent.trim() === "ASSAULT");
  if (assault) { assault.textContent = "Rods"; assault.href = "#rods"; }
  const halo = desktopLinks.find((a) => a.textContent.trim() === "HALO");
  if (halo) halo.remove();
  const action = document.querySelector(".nav-action");
  if (action) { action.textContent = "Reserve Founder Allocation"; action.href = "#founder-deposit"; }

  const supportNav = document.querySelector('.site-footer nav[aria-label="Support"]');
  if (supportNav) {
    const map = {
      "Founder Terms": "founder-terms.html",
      "Shipping": "shipping.html",
      "Warranty": "warranty.html",
      "Privacy": "privacy.html"
    };
    supportNav.querySelectorAll("a").forEach((link) => {
      const href = map[link.textContent.trim()];
      if (href) link.href = href;
    });
  }
  const footerBottom = document.querySelector(".footer-bottom");
  if (footerBottom && !document.querySelector(".footer-legal-note")) {
    const note = document.createElement("p");
    note.className = "footer-legal-note";
    note.textContent = "Prices shown in AUD. KAIZURO warranties and written terms operate in addition to rights available under Australian Consumer Law.";
    footerBottom.before(note);
  }
}

function setupSquarePopup() {
  const links = [...document.querySelectorAll('.founder-payment-button[href*="square.link"]')];
  if (!links.length || document.querySelector(".square-checkout-dialog")) return;
  const dialog = document.createElement("dialog");
  dialog.className = "square-checkout-dialog";
  dialog.innerHTML = `<div class="square-checkout-dialog__panel"><p class="square-checkout-dialog__eyebrow">Secure checkout</p><h2>Continue to Square?</h2><p class="square-checkout-dialog__copy">You are leaving KAIZURO to complete your Founder deposit through our secure Square payment page. Square opens in a new tab, while this page remains open so you can return and complete your Founder details.</p><div class="square-checkout-dialog__actions"><a class="square-checkout-dialog__continue" href="#" target="_blank" rel="noopener noreferrer">Continue to Square</a><button class="square-checkout-dialog__cancel" type="button">Cancel</button></div></div>`;
  document.body.appendChild(dialog);
  const proceed = dialog.querySelector(".square-checkout-dialog__continue");
  let trigger = null;
  links.forEach((link) => link.addEventListener("click", (event) => {
    event.preventDefault();
    trigger = link;
    proceed.href = link.href;
    dialog.showModal();
  }));
  dialog.querySelector(".square-checkout-dialog__cancel")?.addEventListener("click", () => dialog.close());
  proceed?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => { trigger?.focus(); trigger = null; });
}

function applyCommercialRestructure() {
  enhanceHero();
  consolidateBrandStory();
  addRodComparison();
  correctTechnicalClaims();
  consolidateProof();
  restructureFounder();
  updateCommercialTerms();
  updateNavigationAndFooter();
  setupSquarePopup();
}

applyCommercialRestructure();

const reviewSection = new URLSearchParams(window.location.search).get("section");
if (reviewSection) {
  const selectedSection = document.getElementById(reviewSection);
  if (selectedSection) {
    document.body.classList.add("section-review");
    document.querySelectorAll("main > section").forEach((section) => { section.hidden = section !== selectedSection; });
  }
}
