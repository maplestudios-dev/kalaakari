# 07 · Admin CMS Guide

## Sign in
Visit `http://localhost:5174/login`. Seed credentials:
- email: `admin@kalaakaari.in`
- password: `ChangeMe123!`

Change these immediately by re-seeding with new env values, or by adding a "Change password" route in a later phase.

## Dashboard
Top-level analytics panel:
- **Portfolio projects** — total count
- **Total leads** — every contact submission ever received
- **Unread leads** — submissions with `read: false`
- **Most-requested service** — the highest-volume service field across all submissions
- **Lead breakdown by service** — table of service → count

Quick links: → Manage portfolio · → Review leads · → Export CSV.

## Portfolio module
Fields available in the create / edit drawer:
- `title` *(required)* — display title
- `slug` *(required)* — URL fragment, e.g. `hauz-khas-collective`
- `client` — display name for the client/brand
- `deva` — Hindi/Devanagari sub-label shown under the title
- `category` — one of: Branding, Campaign, Content, Digital, Performance, Production, Film, Social, Packaging, Identity
- `year` — number
- `result` — short tag rendered on the card (e.g. "4.2M Impressions")
- `industry`
- `cover` — image URL (Cloudinary in production)
- `excerpt` — short description
- `challenge`, `idea`, `execution` — case-study body sections
- `featured` — bool, drives Tilted Card placement on homepage
- `published` — bool, draft/live toggle

Order operations: row actions are **edit** / **delete**; drag-to-reorder is queued for a later phase (use the `order` field directly via the schema in the meantime).

## Submissions (leads) module
- Table view: timestamp, name / brand, email, service, budget, read status
- Actions per row: **view** (modal with full message), **mark read / unread**, **delete**
- Top-right CTA: **Export CSV** — downloads `kalaakaari-leads.csv` with the full submission history

## Field-level workflows
- Mark a project as **featured** to surface it in the Tilted-Card homepage slot.
- Set `published: false` to hide a draft project from the public site without deleting it.
- Set `read: true` from the inbox modal to track which leads have been triaged.

## Roadmap modules (not in MVP)
The schemas and routes are already in place for BlogPost, JobPost, and HomepageSection. Wiring them into admin UIs (Journal, Careers, Homepage Sections, Media Library) is the next phase — see `08-deployment.md` and the project README.
