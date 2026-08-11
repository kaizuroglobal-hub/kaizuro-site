import app from "./index.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Public production site: bypass the temporary global Basic Auth gate.
    if (!url.pathname.startsWith("/partners")) {
      const response = await env.ASSETS.fetch(request);

      // Keep the footer link in the raw homepage HTML.
      if ((url.pathname === "/" || url.pathname === "/index.html") && response.headers.get("Content-Type")?.includes("text/html")) {
        return new HTMLRewriter()
          .on('footer nav[aria-label="KAIZURO"] a[href="#evolution"]', {
            element(element) {
              element.before('<a href="/how-kaizuro-is-built/">How KAIZURO Is Built</a>', { html: true });
            },
          })
          .transform(response);
      }

      // script.js rewrites the footer after page load. Patch that rewrite too,
      // otherwise it removes the How KAIZURO Is Built link from the DOM.
      if (url.pathname === "/script.js" && response.headers.get("Content-Type")?.includes("javascript")) {
        const source = await response.text();
        const before = 'brandNav.innerHTML = \'<b>KAIZURO</b><a href="#story">Our Story</a><a href="#details">Engineering</a><a href="#proof">Physical Proof</a><a href="#evolution">Development</a>\';';
        const after = 'brandNav.innerHTML = \'<b>KAIZURO</b><a href="#story">Our Story</a><a href="#details">Engineering</a><a href="#proof">Physical Proof</a><a href="/how-kaizuro-is-built/">How KAIZURO Is Built</a><a href="#evolution">Development</a>\';';
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

    // Production partner routes use the partner login form. The app still contains
    // the old staging preview gate, so satisfy that gate internally without exposing
    // or requiring a browser-level Basic Auth prompt for production users.
    const internalUsername = env.BASIC_AUTH_USERNAME || "kaizuro-production-partner-wrapper";
    const internalPassword = env.BASIC_AUTH_PASSWORD || "kaizuro-production-partner-wrapper";
    const headers = new Headers(request.headers);
    headers.set(
      "Authorization",
      `Basic ${btoa(`${internalUsername}:${internalPassword}`)}`,
    );
    request = new Request(request, { headers });

    const appEnv = {
      ...env,
      BASIC_AUTH_USERNAME: internalUsername,
      BASIC_AUTH_PASSWORD: internalPassword,
    };

    return app.fetch(request, appEnv);
  },
};
