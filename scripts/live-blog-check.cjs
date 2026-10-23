// Blog-specific live check: index cards + open article + featured images
const { chromium } = require('/home/z/.npm-global/lib/node_modules/playwright');
const BASE = 'https://jadugarrajtilak.com';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  await page.goto(`${BASE}/blog`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(4000);
  const index = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('article.cursor-pointer'));
    const imgs = Array.from(document.querySelectorAll('img'));
    return {
      cardCount: cards.length,
      cardTitles: cards.slice(0, 12).map((c) => (c.querySelector('h2, h3')?.textContent || '').trim().slice(0, 45)),
      brokenImgs: imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src.split('/').pop()),
      imgSrcs: imgs.map((i) => i.src.split('/').pop()),
    };
  });
  console.log('BLOG INDEX:', JSON.stringify(index, null, 1));

  // open the first card
  await page.click('article.cursor-pointer');
  await page.waitForTimeout(3000);
  const article = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const hero = document.querySelector('article img');
    return {
      url: location.pathname,
      h1: h1 ? h1.textContent.slice(0, 60) : null,
      title: document.title.slice(0, 60),
      heroImg: hero ? { src: hero.src.split('/').pop(), ok: hero.complete && hero.naturalWidth > 0 } : null,
    };
  });
  console.log('ARTICLE:', JSON.stringify(article, null, 1));

  // deep link direct
  await page.goto(`${BASE}/blog/magician-in-jaipur`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);
  const deep = await page.evaluate(() => {
    const hero = document.querySelector('article img');
    return {
      url: location.pathname,
      h1: document.querySelector('h1')?.textContent.slice(0, 60),
      heroImg: hero ? { src: hero.src.split('/').pop(), ok: hero.complete && hero.naturalWidth > 0 } : null,
    };
  });
  console.log('DEEP LINK:', JSON.stringify(deep, null, 1));

  await browser.close();
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
