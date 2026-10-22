import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { IMAGE_SLOT_MAP, TEXT_LINE_MAP, THEME_TOKEN_MAP } from "@/lib/customization";
import { isAdminRequest, unauthorized } from "@/lib/guard";

export const dynamic = "force-dynamic";

type PutBody = {
  kind?: "asset" | "text";
  key?: string;
  src?: string;
  alt?: string;
  value?: string;
};

// PUT /api/admin/assets — upsert one image slot (src and/or alt).
// The live site picks the change up on its next customization fetch.
export async function PUT(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const body = (await req.json().catch(() => null)) as PutBody | null;
    if (!body?.key) {
      return NextResponse.json({ ok: false, error: "Missing key" }, { status: 400 });
    }
    const slot = IMAGE_SLOT_MAP[body.key];
    if (!slot) {
      return NextResponse.json({ ok: false, error: "Unknown image slot" }, { status: 404 });
    }

    const data: { src?: string; alt?: string } = {};
    if (typeof body.src === "string" && body.src.trim().length > 0) data.src = body.src.trim();
    if (typeof body.alt === "string") data.alt = body.alt.trim();

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ ok: false, error: "Nothing to update" }, { status: 400 });
    }

    const row = await db.siteAsset.upsert({
      where: { key: body.key },
      update: data,
      create: {
        key: body.key,
        src: data.src ?? slot.defaultSrc,
        alt: data.alt ?? slot.defaultAlt,
      },
    });
    return NextResponse.json({ ok: true, asset: row });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not save the image slot" }, { status: 500 });
  }
}
