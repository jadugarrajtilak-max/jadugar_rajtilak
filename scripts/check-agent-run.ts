import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
async function main() {
  const run = await db.agentRun.findFirst({ where: { agentId: "seo" }, orderBy: { startedAt: "desc" } });
  if (!run) { console.log("no run"); return; }
  console.log("STATUS:", run.status, "|", run.summary);
  const out = JSON.parse(run.output || "{}");
  for (const f of (out.findings ?? []) as { check: string; status: string; detail: string }[]) {
    if (f.status !== "pass") console.log(`[${f.status.toUpperCase()}] ${f.check} → ${f.detail}`);
  }
  console.log("--- skill learnings ---");
  const skill = await db.siteText.findUnique({ where: { key: "agent.seo.skill" }, select: { value: true } });
  const learn = (skill?.value ?? "").split("\n").filter(l => l.startsWith("- "));
  learn.slice(-3).forEach(l => console.log(l));
}
main().finally(() => db.$disconnect());
