// Profile the main-thread tasks between navigation and first paint,
// with the source script URL for each task, to find what blocks FCP.
const puppeteer = require("/home/z/my-project/node_modules/puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 640, isMobile: true, deviceScaleFactor: 2 });

  const tasks = [];
  const fcp = await new Promise((resolve) => {
    page.on("metrics", (m) => {
      if (m.title === "FirstContentfulPaint") resolve(m.metrics.LayoutDuration !== undefined ? Date.now() : Date.now());
    });
  });

  // Collect top-level tasks via CDP
  const client = await page.target().createCDPSession();
  await client.send("Profiler.enable");
  await client.send("Profiler.setSamplingInterval", { interval: 1000 });
  await client.send("Profiler.start");

  const perf = await page.evaluate(() => {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const e of entries) {
          if (e.name === "first-contentful-paint") {
            resolve({ fcp: e.startTime });
          }
        }
      }).observe({ type: "paint", buffered: true });
    });
  });

  const { profile } = await client.send("Profiler.stop");
  await browser.close();

  // find heavy functions
  const nodes = new Map();
  for (const n of profile.nodes) nodes.set(n.id, n);
  const selfTime = new Map();
  // samples: stack of node ids per sample
  const { samples, timeDeltas } = profile;
  for (let i = 0; i < samples.length; i++) {
    const id = samples[i];
    selfTime.set(id, (selfTime.get(id) ?? 0) + (timeDeltas[i] ?? 0));
  }
  const top = [...selfTime.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 14)
    .map(([id, us]) => {
      const n = nodes.get(id);
      const f = n?.callFrame ?? {};
      return {
        fn: (f.functionName || "(anonymous)").slice(0, 46),
        url: (f.url || "").replace(/^https?:\/\/[^/]+/, "").slice(0, 60),
        ms: Math.round(us / 1000),
      };
    });
  console.log("OBSERVED FCP:", Math.round(perf.fcp), "ms");
  console.log("top self-time functions (whole page load):");
  for (const t of top) console.log(" ", String(t.ms).padStart(5) + "ms", t.fn.padEnd(46), t.url);
})().catch((e) => { console.error(e); process.exit(1); });
