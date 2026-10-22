// Verify certificate on About + hero text after hydration
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

  // ── About: certificate must render ──
  await page.goto('https://jadugarrajtilak.com/about', { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(3500);
  const cert = await page.evaluate(() => {
    const img = Array.from(document.querySelectorAll('img')).find((i) => (i.currentSrc || i.src).includes('certificate-intl-2021'));
    if (!img) return { found: false };
    const rect = img.getBoundingClientRect();
    // climb to the figure card for the title text
    const card = img.closest('figure');
    return {
      found: true,
      rendered: rect.width > 50 && rect.height > 50,
      size: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
      title: card ? card.textContent.replace(/\s+/g, ' ').slice(0, 120) : '',
    };
  });
  console.log('ABOUT certificate:', JSON.stringify(cert, null, 1));

  // screenshot proof
  const certEl = await page.$('img[src*="certificate-intl-2021"]');
  if (certEl) await certEl.screenshot({ path: '/tmp/cert-render.png' });

  // ── Home: hero text after hydration ──
  await page.goto('https://jadugarrajtilak.com/', { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(3500);
  const hero = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const para = document.querySelector('h1 ~ p, section p');
    const imgs = Array.from(document.querySelectorAll('img')).map((i) => (i.currentSrc || i.src).replace('https://jadugarrajtilak.com', ''));
    return {
      h1: h1 ? h1.textContent.replace(/\s+/g, ' ').trim().slice(0, 80) : null,
      firstPara: para ? para.textContent.replace(/\s+/g, ' ').trim().slice(0, 100) : null,
      heroImgs: imgs.filter((s) => s.includes('hero')).slice(0, 4),
    };
  });
  console.log('HOME hero:', JSON.stringify(hero, null, 1));
  await page.screenshot({ path: '/tmp/home-hero-render.png', clip: { x: 0, y: 0, width: 1366, height: 800 } });

  await browser.close();
})();
