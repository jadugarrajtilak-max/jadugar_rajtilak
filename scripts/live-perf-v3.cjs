// Performance audit — desktop + mobile: navigation timing, resource weight,
// paint metrics. Measures the heaviest pages: /, /gallery, /services.
const { chromium } = require('/home/z/.npm-global/lib/node_modules/playwright');
const BASE = 'https://jadugarrajtilak.com';
const PAGES = ['/', '/gallery', '/services'];

async function measure(browser, viewport, label) {
  const ctx = await browser.newContext({ viewport, isMobile: label === 'mobile', hasTouch: label === 'mobile', userAgent: label === 'mobile' ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' : undefined });
  const page = await ctx.newPage();
  const out = {};
  for (const path of PAGES) {
    const requests = [];
    page.on('response', (r) => requests.push(r));
    const t0 = Date.now();
    await page.goto(`${BASE}${path}`, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(2500);
    // scroll to bottom to trigger lazy images
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1500);
    const m = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      const paints = performance.getEntriesByType('paint');
      const lcp = performance.getEntriesByType('largest-contentful-paint').pop();
      return {
        ttfb: Math.round(nav?.responseStart ?? 0),
        domContentLoaded: Math.round(nav?.domContentLoadedEventEnd ?? 0),
        loadEvent: Math.round(nav?.loadEventEnd ?? 0),
        fcp: Math.round(paints.find((p) => p.name === 'first-contentful-paint')?.startTime ?? 0),
        lcp: Math.round(lcp?.startTime ?? 0),
        transferSize: Math.round((performance.getEntriesByType('resource') || []).reduce((a, r) => a + (r.transferSize || 0), 0)),
        resourceCount: performance.getEntriesByType('resource').length,
      };
    });
    // biggest resources
    const big = await page.evaluate(() =>
      performance.getEntriesByType('resource')
        .map((r) => ({ name: r.name.split('/').pop().slice(0, 40), kb: Math.round((r.transferSize || 0) / 1024) }))
        .sort((a, b) => b.kb - a.kb).slice(0, 8)
    );
    out[path] = { ...m, wallMs: Date.now() - t0, biggest: big };
  }
  await ctx.close();
  return out;
}

(async () => {
  const browser = await chromium.launch();
  const desktop = await measure(browser, { width: 1366, height: 900 }, 'desktop');
  const mobile = await measure(browser, { width: 390, height: 844 }, 'mobile');
  console.log(JSON.stringify({ desktop, mobile }, null, 1));
  await browser.close();
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
