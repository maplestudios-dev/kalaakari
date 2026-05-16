# KALAAKAARI · कलाकारी

> Independent creative studio. New Delhi-born. Craft-first.
> *We build brands that are remembered, not just seen.*

A full-stack monorepo for the KALAAKAARI website and admin CMS.

```
apps/
  web/    →  Public website (React + Vite + Tailwind + Framer Motion + react-bits)
  admin/  →  Admin dashboard (React + Vite, JWT auth, portfolio CMS)
  api/    →  Node + Express + MongoDB (Mongoose), JWT auth, REST API
docs/      →  Notion-ready documentation
```

## Quickstart

```bash
# 1. Install
pnpm install

# 2. Copy env file and edit secrets
cp .env.example .env
cp .env.example apps/api/.env
cp .env.example apps/web/.env
cp .env.example apps/admin/.env

# 3. Make sure MongoDB is running locally (or set MONGODB_URI to Atlas)
brew services start mongodb-community  # macOS

# 4. Seed the database (creates admin user + sample portfolio)
pnpm seed

# 5. Run everything
pnpm dev
```

After `pnpm dev`:

| App      | URL                       | Notes                                |
|----------|---------------------------|--------------------------------------|
| Web      | http://localhost:5173     | Public site                          |
| Admin    | http://localhost:5174     | Login w/ seed admin creds            |
| API      | http://localhost:4000/api | REST + health at `/api/health`       |

## Instant preview (no install needed)

Open **`kalaakaari-preview.html`** at the repo root in any modern browser. It's a single-file render of the homepage so you can see the design direction before installing anything.

## Tech

- **Frontend** React 18 · Vite · Tailwind · Framer Motion · react-bits · React Router · React Hook Form
- **Backend** Express · Mongoose · JWT · bcrypt · helmet · CORS · express-rate-limit · multer
- **Tooling** pnpm workspaces · Turborepo

## Docs

See `/docs` for product vision, brand strategy, design system, React Bits integration map, API reference, CMS guide, and deployment notes.

---

© MMXXVI · Kalaakaari Studio · Made in Delhi.
