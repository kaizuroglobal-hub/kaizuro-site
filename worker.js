class HeadInjector {
  element(element) {
    element.append(`
<style id="kaizuro-public-unlock">
  body.private-gate-locked { overflow: auto !important; }
  .private-gate { display: none !important; visibility: hidden !important; pointer-events: none !important; }
  body.private-gate-locked > *:not(.private-gate) {
    filter: none !important;
    pointer-events: auto !important;
    user-select: auto !important;
  }
</style>
<script>
  (function unlockKaizuro(){
    function unlock(){
      document.body && document.body.classList.remove('private-gate-locked');
      document.querySelectorAll('.private-gate').forEach(function(el){ el.remove(); });
    }
    unlock();
    document.addEventListener('DOMContentLoaded', unlock, { once: true });
    new MutationObserver(unlock).observe(document.documentElement, { attributes: true, childList: true, subtree: true });
  })();
</script>`, { html: true });
  }
}

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;

    return new HTMLRewriter()
      .on('head', new HeadInjector())
      .transform(response);
  }
};
