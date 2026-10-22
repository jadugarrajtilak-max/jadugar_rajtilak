const { Client } = require('pg');
require('dotenv').config({ path: '.env' });
(async () => {
  const c = new Client({ connectionString: process.env.DIRECT_DATABASE_URL });
  await c.connect();
  const posts = await c.query('SELECT slug, "featuredImage", "featuredImageAlt", backlinks, sections FROM "BlogPost"');
  for (const r of posts.rows) {
    console.log(`\n== ${r.slug}`);
    console.log(`   img: ${r.featuredImage} | alt: ${r.featuredImageAlt}`);
    const bl = JSON.parse(JSON.stringify(r.backlinks || '[]'));
    (Array.isArray(bl) ? bl : []).forEach(b => console.log(`   backlink: ${b.text} -> ${b.url}`));
    // scan sections for inline links
    const secs = r.sections;
    if (Array.isArray(secs)) {
      secs.forEach(s => {
        (s.paras || []).forEach(p => {
          const links = String(p).match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
          links.forEach(l => console.log(`   inline: ${l}`));
        });
      });
    }
  }
  await c.end();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
