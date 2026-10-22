import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminRequest, unauthorized } from "@/lib/guard";

export const dynamic = "force-dynamic";

type ResetBody = {
  scope?: "assets" | "texts" | "theme" | "all";
  keys?: string[]; // optional: reset only these keys
};

// POST /api/admin/reset — restore shipped defaults for images, texts,
// theme (or everything). The live site reverts on its next fetch.
export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const body = (await req.json().catch(() => ({}))) as ResetBody;
    const scope = body.scope ?? "all";
    const keys = Array.isArray(body.keys) ? body.keys : null;

    const deletions: Promise<unknown>[] = [];
    if (scope === "assets" || scope === "all") {
      deletions.push(
        keys ? db.siteAsset.deleteMany({ where: { key: { in: keys } } }) : db.siteAsset.deleteMany()
      );
    }
    if (scope === "texts" || scope === "all") {
      deletions.push(
        keys ? db.siteText.deleteMany({ where: { key: { in: keys } } }) : db.siteText.deleteMany()
      );
    }
    if (scope === "theme" || scope === "all") {
      deletions.push(
        keys ? db.siteTheme.deleteMany({ where: { key: { in: keys } } }) : db.siteTheme.deleteMany()
      );
    }
    await Promise.all(deletions);

    return NextResponse.json({ ok: true, scope });
  } catch {
    return NextResponse.json({ ok: false, error: "Reset failed" }, { status: 500 });
  }
}
