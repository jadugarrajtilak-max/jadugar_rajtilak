// Inspect Neon DB: Media rows (user uploads) + SiteAsset overrides + gallery texts
const { Client } = require('pg');

const URL = process.env.DATABASE_URL;

(async () => {
  const client = new Client({ connectionString: URL, connectionTimeoutMillis: 15000 });
  await client.connect();

  console.log('=== MEDIA (user uploads) ===');
  const media = await client.query(
    `SELECT id, mime, bytes, "createdAt" FROM "MediaAsset" ORDER BY "createdAt" ASC`
  );
  media.rows.forEach((r) => console.log(r.id, '|', r.mime, '|', r.bytes, 'bytes |', r.createdAt));

  console.log('\n=== SITE ASSET OVERRIDES ===');
  const assets = await client.query(`SELECT key, src, alt FROM "SiteAsset" ORDER BY key`);
  assets.rows.forEach((r) => console.log(r.key, '->', r.src));

  console.log('\n=== GALLERY/ABOUT/CERT TEXTS ===');
  const texts = await client.query(
    `SELECT key, value FROM "SiteText" WHERE key LIKE 'gallery%' OR key LIKE 'about.certificate%' OR key LIKE 'home.certificate%' ORDER BY key`
  );
  texts.rows.forEach((r) => console.log(r.key, '=', JSON.stringify(String(r.value).slice(0, 90))));

  await client.end();
})().catch((e) => {
  console.error('FATAL', e.message);
  process.exit(1);
});
