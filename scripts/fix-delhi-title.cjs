// Fix T-08 remainder: shorten 65ch meta title on magician-in-delhi post
// Run: node scripts/fix-delhi-title.cjs
const fs = require('fs');
const { Client } = require('pg');

const DBURL = fs.readFileSync(__dirname + '/.dburl.txt', 'utf8').trim();

async function main() {
  const client = new Client({ connectionString: DBURL });
  await client.connect();

  const slug = 'magician-in-delhi-for-weddings-events-the-complete-booking-guide';
  const res = await client.query(
    'SELECT id, "metaTitle", "metaDescription" FROM "BlogPost" WHERE slug = $1', [slug]
  );
  if (res.rowCount === 0) { console.log('POST NOT FOUND'); process.exit(1); }
  const post = res.rows[0];
  console.log('BEFORE:', JSON.stringify(post.metaTitle), `(${post.metaTitle.length}ch)`);

  const newTitle = 'Magician in Delhi for Weddings & Events | Rajtilak';
  if (newTitle.length > 60) throw new Error('too long: ' + newTitle.length);
  console.log('AFTER :', JSON.stringify(newTitle), `(${newTitle.length}ch)`);

  await client.query('UPDATE "BlogPost" SET "metaTitle" = $1 WHERE id = $2', [newTitle, post.id]);
  console.log('UPDATED OK');
  await client.end();
}
main().catch(e => { console.error(e.message); process.exit(1); });
