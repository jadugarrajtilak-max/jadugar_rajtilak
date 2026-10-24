// Full error detail of failed blog agent runs
import { Database } from "bun:sqlite";

const db = new Database("/home/z/my-project/db/custom.db", { readonly: true });

const runs = db
  .query(
    `SELECT id, status, summary, output, startedAt
     FROM AgentRun WHERE status='error' ORDER BY startedAt DESC LIMIT 5`
  )
  .all();

for (const r of runs) {
  console.log("════════════════════════════════════════");
  console.log("RUN", r.id, "@", new Date(Number(r.startedAt)).toISOString());
  console.log("--- FULL SUMMARY ---");
  console.log(r.summary);
  if (r.output) {
    console.log("--- OUTPUT (first 3000 chars) ---");
    console.log(String(r.output).slice(0, 3000));
  }
}

// also check existing blog posts (slug collisions)
const posts = db
  .query(`SELECT id, slug, title, createdAt FROM BlogPost ORDER BY createdAt DESC LIMIT 10`)
  .all();
console.log("\n=== BlogPost (latest 10) ===");
posts.forEach((p) => console.log(`${p.slug} | ${String(p.title).slice(0, 50)} | ${p.createdAt}`));

// approvals content for the latest pending
const appr = db
  .query(`SELECT id, title, status, payload, createdAt FROM AgentApproval ORDER BY createdAt DESC LIMIT 3`)
  .all();
console.log("\n=== Latest approvals ===");
appr.forEach((a) => {
  console.log(`${a.status} | ${a.title}`);
  if (a.payload) console.log("payload:", String(a.payload).slice(0, 400));
});
