// Check all SiteText keys + delete nothing (read-only inspection)
const { Client } = require('pg');
const URL = process.env.DATABASE_URL;

(async () => {
  const client = new Client({ connectionString: URL, connectionTimeoutMillis: 15000 });
  await client.connect();

  console.log('=== ALL SiteText keys with "gallery" or "certificate" or "about.award" ===');
  const t = await client.query(
    `SELECT key, value FROM "SiteText" WHERE key LIKE 'gallery%' OR key LIKE '%certificate%' OR key LIKE 'about.award%' ORDER BY key`
  );
  t.rows.forEach((r) => console.log(r.key, '=', JSON.stringify(String(r.value).slice(0, 70))));
  console.log('(total rows:', t.rowCount + ')');

  console.log('\n=== SiteAsset: gallery + about + services ===');
  const a = await client.query(
    `SELECT key, src FROM "SiteAsset" WHERE key LIKE 'gallery%' OR key LIKE 'about%' OR key LIKE 'services%' ORDER BY key`
  );
  a.rows.forEach((r) => console.log(r.key, '->', r.src));

  await client.end();
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
