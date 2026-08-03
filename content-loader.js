/**
 * Runtime content layer for Pages CMS.
 *
 * JSON files in content/ override the hard-coded HTML. If loading fails, the
 * original page remains unchanged. Existing data-cms-* attributes are honoured,
 * while the remaining engineering, Founder, HALO and footer fields are bound
 * through stable section selectors.
 */
(function () {
  "use strict";

  var loc = window.location;
  if (loc.protocol === "file:") return;
  var base = loc.origin + loc.pathname.replace(/\/[^/]*$/, "/");

  function get(obj, path) {
    return path.split(".").reduce(function (acc, key) {
      return acc != null ? acc[key] : undefined;
    }, obj);
  }

  function loadJson(name) {
    return fetch(base + "content/" + name + ".json", { cache: "no-cache" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .catch(function (err) {
        console.warn("[content-loader] " + name + ".json not applied:", err.message);
        return null;
      });
  }

  function applyValue(el, type, value) {
    if (!el || value == null || value === "") return;
    var str = String(value);
    if (type === "text") el.textContent = str;
    if (type === "html") el.innerHTML = str;
    if (type === "src") el.src = str;
    if (type === "srcset") el.srcset = str;
    if (type === "href") el.href = str;
    if (type === "alt") el.alt = str;
  }

  function text(selector, value, root) {
    applyValue((root || document).querySelector(selector), "text", value);
  }

  function attr(selector, name, value, root) {
    var el = (root || document).querySelector(selector);
    if (el && value != null && value !== "") el.setAttribute(name, String(value));
  }

  function applySource(name, data) {
    if (!data) return;
    ["text", "html", "src", "srcset", "href", "alt"].forEach(function (type) {
      var attribute = "data-cms-" + type;
      document.querySelectorAll("[" + attribute + "]").forEach(function (el) {
        var spec = el.getAttribute(attribute);
        if (!spec) return;
        var splitAt = spec.indexOf(":");
        if (splitAt < 1 || spec.slice(0, splitAt) !== name) return;
        applyValue(el, type, get(data, spec.slice(splitAt + 1)));
      });
    });
  }

  function applySite(data) {
    if (!data) return;
    if (data.title) document.title = data.title;
    attr('meta[name="description"]', "content", data.description);
    attr('meta[property="og:image"]', "content", data.og_image);
  }

  function applyPrinciples(data) {
    if (!data || !Array.isArray(data.principles)) return;
    document.querySelectorAll(".principle-row article").forEach(function (article, i) {
      var item = data.principles[i];
      if (!item) return;
      text("span", item.number, article);
      text("h3", item.title, article);
      text("p", item.body, article);
    });
  }

  function applyEngineering(data) {
    if (!data) return;
    var section = document.getElementById("details");
    if (section) {
      attr(".sticky-image img", "src", data.section_image_src, section);
      attr(".sticky-image img", "alt", data.section_image_alt, section);
      text(".story-copy .eyebrow", data.section_eyebrow, section);
      var headingLines = section.querySelectorAll("#guide-title span");
      if (headingLines[0]) headingLines[0].textContent = data.section_title_line1 || headingLines[0].textContent;
      if (headingLines[1]) headingLines[1].textContent = data.section_title_line2 || headingLines[1].textContent;
      text(".story-copy > p:not(.eyebrow)", data.section_body, section);
      text(".story-copy > strong", data.section_tagline, section);
    }

    if (!Array.isArray(data.chapters)) return;
    window.kzChapterData = data.chapters;
    document.querySelectorAll("[data-chapter]").forEach(function (figure) {
      var chapter = data.chapters[Number(figure.dataset.chapter)];
      if (!chapter) return;
      text(".mobile-chapter-copy span", chapter.eyebrow, figure);
      text(".mobile-chapter-copy b", chapter.title, figure);
      text(".mobile-chapter-copy p", chapter.mobile_text, figure);
      attr("img", "src", chapter.image_src, figure);
      attr("img", "alt", chapter.image_alt, figure);
    });

    var first = data.chapters[0];
    if (first) {
      text("[data-chapter-eyebrow]", first.eyebrow);
      text("[data-chapter-title]", first.title);
      text("[data-chapter-text]", first.text);
      text("[data-chapter-index]", "01 / " + String(data.chapters.length).padStart(2, "0"));
    }
  }

  function applyFounder(data) {
    if (!data) return;
    var section = document.getElementById("founder");
    if (!section) return;
    var intro = section.querySelector(".founder-intro");
    if (intro) {
      text(".eyebrow", data.eyebrow, intro);
      text(".allocation-counter span", data.allocation_label, intro);
      text(".allocation-counter b", data.allocation_count, intro);
      text("#founder-title span", data.title, intro);
      var subheads = intro.querySelectorAll(".founder-subhead span");
      if (subheads[0]) subheads[0].textContent = data.subhead_line1 || subheads[0].textContent;
      if (subheads[1]) subheads[1].textContent = data.subhead_line2 || subheads[1].textContent;
      var body = intro.querySelectorAll(":scope > p:not(.eyebrow)");
      if (body[0] && data.body_1) body[0].textContent = data.body_1;
      if (body[1] && data.body_2) body[1].textContent = data.body_2;
      text(".text-link", data.cta_label, intro);
    }

    var deposit = section.querySelector("#founder-deposit");
    if (deposit) {
      text(".deposit-intro .eyebrow", data.deposit_eyebrow, deposit);
      text("#deposit-title span", data.deposit_title, deposit);
      text(".deposit-intro > p:not(.eyebrow)", data.deposit_body, deposit);
      var steps = deposit.querySelectorAll(".founder-payment-steps li");
      [data.deposit_step_1, data.deposit_step_2, data.deposit_step_3].forEach(function (label, i) {
        if (!steps[i] || !label) return;
        var number = steps[i].querySelector("span");
        steps[i].textContent = label;
        if (number) steps[i].prepend(number);
      });
      deposit.querySelectorAll(".founder-payment-secure").forEach(function (el) {
        if (data.payment_secure_label) el.textContent = data.payment_secure_label;
      });
      var form = deposit.querySelector(".founder-form");
      if (form && data.form_contact_email) {
        form.action = "mailto:" + data.form_contact_email + "?subject=Founder%20100%20allocation";
      }
    }
    text(".founder-collection > strong", data.closing_line, section);
  }

  function applyHalo(data) {
    if (!data) return;
    var halo = document.getElementById("halo");
    if (halo) {
      attr(".full-bleed-image img", "src", data.image_src, halo);
      attr(".full-bleed-image img", "alt", data.image_alt, halo);
      text(".halo-copy .eyebrow", data.eyebrow, halo);
      var lines = halo.querySelectorAll("#halo-title span");
      if (lines[0]) lines[0].textContent = data.title_line1 || lines[0].textContent;
      if (lines[1]) lines[1].textContent = data.title_line2 || lines[1].textContent;
      text(".halo-copy > p:not(.eyebrow)", data.body, halo);
      text(".halo-copy > a", data.cta_label, halo);
      attr(".halo-copy > a", "href", data.cta_href, halo);
    }

    var updates = document.getElementById("updates");
    if (updates) {
      text(".capture-box .eyebrow", data.updates_eyebrow, updates);
      text("#capture-title", data.updates_title, updates);
      text(".capture-box > p:not(.eyebrow)", data.updates_body, updates);
      text("button[type='submit']", data.updates_cta_label, updates);
      text(".capture-box > small", data.updates_privacy_note, updates);
    }
  }

  function applyFooter(data) {
    if (!data) return;
    var footer = document.querySelector(".site-footer");
    if (!footer) return;
    text(".footer-brand strong", data.brand_name, footer);
    text(".footer-brand p", data.brand_tagline, footer);
    text(".footer-bottom", data.copyright, footer);
    attr('.footer-links a[href^="mailto:"]', "href", "mailto:" + data.contact_email, footer);
  }

  var handlers = {
    site: applySite,
    hero: null,
    story: null,
    assault: null,
    principles: applyPrinciples,
    engineering: applyEngineering,
    founder: applyFounder,
    halo: applyHalo,
    footer: applyFooter
  };

  Promise.all(Object.keys(handlers).map(function (name) {
    return loadJson(name).then(function (data) {
      applySource(name, data);
      if (typeof handlers[name] === "function") handlers[name](data);
      return data;
    });
  })).then(function () {
    window.dispatchEvent(new CustomEvent("kaizuro:content-loaded"));
  });
})();