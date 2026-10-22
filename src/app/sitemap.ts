import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { BLOG_POSTS } from "@/lib/content";

export const dynamic = "force-dynamic";

const SITE = "https://jadugarrajtilak.com";
const TODAY = new Date().toISOString().slice(0, 10);

// Static site pages (SPA shell routes — all real, crawlable URLs).
const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: `${SITE}/`, changeFrequency: "weekly", priority: 1, lastModified: TODAY },
  { url: `${SITE}/services`, changeFrequency: "monthly", priority: 0.9, lastModified: TODAY },
  { url: `${SITE}/booking`, changeFrequency: "monthly", priority: 0.9, lastModified: TODAY },
  { url: `${SITE}/about`, changeFrequency: "monthly", priority: 0.8, lastModified: TODAY },
  { url: `${SITE}/packages`, changeFrequency: "monthly", priority: 0.8, lastModified: TODAY },
  { url: `${SITE}/contact`, changeFrequency: "monthly", priority: 0.8, lastModified: TODAY },
  { url: `${SITE}/gallery`, changeFrequency: "weekly", priority: 0.7, lastModified: TODAY },
  { url: `${SITE}/testimonials`, changeFrequency: "weekly", priority: 0.7, lastModified: TODAY },
  { url: `${SITE}/blog`, changeFrequency: "weekly", priority: 0.6, lastModified: TODAY },
  { url: `${SITE}/faq`, changeFrequency: "monthly", priority: 0.6, lastModified: TODAY },
  { url: `${SITE}/legal`, changeFrequency: "yearly", priority: 0.3, lastModified: TODAY },
];

// Dynamic sitemap: every published Journal article gets its own
// /blog/<slug> URL automatically the moment it is saved in the CMS.
// Falls back to the static entries if the database is unreachable so
// the sitemap never 500s.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let blogUrls: MetadataRoute.Sitemap = [];
  try {
    const posts = await db.blogPost.findMany({
      where: { status: "published" },
      select: { slug: true, updatedAt: true },
    });
    blogUrls = posts.map((p) => ({
      url: `${SITE}/blog/${p.slug}`,
      changeFrequency: "monthly",
      priority: 0.6,
      lastModified: p.updatedAt.toISOString().slice(0, 10),
    }));
  } catch {
    blogUrls = BLOG_POSTS.map((p) => ({
      url: `${SITE}/blog/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      lastModified: TODAY,
    }));
  }
  return [...STATIC_PAGES, ...blogUrls];
}
