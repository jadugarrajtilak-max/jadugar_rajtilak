// Swap the 2 AI-generated blog featured images (flagged by the audit agent)
// for the client's real photographs (live via /api/media URLs)
const { Client } = require('pg');
const URL = process.env.DATABASE_URL;

const UPDATES = [
  {
    slug: 'magician-in-jaipur',
    img: '/api/media/cmvje0hqc0002kz07q1uqnban', // mic close-up
    alt: 'Jadugar Rajtilak performing with the microphone on stage — close-up moment',
  },
  {
    slug: 'virtual-magic-show-online-events',
    img: '/api/media/cmvje080a0001kz07bzbm2rcd', // stage confetti
    alt: 'Jadugar Rajtilak on stage as confetti falls — a live performance moment',
  },
];

(async () => {
  const client = new Client({ connectionString: URL, connectionTimeoutMillis: 15000 });
  await client.connect();
  for (const u of UPDATES) {
    const r = await client.query(
      `UPDATE "BlogPost" SET "featuredImage" = $1, "featuredImageAlt" = $2 WHERE slug = $3 RETURNING slug, "featuredImage"`,
      [u.img, u.alt, u.slug]
    );
    console.log(r.rowCount ? `updated: ${r.rows[0].slug} -> ${r.rows[0].featuredImage}` : `MISSING: ${u.slug}`);
  }
  await client.end();
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
