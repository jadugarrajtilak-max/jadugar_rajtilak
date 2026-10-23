// FULL LIVE AUDIT — post-deploy verification of jadugarrajtilak.com
// Covers: all pages HTTP+render, gallery 7 unique frames, certificates on
// Home+Gallery, image fits, blog, admin, contact form, mobile menu, booking.
const { chromium } = require('/home/z/.npm-global/lib/node_modules/playwright');

const BASE = 'https://jadugarrajtilak.com';
const results = { pages: {}, checks: {} };

(async () => {
  const browser = await chromium.launch();

  // ── 1. All pages respond + render ──
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  const routes = ['/', '/about', '/services', '/packages', '/gallery', '/testimonials', '/blog', '/faq', '/contact', '/legal', '/admin'];
  for (const r of routes) {
    const t0 = Date.now();
    try {
      const resp = await page.goto(`${BASE}${r}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(1200);
      const title = await page.title();
      results.pages[r] = { status: resp.status(), ms: Date.now() - t0, title: title.slice(0, 60) };
    } catch (e) {
      results.pages[r] = { status: 'ERR', error: e.message.slice(0, 80) };
    }
  }

  // ── 2. Gallery deep check ──
  await page.goto(`${BASE}/gallery`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3500);
  results.checks.gallery = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('#frame-wall img'));
    const srcs = imgs.map((i) => (i.currentSrc || i.src).split('?')[0]);
    const certImgs = Array.from(document.querySelectorAll('section img')).filter((i) => /certificate-(intl|competition)-2021/.test(i.src));
    const certSection = Array.from(document.querySelectorAll('section')).find((s) => s.textContent.includes('Certificates & honours'));
    return {
      frameCount: imgs.length,
      uniqueCount: new Set(srcs).size,
      duplicates: srcs.filter((s, i) => srcs.indexOf(s) !== i),
      allLoad: imgs.every((i) => i.complete && i.naturalWidth > 0),
      certImgs: certImgs.length,
      certTitles: certSection ? Array.from(certSection.querySelectorAll('h3')).map((h) => h.textContent.trim()) : [],
      lgPhotoInCerts: certSection ? Array.from(certSection.querySelectorAll('img')).filter((i) => /rajtilak-lg-certificate/.test(i.src)).length : -1,
    };
  });

  // ── 3. Home deep check ──
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);
  results.checks.home = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    const broken = imgs.filter((i) => i.complete && i.naturalWidth === 0);
    const certSection = Array.from(document.querySelectorAll('section')).find((s) => s.textContent.includes('Certificates & honours'));
    const storyImg = imgs.find((i) => /rajtilak-stage-confetti/.test(i.src) && i.closest('section')?.textContent.includes('old school'));
    return {
      imgCount: imgs.length,
      broken: broken.map((i) => i.src.split('/').pop()),
      certImgs: certSection ? certSection.querySelectorAll('img').length : 0,
      certSrcs: certSection ? Array.from(certSection.querySelectorAll('img')).map((i) => i.src.split('/').pop()) : [],
      storyImgFullFit: storyImg ? Math.abs(storyImg.clientWidth / storyImg.clientHeight - storyImg.naturalWidth / storyImg.naturalHeight) < 0.02 : null,
      lgTrustBadge: document.body.textContent.includes('LG'),
    };
  });

  // ── 4. About + Services image fits ──
  await page.goto(`${BASE}/about`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2000);
  results.checks.about = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img')).filter((i) => i.src.includes('/images/'));
    return {
      broken: imgs.filter((i) => i.complete && i.naturalWidth === 0).length,
      lgCertCard: imgs.some((i) => /rajtilak-lg-certificate/.test(i.src)),
    };
  });

  await page.goto(`${BASE}/services`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2500);
  results.checks.services = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('section img'))
      .filter((i) => /\/images\/(rajtilak|svc)/.test(i.src))
      .map((i) => ({
        src: i.src.split('/').pop(),
        fitDelta: Math.abs(i.clientWidth / i.clientHeight - i.naturalWidth / i.naturalHeight).toFixed(4),
        loaded: i.complete && i.naturalWidth > 0,
      }));
  });

  // ── 5. Blog: posts + one article ──
  await page.goto(`${BASE}/blog`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);
  results.checks.blog = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('a[href*="/blog/"]'));
    const imgs = Array.from(document.querySelectorAll('img'));
    return {
      postCards: cards.length,
      brokenImgs: imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src.split('/').pop()),
      firstPostHref: cards[0]?.getAttribute('href'),
    };
  });
  if (results.checks.blog.firstPostHref) {
    await page.goto(`${BASE}${results.checks.blog.firstPostHref}`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);
    results.checks.blogArticle = await page.evaluate(() => {
      const hero = document.querySelector('article img, main img, img');
      return {
        title: document.title.slice(0, 60),
        heroImg: hero ? { src: hero.src.split('/').pop(), ok: hero.complete && hero.naturalWidth > 0 } : null,
      };
    });
  }

  // ── 6. Contact form present + booking wizard ──
  await page.goto(`${BASE}/contact`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  results.checks.contactForm = await page.evaluate(() => {
    const form = document.querySelector('form');
    return { hasForm: !!form, inputs: form ? form.querySelectorAll('input, textarea, select').length : 0 };
  });
  await page.goto(`${BASE}/booking`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2000);
  results.checks.bookingWizard = await page.evaluate(() => {
    const t = document.body.textContent;
    return { hasDateCheck: t.includes('date') || t.includes('Date'), hasForm: !!document.querySelector('form') };
  });

  // ── 7. Admin login page ──
  results.checks.adminPage = results.pages['/admin'];

  // ── 8. Mobile: 3-dot menu + gallery ──
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await mobile.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 60000 });
  await mobile.waitForTimeout(3000);
  const menuBtn = mobile.locator('button[aria-label*="menu" i], button[aria-label*="Open" i]').first();
  results.checks.mobile = { menuBtnVisible: await menuBtn.isVisible().catch(() => false) };
  if (results.checks.mobile.menuBtnVisible) {
    await menuBtn.tap();
    await mobile.waitForTimeout(700);
    results.checks.mobile.menuOpens = await mobile.evaluate(() => {
      const nav = document.querySelector('nav[aria-label="Mobile navigation"]');
      if (!nav) return false;
      const r = nav.getBoundingClientRect();
      return r.width > 200 && getComputedStyle(nav).visibility !== 'hidden';
    });
    // tap "Gallery" link
    const galleryLink = mobile.locator('nav[aria-label="Mobile navigation"] button, nav[aria-label="Mobile navigation"] a').filter({ hasText: /Gallery/i }).first();
    if (await galleryLink.isVisible().catch(() => false)) {
      await galleryLink.tap();
      await mobile.waitForTimeout(2500);
      results.checks.mobile.galleryFrames = await mobile.evaluate(() => document.querySelectorAll('#frame-wall img').length);
      results.checks.mobile.menuClosedAfterNav = !(await mobile.locator('nav[aria-label="Mobile navigation"]').first().isVisible().catch(() => false));
    }
  }
  // mobile horizontal overflow check
  results.checks.mobile.noHorizontalScroll = await mobile.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

  // ── 9. Reviews page ──
  await page.goto(`${BASE}/testimonials`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2000);
  results.checks.reviews = await page.evaluate(() => ({
    rating: document.body.textContent.includes('4.8'),
    brokenImgs: Array.from(document.querySelectorAll('img')).filter((i) => i.complete && i.naturalWidth === 0).length,
  }));

  console.log(JSON.stringify(results, null, 1));
  await browser.close();
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
