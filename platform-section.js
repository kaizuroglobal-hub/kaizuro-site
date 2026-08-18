(function(){
  "use strict";

  function removePlatforms(){
    document.querySelectorAll('#platforms, #halo').forEach(function(section){
      section.remove();
    });

    document.querySelectorAll('.desktop-nav a[href="#platforms"], .desktop-nav a[href="#halo"], .mobile-menu a[href="#platforms"], .mobile-menu a[href="#halo"]').forEach(function(link){
      var item = link.closest('li');
      if (item) item.remove();
      else link.remove();
    });
  }

  if(document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", removePlatforms, { once: true });
  } else {
    removePlatforms();
  }

  window.addEventListener("kaizuro:content-loaded", removePlatforms);
  window.setTimeout(removePlatforms, 0);
  window.setTimeout(removePlatforms, 100);
  window.setTimeout(removePlatforms, 500);
})();