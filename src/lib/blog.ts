import { db } from "@/lib/db";
import { BLOG_POSTS, type BlogSection } from "@/lib/content";

// ── Shared blog domain logic (server-side) ──────────────────────────
// DB rows are the source of truth once seeded; the static BLOG_POSTS
// array in content.ts is the fallback when the API is unreachable.

export type Backlink = { text: string; url: string };

export type BlogPostRow = {
  id: string;
  slug: string;
  title: string;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string | null;
  excerpt: string | null;
  category: string;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  intro: string | null;
  sections: BlogSection[];
  closing: string | null;
  backlinks: Backlink[];
  readingTime: string | null;
  status: string;
  featured: boolean;
  author: string;
  publishedAt: string;
  updatedAt: string;
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function computeReadingTime(intro: string, sections: BlogSection[], closing: string): string {
  const words = [
    intro,
    closing,
    ...sections.flatMap((s) => s.paras ?? []),
  ]
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min`;
}

function asSections(value: unknown): BlogSection[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((s): s is Record<string, unknown> => !!s && typeof s === "object")
    .map((s) => ({
      h: typeof s.h === "string" ? s.h : "",
      paras: Array.isArray(s.paras)
        ? s.paras.filter((p): p is string => typeof p === "string")
        : [],
    }))
    .filter((s) => s.h.length > 0);
}

function asBacklinks(value: unknown): Backlink[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((b): b is Record<string, unknown> => !!b && typeof b === "object")
    .map((b) => ({
      text: typeof b.text === "string" ? b.text : "",
      url: typeof b.url === "string" ? b.url : "",
    }))
    .filter((b) => b.text.length > 0 && /^https?:\/\//i.test(b.url));
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function friendlyDate(iso: Date | string): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "";
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

type DbRow = {
  id: string; slug: string; title: string; metaTitle: string | null;
  metaDescription: string | null; keywords: string | null; excerpt: string | null;
  category: string; featuredImage: string | null; featuredImageAlt: string | null;
  intro: string | null; sections: unknown; closing: string | null; backlinks: unknown;
  readingTime: string | null; status: string; featured: boolean; author: string;
  publishedAt: Date; updatedAt: Date;
};

export function toPublicPost(row: DbRow): BlogPostRow {
  const sections = asSections(row.sections);
  const intro = row.intro ?? "";
  const closing = row.closing ?? "";
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    keywords: row.keywords,
    excerpt: row.excerpt ?? "",
    category: row.category,
    featuredImage: row.featuredImage,
    featuredImageAlt: row.featuredImageAlt,
    intro,
    sections,
    closing,
    backlinks: asBacklinks(row.backlinks),
    readingTime:
      row.readingTime?.trim() || computeReadingTime(intro, sections, closing),
    status: row.status,
    featured: row.featured,
    author: row.author,
    publishedAt: friendlyDate(row.publishedAt),
    updatedAt: friendlyDate(row.updatedAt),
  };
}

// One-time (idempotent) seed: copies the static Journal entries into the
// BlogPost table so the Master Admin can edit them like any other post.
// Safe under concurrency — every row is an upsert keyed on the unique slug.
export async function ensureBlogSeeded(): Promise<void> {
  const count = await db.blogPost.count();
  if (count > 0) return;
  await Promise.all(
    BLOG_POSTS.map((p) =>
      db.blogPost.upsert({
        where: { slug: p.slug },
        update: {},
        create: {
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          category: p.category,
          keywords: p.keywords,
          intro: p.body.intro,
          sections: p.body.sections as unknown as object[],
          closing: p.body.closing,
          readingTime: p.readingTime,
          status: "published",
          featured: p.featured ?? false,
        },
      })
    )
  );
}
