// Live QA: load pages in headless Chromium, wait for hydration,
// then report final img srcs + console errors.
const { chromium } = require('playwright');

const PAGES = [
  ['home', 'https://jadugarrajtilak.com/'],
  ['about', 'https://jadugarrajtilak.com/about'],
  ['gallery', 'https://jadugarrajtilak.com/gallery'],
  ['contact', 'https://jadugarrajtilak.com/contact'],
];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  for (const [name, url] of PAGES) {
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 120)); });
    page.on('pageerror', (e) => errors.push('PAGEERROR: ' + String(e).slice(0, 120)));
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(4000); // let customization fetch + swap settle
      const imgs = await page.evaluate(() =>
        Array.from(document.querySelectorAll('img'))
          .map((i) => i.currentSrc || i.src)
          .filter((s) => s.includes('/api/media/') || s.includes('/images/gallery') || s.includes('about-award') || s.includes('felicitation') || s.includes('hero-'))
      );
      const uniq = [...new Set(imgs)];
      console.log(`\n=== ${name} (${url}) ===`);
      console.log('media/images rendered:');
      uniq.forEach((u) => console.log('  ', u.replace('https://jadugarrajtilak.com', '')));
      console.log('console errors:', errors.length ? errors.slice(0, 5) : 'none');
    } catch (e) {
      console.log(`\n=== ${name} FAILED: ${e.message.slice(0, 100)}`);
      console.log('console errors:', errors.slice(0, 5));
    }
    await page.close();
  }
  await browser.close();
})();
