import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureBlogSeeded, toPublicPost } from "@/lib/blog";

export const dynamic = "force-dynamic";

// GET /api/blog/[slug] — one published article (used for SEO previews,
// social unfurls and deep-linked /blog/<slug> visits).
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!/^[a-z0-9-]{2,120}$/.test(slug)) {
      return NextResponse.json({ ok: false, error: "Bad slug" }, { status: 400 });
    }
    await ensureBlogSeeded();
    const row = await db.blogPost.findFirst({
      where: { slug, status: "published" },
    });
    if (!row) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, post: toPublicPost(row) });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not load the entry" }, { status: 500 });
  }
}
