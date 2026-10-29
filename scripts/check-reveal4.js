const { spawn } = require("child_process");
const CHROME = "/home/z/.cache/puppeteer/chrome/linux-155.0.8059.39/chrome-linux64/chrome";
const PORT = 9338;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const chrome = spawn(CHROME, ["--headless=new", "--no-sandbox", `--remote-debugging-port=${PORT}`, "--disable-dev-shm-usage", "--user-data-dir=/tmp/chrome-check5", "--window-size=412,832", "about:blank"], { stdio: "ignore" });
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
  await send("Page.navigate", { url: "https://jadugarrajtilak.com/gallery" });
  await sleep(6000); // let everything settle first
  // INSTANT jump to the photo wall
  await send("Runtime.evaluate", { expression: `window.scrollTo(0, 2000)` });
  await sleep(3000); // long wait for IO + transition + any reflow
  const out = await send("Runtime.evaluate", {
    expression: `(() => {
      const imgs = Array.from(document.querySelectorAll('#frame-wall img'));
      return imgs.map(i => {
        let el = i, op = '1';
        for (let k = 0; k < 6 && el; k++) {
          const cs = getComputedStyle(el);
          if (parseFloat(cs.opacity) < 1) { op = cs.opacity; break; }
          el = el.parentElement;
        }
        return i.src.split('/').pop().slice(0,30) + ' op=' + op + ' top=' + Math.round(i.getBoundingClientRect().top);
      }).join('\\n');
    })()`,
    returnByValue: true,
  });
  console.log("AFTER INSTANT JUMP TO 2000 (+3s wait):");
  console.log(out.result?.result?.value);
  const shot = await send("Page.captureScreenshot", { format: "png" });
  require("fs").writeFileSync("/tmp/gallery-jump.png", Buffer.from(shot.result.data, "base64"));
  chrome.kill();
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
