# KAIZURO Homepage Section Map

Each homepage area has a stable ID and a dedicated final-layout stylesheet. Update one section at a time and review it before moving to the next.

Open `section-review.html` for the section-by-section review menu. Direct previews use `index.html?section=SECTION_ID`.

| Order | Section | HTML ID | Final layout file |
| --- | --- | --- | --- |
| 01 | Ocean hero | `purpose` | `styles/sections/01-hero.css` |
| 02 | Brand origin | `story` | `styles/sections/02-brand-assault.css` |
| 03 | ASSAULT reveal | `assault` | `styles/sections/02-brand-assault.css` |
| 04 | Design principles | `principles` | `styles/sections/03-engineering.css` |
| 05 | Guide architecture | `details` | `styles/sections/03-engineering.css` |
| 06 | Frame, wrap, progression | `technical` | `styles/sections/03-engineering.css` |
| 07 | Grip geometry | `grip` | `styles/sections/03-engineering.css` |
| 08 | Reel interface | `reel` | `styles/sections/03-engineering.css` |
| 09 | Physical proof | `proof` | `styles/sections/04-proof-evolution.css` |
| 10 | Prototype evolution | `evolution` | `styles/sections/04-proof-evolution.css` |
| 11 | Founder 100 | `founder` | `styles/sections/05-founder.css` |
| 12 | Commercial terms | `terms` | `styles/sections/05-founder.css` |
| 13 | HALO | `halo` | `styles/sections/06-halo-footer.css` |
| 14 | Development updates | `updates` | `styles/sections/06-halo-footer.css` |

`styles.css` remains the shared design system and legacy base. The numbered files load after it and are the authority for section layout, responsive behaviour and image focal treatment.
