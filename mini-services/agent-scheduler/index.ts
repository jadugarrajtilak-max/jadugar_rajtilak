// ─────────────────────────────────────────────────────────────────────
// Agent Scheduler (sandbox mini-service, port 3002)
// 24×7 heartbeat: every 30 minutes it pings the Next.js cron endpoint,
// which decides (IST schedule + last-run state) which agents are due
// and runs them. Auth via x-scheduler-key = AGENT_SCHEDULER_KEY.
// ─────────────────────────────────────────────────────────────────────

const PORT = 3002;
const APP = process.env.APP_URL || "http://localhost:3000";
const KEY = process.env.AGENT_SCHEDULER_KEY || "";

let lastResult = { at: "", status: "waiting", detail: "Scheduler started — first tick pending." };
let timer: ReturnType<typeof setTimeout> | null = null;

async function tick() {
  if (!KEY) {
    lastResult = { at: new Date().toISOString(), status: "misconfigured", detail: "AGENT_SCHEDULER_KEY missing — set it and restart." };
    return;
  }
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 240_000); // agent runs can take minutes
    const res = await fetch(`${APP}/api/agents/cron`, {
      headers: { "x-scheduler-key": KEY },
      signal: ctl.signal,
    });
    clearTimeout(t);
    const body = (await res.json().catch(() => ({}))) as { ran?: { agentId: string; ok: boolean }[] };
    const ran = body.ran ?? [];
    lastResult = {
      at: new Date().toISOString(),
      status: res.ok ? "ok" : `http ${res.status}`,
      detail: ran.length ? `Ran: ${ran.map((r) => `${r.agentId}${r.ok ? "✓" : "✗"}`).join(", ")}` : "Nothing due this tick.",
    };
    console.log(`[scheduler] ${lastResult.at} → ${lastResult.status} — ${lastResult.detail}`);
  } catch (e) {
    lastResult = {
      at: new Date().toISOString(),
      status: "error",
      detail: e instanceof Error ? e.message.slice(0, 160) : "network failure",
    };
    console.error("[scheduler] tick failed:", lastResult.detail);
  }
}

function schedule() {
  timer = setTimeout(async () => {
    await tick();
    schedule();
  }, 30 * 60 * 1000); // every 30 minutes
}

// simple status endpoint (port health check)
Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/status") {
      return Response.json({ ok: true, service: "agent-scheduler", port: PORT, ...lastResult });
    }
    if (url.pathname === "/force" && req.method === "POST") {
      await tick();
      return Response.json({ ok: true, ...lastResult });
    }
    return new Response("agent-scheduler\nGET /status · POST /force\n", { status: 200 });
  },
});

console.log(`[scheduler] listening on :${PORT}, app=${APP}, key=${KEY ? "set" : "MISSING"}`);
// first tick shortly after boot (app warm-up)
setTimeout(tick, 20_000);
schedule();
