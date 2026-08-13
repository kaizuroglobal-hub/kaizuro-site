import site from "./trademark.js";
import { DurableObject } from "cloudflare:workers";

const STORE_NAME = "kaizuro-partner-submissions";

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
  const cookie = (request.headers.get("Cookie") || "")
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith("kz_partner="));
  if (!cookie) return null;

  const value = decodeURIComponent(cookie.split("=").slice(1).join("="));
  const [username, exp, signature] = value.split("|");
  if (!username || !exp || !signature || Number(exp) < Date.now()) return null;

  const expected = await sign(`${username}|${exp}`, env.PARTNER_SESSION_SECRET);
  if (signature !== expected) return null;
  return accounts(env).find((account) => account.username === username) || null;
}

function store(env) {
  if (!env.PARTNER_REFERRALS) throw new Error("Partner submission storage is not configured");
  const id = env.PARTNER_REFERRALS.idFromName(STORE_NAME);
  return env.PARTNER_REFERRALS.get(id);
}

function cleanField(form, name, maxLength = 500) {
  return String(form.get(name) || "").trim().slice(0, maxLength);
}

function reference(prefix) {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  const random = crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase();
  return `${prefix}-${date}-${random}`;
}

function validOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}

function referralHistoryMarkup(referrals) {
  if (!referrals.length) {
    return '<section class="section"><h2>Your referrals</h2><p>No customer referrals have been registered yet.</p></section>';
  }

  const rows = referrals.map((item) => `
    <tr>
      <td>${esc(item.id)}</td>
      <td>${esc(new Date(item.createdAt).toLocaleDateString("en-AU"))}</td>
      <td>${esc(item.customerName)}</td>
      <td>${esc(item.productInterest || "—")}</td>
      <td>${esc(item.status || "New")}</td>
    </tr>`).join("");

  return `<section class="section"><h2>Your referrals</h2><p>Customer referrals registered through this partner account.</p><table class="compare"><thead><tr><th>Reference</th><th>Date</th><th>Customer</th><th>Product</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></section>`;
}

function supportHistoryMarkup(requests) {
  if (!requests.length) {
    return '<section class="section"><h2>Your support requests</h2><p>No support requests have been submitted yet.</p></section>';
  }

  const rows = requests.map((item) => `
    <tr>
      <td>${esc(item.id)}</td>
      <td>${esc(new Date(item.createdAt).toLocaleDateString("en-AU"))}</td>
      <td>${esc(item.requestType || "—")}</td>
      <td>${esc(item.customerReference || "—")}</td>
      <td>${esc(item.status || "Open")}</td>
    </tr>`).join("");

  return `<section class="section"><h2>Your support requests</h2><p>Requests submitted through this partner account.</p><table class="compare"><thead><tr><th>Reference</th><th>Date</th><th>Type</th><th>Customer / reference</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></section>`;
}

function resultMarkup(url, successKey, errorKey, successLabel) {
  const success = url.searchParams.get(successKey);
  const error = url.searchParams.get(errorKey);
  if (success) {
    return `<div class="callout"><b>${esc(successLabel)}</b><br>Reference: <b>${esc(success)}</b>. It has been saved to your KAIZURO partner account.</div>`;
  }
  if (error) {
    return `<div class="callout"><b>Submission not saved.</b><br>${esc(error)}</div>`;
  }
  return "";
}

async function renderAccountPage(request, env, ctx, account) {
  const response = await site.fetch(request, env, ctx);
  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes("text/html")) return response;

  let referrals = [];
  try {
    referrals = await store(env).listForPartner(account.partnerId || account.username, "referral");
  } catch {
    referrals = [];
  }

  const url = new URL(request.url);
  const message = resultMarkup(url, "referral", "referral_error", "Referral registered.");
  const history = referralHistoryMarkup(referrals);

  return new HTMLRewriter()
    .on('.resource-head .copy', {
      element(element) {
        element.setInnerContent("Your KAIZURO partner identity, customer referral form and referral history. Customer referrals are saved directly to your authenticated partner account.");
      },
    })
    .on('#customer-referral > p', {
      element(element) {
        element.setInnerContent("Use this after a dealer conversation or charter trip. Submitting the form saves the referral directly to your KAIZURO partner account.");
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
        element.setInnerContent("The referral is securely saved to this partner account. No email application is required.");
      },
    })
    .on('#customer-referral', {
      element(element) {
        if (message) element.prepend(message, { html: true });
        element.after(history, { html: true });
      },
    })
    .transform(response);
}

async function renderSupportPage(request, env, ctx, account) {
  const response = await site.fetch(request, env, ctx);
  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes("text/html")) return response;

  let requests = [];
  try {
    requests = await store(env).listForPartner(account.partnerId || account.username, "support");
  } catch {
    requests = [];
  }

  const url = new URL(request.url);
  const message = resultMarkup(url, "support", "support_error", "Support request submitted.");
  const history = supportHistoryMarkup(requests);

  return new HTMLRewriter()
    .on('#support-form form[data-mail-form]', {
      element(element) {
        element.removeAttribute("data-mail-form");
        element.removeAttribute("data-subject");
        element.setAttribute("method", "post");
        element.setAttribute("action", "/partners/portal/support-requests");
      },
    })
    .on('#support-form form button[type="submit"]', {
      element(element) {
        element.setInnerContent("Submit support request");
      },
    })
    .on('#support-form', {
      element(element) {
        if (message) element.prepend(message, { html: true });
        element.after(history, { html: true });
      },
    })
    .transform(response);
}

async function submitReferral(request, env, account) {
  const url = new URL(request.url);
  if (!validOrigin(request)) return new Response("Invalid referral request.", { status: 403 });

  const form = await request.formData();
  const customerName = cleanField(form, "Customer name", 140);
  const customerEmail = cleanField(form, "Customer email", 254);
  const customerMobile = cleanField(form, "Customer mobile", 60);
  const productInterest = cleanField(form, "Product interest", 80);
  const targetSpecies = cleanField(form, "Target species", 160);
  const typicalPeClass = cleanField(form, "Typical PE class", 60);
  const fishingRequirements = cleanField(form, "Fishing requirements", 2000);

  if (!customerName || !customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    const redirect = new URL("/partners/portal/account", url);
    redirect.searchParams.set("referral_error", "Customer name and a valid email address are required.");
    redirect.hash = "customer-referral";
    return Response.redirect(redirect.toString(), 303);
  }

  const submission = {
    id: reference("KZR"),
    type: "referral",
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
    await store(env).createSubmission(submission);
  } catch {
    const redirect = new URL("/partners/portal/account", url);
    redirect.searchParams.set("referral_error", "The referral could not be saved. Please try again.");
    redirect.hash = "customer-referral";
    return Response.redirect(redirect.toString(), 303);
  }

  const redirect = new URL("/partners/portal/account", url);
  redirect.searchParams.set("referral", submission.id);
  redirect.hash = "customer-referral";
  return Response.redirect(redirect.toString(), 303);
}

async function submitSupport(request, env, account) {
  const url = new URL(request.url);
  if (!validOrigin(request)) return new Response("Invalid support request.", { status: 403 });

  const form = await request.formData();
  const requestType = cleanField(form, "Request type", 100);
  const customerReference = cleanField(form, "Customer or reference", 180);
  const details = cleanField(form, "Details", 4000);

  if (!requestType || !details) {
    const redirect = new URL("/partners/portal/support", url);
    redirect.searchParams.set("support_error", "Request type and details are required.");
    redirect.hash = "support-form";
    return Response.redirect(redirect.toString(), 303);
  }

  const submission = {
    id: reference("KZS"),
    type: "support",
    partnerId: String(account.partnerId || account.username),
    partnerName: String(account.dealerName || account.username),
    partnerCode: String(account.referralCode || ""),
    region: String(account.region || ""),
    requestType,
    customerReference,
    details,
    status: "Open",
    createdAt: new Date().toISOString(),
  };

  try {
    await store(env).createSubmission(submission);
  } catch {
    const redirect = new URL("/partners/portal/support", url);
    redirect.searchParams.set("support_error", "The support request could not be saved. Please try again.");
    redirect.hash = "support-form";
    return Response.redirect(redirect.toString(), 303);
  }

  const redirect = new URL("/partners/portal/support", url);
  redirect.searchParams.set("support", submission.id);
  redirect.hash = "support-form";
  return Response.redirect(redirect.toString(), 303);
}

export class PartnerReferrals extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
  }

  async createSubmission(submission) {
    const key = `${submission.type}:${submission.partnerId}:${submission.createdAt}:${submission.id}`;
    await this.ctx.storage.put(key, submission);
    return submission;
  }

  async listForPartner(partnerId, type) {
    const entries = await this.ctx.storage.list({
      prefix: `${type}:${partnerId}:`,
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

    if (url.pathname === "/partners/portal/support-requests" && request.method === "POST") {
      const account = await currentAccount(request, env);
      if (!account) return Response.redirect(new URL("/partners", url), 302);
      return submitSupport(request, env, account);
    }

    if ((url.pathname === "/partners/portal/account" || url.pathname === "/partners/portal/account/") && request.method === "GET") {
      const account = await currentAccount(request, env);
      if (!account) return Response.redirect(new URL("/partners", url), 302);
      return renderAccountPage(request, env, ctx, account);
    }

    if ((url.pathname === "/partners/portal/support" || url.pathname === "/partners/portal/support/") && request.method === "GET") {
      const account = await currentAccount(request, env);
      if (!account) return Response.redirect(new URL("/partners", url), 302);
      return renderSupportPage(request, env, ctx, account);
    }

    return site.fetch(request, env, ctx);
  },
};
