const { spawn } = require("child_process");
const CHROME = "/home/z/.cache/puppeteer/chrome/linux-155.0.8059.39/chrome-linux64/chrome";
const PORT = 9335;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const chrome = spawn(CHROME, ["--headless=new", "--no-sandbox", `--remote-debugging-port=${PORT}`, "--disable-dev-shm-usage", "--user-data-dir=/tmp/chrome-check2", "--window-size=412,832", "about:blank"], { stdio: "ignore" });
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
  await sleep(5000);
  // scroll so the FIRST photo card is well inside the viewport
  await send("Runtime.evaluate", { expression: "window.scrollTo(0, 1750)" });
  await sleep(1500);
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
  console.log("AFTER SCROLL TO 1750:\n" + out.result?.result?.value);
  chrome.kill();
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
