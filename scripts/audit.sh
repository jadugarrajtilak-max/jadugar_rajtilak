#!/bin/bash
# One-shot: start prod server → run Lighthouse mobile → stop server.
# The sandbox reaps background processes between tool calls, so the
# server and the audit must share a single bash session.
set -u
cd /home/z/my-project

export NODE_ENV=production
bun .next/standalone/server.js > /tmp/prod-server.log 2>&1 &
SERVER_PID=$!

# Wait for readiness (max 30s)
for i in $(seq 1 60); do
  if curl -s -o /dev/null http://127.0.0.1:3000 --max-time 2; then break; fi
  sleep 0.5
done
echo "server up (pid $SERVER_PID)"

export CHROME_PATH=/home/z/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome
pkill -f chrome 2>/dev/null; sleep 1

URL="${1:-http://127.0.0.1:3000}"
OUT="${2:-/home/z/my-project/scripts/lh-mobile.json}"

npx lighthouse "$URL" \
  --chrome-flags="--headless --no-sandbox --disable-gpu --disable-dev-shm-usage --no-proxy-server" \
  --preset=perf --form-factor=mobile \
  --output=json --output-path="$OUT" \
  --max-wait-for-load=120000 --quiet 2>&1 | grep -viE "dbus" | tail -3

kill $SERVER_PID 2>/dev/null
echo "server stopped"
