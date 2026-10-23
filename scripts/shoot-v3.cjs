// Visual screenshots: gallery + certificates + home
const { chromium } = require('/home/z/.npm-global/lib/node_modules/playwright');
const BASE = process.env.BASE || 'http://localhost:3100';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

  // Gallery wall
  await page.goto(`${BASE}/gallery`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.evaluate(() => document.getElementById('frame-wall')?.scrollIntoView());
  await page.waitForTimeout(1200);
  await page.screenshot({ path: '/tmp/shot-gallery-wall.png', fullPage: false });

  // Certificates section on gallery
  await page.evaluate(() => {
    const s = Array.from(document.querySelectorAll('section')).find((x) => x.textContent.includes('Certificates & honours'));
    s?.scrollIntoView();
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: '/tmp/shot-gallery-certs.png' });

  // Home certificates
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.evaluate(() => {
    const s = Array.from(document.querySelectorAll('section')).find((x) => x.textContent.includes('Certificates & honours'));
    s?.scrollIntoView();
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: '/tmp/shot-home-certs.png' });

  // Home story photo (2nd image)
  await page.evaluate(() => {
    const s = Array.from(document.querySelectorAll('section')).find((x) => x.textContent.includes('old school'));
    s?.scrollIntoView();
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: '/tmp/shot-home-story.png' });

  // Mobile gallery
  const m = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await m.goto(`${BASE}/gallery`, { waitUntil: 'networkidle', timeout: 30000 });
  await m.waitForTimeout(2000);
  await m.evaluate(() => document.getElementById('frame-wall')?.scrollIntoView());
  await m.waitForTimeout(1200);
  await m.screenshot({ path: '/tmp/shot-mobile-gallery.png' });

  await browser.close();
  console.log('screenshots saved');
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
