// E2E verification of the agent fixes (runs against the local dev DB):
//  1. Blog agent must pick a NEW topic (queue advance), create ONE post,
//     file ONE approval, and write the topic done-marker.
//  2. Manager must report 4/4 healthy + 0 issues even though blog has
//     4 OLD error rows inside the 7-day window (recovered errors).
import { runAgent } from "@/lib/agents/runner";
import { db } from "@/lib/db";

async function main() {
  const postsBefore = await db.blogPost.count();
  const approvalsBefore = await db.agentApproval.count({ where: { status: "pending" } });

  console.log("═══ STEP 1 · Blog Writer run ═══");
  const blog = await runAgent("blog", "manual");
  console.log("ok:", blog.ok);
  console.log("summary:", blog.summary);

  const postsAfter = await db.blogPost.count();
  const approvalsAfter = await db.agentApproval.count({ where: { status: "pending" } });
  const newPost = await db.blogPost.findFirst({ orderBy: { createdAt: "desc" }, select: { slug: true, title: true, status: true } });
  console.log(`posts: ${postsBefore} → ${postsAfter} (must be +1)`);
  console.log(`pending approvals: ${approvalsBefore} → ${approvalsAfter} (must be +1)`);
  console.log("new post:", newPost?.slug, "|", newPost?.title?.slice(0, 60), "| status:", newPost?.status);

  // topic done-marker must exist for a topic
  const markers = await db.siteText.findMany({ where: { key: { startsWith: "agents.blog.topicdone." } }, select: { key: true, value: true } });
  console.log("done-markers:", markers.map((m) => `${m.key} = ${m.value}`).join(" | ") || "(none)");

  const checks: string[] = [];
  checks.push(blog.ok ? "PASS blog run ok" : "FAIL blog run errored");
  checks.push(postsAfter === postsBefore + 1 ? "PASS exactly one post created" : "FAIL post count wrong");
  checks.push(approvalsAfter === approvalsBefore + 1 ? "PASS exactly one approval filed" : "FAIL approval count wrong");
  checks.push(newPost?.title !== "Magician in Udaipur: The Complete 2026 Booking Guide" ? "PASS topic advanced (no duplicate)" : "FAIL same topic re-written");
  checks.push(markers.length > 0 ? "PASS done-marker written" : "FAIL no done-marker");

  console.log("\n═══ STEP 2 · Manager Agent run (the screenshot's report) ═══");
  const mgr = await runAgent("manager", "manual");
  console.log("ok:", mgr.ok);
  console.log("summary:", mgr.summary);

  const out = JSON.parse((await db.agentRun.findFirst({ where: { agentId: "manager" }, orderBy: { startedAt: "desc" }, select: { output: true } }))?.output || "{}");
  console.log("\nteam detail:");
  for (const t of out.details?.team ?? []) {
    console.log(`  ${t.agentId}: runs=${t.runs7d} success=${t.success7d} errors=${t.errors7d} unrecovered=${t.unrecovered} last=${t.lastStatus}`);
  }
  checks.push(mgr.summary.includes("4/4 agents healthy (7d), 0 issue(s)") ? "PASS manager reports 4/4 healthy + 0 issues" : "FAIL manager summary unexpected");
  const blogTeam = (out.details?.team ?? []).find((t: { agentId: string }) => t.agentId === "blog");
  checks.push(blogTeam?.errors7d > 0 && blogTeam?.unrecovered === 0 ? "PASS old blog errors counted as recovered" : "FAIL recovery logic");

  console.log("\n═══ RESULT ═══");
  const failed = checks.filter((c) => c.startsWith("FAIL"));
  checks.forEach((c) => console.log(c));
  console.log(failed.length === 0 ? "ALL CHECKS PASSED ✓" : `${failed.length} CHECK(S) FAILED ✗`);
  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
}).finally(() => db.$disconnect());
