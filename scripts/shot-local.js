// Visual check — hero arch, honours strip, gallery certs
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1380, height: 900 } });

  // home hero
  await page.goto("http://localhost:3999/", { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "/home/z/my-project/scripts/shot-hero.png" });

  // honours strip
  const h = await page.$("#honours-title");
  if (h) await h.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "/home/z/my-project/scripts/shot-honours.png" });

  // gallery cert section
  await page.goto("http://localhost:3999/gallery", { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(2000);
  const c = await page.$("#certificates");
  if (c) await c.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "/home/z/my-project/scripts/shot-certs.png" });

  // mobile hero
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:3999/", { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "/home/z/my-project/scripts/shot-hero-mobile.png" });

  await browser.close();
  console.log("screenshots saved");
})().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
