// Download all MediaAsset rows from Neon DB to local files for inspection
const { Client } = require('pg');
const fs = require('fs');

const URL = process.env.DATABASE_URL;
const OUT = '/home/z/my-project/scripts/img/usermedia';
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const client = new Client({ connectionString: URL, connectionTimeoutMillis: 15000 });
  await client.connect();
  const media = await client.query(`SELECT id, mime, data FROM "MediaAsset" ORDER BY "createdAt" ASC`);
  media.rows.forEach((r, i) => {
    const ext = r.mime.includes('png') ? 'png' : r.mime.includes('jpeg') ? 'jpg' : 'webp';
    const file = `${OUT}/um${i + 1}-${r.id.slice(-6)}.${ext}`;
    fs.writeFileSync(file, Buffer.from(r.data, 'base64'));
    console.log('saved', file, r.mime, (r.data.length * 0.75 / 1024).toFixed(0) + 'KB');
  });
  await client.end();
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
