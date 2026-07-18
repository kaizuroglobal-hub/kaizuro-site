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
  }
];

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
  chapterTitle.textContent = next.title;
  chapterText.textContent = next.text;
  chapterIndex.textContent = `${String(index + 1).padStart(2, "0")} / 03`;
  if (chapterEyebrow) {
    chapterEyebrow.textContent = next.eyebrow;
  }
}

const chapterObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible) {
      setChapter(Number(visible.target.dataset.chapter));
    }
  },
  {
    threshold: [0.32, 0.54, 0.76],
    rootMargin: "-12% 0px -18% 0px"
  }
);

chapters.forEach((chapter) => chapterObserver.observe(chapter));

window.addEventListener("scroll", setHeaderState, { passive: true });
setHeaderState();
setChapter(0);

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
