// Inspect live blog posts' featured images (agent flagged 2 AI-generated ones)
const { Client } = require('pg');
const URL = process.env.DATABASE_URL;

(async () => {
  const client = new Client({ connectionString: URL, connectionTimeoutMillis: 15000 });
  await client.connect();
  const posts = await client.query(
    `SELECT slug, title, "featuredImage" FROM "BlogPost" ORDER BY "createdAt" ASC`
  );
  posts.rows.forEach((r) =>
    console.log(r.slug.slice(0, 40).padEnd(42), '|', (r.featuredImage || 'NULL').slice(0, 60))
  );
  await client.end();
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
