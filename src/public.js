import app from "./index.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (!url.pathname.startsWith("/partners")) {
      const response = await env.ASSETS.fetch(request);

      if ((url.pathname === "/" || url.pathname === "/index.html") && response.headers.get("Content-Type")?.includes("text/html")) {
        return new HTMLRewriter()
          .on('footer nav[aria-label="KAIZURO"] a[href="#evolution"]', {
            element(element) {
              element.before('<a href="/how-kaizuro-is-built/">How KAIZURO Is Built</a><a href="/partners/portal">Partners</a>', { html: true });
            },
          })
          .transform(response);
      }

      if (url.pathname === "/script.js" && response.headers.get("Content-Type")?.includes("javascript")) {
        const source = await response.text();
        const before = 'brandNav.innerHTML = \'<b>KAIZURO</b><a href="#story">Our Story</a><a href="#details">Engineering</a><a href="#proof">Physical Proof</a><a href="#evolution">Development</a>\';';
        const after = 'brandNav.innerHTML = \'<b>KAIZURO</b><a href="#story">Our Story</a><a href="#details">Engineering</a><a href="#proof">Physical Proof</a><a href="/how-kaizuro-is-built/">How KAIZURO Is Built</a><a href="/partners/portal">Partners</a><a href="#evolution">Development</a>\';';
        const headers = new Headers(response.headers);
        headers.set("Cache-Control", "no-cache");
        return new Response(source.replace(before, after), {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      }

      return response;
    }

    return app.fetch(request, env);
  },
};
