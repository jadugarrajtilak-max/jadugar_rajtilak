// Screenshot live site pages — correct paths + section scrolls
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await ctx.newPage();

  // Home sections via scroll
  await page.goto('https://jadugarrajtilak.com/', { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: '/tmp/b-home-hero.png' });
  // story section
  await page.evaluate(() => document.querySelector('#story, [aria-labelledby="story-title"]')?.scrollIntoView());
  await page.waitForTimeout(1200);
  await page.screenshot({ path: '/tmp/b-home-story.png' });
  // reel section
  await page.evaluate(() => document.querySelector('#reel')?.scrollIntoView());
  await page.waitForTimeout(1200);
  await page.screenshot({ path: '/tmp/b-home-reel.png' });

  for (const [path, name, scroll] of [
    ['/gallery', 'gallery', true],
    ['/about', 'about', true],
    ['/services', 'services', true],
    ['/services#wedding', 'svc-wedding', true],
  ]) {
    try {
      await page.goto('https://jadugarrajtilak.com' + path, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(2500);
      await page.screenshot({ path: `/tmp/b-${name}.png` });
      if (scroll) {
        await page.evaluate(() => window.scrollBy(0, 900));
        await page.waitForTimeout(900);
        await page.screenshot({ path: `/tmp/b-${name}-2.png` });
        await page.evaluate(() => window.scrollBy(0, 1800));
        await page.waitForTimeout(900);
        await page.screenshot({ path: `/tmp/b-${name}-3.png` });
      }
      console.log('shot:', name);
    } catch (e) {
      console.log('FAIL:', name, e.message.slice(0, 80));
    }
  }
  await browser.close();
})();
