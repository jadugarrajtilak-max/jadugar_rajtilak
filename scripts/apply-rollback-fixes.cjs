// Apply the rollback fixes to the production Neon DB:
// 1. Hero text → previous version ("Where Reality Bends." era)
// 2. Gallery items 01/06/10 → the client's real uploaded photos
//    (only ADDs/updates these rows — nothing else is touched)
// 3. Bump nothing else; existing leads/media/texts stay intact.
const { Client } = require('pg');

const URL = process.env.DATABASE_URL;

const HERO_TEXT = {
  'home.hero.eyebrow': 'The Royal Stage · Udaipur · India',
  'home.hero.h1a': 'Where Reality',
  'home.hero.h1b': 'Bends.',
  'home.hero.sub':
    'Cinematic stage magic for weddings, corporate evenings, birthdays and festivals — a royal show your guests will retell for years.',
  'home.hero.ctaPrimary': 'Check Date',
};

const GALLERY_ASSETS = [
  {
    key: 'gallery.item01',
    src: '/api/media/cmvje080a0001kz07bzbm2rcd',
    alt: 'Jadugar Rajtilak performing live on stage in his red velvet jacket with his prop table — the man himself',
  },
  {
    key: 'gallery.item06',
    src: '/api/media/cmvje1ct50005kz07w5pggmw1',
    alt: 'Jadugar Rajtilak embracing a fellow performer on stage during a felicitation evening under green stage lights',
  },
  {
    key: 'gallery.item10',
    src: '/api/media/cmvje2lwx0006kz0740v3csrp',
    alt: 'Jadugar Rajtilak with his team and organisers on stage, one holding the framed felicitation award',
  },
];

(async () => {
  const client = new Client({ connectionString: URL, connectionTimeoutMillis: 15000 });
  await client.connect();

  // ── 1. Hero text rollback ──
  for (const [key, value] of Object.entries(HERO_TEXT)) {
    const r = await client.query(
      `UPDATE "SiteText" SET value = $1 WHERE key = $2 RETURNING key`,
      [value, key]
    );
    console.log(r.rowCount ? `text updated: ${key}` : `text row missing (code default applies): ${key}`);
  }

  // ── 2. Gallery real-photo overrides ──
  for (const a of GALLERY_ASSETS) {
    const r = await client.query(
      `INSERT INTO "SiteAsset" (id, key, src, alt, "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, now())
       ON CONFLICT (key) DO UPDATE SET src = $2, alt = $3, "updatedAt" = now()
       RETURNING key, src`,
      [a.key, a.src, a.alt]
    );
    console.log('asset set:', r.rows[0].key, '->', r.rows[0].src);
  }

  // ── verify ──
  const hero = await client.query(
    `SELECT key, value FROM "SiteText" WHERE key LIKE 'home.hero.%' ORDER BY key`
  );
  console.log('\n--- HERO (final) ---');
  hero.rows.forEach((r) => console.log(r.key, '=', JSON.stringify(r.value.slice(0, 60))));

  const assets = await client.query(`SELECT key, src FROM "SiteAsset" ORDER BY key`);
  console.log('\n--- ASSETS (final) ---');
  assets.rows.forEach((r) => console.log(r.key, '->', r.src));

  await client.end();
})().catch((e) => {
  console.error('FATAL', e.message);
  process.exit(1);
});
