// Diagnose: block external requests, use domcontentloaded, capture failures.
const { chromium } = require("/home/z/.npm-global/lib/node_modules/playwright/node_modules/playwright-core");
const execPath = "/home/z/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome";

(async () => {
  const browser = await chromium.launch({
    executablePath: execPath,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  const failed = [];
  page.on("requestfailed", (r) => failed.push(r.url().slice(0, 80) + " :: " + (r.failure()?.errorText || "?")));
  page.on("console", (m) => { if (m.type() === "error") console.log("[console.error]", m.text().slice(0, 120)); });

  // Block all external (non-localhost) requests — sandbox has no reliable egress.
  await ctx.route("**/*", (route) => {
    const u = route.request().url();
    if (u.startsWith("http://127.0.0.1:3000") || u.startsWith("http://localhost:3000")) return route.continue();
    return route.abort();
  });

  try {
    const resp = await page.goto("http://127.0.0.1:3000", { waitUntil: "domcontentloaded", timeout: 30000 });
    console.log("status:", resp ? resp.status() : "null");
    await page.waitForTimeout(4000);
    console.log("Title:", await page.title());
    const h1 = await page.evaluate(() => document.querySelector("h1")?.textContent?.slice(0, 60));
    console.log("H1:", h1);
    const imgs = await page.evaluate(() => Array.from(document.images).slice(0, 6).map((i) => (i.currentSrc || i.src).slice(-40)));
    console.log("imgs:", imgs);
    console.log("failed (blocked externals are expected):", failed.filter((f) => !f.includes("googletag")).length);
  } catch (e) {
    console.log("FAILED:", e.message.slice(0, 300));
    console.log("request failures so far:", failed.slice(0, 8));
  }
  await browser.close().catch(() => process.exit(0));
})();
