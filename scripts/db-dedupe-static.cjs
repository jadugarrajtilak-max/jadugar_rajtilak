// Post-deploy DB cleanup:
// 1) DELETE duplicate gallery rows (item06/07/09/10 — the "image 3 baar" bug)
// 2) DELETE /api/media photo-slot overrides so the site falls back to the
//    static optimized WebP assets (edge-cached, instant) — identical photos.
// Run AFTER the new code is deployed:
//   bash -c "set -a; source scripts/.env.ops; node scripts/db-dedupe-static.cjs"
const { Client } = require('pg');

const PHOTO_SLOTS = [
  'gallery.item01', 'gallery.item02', 'gallery.item03', 'gallery.item04', 'gallery.item05',
  'gallery.item06', 'gallery.item07', 'gallery.item08', 'gallery.item09', 'gallery.item10',
  'about.award.photo', 'about.certificate.photo',
  'home.story.photo', 'home.reel.poster',
  'services.wedding.photo', 'services.corporate.photo', 'services.birthday.photo',
  'services.college.photo', 'services.private.photo',
];

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15000 });
  await client.connect();

  // pre-state
  const before = await client.query('SELECT key, src FROM "SiteAsset" WHERE key = ANY($1) ORDER BY key', [PHOTO_SLOTS]);
  console.log('=== BEFORE ===');
  before.rows.forEach(r => console.log(' ', r.key, '->', r.src));

  // delete
  const del = await client.query('DELETE FROM "SiteAsset" WHERE key = ANY($1) RETURNING key', [PHOTO_SLOTS]);
  console.log(`\nDeleted ${del.rowCount} photo SiteAsset rows (static code defaults take over)`);

  // post-state
  const after = await client.query('SELECT key, src FROM "SiteAsset" WHERE key LIKE \'gallery.%\' OR key LIKE \'about.%photo\' OR key LIKE \'home.%photo\' OR key LIKE \'home.reel%\' OR key LIKE \'services.%photo\' ORDER BY key');
  console.log('=== AFTER (remaining photo-ish rows) ===');
  (after.rows.length ? after.rows : [{ key: '(none)', src: '—' }]).forEach(r => console.log(' ', r.key, '->', r.src));

  // texts stay (captions, LG lines)
  const texts = await client.query('SELECT count(*)::int AS n FROM "SiteText"');
  console.log(`\nSiteText rows preserved: ${texts.rows[0].n} (captions / LG lines untouched)`);

  await client.end();
})().catch(e => { console.error('FATAL', e.message || e); process.exit(1); });
