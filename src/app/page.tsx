import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ensureBlogSeeded, toPublicPost } from "@/lib/blog";
import { BLOG_POSTS } from "@/lib/content";
import { SiteShell } from "@/components/site/site-shell";
import { parseRoutePath } from "@/lib/routes";
import type { InitialPost } from "@/lib/post-types";

// Server component — reads the middleware-stamped pathname so deep
// links (/about, /gallery, /blog/<slug>, legacy /shows …) server-render
// the correct view and per-route <title>/description/canonical in the
// raw HTML that crawlers and link previews consume. Without this the
// SPA shell shipped the home meta for every URL (duplicate meta issue).
export const dynamic = "force-dynamic";

// Shared mapper: one DB row → the InitialPost prop shape.
function toInitialPost(row: Parameters<typeof toPublicPost>[0]): InitialPost {
  const pub = toPublicPost(row);
  return {
    slug: pub.slug,
    title: pub.title,
    excerpt: pub.excerpt ?? "",
    category: pub.category,
    readingTime: pub.readingTime ?? "",
    keywords: pub.keywords ?? "",
    date: pub.publishedAt,
    publishedISO: row.publishedAt.toISOString(),
    updatedISO: row.updatedAt.toISOString(),
    intro: pub.intro ?? "",
    sections: pub.sections,
    closing: pub.closing ?? "",
    featured: pub.featured,
    metaTitle: pub.metaTitle ?? null,
    metaDescription: pub.metaDescription ?? null,
    featuredImage: pub.featuredImage ?? null,
    featuredImageAlt: pub.featuredImageAlt ?? null,
    backlinks: pub.backlinks ?? [],
    author: pub.author ?? "Jadugar Rajtilak",
  };
}

// ── /blog/<slug>: load the published post server-side ──────────
// The post's own metaTitle/metaDescription/canonical are stamped into
// the raw HTML, the full article body SSRs inside the Reading Room,
// and unknown/draft slugs return a real 404 instead of the blog index
// (soft-404 cleanup). If the database is unreachable we fail open with
// the static fallback list so the site never breaks on a DB blip.
async function loadInitialPost(slug: string): Promise<InitialPost | null | undefined> {
  // undefined = "could not determine" (DB down → render blog index)
  try {
    const row = await db.blogPost.findUnique({ where: { slug } });
    if (!row || row.status !== "published") return null; // unknown/draft → 404
    return toInitialPost(row);
  } catch {
    // DB unreachable — fall back to the shipped static posts.
    const sp = BLOG_POSTS.find((p) => p.slug === slug);
    if (!sp) return undefined; // cannot confirm → blog index renders
    return {
      slug: sp.slug,
      title: sp.title,
      excerpt: sp.excerpt,
      category: sp.category,
      readingTime: sp.readingTime,
      keywords: sp.keywords,
      date: sp.date,
      publishedISO: new Date(sp.date).toISOString(),
      updatedISO: new Date(sp.date).toISOString(),
      intro: sp.body.intro,
      sections: sp.body.sections,
      closing: sp.body.closing,
      featured: sp.featured ?? false,
      metaTitle: null,
      metaDescription: null,
      featuredImage: null,
      featuredImageAlt: null,
      backlinks: [],
      author: "Jadugar Rajtilak",
    };
  }
}

// ── /blog index: EVERY published post server-renders into the raw
// HTML (manager audit T-03, 2026-10-29). The listing cards are real
// <a href="/blog/<slug>"> anchors now, so crawlers, social scrapers
// and AI answer engines discover all posts from the hub page without
// JS rendering — previously only 6 static-fallback cards appeared in
// the raw HTML and every card was a <button>. Returns [] on DB failure
// so BlogView falls back to the shipped static list.
async function loadAllPosts(): Promise<InitialPost[]> {
  try {
    await ensureBlogSeeded();
    const rows = await db.blogPost.findMany({
      where: { status: "published" },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    });
    return rows.map(toInitialPost);
  } catch {
    return [];
  }
}

export default async function Page() {
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/";
  const { route, blogSlug } = parseRoutePath(pathname);

  let initialPost: InitialPost | null = null;
  let initialPosts: InitialPost[] = [];
  if (route === "blog" && blogSlug) {
    const post = await loadInitialPost(blogSlug);
    if (post === null) notFound(); // unknown or draft slug → real 404
    initialPost = post ?? null; // undefined (DB down) → blog index renders
  } else if (route === "blog") {
    initialPosts = await loadAllPosts();
  }

  return (
    <SiteShell
      initialRoute={route}
      initialBlogSlug={blogSlug}
      initialPost={initialPost}
      initialPosts={initialPosts}
    />
  );
}
