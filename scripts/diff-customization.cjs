#!/usr/bin/env node
// Diff live /api/site/customization against local defaults to find DB overrides
const fs = require('fs');

(async () => {
  const live = JSON.parse(fs.readFileSync('/tmp/custom.json', 'utf8'));
  // Extract defaults from the customization.ts via regex over source
  const src = fs.readFileSync('/home/z/my-project/src/lib/customization.ts', 'utf8');

  // Parse TEXT_LINES entries: { key: "...", ... value: "..." }
  const textDefaults = {};
  const textRe = /\{\s*key:\s*"([^"]+)"[^}]*?value:\s*"((?:[^"\\]|\\.)*)"/gs;
  let m;
  while ((m = textRe.exec(src)) !== null) {
    textDefaults[m[1]] = m[2].replace(/\\"/g, '"').replace(/\\n/g, '\n');
  }

  // Parse IMAGE_SLOTS defaults: key + defaultSrc
  const imgDefaults = {};
  const imgRe = /key:\s*"([^"]+)",[\s\S]*?defaultSrc:\s*"([^"]+)"/g;
  while ((m = imgRe.exec(src)) !== null) {
    imgDefaults[m[1]] = m[2];
  }

  console.log('=== TEXT OVERRIDES (live != default) ===');
  let count = 0;
  for (const [k, v] of Object.entries(live.texts || {})) {
    if (textDefaults[k] !== undefined && textDefaults[k] !== v) {
      count++;
      console.log(`[DIFF] ${k}`);
      console.log(`   live:    ${String(v).slice(0, 100)}`);
      console.log(`   default: ${String(textDefaults[k]).slice(0, 100)}`);
    } else if (textDefaults[k] === undefined) {
      console.log(`[EXTRA-IN-LIVE] ${k} = ${String(v).slice(0, 80)}`);
    }
  }
  console.log(`total text diffs: ${count}`);
  console.log(`live text keys: ${Object.keys(live.texts || {}).length}, parsed default text keys: ${Object.keys(textDefaults).length}`);

  console.log('\n=== ASSET OVERRIDES (live != default) ===');
  let acount = 0;
  for (const [k, v] of Object.entries(live.assets || {})) {
    if (imgDefaults[k] !== undefined && imgDefaults[k] !== v.src) {
      acount++;
      console.log(`[DIFF] ${k}: live=${v.src} default=${imgDefaults[k]}`);
    }
  }
  console.log(`total asset diffs: ${acount}`);
  console.log(`live asset keys: ${Object.keys(live.assets || {}).length}, parsed default img keys: ${Object.keys(imgDefaults).length}`);

  console.log('\n=== THEME ===');
  console.log(JSON.stringify(live.theme || {}, null, 1).slice(0, 500));
  console.log('\nrev:', live.rev);
})();
