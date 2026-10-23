// Local smoke test: verify gallery 7 frames, certificates section (2 scans),
// home/about/services rendering, mobile menu, and image fits.
const { chromium } = require('/home/z/.npm-global/lib/node_modules/playwright');

const BASE = process.env.BASE || 'http://localhost:3100';

(async () => {
  const browser = await chromium.launch();
  const results = {};

  // ── Gallery (desktop) ──
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  await page.goto(`${BASE}/gallery`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2500);
  results.gallery = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('#frame-wall img'));
    const srcs = imgs.map((i) => (i.currentSrc || i.src).split('?')[0]);
    const unique = new Set(srcs);
    const allLoad = imgs.every((i) => i.complete && i.naturalWidth > 0);
    // certificates section at page bottom
    const certImgs = Array.from(document.querySelectorAll('section img')).filter((i) =>
      /certificate-(intl|competition)-2021/.test(i.src)
    );
    const certSection = Array.from(document.querySelectorAll('section')).find((s) =>
      s.textContent.includes('Certificates & honours')
    );
    return {
      frameCount: imgs.length,
      uniqueCount: unique.size,
      allLoad,
      srcs,
      certImgs: certImgs.length,
      certSectionPresent: !!certSection,
      certTitles: certSection ? Array.from(certSection.querySelectorAll('h3')).map((h) => h.textContent.trim()) : [],
    };
  });

  // filter chips counts
  results.galleryFilters = await page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('[aria-label="Filter gallery"] button'));
    return chips.map((c) => c.textContent.replace(/\s+/g, ' ').trim());
  });

  // lightbox works?
  await page.click('#frame-wall figure:first-child button');
  await page.waitForTimeout(800);
  results.lightbox = await page.evaluate(() => !!document.querySelector('[role="dialog"] img'));

  // ── Home (desktop) ──
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  results.home = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    const certImgs = imgs.filter((i) => /certificate-(intl|competition)-2021/.test(i.src));
    const lgPhotoInCerts = imgs.filter((i) => /rajtilak-lg-certificate/.test(i.src) && i.closest('section')?.textContent.includes('Certificates'));
    const storyImg = imgs.find((i) => /rajtilak-stage-confetti/.test(i.src) && i.closest('section')?.textContent.includes('old school'));
    return {
      totalImgs: imgs.length,
      brokenImgs: imgs.filter((i) => i.complete && i.naturalWidth === 0).length,
      certImgs: certImgs.length,
      lgPhotoStillInCertSection: lgPhotoInCerts.length,
      certTitles: Array.from(document.querySelectorAll('h3')).filter((h) => /Certificate of Recognition|competition wall/i.test(h.textContent)).map((h) => h.textContent.trim()),
      storyImgRatio: storyImg ? (storyImg.clientWidth / storyImg.clientHeight).toFixed(3) : null,
    };
  });

  // ── About ──
  await page.goto(`${BASE}/about`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  results.about = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return {
      broken: imgs.filter((i) => i.complete && i.naturalWidth === 0).length,
      hasCertCard: imgs.some((i) => /rajtilak-lg-certificate/.test(i.src)),
    };
  });

  // ── Services (Shows) ──
  await page.goto(`${BASE}/services`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  results.services = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('section img'))
      .filter((i) => /\/images\/(rajtilak|svc)/.test(i.src));
    return imgs.map((i) => ({
      src: i.src.split('/').pop(),
      natural: (i.naturalWidth / i.naturalHeight).toFixed(3),
      rendered: (i.clientWidth / i.clientHeight).toFixed(3),
      complete: i.complete && i.naturalWidth > 0,
    }));
  });

  // ── Mobile menu (3-dot) ──
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await mobile.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 30000 });
  await mobile.waitForTimeout(1500);
  const menuBtn = mobile.locator('button[aria-label*="menu" i], button[aria-label*="Open" i]').first();
  results.mobile = { menuButtonVisible: await menuBtn.isVisible().catch(() => false) };
  if (results.mobile.menuButtonVisible) {
    await menuBtn.click();
    await mobile.waitForTimeout(600);
    results.mobile.menuOpened = await mobile.evaluate(() => {
      const nav = document.querySelector('nav[aria-label="Mobile navigation"]');
      return nav ? getComputedStyle(nav).visibility !== 'hidden' : false;
    });
    // click a link inside the mobile menu
    const link = mobile.locator('nav[aria-label="Mobile navigation"] a, nav[aria-label="Mobile navigation"] button').first();
    if (await link.isVisible().catch(() => false)) {
      await link.click();
      await mobile.waitForTimeout(800);
      results.mobile.navigationWorked = mobile.url();
    }
    // close button
    const closeBtn = mobile.locator('button[aria-label*="Close" i]').first();
    results.mobile.closeVisible = await closeBtn.isVisible().catch(() => false);
  }

  console.log(JSON.stringify(results, null, 1));
  await browser.close();
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
