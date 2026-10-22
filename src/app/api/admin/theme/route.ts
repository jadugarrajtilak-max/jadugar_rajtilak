import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { THEME_TOKEN_MAP } from "@/lib/customization";
import { isAdminRequest, unauthorized } from "@/lib/guard";

export const dynamic = "force-dynamic";

type PutBody = {
  colors?: Record<string, string>;
};

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

// PUT /api/admin/theme — save the full theme color set.
export async function PUT(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const body = (await req.json().catch(() => null)) as PutBody | null;
    const colors = body?.colors;
    if (!colors || typeof colors !== "object") {
      return NextResponse.json({ ok: false, error: "No colors supplied" }, { status: 400 });
    }

    const entries = Object.entries(colors).filter(
      ([key, value]) => key in THEME_TOKEN_MAP && typeof value === "string" && HEX_RE.test(value)
    );
    if (entries.length === 0) {
      return NextResponse.json({ ok: false, error: "No valid colors" }, { status: 400 });
    }

    await Promise.all(
      entries.map(([key, value]) =>
        db.siteTheme.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      )
    );
    return NextResponse.json({ ok: true, count: entries.length });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not save the theme" }, { status: 500 });
  }
}
