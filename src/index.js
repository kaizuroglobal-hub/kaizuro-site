function resolveAssetRequest(request) {
  const url = new URL(request.url);

  if (url.pathname === "/partners" || url.pathname === "/partners/") {
    url.pathname = "/partners/index.html";
    return new Request(url.toString(), request);
  }

  return request;
}

export default {
  async fetch(request, env) {
    const assetRequest = resolveAssetRequest(request);
    const response = await env.ASSETS.fetch(assetRequest);
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "no-store");
    headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
