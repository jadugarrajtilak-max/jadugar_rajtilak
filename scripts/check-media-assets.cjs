// Check all MediaAsset uploads in production DB
const { Client } = require('pg');
const URL = process.env.DATABASE_URL;

(async () => {
  const client = new Client({ connectionString: URL, connectionTimeoutMillis: 15000 });
  await client.connect();

  const media = await client.query(
    'SELECT id, mime, "createdAt", LENGTH(data) AS bytes FROM "MediaAsset" ORDER BY "createdAt"'
  );
  console.log('=== MediaAsset uploads (' + media.rows.length + ') ===');
  media.rows.forEach(r => {
    const kb = r.bytes ? Math.round(r.bytes / 1024) : 0;
    console.log(r.id, r.mime, r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 16) : '', kb + 'KB');
  });

  // Full SiteAsset list (all keys)
  const assets = await client.query('SELECT key, src FROM "SiteAsset" ORDER BY key');
  console.log('\n=== ALL SiteAsset (' + assets.rows.length + ') ===');
  assets.rows.forEach(r => console.log(r.key, '->', r.src));

  await client.end();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
