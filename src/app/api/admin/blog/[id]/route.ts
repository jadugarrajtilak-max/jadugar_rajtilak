import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminRequest, unauthorized } from "@/lib/guard";
import { normalize, type PostInput } from "../route";

export const dynamic = "force-dynamic";

// PUT /api/admin/blog/[id] — update a post (draft or published).
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const { id } = await params;
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
    // Slug uniqueness across OTHER posts (this row keeps its own).
    const clash = await db.blogPost.findFirst({
      where: { slug: data.slug, NOT: { id } },
      select: { id: true },
    });
    if (clash) {
      return NextResponse.json({ ok: false, error: `Slug "${data.slug}" is already used by another post` }, { status: 409 });
    }
    const row = await db.blogPost.update({ where: { id }, data });
    return NextResponse.json({ ok: true, post: row });
  } catch (e) {
    const notFound = e instanceof Error && /not found/i.test(e.message);
    return NextResponse.json(
      { ok: false, error: notFound ? "Post not found" : "Could not save the post" },
      { status: notFound ? 404 : 500 }
    );
  }
}

// DELETE /api/admin/blog/[id] — remove a post.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const { id } = await params;
    await db.blogPost.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const notFound = e instanceof Error && /not found/i.test(e.message);
    return NextResponse.json(
      { ok: false, error: notFound ? "Post not found" : "Could not delete the post" },
      { status: notFound ? 404 : 500 }
    );
  }
}
