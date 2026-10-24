#!/bin/bash
# ─────────────────────────────────────────────────────────────────────
# set-scheduler-key.sh — activate the production agent scheduler
#
# Usage:  VERCEL_TOKEN=vcp_xxx ./scripts/set-scheduler-key.sh
#   (token also accepted as $1 — never written to disk)
#
# What it does:
#   1. Verifies the Vercel API token
#   2. Reads AGENT_SCHEDULER_KEY from .env (generates if missing)
#   3. Replaces AGENT_SCHEDULER_KEY + CRON_SECRET on the Vercel project
#      (any existing values are deleted first, by ID)
#   4. Lists final state + registered cron jobs
#
# Redeploy + live verification are handled separately (git push),
# because env vars only take effect on NEW deployments.
# ─────────────────────────────────────────────────────────────────────
set -euo pipefail
cd "$(dirname "$0")/.."

TOKEN="${1:-${VERCEL_TOKEN:-}}"
[ -n "$TOKEN" ] || { echo "Usage: VERCEL_TOKEN=<token> $0"; exit 1; }
TEAM="${VERCEL_TEAM:-team_ndEM5sNbP7WtAIkKmtduOcAQ}"
PID="${VERCEL_PROJECT_ID:-prj_vbsWZXXVtYAnXlClNlwwWcBb0NRi}"
AUTH="Authorization: Bearer $TOKEN"
Q="teamId=$TEAM"

echo "→ 1/4 Verifying token ..."
WHO=$(curl -s -H "$AUTH" https://api.vercel.com/v2/user | python3 -c "import json,sys;print(json.load(sys.stdin).get('user',{}).get('username',''))" 2>/dev/null || true)
[ -n "$WHO" ] || { echo "  ✗ token invalid"; exit 1; }
echo "  ✓ token OK (user: $WHO)"

echo "→ 2/4 Reading key from .env ..."
KEY="$(grep -s '^AGENT_SCHEDULER_KEY=' .env | cut -d= -f2 || true)"
if [ -z "$KEY" ]; then
  KEY="$(openssl rand -hex 32)"
  printf '\nAGENT_SCHEDULER_KEY=%s\n' "$KEY" >> .env
  echo "  generated a new key (${#KEY} chars) and saved to .env"
else
  echo "  ✓ using existing key (${#KEY} chars)"
fi

echo "→ 3/4 Setting AGENT_SCHEDULER_KEY + CRON_SECRET on project ..."
for NAME in AGENT_SCHEDULER_KEY CRON_SECRET; do
  # delete every existing occurrence (by ID, any target env)
  IDS=$(curl -s -H "$AUTH" "https://api.vercel.com/v9/projects/$PID/env?$Q" \
    | python3 -c "
import json,sys
d=json.load(sys.stdin)
for e in d.get('envs',[]):
    if e['key']=='$NAME': print(e['id'])" 2>/dev/null || true)
  for ID in $IDS; do
    curl -s -X DELETE -H "$AUTH" "https://api.vercel.com/v9/projects/$PID/env/$ID?$Q" >/dev/null \
      && echo "  deleted old $NAME ($ID)" || true
  done
  # create fresh (production target — cron only fires in production)
  RES=$(curl -s -X POST "https://api.vercel.com/v10/projects/$PID/env?$Q" \
    -H "$AUTH" -H "Content-Type: application/json" \
    -d "{\"key\":\"$NAME\",\"value\":\"$KEY\",\"type\":\"encrypted\",\"target\":[\"production\"]}")
  OK=$(echo "$RES" | python3 -c "import json,sys;print(json.load(sys.stdin).get('key','ERROR'))" 2>/dev/null || echo ERROR)
  echo "  set $NAME → $OK"
done

echo "→ 4/4 Final state ..."
curl -s -H "$AUTH" "https://api.vercel.com/v9/projects/$PID/env?$Q" | python3 -c "
import json,sys
for e in json.load(sys.stdin).get('envs',[]):
    print(f\"  {e['key']:28s} target={','.join(e.get('target',[]))}\")"
echo "  registered cron jobs:"
curl -s -H "$AUTH" "https://api.vercel.com/v1/projects/$PID/crons?$Q" | python3 -c "
import json,sys
d=json.load(sys.stdin)
crons=d.get('crons',[])
if not crons: print('    (none registered yet — will register on next deploy)')
for c in crons: print(f\"    {c.get('path')}  schedule={c.get('schedule')}  nextRun={c.get('nextRunAt','-')[:19]}\")" 2>/dev/null || true

echo ""
echo "✓ Env vars set. Now redeploy (git push) so functions pick them up,"
echo "  then verify: curl -H 'Authorization: Bearer <KEY>' https://jadugarrajtilak.com/api/agents/cron"
