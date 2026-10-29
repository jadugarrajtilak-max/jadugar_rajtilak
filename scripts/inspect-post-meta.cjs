#!/usr/bin/env node
/**
 * Read-only inspection: all published posts' title/metaTitle/metaDescription
 * with character lengths, + the SiteText hero-H1 override row.
 * Used to craft the T-08 / long-title meta rewrites before updating.
 */
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

(async () => {
  const posts = await db.blogPost.findMany({
    where: { status: "published" },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    select: { slug: true, title: true, metaTitle: true, metaDescription: true, publishedAt: true },
  });
  console.log(`PUBLISHED POSTS: ${posts.length}\n`);
  for (const p of posts) {
    const t = p.metaTitle || p.title;
    const d = p.metaDescription || "";
    const tLen = [...t].length;
    const dLen = [...d].length;
    const flags = [
      tLen > 60 ? "TITLE>60" : "",
      dLen > 160 ? "DESC>160" : "",
      dLen === 0 ? "NO-DESC" : "",
    ].filter(Boolean).join(" ");
    console.log(`${p.slug}`);
    console.log(`  title(${tLen}): ${t}`);
    console.log(`  desc(${dLen})${flags ? " [" + flags + "]" : ""}: ${d.slice(0, 220)}`);
    console.log("");
  }

  const hero = await db.siteText.findMany({
    where: { key: { startsWith: "home.hero." } },
    select: { key: true, value: true, updatedAt: true },
  });
  console.log("HERO SITETEXT ROWS:");
  for (const h of hero) console.log(`  ${h.key} = ${JSON.stringify(h.value)} (updated ${h.updatedAt.toISOString().slice(0, 10)})`);
  await db.$disconnect();
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
