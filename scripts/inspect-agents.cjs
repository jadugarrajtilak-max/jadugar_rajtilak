// Inspect live DB: agent runs, pending blog drafts, backlink tasks
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function main() {
  const runs = await db.agentRun.findMany({
    orderBy: { startedAt: "desc" },
    take: 12,
    select: { agentId: true, status: true, trigger: true, summary: true, startedAt: true },
  });
  console.log("=== LAST 12 AGENT RUNS ===");
  for (const r of runs) {
    console.log(
      `${r.startedAt.toISOString()} [${r.agentId}/${r.status}/${r.trigger}] ${(r.summary || "").slice(0, 110)}`
    );
  }

  const drafts = await db.blogPost.findMany({
    where: { status: "draft" },
    orderBy: { createdAt: "desc" },
    select: { title: true, slug: true, createdAt: true, category: true },
  });
  console.log(`\n=== PENDING DRAFTS (${drafts.length}) ===`);
  for (const d of drafts) console.log(`${d.createdAt.toISOString().slice(0, 10)} [${d.category}] ${d.title}`);

  const published = await db.blogPost.count({ where: { status: "published" } });
  console.log(`\nPublished posts: ${published}`);

  const bl = await db.backlinkTask.groupBy({ by: ["status"], _count: { _all: true } });
  console.log("\n=== BACKLINK PIPELINE ===", JSON.stringify(bl));

  const settings = await db.siteText.findMany({
    where: { key: { startsWith: "agents." } },
    select: { key: true },
  });
  console.log("\nAgent setting keys:", settings.map((s) => s.key));
  await db.$disconnect();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
