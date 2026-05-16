# 08 · Deployment Guide

## Local setup
```bash
pnpm install
cp .env.example .env
cp .env.example apps/api/.env
cp .env.example apps/web/.env
cp .env.example apps/admin/.env

# Start MongoDB locally, then:
pnpm seed     # creates the admin user + demo content
pnpm dev      # runs web (5173), admin (5174), api (4000) in parallel
```

## Environment variables

### `apps/api/.env`
| Var | Purpose |
|---|---|
| `PORT` | API port, default `4000` |
| `MONGODB_URI` | Mongo connection string (local or Atlas) |
| `JWT_SECRET` | **Required.** Long random string |
| `JWT_EXPIRES` | Token TTL (default `7d`) |
| `CORS_ORIGIN` | Comma-separated allowlist, e.g. `https://kalaakaari.in,https://admin.kalaakaari.in` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used only by `pnpm seed` |
| `CLOUDINARY_*` | (Optional) for media uploads |
| `SMTP_*`, `MAIL_FROM`, `MAIL_TO` | (Optional) for contact form notifications |

### `apps/web/.env` & `apps/admin/.env`
| Var | Purpose |
|---|---|
| `VITE_API_URL` / `VITE_ADMIN_API_URL` | Public origin of the API, e.g. `https://api.kalaakaari.in/api` |

## Production deployment

### Web (apps/web) + Admin (apps/admin)
Static Vite builds — deploy to **Vercel**, **Netlify**, or **Cloudflare Pages**.

```bash
pnpm --filter @kalaakaari/web build      # outputs apps/web/dist
pnpm --filter @kalaakaari/admin build    # outputs apps/admin/dist
```

Recommended hosts:
- `kalaakaari.in` → web build
- `admin.kalaakaari.in` → admin build

### API (apps/api)
A regular Node 18 service. Deploy to **Render**, **Railway**, **Fly.io**, or any Docker-friendly host. The API is stateless except for its Mongo connection.

```bash
pnpm --filter @kalaakaari/api start
```

Health check: `GET /api/health`.

### Database
**MongoDB Atlas** free tier is sufficient for launch (M0). Whitelist the API host's egress IP or use Atlas Private Endpoint.

### Cloudinary (media)
Create a free Cloudinary account, drop the `CLOUDINARY_*` env vars into the API. The MVP currently accepts media as URLs in the portfolio CMS — wiring direct upload through a `/api/media` endpoint with `multer` is one route file away.

### Email (contact notifications)
Any SMTP provider (Postmark, Resend, SendGrid). Add a `mailer.js` utility in `apps/api/src/utils/` and call it from `routes/contact.js` after a successful create.

## Domains & DNS
| Domain | CNAME → |
|---|---|
| kalaakaari.in | web host (Vercel etc.) |
| admin.kalaakaari.in | admin host |
| api.kalaakaari.in | API host (Render/Railway/Fly) |

Set `CORS_ORIGIN=https://kalaakaari.in,https://admin.kalaakaari.in` on the API.

## Performance checklist
- Run `pnpm --filter @kalaakaari/web build` and Lighthouse the `dist`
- Confirm `prefers-reduced-motion` disables grain + marquee
- Ensure all images are served from Cloudinary with `f_auto,q_auto`
- Verify Mongo indexes exist on `PortfolioProject.slug`, `User.email`, `BlogPost.slug`
