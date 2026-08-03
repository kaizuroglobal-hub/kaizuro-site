# KAIZURO Pages CMS setup

This repository uses [Pages CMS](https://app.pagescms.org) to edit approved website copy and image paths without directly editing `index.html`.

## Safety rule

Pages CMS changes must be made on a review branch first. Do not publish directly to `main` until the preview has been checked from the hero through the footer on desktop and mobile.

## Connect Pages CMS

1. Open `https://app.pagescms.org` and sign in with the GitHub account that can access `kaizuroglobal-hub/kaizuro-site`.
2. Select the `kaizuro-site` repository.
3. Select the CMS working branch, currently `copilot/setup-pages-cms-layer` while PR #6 is under review.
4. Pages CMS reads `.pages.yml` automatically.
5. Open a content group, edit the required fields, save and commit the change.

After PR #6 is approved and merged, use a dedicated content branch created from the latest `main` branch for future edits.

## Editable content

The CMS configuration exposes these files:

- `content/site.json` — browser title, description and social image
- `content/hero.json` — hero copy, CTAs, status and images
- `content/story.json` — Why KAIZURO section
- `content/assault.json` — ASSAULT product section
- `content/principles.json` — design principles
- `content/engineering.json` — guide section and four scroll chapters
- `content/founder.json` — Founder introduction, allocation and deposit instructions
- `content/halo.json` — HALO and email-updates sections
- `content/footer.json` — footer brand, copyright and contact email

Square payment URLs, prices, form field names and structural CSS are deliberately not editable through Pages CMS.

## Images

New CMS uploads are stored under:

```text
assets/kaizuro-site/uploads/
```

Do not overwrite curated images elsewhere in `assets/kaizuro-site/`. Use descriptive lowercase filenames with hyphens.

## How the fallback works

`script.js` loads `content-loader.js`. The loader fetches the JSON files in parallel and applies their values to the page. If a content file fails to load or contains invalid data, the hard-coded HTML remains visible.

Engineering chapter data is exposed as `window.kzChapterData`. `script.js` uses that array when available and falls back to its built-in chapter copy otherwise.

## Validate before review

Run from the repository root:

```bash
chmod +x validate-content.sh
./validate-content.sh
```

The validator checks all JSON files in parallel, verifies required files and CMS source names, checks JavaScript syntax when Node.js is available, and confirms the CMS configuration contains each content file.

## Review checklist

Before merging a CMS content change:

1. Run `./validate-content.sh`.
2. Open the branch preview, not the production domain.
3. Confirm the hero, story, ASSAULT, principles, engineering chapters, Founder, HALO, updates and footer.
4. Check mobile and desktop layouts.
5. Confirm Square checkout links and form actions were not changed unintentionally.
6. Merge only after explicit visual approval.
