import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, unauthorized, rateLimit, clientIp } from "@/lib/guard";
import { runAgent, isAgentId, hasStaleRunning } from "@/lib/agents/runner";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ── POST /api/admin/agents/run — run one agent now ──
// Auth: Master Admin session OR the scheduler key (mini-service / cron).
export async function POST(req: NextRequest) {
  if (!isAdminRequest(req) && !isSchedulerRequest(req)) return unauthorized();
  if (!rateLimit(clientIp(req), 20, 10 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: "Too many agent runs — slow down." }, { status: 429 });
  }
  try {
    const body = (await req.json().catch(() => null)) as { agentId?: string; trigger?: string } | null;
    const agentId = body?.agentId ?? "";
    const trigger = body?.trigger === "scheduler" || body?.trigger === "cron" ? body.trigger : "manual";
    if (!isAgentId(agentId)) {
      return NextResponse.json({ ok: false, error: "Unknown agent — expected manager | rank | seo | bugfix | blog" }, { status: 422 });
    }
    if (await hasStaleRunning(agentId)) {
      return NextResponse.json({ ok: false, error: "This agent is already running (started < 30 min ago)." }, { status: 409 });
    }
    const outcome = await runAgent(agentId, trigger);
    return NextResponse.json(outcome, { status: outcome.ok ? 200 : 500 });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Agent run failed" },
      { status: 500 }
    );
  }
}

export function isSchedulerRequest(req: NextRequest): boolean {
  // Accepts AGENT_SCHEDULER_KEY or CRON_SECRET (either value, header or Bearer)
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
