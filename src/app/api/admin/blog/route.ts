import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminRequest, unauthorized } from "@/lib/guard";
import { ensureBlogSeeded, slugify, toPublicPost, type Backlink } from "@/lib/blog";
import type { BlogSection } from "@/lib/content";

export const dynamic = "force-dynamic";

// ── Admin Blog CRUD: list (incl. drafts) + create ──

export type PostInput = {
  slug?: string;
  title?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  excerpt?: string;
  category?: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  intro?: string;
  sections?: BlogSection[];
  closing?: string;
  backlinks?: Backlink[];
  readingTime?: string;
  status?: string;
  featured?: boolean;
};

export function normalize(body: PostInput) {
  const title = (body.title ?? "").trim();
  const sections = (Array.isArray(body.sections) ? body.sections : [])
    .map((s) => ({
      h: String(s?.h ?? "").trim(),
      paras: (Array.isArray(s?.paras) ? s.paras : []).map((p) => String(p ?? "").trim()).filter(Boolean),
    }))
    .filter((s) => s.h.length > 0);
  const backlinks = (Array.isArray(body.backlinks) ? body.backlinks : [])
    .map((b) => ({ text: String(b?.text ?? "").trim(), url: String(b?.url ?? "").trim() }))
    .filter((b) => b.text.length > 0 && /^https?:\/\//i.test(b.url));
  return {
    title,
    slug: slugify(body.slug || title),
    metaTitle: (body.metaTitle ?? "").trim() || null,
    metaDescription: (body.metaDescription ?? "").trim() || null,
    keywords: (body.keywords ?? "").trim() || null,
    excerpt: (body.excerpt ?? "").trim() || null,
    category: (body.category ?? "Guides").trim() || "Guides",
    featuredImage: (body.featuredImage ?? "").trim() || null,
    featuredImageAlt: (body.featuredImageAlt ?? "").trim() || null,
    intro: (body.intro ?? "").trim() || null,
    sections: sections as unknown as object[],
    closing: (body.closing ?? "").trim() || null,
    backlinks: backlinks as unknown as object[],
    readingTime: (body.readingTime ?? "").trim() || null,
    status: body.status === "draft" ? "draft" : "published",
    featured: body.featured === true,
  };
}

// GET /api/admin/blog — every post, drafts included.
export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    await ensureBlogSeeded();
    const rows = await db.blogPost.findMany({
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    });
    return NextResponse.json({ ok: true, posts: rows.map(toPublicPost) });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not load posts" }, { status: 500 });
  }
}

// POST /api/admin/blog — create a post.
export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const body = (await req.json().catch(() => null)) as PostInput | null;
    if (!body) {
      return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
    }
    const data = normalize(body);
    if (data.title.length < 4) {
      return NextResponse.json({ ok: false, error: "Title needs at least 4 characters" }, { status: 422 });
    }
    if (data.slug.length < 2) {
      return NextResponse.json({ ok: false, error: "Could not derive a URL slug from the title" }, { status: 422 });
    }
    const clash = await db.blogPost.findUnique({ where: { slug: data.slug }, select: { id: true } });
    if (clash) {
      return NextResponse.json({ ok: false, error: `Slug "${data.slug}" is already used by another post` }, { status: 409 });
    }
    const row = await db.blogPost.create({ data });
    return NextResponse.json({ ok: true, post: toPublicPost(row) }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error && e.message.includes("Unique constraint")
      ? "That slug is already taken"
      : "Could not save the post";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
