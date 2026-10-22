const { Client } = require('pg');
require('dotenv').config({ path: '.env' });
(async () => {
  const c = new Client({ connectionString: process.env.DIRECT_DATABASE_URL });
  await c.connect();
  const r = await c.query('SELECT * FROM "BlogPost" WHERE slug = $1', ['how-to-choose-a-magician']);
  const p = r.rows[0];
  console.log('TITLE:', p.title);
  console.log('EXCERPT:', p.excerpt);
  console.log('KEYWORDS:', p.keywords);
  console.log('INTRO:', (p.intro || '').slice(0, 200));
  console.log('SECTIONS:', JSON.parse(JSON.stringify(p.sections)).length);
  const secs = p.sections;
  secs.forEach((s, i) => console.log(`  [${i}] ${s.h} (${s.paras.length} paras)`));
  console.log('CLOSING:', (p.closing || '').slice(0, 150));
  console.log('READING:', p.readingTime, '| CATEGORY:', p.category, '| FEATURED:', p.featured);
  await c.end();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
