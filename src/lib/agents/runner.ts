// ─────────────────────────────────────────────────────────────────────
// Agent runner — executes a task, logs the run, and appends the
// run's learning to the agent's LIVE skill (self-improvement loop).
// ─────────────────────────────────────────────────────────────────────
import { db } from "@/lib/db";
import { AGENT_IDS, BASE_SKILL, skillKey, type AgentId } from "./skills";
import { runTask } from "./tasks";
import { AGENTS, nowIst } from "./registry";

export type RunOutcome = {
  ok: boolean;
  agentId: AgentId;
  runId: string;
  summary: string;
};

export function isAgentId(v: string): v is AgentId {
  return (AGENT_IDS as readonly string[]).includes(v);
}

// Live skill = base playbook + accumulated learnings (SiteText row).
export async function getLiveSkill(agentId: AgentId): Promise<string> {
  try {
    const row = await db.siteText.findUnique({ where: { key: skillKey(agentId) }, select: { value: true } });
    return row?.value ?? BASE_SKILL[agentId];
  } catch {
    return BASE_SKILL[agentId];
  }
}

async function appendLearning(agentId: AgentId, learning: string): Promise<void> {
  if (!learning.trim()) return;
  try {
    const key = skillKey(agentId);
    const current = await getLiveSkill(agentId);
    // cap the log at the last 60 learnings to stay readable
    const parts = current.split("\n");
    const learnIdx = parts.findIndex((l) => l.startsWith("## Learnings log"));
    const base = learnIdx >= 0 ? parts.slice(0, learnIdx + 2).join("\n") : current;
    const existing = learnIdx >= 0 ? parts.slice(learnIdx + 2).join("\n") : "";
    const existingLines = existing.split("\n").filter((l) => l.trim().startsWith("- "));
    const next = [...existingLines, `- ${learning.trim()}`].slice(-60).join("\n");
    const merged = `${base}\n${next}\n`;
    await db.siteText.upsert({
      where: { key },
      create: { key, value: merged },
      update: { value: merged },
    });
  } catch (e) {
    console.error("[agents] appendLearning failed:", e instanceof Error ? e.message : e);
  }
}

/** Run one agent now (manual or scheduled). Never throws. */
export async function runAgent(agentId: AgentId, trigger: "manual" | "scheduler" | "cron"): Promise<RunOutcome> {
  const run = await db.agentRun.create({
    data: { agentId, status: "running", trigger },
    select: { id: true },
  });
  try {
    const result = await runTask(agentId, trigger);
    await db.agentRun.update({
      where: { id: run.id },
      data: {
        status: result.ok ? "success" : "error",
        summary: condenseError(result.summary),
        output: JSON.stringify({
          findings: result.findings?.slice(0, 60) ?? null,
          details: result.details ?? null,
        }).slice(0, 20000),
        finishedAt: new Date(),
      },
    });
    await appendLearning(agentId, result.learning);
    return { ok: result.ok, agentId, runId: run.id, summary: result.summary };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown agent failure";
    await db.agentRun.update({
      where: { id: run.id },
      data: { status: "error", summary: condenseError(msg), finishedAt: new Date() },
    }).catch(() => undefined);
    await appendLearning(agentId, `Run failed with error: ${msg.slice(0, 160)} — investigate before next run.`).catch(() => undefined);
    return { ok: false, agentId, runId: run.id, summary: msg };
  }
}

/** Prisma puts the REAL reason at the END of its message, after a long
 *  code frame that used to eat the whole 500-char budget — the admin
 *  panel then showed a truncated error with no cause. Keep head + tail. */
function condenseError(msg: string): string {
  const one = msg.replace(/\s+/g, " ").trim();
  if (one.length <= 500) return one;
  return `${one.slice(0, 200)} … ${one.slice(-280)}`;
}

/**
 * Scheduler brain: given the current IST moment and the agents' last
 * successful runs, decide which agents are due. Called hourly by the
 * Vercel cron / sandbox mini-service.
 */
export async function dueAgents(): Promise<string[]> {
  const { hour, date, dow } = nowIst();
  const due: string[] = [];
  for (const agent of AGENTS) {
    if (agent.weeklyOnly && dow !== 1) continue; // Monday only
    if (hour < agent.scheduleHour) continue; // not yet time today
    const last = await db.agentRun.findFirst({
      where: { agentId: agent.id, status: "success", trigger: { in: ["scheduler", "cron", "manual"] } },
      orderBy: { startedAt: "desc" },
      select: { startedAt: true },
    }).catch(() => null);
    const lastIstDate = last?.startedAt
      ? new Date(last.startedAt.getTime() + 330 * 60_000).toISOString().slice(0, 10)
      : null;
    if (lastIstDate !== date) due.push(agent.id);
  }
  return due;
}

/** Guard against a stuck 'running' row blocking future runs. */
export async function hasStaleRunning(agentId: AgentId): Promise<boolean> {
  const stuck = await db.agentRun.findFirst({
    where: { agentId, status: "running", startedAt: { gte: new Date(Date.now() - 30 * 60_000) } },
    select: { id: true },
  }).catch(() => null);
  return Boolean(stuck);
}
