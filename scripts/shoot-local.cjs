// Verify local dev rendering of all changed pages
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

  // home
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/tmp/l-home-hero.png' });
  // trustbar (just below hero)
  await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('section')).find((s) => s.textContent.includes('Felicitation'));
    el?.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: '/tmp/l-home-trust.png' });
  // story
  await page.evaluate(() => document.querySelector('#story, [aria-labelledby="story-title"]')?.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: '/tmp/l-home-story.png' });
  // reel
  await page.evaluate(() => document.querySelector('#reel')?.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: '/tmp/l-home-reel.png' });

  for (const [path, name] of [['/gallery', 'gallery'], ['/about', 'about'], ['/services', 'services']]) {
    await page.goto('http://localhost:3000' + path, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `/tmp/l-${name}-top.png` });
    await page.evaluate(() => window.scrollBy(0, 1100));
    await page.waitForTimeout(900);
    await page.screenshot({ path: `/tmp/l-${name}-2.png` });
    console.log('shot:', name);
  }
  await browser.close();
})();
