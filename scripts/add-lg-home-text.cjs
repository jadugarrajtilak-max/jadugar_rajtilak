// Add the LG felicitation sentence to the live home story text (DB row)
const { Client } = require('pg');
const URL = process.env.DATABASE_URL;

const VALUE =
  'Every evening is engineered for its room. A sangeet gets warmth and participation, a corporate annual day gets precision to the run-sheet, a college fest gets scale the back row can feel. What never changes is the refusal to perform anything the cheapest seat cannot see. The craft has also been recognised on stage by LG — a felicitation certificate that now travels with the props.';

(async () => {
  const client = new Client({ connectionString: URL, connectionTimeoutMillis: 15000 });
  await client.connect();
  const r = await client.query(
    `INSERT INTO "SiteText" (id, key, value, "updatedAt")
     VALUES (gen_random_uuid()::text, 'home.story.p2', $1, now())
     ON CONFLICT (key) DO UPDATE SET value = $1, "updatedAt" = now()
     RETURNING key`,
    [VALUE]
  );
  console.log('text set:', r.rows[0].key, '(', VALUE.length, 'chars )');
  await client.end();
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
