import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureBlogSeeded, toPublicPost } from "@/lib/blog";

export const dynamic = "force-dynamic";

// GET /api/blog — public Journal index.
// Seeds the static entries once (idempotent), then serves published
// posts: featured first, newest after.
export async function GET() {
  try {
    await ensureBlogSeeded();
    const rows = await db.blogPost.findMany({
      where: { status: "published" },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    });
    return NextResponse.json({ ok: true, posts: rows.map(toPublicPost) });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not load the Journal" },
      { status: 500 }
    );
  }
}
