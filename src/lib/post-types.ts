// ── Initial post data (server → client shell) ─────────────────
// The server page (src/app/page.tsx) reads the middleware-stamped
// pathname, and for /blog/<slug> deep links it loads the published
// post straight from the database. The shape mirrors the BlogView's
// ClientPost so the Reading Room can render the full article inside
// the server-rendered HTML (crawlers + instant first paint), and
// RouteSeoTags can stamp the post's own <title>/description/canonical
// instead of the blog-index meta every post used to inherit.
export type InitialPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingTime: string;
  keywords: string;
  /** friendly display date (e.g. "12 Jun 2026") */
  date: string;
  /** ISO date for JSON-LD / sitemap consumers */
  publishedISO: string;
  updatedISO: string;
  intro: string;
  sections: { h: string; paras: string[] }[];
  closing: string;
  featured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  backlinks: { text: string; url: string }[];
  author: string;
};
