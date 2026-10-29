#!/bin/bash
# Production Lighthouse audit — 3 mobile passes against the live CDN.
export CHROME_PATH=/home/z/.cache/puppeteer/chrome/linux-155.0.8059.39/chrome-linux64/chrome
URL="${1:-https://jadugarrajtilak.com}"
for RUN in 1 2 3; do
  npx lighthouse "$URL" \
    --only-categories=performance \
    --form-factor=mobile \
    --chrome-flags="--headless=new --no-sandbox" \
    --output=json --output-path=/tmp/lh-prod-$RUN.json --quiet 2>/dev/null
done
node -e "
let sum = 0, n = 0;
for (const run of ['1','2','3']) {
  try {
    const r = require('/tmp/lh-prod-' + run + '.json');
    const a = r.audits;
    const s = Math.round(r.categories.performance.score * 100);
    sum += s; n++;
    console.log('run', run, '→ score', s,
      '| FCP', a['first-contentful-paint'].displayValue,
      '| LCP', a['largest-contentful-paint'].displayValue,
      '| TBT', a['total-blocking-time'].displayValue,
      '| SI', a['speed-index'].displayValue,
      '| CLS', a['cumulative-layout-shift'].displayValue);
  } catch (e) { console.log('run', run, 'failed:', e.message); }
}
if (n) console.log('AVERAGE:', Math.round(sum / n));
"
