// Screenshot live site pages to see current image state
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await ctx.newPage();

  const shots = [
    ['https://jadugarrajtilak.com/', 'home-top'],
    ['https://jadugarrajtilak.com/#story', 'home-story'],
    ['https://jadugarrajtilak.com/#reel', 'home-reel'],
    ['https://jadugarrajtilak.com/?view=gallery', 'gallery'],
    ['https://jadugarrajtilak.com/?view=about', 'about'],
    ['https://jadugarrajtilak.com/?view=services', 'services'],
  ];

  for (const [url, name] of shots) {
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(2500);
      await page.screenshot({ path: `/tmp/before-${name}.png` });
      console.log('shot:', name);
    } catch (e) {
      console.log('FAIL:', name, e.message.slice(0, 80));
    }
  }
  await browser.close();
})();
