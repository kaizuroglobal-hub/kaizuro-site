import app, { PartnerReferrals as BasePartnerReferrals } from "./dealer-commercial-v2.js";
import { PartnerReferrals as AdminPartnerReferrals } from "./admin-partner-referrals.js";

const HOST = "portal.kaizuro.com";
const STORE_NAME = "kaizuro-partner-submissions";
const ROOT = "/kaizuro-admin";
const ADMIN_EMAIL = "kaizuroglobal@gmail.com";
const ADMIN_PASSWORD_SHA = "505606478ea56d72999fbc7f9d32dbb0d61d3423b0735e6d467c86f34a13cbf9";
const MODULES = new Set(["overview","dealers","leads","orders","allocation","products","support"]);
const ALLOCATION_STATES = ["Submitted","Approved","Reserved","Shipped","Declined"];
const SUPPORT_STATES = ["Open","Waiting dealer","Resolved"];

export class PartnerReferrals extends AdminPartnerReferrals {
  async listAll(type, limit = 5000) {
    const entries = await this.ctx.storage.list({ prefix: `${type}:`, reverse: true, limit });
    return [...entries.values()].sort((a,b)=>String(b?.createdAt||"").localeCompare(String(a?.createdAt||"")));
  }
}

