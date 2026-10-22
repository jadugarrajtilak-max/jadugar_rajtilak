// Check production Neon DB: SiteAsset gallery images + SiteText hero + certificates-related rows
const { Client } = require('pg');

const URL = process.env.DATABASE_URL;

(async () => {
  const client = new Client({ connectionString: URL, connectionTimeoutMillis: 15000 });
  await client.connect();

  // 1. SiteAsset rows (gallery + about)
  const assets = await client.query(
    "SELECT key, src FROM \"SiteAsset\" WHERE key LIKE 'gallery.%' OR key LIKE 'about.%' OR key LIKE 'home.%' OR key LIKE 'meta.%' ORDER BY key"
  );
  console.log('=== SiteAsset rows (' + assets.rows.length + ') ===');
  assets.rows.forEach(r => console.log(r.key, '->', r.src));

  // 2. SiteText hero rows
  const hero = await client.query(
    "SELECT key, value FROM \"SiteText\" WHERE key LIKE 'home.hero.%' ORDER BY key"
  );
  console.log('\n=== SiteText hero rows ===');
  hero.rows.forEach(r => console.log(r.key, '=', JSON.stringify(r.value.slice(0, 70))));

  // 3. Any certificate-ish text keys
  const certs = await client.query(
    "SELECT key, value FROM \"SiteText\" WHERE key ILIKE '%cert%' OR key ILIKE '%award%' OR key ILIKE '%felici%' OR key ILIKE '%recogni%' ORDER BY key"
  );
  console.log('\n=== Certificate/award text keys ===');
  certs.rows.forEach(r => console.log(r.key, '=', JSON.stringify(r.value.slice(0, 70))));

  // 4. Media uploads count
  const media = await client.query('SELECT COUNT(*)::int AS n FROM "Media"').catch(e => ({ rows: [{ n: 'ERR ' + e.message.slice(0, 50) }] }));
  console.log('\nMedia count:', media.rows[0].n);

  await client.end();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
