import { NextRequest, NextResponse } from "next/server";
import { runAgent, dueAgents, isAgentId, hasStaleRunning } from "@/lib/agents/runner";

export const dynamic = "force-dynamic";
// 60s keeps this valid on every Vercel plan (Hobby caps functions at 60s).
// The sequential runner stops at the 50s mark so the response always
// ships; anything left over is picked up by the next scheduled tick.
export const maxDuration = 60;

// ── /api/agents/cron — scheduled entry point ──
// Fired by Vercel Cron (Authorization: Bearer CRON_SECRET) and by the
// workspace mini-service (x-scheduler-key). Decides which agents are due
// (IST schedule) and runs them sequentially within the time budget.
// AUTH: a presented credential (x-scheduler-key value OR Bearer token) is
// accepted if it equals AGENT_SCHEDULER_KEY OR CRON_SECRET. This covers every
// owner setup: only AGENT_SCHEDULER_KEY set, only CRON_SECRET set (Vercel
// auto-sends "Authorization: Bearer $CRON_SECRET" on cron invocations), or
// both set to different values.
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
    return NextResponse.json({ ok: false, error: "Scheduler not configured (set AGENT_SCHEDULER_KEY or CRON_SECRET)" }, { status: 503 });
  }
  if (!isSchedulerAuthed(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized scheduler call" }, { status: 401 });
  }

  const force = req.nextUrl.searchParams.get("agent");
  const results: { agentId: string; ok: boolean; summary: string }[] = [];
  const startedAt = Date.now();
  const BUDGET_MS = 50_000;

  try {
    const queue =
      force && isAgentId(force)
        ? [force]
        : // priority order: blog first (daily content), then health, seo,
          // rank, and the manager LAST so its report covers everyone.
          (await dueAgents()).sort(
            (a, b) => ({ blog: 0, bugfix: 1, seo: 2, rank: 3, manager: 4 })[a]! - ({ blog: 0, bugfix: 1, seo: 2, rank: 3, manager: 4 })[b]!
          );

    let deferred: string[] = [];
    for (const id of queue) {
      if (Date.now() - startedAt > BUDGET_MS) {
        deferred.push(id);
        continue;
      }
      if (await hasStaleRunning(id)) continue;
      const r = await runAgent(id, "cron");
      results.push({ agentId: r.agentId, ok: r.ok, summary: r.summary.slice(0, 200) });
    }

    return NextResponse.json({
      ok: true,
      ran: results,
      deferred: deferred.length ? `picked up next tick: ${deferred.join(", ")}` : null,
      ranAt: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Scheduler failure", ran: results },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}
