#!/bin/bash
# Local Lighthouse audit of the standalone production build (mobile,
# same throttling as PageSpeed) to measure the performance uplift
# before deploying. Boots server, runs 2 passes, tears down.
cd /home/z/my-project
pkill -f "standalone/server.js" 2>/dev/null
sleep 1

export DATABASE_URL='postgresql://neondb_owner:npg_jW9iZx7wGAQp@ep-super-pine-b43ybe3r.c-6.us-east-2.aws.neon.tech/jr_upload_test?sslmode=require'
export DIRECT_DATABASE_URL="$DATABASE_URL"
export PORT=3100

npm run start -- -p 3100 > /tmp/lh-server.log 2>&1 &
SERVER_PID=$!

for i in $(seq 1 30); do
  curl -s -o /dev/null http://127.0.0.1:3100/api/site/customization && break
  sleep 1
done
# warm one request so the serverless-style cold start doesn't skew pass 1
curl -s -o /dev/null http://127.0.0.1:3100/

export CHROME_PATH=/home/z/.cache/puppeteer/chrome/linux-155.0.8059.39/chrome-linux64/chrome
for RUN in 1 2; do
  npx lighthouse http://127.0.0.1:3100 \
    --only-categories=performance \
    --form-factor=mobile \
    --chrome-flags="--headless=new --no-sandbox" \
    --output=json --output-path=/tmp/lh-local-$RUN.json --quiet 2>/dev/null
done

node -e "
for (const run of ['1','2']) {
  try {
    const r = require('/tmp/lh-local-' + run + '.json');
    const a = r.audits;
    console.log('run', run, '→ score', Math.round(r.categories.performance.score * 100),
      '| FCP', a['first-contentful-paint'].displayValue,
      '| LCP', a['largest-contentful-paint'].displayValue,
      '| TBT', a['total-blocking-time'].displayValue,
      '| SI', a['speed-index'].displayValue);
  } catch (e) { console.log('run', run, 'failed:', e.message); }
}"

kill $SERVER_PID 2>/dev/null
pkill -f "standalone/server.js" 2>/dev/null
