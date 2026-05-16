# 10 · RBAC + Audit Log

## Roles

| Role | Intent | Key permissions denied |
|---|---|---|
| **Owner** | The studio principal. Implicitly has every permission. Cannot be suspended or deleted by anyone. | — |
| **Admin** | Manages content, leads, copy, SEO, users (except hard-deleting them). | `users.delete` |
| **Editor** | Owns content end-to-end — write *and* publish across portfolio, blog, careers, video, copy, SEO. | All `users.*` writes |
| **Author** | Drafts only. Can create + edit portfolio and blog, but cannot publish. | `*.publish`, `*.delete`, `users.*`, `leads.*`, `seo.write`, `copy.write` |
| **Viewer** | Read-only access. Useful for clients, observers, or auditors. | All writes |

Permissions are dot-namespaced strings (`portfolio.write`, `users.invite`, etc.). The full list lives in `apps/api/src/lib/permissions.js`. Roles map to permission sets in `ROLE_PERMISSIONS`. Per-user grants can be added on top via the `User.permissions[]` field.

## Lifecycle

1. **Invite** — an `Admin`/`Owner` calls `POST /api/users/invite` with `{ name, email, role }`. The API creates a `status: 'pending'` user with a 7-day `inviteToken`. The admin UI surfaces the `acceptUrl` to share.
2. **Accept** — the invitee opens `/accept-invite?token=…`, sets a password (≥8 chars). User flips to `status: 'active'`.
3. **Login** — `/auth/login` requires `status === 'active'`. Suspended users get 403 with `Account suspended`. Pending users get 403 with `Account pending — accept your invite first`.
4. **Suspend** — toggle via `POST /api/users/:id/suspend`. Owner cannot be suspended.
5. **Role change** — `PATCH /api/users/:id { role, permissions }`. Only an Owner can modify another Owner.
6. **Reset password** — `POST /api/users/:id/reset-password` issues a new accept-invite token (24h TTL) and clears the password hash. The user is back in `pending` until they accept.
7. **Delete** — `DELETE /api/users/:id`. Owners cannot be deleted. Restricted to `users.delete` permission (Owner only by default).

## Audit log

Every meaningful state change is recorded by `apps/api/src/lib/audit.js`:

```
{ actor, actorName, action, resource, resourceId, summary, diff: { before, after }, ip, ua, createdAt }
```

Captured actions include `create`, `update`, `delete`, `publish`, `login`, `invite`, `invite-accept`, `role-change`, `suspend`, `unsuspend`, `reset-password`, `restore`, `export`.

The audit log is itself read-only — there is no API to mutate or delete entries. Visible at `/audit` in the admin to anyone with `audit.read`.

## Frontend wiring

- Admin login stores `{ token, me, rolePermissions }` in `localStorage` via `meStore`.
- `can(perm)` is a sync helper used by `Shell` to hide sidebar items and by individual pages to gate actions.
- The server is always the source of truth — the client checks are UX only. Every write is re-verified with `requirePermission(perm)` on the API.
