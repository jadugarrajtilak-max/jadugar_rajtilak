// Verify direct connectivity to the Neon Postgres data plane using the
// owner connection string supplied by the user. Tests both the raw URL
// (channel_binding=require) and a softened variant (sslmode only) so we
// know exactly which form Prisma can use.
const { Client } = require("pg");

const RAW =
  process.env.DATABASE_URL;
const SOFT = RAW.replace("&channel_binding=require", "");

async function tryConnect(label, url) {
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    const v = await client.query("select version() as v");
    const tbl = await client.query(
      "select table_name from information_schema.tables where table_schema='public' limit 10"
    );
    console.log(`[${label}] OK`);
    console.log(`  version: ${v.rows[0].v.slice(0, 60)}...`);
    console.log(`  existing tables: ${tbl.rows.map((r) => r.table_name).join(", ") || "(none)"}`);
    return true;
  } catch (e) {
    console.log(`[${label}] FAILED: ${e.message}`);
    return false;
  } finally {
    await client.end().catch(() => {});
  }
}

(async () => {
  const a = await tryConnect("raw+cb", RAW);
  const b = await tryConnect("soft", SOFT);
  console.log(`RESULT raw=${a} soft=${b}`);
})();
