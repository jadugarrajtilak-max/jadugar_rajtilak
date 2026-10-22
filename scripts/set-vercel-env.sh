#!/bin/bash
# Set production env vars on the Vercel project jadugar_rajtilak
set -e
TOKEN="${VERCEL_TOKEN:?source scripts/.env.ops}"
TEAM="${VERCEL_TEAM}"
PID="${VERCEL_PROJECT_ID}"

ADMIN_SECRET=$(openssl rand -hex 24)
ADMIN_KEY=$(openssl rand -hex 16)

set_env() {
  local key="$1" value="$2" targets="$3"
  local target_json
  case "$targets" in
    production) target_json='["production"]' ;;
    *) target_json='["production","preview","development"]' ;;
  esac
  curl -s -X POST "https://api.vercel.com/v10/projects/$PID/env?teamId=$TEAM" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"key\":\"$key\",\"value\":\"$value\",\"type\":\"encrypted\",\"target\":$target_json}" | python3 -c "import json,sys;d=json.load(sys.stdin);print('  set', d.get('key', d))"
}

echo "Setting env vars on Vercel project..."
set_env "DATABASE_URL" process.env.DATABASE_URL "production"
set_env "DIRECT_DATABASE_URL" process.env.DATABASE_URL "production"
set_env "ADMIN_SECRET" "$ADMIN_SECRET" "production"
set_env "ADMIN_KEY" "$ADMIN_KEY" "production"
set_env "MASTER_ADMIN_EMAIL" "jadugar.rajtilak@gmail.com" "production"
set_env "MASTER_ADMIN_PASSWORD" "${ADMIN_PASSWORD:?source scripts/.env.ops}" "production"

echo "ADMIN_KEY (save this): $ADMIN_KEY"
