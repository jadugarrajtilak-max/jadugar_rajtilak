// Local headless verification of the gallery + home views
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1380, height: 900 } });

  // ── Gallery view ──
  await page.goto("http://localhost:3999/gallery", { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(1800); // let lazy views + customization load

  const gallery = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll("img")).map((i) => i.getAttribute("src"));
    const certSection = document.getElementById("certificates");
    return {
      title: document.title,
      photoWall: imgs.filter((s) => s && s.includes("gallery-")),
      certs: imgs.filter((s) => s && s.includes("certificate-")),
      certSectionExists: !!certSection,
      certSectionText: certSection ? certSection.textContent.slice(0, 120) : null,
      filterChips: Array.from(document.querySelectorAll('[aria-label="Filter gallery"] button')).map((b) => b.textContent.trim()),
      oldImages: imgs.filter((s) => s && /portrait-magician|gallery-closeup|gallery-corporate|felicitation\.jpg|gallery-crystal\.jpg/.test(s)),
    };
  });
  console.log("GALLERY:", JSON.stringify(gallery, null, 2));

  // click a certificate → lightbox opens
  await page.click('#certificates button[aria-label^="View certificate"]', { timeout: 10000 }).catch((e) => console.log("cert click skipped:", e.message));
  await page.waitForTimeout(900);
  const lightbox = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]');
    return dlg ? { open: true, hasImg: !!dlg.querySelector("img") } : { open: false };
  });
  console.log("CERT LIGHTBOX:", JSON.stringify(lightbox));
  await page.keyboard.press("Escape");

  // ── Home view ──
  await page.goto("http://localhost:3999/", { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(1500);
  const home = await page.evaluate(() => {
    const honours = document.getElementById("honours-title");
    const heroImg = document.querySelector("section img[fetchpriority='high'], section img[fetchPriority='high']");
    const reelSection = document.getElementById("reel");
    return {
      honoursTitle: honours ? honours.textContent : null,
      heroSrc: heroImg ? heroImg.getAttribute("src") : null,
      heroObjectFit: heroImg ? getComputedStyle(heroImg).objectFit : null,
      reelEmbed: reelSection ? ( reelSection.querySelector("iframe") ? reelSection.querySelector("iframe").src : "poster-only (click to load)" ) : null,
      certImgsOnHome: Array.from(document.querySelectorAll("img")).filter((i) => (i.getAttribute("src") || "").includes("certificate-")).length,
    };
  });
  console.log("HOME:", JSON.stringify(home, null, 2));

  // ── Mobile viewport check (no horizontal overflow) ──
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(800);
  const mobile = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  console.log("MOBILE HOME:", JSON.stringify(mobile));

  await page.goto("http://localhost:3999/gallery", { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(1500);
  const mobileGallery = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  console.log("MOBILE GALLERY:", JSON.stringify(mobileGallery));

  await browser.close();
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
