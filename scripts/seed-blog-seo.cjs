// ── Seed runner: 4 new SEO posts + upgrade 6 existing posts ──
// Idempotent: re-running updates the same rows (upsert on slug).
// Usage: node scripts/seed-blog-seo.cjs

const { Client } = require("pg");
require("dotenv").config({ path: ".env" });
const { magicianInJaipur, virtualMagicShow } = require("./blog-seed-data-1.cjs");
const { mentalismShow, sangeetMehendiIdeas, EXISTING_UPGRADES } = require("./blog-seed-data-2.cjs");

const NEW_POSTS = [magicianInJaipur, virtualMagicShow, mentalismShow, sangeetMehendiIdeas];

function toSqlJson(v) {
  return JSON.stringify(v);
}

// Prisma's @default(cuid()) is client-side — raw SQL inserts must
// generate the id themselves. Same shape: c + timestamp + random.
function cuidLike() {
  return `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 8)}`;
}

(async () => {
  const c = new Client({ connectionString: process.env.DIRECT_DATABASE_URL });
  await c.connect();
  console.log("Connected. Seeding…");

  // ── 1. Insert the 4 new posts (upsert on slug) ──
  for (const p of NEW_POSTS) {
    const q = `
      INSERT INTO "BlogPost" (
        id, slug, title, "metaTitle", "metaDescription", keywords, excerpt, category,
        "featuredImage", "featuredImageAlt", intro, sections, closing, backlinks,
        "readingTime", status, featured, author, "publishedAt", "updatedAt"
      ) VALUES (
        $16,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'published',false,'Jadugar Rajtilak',$15, now()
      )
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        "metaTitle" = EXCLUDED."metaTitle",
        "metaDescription" = EXCLUDED."metaDescription",
        keywords = EXCLUDED.keywords,
        excerpt = EXCLUDED.excerpt,
        category = EXCLUDED.category,
        "featuredImage" = EXCLUDED."featuredImage",
        "featuredImageAlt" = EXCLUDED."featuredImageAlt",
        intro = EXCLUDED.intro,
        sections = EXCLUDED.sections,
        closing = EXCLUDED.closing,
        backlinks = EXCLUDED.backlinks,
        "readingTime" = EXCLUDED."readingTime",
        status = 'published',
        "updatedAt" = now()
      `;
    await c.query(q, [
      p.slug, p.title, p.metaTitle, p.metaDescription, p.keywords, p.excerpt, p.category,
      p.featuredImage, p.featuredImageAlt, p.intro, toSqlJson(p.sections), p.closing,
      toSqlJson(p.backlinks), p.readingTime, p.publishedAt, cuidLike(),
    ]);
    console.log(`  + ${p.slug} (${p.sections.length} sections, ${p.readingTime})`);
  }

  // ── 2. Upgrade the 6 existing posts ──
  for (const u of EXISTING_UPGRADES) {
    const cur = await c.query(
      'SELECT id, closing, "metaTitle", "metaDescription", "featuredImage", backlinks FROM "BlogPost" WHERE slug = $1',
      [u.slug]
    );
    if (cur.rows.length === 0) {
      console.log(`  ! ${u.slug} not found — skipped`);
      continue;
    }
    const row = cur.rows[0];
    const closing = (row.closing ?? "") + u.related;
    await c.query(
      `UPDATE "BlogPost" SET
         "metaTitle" = $2,
         "metaDescription" = $3,
         "featuredImage" = $4,
         "featuredImageAlt" = $5,
         closing = $6,
         backlinks = $7,
         "updatedAt" = now()
       WHERE id = $1`,
      [
        row.id,
        row.metaTitle ?? u.metaTitle,
        row.metaDescription ?? u.metaDescription,
        row.featuredImage ?? u.featuredImage,
        row.featuredImageAlt ?? u.featuredImageAlt,
        closing,
        toSqlJson(u.backlinks),
      ]
    );
    console.log(`  ↑ ${u.slug} (meta + image + backlinks + related links)`);
  }

  // ── 3. Verify ──
  const final = await c.query(
    'SELECT slug, title, "metaTitle", "featuredImage", backlinks, status FROM "BlogPost" ORDER BY "publishedAt" DESC'
  );
  console.log(`\nFINAL STATE — ${final.rows.length} posts:`);
  final.rows.forEach((r) => {
    const bl = Array.isArray(r.backlinks) ? r.backlinks.length : 0;
    console.log(
      `  [${r.status}] ${r.slug.padEnd(38)} meta:${r.metaTitle ? "Y" : "N"} img:${r.featuredImage ? "Y" : "N"} backlinks:${bl}`
    );
  });

  await c.end();
})().catch((e) => {
  console.error("SEED FAILED:", e.message);
  process.exit(1);
});
