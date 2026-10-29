// Production verification: reel embed, mobile experience, honours, gallery
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();

  // ── desktop: reel click-to-load ──
  const page = await browser.newPage({ viewport: { width: 1380, height: 900 } });
  await page.goto("https://jadugarrajtilak.com/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2500);

  const playBtn = await page.$('button[aria-label="Play the official Instagram reel"]');
  if (playBtn) {
    await playBtn.scrollIntoViewIfNeeded();
    await playBtn.click();
    await page.waitForTimeout(6000); // give the Instagram embed time to load
    const embed = await page.evaluate(() => {
      const iframe = document.querySelector("#reel iframe");
      return { iframeSrc: iframe?.getAttribute("src") ?? null, loaded: !!iframe };
    });
    console.log("REEL EMBED:", JSON.stringify(embed));
  } else {
    console.log("REEL EMBED: play button not found");
  }

  // gallery live check
  await page.goto("https://jadugarrajtilak.com/gallery", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2500);
  const gallery = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll("img")).map((i) => i.getAttribute("src") || "");
    return {
      newPhotos: imgs.filter((s) => s.includes("gallery-")).length,
      certs: imgs.filter((s) => s.includes("certificate-")).length,
      oldPhotos: imgs.filter((s) => /portrait-magician|gallery-closeup|gallery-corporate\.jpg|felicitation\.jpg/.test(s)).length,
      certSection: !!document.getElementById("certificates"),
    };
  });
  console.log("LIVE GALLERY:", JSON.stringify(gallery));

  // admin gate on production
  await page.goto("https://jadugarrajtilak.com/admin", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2000);
  const adminGate = await page.evaluate(() => ({
    hasLogin: !!document.querySelector('input[type="password"]'),
    noPasswordShown: !document.body.innerText.includes("Rajtilak@2026"),
  }));
  console.log("ADMIN GATE:", JSON.stringify(adminGate));

  // ── mobile experience on production ──
  const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await m.goto("https://jadugarrajtilak.com/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await m.waitForTimeout(2500);
  const mobileHome = await m.evaluate(() => {
    const heroImg = document.querySelector("section img[fetchpriority='high'], section img[fetchPriority='high']");
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      heroLoaded: heroImg && heroImg.complete && heroImg.naturalWidth > 0,
      heroSrc: heroImg?.getAttribute("src"),
    };
  });
  console.log("MOBILE HOME:", JSON.stringify(mobileHome));
  await m.screenshot({ path: "/home/z/my-project/scripts/shot-live-mobile.png" });

  await m.goto("https://jadugarrajtilak.com/gallery", { waitUntil: "domcontentloaded", timeout: 60000 });
  await m.waitForTimeout(2500);
  const mobileGallery = await m.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  console.log("MOBILE GALLERY:", JSON.stringify(mobileGallery));

  // ── desktop page weight sanity ──
  const assets = await page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll("img"));
    let total = 0;
    for (const i of imgs) {
      const src = i.getAttribute("src") || "";
      if (!src.startsWith("/images/")) continue;
      try {
        const r = await fetch(src, { method: "HEAD" });
        const len = parseInt(r.headers.get("content-length") || "0");
        total += len;
      } catch {}
    }
    return { imageCount: imgs.length, totalImageKB: Math.round(total / 1024) };
  });
  console.log("GALLERY PAGE IMAGE WEIGHT:", JSON.stringify(assets));

  await browser.close();
  console.log("PRODUCTION VERIFICATION DONE");
})().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
