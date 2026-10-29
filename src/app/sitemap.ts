import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { BLOG_POSTS } from "@/lib/content";

export const dynamic = "force-dynamic";

const SITE = "https://jadugarrajtilak.com";

// SEO fix (audit T-05, 2026-10-28): lastmod used to be "today" on every
// build for all static pages — an unreliable signal Google learns to
// ignore. It now carries the real date of the last meaningful content
// change per page. 2026-10-29 (manager audit): homepage retuned to
// India-wide positioning (T-05), /blog listing cards became crawlable
// anchors with all posts SSR'd (T-03), /booking + /contact gained
// context intros (T-14), /faq gained FAQPage schema (T-17).
const LAST_CONTENT_CHANGE: Record<string, string> = {
  "/": "2026-10-29",
  "/services": "2026-10-29",
  "/packages": "2026-10-28",
  "/blog": "2026-10-29",
  "/magician-in-udaipur": "2026-10-28",
  "/about": "2026-10-22",
  "/gallery": "2026-10-22",
  "/testimonials": "2026-10-22",
  "/booking": "2026-10-29",
  "/faq": "2026-10-29",
  "/contact": "2026-10-29",
  "/legal": "2026-10-18",
  // Dedicated service money pages (audit T-13 / roadmap R-18..R-22 +
  // O-01) shipped 2026-10-29 — new URLs, priority 0.8, sitemap entry
  // on day one per the audit's rule for every new page.
  "/services/wedding-magician": "2026-10-29",
  "/services/corporate-shows": "2026-10-29",
  "/services/birthday-kids": "2026-10-29",
  "/services/college-stage": "2026-10-29",
  "/services/virtual-magic": "2026-10-29",
  "/services/private-luxury": "2026-10-29",
  "/destination-wedding-magician-udaipur": "2026-10-29",
};

// Static site pages (SPA shell routes — all real, crawlable URLs).
// /magician-in-udaipur is the local money page (audit A-02) — the two
// duplicate Udaipur blog guides now 301 into it.
const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: `${SITE}/`, changeFrequency: "weekly", priority: 1, lastModified: LAST_CONTENT_CHANGE["/"] },
  { url: `${SITE}/services`, changeFrequency: "monthly", priority: 0.9, lastModified: LAST_CONTENT_CHANGE["/services"] },
  { url: `${SITE}/booking`, changeFrequency: "monthly", priority: 0.9, lastModified: LAST_CONTENT_CHANGE["/booking"] },
  { url: `${SITE}/magician-in-udaipur`, changeFrequency: "monthly", priority: 0.9, lastModified: LAST_CONTENT_CHANGE["/magician-in-udaipur"] },
  // Dedicated service money pages — one URL per commercial keyword
  // (audit roadmap R-18, R-19, R-20, R-22 + O-01).
  { url: `${SITE}/services/wedding-magician`, changeFrequency: "monthly", priority: 0.8, lastModified: LAST_CONTENT_CHANGE["/services/wedding-magician"] },
  { url: `${SITE}/services/corporate-shows`, changeFrequency: "monthly", priority: 0.8, lastModified: LAST_CONTENT_CHANGE["/services/corporate-shows"] },
  { url: `${SITE}/services/birthday-kids`, changeFrequency: "monthly", priority: 0.8, lastModified: LAST_CONTENT_CHANGE["/services/birthday-kids"] },
  { url: `${SITE}/services/college-stage`, changeFrequency: "monthly", priority: 0.8, lastModified: LAST_CONTENT_CHANGE["/services/college-stage"] },
  { url: `${SITE}/services/virtual-magic`, changeFrequency: "monthly", priority: 0.7, lastModified: LAST_CONTENT_CHANGE["/services/virtual-magic"] },
  { url: `${SITE}/services/private-luxury`, changeFrequency: "monthly", priority: 0.7, lastModified: LAST_CONTENT_CHANGE["/services/private-luxury"] },
  { url: `${SITE}/destination-wedding-magician-udaipur`, changeFrequency: "monthly", priority: 0.9, lastModified: LAST_CONTENT_CHANGE["/destination-wedding-magician-udaipur"] },
  { url: `${SITE}/about`, changeFrequency: "monthly", priority: 0.8, lastModified: LAST_CONTENT_CHANGE["/about"] },
  { url: `${SITE}/packages`, changeFrequency: "monthly", priority: 0.8, lastModified: LAST_CONTENT_CHANGE["/packages"] },
  { url: `${SITE}/contact`, changeFrequency: "monthly", priority: 0.8, lastModified: LAST_CONTENT_CHANGE["/contact"] },
  { url: `${SITE}/gallery`, changeFrequency: "weekly", priority: 0.7, lastModified: LAST_CONTENT_CHANGE["/gallery"] },
  { url: `${SITE}/testimonials`, changeFrequency: "weekly", priority: 0.7, lastModified: LAST_CONTENT_CHANGE["/testimonials"] },
  { url: `${SITE}/blog`, changeFrequency: "weekly", priority: 0.6, lastModified: LAST_CONTENT_CHANGE["/blog"] },
  { url: `${SITE}/faq`, changeFrequency: "monthly", priority: 0.6, lastModified: LAST_CONTENT_CHANGE["/faq"] },
  { url: `${SITE}/legal`, changeFrequency: "yearly", priority: 0.3, lastModified: LAST_CONTENT_CHANGE["/legal"] },
];

// Dynamic sitemap: every published Journal article gets its own
// /blog/<slug> URL automatically the moment it is saved in the CMS.
// lastmod = the post's publish date (audit T-05: updatedAt jumps on any
// admin touch without content changing, which made every post look
// freshly edited). Falls back to the static entries if the database is
// unreachable so the sitemap never 500s.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let blogUrls: MetadataRoute.Sitemap = [];
  try {
    const posts = await db.blogPost.findMany({
      where: { status: "published" },
      select: { slug: true, publishedAt: true },
    });
    blogUrls = posts.map((p) => ({
      url: `${SITE}/blog/${p.slug}`,
      changeFrequency: "monthly",
      priority: 0.6,
      lastModified: p.publishedAt.toISOString().slice(0, 10),
    }));
  } catch {
    blogUrls = BLOG_POSTS.map((p) => ({
      url: `${SITE}/blog/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      lastModified: p.date,
    }));
  }
  return [...STATIC_PAGES, ...blogUrls];
}
