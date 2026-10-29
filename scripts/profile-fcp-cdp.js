// Profile main-thread tasks to FCP via raw CDP (no puppeteer needed).
// Launches Chrome headless, opens the page, collects a CPU profile +
// long tasks, prints the heaviest functions before first paint.
const { spawn } = require("child_process");
const fs = require("fs");

const CHROME = "/home/z/.cache/puppeteer/chrome/linux-155.0.8059.39/chrome-linux64/chrome";
const URL = process.argv[2] || "http://127.0.0.1:3100";
const PORT = 9222;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const chrome = spawn(CHROME, [
    "--headless=new",
    "--no-sandbox",
    `--remote-debugging-port=${PORT}`,
    "--disable-dev-shm-usage",
    "--user-data-dir=/tmp/chrome-prof",
    "about:blank",
  ], { stdio: "ignore" });
  await sleep(1500);

  const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const page = list.find((t) => t.type === "page");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => { ws.onopen = r; });

  let msgId = 0;
  const pending = new Map();
  const events = [];
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    } else if (msg.method) {
      events.push(msg);
    }
  };
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const id = ++msgId;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });

  await send("Profiler.enable");
  await send("Profiler.setSamplingInterval", { interval: 500 });
  await send("Profiler.start");
  const t0 = Date.now();
  await send("Page.enable");
  await send("Page.navigate", { url: URL });
  await sleep(6000); // let it fully load
  const { profile } = await send("Profiler.stop");

  // FCP from performance entries
  const fcp = await send("Runtime.evaluate", {
    expression: `performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? -1`,
    returnByValue: true,
  });

  chrome.kill();
  try { fs.rmSync("/tmp/chrome-prof", { recursive: true, force: true }); } catch {}

  const fcpMs = Math.round(fcp.result?.value ?? -1);
  console.log("FCP:", fcpMs, "ms");

  // total time axis: profile starts at t0 (before navigation)
  const nodes = new Map();
  for (const n of profile.nodes) nodes.set(n.id, n);
  // compute per-node self time BEFORE FCP only
  const timeOrigin = (fcpMs > 0 ? fcpMs : 4000) + (Date.now() - t0 - 6000 - fcpMs) - (Date.now() - t0 - 6000 - fcpMs);
  let elapsed = 0;
  const selfTime = new Map();
  for (let i = 0; i < profile.samples.length; i++) {
    elapsed += profile.timeDeltas[i] ?? 0;
    const id = profile.samples[i];
    selfTime.set(id, (selfTime.get(id) ?? 0) + (profile.timeDeltas[i] ?? 0));
  }
  const top = [...selfTime.entries()].sort((a, b) => b[1] - a[1]).slice(0, 16);
  console.log("\nTop self-time functions (whole load):");
  for (const [id, us] of top) {
    const f = nodes.get(id)?.callFrame ?? {};
    const fn = (f.functionName || "(anonymous)").slice(0, 48);
    const url = (f.url || "").replace(/^https?:\/\/[^/]+/, "").slice(0, 64);
    console.log(" ", String(Math.round(us / 1000)).padStart(5) + "ms", fn.padEnd(48), url);
  }
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
