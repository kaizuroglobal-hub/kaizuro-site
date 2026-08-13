import site from "./public.js";
import { DurableObject } from "cloudflare:workers";

const REFERRAL_STORE_NAME = "kaizuro-partner-referrals";

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function accounts(env) {
  try {
    const raw = env.PARTNER_ACCOUNTS;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "object") return [raw];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

async function sign(text, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(text));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function currentAccount(request, env) {
  if (!env.PARTNER_SESSION_SECRET) return null;
  const rawCookie = (request.headers.get("Cookie") || "")
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith("kz_partner="));
  if (!rawCookie) return null;

  const value = decodeURIComponent(rawCookie.split("=").slice(1).join("="));
  const [username, exp, signature] = value.split("|");
  if (!username || !exp || !signature || Number(exp) < Date.now()) return null;

  const expected = await sign(`${username}|${exp}`, env.PARTNER_SESSION_SECRET);
  if (signature !== expected) return null;
  return accounts(env).find((account) => account.username === username) || null;
}

function referralStore(env) {
  const id = env.PARTNER_REFERRALS.idFromName(REFERRAL_STORE_NAME);
  return env.PARTNER_REFERRALS.get(id);
}

function cleanField(form, name, maxLength = 500) {
  return String(form.get(name) || "").trim().slice(0, maxLength);
}

function referralId() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const random = crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase();
  return `KZR-${date}-${random}`;
}

function formatReferralDate(value) {
  try {
    return new Intl.DateTimeFormat("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "Australia/Sydney",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function referralHistoryMarkup(referrals) {
  if (!referrals.length) {
    return `<div style="margin-top:42px;padding-top:30px;border-top:1px solid rgba(255,255,255,.16)"><h3>Your referrals</h3><p class="small-copy">No customer referrals have been registered yet.</p></div>`;
  }

  const cards = referrals.map((referral) => `
    <article class="resource-card">
      <span class="mini">${esc(referral.status || "New")} · ${esc(referral.id)}</span>
      <h3>${esc(referral.customerName)}</h3>
      <p><b>${esc(referral.productInterest || "Not yet decided")}</b></p>
      <p>${esc(referral.customerEmail)}${referral.customerMobile ? ` · ${esc(referral.customerMobile)}` : ""}</p>
      ${referral.targetSpecies ? `<p>Target species: ${esc(referral.targetSpecies)}</p>` : ""}
      ${referral.typicalPeClass ? `<p>Typical PE class: ${esc(referral.typicalPeClass)}</p>` : ""}
      <p class="small-copy">Registered ${esc(formatReferralDate(referral.createdAt))}</p>
    </article>`).join("");

  return `<div style="margin-top:42px;padding-top:30px;border-top:1px solid rgba(255,255,255,.16)"><h3>Your referrals</h3><p class="small-copy">Latest referrals registered against this partner account.</p><div class="resource-grid">${cards}</div></div>`;
}

function messageMarkup(url) {
  const success = url.searchParams.get("referral");
  const error = url.searchParams.get("referral_error");
  if (success) {
    return `<div class="callout"><b>Referral registered.</b><br>Reference: <b>${esc(success)}</b>. It is now saved against your KAIZURO partner account.</div>`;
  }
  if (error) {
    return `<div class="callout"><b>Referral not submitted.</b><br>${esc(error)}</div>`;
  }
  return "";
}

async function renderAccountPage(request, env, ctx, account) {
  const response = await site.fetch(request, env, ctx);
  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes("text/html")) return response;

  let referrals = [];
  try {
    referrals = await referralStore(env).listForPartner(account.partnerId || account.username);
  } catch {
    referrals = [];
  }

  const url = new URL(request.url);
  const history = referralHistoryMarkup(referrals);
  const message = messageMarkup(url);

  return new HTMLRewriter()
    .on('#customer-referral > p', {
      element(element) {
        element.setInnerContent("Use this after a dealer conversation or charter trip. Submitting this form saves the referral directly to your KAIZURO partner account.");
      },
    })
    .on('#customer-referral form[data-mail-form]', {
      element(element) {
        element.removeAttribute("data-mail-form");
        element.removeAttribute("data-subject");
        element.setAttribute("method", "post");
        element.setAttribute("action", "/partners/portal/referrals");
      },
    })
    .on('#customer-referral form button[type="submit"]', {
      element(element) {
        element.setInnerContent("Submit customer referral");
      },
    })
    .on('#customer-referral .form-note', {
      element(element) {
        element.setInnerContent("The referral is securely saved to this partner account. Customer information is visible only within the authenticated KAIZURO partner workflow.");
      },
    })
    .on('#customer-referral', {
      element(element) {
        if (message) element.prepend(message, { html: true });
        element.append(history, { html: true });
      },
    })
    .transform(response);
}

async function submitReferral(request, env, account) {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin");
  if (origin && origin !== url.origin) {
    return new Response("Invalid referral request.", { status: 403 });
  }

  const form = await request.formData();
  const customerName = cleanField(form, "Customer name", 140);
  const customerEmail = cleanField(form, "Customer email", 254);
  const customerMobile = cleanField(form, "Customer mobile", 60);
  const productInterest = cleanField(form, "Product interest", 80);
  const targetSpecies = cleanField(form, "Target species", 160);
  const typicalPeClass = cleanField(form, "Typical PE class", 60);
  const fishingRequirements = cleanField(form, "Fishing requirements", 2000);

  if (!customerName || !customerEmail || !customerEmail.includes("@")) {
    const redirect = new URL("/partners/portal/account", url);
    redirect.searchParams.set("referral_error", "Customer name and a valid email address are required.");
    redirect.hash = "customer-referral";
    return Response.redirect(redirect.toString(), 303);
  }

  const referral = {
    id: referralId(),
    partnerId: String(account.partnerId || account.username),
    partnerName: String(account.dealerName || account.username),
    partnerCode: String(account.referralCode || ""),
    region: String(account.region || ""),
    customerName,
    customerEmail,
    customerMobile,
    productInterest,
    targetSpecies,
    typicalPeClass,
    fishingRequirements,
    status: "New",
    createdAt: new Date().toISOString(),
  };

  try {
    await referralStore(env).createReferral(referral);
  } catch {
    const redirect = new URL("/partners/portal/account", url);
    redirect.searchParams.set("referral_error", "The referral could not be saved. Please try again.");
    redirect.hash = "customer-referral";
    return Response.redirect(redirect.toString(), 303);
  }

  const redirect = new URL("/partners/portal/account", url);
  redirect.searchParams.set("referral", referral.id);
  redirect.hash = "customer-referral";
  return Response.redirect(redirect.toString(), 303);
}

export class PartnerReferrals extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
  }

  async createReferral(referral) {
    const key = `${referral.partnerId}:${referral.createdAt}:${referral.id}`;
    await this.ctx.storage.put(key, referral);
    return referral;
  }

  async listForPartner(partnerId) {
    const entries = await this.ctx.storage.list({
      prefix: `${partnerId}:`,
      limit: 100,
    });
    return [...entries.values()].sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/partners/portal/referrals" && request.method === "POST") {
      const account = await currentAccount(request, env);
      if (!account) return Response.redirect(new URL("/partners", url), 302);
      return submitReferral(request, env, account);
    }

    if ((url.pathname === "/partners/portal/account" || url.pathname === "/partners/portal/account/") && request.method === "GET") {
      const account = await currentAccount(request, env);
      if (!account) return Response.redirect(new URL("/partners", url), 302);
      return renderAccountPage(request, env, ctx, account);
    }

    return site.fetch(request, env, ctx);
  },
};
