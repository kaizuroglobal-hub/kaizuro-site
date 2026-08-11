import app from "./index.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Public production site: bypass the temporary global Basic Auth gate.
    if (!url.pathname.startsWith("/partners")) {
      return env.ASSETS.fetch(request);
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
