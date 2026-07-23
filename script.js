const header = document.querySelector("[data-site-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const chapterTitle = document.querySelector("[data-chapter-title]");
const chapterText = document.querySelector("[data-chapter-text]");
const chapterIndex = document.querySelector("[data-chapter-index]");
const chapterEyebrow = document.querySelector("[data-chapter-eyebrow]");
const chapters = [...document.querySelectorAll("[data-chapter]")];
const reviewSection = new URLSearchParams(window.location.search).get("section");

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
    text: "Heavy offshore guides must withstand impact, repeated loading and lateral force. The objective is sufficient frame strength and bracing without unnecessary weight in the working section."
  },
  {
    eyebrow: "02 · Wrap",
    title: "Secure where it matters. Controlled everywhere else.",
    text: "Guide security depends on wrap length, thread build, resin control and preparation beneath the foot. Low-build construction manages avoidable weight and stiffness around the guide location."
  },
  {
    eyebrow: "03 · Progression",
    title: "From line coil to controlled path.",
    text: "A large offshore spinning reel releases broad coils of braid. Guide size and progression gradually control that movement while maintaining clearance and supporting the blank under load."
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
  header.classList.toggle("scrolled", window.scrollY > 18);
}

function setMenu(open) {
  mobileMenu.classList.toggle("open", open);
  header.classList.toggle("menu-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
}

function setChapter(index) {
  const next = chapterCopy[index];
  if (!next || !chapterTitle || !chapterText || !chapterIndex) {
    return;
  }
  if (index === activeChapterIndex) {
    return;
  }
  activeChapterIndex = index;
  chapterTitle.textContent = next.title;
  chapterText.textContent = next.text;
  chapterIndex.textContent = `${String(index + 1).padStart(2, "0")} / ${String(chapterCopy.length).padStart(2, "0")}`;
  if (chapterEyebrow) {
    chapterEyebrow.textContent = next.eyebrow;
  }
}

function updateChapterFromScroll() {
  if (!chapters.length) {
    return;
  }

  const headerHeight = header?.offsetHeight || 0;
  const activationY = headerHeight + ((window.innerHeight - headerHeight) * 0.52);
  const resetY = activationY + Math.min(96, window.innerHeight * 0.09);
  let nextIndex = activeChapterIndex;

  if (nextIndex < 0) {
    nextIndex = 0;
    chapters.forEach((chapter) => {
      if (chapter.getBoundingClientRect().top <= activationY) {
        nextIndex = Number(chapter.dataset.chapter);
      }
    });
  } else {
    while (nextIndex < chapters.length - 1 && chapters[nextIndex + 1].getBoundingClientRect().top <= activationY) {
      nextIndex += 1;
    }

    while (nextIndex > 0 && chapters[nextIndex].getBoundingClientRect().top > resetY) {
      nextIndex -= 1;
    }
  }

  setChapter(nextIndex);
}

function requestChapterUpdate() {
  if (chapterScrollTicking) {
    return;
  }
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

menuToggle.addEventListener("click", () => {
  setMenu(!mobileMenu.classList.contains("open"));
});

mobileMenu.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    setMenu(false);
  }
});

function scrollToHashTarget(hash, behavior = "smooth") {
  if (!hash || hash === "#") {
    return;
  }
  const target = document.querySelector(hash);
  if (!target) {
    return;
  }
  const headerHeight = header.offsetHeight || 0;
  const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
  window.scrollTo({ top: Math.max(0, top), behavior });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const hash = link.getAttribute("href");
    const target = hash && document.querySelector(hash);
    if (!target) {
      return;
    }
    event.preventDefault();
    history.pushState(null, "", hash);
    setMenu(false);
    scrollToHashTarget(hash);
  });
});

window.addEventListener("load", () => {
  if (window.location.hash) {
    window.setTimeout(() => scrollToHashTarget(window.location.hash, "auto"), 80);
  }
});

window.addEventListener("hashchange", () => {
  scrollToHashTarget(window.location.hash);
});

const productLightbox = document.querySelector("[data-product-lightbox]");
const lightboxImage = productLightbox?.querySelector("[data-lightbox-image]");
const lightboxCaption = productLightbox?.querySelector("[data-lightbox-caption]");
const lightboxClose = productLightbox?.querySelector("[data-lightbox-close]");
let lightboxTrigger = null;
const founderForm = document.querySelector(".founder-form");
const founderChoiceTriggers = document.querySelectorAll("[data-founder-field][data-founder-value]");

function setFounderSelection(fieldName, value) {
  const field = founderForm?.elements.namedItem(fieldName);
  if (field && "value" in field) {
    field.value = value;
  }

  founderChoiceTriggers.forEach((trigger) => {
    if (trigger.dataset.founderField !== fieldName) return;
    const selected = trigger.dataset.founderValue === value;
    trigger.classList.toggle("is-selected", selected);
    trigger.setAttribute("aria-pressed", String(selected));
    trigger.closest(".founder-payment-card")?.classList.toggle("is-selected", selected);
    trigger.closest("figure")?.classList.toggle("is-selected", selected);
  });

  document.querySelectorAll("[data-selection-summary]").forEach((summary) => {
    if (summary.dataset.selectionSummary === fieldName) {
      summary.textContent = value || "Not selected";
    }
  });
}

founderChoiceTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    setFounderSelection(trigger.dataset.founderField, trigger.dataset.founderValue);
  });
});

["Preferred rod", "Preferred cap", "Preferred offshore pack"].forEach((fieldName) => {
  const field = founderForm?.elements.namedItem(fieldName);
  if (!field || !("value" in field)) return;
  field.addEventListener("change", () => setFounderSelection(fieldName, field.value));
  setFounderSelection(fieldName, field.value);
});

function closeProductLightbox() {
  if (!productLightbox?.open) {
    return;
  }
  productLightbox.close();
}

document.querySelectorAll("[data-lightbox-src]").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    if (!productLightbox || !lightboxImage || !lightboxCaption) {
      return;
    }
    lightboxTrigger = trigger;
    lightboxImage.src = trigger.dataset.lightboxSrc;
    lightboxImage.alt = trigger.dataset.lightboxAlt || "KAIZURO Founder product";
    lightboxCaption.textContent = trigger.dataset.lightboxCaption || "KAIZURO Founder product";
    productLightbox.showModal();
  });
});

lightboxClose?.addEventListener("click", closeProductLightbox);

productLightbox?.addEventListener("click", (event) => {
  if (event.target === productLightbox) {
    closeProductLightbox();
  }
});

productLightbox?.addEventListener("close", () => {
  lightboxImage?.removeAttribute("src");
  lightboxTrigger?.focus();
  lightboxTrigger = null;
});
