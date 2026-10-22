// Quick Neon DB connectivity + table check
const { Client } = require('pg');

const urls = [
  ['pooled (DATABASE_URL)', process.env.DATABASE_URL],
  ['direct (DIRECT_DATABASE_URL)', process.env.DATABASE_URL],
];

(async () => {
  for (const [label, url] of urls) {
    try {
      const client = new Client({ connectionString: url, connectionTimeoutMillis: 10000 });
      await client.connect();
      const { rows } = await client.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
      );
      const counts = [];
      for (const r of rows) {
        try {
          const c = await client.query(`SELECT COUNT(*)::int AS n FROM "${r.table_name}"`);
          counts.push(`${r.table_name}=${c.rows[0].n}`);
        } catch { counts.push(`${r.table_name}=?`); }
      }
      console.log(`OK [${label}] tables: ${counts.join(', ') || '(none)'}`);
      await client.end();
    } catch (e) {
      console.log(`FAIL [${label}]: ${e.message}`);
    }
  }
})();
