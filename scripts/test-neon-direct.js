// Test the DIRECT (non-pooler) Neon endpoint — needed for Prisma db push
// (schema migrations must use a direct connection, not the transaction
// mode pooler).
const { Client } = require("pg");

const DIRECT =
  process.env.DATABASE_URL;

(async () => {
  const client = new Client({ connectionString: DIRECT });
  try {
    await client.connect();
    const v = await client.query("select current_database(), version()");
    console.log("[direct] OK:", v.rows[0].current_database, v.rows[0].version.slice(0, 40));
    process.exit(0);
  } catch (e) {
    console.log("[direct] FAILED:", e.message);
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
})();
