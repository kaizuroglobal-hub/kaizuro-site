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
  {
    eyebrow: "01 · Frame",
    title: "Strength without careless mass.",
    text: "Heavy offshore guides must withstand impact, repeated loading and lateral force. The objective is sufficient frame strength and bracing without unnecessary weight in the working section.",
  },
  {
    eyebrow: "02 · Wrap",
    title: "Secure where it matters. Controlled everywhere else.",
    text: "Guide security depends on wrap length, thread build, resin control and preparation beneath the foot. Low-build construction manages avoidable weight and stiffness around the guide location.",
  },
  {
    eyebrow: "03 · Progression",
    title: "From line coil to controlled path.",
    text: "A large offshore spinning reel releases broad coils of braid. Guide size and progression gradually control that movement while maintaining clearance and supporting the blank under load.",
  },
  {
    eyebrow: "04 · Power",
    title: "Power carried through the working section.",
    text: "The main working section balances blank authority, guide support and controlled load transfer. It is where casting recovery becomes sustained pressure when the fight moves under load."
  }
];

let activeChapterIndex = -1;
let chapterScrollTicking = false;

function setHeaderState() {
  header?.classList.toggle("scrolled", window.scrollY > 18);
}

function setMenu(open) {
  mobileMenu?.classList.toggle("open", open);
  header?.classList.toggle("menu-open", open);
  menuToggle?.setAttribute("aria-expanded", String(open));
}

function setChapter(index) {
  const next = chapterCopy[index];
  if (!next || !chapterTitle || !chapterText || !chapterIndex) return;
  if (index === activeChapterIndex) return;
  activeChapterIndex = index;
  chapterTitle.textContent = next.title;
  chapterText.textContent = next.text;
  chapterIndex.textContent = `${String(index + 1).padStart(2, "0")} / ${String(chapterCopy.length).padStart(2, "0")}`;
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
setHeaderState();
updateChapterFromScroll();

menuToggle?.addEventListener("click", () => setMenu(!mobileMenu?.classList.contains("open")));
mobileMenu?.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenu(false);
});

function scrollToHashTarget(hash, behavior = "smooth") {
  if (!hash || hash === "#") return;
  const target = document.querySelector(hash);
  if (!target) return;
  const headerHeight = header?.offsetHeight || 0;
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

function closeProductLightbox() {
  if (productLightbox?.open) productLightbox.close();
}

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
productLightbox?.addEventListener("click", (event) => {
  if (event.target === productLightbox) closeProductLightbox();
});
productLightbox?.addEventListener("close", () => {
  lightboxImage?.removeAttribute("src");
  lightboxTrigger?.focus();
  lightboxTrigger = null;
});

const warrantyLink = document.querySelector('a[href="mailto:info@kaizuro.com?subject=Warranty"]');
if (warrantyLink) warrantyLink.href = "warranty.html";

const squareCheckoutLinks = [...document.querySelectorAll('.founder-payment-button[href*="square.link"]')];
if (squareCheckoutLinks.length) {
  const checkoutDialog = document.createElement("dialog");
  checkoutDialog.className = "square-checkout-dialog";
  checkoutDialog.setAttribute("aria-labelledby", "square-checkout-title");
  checkoutDialog.innerHTML = `
    <div class="square-checkout-dialog__panel">
      <p class="square-checkout-dialog__eyebrow">Secure checkout</p>
      <h2 id="square-checkout-title">Continue to Square?</h2>
      <p class="square-checkout-dialog__copy">You are leaving KAIZURO to complete your Founder deposit through our secure Square payment page. Square will open in a new tab, and this KAIZURO page will remain available behind it.</p>
      <div class="square-checkout-dialog__actions">
        <a class="square-checkout-dialog__continue" href="#" target="_blank" rel="noopener noreferrer">Continue to Square</a>
        <button class="square-checkout-dialog__cancel" type="button">Cancel</button>
      </div>
    </div>`;
  document.body.appendChild(checkoutDialog);
  const continueLink = checkoutDialog.querySelector(".square-checkout-dialog__continue");
  const cancelButton = checkoutDialog.querySelector(".square-checkout-dialog__cancel");
  let activeCheckoutTrigger = null;
  squareCheckoutLinks.forEach((link) => link.addEventListener("click", (event) => {
    event.preventDefault();
    activeCheckoutTrigger = link;
    continueLink.href = link.href;
    checkoutDialog.showModal();
  }));
  cancelButton?.addEventListener("click", () => checkoutDialog.close());
  continueLink?.addEventListener("click", () => checkoutDialog.close());
  checkoutDialog.addEventListener("click", (event) => {
    if (event.target === checkoutDialog) checkoutDialog.close();
  });
  checkoutDialog.addEventListener("close", () => {
    activeCheckoutTrigger?.focus();
    activeCheckoutTrigger = null;
  });
}

function updateSiteNavigation() {
  const desktopNav = document.querySelector(".desktop-nav");
  if (desktopNav) desktopNav.innerHTML = `
    <a href="#assault">Rods</a>
    <a href="#details">Engineering</a>
    <a href="#proof">Validation</a>
    <a href="#founder">Founder 100</a>
    <a href="#story">Story</a>`;
  const reserveAction = document.querySelector(".header-actions .nav-action");
  if (reserveAction) {
    reserveAction.href = "#founder";
    reserveAction.textContent = "Reserve";
    reserveAction.setAttribute("aria-label", "Reserve a Founder allocation");
  }
  if (mobileMenu) mobileMenu.innerHTML = `
    <a href="#assault">Rods</a>
    <a href="#details">Engineering</a>
    <a href="#proof">Validation</a>
    <a href="#evolution">Development</a>
    <a href="#founder">Founder 100</a>
    <a href="#story">Story</a>
    <a href="#founder">Reserve</a>`;
}

function replaceSectionCopy(sectionId, replacements) {
  const section = document.getElementById(sectionId);
  if (!section) return;
  Object.entries(replacements).forEach(([selector, value]) => {
    const element = section.querySelector(selector);
    if (!element) return;
    if (Array.isArray(value)) {
      element.innerHTML = value.map((line) => `<span>${line}</span>`).join("");
    } else {
      element.textContent = value;
    }
  });
}

function applyPreFieldLaunchPositioning() {
  document.title = "KAIZURO | ASSAULT PE6-8 · HALO PE10-12";
  const description = document.querySelector('meta[name="description"]');
  description?.setAttribute("content", "KAIZURO ASSAULT PE6-8 and HALO PE10-12: precision-engineered offshore casting rods developed through measurable design targets, controlled validation and Founder 100 production.");

  replaceSectionCopy("purpose", {
    ".eyebrow": "KAIZURO · ASSAULT PE6-8 · HALO PE10-12",
    "h1": ["Control the", "uncontrollable."],
    ".hero-copy > p:not(.eyebrow)": "Precision-engineered offshore casting rods developed around load, recovery, control and measurable performance targets. No manufactured stories. No borrowed credibility.",
    ".hero-status span:first-child": "Controlled prototype validation underway",
    ".hero-status span:last-child": "Founder 100 first production planned"
  });

  replaceSectionCopy("story", {
    ".eyebrow": "Why KAIZURO Exists",
    "h2": "Engineering beyond accepted compromise."
  });

  replaceSectionCopy("assault", {
    ".eyebrow": "Precision Violence · PE6-8",
    ".section-lead": "The versatile heavy-offshore weapon in the KAIZURO system.",
    ".assault-copy > p:not(.eyebrow):not(.section-lead)": "Developed for high-output topwater casting, serious offshore load and fast, controlled recovery—without pretending the validation journey is complete.",
    ".assault-copy strong": "Fast to cast. Progressive under load. Precise in recovery."
  });

  replaceSectionCopy("principles", {
    ".eyebrow": "Design · Engineering · Control",
    "h2": ["Every decision connected.", "Every claim accountable."],
    ".system-intro": "Blank architecture, guide placement, grip geometry, reel retention and finished weight are developed as one mechanical system against defined targets—not assembled as marketing specifications."
  });

  replaceSectionCopy("proof", {
    ".eyebrow": "Controlled Validation",
    "h2": "Evidence before endorsement."
  });

  replaceSectionCopy("evolution", {
    ".eyebrow": "Built Under Pressure",
    "h2": "Development is the proof."
  });

  replaceSectionCopy("founder", {
    ".eyebrow": "The First Owners of KAIZURO",
    "h2": "Founder 100 is ownership—not a discount.",
    ".section-lead": "A limited first-production allocation for anglers who value design transparency, controlled development and permanent Founder recognition."
  });

  replaceSectionCopy("halo", {
    ".eyebrow": "The Apex Weapon · PE10-12",
    "h2": "HALO PE10-12",
    ".section-lead": "Maximum-power topwater architecture for the heaviest offshore applications in the KAIZURO system."
  });

  document.querySelectorAll("#proof .eyebrow, #proof h2, #evolution .eyebrow, #evolution h2").forEach((element) => {
    element.dataset.positioningUpdated = "true";
  });
}

updateSiteNavigation();
applyPreFieldLaunchPositioning();
