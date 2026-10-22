import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  IMAGE_SLOTS,
  TEXT_LINES,
  THEME_TOKENS,
  defaultPayload,
} from "@/lib/customization";

export const dynamic = "force-dynamic";

// GET /api/site/customization — public payload consumed by the live site.
// Returns the shipped defaults merged with Master Admin overrides
// (images, text lines, theme colors). Never cached, so admin edits go
// live on the next fetch (route change, tab focus or hard reload).
export async function GET() {
  try {
    const [assetRows, textRows, themeRows] = await Promise.all([
      db.siteAsset.findMany(),
      db.siteText.findMany(),
      db.siteTheme.findMany(),
    ]);

    const payload = defaultPayload();
    let rev = 0;

    for (const row of assetRows) {
      if (payload.assets[row.key]) {
        payload.assets[row.key] = { src: row.src, alt: row.alt };
        rev += row.updatedAt.getTime();
      }
    }
    for (const row of textRows) {
      if (row.key in payload.texts) {
        payload.texts[row.key] = row.value;
        rev += row.updatedAt.getTime();
      }
    }
    for (const row of themeRows) {
      if (row.key in payload.theme) {
        payload.theme[row.key] = row.value;
        rev += row.updatedAt.getTime();
      }
    }
    payload.rev = rev;

    return NextResponse.json(payload, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    // Database not ready (fresh deploy) — serve defaults so the site
    // always renders with its shipped content.
    return NextResponse.json(defaultPayload(), {
      headers: { "Cache-Control": "no-store" },
    });
  }
}
