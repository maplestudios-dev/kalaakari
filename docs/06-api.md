# 06 · API Reference

Base URL: `http://localhost:4000/api`

## Auth

### `POST /auth/login`
```json
{ "email": "admin@kalaakaari.in", "password": "ChangeMe123!" }
```
Returns:
```json
{ "token": "eyJhbG…", "user": { "id": "…", "name": "Studio Admin", "email": "…", "role": "admin" } }
```
Rate-limited: 20 / 10 min.

### `GET /auth/me` (authed)
Returns the current user record (sans `passwordHash`).

---

## Portfolio

### `GET /portfolio` *(public)*
Query: `?category=Branding&featured=true`
Returns `{ items: PortfolioProject[] }`. Only `published: true` projects are returned.

### `GET /portfolio/:slug` *(public)*
Returns `{ item: PortfolioProject }`.

### `POST /portfolio` *(authed)*
Create a project. Body matches the Mongoose schema in `models/Portfolio.js`.

### `PUT /portfolio/:id` *(authed)*
Partial update of any field on a project.

### `DELETE /portfolio/:id` *(authed)*
Hard delete.

---

## Contact

### `POST /contact` *(public, rate-limited 10 / hr)*
Body (validated by Zod):
```json
{ "name": "…", "brand": "…", "email": "…", "phone": "", "service": "…", "budget": "…", "timeline": "…", "message": "…" }
```
Returns `{ ok: true, id }`.

### `GET /contact` *(authed)*
Returns `{ items: ContactSubmission[] }`. Optional `?service=…&read=true|false`.

### `PATCH /contact/:id` *(authed)*
Body: `{ read: true | false }` (or any patchable field).

### `DELETE /contact/:id` *(authed)*

### `GET /contact/export.csv` *(authed)*
Streams a CSV download of every submission.

---

## Blog

`GET /blog`, `GET /blog/:slug`, `POST /blog`, `PUT /blog/:id`, `DELETE /blog/:id` — same shape as portfolio. Authed for writes.

---

## Careers

`GET /careers`, `POST /careers`, `PUT /careers/:id`, `DELETE /careers/:id`.

---

## Homepage

### `GET /homepage` *(public)*
Returns the singleton `{ homepage: HomepageSection }`.

### `PUT /homepage` *(authed)*
Upserts the singleton with the provided body.

---

## Health
`GET /api/health` → `{ ok: true, name: 'kalaakaari-api', t: <epoch ms> }`
