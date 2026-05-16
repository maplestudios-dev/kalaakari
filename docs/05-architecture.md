# 05 · Technical Architecture

## Monorepo
```
kalaakaari/
├── apps/
│   ├── web/       React 18 + Vite + Tailwind + Framer Motion + react-bits (themed)
│   ├── admin/     React 18 + Vite + Tailwind + react-hook-form
│   └── api/       Node 18+ · Express · Mongoose · JWT · helmet · rate-limit
├── packages/      (reserved for shared design tokens / types)
├── docs/          Notion-ready markdown
└── pnpm-workspace.yaml · turbo.json · package.json
```

Workspace tool: **pnpm workspaces + Turborepo**. `pnpm dev` runs all three apps in parallel.

## Frontend architecture (`apps/web`)
- `src/App.jsx` mounts `<Navbar>`, `<Grain>`, the router, and `<Footer>`.
- Pages live in `src/pages` — Home is composed of section components from `src/components`.
- `src/components/bits/index.jsx` exposes themed react-bits components.
- Tailwind tokens are mirrored from `--bg`, `--ink`, `--saffron` … into `tailwind.config.js`.
- Data hits the API via `axios` with the `VITE_API_URL` env var; pages fall back to demo content when the API is unreachable so the site is always presentable.

## Admin architecture (`apps/admin`)
- Two routes' worth of UI: Login + `<Shell>` with Dashboard, Portfolio, Submissions.
- `src/lib/api.js` attaches the JWT from `localStorage.kalaakaari_token`, intercepts 401 → redirects to /login.
- Forms use `react-hook-form` with inline drawer editing.

## Backend architecture (`apps/api`)
Express app composed from:
- `src/index.js` — boots Mongoose, mounts middleware (helmet, JSON, morgan, CORS, rate-limit) and routes.
- `src/middleware/auth.js` — `requireAuth(req)` reads `Authorization: Bearer …` and verifies with `JWT_SECRET`.
- `src/middleware/errors.js` — central 404 + error handler with status-aware JSON.
- `src/models/*` — Mongoose schemas (User, PortfolioProject, ContactSubmission, BlogPost, JobPost, HomepageSection).
- `src/routes/*` — REST endpoints, grouped by resource.
- `src/seed/seed.js` — idempotent seed: creates an admin user, a homepage singleton, 7 demo portfolio items, 1 blog post, 1 job post.

## Data model relationships
- `User` ─ standalone (admin/editor role)
- `HomepageSection` ─ singleton, references `PortfolioProject._id[]` for featured grid
- `PortfolioProject` ─ standalone with optional `featured` flag (referenced by HomepageSection)
- `BlogPost` ─ standalone
- `JobPost` ─ standalone
- `ContactSubmission` ─ standalone (read-only outside admin)

## API conventions
- Base URL: `/api`
- Auth header: `Authorization: Bearer <jwt>`
- JSON request/response, `Content-Type: application/json`
- Public reads (`GET /api/portfolio`, `GET /api/blog`, `GET /api/careers`, `GET /api/homepage`); writes require auth.
- Errors: `{ error: "human message" }` with a meaningful HTTP status.

## Security
- helmet defaults
- CORS allowlist from `CORS_ORIGIN` env (comma-separated)
- Global 500-req / 15-min rate limit + tighter 20-req / 10-min on login and 10-req / 60-min on contact form
- Passwords hashed with bcrypt (cost factor 10)
- JWT signed with `JWT_SECRET`, expires per `JWT_EXPIRES` (default 7d)
- Zod validation on the contact form payload before persistence
