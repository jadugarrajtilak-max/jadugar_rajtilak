import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isAdminRequest, unauthorized } from "@/lib/guard";
import {
  GA_ID_KEY,
  GSC_TOKEN_KEY,
  GA_ID_FALLBACK,
  isValidGaId,
  isValidGscToken,
} from "@/lib/settings";

export const dynamic = "force-dynamic";

type PutBody = {
  gaId?: string;
  gscToken?: string;
};

// GET /api/admin/settings — current integration keys (for the form).
export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const rows = await db.siteSetting.findMany({
      where: { key: { in: [GA_ID_KEY, GSC_TOKEN_KEY] } },
      select: { key: true, value: true },
    });
    const map = new Map(rows.map((r) => [r.key, r.value]));
    return NextResponse.json({
      ok: true,
      gaId: map.get(GA_ID_KEY) ?? GA_ID_FALLBACK,
      gscToken: map.get(GSC_TOKEN_KEY) ?? "",
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not read the settings" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings — save GA4 measurement ID + GSC verification
// token, then purge the ISR cache so the new keys serve immediately.
export async function PUT(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const body = (await req.json().catch(() => null)) as PutBody | null;
    const gaId = typeof body?.gaId === "string" ? body.gaId.trim() : undefined;
    const gscToken =
      typeof body?.gscToken === "string" ? body.gscToken.trim() : undefined;

    if (gaId === undefined && gscToken === undefined) {
      return NextResponse.json(
        { ok: false, error: "Nothing to save" },
        { status: 400 }
      );
    }
    if (gaId !== undefined && !isValidGaId(gaId)) {
      return NextResponse.json(
        { ok: false, error: "GA4 Measurement ID looks like G-XXXXXXXXXX" },
        { status: 400 }
      );
    }
    if (gscToken !== undefined && !isValidGscToken(gscToken)) {
      return NextResponse.json(
        { ok: false, error: "That does not look like a Search Console token" },
        { status: 400 }
      );
    }

    const saves: Promise<unknown>[] = [];
    if (gaId !== undefined) {
      saves.push(
        db.siteSetting.upsert({
          where: { key: GA_ID_KEY },
          update: { value: gaId },
          create: { key: GA_ID_KEY, value: gaId },
        })
      );
    }
    if (gscToken !== undefined) {
      saves.push(
        db.siteSetting.upsert({
          where: { key: GSC_TOKEN_KEY },
          update: { value: gscToken },
          create: { key: GSC_TOKEN_KEY, value: gscToken },
        })
      );
    }
    await Promise.all(saves);

    // Purge the ISR cache so the root layout re-renders with the new
    // gtag ID / verification meta on the next request.
    try {
      revalidatePath("/", "layout");
    } catch {
      /* revalidation is best-effort; ISR (300s) is the backstop */
    }

    return NextResponse.json({ ok: true, saved: saves.length });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not save the settings" },
      { status: 500 }
    );
  }
}
