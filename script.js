const header = document.querySelector("[data-site-header]");
const drawer = document.querySelector("[data-section-drawer]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const stickyCompare = document.querySelector(".sticky-compare");
const specModal = document.querySelector("[data-spec-modal]");
const enquiryModal = document.querySelector("[data-enquiry-modal]");
const configTitle = document.querySelector("[data-config-title]");
const configCopy = document.querySelector("[data-config-copy]");
const configImage = document.querySelector("[data-config-image]");
const configStage = document.querySelector(".config-stage");
const modelCard = document.querySelector("[data-model-card]");
const toast = document.querySelector("[data-toast]");
const assetVersion = "?v=20260704-section-rhythm";
const defaultConfigImage = "assets/kaizuro-site/optimized/reel-seat-transparent.png" + assetVersion;
const detailImage = document.querySelector("[data-detail-image]");
const detailCaption = document.querySelector("[data-detail-caption]");

const detailImages = [
  {
    src: "assets/kaizuro-site/detail-gallery/7.png" + assetVersion,
    alt: "KAIZURO handle detail",
    caption: "Caption Name"
  },
  {
    src: "assets/kaizuro-site/detail-gallery/8.png" + assetVersion,
    alt: "KAIZURO reel seat detail",
    caption: "Caption Name"
  },
  {
    src: "assets/kaizuro-site/detail-gallery/9.png" + assetVersion,
    alt: "KAIZURO branded blank detail",
    caption: "Caption Name"
  },
  {
    src: "assets/kaizuro-site/detail-gallery/10.png" + assetVersion,
    alt: "KAIZURO guide run detail",
    caption: "Caption Name"
  },
  {
    src: "assets/kaizuro-site/detail-gallery/11.png" + assetVersion,
    alt: "KAIZURO tip guide detail",
    caption: "Caption Name"
  }
];

let detailIndex = 0;

const variants = {
  carbon: {
    copy: "Stealth carbon finish with reinforced guide spacing and a locked-in seat profile for heavy drag work.",
    image: defaultConfigImage
  },
  storm: {
    copy: "Storm silver finish with the same locked-in seat profile and offshore-focused build specification.",
    image: defaultConfigImage
  }
};

const models = {
  assault: {
    eyebrow: "PE6-8 (ASSAULT)",
    title: "Fast offshore casting power with a heavier loaded feel.",
    copy: "Fast enough to cast and work lures cleanly, powerful enough to stay composed when drag climbs.",
    image: "assets/kaizuro-site/tuna-bluefin.png" + assetVersion
  },
  halo: {
    eyebrow: "PE10+ HALO",
    title: "Maximum offshore reserve for anglers chasing bigger pressure windows.",
    copy: "Built for heavier line classes, brutal drag, and clean control when the fish refuses to turn.",
    image: "assets/kaizuro-site/giant-bluefin-tuna.png" + assetVersion
  }
};

function setChromeState() {
  const y = window.scrollY;
  header.classList.toggle("scrolled", y > 24);
  stickyCompare.classList.toggle("visible", y > window.innerHeight * 0.72);
}

function openDialog(dialog) {
  if (!dialog.open) {
    dialog.showModal();
  }
  document.body.classList.add("modal-open");
}

function closeDialog(dialog) {
  if (dialog.open) {
    dialog.close();
  }
  document.body.classList.remove("modal-open");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.setTimeout(() => toast.classList.remove("visible"), 2600);
}

function setConfigImage(src, delay = 120, rotateLandscape = false) {
  configImage.classList.add("swapping");
  window.setTimeout(() => {
    configImage.src = src;
    configImage.classList.toggle("rotate-landscape", rotateLandscape);
    configStage.classList.toggle("has-alt-image", src !== defaultConfigImage);
    configImage.classList.remove("swapping");
  }, delay);
}

function setDetailImage(nextIndex) {
  if (!detailImage) {
    return;
  }
  detailIndex = (nextIndex + detailImages.length) % detailImages.length;
  const next = detailImages[detailIndex];
  detailImage.classList.add("swapping");
  window.setTimeout(() => {
    detailImage.src = next.src;
    detailImage.alt = next.alt;
    detailCaption.textContent = next.caption;
    detailImage.classList.remove("swapping");
  }, 120);
}

window.addEventListener("scroll", setChromeState, { passive: true });
setChromeState();

menuToggle.addEventListener("click", () => {
  drawer.classList.toggle("open");
});

drawer.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    drawer.classList.remove("open");
  }
});

document.addEventListener("click", (event) => {
  if (!drawer.contains(event.target) && !menuToggle.contains(event.target)) {
    drawer.classList.remove("open");
  }
});

document.querySelectorAll("[data-open-specs]").forEach((button) => {
  button.addEventListener("click", () => openDialog(specModal));
});

document.querySelectorAll("[data-close-specs]").forEach((button) => {
  button.addEventListener("click", () => closeDialog(specModal));
});

document.querySelectorAll("[data-open-enquiry]").forEach((button) => {
  button.addEventListener("click", () => openDialog(enquiryModal));
});

[specModal, enquiryModal].forEach((dialog) => {
  dialog.addEventListener("close", () => {
    if (!specModal.open && !enquiryModal.open) {
      document.body.classList.remove("modal-open");
    }
  });
});

document.querySelectorAll(".accordion button").forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.toggle("open");
    button.querySelector("span").textContent = button.classList.contains("open") ? "-" : "+";
  });
});

document.querySelectorAll("[data-variant]").forEach((button) => {
  button.addEventListener("click", () => {
    const variant = variants[button.dataset.variant];
    document.querySelectorAll("[data-variant]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    window.setTimeout(() => {
      configCopy.textContent = variant.copy;
    }, 120);
    setConfigImage(variant.image, 150);
  });
});

document.querySelectorAll("[data-config-model]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-config-model]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    configTitle.textContent = `KAIZURO ${button.dataset.configModel}`;
  });
});

document.querySelector("[data-detail-prev]")?.addEventListener("click", () => {
  setDetailImage(detailIndex - 1);
});

document.querySelector("[data-detail-next]")?.addEventListener("click", () => {
  setDetailImage(detailIndex + 1);
});

document.querySelectorAll("[data-model]").forEach((button) => {
  button.addEventListener("click", () => {
    const model = models[button.dataset.model];
    document.querySelectorAll("[data-model]").forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-pressed", "false");
    });
    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");
    modelCard.innerHTML = `
      <img src="${model.image}" alt="${model.eyebrow}">
      <div>
        <p class="eyebrow">${model.eyebrow}</p>
        <h3>${model.title}</h3>
        <p>${model.copy}</p>
      </div>
    `;
  });
});

document.querySelectorAll(".video-card").forEach((card) => {
  const video = card.querySelector("video");
  card.addEventListener("mouseenter", () => video.play().catch(() => {}));
  card.addEventListener("focusin", () => video.play().catch(() => {}));
  card.addEventListener("mouseleave", () => {
    video.pause();
    video.currentTime = 0;
  });
  card.addEventListener("focusout", () => {
    video.pause();
    video.currentTime = 0;
  });
});

document.querySelector("[data-interest-form]").addEventListener("submit", (event) => {
  event.preventDefault();
  showToast("Waitlist interest registered. We’ll connect this to the real form next.");
});

enquiryModal.querySelector("form").addEventListener("submit", () => {
  showToast("Waitlist request captured locally for now.");
});
