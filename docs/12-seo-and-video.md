# 12 · SEO + Video Portfolio

## SEO management

### Models
- **`SeoEntry`** — per-path overrides: title, description, canonical, ogImage, ogTitle, ogDescription, twitterCard, schemaJSONLD (raw JSON-LD), noindex flag.
- **`Redirect`** — `{ from, to, code: 301|302|307|308, note }`.

### Endpoints
- `GET  /api/seo/path?path=/work/aroha` — public read for a given path
- `GET  /sitemap.xml` — generated from published Portfolio + Blog + Video + custom SeoEntry paths
- `GET  /robots.txt` — generated with the sitemap reference
- `GET  /api/seo/redirects` — public list (for an edge proxy to consume)
- `GET  /api/seo/entries` — admin list
- `PUT  /api/seo/entries` — upsert by path
- `DELETE /api/seo/entries/:id`
- `POST /api/seo/redirects` / `DELETE /api/seo/redirects/:id`

### Frontend wiring
`<SEOHead />` mounts once at the app root. On every route change it:

1. Resolves the current pathname
2. Fetches the matching `SeoEntry` (falls back to defaults from `siteCopy.meta`)
3. Patches `document.title`, all `<meta>` and `<link rel="canonical">` tags, and an optional `<script type="application/ld+json">`

No `react-helmet` dependency — pure DOM mutation.

### Per-page overrides
Individual pages can pass `<SEOHead overrides={{ title, description, schemaJSONLD }} />` to override the database entry for that route (e.g. dynamic case-study pages reading from the project record itself).

### Admin UI (next phase)
The API + permissions for SEO are wired. The admin UI module is scaffolded as `seo` on the routes/perms side; full CRUD page lands next turn. In the meantime, entries can be POSTed directly via the API or through any HTTP client.

## Video portfolio (`/reel`)

### Model — `Video`
```
title, slug, client, deva, category, duration, year,
youtubeId | vimeoId | mp4Url,            // one playback source
poster, posterAlt, previewUrl,           // thumb + hover preview
excerpt, credits[{role,name}], tags[],
featured, published, order
```

### Endpoints
`GET /api/video`, `GET /api/video/:slug`, `POST /api/video`, `PUT /api/video/:id`, `DELETE /api/video/:id`.

### Page (`apps/web/src/pages/Reel.jsx`)
- Hero featured film with click-to-play overlay
- Category filters (Ad Film, Brand Film, Music Video, Reel, BTS, Short Film, Documentary)
- Tilted-card grid of films
- Theater-style modal with autoplaying YouTube/Vimeo/MP4 player
- SEO via `<SEOHead overrides={…}>`

### Admin UI (next phase)
Video CRUD admin page is scaffolded — same shape as the Portfolio CMS. Landing next turn.

## Testimonials + Press

Models and routes are live:
- `GET/POST/PUT/DELETE /api/testimonials`
- `GET/POST/PUT/DELETE /api/press`

Admin UIs and homepage surfaces (testimonial carousel, awards page) are the next visible payoff once these endpoints fill with content.
