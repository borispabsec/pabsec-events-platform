#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# PABSEC Events Platform — Production Deployment Script
# Usage: ./scripts/deploy.sh [--no-migrate]
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

SERVER="root@178.104.232.189"
APP_DIR="/var/www/pabsec-events-platform"
PM2_APP="pabsec-app"
BRANCH="main"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

step()  { echo -e "\n${CYAN}▶ $1${NC}"; }
ok()    { echo -e "${GREEN}✓ $1${NC}"; }
warn()  { echo -e "${YELLOW}⚠ $1${NC}"; }
abort() { echo -e "${RED}✗ $1${NC}"; exit 1; }

RUN_MIGRATE=true
for arg in "$@"; do
  [[ "$arg" == "--no-migrate" ]] && RUN_MIGRATE=false
done

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  PABSEC Events Platform — Deploying to production  ${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "  Server : $SERVER"
echo "  Path   : $APP_DIR"
echo "  Branch : $BRANCH"
echo "  Migrate: $RUN_MIGRATE"

# ── Verify SSH connectivity ────────────────────────────────────────────────
step "Verifying SSH connection"
ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$SERVER" "echo ok" > /dev/null \
  || abort "Cannot reach $SERVER — check SSH key and network"
ok "SSH connection OK"

# ── Pull latest code ────────────────────────────────────────────────────────
step "Pulling latest code from $BRANCH"
ssh "$SERVER" "cd $APP_DIR && git pull origin $BRANCH" \
  || abort "git pull failed"
ok "Code updated"

# ── Install dependencies ────────────────────────────────────────────────────
step "Installing dependencies (npm ci)"
ssh "$SERVER" "cd $APP_DIR && npm ci --prefer-offline" \
  || abort "npm ci failed"
ok "Dependencies installed"

# ── Prisma: generate client ─────────────────────────────────────────────────
step "Generating Prisma client"
ssh "$SERVER" "cd $APP_DIR && npx prisma generate" \
  || abort "prisma generate failed"
ok "Prisma client generated"

# ── Prisma: run migrations (optional) ───────────────────────────────────────
if [[ "$RUN_MIGRATE" == true ]]; then
  step "Running database migrations"
  ssh "$SERVER" "cd $APP_DIR && npx prisma migrate deploy" \
    && ok "Migrations applied" \
    || warn "No pending migrations (or prisma migrate deploy not applicable)"
fi

# ── Build ───────────────────────────────────────────────────────────────────
step "Building production bundle"
ssh "$SERVER" "cd $APP_DIR && npm run build" \
  || abort "Build failed — rolling back is manual (git checkout HEAD~1 on server)"
ok "Build complete"

# ── Restart PM2 ─────────────────────────────────────────────────────────────
step "Restarting PM2 process ($PM2_APP)"
ssh "$SERVER" "pm2 restart $PM2_APP --update-env" \
  || abort "PM2 restart failed — check: pm2 logs $PM2_APP"
ok "PM2 restarted"

# ── Health check ────────────────────────────────────────────────────────────
step "Running health check"
sleep 3
HTTP_STATUS=$(ssh "$SERVER" "curl -s -o /dev/null -w '%{http_code}' --max-time 10 https://pabsecevents.org/api/health")
if [[ "$HTTP_STATUS" == "200" ]]; then
  ok "Health check passed (HTTP $HTTP_STATUS)"
else
  warn "Health check returned HTTP $HTTP_STATUS — inspect logs: pm2 logs $PM2_APP"
fi

echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Deployment complete → https://pabsecevents.org    ${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
