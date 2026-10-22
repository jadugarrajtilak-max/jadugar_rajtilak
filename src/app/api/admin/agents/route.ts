import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminRequest, unauthorized } from "@/lib/guard";
import { AGENTS, nowIst } from "@/lib/agents/registry";
import { getLiveSkill } from "@/lib/agents/runner";
import { BASE_SKILL, skillKey, type AgentId } from "@/lib/agents/skills";

export const dynamic = "force-dynamic";

// ── GET /api/admin/agents — the full AI Agents control-room state ──
// NOTE: queries run SEQUENTIALLY on purpose — the Neon pooler URL caps
// the connection pool at 1 (serverless-friendly), so parallel
// Promise.all queries exhaust the pool and time out.
export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const { hour, date } = nowIst();

    // 1. counts for every agent in one grouped query
    const grouped = await db.agentRun.groupBy({
      by: ["agentId", "status"],
      _count: { _all: true },
    });
    const counts = new Map<string, { total: number; success: number }>();
    for (const g of grouped) {
      const cur = counts.get(g.agentId) ?? { total: 0, success: 0 };
      cur.total += g._count._all;
      if (g.status === "success") cur.success += g._count._all;
      counts.set(g.agentId, cur);
    }

    // 2. live skills in one query
    const skillRows = await db.siteText.findMany({
      where: { key: { in: AGENTS.map((a) => skillKey(a.id as AgentId)) } },
      select: { key: true, value: true },
    });
    const skillMap = new Map(skillRows.map((r) => [r.key, r.value]));

    // 3. per-agent last runs + recent log, sequentially
    const agents = [];
    for (const meta of AGENTS) {
      const id = meta.id as AgentId;
      const lastRun = await db.agentRun.findFirst({
        where: { agentId: id },
        orderBy: { startedAt: "desc" },
        select: { startedAt: true, status: true },
      });
      const lastSuccess = await db.agentRun.findFirst({
        where: { agentId: id, status: "success" },
        orderBy: { startedAt: "desc" },
        select: { startedAt: true },
      });
      const recentRuns = await db.agentRun.findMany({
        where: { agentId: id },
        orderBy: { startedAt: "desc" },
        take: 6,
        select: { id: true, status: true, trigger: true, summary: true, startedAt: true, finishedAt: true, output: true },
      });
      const skill = skillMap.get(skillKey(id)) ?? BASE_SKILL[id];
      const c = counts.get(id) ?? { total: 0, success: 0 };
      agents.push({
        ...meta,
        lastRunAt: lastRun?.startedAt ?? null,
        lastRunStatus: lastRun?.status ?? null,
        lastSuccessAt: lastSuccess?.startedAt ?? null,
        totalRuns: c.total,
        successRuns: c.success,
        isDueToday: hour >= meta.scheduleHour,
        skill,
        skillIsBase: skill === BASE_SKILL[id],
        recentRuns: recentRuns.map((r) => ({
          id: r.id,
          status: r.status,
          trigger: r.trigger,
          summary: r.summary,
          startedAt: r.startedAt,
          finishedAt: r.finishedAt,
          findings: safeParse(r.output),
        })),
      });
    }

    const backlinks = await db.backlinkTask.findMany({ orderBy: [{ week: "asc" }, { createdAt: "asc" }] });

    return NextResponse.json({ ok: true, agents, backlinks, istNow: { hour, date } });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Could not load agent state" },
      { status: 500 }
    );
  }
}

function safeParse(raw: string): { findings?: { check: string; status: string; detail: string; fix?: string }[]; details?: unknown } | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ── PATCH /api/admin/agents — update a backlink task status ──
const BL_STATUSES = new Set(["planned", "drafted", "submitted", "live", "skipped"]);

export async function PATCH(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const body = (await req.json().catch(() => null)) as { backlinkId?: string; status?: string } | null;
    if (!body?.backlinkId || !body.status || !BL_STATUSES.has(body.status)) {
      return NextResponse.json({ ok: false, error: "backlinkId and a valid status are required" }, { status: 422 });
    }
    const row = await db.backlinkTask.update({
      where: { id: body.backlinkId },
      data: { status: body.status },
      select: { id: true, source: true, status: true },
    });
    return NextResponse.json({ ok: true, task: row });
  } catch {
    return NextResponse.json({ ok: false, error: "Backlink task not found" }, { status: 404 });
  }
}
