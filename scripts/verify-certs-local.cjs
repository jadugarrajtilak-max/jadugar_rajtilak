// Local verification of the new certificate section + gallery + home fixes
const { chromium } = require('playwright');
const fs = require('fs');

const OUT = 'scripts/liveaudit/local-verify';
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

  // ── HOME ──
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 800) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 100)); } });
  await page.waitForTimeout(1500);

  const homeImgs = await page.evaluate(() => Array.from(document.images).map(img => {
    const r = img.getBoundingClientRect();
    return { src: (img.currentSrc || img.src).split('?')[0], alt: (img.alt || '').slice(0, 50), rendered: `${Math.round(r.width)}x${Math.round(r.height)}`, natural: `${img.naturalWidth}x${img.naturalHeight}` };
  }));
  const certSection = await page.evaluate(() => {
    const h = Array.from(document.querySelectorAll('h2, h3')).find(e => /certificates/i.test(e.textContent || ''));
    if (!h) return { found: false };
    const sec = h.closest('section');
    const imgs = sec ? Array.from(sec.querySelectorAll('img')).map(i => ({ src: i.src.split('?')[0], nat: `${i.naturalWidth}x${i.naturalHeight}`, cls: i.className.split(' ').find(c => c.startsWith('aspect')) })) : [];
    const text = sec ? sec.textContent.replace(/\s+/g, ' ').slice(0, 300) : '';
    return { found: true, heading: h.textContent, imgs, text };
  });
  console.log('=== HOME: cert section ===');
  console.log(JSON.stringify(certSection, null, 2));
  console.log('\n=== HOME: hero + story + reel imgs ===');
  homeImgs.filter(i => !i.src.includes('logo') && !i.src.includes('icon')).slice(0, 6).forEach(i => console.log(`${i.rendered} nat:${i.natural} ${i.src.slice(0, 70)}`));
  await page.screenshot({ path: `${OUT}/home-certs.png`, fullPage: false });
  // screenshot just the cert section
  const certEl = await page.$('section[aria-labelledby="cert-title"]');
  if (certEl) await certEl.screenshot({ path: `${OUT}/home-cert-section.png` });

  // ── GALLERY ──
  await page.goto('http://localhost:3000/gallery', { waitUntil: 'networkidle', timeout: 60000 });
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 800) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 100)); } });
  await page.waitForTimeout(1500);
  const galleryImgs = await page.evaluate(() => {
    const wall = document.getElementById('frame-wall');
    const frames = wall ? Array.from(wall.querySelectorAll('img')).map(i => i.src.split('?')[0]) : [];
    const certs = Array.from(document.querySelectorAll('section[aria-labelledby="cert-title"] img')).map(i => ({ src: i.src.split('?')[0], nat: `${i.naturalWidth}x${i.naturalHeight}` }));
    const dup = frames.filter((f, i) => frames.indexOf(f) !== i);
    return { frameCount: frames.length, frames, duplicates: dup, certs };
  });
  console.log('\n=== GALLERY ===');
  console.log(JSON.stringify(galleryImgs, null, 2));
  await page.screenshot({ path: `${OUT}/gallery-full.png`, fullPage: true });

  // ── SERVICES (Shows) ──
  await page.goto('http://localhost:3000/services', { waitUntil: 'networkidle', timeout: 60000 });
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 800) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 100)); } });
  await page.waitForTimeout(1200);
  const svcImgs = await page.evaluate(() => Array.from(document.querySelectorAll('main img')).filter(i => i.naturalWidth > 100).map(img => {
    const r = img.getBoundingClientRect();
    const ratio = r.width / r.height, nat = img.naturalWidth / img.naturalHeight;
    return { src: (img.currentSrc || img.src).split('?')[0].slice(-40), rendered: `${Math.round(r.width)}x${Math.round(r.height)}`, natural: `${img.naturalWidth}x${img.naturalHeight}`, cropPct: Math.round(Math.abs(1 - ratio / nat) * 100) };
  }));
  console.log('\n=== SERVICES imgs (crop %) ===');
  svcImgs.forEach(i => console.log(`${i.cropPct}% crop | ${i.rendered} nat:${i.natural} | ${i.src}`));

  // ── MOBILE: cert section + menu ──
  const mp = await browser.newPage({ viewport: { width: 375, height: 812, deviceScaleFactor: 2 }, isMobile: true, hasTouch: true });
  await mp.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 60000 });
  await mp.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 800) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 100)); } });
  await mp.waitForTimeout(1000);
  const mOv = await mp.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth }));
  console.log('\n=== MOBILE overflow check ===', JSON.stringify(mOv), mOv.scrollW <= mOv.clientW ? 'OK' : 'OVERFLOW!');
  const certElM = await mp.$('section[aria-labelledby="cert-title"]');
  if (certElM) await certElM.screenshot({ path: `${OUT}/mobile-cert-section.png` });
  // menu tap test
  const ham = mp.locator('button[aria-label*="menu" i]').first();
  await ham.tap({ timeout: 5000 });
  await mp.waitForTimeout(800);
  const menuOpen = await mp.evaluate(() => !!document.querySelector('div.fixed.inset-0 button[aria-label="Close menu"]'));
  console.log('mobile menu opens on tap:', menuOpen);
  await mp.screenshot({ path: `${OUT}/mobile-menu.png` });

  await browser.close();
  console.log('\nDONE');
})().catch(e => { console.error('VERIFY FAILED:', e); process.exit(1); });
