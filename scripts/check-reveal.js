const { spawn } = require("child_process");
const CHROME = "/home/z/.cache/puppeteer/chrome/linux-155.0.8059.39/chrome-linux64/chrome";
const URL = process.argv[2] || "https://jadugarrajtilak.com/gallery";
const PORT = 9334;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const chrome = spawn(CHROME, ["--headless=new", "--no-sandbox", `--remote-debugging-port=${PORT}`, "--disable-dev-shm-usage", "--user-data-dir=/tmp/chrome-check", "--window-size=412,832", "about:blank"], { stdio: "ignore" });
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
  await send("Page.navigate", { url: URL });
  await sleep(5000);
  const out = await send("Runtime.evaluate", {
    expression: `(() => {
      // every img inside the frame-wall
      const wall = document.getElementById('frame-wall');
      const imgs = wall ? Array.from(wall.querySelectorAll('img')) : [];
      const rows = imgs.map(i => {
        // walk up ancestors to find an element with inline opacity style
        let el = i, op = '1', found = '';
        for (let k = 0; k < 6 && el; k++) {
          const cs = getComputedStyle(el);
          if (parseFloat(cs.opacity) < 1) { op = cs.opacity; found = el.tagName + '.' + String(el.className).slice(0,40); break; }
          el = el.parentElement;
        }
        const r = i.getBoundingClientRect();
        return i.src.split('/').pop().slice(0,32) + ' op=' + op + (found ? ' via ' + found : '') + ' top=' + Math.round(r.top);
      });
      return rows.join('\\n');
    })()`,
    returnByValue: true,
  });
  console.log(out.result?.result?.value);
  chrome.kill();
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
