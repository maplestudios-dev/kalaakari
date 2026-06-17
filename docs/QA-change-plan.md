# KALAAKAARI — QA Change Request: Execution Plan

Source: `kalaakaari_website_QA_final.pdf` (June 2026). 24 change requests across 13 sections.
Status legend: ⬜ todo · 🟡 partial (prior work) · ✅ done · 🔵 needs product decision

---

## All changes (by section)

| # | Section | Change | Priority | Status |
|---|---------|--------|----------|--------|
| 1 | Navbar | Recommendations section (music/movies/books), CMS-editable | HIGH | ✅ |
| 2 | Navbar | Logo easter egg panel (KALAA + KAARI breakdown) + entry icon | MEDIUM | ✅ |
| 3 | Hero | Convert hero to CMS-editable carousel (image/video slides) | HIGH | ✅ |
| 4 | About | Counters animate up from 0; seeds → 4 / 42+ / 180M; remove "DEMO SEED" note | HIGH | ✅ |
| 5 | Sneak Peek | Replace bottom category with client name (equal prominence to title) | HIGH | ✅ |
| 6 | Sneak Peek | Drag-to-reorder portfolio display order in CMS | HIGH | ✅ |
| 7 | Films | Drag-to-reorder video display order in CMS | HIGH | ✅ |
| 8 | Client Marquee | Replace text names with uploadable brand logos | HIGH | ✅ |
| 9 | Client Marquee | Auto-scroll + manual swipe (pause on hover/touch) | MEDIUM | ✅ |
| 10 | Footer | Email → business@kalaakaari.in, clickable mailto: link | HIGH | ✅ |
| 11 | Work Page | Replace bottom category with client name on cards | HIGH | ✅ |
| 12 | Work Page | Make project categories editable via CMS (add/rename/remove) | HIGH | ✅ |
| 13 | Project Pages | Prominent client logo/name in project header (logo uploadable) | HIGH | ✅ |
| 14 | Reel | Fix missing video thumbnails (render poster; CMS-uploadable) | HIGH | ✅ |
| 15 | Reel | Add client name to video cards (replace category at bottom) | HIGH | ✅ |
| 16 | Reel | CMS control to pin featured hero video | HIGH | ✅ |
| 17 | Reel | Support vertical / short-form 9:16 video | HIGH | ✅ |
| 18 | Reel | Make video categories editable via CMS | HIGH | ✅ |
| 19 | Services | Individual service pages with linked (filtered) portfolio | HIGH | ✅ |
| 20 | Services | Make services fully editable via CMS (names, copy, sub-caps, projects) | HIGH | ✅ |
| 21 | Journal | Make journal categories editable via CMS | MEDIUM | ✅ |
| 22 | Careers | CMS-editable job postings (create/edit/unpublish) | HIGH | ✅ |
| 23 | — | (Reel thumbnail auto-generate from video — optional enhancement) | LOW | ✅ |

Notes on prior work / existing infra:
- **#17 done** — `orientation` field + 9:16 player & cards already shipped.
- **#14 partial** — `/reel` now renders `poster` and the admin Video form has a poster uploader. Remaining: auto-generate a thumbnail when none is uploaded (optional, #23).
- **#16 partial** — `Video.featured` flag exists and `/reel` uses it for the hero; admin has a Featured checkbox. Remaining: make it a single-pin UX if desired.
- **#22 partial** — `JobPost` model + `/careers` CRUD API already exist; only the **admin Careers page** and wiring `/careers` web page to the API are missing.
- `Portfolio` and `Video` already have an `order` field → reorder is persistence-ready; needs drag UI.
- Categories are currently **hardcoded enums** on `Portfolio`/`Video` and the web filter arrays → making them CMS-editable is the larger lift (#12, #18, #21).
- Services are driven by `SiteCopy` JSON (`useCopy('services')`), no dedicated model → individual pages (#19/#20) need a small Service model or structured copy + routing.

---

## Phased execution

### Phase 1 — Quick frontend fixes (no schema changes, low risk)
- **#10 Footer** email → `business@kalaakaari.in` + `mailto:` link.
- **#4 About counters** — animate from 0, update seed values (4 / 42+ / 180M), remove "DEMO SEED VALUES" note.
- **#5 / #11 / #15 Client name on cards** — shared change across Sneak Peek (homepage `FeaturedWork`), Work page, and Reel cards: drop the duplicated bottom category, show client name at title prominence.
- **#9 Marquee auto-scroll + manual swipe**.

### Phase 2 — Drag-to-reorder in CMS (#6, #7)
- Add drag-and-drop ordering to admin Portfolio + Video lists; persist `order`; ensure web sorts by `order` ascending.

### Phase 3 — Homepage media (#8 marquee logos, #3 hero carousel)
- **#8** — change `HomepageSection.brands` from `string[]` to `[{ name, logo }]`; admin upload; web renders logos (light/filtered).
- **#3** — extend hero to `slides[]` (image OR video); CMS add/remove/reorder; web carousel (slide 1 = current hero).

### Phase 4 — Editable categories via CMS (#12, #18, #21)
- Introduce a lightweight category source (per-type lists in CMS); admin CRUD; web filters read from API; projects/videos/posts assignable.

### Phase 5 — Careers CMS (#22)
- Build admin Careers page (CRUD over existing API); wire `/careers` web page to live data.

### Phase 6 — Project & Services identity (#13, #19, #20)
- **#13** — add `clientLogo` to `Portfolio`; render prominently in case-study header.
- **#19/#20** — Service model/structured copy; `/services/:slug` pages with filtered portfolio; admin editing.

### Phase 7 — Navbar features (#1 Recommendations, #2 easter egg)
- **#1** — new `Recommendation` model (type: music/movie/book) + admin CRUD + web page + nav link.
- **#2** — logo easter-egg modal (KALAA + KAARI breakdown) + entry icon.

### Phase 8 — Optional polish
- **#23** — auto-generate Reel thumbnails from video when no poster uploaded.

---

## Open product decisions
- **#2 easter egg**: exact panel content/copy and the "small icon to the left of the logo" styling.
- **#1 Recommendations**: fields per item (title, creator, cover image, note, link?), and nav placement (link vs dropdown).
- **#16**: keep multi-`featured` or enforce single pinned hero.
