#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════════════
#  server-bootstrap.sh — one-time setup on a fresh Ubuntu 22.04 VPS
#
#  Installs Node 20 + pnpm + nginx + certbot + pm2 + ufw + (optional) MongoDB.
#  Hardens SSH-less bits (firewall, automatic security updates).
#
#  Run as root on the VPS:
#    bash server-bootstrap.sh                 # without local Mongo
#    INSTALL_MONGO=1 bash server-bootstrap.sh # also install MongoDB locally
# ════════════════════════════════════════════════════════════════════════
set -euo pipefail

INSTALL_MONGO="${INSTALL_MONGO:-0}"

echo "▶ apt update + upgrade"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y

echo "▶ base tools"
apt-get install -y curl ca-certificates gnupg lsb-release ufw unattended-upgrades git build-essential

echo "▶ Node 20 LTS via NodeSource"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

echo "▶ pnpm + pm2 (global)"
npm install -g pnpm pm2

echo "▶ nginx + certbot"
apt-get install -y nginx
apt-get install -y certbot python3-certbot-nginx
systemctl enable --now nginx

echo "▶ UFW firewall (allow OpenSSH + HTTP + HTTPS)"
ufw allow OpenSSH
ufw allow 'Nginx Full'
yes | ufw enable || true

echo "▶ unattended-upgrades for security patches"
dpkg-reconfigure -f noninteractive unattended-upgrades || true

if [ "$INSTALL_MONGO" = "1" ]; then
  echo "▶ MongoDB 7.0 (local install)"
  curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" \
    > /etc/apt/sources.list.d/mongodb-org-7.0.list
  apt-get update -y
  apt-get install -y mongodb-org
  systemctl enable --now mongod
  echo "  Mongo is running and bound to 127.0.0.1:27017 by default — only the API on this box can reach it."
else
  echo "▶ Skipping local Mongo install (use MongoDB Atlas — recommended)"
fi

echo
echo "✓ Server bootstrapped."
echo "  Versions:"
node --version
pnpm --version
pm2 --version
nginx -v 2>&1
[ "$INSTALL_MONGO" = "1" ] && mongod --version | head -1

echo
echo "Next: create a non-root deploy user, clone the repo, set up env files,"
echo "build frontends, configure nginx, run certbot, start PM2."
echo "See docs/14-deploy-hostinger-vps.md"
