// Inspect AgentRun rows in the local dev SQLite DB
import { Database } from "bun:sqlite";

const db = new Database("/home/z/my-project/db/custom.db", { readonly: true });

try {
  const runs = db
    .query(
      `SELECT id, agentId, status, trigger, substr(summary,1,160) AS summary, startedAt, finishedAt
       FROM AgentRun ORDER BY startedAt DESC LIMIT 20`
    )
    .all();
  console.log("=== AgentRun (latest 20) ===");
  for (const r of runs) {
    console.log(
      `[${r.agentId}] ${r.status} (${r.trigger}) @ ${r.startedAt}` +
        `\n   summary: ${r.summary}`
    );
  }

  // 7-day window health, same logic as Manager Agent
  const since = Date.now() - 7 * 86400000;
  const sinceIso = new Date(since).toISOString();
  const health = db
    .query(
      `SELECT agentId,
              COUNT(*) AS runs7d,
              SUM(CASE WHEN status='success' THEN 1 ELSE 0 END) AS success7d,
              MAX(startedAt) AS lastRun
       FROM AgentRun WHERE startedAt >= ? GROUP BY agentId`
    )
    .all(sinceIso);
  console.log("\n=== 7-day health (manager logic) ===");
  for (const h of health) {
    const errors = h.runs7d - h.success7d;
    console.log(
      `${h.agentId}: runs=${h.runs7d} success=${h.success7d} errors=${errors} last=${h.lastRun} => ${
        errors === 0 ? (h.runs7d > 0 ? "HEALTHY" : "WARN (no runs)") : "FAIL (errors)"
      }`
    );
  }

  const approvals = db
    .query(`SELECT id, agentId, title, status, createdAt FROM AgentApproval ORDER BY createdAt DESC LIMIT 10`)
    .all();
  console.log("\n=== AgentApproval (latest 10) ===");
  approvals.forEach((a) => console.log(`${a.status} | ${a.agentId} | ${a.title} | ${a.createdAt}`));

  const bl = db
    .query(`SELECT status, COUNT(*) AS n FROM BacklinkTask GROUP BY status`)
    .all();
  console.log("\n=== BacklinkTask by status ===");
  bl.forEach((b) => console.log(`${b.status}: ${b.n}`));
} catch (e) {
  console.error("ERR:", e.message);
}
