// Functional smoke test: server + headless chromium in one session.
// Verifies home renders, SPA navigation works, lazy chunks load,
// and SSR HTML for deep links contains the right <title> (SEO).
const { execSync, spawn } = require("node:child_process");
const { chromium } = require("/home/z/.npm-global/lib/node_modules/playwright/node_modules/playwright-core");

(async () => {
  const server = spawn("bun", ["/home/z/my-project/.next/standalone/server.js"], {
    cwd: "/home/z/my-project",
    env: { ...process.env, NODE_ENV: "production" },
    stdio: "ignore",
  });
  await new Promise((res) => {
    const iv = setInterval(() => {
      fetch("http://127.0.0.1:3000", { method: "HEAD" })
        .then(() => { clearInterval(iv); res(); })
        .catch(() => {});
    }, 300);
    setTimeout(res, 15000);
  });

  const browser = await chromium.launch({
    executablePath: "/home/z/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 120)));
  await ctx.route("**/*", (route) => {
    const u = route.request().url();
    if (u.startsWith("http://127.0.0.1:3000")) return route.continue();
    return route.abort(); // block externals (gtag) — sandbox egress unreliable
  });

  const out = {};
  try {
    // 1. Home page render
    await page.goto("http://127.0.0.1:3000", { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2500);
    out.homeTitle = await page.title();
    out.homeH1 = await page.evaluate(() => document.querySelector("h1")?.textContent?.slice(0, 70));
    out.heroImg = await page.evaluate(() => {
      const i = document.querySelector("img[fetchpriority], img[fetchPriority]");
      return i ? (i.currentSrc || i.src).slice(-45) : "NO HERO IMG";
    });
    out.sectionCount = await page.evaluate(() => document.querySelectorAll("main section").length);

    // 2. SSR deep-link SEO (curl for raw HTML)
    for (const p of ["/about", "/contact", "/services"]) {
      const html = execSync(`curl -s http://127.0.0.1:3000${p} --max-time 10`).toString();
      const t = html.match(/<title>([^<]*)<\/title>/);
      out[`ssr${p}`] = t ? t[1].slice(0, 60) : "NO TITLE";
    }

    // 3. SPA navigation: click Contact in navbar (nav items are <button>)
    const contactLink = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("header button, nav button, header ul button"));
      const b = btns.find((x) => (x.textContent || "").toLowerCase().includes("contact"));
      if (b) { b.scrollIntoView({ block: "center" }); const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }
      return null;
    });
    if (contactLink) {
      await page.mouse.click(contactLink.x, contactLink.y);
      await page.waitForTimeout(3500);
      out.spaTitle = await page.title();
      out.spaUrl = page.url();
      out.contactVisible = await page.evaluate(() => document.body.innerText.slice(0, 400).toLowerCase().includes("contact") || document.body.innerText.slice(0, 400).toLowerCase().includes("message"));
    }

    // 4. Reveal animations applied
    out.revealCount = await page.evaluate(() => document.querySelectorAll(".jr-reveal").length);
    out.revealVisible = await page.evaluate(() => document.querySelectorAll(".jr-reveal.is-visible").length);

    out.pageErrors = errors.slice(0, 4);
  } catch (e) {
    out.FATAL = String(e).slice(0, 250);
  }
  console.log(JSON.stringify(out, null, 1));
  await browser.close().catch(() => {});
  server.kill();
  process.exit(0);
})();
