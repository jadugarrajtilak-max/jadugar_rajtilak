#!/usr/bin/env node
/**
 * Internal-link seeding (SEO audit T-06b + R-18..R-22 day-one links IN,
 * 2026-10-29). Appends internal backlinks to relevant PRODUCTION blog
 * posts pointing at the new dedicated money pages + /magician-in-udaipur.
 *
 * Audit rule: every new service page needs 3+ internal links IN, and every
 * Udaipur-themed post must link to /magician-in-udaipur.
 * Idempotent: re-running adds nothing (dedupe by URL per post).
 */
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

const SITE = "https://jadugarrajtilak.com";

// Internal link targets (descriptive anchor text carries the keyword).
const L = {
  wedding: { text: "Wedding Magician in India — the dedicated service page", url: `${SITE}/services/wedding-magician` },
  corporate: { text: "Corporate Magic Shows — the dedicated service page", url: `${SITE}/services/corporate-shows` },
  birthday: { text: "Birthday Party Magician — the dedicated service page", url: `${SITE}/services/birthday-kids` },
  college: { text: "College Fest Magician — the dedicated service page", url: `${SITE}/services/college-stage` },
  virtual: { text: "Virtual Magic Shows — the dedicated service page", url: `${SITE}/services/virtual-magic` },
  private: { text: "Private & Luxury Event Magician — the dedicated service page", url: `${SITE}/services/private-luxury` },
  dest: { text: "Destination Wedding Magician in Udaipur — the dedicated page", url: `${SITE}/destination-wedding-magician-udaipur` },
  udaipur: { text: "Magician in Udaipur — the local service page", url: `${SITE}/magician-in-udaipur` },
  packages: { text: "Magic show packages & honest price ranges", url: `${SITE}/packages` },
  booking: { text: "Check your date & get a written quote within 24 hours", url: `${SITE}/booking` },
};

// Post slug → links to append.
const MAP = {
  // ── Udaipur cluster → /magician-in-udaipur + destination page (T-06b) ──
  "jadugar-udaipur-shaadi-magic-show-guide": [L.udaipur, L.wedding],
  "destination-wedding-in-udaipur-add-a-magician-to-the-timeline": [L.dest, L.udaipur, L.wedding],
  "magician-for-birthday-party-in-udaipur-full-planning-run-sheet": [L.udaipur, L.birthday],
  "wedding-magician-vs-dj-vs-band-what-udaipur-couples-actually-pick": [L.wedding, L.udaipur],
  "how-much-does-a-wedding-magician-cost-in-rajasthan": [L.wedding, L.udaipur, L.packages],
  "10-close-up-magic-moments-that-stop-a-sangeet-crowd": [L.wedding, L.dest],
  // ── Wedding cluster → /services/wedding-magician ──
  "magician-for-wedding-in-india-what-top-hosts-book-and-what-they-avoid": [L.wedding, L.packages],
  "wedding-entertainment-ideas": [L.wedding, L.dest],
  "sangeet-mehendi-entertainment-ideas": [L.wedding, L.dest],
  "close-up-magician-for-indian-weddings-roaming-magic-explained": [L.wedding],
  "magician-in-jaipur": [L.wedding, L.udaipur],
  "magician-in-delhi-for-weddings-events-the-complete-booking-guide": [L.wedding],
  // ── Corporate cluster → /services/corporate-shows ──
  "best-magician-in-india-for-corporate-events-the-2026-booking-guide": [L.corporate],
  "corporate-annual-day-magic-show-the-45-minute-format-that-works": [L.corporate, L.virtual],
  "mentalist-for-corporate-events-in-india-what-mind-reading-adds-to-your-evening": [L.corporate],
  "corporate-event-entertainment": [L.corporate, L.virtual],
  "mentalism-mind-reading-show-india": [L.corporate],
  // ── Birthday cluster → /services/birthday-kids ──
  "birthday-party-magician-cost-in-india-2026-city-wise-price-bands": [L.birthday, L.packages],
  "birthday-party-magician-timeline": [L.birthday],
  // ── College → /services/college-stage ──
  "college-fest-magic-headliner": [L.college],
  // ── Virtual → /services/virtual-magic ──
  "virtual-magic-show-online-events": [L.virtual],
  // ── Pricing/booking funnels ──
  "magic-show-cost-india": [L.packages, L.wedding, L.birthday],
  "how-to-book-a-magician-in-india-the-complete-2026-checklist": [L.booking, L.packages],
};

(async () => {
  let touched = 0;
  let added = 0;
  for (const [slug, links] of Object.entries(MAP)) {
    const post = await db.blogPost.findUnique({ where: { slug }, select: { id: true, backlinks: true, status: true } });
    if (!post) {
      console.log(`SKIP (not found): ${slug}`);
      continue;
    }
    const existing = Array.isArray(post.backlinks) ? post.backlinks : [];
    const existingUrls = new Set(existing.map((b) => (b && b.url) || ""));
    const fresh = links.filter((l) => !existingUrls.has(l.url));
    if (fresh.length === 0) {
      console.log(`OK (already linked): ${slug}`);
      continue;
    }
    // Internal links go FIRST (most relevant), external refs stay after.
    const next = [...fresh, ...existing];
    await db.blogPost.update({ where: { id: post.id }, data: { backlinks: next } });
    touched += 1;
    added += fresh.length;
    console.log(`UPDATED: ${slug} (+${fresh.length} internal links)`);
  }
  console.log(`\nDone. ${touched} posts updated, ${added} internal links added.`);
  await db.$disconnect();
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
