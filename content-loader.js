/** Pages CMS removed. Static HTML is now the production source of truth. */
(function () {
  "use strict";
  window.setTimeout(function () {
    window.dispatchEvent(new CustomEvent("kaizuro:content-loaded", { detail: { cms: false } }));
  }, 0);
})();
