import app from "./index.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Public production site: bypass the temporary global Basic Auth gate.
    if (!url.pathname.startsWith("/partners")) {
      const response = await env.ASSETS.fetch(request);

      // Add the How KAIZURO Is Built link to the production homepage footer.
      if ((url.pathname === "/" || url.pathname === "/index.html") && response.headers.get("Content-Type")?.includes("text/html")) {
        return new HTMLRewriter()
          .on('footer nav[aria-label="KAIZURO"] a[href="#evolution"]', {
            element(element) {
              element.before('<a href="/how-kaizuro-is-built/">How KAIZURO Is Built</a>', { html: true });
            },
          })
          .transform(response);
      }

      return response;
    }

    // Keep the separate KAIZURO partner portal authentication working.
    if (env.BASIC_AUTH_USERNAME && env.BASIC_AUTH_PASSWORD) {
      const headers = new Headers(request.headers);
      headers.set(
        "Authorization",
        `Basic ${btoa(`${env.BASIC_AUTH_USERNAME}:${env.BASIC_AUTH_PASSWORD}`)}`,
      );
      request = new Request(request, { headers });
    }

    return app.fetch(request, env);
  },
};
