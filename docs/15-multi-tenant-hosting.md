# 15 · Multi-Tenant Hosting (your own VPS, several client sites)

This monorepo is one of several projects you'll host on the same VPS. The kalaakaari domain points at the VPS, but the IP itself should answer with **your own studio's brand**, not whichever client happens to come up first alphabetically.

## Mental model

```
                    Maple Studios VPS · 147.79.68.35
                                │
            ┌───────────────────┴───────────────────┐
            │              nginx (80/443)            │
            │                                        │
            ├─ default_server   →  Maple Studios     │  ← bare IP / unknown host
            ├─ kalaakaari.in    →  client A — web    │
            ├─ admin.kalaakaari.in → client A — admin│
            ├─ api.kalaakaari.in   → client A — api  │
            ├─ otherclient.com  →  client B          │
            └─ maplestudios.dev →  your studio site  │  (when ready)
```

- An IP can host unlimited domains. nginx routes by the `Host` header.
- TLS works the same way via SNI — each domain has its own Let's Encrypt cert.
- The **only** thing that "labels" the IP itself is reverse DNS (rDNS) — set this once via Hostinger support.

## Directory layout on the VPS

```
/var/www/
  ├── _company/dist/         ← Maple Studios placeholder (or eventual real site)
  ├── kalaakaari/            ← cloned monorepo
  │     ├── apps/web/dist
  │     ├── apps/admin/dist
  │     └── apps/api          ← Node process under PM2
  ├── otherclient/           ← future client
  └── ...
```

Each client gets its own folder. The API ports are per-client (kalaakaari uses 4000, next one uses 4001, etc.) — no conflicts.

## Setup steps for the catch-all

### 1. Create the company placeholder directory

```bash
sudo mkdir -p /var/www/_company/dist
sudo chown -R deploy:deploy /var/www/_company
```

### 2. Copy the placeholder HTML

From your laptop:
```bash
scp scripts/deploy/maple-studios-placeholder.html \
    deploy@147.79.68.35:/var/www/_company/dist/index.html
```

(Edit the file first if you want different copy / brand name.)

### 3. Install the default nginx config

On the VPS:
```bash
cd /var/www/kalaakaari   # or wherever the templates live

COMPANY_ROOT=/var/www/_company/dist

sudo tee /etc/nginx/sites-available/00-default.conf >/dev/null < <(
  sed -e "s|__COMPANY_ROOT__|${COMPANY_ROOT}|g" \
      scripts/deploy/nginx-default.conf.template
)

# disable any stock default Hostinger / nginx may have shipped
sudo rm -f /etc/nginx/sites-enabled/default

# enable our default
sudo ln -sf /etc/nginx/sites-available/00-default.conf \
            /etc/nginx/sites-enabled/00-default.conf

# the snakeoil cert (used for TLS requests with unknown SNI) is preinstalled
# on Ubuntu via ssl-cert. If missing:
sudo apt install -y ssl-cert
sudo make-ssl-cert generate-default-snakeoil --force-overwrite

sudo nginx -t
sudo systemctl reload nginx
```

### 4. Verify

```bash
# Bare IP — should show the Maple Studios placeholder
curl -I http://147.79.68.35

# Unknown domain — same
curl -I -H 'Host: random.example.com' http://147.79.68.35

# Real client domain — should hit the kalaakaari site
curl -I https://kalaakaari.in
```

Or just paste `147.79.68.35` into a browser — you'll see the Maple Studios page.

## Adding a new client later

1. Clone their repo to `/var/www/<client>/`
2. Pick an unused API port (4001, 4002, ...)
3. Render their nginx configs from templates (the kalaakaari templates are a starting point)
4. `certbot --nginx -d theirdomain.com -d www.theirdomain.com ...`
5. Start their API under PM2 with a unique `name`
6. Add a stanza to your own deploy script if you want one-command deploys per client

## Reverse DNS (PTR) — labelling the IP as yours

By default Hostinger sets the rDNS to something like `srvXXX.hosti-server.com`. Any tool that does a reverse lookup on the IP will return that — which is fine but isn't your brand.

To change it to e.g. `srv.maplestudios.dev`:

1. Make sure `srv.maplestudios.dev` (or whatever you want as the rDNS) **resolves to** `147.79.68.35` with an A record first.
2. Open a ticket with Hostinger support: *"Please set the PTR record for 147.79.68.35 to `srv.maplestudios.dev`."*
3. They flip it usually within a few hours.
4. Verify with `dig -x 147.79.68.35 +short` — should return `srv.maplestudios.dev.`

This is purely cosmetic for server logs / mail headers / network tools — visitors never see it — but it stops leaking that you're on shared Hostinger infra.

## What this changes about the kalaakaari deployment

Almost nothing. The kalaakaari nginx configs (`nginx-web.conf.template`, `nginx-admin.conf.template`, `nginx-api.conf.template`) don't use `default_server`, so they're already correct. They only respond when the request specifically asks for `kalaakaari.in` / `admin.kalaakaari.in` / `api.kalaakaari.in`.

The only adjustment is making sure:
- The new `00-default.conf` is installed and enabled **before** you run certbot for kalaakaari (so the default sits at the front)
- Hostinger's stock `default` site is removed from `/etc/nginx/sites-enabled/`

That's it. The IP now identifies as Maple Studios; kalaakaari is just one of several names answering on the same machine.

## When your real company site is ready

Just replace `/var/www/_company/dist/` with your actual built React/Vite output (or whatever stack), and reload nginx. No DNS or cert changes needed — the default_server already owns the apex of the IP.

If you also want `maplestudios.dev` to serve the same content (recommended), add a normal site config for it pointing to the same root, point your `maplestudios.dev` DNS at this IP, and run certbot for it. The default_server stays as the safety net.
