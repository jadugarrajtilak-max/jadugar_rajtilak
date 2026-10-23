// Which resource is slow? Timed resource audit on live home (desktop)
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  const timings = [];
  page.on('request', (r) => { timings.push({ url: r.url(), start: Date.now(), type: r.resourceType() }); });
  page.on('requestfinished', (r) => { const t = timings.find(x => x.url === r.url() && !x.end); if (t) t.end = Date.now(); });
  page.on('requestfailed', (r) => { const t = timings.find(x => x.url === r.url() && !x.end); if (t) { t.end = Date.now(); t.failed = true; } });

  const t0 = Date.now();
  await page.goto('https://jadugarrajtilak.com/', { waitUntil: 'load', timeout: 90000 });
  const loadMs = Date.now() - t0;
  // scroll to trigger lazy images
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 900) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 150)); } });
  await page.waitForTimeout(3000);

  const slow = timings.filter(t => t.end).map(t => ({ ms: t.end - t.start, type: t.type, url: t.url.slice(0, 100), failed: !!t.failed })).sort((a, b) => b.ms - a.ms);
  console.log(`load event: ${(loadMs / 1000).toFixed(1)}s | total requests: ${slow.length}`);
  console.log('\n=== slowest 15 ===');
  slow.slice(0, 15).forEach(t => console.log(`${(t.ms / 1000).toFixed(1)}s [${t.type}]${t.failed ? ' FAILED' : ''} ${t.url}`));
  const imgs = slow.filter(t => t.type === 'image');
  console.log(`\nimages: ${imgs.length}, total img time: ${(imgs.reduce((s, i) => s + i.ms, 0) / 1000).toFixed(1)}s`);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
