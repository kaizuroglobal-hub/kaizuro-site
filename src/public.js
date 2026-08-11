import app from "./index.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Secure same-domain handoff for the Follow the Build email field.
    if (url.pathname === "/join" && request.method === "POST") {
      const form = await request.formData();
      const email = String(form.get("email") || "").trim();
      const mailto = new URL("mailto:info@kaizuro.com");
      mailto.searchParams.set("subject", "KAIZURO Follow the Build");
      mailto.searchParams.set("body", `Please add this email to the KAIZURO update list:\n\n${email}`);
      return Response.redirect(mailto.toString(), 303);
    }

    if (!url.pathname.startsWith("/partners")) {
      const response = await env.ASSETS.fetch(request);

      if ((url.pathname === "/" || url.pathname === "/index.html") && response.headers.get("Content-Type")?.includes("text/html")) {
        return new HTMLRewriter()
          .on('#updates form', {
            element(element) {
              element.setAttribute("action", "/join");
              element.setAttribute("method", "post");
              element.removeAttribute("enctype");
            },
          })
          .on('#specifications .specifications-list > div:nth-child(9) dd', {
            element(element) {
              element.setInnerContent("FUJI DPSSD GM Deluxe Seat");
            },
          })
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
