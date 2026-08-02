# KAIZURO Site

Static KAIZURO website hosted on **Cloudflare Pages**.

Live at: https://kaizuro.com

---

## Deployment

This site is deployed via **Cloudflare Pages** on every push to `main`.

The GitHub Actions workflow at `.github/workflows/deploy.yml` handles automatic deployment using the `cloudflare/pages-action`.

### Required GitHub repository secrets

| Secret | Description |
|---|---|
| `CLOUDFLARE_API_TOKEN` | A Cloudflare API token with **Cloudflare Pages: Edit** permission |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID (found in the Cloudflare dashboard URL or right-hand sidebar) |

---

## Manual Cloudflare dashboard steps

These one-time steps must be completed in the Cloudflare dashboard:

1. **Create the Cloudflare Pages project**
   - Go to **Workers & Pages → Create application → Pages → Connect to Git**
   - Select the `kaizuroglobal-hub/kaizuro-site` repository
   - Project name: `kaizuro-site`
   - Build command: *(leave blank — plain static site)*
   - Build output directory: `/` (root)
   - Save and deploy

2. **Add custom domains**
   - In the Pages project, go to **Custom domains → Set up a custom domain**
   - Add `kaizuro.com`
   - Add `www.kaizuro.com`
   - Cloudflare will automatically configure DNS since it already manages `kaizuro.com`

3. **Add GitHub secrets** (see table above)
   - In the GitHub repo go to **Settings → Secrets and variables → Actions → New repository secret**
   - Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`

Once these steps are done, every push to `main` will automatically deploy the site to Cloudflare Pages.

---

## Build settings summary

| Setting | Value |
|---|---|
| Framework preset | None (static HTML) |
| Build command | *(none)* |
| Build output directory | `/` (root) |
| Root directory | `/` |
| Node.js version | N/A |
