// FINAL live verification: gallery wall, About certificate card, home story LG text, blog images
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

  // Gallery wall
  await page.goto('https://jadugarrajtilak.com/gallery', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(4000);
  await page.evaluate(() => document.querySelector('#frame-wall')?.scrollIntoView());
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/tmp/final-gallery.png' });

  // About cert card
  await page.goto('https://jadugarrajtilak.com/about', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(4000);
  await page.evaluate(() => {
    const img = document.querySelector('img[src*="cmvje2lwx"]');
    img?.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/tmp/final-about-cert.png' });

  // Home story (LG sentence)
  await page.goto('https://jadugarrajtilak.com/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(4000);
  await page.evaluate(() => document.querySelector('#story, [aria-labelledby="story-title"]')?.scrollIntoView());
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/tmp/final-home-story.png' });

  // Blog
  await page.goto('https://jadugarrajtilak.com/blog', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: '/tmp/final-blog.png' });

  await browser.close();
  console.log('final shots done');
})();
