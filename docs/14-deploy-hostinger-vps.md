# 14 · Deploy to Hostinger VPS

End-to-end guide to ship KALAAKAARI to a Hostinger VPS (Ubuntu 22.04 LTS).
Same plan works on DigitalOcean, Linode, Hetzner, Vultr, OVH — the only Hostinger-specific bit is the panel.

## Architecture (single VPS, three subdomains)

```
                ┌─────────────────────────────────────────────────────┐
                │                  Hostinger VPS                      │
                │                                                     │
   Internet ────┤  nginx (80/443, Let's Encrypt SSL)                  │
                │     ├── kalaakaari.in        →  apps/web/dist        │
                │     ├── admin.kalaakaari.in  →  apps/admin/dist      │
                │     └── api.kalaakaari.in    →  reverse-proxy 4000   │
                │                                       │              │
                │                                       ▼              │
                │                              PM2 ─ Node API (:4000)  │
                │                                       │              │
                │                                       ▼              │
                │                              MongoDB (Atlas or local)│
                └─────────────────────────────────────────────────────┘
```

**Recommendations** (you can swap any later):
- **Domain pattern**: subdomains (`kalaakaari.in`, `admin.kalaakaari.in`, `api.kalaakaari.in`). Cleaner than path-based routing.
- **Database**: **MongoDB Atlas free tier** (M0, 512 MB, free forever, with backups + monitoring). Saves RAM on the VPS and is more reliable. Local Mongo on the VPS works too — covered as an alternative.
- **Process manager**: PM2 for the Node API.
- **SSL**: Let's Encrypt via certbot — free, auto-renews.

## Prerequisites

| Need | Where |
|---|---|
| A Hostinger VPS (KVM 1 or higher, 1 GB RAM minimum, 2 GB recommended) | hpanel.hostinger.com |
| Root SSH credentials | Hostinger emails them after provisioning, or you can reset from hPanel |
| A domain you control | Hostinger or any registrar (Namecheap, GoDaddy, Porkbun…) |
| MongoDB Atlas account (free) | https://www.mongodb.com/cloud/atlas/register (optional but recommended) |
| Your GitHub repo accessible from the VPS | Public repo: just clone. Private: deploy key or HTTPS token. |

---

## Step 1 — DNS records

In your domain registrar (Hostinger panel or wherever), add **three A records** pointing at your VPS public IPv4:

| Type | Name | Value | TTL |
|---|---|---|---|
| A | `@`    | `203.0.113.42` (your VPS IP) | 300 |
| A | `www`  | `203.0.113.42` | 300 |
| A | `admin`| `203.0.113.42` | 300 |
| A | `api`  | `203.0.113.42` | 300 |

DNS propagation usually takes 5–30 minutes. Verify with:
```bash
dig kalaakaari.in       +short
dig admin.kalaakaari.in +short
dig api.kalaakaari.in   +short
# all three should return your VPS IP
```

---

## Step 2 — Initial VPS setup (as root)

```bash
# SSH in as root
ssh root@203.0.113.42

# Set the hostname (optional but tidy)
hostnamectl set-hostname kalaakaari-prod

# Update + upgrade
apt update && apt upgrade -y
```

### 2a. Create a non-root deploy user

```bash
adduser deploy                                # set a strong password
usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh
cp /root/.ssh/authorized_keys /home/deploy/.ssh/   # reuse your existing SSH key
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

Reconnect as `deploy`:
```bash
exit
ssh deploy@203.0.113.42
sudo whoami   # should print 'root' after you enter your password
```

### 2b. Run the bootstrap script

Either copy the script up, or paste its contents:

```bash
# from your laptop
scp scripts/deploy/server-bootstrap.sh deploy@203.0.113.42:~

# on the VPS
sudo bash server-bootstrap.sh             # without local Mongo (Atlas recommended)
# OR
sudo INSTALL_MONGO=1 bash server-bootstrap.sh   # install Mongo locally
```

What it installs: Node 20 LTS, pnpm, PM2, nginx, certbot, ufw firewall (allows SSH + 80 + 443), unattended security updates, and optionally MongoDB 7.0.

---

## Step 3 — Get the code on the server

```bash
sudo mkdir -p /var/www
sudo chown deploy:deploy /var/www
cd /var/www
git clone https://github.com/maplestudios-dev/kalaakari.git kalaakaari
cd kalaakaari

pnpm install --frozen-lockfile
```

If your repo is private, either set up a deploy key (`ssh-keygen -t ed25519 -C "deploy@kalaakaari-prod"` + add the `.pub` as a deploy key in GitHub repo settings) or clone with a Personal Access Token over HTTPS.

---

## Step 4 — Production env files

This is the heart of the deployment. Copy the templates and edit:

```bash
cp .env.example apps/api/.env
cp .env.example apps/web/.env
cp .env.example apps/admin/.env
```

### `apps/api/.env` — production values

```bash
nano apps/api/.env
```

```ini
# ── Server ──
PORT=4000
NODE_ENV=production

# ── Database ──
# Option A — MongoDB Atlas (RECOMMENDED)
MONGODB_URI=mongodb+srv://kalaa_app:STRONG_PW@cluster0.abcd.mongodb.net/kalaakaari?retryWrites=true&w=majority
# Option B — local Mongo (only if you ran INSTALL_MONGO=1)
# MONGODB_URI=mongodb://127.0.0.1:27017/kalaakaari

# ── Auth ──
JWT_SECRET=PASTE_64_CHARS_OF_RANDOM_HEX_HERE
JWT_EXPIRES=7d

# ── CORS — your real prod domains, comma-separated ──
CORS_ORIGIN=https://kalaakaari.in,https://www.kalaakaari.in,https://admin.kalaakaari.in

# ── Seed admin (used ONCE by `pnpm seed`) ──
ADMIN_EMAIL=owner@kalaakaari.in
ADMIN_PASSWORD=USE_A_LONG_ONE_THEN_CHANGE_IT

# ── Lead notifications (optional) ──
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T.../B.../...
NOTIFY_EMAIL_TO=hello@kalaakaari.in
MAIL_FROM=KALAAKAARI <hello@kalaakaari.in>
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_xxxxxxxxxxxx

# ── Cloudinary (optional — for future media upload endpoint) ──
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Generate a strong `JWT_SECRET`:
```bash
openssl rand -hex 48
```

### `apps/web/.env`

```ini
VITE_API_URL=https://api.kalaakaari.in/api
```

### `apps/admin/.env`

```ini
VITE_ADMIN_API_URL=https://api.kalaakaari.in/api
```

> Vite reads `VITE_*` at **build time**, so changing these requires a rebuild + redeploy. They are baked into the static bundle — do not put secrets here.

### File permissions (lock the env files down)

```bash
chmod 600 apps/api/.env apps/web/.env apps/admin/.env
```

---

## Step 5 — Build the frontends

```bash
cd /var/www/kalaakaari
pnpm --filter @kalaakaari/web build       # output: apps/web/dist
pnpm --filter @kalaakaari/admin build     # output: apps/admin/dist
```

These are static asset bundles nginx will serve directly.

---

## Step 6 — nginx site configs

Templates live at `scripts/deploy/nginx-*.conf.template`. Render them with your real values:

```bash
cd /var/www/kalaakaari
DOMAIN=kalaakaari.in
WEB_DIST=/var/www/kalaakaari/apps/web/dist
ADMIN_DIST=/var/www/kalaakaari/apps/admin/dist
API_PORT=4000

for tpl in scripts/deploy/nginx-*.conf.template; do
  name=$(basename "$tpl" .conf.template)
  sudo tee "/etc/nginx/sites-available/${name}.conf" >/dev/null < <(
    sed -e "s|__DOMAIN__|${DOMAIN}|g" \
        -e "s|__WEB_DIST__|${WEB_DIST}|g" \
        -e "s|__ADMIN_DIST__|${ADMIN_DIST}|g" \
        -e "s|__API_PORT__|${API_PORT}|g" \
        "$tpl"
  )
  sudo ln -sf "/etc/nginx/sites-available/${name}.conf" "/etc/nginx/sites-enabled/${name}.conf"
done

sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t            # config syntax check
sudo systemctl reload nginx
```

You should now be able to reach `http://kalaakaari.in` (HTTP only, no SSL yet).

---

## Step 7 — HTTPS with Let's Encrypt

```bash
sudo certbot --nginx -d kalaakaari.in -d www.kalaakaari.in -d admin.kalaakaari.in -d api.kalaakaari.in \
  --redirect --agree-tos -m hello@kalaakaari.in --non-interactive
```

This:
- Issues four certificates (one per subdomain)
- Edits each nginx server block to redirect HTTP → HTTPS
- Installs a cron / systemd timer that auto-renews 30 days before expiry

Test renewal:
```bash
sudo certbot renew --dry-run
```

---

## Step 8 — Start the API with PM2

```bash
cd /var/www/kalaakaari
pm2 start scripts/deploy/ecosystem.config.cjs
pm2 save                             # persist process list
pm2 startup systemd                  # prints a command — copy-paste and run it as instructed
# (the command will look like:
#  sudo env PATH=... pm2 startup systemd -u deploy --hp /home/deploy)
```

Check it's running:
```bash
pm2 status                           # shows kalaakaari-api as online
pm2 logs kalaakaari-api --lines 50   # tail the log
curl https://api.kalaakaari.in/api/health
# → { "ok": true, "name": "kalaakaari-api", "t": ... }
```

---

## Step 9 — Seed the database (one time)

```bash
cd /var/www/kalaakaari
pnpm --filter @kalaakaari/api seed
```

Expected output:
```
✓ connected to mongodb+srv://...
✓ owner user ready → owner@kalaakaari.in / <your password>
✓ site copy refreshed to latest defaults
✓ seeded 7 portfolio items
✓ seeded 4 journal posts
✓ seeded 3 videos
✓ seed complete
```

Open `https://admin.kalaakaari.in`, sign in, and **immediately change the Owner password** (delete the current Owner user from admin → Team, then re-invite yourself, or just reset password).

---

## Step 10 — Verify

| Check | Expected |
|---|---|
| `https://kalaakaari.in` | Public homepage renders, cards click into case studies |
| `https://admin.kalaakaari.in` | Admin login form |
| `https://api.kalaakaari.in/api/health` | `{ "ok": true, ... }` |
| `https://api.kalaakaari.in/sitemap.xml` | XML sitemap with your published content |
| Admin login | Reaches dashboard, all 11 sidebar modules visible to Owner |
| Contact form on public site | Submits without error, lead appears in admin `/submissions` |

---

## Subsequent deploys (after the first one)

Once everything's set up, future deploys are one command:

```bash
ssh deploy@your-vps
cd /var/www/kalaakaari
bash scripts/deploy/deploy.sh
```

The deploy script does: `git pull` → `pnpm install --frozen-lockfile` → rebuild web + admin → `pm2 reload` API → `nginx -t && nginx reload`. Use `--no-build` if you only changed the API, `--no-pm2` if only the frontends, etc.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `502 Bad Gateway` on api subdomain | API isn't running. `pm2 status`; `pm2 logs kalaakaari-api`; check `apps/api/.env`. |
| Admin shows "Network Error" on login | `VITE_ADMIN_API_URL` wrong, or `CORS_ORIGIN` doesn't include the admin's origin. Fix env + rebuild admin. |
| Certbot fails | DNS not yet pointing at the VPS, or port 80 blocked. Confirm `dig`, confirm `ufw status` allows 'Nginx Full'. |
| `MongoServerError: bad auth` | Atlas password has special characters not URL-encoded. Use `encodeURIComponent` in your head or paste a URL-safe password. |
| Site loads but CSS is broken | `pnpm build` not yet run, or nginx is serving an old `dist`. Re-run the build and reload nginx. |
| White screen on `/work/some-slug` | nginx not doing SPA fallback — confirm `try_files $uri $uri/ /index.html;` is in the web site config. |
| Mongo Atlas IP allow-list | Add the VPS IP under Atlas → Network Access. For dev expedience you can allow `0.0.0.0/0` with strong DB password, but pin it down later. |

---

## Hardening checklist (do later, not blocking launch)

- [ ] Disable root SSH login: `sudo sed -i 's/^#\?PermitRootLogin .*/PermitRootLogin no/' /etc/ssh/sshd_config && sudo systemctl reload sshd`
- [ ] Disable password SSH (keys only): same file, `PasswordAuthentication no`
- [ ] Install `fail2ban`: `sudo apt install fail2ban -y`
- [ ] Set up a Mongo Atlas alert for ops if RAM/CPU spike
- [ ] Configure log rotation for PM2 (`pm2 install pm2-logrotate`)
- [ ] Add a daily Mongo backup (`mongodump` to S3-compatible storage or Hostinger's snapshot)
- [ ] Rotate `JWT_SECRET` every 90 days (invalidates all existing tokens — users re-login)
- [ ] Add 2FA on the admin (next feature build)
- [ ] Pin Mongo Atlas IP allow-list to just the VPS IP

---

## What changed vs. local dev

| Var | Local dev | Production |
|---|---|---|
| `MONGODB_URI` | `mongodb://localhost:27017/kalaakaari` | Atlas SRV or `mongodb://127.0.0.1:27017/kalaakaari` if local Mongo |
| `JWT_SECRET` | dev value | fresh `openssl rand -hex 48` |
| `CORS_ORIGIN` | `http://localhost:5173,http://localhost:5174` | `https://kalaakaari.in,https://www.kalaakaari.in,https://admin.kalaakaari.in` |
| `NODE_ENV` | (unset) | `production` |
| `VITE_API_URL` | `http://localhost:4000/api` | `https://api.kalaakaari.in/api` |
| `VITE_ADMIN_API_URL` | `http://localhost:4000/api` | `https://api.kalaakaari.in/api` |
| `ADMIN_PASSWORD` | the easy seed default | a strong password — change again right after first login |
| `SLACK_WEBHOOK_URL` / `SMTP_*` | usually blank | real webhook + SMTP creds for prod ops |
