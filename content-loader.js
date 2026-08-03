/**
 * content-loader.js
 *
 * Fetches JSON content files from the `content/` directory and updates
 * matching DOM elements using `data-cms-*` attributes.
 *
 * Attributes understood:
 *   data-cms-text="source:key.path"   — sets element.textContent
 *   data-cms-html="source:key.path"   — sets element.innerHTML (use sparingly)
 *   data-cms-src="source:key.path"    — sets element.src
 *   data-cms-srcset="source:key.path" — sets element.srcset
 *   data-cms-href="source:key.path"   — sets element.href
 *   data-cms-alt="source:key.path"    — sets element.alt
 *
 * Source names map to files under `content/`:
 *   hero, story, assault, principles, engineering, founder, halo, footer, site
 *
 * If a fetch fails (network error, file not found, invalid JSON), the
 * original HTML content is preserved — the page degrades gracefully.
 *
 * Engineering chapter data is exposed on `window.kzChapterData` for use
 * by script.js chapter scroll logic.
 */

(function () {
  "use strict";

  // Resolve the base URL for content/ relative to the current page.
  // Works on GitHub Pages and local dev servers. Does not work on file://.
  var base = (function () {
    var loc = window.location;
    if (loc.protocol === "file:") {
      return null; // Fetch not supported over file://
    }
    var path = loc.pathname.replace(/\/[^/]*$/, "/");
    return loc.origin + path;
  })();

  if (!base) {
    return; // Skip silently when opened as a local file
  }

  /**
   * Resolve a dot-notation key path within an object.
   * E.g. get(obj, "chapters.0.title") → obj.chapters[0].title
   */
  function get(obj, path) {
    return path.split(".").reduce(function (acc, key) {
      return acc != null ? acc[key] : undefined;
    }, obj);
  }

  /**
   * Fetch a single JSON content file.
   */
  function loadJson(name) {
    return fetch(base + "content/" + name + ".json", { cache: "no-cache" })
      .then(function (res) {
        if (!res.ok) {
          throw new Error("HTTP " + res.status + " loading content/" + name + ".json");
        }
        return res.json();
      })
      .catch(function (err) {
        console.warn("[content-loader] Could not load content/" + name + ".json —", err.message);
        return null;
      });
  }

  /**
   * Apply a single data value to a DOM element using a specific attribute type.
   */
  function applyValue(el, attrType, value) {
    if (value == null || value === "") return;
    var str = String(value);
    switch (attrType) {
      case "text":
        el.textContent = str;
        break;
      case "html":
        el.innerHTML = str;
        break;
      case "src":
        el.src = str;
        break;
      case "srcset":
        el.srcset = str;
        break;
      case "href":
        el.href = str;
        break;
      case "alt":
        el.alt = str;
        break;
    }
  }

  /**
   * Walk all data-cms-* attributes and update matching elements
   * for a given source name and its loaded JSON data.
   */
  function applySource(name, data) {
    if (!data) return;
    var attrTypes = ["text", "html", "src", "srcset", "href", "alt"];
    attrTypes.forEach(function (attrType) {
      var attr = "data-cms-" + attrType;
      document.querySelectorAll("[" + attr + "]").forEach(function (el) {
        var spec = el.getAttribute(attr);
        if (!spec) return;
        var parts = spec.split(":", 2);
        var sourceName = parts[0];
        var keyPath = parts[1];
        if (sourceName !== name) return;
        var value = get(data, keyPath);
        applyValue(el, attrType, value);
      });
    });
  }

  /**
   * Apply engineering chapter data to the mobile chapter captions in the DOM
   * and expose on window.kzChapterData for the scroll-based desktop panel.
   */
  function applyEngineering(data) {
    if (!data || !Array.isArray(data.chapters)) return;

    // Expose for script.js to pick up on subsequent scroll events
    window.kzChapterData = data.chapters;

    // Update mobile chapter captions already in the DOM
    var chapterFigures = document.querySelectorAll("[data-chapter]");
    chapterFigures.forEach(function (figure) {
      var idx = Number(figure.dataset.chapter);
      var ch = data.chapters[idx];
      if (!ch) return;

      var mobileCaption = figure.querySelector(".mobile-chapter-copy");
      if (mobileCaption) {
        var eyebrowEl = mobileCaption.querySelector("span");
        var titleEl = mobileCaption.querySelector("b");
        var bodyEl = mobileCaption.querySelector("p");
        if (eyebrowEl && ch.eyebrow) eyebrowEl.textContent = ch.eyebrow;
        if (titleEl && ch.title) titleEl.textContent = ch.title;
        if (bodyEl && ch.mobile_text) bodyEl.textContent = ch.mobile_text;
      }

      var img = figure.querySelector("img");
      if (img) {
        if (ch.image_src) img.src = ch.image_src;
        if (ch.image_alt) img.alt = ch.image_alt;
      }
    });

    // Also update the sticky desktop chapter panel if it is showing chapter 0
    // (already rendered; subsequent chapters update via scroll events in script.js)
    var titleEl = document.querySelector("[data-chapter-title]");
    var textEl = document.querySelector("[data-chapter-text]");
    var eyebrowEl = document.querySelector("[data-chapter-eyebrow]");
    var indexEl = document.querySelector("[data-chapter-index]");
    if (titleEl || textEl) {
      var first = data.chapters[0];
      if (first) {
        if (titleEl && first.title) titleEl.textContent = first.title;
        if (textEl && first.text) textEl.textContent = first.text;
        if (eyebrowEl && first.eyebrow) eyebrowEl.textContent = first.eyebrow;
        if (indexEl) {
          indexEl.textContent =
            "01 / " + String(data.chapters.length).padStart(2, "0");
        }
      }
    }
  }

  /**
   * Apply principles list — re-render the principle articles if data differs.
   */
  function applyPrinciples(data) {
    if (!data || !Array.isArray(data.principles)) return;
    var row = document.querySelector(".principle-row");
    if (!row) return;
    var articles = row.querySelectorAll("article");
    data.principles.forEach(function (p, i) {
      var article = articles[i];
      if (!article) return;
      var numEl = article.querySelector("span");
      var titleEl = article.querySelector("h3");
      var bodyEl = article.querySelector("p");
      if (numEl && p.number) numEl.textContent = p.number;
      if (titleEl && p.title) titleEl.textContent = p.title;
      if (bodyEl && p.body) bodyEl.textContent = p.body;
    });
  }

  // Sources to load (name → optional post-processing function)
  var sources = {
    site: null,
    hero: null,
    story: null,
    assault: null,
    principles: applyPrinciples,
    engineering: applyEngineering,
    founder: null,
    halo: null,
    footer: null
  };

  // Load all sources in parallel
  Object.keys(sources).forEach(function (name) {
    loadJson(name).then(function (data) {
      applySource(name, data);
      if (typeof sources[name] === "function" && data) {
        sources[name](data);
      }
    });
  });
})();
