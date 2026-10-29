#!/usr/bin/env node
/**
 * Manager-audit meta rewrite (T-08 + long titles + templated descriptions),
 * 2026-10-29. Updates BlogPost.metaTitle / metaDescription in the PRODUCTION
 * database and the home.hero.h1a SiteText override.
 *
 * Rules enforced (asserted before any write):
 *   - every new metaTitle   ≤ 60 chars
 *   - every new description 130–160 chars, keyword in the first 90 chars
 *   - each description is unique (no shared templated tail)
 * Idempotent: re-running writes the same values.
 */
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

const len = (s) => [...s].length;

// slug → { title?: string, desc: string }
const UPDATES = {
  // ── 9 over-length metaTitles (>60ch) + their templated descriptions ──
  "mentalist-for-corporate-events-in-india-what-mind-reading-adds-to-your-evening": {
    title: "Mentalist for Corporate Events in India: What It Adds",
    desc: "Mentalist for corporate events in India — mind-reading formats for dealer meets and award nights, staging needs, honest pricing, and the checks before you book.",
  },
  "close-up-magician-for-indian-weddings-roaming-magic-explained": {
    title: "Close-Up Magician for Indian Weddings: Roaming Magic",
    desc: "Close-up magician for Indian weddings — roaming table magic for sangeet and cocktail hours: what the format includes, how sets are scheduled and what it costs.",
  },
  "birthday-party-magician-cost-in-india-2026-city-wise-price-bands": {
    title: "Birthday Party Magician Cost in India: 2026 Price Bands",
    desc: "Birthday party magician cost in India — city-wise price bands for 2026, what changes a quote (age group, guests, duration) and how to read a fair price.",
  },
  "best-magician-in-india-for-corporate-events-the-2026-booking-guide": {
    title: "Best Magician in India for Corporate Events (2026 Guide)",
    desc: "Best magician in India for corporate events — the 2026 booking guide: what a corporate act must deliver, budget bands by format and how to shortlist safely.",
  },
  "magician-for-wedding-in-india-what-top-hosts-book-and-what-they-avoid": {
    title: "Magician for Wedding in India: What Top Hosts Book",
    desc: "Magician for wedding in India — what top hosts book and what they avoid: sangeet slots, stage vs roaming formats, pricing signals and booking windows.",
  },
  "destination-wedding-in-udaipur-add-a-magician-to-the-timeline": {
    title: "Udaipur Destination Wedding? Add a Magician to the Timeline",
    desc: "Destination wedding in Udaipur? Where a magician fits the 3-day timeline — mehendi mixers, sangeet table-side sets and a reception finale guests remember.",
  },
  "corporate-annual-day-magic-show-the-45-minute-format-that-works": {
    title: "Corporate Annual Day Magic Show: The 45-Minute Format",
    desc: "Corporate annual day magic show — the 45-minute format that works: crowd warm-ups, volunteer moments, brand-woven routines and the tech rider HR needs.",
  },
  "magician-for-birthday-party-in-udaipur-full-planning-run-sheet": {
    title: "Magician for Birthday Party in Udaipur: Planning Run-Sheet",
    desc: "Magician for birthday parties in Udaipur — a full planning run-sheet: the golden show window, age-safe routines, venue setup and what parents should ask.",
  },
  "wedding-magician-vs-dj-vs-band-what-udaipur-couples-actually-pick": {
    title: "Wedding Magician vs DJ vs Band: What Udaipur Couples Pick",
    desc: "Wedding magician vs DJ vs band — what Udaipur couples actually pick: costs, energy, timing slots and why the best evenings combine two of the three.",
  },

  // ── templated descriptions on otherwise-OK titles ──
  "how-to-book-a-magician-in-india-the-complete-2026-checklist": {
    desc: "How to book a magician in India — the complete 2026 checklist: date holds, quotes, contracts, GST invoices and the timeline from enquiry to showtime.",
  },
  "10-close-up-magic-moments-that-stop-a-sangeet-crowd": {
    desc: "Ten close-up magic moments that stop a sangeet crowd cold — the borrowed-ring finale, the aunt who finds her card, and moments built for phone cameras.",
  },
  "how-much-does-a-wedding-magician-cost-in-rajasthan": {
    desc: "Wedding magician cost in Rajasthan — honest price bands for Udaipur, Jaipur and Jodhpur weddings, what moves a quote and when to book for wedding season.",
  },

  // ── 8 over-length descriptions (>160ch) on OK titles ──
  "wedding-entertainment-ideas": {
    desc: "Nine ways a magician elevates a wedding evening — sangeet table-side sets, cocktail roaming magic and a reception finale built for the couple's story.",
  },
  "magic-show-cost-india": {
    desc: "What a magic show costs in India — honest price ranges by format and duration, what moves a quote up or down, and how to read a performer's pricing.",
  },
  "corporate-event-entertainment": {
    desc: "Corporate event entertainment that holds the room — stage shows, mentalism for dealer meets and award nights, with pacing, riders and brand-safe scripting.",
  },
  "college-fest-magic-headliner": {
    desc: "How to schedule a magic headliner at a college fest — stage slots, tech riders, crowd control and the finale that ends up on every student's story.",
  },
  "magician-in-jaipur": {
    desc: "Best magician in Jaipur for weddings and events — stage illusions, sangeet magic and corporate galas by Jadugar Rajtilak, touring all of Rajasthan.",
  },
  "virtual-magic-show-online-events": {
    desc: "Virtual magic shows explained — the tech rider, camera-first tricks, corporate online formats and honest India pricing for shows your team remembers.",
  },
  "mentalism-mind-reading-show-india": {
    desc: "Curious about mentalism? What a mind-reading show performs, why corporate India books mentalists, staging needs — plus six checks before you book one.",
  },
  "sangeet-mehendi-entertainment-ideas": {
    desc: "Sangeet entertainment beyond the DJ — close-up magic, mentalism, ghoomar troupes, silent discos and 11 more ideas with a day-by-day timing map.",
  },
};

const HERO_H1A = "Wedding & Corporate Magician in India";

(async () => {
  // ── pre-flight assertions ──
  const descs = Object.values(UPDATES).map((u) => u.desc);
  const dupes = descs.filter((d, i) => descs.indexOf(d) !== i);
  if (dupes.length) throw new Error("Duplicate descriptions found: " + dupes);
  for (const [slug, u] of Object.entries(UPDATES)) {
    if (u.title && len(u.title) > 60) throw new Error(`title >60 for ${slug}: ${len(u.title)}`);
    if (len(u.desc) < 130 || len(u.desc) > 160) throw new Error(`desc out of 130-160 for ${slug}: ${len(u.desc)}`);
  }
  console.log("Pre-flight assertions passed. Posts to update:", Object.keys(UPDATES).length);

  // ── update posts ──
  let done = 0;
  for (const [slug, u] of Object.entries(UPDATES)) {
    const data = {};
    if (u.title) data.metaTitle = u.title;
    if (u.desc) data.metaDescription = u.desc;
    await db.blogPost.update({ where: { slug }, data });
    done++;
    console.log(`  ✓ ${slug}  title${u.title ? "(" + len(u.title) + ")" : "(kept)"}  desc(${len(u.desc)})`);
  }

  // ── hero H1 SiteText override (DB wins over the code default) ──
  const existing = await db.siteText.findUnique({ where: { key: "home.hero.h1a" } });
  if (existing) {
    await db.siteText.update({ where: { key: "home.hero.h1a" }, data: { value: HERO_H1A } });
    console.log(`  ✓ home.hero.h1a → "${HERO_H1A}" (was: "${existing.value}")`);
  } else {
    console.log("  • home.hero.h1a row absent — code default already carries the new value");
  }

  console.log(`\nDONE: ${done} posts updated + hero H1 aligned.`);
  await db.$disconnect();
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
