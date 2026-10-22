// E2E QA against the LIVE production site — real lead + contact message,
// then verify both rows landed in Neon Postgres.
const { Client } = require('pg');
const BASE = 'https://jadugarrajtilak.com';

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, json };
}

(async () => {
  console.log('── 1. Submit a REAL booking lead via /api/leads ──');
  const lead = {
    name: `QA Pipeline Test ${stamp}`,
    phone: '9829000000',
    email: 'qa-pipeline@jadugarrajtilak.com',
    eventType: 'birthday',
    eventDate: '2026-12-20',
    city: 'Udaipur',
    guests: 80,
    budget: '₹25,000 – ₹50,000',
    venueType: 'indoor',
    duration: '45 – 60 minutes',
    notes: 'E2E pipeline verification against production + Neon.',
    consent: true,
    utmSource: 'qa',
    utmMedium: 'e2e',
    utmCampaign: 'deploy-check',
  };
  const r1 = await post('/api/leads', lead);
  console.log('status:', r1.status, '| body:', JSON.stringify(r1.json).slice(0, 220));

  console.log('── 2. Submit a REAL contact message via /api/contact ──');
  const r2 = await post('/api/contact', {
    name: `QA Desk Test ${stamp}`,
    email: 'qa-desk@jadugarrajtilak.com',
    message: 'E2E contact desk verification — please treat as test and clear after QA.',
  });
  console.log('status:', r2.status, '| body:', JSON.stringify(r2.json).slice(0, 220));

  console.log('── 3. Verify rows landed in Neon Postgres ──');
  const client = new Client({
    connectionString:
      process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
  });
  await client.connect();
  const l = await client.query(
    "SELECT id, name, status, \"eventType\", city FROM \"Lead\" WHERE name LIKE $1 ORDER BY \"createdAt\" DESC LIMIT 2",
    [`QA Pipeline Test ${stamp}%`]
  );
  console.log('leads in DB:', JSON.stringify(l.rows));
  const c = await client.query(
    "SELECT id, name, email FROM \"ContactMessage\" WHERE name LIKE $1 ORDER BY \"createdAt\" DESC LIMIT 2",
    [`QA Desk Test ${stamp}%`]
  );
  console.log('contact messages in DB:', JSON.stringify(c.rows));

  // cleanup — QA rows should not pollute the live admin inbox
  if (l.rows.length) {
    await client.query('DELETE FROM "Lead" WHERE id = ANY($1::text[])', [l.rows.map((r) => r.id)]);
    console.log('QA lead rows deleted (DB is production-clean again)');
  }
  if (c.rows.length) {
    await client.query('DELETE FROM "ContactMessage" WHERE id = ANY($1::text[])', [c.rows.map((r) => r.id)]);
    console.log('QA contact rows deleted (DB is production-clean again)');
  }
  const totals = await client.query('SELECT (SELECT COUNT(*) FROM "Lead") AS leads, (SELECT COUNT(*) FROM "ContactMessage") AS msgs');
  console.log('DB totals after cleanup:', totals.rows[0]);
  await client.end();
})().catch((e) => {
  console.error('QA FAILED:', e.message);
  process.exit(1);
});
