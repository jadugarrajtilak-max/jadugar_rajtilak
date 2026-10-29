// Scroll through the gallery page progressively (viewport by viewport),
// waiting for lazy images to load, then screenshot the photo-grid area.
const { spawn } = require("child_process");

const CHROME = "/home/z/.cache/puppeteer/chrome/linux-155.0.8059.39/chrome-linux64/chrome";
const URL = process.argv[2] || "https://jadugarrajtilak.com/gallery";
const PORT = 9333;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const chrome = spawn(CHROME, [
    "--headless=new", "--no-sandbox", `--remote-debugging-port=${PORT}`,
    "--disable-dev-shm-usage", "--user-data-dir=/tmp/chrome-scroll", "--window-size=412,832",
    "about:blank",
  ], { stdio: "ignore" });
  await sleep(1500);

  const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const page = list.find((t) => t.type === "page");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => { ws.onopen = r; });

  let msgId = 0;
  const pending = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  };
  const send = (method, params = {}) =>
    new Promise((resolve) => { const id = ++msgId; pending.set(id, resolve); ws.send(JSON.stringify({ id, method, params })); });

  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 412, height: 832, deviceScaleFactor: 1, mobile: true });
  await send("Page.navigate", { url: URL });
  await sleep(4000);

  // progressive scroll to trigger every lazy image
  for (let i = 0; i < 14; i++) {
    await send("Runtime.evaluate", { expression: `window.scrollBy(0, 700)` });
    await sleep(350);
  }
  await sleep(2500);

  // check image states
  const stats = await send("Runtime.evaluate", {
    expression: `JSON.stringify({
      total: document.images.length,
      loaded: Array.from(document.images).filter(i => i.complete && i.naturalWidth > 0).length,
      blank: Array.from(document.images).filter(i => i.complete && i.naturalWidth === 0).map(i => i.src.split('/').pop()).slice(0, 8),
      pending: Array.from(document.images).filter(i => !i.complete).map(i => i.src.split('/').pop()).slice(0, 8),
      scrollY: Math.round(window.scrollY),
      docH: document.body.scrollHeight
    })`,
    returnByValue: true,
  });
  console.log("IMAGE STATS:", stats.result?.result?.value);

  // screenshot at the photo grid area (scroll back to it)
  await send("Runtime.evaluate", { expression: `document.getElementById('frame-wall')?.scrollIntoView()` });
  await sleep(3500);
  const shot = await send("Page.captureScreenshot", { format: "png" });
  require("fs").writeFileSync("/tmp/gallery-viewport.png", Buffer.from(shot.result.data, "base64"));
  console.log("screenshot saved: /tmp/gallery-viewport.png");

  chrome.kill();
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
