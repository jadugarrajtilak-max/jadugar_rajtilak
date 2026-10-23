// DOM-verify: about certificate card text + gallery frames + services frames
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

  // About — certificate card
  await page.goto('http://localhost:3000/about', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2500);
  const about = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img')).map((i) => ({
      src: (i.currentSrc || i.src).replace('http://localhost:3000', ''),
      rect: { w: Math.round(i.getBoundingClientRect().width), h: Math.round(i.getBoundingClientRect().height) },
    }));
    const fig = Array.from(document.querySelectorAll('figure')).find((f) =>
      f.textContent.includes('LG') || f.querySelector('img[src*="certificate"]')
    );
    return {
      certCardText: fig ? fig.textContent.replace(/\s+/g, ' ').slice(0, 150) : 'NOT FOUND',
      imgs: imgs.filter((i) => i.src.includes('rajtilak')),
    };
  });
  console.log('ABOUT cert card:', JSON.stringify(about, null, 1));

  // Gallery — frames
  await page.goto('http://localhost:3000/gallery', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2500);
  const gallery = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('#frame-wall img')).map((i) => ({
      src: (i.currentSrc || i.src).replace('http://localhost:3000', ''),
      w: Math.round(i.getBoundingClientRect().width),
      h: Math.round(i.getBoundingClientRect().height),
      natural: `${i.naturalWidth}x${i.naturalHeight}`,
      ok: i.complete && i.naturalWidth > 0,
    }));
    const captions = Array.from(document.querySelectorAll('#frame-wall figure')).map((f) =>
      f.textContent.replace(/\s+/g, ' ').slice(0, 60)
    );
    return { count: imgs.length, imgs, captions };
  });
  console.log('GALLERY:', JSON.stringify(gallery, null, 1));

  // Services — photo frames + ratios
  await page.goto('http://localhost:3000/services', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2500);
  const services = await page.evaluate(() => {
    const out = [];
    for (const sec of document.querySelectorAll('section[id]')) {
      const img = sec.querySelector('img');
      if (!img) continue;
      const r = img.getBoundingClientRect();
      out.push({
        id: sec.id,
        src: (img.currentSrc || img.src).replace('http://localhost:3000', ''),
        frame: `${Math.round(r.width)}x${Math.round(r.height)}`,
        natural: `${img.naturalWidth}x${img.naturalHeight}`,
        ok: img.complete && img.naturalWidth > 0,
      });
    }
    return out;
  });
  console.log('SERVICES:', JSON.stringify(services, null, 1));

  // Home — story + reel + trust
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2500);
  const home = await page.evaluate(() => {
    const trust = document.querySelector('section[aria-label="Trust indicators"]');
    const story = document.querySelector('img[alt*="confetti"]');
    const reel = document.querySelector('img[alt*="microphone"]');
    const r = (el) => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { w: Math.round(b.width), h: Math.round(b.height), ok: el.complete && el.naturalWidth > 0 };
    };
    return {
      trustText: trust ? trust.textContent.replace(/\s+/g, ' ').slice(0, 120) : 'NOT FOUND',
      story: r(story),
      reel: r(reel),
    };
  });
  console.log('HOME:', JSON.stringify(home, null, 1));

  await browser.close();
})();
