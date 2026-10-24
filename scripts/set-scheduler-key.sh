#!/bin/bash
# ─────────────────────────────────────────────────────────────────────
# set-scheduler-key.sh — activate the production agent scheduler
#
# Usage:  ./scripts/set-scheduler-key.sh <VERCEL_TOKEN>
#
# What it does (needs a Vercel API token with project edit scope):
#   1. Reads AGENT_SCHEDULER_KEY from .env (generates one if missing)
#   2. Sets AGENT_SCHEDULER_KEY + CRON_SECRET on the Vercel project
#      (production environment) via the Vercel API
#   3. Triggers a redeploy so the functions pick up the new env
#   4. Verifies the live cron endpoint accepts the key
#
# The token is used only for this API session — never written to disk.
# ─────────────────────────────────────────────────────────────────────
set -euo pipefail
cd "$(dirname "$0")/.."

TOKEN="${1:?Usage: ./scripts/set-scheduler-key.sh <VERCEL_TOKEN>}"
TEAM="${VERCEL_TEAM:-}"
PID="${VERCEL_PROJECT_ID:?Set VERCEL_PROJECT_ID (or export it) in your shell}"
API="https://api.vercel.com/v10/projects/$PID/env"
[ -n "$TEAM" ] && API="$API?teamId=$TEAM" || true

# 1. Key: reuse the local one, or generate a fresh 256-bit key
KEY="$(grep -s '^AGENT_SCHEDULER_KEY=' .env | cut -d= -f2 || true)"
if [ -z "$KEY" ]; then
  KEY="$(openssl rand -hex 32)"
  printf '\nAGENT_SCHEDULER_KEY=%s\n' "$KEY" >> .env
  echo "Generated a new key and saved it to .env"
fi
echo "Using key from .env (${#KEY} chars)"

# 2. Set both env vars on the Vercel project (production)
set_env() {
  local key="$1" value="$2"
  local qs=""
  [ -n "$TEAM" ] && qs="?teamId=$TEAM" || true
  # delete existing (ignore error if absent), then create
  curl -s -X DELETE \
    "https://api.vercel.com/v9/projects/$PID/env/$key$qs" \
    -H "Authorization: Bearer $TOKEN" > /dev/null || true
  curl -s -X POST "https://api.vercel.com/v10/projects/$PID/env$qs" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"key\":\"$key\",\"value\":\"$value\",\"type\":\"encrypted\",\"target\":[\"production\"]}" \
    | python3 -c "import json,sys;d=json.load(sys.stdin);print('  set', d.get('key') or d)"
}

echo "Setting env vars on Vercel project $PID ..."
set_env "AGENT_SCHEDULER_KEY" "$KEY"
set_env "CRON_SECRET" "$KEY"

# 3. Redeploy so serverless functions see the new env vars
echo "Triggering redeploy ..."
DEPLOY_ID="$(curl -s -X POST "https://api.vercel.com/v13/deployments$([ -n "$TEAM" ] && echo "?teamId=$TEAM")" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"name\":\"$(basename "$PWD")\",\"target\":\"production\"}" \
  | python3 -c "import json,sys;print(json.load(sys.stdin).get('id',''))")"
echo "  deployment: $DEPLOY_ID (watch it in the Vercel dashboard)"

# 4. Verify (waits for the deployment to settle, then tests the endpoint)
echo "Verifying live endpoint (may take ~2 min) ..."
sleep 90
CODE="$(curl -s -o /tmp/sched-check.json -w '%{http_code}' \
  -H "Authorization: Bearer $KEY" https://jadugarrajtilak.com/api/agents/cron || true)"
echo "  HTTP $CODE"
cat /tmp/sched-check.json 2>/dev/null || true; echo
if [ "$CODE" = "200" ]; then
  echo "✓ Production scheduler ACTIVE — cron 10:30 & 11:30 IST daily."
else
  echo "✗ Not 200 yet — if the deploy is still building, retry the curl in a minute:"
  echo "  curl -H \"Authorization: Bearer \$KEY\" https://jadugarrajtilak.com/api/agents/cron"
fi
rm -f /tmp/sched-check.json
