import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/media/[id] — serve an admin-uploaded image stored in the
// Postgres MediaAsset tier (portable storage for serverless hosts).
// Every upload gets a unique id, so the response is immutable and
// safe to cache forever at the CDN edge; a replaced image is a NEW
// id + a new URL (cache-busting by construction, never a stale hit).
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!/^[a-z0-9]{10,}$/i.test(id)) {
      return new NextResponse("Not found", { status: 404 });
    }
    const row = await db.mediaAsset.findUnique({ where: { id } });
    if (!row) {
      return new NextResponse("Not found", { status: 404 });
    }
    const buf = Buffer.from(row.data, "base64");
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": row.mime,
        "Content-Length": String(buf.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Media unavailable", { status: 500 });
  }
}
