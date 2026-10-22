// Focused mobile menu navigation test
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const mp = await browser.newPage({ viewport: { width: 375, height: 812, deviceScaleFactor: 2 }, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1' });
  const errors = [];
  mp.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  mp.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text().slice(0, 150)); });

  await mp.goto('https://jadugarrajtilak.com/', { waitUntil: 'networkidle', timeout: 90000 });
  await mp.waitForTimeout(2000);

  // open the menu
  await mp.locator('button[aria-label*="menu" i]').first().tap({ timeout: 8000 });
  await mp.waitForTimeout(800);

  // inspect the open menu
  const menuInfo = await mp.evaluate(() => {
    const menu = document.querySelector('div.fixed.inset-0');
    if (!menu) return { open: false };
    const btns = Array.from(menu.querySelectorAll('button')).map((b, i) => {
      const r = b.getBoundingClientRect();
      return { i, text: (b.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 30), rect: `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`, visible: r.width > 0 };
    });
    return { open: true, btns: btns.filter(b => b.visible) };
  });
  console.log('menu state:', JSON.stringify(menuInfo, null, 2));

  // tap the Gallery item INSIDE the mobile nav specifically
  const galleryBtn = mp.locator('nav[aria-label="Mobile navigation"] button', { hasText: 'Gallery' }).first();
  const count = await galleryBtn.count();
  console.log('gallery-in-menu buttons found:', count);
  if (count) {
    await galleryBtn.tap({ timeout: 8000 });
    await mp.waitForTimeout(2000);
    const path = await mp.evaluate(() => location.pathname);
    const menuStillOpen = await mp.evaluate(() => !!document.querySelector('button[aria-label="Close menu"]'));
    console.log('after tap -> pathname:', path, '| menu closed:', !menuStillOpen);
    await mp.screenshot({ path: 'scripts/liveaudit/after/mobile-after-nav.png' });
  }

  // retry with click instead of tap
  if (count) {
    await mp.goto('https://jadugarrajtilak.com/', { waitUntil: 'networkidle' });
    await mp.locator('button[aria-label*="menu" i]').first().tap();
    await mp.waitForTimeout(700);
    await mp.locator('nav[aria-label="Mobile navigation"] button', { hasText: 'Gallery' }).first().click({ timeout: 8000 });
    await mp.waitForTimeout(2000);
    console.log('after CLICK -> pathname:', await mp.evaluate(() => location.pathname));
  }

  console.log('page errors:', errors.length ? errors.slice(0, 5) : 'none');
  await browser.close();
})().catch(e => { console.error('FAILED:', e); process.exit(1); });
