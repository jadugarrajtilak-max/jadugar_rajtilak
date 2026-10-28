// SEO cleanup script (audit T-06 / N-02 / O-03 / A-07 — 2026-10-28).
// Runs against the DATABASE_URL in the environment. Idempotent.
//
//  1. Drafts the two near-duplicate "Magician in Udaipur booking guide"
//     posts (their URLs 301 to the new /magician-in-udaipur money page,
//     so drafting only removes them from the sitemap + blog index).
//  2. Renames the auto-generated post-20261024 slug to a keyword slug
//     (Hindi Udaipur wedding guide — old URL 301s to the new slug).
//  3. Updates the SiteText lines the live site renders: keyword-rich H1s
//     (home/services/blog) and honest package price ranges.
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

const DRAFT_SLUGS = [
  "magician-in-udaipur-2026-booking-guide",
  "magician-in-udaipur-the-complete-2026-booking-guide",
];

const RENAME = { from: "post-20261024", to: "jadugar-udaipur-shaadi-magic-show-guide" };

const TEXT_UPDATES = [
  { key: "home.hero.h1a", value: "Magician in Udaipur & Across India" },
  { key: "home.hero.h1b", value: "— Where Reality Bends." },
  { key: "services.hero.title", value: "Wedding, Corporate & Birthday Magic Shows" },
  { key: "blog.hero.title", value: "Magician Booking Guides & Event Ideas" },
  { key: "packages.signature.range", value: "From ₹25,000" },
  { key: "packages.royal.range", value: "From ₹75,000" },
  { key: "packages.grand.range", value: "From ₹1,50,000" },
];

async function main() {
  // 1. Draft duplicates
  for (const slug of DRAFT_SLUGS) {
    const r = await db.blogPost.updateMany({ where: { slug, status: "published" }, data: { status: "draft" } });
    console.log(r.count ? `drafted: ${slug}` : `already draft/absent: ${slug}`);
  }

  // 2. Rename auto slug (preserve content + published status)
  const existing = await db.blogPost.findUnique({ where: { slug: RENAME.to } });
  if (existing) {
    console.log(`target slug already exists: ${RENAME.to} — skipping rename`);
  } else {
    const r = await db.blogPost.updateMany({ where: { slug: RENAME.from }, data: { slug: RENAME.to } });
    console.log(r.count ? `renamed: ${RENAME.from} -> ${RENAME.to}` : `not found (already renamed?): ${RENAME.from}`);
  }

  // 3. Text lines
  for (const u of TEXT_UPDATES) {
    const row = await db.siteText.upsert({
      where: { key: u.key },
      create: { key: u.key, value: u.value },
      update: { value: u.value },
    });
    console.log(`text: ${row.key} = "${row.value.slice(0, 48)}"`);
  }

  // Verification summary
  const pub = await db.blogPost.findMany({ where: { status: "published" }, select: { slug: true } });
  console.log(`\npublished posts now: ${pub.length}`);
  const bad = pub.filter((p) => DRAFT_SLUGS.includes(p.slug) || p.slug === RENAME.from);
  console.log(bad.length ? `WARNING still present: ${bad.map((b) => b.slug).join(", ")}` : "cleanup verified OK");
}

main()
  .catch((e) => {
    console.error("failed:", e.message);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
