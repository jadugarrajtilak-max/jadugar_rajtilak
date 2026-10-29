import { NextRequest, NextResponse } from "next/server";
import { runRankSweep } from "@/lib/rank-tracker";

export const dynamic = "force-dynamic";
// 19 keywords × (~1.2s fetch + 0.7s gap) ≈ 36s — inside the 60s Hobby
// cap with headroom. If it ever overruns, the cron simply retries the
// next day; each keyword row is written the moment it is checked.
export const maxDuration = 60;

// ── /api/cron/rank-track — daily organic position sweep ──
// Fired by Vercel Cron (06:15 UTC, after the agent runs at 05:00/05:30)
// and manually from Master Admin. Same auth as /api/agents/cron: a
// presented credential (x-scheduler-key OR Bearer) must equal
// AGENT_SCHEDULER_KEY or CRON_SECRET.
function isSchedulerAuthed(req: NextRequest): boolean {
  const keys = [process.env.AGENT_SCHEDULER_KEY, process.env.CRON_SECRET].filter(
    (k): k is string => Boolean(k)
  );
  if (!keys.length) return false;
  const header = req.headers.get("x-scheduler-key");
  const auth = req.headers.get("authorization");
  const bearer = auth?.replace(/^Bearer\s+/i, "");
  const presented = [header, bearer].filter(Boolean) as string[];
  return presented.some((p) => keys.includes(p));
}

async function handle(req: NextRequest) {
  if (!process.env.AGENT_SCHEDULER_KEY && !process.env.CRON_SECRET) {
    return NextResponse.json(
      { ok: false, error: "Scheduler not configured (set AGENT_SCHEDULER_KEY or CRON_SECRET)" },
      { status: 503 }
    );
  }
  if (!isSchedulerAuthed(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await runRankSweep();
    const ranked = results.filter((r) => r.position !== null);
    const summary = `${ranked.length}/${results.length} keywords in top-30 — best: ${
      ranked.length
        ? ranked
            .slice()
            .sort((a, b) => (a.position ?? 99) - (b.position ?? 99))
            .slice(0, 3)
            .map((r) => `#${r.position} ${r.keyword}`)
            .join(", ")
        : "none yet"
    }`;
    return NextResponse.json({ ok: true, checked: results.length, summary, results });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "rank sweep failed" },
      { status: 500 }
    );
  }
}

export { handle as GET, handle as POST };
