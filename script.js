const header = document.querySelector("[data-site-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const chapterTitle = document.querySelector("[data-chapter-title]");
const chapterText = document.querySelector("[data-chapter-text]");
const chapterIndex = document.querySelector("[data-chapter-index]");
const chapters = [...document.querySelectorAll("[data-chapter]")];

const chapterCopy = [
  {
    title: "Strength without careless mass.",
    text: "Heavy offshore guides must withstand impact, repeated loading and lateral force without unnecessary bulk."
  },
  {
    title: "Secure where it matters. Controlled everywhere else.",
    text: "Wrap construction is treated as structural work, controlling transfer into the blank without turning the rod into dead weight."
  },
  {
    title: "From line coil to controlled path.",
    text: "Guide size and progression gradually control braid from a large spinning reel while supporting the upper working section."
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
