// Live mobile performance measurement — total transfer, JS payload, LCP-ish timing
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 812, deviceScaleFactor: 2 }, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  });
  const page = await ctx.newPage();
  const resources = [];
  page.on('response', (r) => {
    const h = r.headers();
    const size = parseInt(h['content-length'] || '0', 10);
    resources.push({ url: r.url(), status: r.status(), type: r.request().resourceType(), size });
  });
  const t0 = Date.now();
  await page.goto('https://jadugarrajtilak.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  const domReady = Date.now() - t0;
  // wait for hero image to load (LCP proxy)
  await page.waitForFunction(() => {
    const imgs = Array.from(document.images);
    return imgs.length > 0 && imgs.every(i => i.complete);
  }, { timeout: 60000 }).catch(() => {});
  const allLoaded = Date.now() - t0;

  // network transfer totals
  const byType = {};
  resources.forEach(r => {
    const t = r.type;
    byType[t] = byType[t] || { count: 0, knownBytes: 0 };
    byType[t].count++;
    byType[t].knownBytes += r.size;
  });
  console.log(`DOM ready: ${(domReady / 1000).toFixed(1)}s | all images loaded: ${(allLoaded / 1000).toFixed(1)}s`);
  console.log('\n=== Resources by type (content-length where known) ===');
  Object.entries(byType).sort((a, b) => b[1].knownBytes - a[1].knownBytes).forEach(([t, s]) => {
    console.log(`${t}: ${s.count} requests, ${(s.knownBytes / 1024).toFixed(0)}KB known`);
  });
  console.log('\n=== 15 largest resources (decoded/known) ===');
  resources.filter(r => r.size > 0).sort((a, b) => b.size - a.size).slice(0, 15).forEach(r => {
    console.log(`${(r.size / 1024).toFixed(0)}KB [${r.type}] ${r.url.slice(0, 90)}`);
  });
  const noLen = resources.filter(r => !r.size && (r.type === 'script' || r.type === 'stylesheet' || r.type === 'image')).length;
  console.log(`\n(${noLen} scripts/styles/images without content-length header — gzip/streamed)`);
  await browser.close();
})().catch(e => { console.error('PERF AUDIT FAILED:', e); process.exit(1); });
