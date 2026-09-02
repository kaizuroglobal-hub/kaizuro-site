import { DurableObject } from "cloudflare:workers";

const STORE_NAME = "kaizuro-partner-submissions";

export class PartnerReferrals extends DurableObject {
  async listForPartner(partnerId, type) {
    const entries = await this.ctx.storage.list({
      prefix: `${type}:${partnerId}:`,
      limit: 5000,
      reverse: true,
    });
    return [...entries.values()].sort((a, b) => String(b?.createdAt || "").localeCompare(String(a?.createdAt || "")));
  }

  async listAll(type, limit = 5000) {
    const entries = await this.ctx.storage.list({
      prefix: `${type}:`,
      reverse: true,
      limit,
    });
    return [...entries.values()].sort((a, b) => String(b?.createdAt || "").localeCompare(String(a?.createdAt || "")));
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/list") {
      return Response.json(await this.listAll(url.searchParams.get("type") || "account"));
    }
    return new Response("Not found", { status: 404 });
  }
}

export { STORE_NAME };
