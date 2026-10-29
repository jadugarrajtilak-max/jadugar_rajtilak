// Seed SiteSetting (GA id) + upsert hero/contact SiteText rows on production Neon.
// Run: node scripts/seed-settings-and-texts.js
const { Client } = require("pg");

const URL =
  "postgresql://neondb_owner:npg_jW9iZx7wGAQp@ep-super-pine-b43ybe3r-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require";

const SETTINGS = [
  ["seo.ga.id", "G-103JFH1Z6B"],
];

// New OP-Sharma-style copy — upserted so they win over any stale rows.
const TEXTS = [
  ["home.hero.eyebrow", "Welcome to the World of Magic · Udaipur · India"],
  ["home.hero.h1a", "Welcome to"],
  ["home.hero.h1b", "Jadugar Rajtilak"],
  [
    "home.hero.sub",
    "Udaipur's most-loved royal-stage magician — 500+ housefull shows across 40+ cities of India, international magic honours, and a stage where weddings, corporate evenings, birthdays and college fests become unforgettable memories.",
  ],
  ["home.hero.ctaPrimary", "Book Your Show"],
  ["contact.hero.eyebrow", "Contact Us"],
  ["contact.hero.title", "Get in Touch"],
  [
    "contact.hero.sub",
    "Questions, bookings or bulk enquiries — drop your query below and the studio replies within one working day. Experience the magic with Jadugar Rajtilak!",
  ],
];

(async () => {
  const c = new Client({ connectionString: URL, connectionTimeoutMillis: 20000 });
  await c.connect();

  for (const [key, value] of SETTINGS) {
    await c.query(
      `INSERT INTO "SiteSetting" (id, key, value, "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, now())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, "updatedAt" = now()`,
      [key, value]
    );
    console.log("setting upserted:", key, "=", value);
  }

  const { rows: existing } = await c.query(
    `SELECT key, value FROM "SiteText" WHERE key = ANY($1::text[])`,
    [TEXTS.map((t) => t[0])]
  );
  const existingMap = new Map(existing.map((r) => [r.key, r.value]));
  for (const [key, value] of TEXTS) {
    if (existingMap.get(key) === value) {
      console.log("text already current:", key);
      continue;
    }
    await c.query(
      `INSERT INTO "SiteText" (id, key, value, "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, now())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, "updatedAt" = now()`,
      [key, value]
    );
    console.log("text upserted:", key, "←", value.slice(0, 60));
  }

  const { rows: all } = await c.query(
    `SELECT key, value FROM "SiteSetting" ORDER BY key`
  );
  console.log("SiteSetting rows:", JSON.stringify(all));
  await c.end();
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
