const { Client } = require('pg');
require('dotenv').config({ path: '.env' });
(async () => {
  const c = new Client({ connectionString: process.env.DIRECT_DATABASE_URL });
  await c.connect();
  const posts = await c.query('SELECT slug, title, status, featured, "publishedAt" FROM "BlogPost" ORDER BY "publishedAt" DESC');
  console.log('BLOG POSTS:', posts.rows.length);
  posts.rows.forEach(r => console.log(` - [${r.status}]${r.featured ? '[F]' : ''} ${r.slug} :: ${r.title}`));
  const counts = await c.query('SELECT (SELECT COUNT(*) FROM "Lead") l, (SELECT COUNT(*) FROM "ContactMessage") m, (SELECT COUNT(*) FROM "MediaAsset") a, (SELECT COUNT(*) FROM "SiteText") t, (SELECT COUNT(*) FROM "SiteAsset") sa, (SELECT COUNT(*) FROM "SiteTheme") th');
  console.log('COUNTS:', counts.rows[0]);
  await c.end();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
