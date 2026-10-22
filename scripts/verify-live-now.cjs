// Verify LIVE site after DB changes: gallery photos, certificate card, all pages
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

  // ── Gallery ──
  await page.goto('https://jadugarrajtilak.com/gallery', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3500);
  const gallery = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('#frame-wall img')).map((i) => ({
      src: (i.currentSrc || i.src).replace('https://jadugarrajtilak.com', ''),
      ok: i.complete && i.naturalWidth > 0,
    }));
    const captions = Array.from(document.querySelectorAll('#frame-wall figcaption, #frame-wall figure span')).map((c) =>
      c.textContent.replace(/\s+/g, ' ').trim().slice(0, 45)
    ).filter((t) => t.length > 5);
    return { count: imgs.length, allLoad: imgs.every((i) => i.ok), srcs: imgs.map((i) => i.src), captions };
  });
  console.log('LIVE GALLERY:', JSON.stringify(gallery, null, 1));
  await page.evaluate(() => window.scrollBy(0, 1400));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/live-gallery.png' });

  // ── About ──
  await page.goto('https://jadugarrajtilak.com/about', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3500);
  const about = await page.evaluate(() => {
    const cert = Array.from(document.querySelectorAll('figure')).find((f) =>
      f.textContent.includes('LG') || f.querySelector('img[src*="cmvje2lwx"]')
    );
    const certImg = document.querySelector('img[src*="cmvje2lwx"]');
    const awardImg = document.querySelector('img[src*="cmvje080a"]');
    return {
      certCardText: cert ? cert.textContent.replace(/\s+/g, ' ').slice(0, 130) : 'NOT FOUND',
      certImg: certImg ? { src: certImg.src.slice(-20), ok: certImg.complete && certImg.naturalWidth > 0 } : null,
      awardImg: awardImg ? { src: awardImg.src.slice(-20), ok: awardImg.complete && awardImg.naturalWidth > 0 } : null,
    };
  });
  console.log('LIVE ABOUT:', JSON.stringify(about, null, 1));
  await page.screenshot({ path: '/tmp/live-about.png' });

  // ── Home (story/reel/trust) ──
  await page.goto('https://jadugarrajtilak.com/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3500);
  const home = await page.evaluate(() => {
    const trust = document.querySelector('section[aria-label="Trust indicators"]');
    const imgs = Array.from(document.querySelectorAll('img')).filter((i) => i.src.includes('/api/media/'));
    return {
      trustHasCities: trust ? trust.textContent.includes('Cities') : null,
      mediaImgs: imgs.map((i) => ({ src: i.src.slice(-20), ok: i.complete && i.naturalWidth > 0 })),
    };
  });
  console.log('LIVE HOME:', JSON.stringify(home, null, 1));

  await browser.close();
})();
