#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════════════
#  deploy.sh — incremental redeploy on the VPS
#
#  Run as the deploy user, from inside the repo root on the server:
#    bash scripts/deploy/deploy.sh
#
#  What it does:
#   1. git pull (fast-forward only — fails if there are local changes)
#   2. pnpm install with frozen lockfile
#   3. rebuild apps/web and apps/admin
#   4. reload PM2 (zero-downtime restart of the API)
#   5. reload nginx (only if config files have changed)
#
#  Skip steps with flags:
#    --no-pull, --no-install, --no-build, --no-pm2, --no-nginx
# ════════════════════════════════════════════════════════════════════════
set -euo pipefail

DO_PULL=1; DO_INSTALL=1; DO_BUILD=1; DO_PM2=1; DO_NGINX=1
for a in "$@"; do
  case "$a" in
    --no-pull)    DO_PULL=0 ;;
    --no-install) DO_INSTALL=0 ;;
    --no-build)   DO_BUILD=0 ;;
    --no-pm2)     DO_PM2=0 ;;
    --no-nginx)   DO_NGINX=0 ;;
    --help|-h) sed -n '2,18p' "$0"; exit 0 ;;
    *) echo "Unknown flag: $a" >&2; exit 2 ;;
  esac
done

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

if [ "$DO_PULL" -eq 1 ]; then
  echo "▶ git pull (ff-only)"
  git fetch --prune
  git pull --ff-only
fi

if [ "$DO_INSTALL" -eq 1 ]; then
  echo "▶ pnpm install (frozen lockfile)"
  pnpm install --frozen-lockfile --prod=false
fi

if [ "$DO_BUILD" -eq 1 ]; then
  echo "▶ build apps/web"
  pnpm --filter @kalaakaari/web build
  echo "▶ build apps/admin"
  pnpm --filter @kalaakaari/admin build
fi

if [ "$DO_PM2" -eq 1 ]; then
  echo "▶ pm2 reload kalaakaari-api"
  if pm2 list | grep -q kalaakaari-api; then
    pm2 reload kalaakaari-api --update-env
  else
    pm2 start scripts/deploy/ecosystem.config.cjs
    pm2 save
  fi
  pm2 status
fi

if [ "$DO_NGINX" -eq 1 ]; then
  echo "▶ test + reload nginx"
  sudo nginx -t
  sudo systemctl reload nginx
fi

echo
echo "✓ Deploy complete."
echo "  Web:   https://$(hostname -d 2>/dev/null || echo your-domain.tld)"
echo "  Admin: https://admin.$(hostname -d 2>/dev/null || echo your-domain.tld)"
echo "  API:   https://api.$(hostname -d 2>/dev/null || echo your-domain.tld)/api/health"
