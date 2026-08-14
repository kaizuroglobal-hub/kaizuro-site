import app from "./dealer-modules.js";
export { PartnerReferrals } from "./dealer-modules.js";

const REWRITES = [
  ['a[href="#earnings"]', "/partners/portal/earnings"],
  ['a[href="/partners/portal#earnings"]', "/partners/portal/earnings"],
  ['a[href="#products"]', "/partners/portal/products"],
  ['a[href="/partners/portal#products"]', "/partners/portal/products"],
  ['a[href="#allocation"]', "/partners/portal/allocation"],
  ['a[href="/partners/portal#allocation"]', "/partners/portal/allocation"],
  ['a[href="#marketing"]', "/partners/portal/marketing"],
  ['a[href="/partners/portal#marketing"]', "/partners/portal/marketing"],
  ['a[href="#academy"]', "/partners/portal/academy"],
  ['a[href="/partners/portal#academy"]', "/partners/portal/academy"],
  ['a[href="/partners/portal/account#customer-referral"]', "/partners/portal/leads/new"],
];

function normalizeNavigation(response) {
  const type = response.headers.get("Content-Type") || "";
  if (!type.includes("text/html")) return response;
  const rewriter = new HTMLRewriter();
  for (const [selector, href] of REWRITES) {
    rewriter.on(selector, { element(element) { element.setAttribute("href", href); } });
  }
  return rewriter.transform(response);
}

export default {
  async fetch(request, env, ctx) {
    const response = await app.fetch(request, env, ctx);
    const url = new URL(request.url);
    if (request.method !== "GET" || !url.pathname.startsWith("/partners/portal")) return response;
    return normalizeNavigation(response);
  },
};
