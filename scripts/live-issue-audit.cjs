// LIVE audit — user-reported issues: gallery duplicates, home images,
// Shows page crops, mobile 3-dot menu. Usage: node scripts/live-issue-audit.cjs
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'https://jadugarrajtilak.com';
const OUT = path.join(__dirname, 'liveaudit');
fs.mkdirSync(OUT, { recursive: true });

async function newPage(browser, mobile) {
  const ctx = await browser.newContext(mobile
    ? { viewport: { width: 375, height: 812, deviceScaleFactor: 2 }, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1' }
    : { viewport: { width: 1366, height: 900 } });
  return ctx.newPage();
}

async function collectImgs(page, label) {
  return page.evaluate((label) => {
    const out = [];
    document.querySelectorAll('img').forEach((img) => {
      const r = img.getBoundingClientRect();
      out.push({
        src: (img.currentSrc || img.src || '').split('?')[0],
        alt: (img.alt || '').slice(0, 60),
        rendered: `${Math.round(r.width)}x${Math.round(r.height)}`,
        natural: `${img.naturalWidth}x${img.naturalHeight}`,
        fit: getComputedStyle(img).objectFit,
      });
    });
    return out;
  }, label);
}

(async () => {
  const browser = await chromium.launch();
  const report = {};

  // ── DESKTOP ──
  let page = await newPage(browser, false);

  // 1. HOME — hero + story + reel + all images
  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } });
  await page.waitForTimeout(1500);
  report.homeDesktop = await collectImgs(page, 'home');
  await page.screenshot({ path: `${OUT}/desktop-home-full.png`, fullPage: true });
  const heroEl = await page.$('main img, section img, header img');
  if (heroEl) await heroEl.screenshot({ path: `${OUT}/desktop-home-firstimg.png` }).catch(() => {});

  // 2. GALLERY — duplicates check
  await page.goto(BASE + '/gallery', { waitUntil: 'networkidle', timeout: 60000 });
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } });
  await page.waitForTimeout(1500);
  report.galleryDesktop = await collectImgs(page, 'gallery');
  await page.screenshot({ path: `${OUT}/desktop-gallery-full.png`, fullPage: true });

  // 3. SHOWS (services) — crop check
  await page.goto(BASE + '/services', { waitUntil: 'networkidle', timeout: 60000 });
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } });
  await page.waitForTimeout(1500);
  report.servicesDesktop = await collectImgs(page, 'services');
  await page.screenshot({ path: `${OUT}/desktop-services-full.png`, fullPage: true });

  // ── MOBILE ──
  page = await newPage(browser, true);
  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2000);
  report.homeMobile = await collectImgs(page, 'homeM');

  // 3-dot / hamburger menu test: find menu-ish buttons
  const menuButtons = await page.evaluate(() => {
    const btns = [];
    document.querySelectorAll('button, [role="button"], a[aria-label]').forEach((b) => {
      const lbl = (b.getAttribute('aria-label') || '').toLowerCase();
      const txt = (b.textContent || '').toLowerCase().trim();
      const r = b.getBoundingClientRect();
      if ((lbl.includes('menu') || lbl.includes('nav') || txt.includes('menu')) && r.width > 0 && r.width < 200) {
        btns.push({ aria: b.getAttribute('aria-label'), cls: (b.className || '').toString().slice(0, 80), rect: `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}` });
      }
    });
    // also list any fixed/absolute positioned small round buttons (possible 3-dot)
    const floats = [];
    document.querySelectorAll('button, a').forEach((b) => {
      const cs = getComputedStyle(b);
      const r = b.getBoundingClientRect();
      if ((cs.position === 'fixed' || cs.position === 'absolute') && r.width > 0 && r.width < 70 && r.top > 0) {
        floats.push({ aria: b.getAttribute('aria-label'), cls: (b.className || '').toString().slice(0, 60), rect: `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}` });
      }
    });
    return { btns, floats };
  });
  report.mobileMenuCandidates = menuButtons;

  // try clicking the hamburger (aria-label contains 'menu')
  let menuTest = { found: false };
  const ham = page.locator('button[aria-label*="menu" i]').first();
  if (await ham.count()) {
    menuTest.found = true;
    try {
      await ham.click({ timeout: 5000 });
      await page.waitForTimeout(1200);
      menuTest.openedPanel = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a, button')).filter(e => {
          const t = (e.textContent || '').toLowerCase();
          return t.includes('gallery') || t.includes('about') || t.includes('shows');
        }).length;
        return { navLinksVisible: links, bodyOverflow: document.body.style.overflow };
      });
      await page.screenshot({ path: `${OUT}/mobile-menu-open.png` });
      await ham.click().catch(async () => { await page.locator('button[aria-label*="close" i]').first().click().catch(() => {}); });
    } catch (e) { menuTest.error = String(e).slice(0, 200); }
  }
  report.mobileMenuTest = menuTest;

  await page.screenshot({ path: `${OUT}/mobile-home-top.png` });
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } });
  await page.screenshot({ path: `${OUT}/mobile-home-full.png`, fullPage: true });

  // Mobile gallery (count dupes)
  await page.goto(BASE + '/gallery', { waitUntil: 'networkidle', timeout: 60000 });
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } });
  await page.waitForTimeout(1500);
  report.galleryMobile = await collectImgs(page, 'galleryM');
  await page.screenshot({ path: `${OUT}/mobile-gallery-full.png`, fullPage: true });

  fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));

  // quick console summary
  const dupCount = {};
  report.galleryDesktop.forEach(i => { if (i.src.includes('/api/media/') || i.src.includes('/images/')) dupCount[i.src] = (dupCount[i.src] || 0) + 1; });
  console.log('=== GALLERY DESKTOP image src counts ===');
  Object.entries(dupCount).forEach(([src, n]) => console.log(`${n}x ${src}`));
  console.log('\n=== HOME DESKTOP first 6 imgs ===');
  report.homeDesktop.slice(0, 6).forEach(i => console.log(`${i.rendered} nat:${i.natural} fit:${i.fit} ${i.src.slice(0, 70)}`));
  console.log('\n=== SERVICES DESKTOP imgs ===');
  report.servicesDesktop.forEach(i => console.log(`${i.rendered} nat:${i.natural} fit:${i.fit} ${i.src.slice(0, 70)}`));
  console.log('\n=== MOBILE MENU ===');
  console.log(JSON.stringify(report.mobileMenuTest, null, 2));
  console.log('\nmenu candidates:', JSON.stringify(report.mobileMenuCandidates.btns, null, 2));
  await browser.close();
})().catch(e => { console.error('AUDIT FAILED:', e); process.exit(1); });
