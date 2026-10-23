// FULL live verification after deploy + DB cleanup
const { chromium } = require('playwright');
const fs = require('fs');

const BASE = 'https://jadugarrajtilak.com';
const OUT = 'scripts/liveaudit/after';
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const results = {};

  // ── DESKTOP ──
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  const t0 = Date.now();
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  results.domReadyMs = Date.now() - t0;
  await page.waitForFunction(() => Array.from(document.images).every(i => i.complete), { timeout: 60000 }).catch(() => {});
  results.allImagesMs = Date.now() - t0;
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 800) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); } });
  await page.waitForTimeout(1200);

  // cert section on home
  results.homeCerts = await page.evaluate(() => {
    const h = Array.from(document.querySelectorAll('h2')).find(e => /certificates/i.test(e.textContent || ''));
    if (!h) return { found: false };
    const sec = h.closest('section');
    return {
      found: true,
      imgs: sec ? Array.from(sec.querySelectorAll('img')).map(i => ({ src: i.src.split('?')[0].split('/').pop(), nat: `${i.naturalWidth}x${i.naturalHeight}`, loaded: i.naturalWidth > 0 })) : [],
      lgMention: (sec?.textContent || '').includes('LG'),
    };
  });

  // home image census (hero/story/reel/certs)
  results.homeImgs = await page.evaluate(() => Array.from(document.images).filter(i => i.naturalWidth > 100).map(img => {
    const r = img.getBoundingClientRect();
    return { src: img.src.split('?')[0].split('/').pop(), rendered: `${Math.round(r.width)}x${Math.round(r.height)}`, natural: `${img.naturalWidth}x${img.naturalHeight}` };
  }));
  await page.screenshot({ path: `${OUT}/home-full.png`, fullPage: true });

  // gallery
  await page.goto(BASE + '/gallery', { waitUntil: 'networkidle', timeout: 90000 });
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 800) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); } });
  await page.waitForTimeout(1500);
  results.gallery = await page.evaluate(() => {
    const wall = document.getElementById('frame-wall');
    const frames = wall ? Array.from(wall.querySelectorAll('img')).map(i => i.src.split('?')[0]) : [];
    const certs = Array.from(document.querySelectorAll('section[aria-labelledby="cert-title"] img')).map(i => ({ src: i.src.split('/').pop(), loaded: i.naturalWidth > 0 }));
    return {
      frameCount: frames.length,
      uniqueCount: new Set(frames).size,
      duplicates: frames.filter((f, i) => frames.indexOf(f) !== i),
      certImgs: certs,
      lgCaption: document.body.textContent.includes('LG'),
    };
  });
  await page.screenshot({ path: `${OUT}/gallery-full.png`, fullPage: true });

  // services (Shows)
  await page.goto(BASE + '/services', { waitUntil: 'networkidle', timeout: 90000 });
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 800) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); } });
  await page.waitForTimeout(1000);
  results.services = await page.evaluate(() => Array.from(document.querySelectorAll('main img')).filter(i => i.naturalWidth > 100).map(img => {
    const r = img.getBoundingClientRect();
    return { src: img.src.split('?')[0].split('/').pop(), cropPct: Math.round(Math.abs(1 - (r.width / r.height) / (img.naturalWidth / img.naturalHeight)) * 100) };
  }));
  await page.screenshot({ path: `${OUT}/services-full.png`, fullPage: true });

  // about — LG certificate card
  await page.goto(BASE + '/about', { waitUntil: 'networkidle', timeout: 90000 });
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 800) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); } });
  await page.waitForTimeout(1000);
  results.about = await page.evaluate(() => ({
    lgMention: document.body.textContent.includes('Felicitated by LG'),
    certImgLoaded: Array.from(document.images).some(i => i.src.includes('lg-certificate') && i.naturalWidth > 0),
  }));

  // ── MOBILE ──
  const mp = await browser.newPage({ viewport: { width: 375, height: 812, deviceScaleFactor: 2 }, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1' });
  const tm = Date.now();
  await mp.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  results.mobileDomReadyMs = Date.now() - tm;
  await mp.waitForFunction(() => Array.from(document.images).every(i => i.complete), { timeout: 60000 }).catch(() => {});
  results.mobileAllImagesMs = Date.now() - tm;
  await mp.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 800) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); } });
  results.mobileOverflow = await mp.evaluate(() => ({ w: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  // menu tap test
  const ham = mp.locator('button[aria-label*="menu" i]').first();
  await ham.tap({ timeout: 8000 });
  await mp.waitForTimeout(900);
  results.mobileMenuOpens = await mp.evaluate(() => !!document.querySelector('button[aria-label="Close menu"]'));
  // navigate from the menu (Gallery link tap)
  if (results.mobileMenuOpens) {
    await mp.locator('button', { hasText: 'Gallery' }).first().tap({ timeout: 5000 }).catch(() => {});
    await mp.waitForTimeout(1500);
    results.mobileMenuNavWorks = await mp.evaluate(() => location.pathname);
  }
  await mp.screenshot({ path: `${OUT}/mobile-home.png`, fullPage: true });

  fs.writeFileSync(`${OUT}/results.json`, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})().catch(e => { console.error('LIVE VERIFY FAILED:', e); process.exit(1); });
