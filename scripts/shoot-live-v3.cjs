// Final live screenshots + VLM verification
const { chromium } = require('/home/z/.npm-global/lib/node_modules/playwright');
const BASE = 'https://jadugarrajtilak.com';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

  await page.goto(`${BASE}/gallery`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3500);
  await page.evaluate(() => document.getElementById('frame-wall')?.scrollIntoView());
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/tmp/live-gallery-wall.png' });

  await page.evaluate(() => {
    Array.from(document.querySelectorAll('section')).find((s) => s.textContent.includes('Certificates & honours'))?.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/tmp/live-gallery-certs.png' });

  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);
  await page.evaluate(() => {
    Array.from(document.querySelectorAll('section')).find((s) => s.textContent.includes('Certificates & honours'))?.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/tmp/live-home-certs.png' });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await mobile.goto(`${BASE}/gallery`, { waitUntil: 'networkidle', timeout: 60000 });
  await mobile.waitForTimeout(3000);
  await mobile.evaluate(() => document.getElementById('frame-wall')?.scrollIntoView());
  await mobile.waitForTimeout(1500);
  await mobile.screenshot({ path: '/tmp/live-mobile-gallery.png' });

  await browser.close();
  console.log('live screenshots saved');
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
