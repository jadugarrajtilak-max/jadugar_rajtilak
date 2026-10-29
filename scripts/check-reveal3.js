const { spawn } = require("child_process");
const CHROME = "/home/z/.cache/puppeteer/chrome/linux-155.0.8059.39/chrome-linux64/chrome";
const PORT = 9337;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const chrome = spawn(CHROME, ["--headless=new", "--no-sandbox", `--remote-debugging-port=${PORT}`, "--disable-dev-shm-usage", "--user-data-dir=/tmp/chrome-check4", "--window-size=412,832", "about:blank"], { stdio: "ignore" });
  await sleep(1500);
  const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const page = list.find((t) => t.type === "page");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => { ws.onopen = r; });
  let msgId = 0;
  const pending = new Map();
  const errors = [];
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
    if (msg.method === "Runtime.exceptionThrown") errors.push(msg.params?.exceptionDetails?.text ?? "exception");
    if (msg.method === "Log.entryAdded" && msg.params?.entry?.level === "error") errors.push(String(msg.params?.entry?.text ?? "").slice(0, 140));
  };
  const send = (method, params = {}) =>
    new Promise((resolve) => { const id = ++msgId; pending.set(id, resolve); ws.send(JSON.stringify({ id, method, params })); });
  await send("Runtime.enable");
  await send("Log.enable");
  await send("Page.enable");
  await send("Page.navigate", { url: "https://jadugarrajtilak.com/gallery" });
  await sleep(5000);
  for (let y = 700; y <= 2800; y += 300) {
    await send("Runtime.evaluate", { expression: `window.scrollTo(0, ${y})` });
    await sleep(400);
  }
  await sleep(2000);
  const out = await send("Runtime.evaluate", {
    expression: `(() => {
      const imgs = Array.from(document.querySelectorAll('#frame-wall img'));
      return 'scrollY=' + Math.round(window.scrollY) + '\\n' + imgs.map(i => {
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
  console.log(out.result?.result?.value);
  console.log("JS ERRORS:", errors.length ? errors.slice(0, 5) : "none");
  chrome.kill();
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
