# 11 · JSON Copywriting System

## What it is

Every editable string on the public site is in a single JSON document. The admin can:

- Edit any field inline as JSON
- Upload a full JSON file to replace site copy in one shot
- Download the current copy as JSON
- Load the bundled defaults back into the editor
- Format / pretty-print
- See version history (last 30 saves) and restore any prior version

The web app reads this once at boot and re-renders the entire homepage from it.

## Shape

The schema is defined by `apps/api/src/lib/defaultCopy.js` (server) and mirrored at `apps/web/src/lib/defaultCopy.js` (client fallback). Top-level keys:

- `meta` — site name, tagline, default OG image
- `nav` — header links + CTA
- `hero` — eyebrow, title halves (KALAA × KAARI), sub, body, chips, both CTAs, bottom labels
- `marquee` — array of `{ en, deva, acc? }`
- `pillars` — eyebrow + 3 items with `n`, `en`, `deva`, `body`
- `about` — title, eyebrow, paragraphs, CTA, meta key-value pairs, count-up metrics
- `work` — section eyebrow, title, view-all CTA (cards still come from the Portfolio CMS)
- `services` — 6 service rows
- `manifesto` — quote halves, deva sub, attribution
- `brandsTicker` — array of strings (Devanagari ones auto-detect and switch font)
- `finalCta` — title halves, deva sub, both CTAs
- `footer` — brand line, columns (Studio/Capabilities/Contact), copyright, legal links

Multi-line headings use `\n` — components split and render lines as `<span class="block">`.

## API

| Verb | Path | Perm | Effect |
|---|---|---|---|
| GET  | `/api/site-copy` | public | Returns `{ version, copy, updatedAt }` |
| GET  | `/api/site-copy/default` | public | Returns the bundled defaults |
| GET  | `/api/site-copy/versions` | `copy.read` | Returns `{ current, history }` (max 30) |
| PUT  | `/api/site-copy` | `copy.write` | Replaces copy with the body; bumps version |
| POST | `/api/site-copy/restore/:version` | `copy.restore` | Replays an older version as the new active one |

Every save snapshots the previous version into `history[]` along with `updatedByName` and an optional `note`. History is capped at 30 entries.

## Frontend wiring

```jsx
// main.jsx
<CopyProvider>
  <App />
</CopyProvider>

// any component
import { useCopy } from '../lib/copy.jsx'
const hero = useCopy('hero')           // section object
const title = useCopy('hero.title1')   // single field
```

`CopyProvider` fetches `/site-copy` on mount and **deep-merges** the response over the bundled defaults. That means newly-added defaults appear immediately for any field not yet customized in the database — adding a field is safe, removing one is forward-compatible.

## i18n path

The system is one nested object per language away from i18n. Drop a `hi` key alongside `en` in each leaf, expose a language picker, and route the hook through the active locale. The Devanagari fonts and palette are already in place.
