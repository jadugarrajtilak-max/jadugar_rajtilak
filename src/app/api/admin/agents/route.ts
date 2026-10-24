import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminRequest, unauthorized } from "@/lib/guard";
import { AGENTS, nowIst } from "@/lib/agents/registry";
import { getLiveSkill } from "@/lib/agents/runner";
import { AUTO_PUBLISH_KEY, getAgentSetting } from "@/lib/agents/tasks";
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

    // AI Permission System — the approval queue. Every proposal that
    // would change the live site waits here for the owner's decision.
    // autoPublish is the owner's explicit standing permission (OFF by
    // default — "bina permission AI kuch nahi badlega").
    const autoPublish = (await getAgentSetting(AUTO_PUBLISH_KEY, "off")) === "on";
    const pendingApprovals = await db.agentApproval.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "asc" },
      take: 30,
    });
    const decidedApprovals = await db.agentApproval.findMany({
      where: { status: { not: "pending" } },
      orderBy: { decidedAt: "desc" },
      take: 12,
      select: { id: true, agentId: true, kind: true, title: true, status: true, decidedAt: true, createdAt: true },
    });
    const pendingDrafts = await db.blogPost.findMany({
      where: { status: "draft" },
      orderBy: { createdAt: "desc" },
      take: 25,
      select: { id: true, title: true, slug: true, category: true, createdAt: true, readingTime: true },
    });
    const publishedCount = await db.blogPost.count({ where: { status: "published" } });

    return NextResponse.json({
      ok: true,
      agents,
      backlinks,
      istNow: { hour, date },
      autoPublish,
      pendingApprovals,
      decidedApprovals,
      pendingDrafts,
      publishedCount,
    });
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

// ── PATCH /api/admin/agents ──
// Owner actions:
//   { approvalId, decision }         — approve / reject an AI proposal
//                                       (the AI Permission System gate)
//   { backlinkId, status }           — move a Rank pipeline task
//   { setting: "autopublish", value } — toggle the Blog Writer's standing
//                                        publish permission (default off)
//   { publishDraftId }               — legacy: publish one pending draft
const BL_STATUSES = new Set(["planned", "drafted", "submitted", "live", "skipped"]);

export async function PATCH(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const body = (await req.json().catch(() => null)) as
      | { approvalId?: string; decision?: string; backlinkId?: string; status?: string; setting?: string; value?: string; publishDraftId?: string }
      | null;
    if (!body) {
      return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
    }

    // 0. AI Permission System — approve or reject a pending proposal.
    //    Approving a blog.publish proposal publishes that post live;
    //    rejecting keeps the draft but closes the request (audit trail).
    if (body.approvalId) {
      const decision = body.decision === "approve" ? "approved" : body.decision === "reject" ? "rejected" : null;
      if (!decision) {
        return NextResponse.json({ ok: false, error: "decision must be approve or reject" }, { status: 422 });
      }
      const row = await db.agentApproval.findUnique({ where: { id: body.approvalId } });
      if (!row || row.status !== "pending") {
        return NextResponse.json({ ok: false, error: "Approval not found or already decided" }, { status: 404 });
      }
      let executed: string | null = null;
      if (decision === "approved") {
        if (row.kind === "blog.publish") {
          const payload = JSON.parse(row.payload || "{}") as { postId?: string; slug?: string };
          if (payload.postId) {
            const post = await db.blogPost.update({
              where: { id: payload.postId },
              data: { status: "published", publishedAt: new Date() },
              select: { slug: true },
            }).catch(() => null);
            if (post) executed = `published → /blog/${post.slug}`;
          }
        }
      }
      await db.agentApproval.update({
        where: { id: row.id },
        data: { status: decision, decidedAt: new Date(), decidedBy: "owner" },
      });
      return NextResponse.json({ ok: true, approval: { id: row.id, status: decision }, executed });
    }

    // 1. toggle an agent setting (the blog auto-publish permission)
    if (body.setting === "autopublish") {
      const value = body.value === "on" ? "on" : "off";
      await db.siteText.upsert({
        where: { key: AUTO_PUBLISH_KEY },
        create: { key: AUTO_PUBLISH_KEY, value },
        update: { value },
      });
      return NextResponse.json({ ok: true, setting: "autopublish", value });
    }

    // 2. legacy: publish a pending blog draft directly from Blog Studio
    if (body.publishDraftId) {
      const row = await db.blogPost.update({
        where: { id: body.publishDraftId },
        data: { status: "published", publishedAt: new Date() },
        select: { id: true, title: true, slug: true },
      }).catch(() => null);
      if (!row) {
        return NextResponse.json({ ok: false, error: "Draft not found" }, { status: 404 });
      }
      return NextResponse.json({ ok: true, published: row });
    }

    // 3. legacy: backlink pipeline status move
    if (!body.backlinkId || !body.status || !BL_STATUSES.has(body.status)) {
      return NextResponse.json({ ok: false, error: "Provide approvalId+decision, backlinkId+status, setting=autopublish, or publishDraftId" }, { status: 422 });
    }
    const row = await db.backlinkTask.update({
      where: { id: body.backlinkId },
      data: { status: body.status },
      select: { id: true, source: true, status: true },
    });
    return NextResponse.json({ ok: true, task: row });
  } catch {
    return NextResponse.json({ ok: false, error: "Update failed — check the request body" }, { status: 500 });
  }
}
