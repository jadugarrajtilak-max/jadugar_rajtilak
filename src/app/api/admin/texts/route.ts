import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { TEXT_LINE_MAP } from "@/lib/customization";
import { isAdminRequest, unauthorized } from "@/lib/guard";

export const dynamic = "force-dynamic";

type PutBody = {
  updates?: { key: string; value: string }[];
};

// PUT /api/admin/texts — bulk upsert text lines (one page save).
export async function PUT(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const body = (await req.json().catch(() => null)) as PutBody | null;
    const updates = body?.updates;
    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ ok: false, error: "No updates supplied" }, { status: 400 });
    }

    const valid = updates.filter(
      (u) => typeof u.key === "string" && typeof u.value === "string" && u.key in TEXT_LINE_MAP
    );
    if (valid.length === 0) {
      return NextResponse.json({ ok: false, error: "No valid text keys" }, { status: 404 });
    }

    await Promise.all(
      valid.map((u) =>
        db.siteText.upsert({
          where: { key: u.key },
          update: { value: u.value },
          create: { key: u.key, value: u.value },
        })
      )
    );
    return NextResponse.json({ ok: true, count: valid.length });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not save the text lines" }, { status: 500 });
  }
}
