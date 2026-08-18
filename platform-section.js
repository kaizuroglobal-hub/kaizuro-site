(function(){
  "use strict";

  function removeDeprecatedSections(){
    document.querySelectorAll('#platforms, #halo, #proof, .founder-roadmap').forEach(function(section){
      section.remove();
    });

    document.querySelectorAll('.desktop-nav a[href="#platforms"], .desktop-nav a[href="#halo"], .desktop-nav a[href="#proof"], .mobile-menu a[href="#platforms"], .mobile-menu a[href="#halo"], .mobile-menu a[href="#proof"]').forEach(function(link){
      var item = link.closest('li');
      if (item) item.remove();
      else link.remove();
    });
  }

  if(document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", removeDeprecatedSections, { once: true });
  } else {
    removeDeprecatedSections();
  }

  window.addEventListener("kaizuro:content-loaded", removeDeprecatedSections);
  window.setTimeout(removeDeprecatedSections, 0);
  window.setTimeout(removeDeprecatedSections, 100);
  window.setTimeout(removeDeprecatedSections, 500);
})();