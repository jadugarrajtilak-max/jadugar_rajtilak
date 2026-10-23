import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  IMAGE_SLOTS,
  TEXT_LINES,
  THEME_TOKENS,
  defaultPayload,
} from "@/lib/customization";

export const dynamic = "force-dynamic";

// ── One-time v3 gallery migration ──────────────────────────────
// The gallery was rebuilt (5 → 7 client-uploaded frames) and the
// recognition wall now shows the client's two certificate scans.
// Pre-v3 DB rows (old 10-frame captions, old LG-card certificate
// texts, old photo-slot overrides) would shadow the new shipped
// defaults, so they are evicted once on the first request after
// deploy. Rows authored by the client from Master Admin on pages we
// did not restructure (contact.*) are preserved. Idempotent and
// safe under concurrent invocations (deleteMany is race-free).
let v3Migrated = false;
const staleKeyPrefixes = ["gallery.item", "home.cert", "about.certificate", "certificates."];

async function migrateV3(): Promise<void> {
  if (v3Migrated) return;
  v3Migrated = true;
  const stale = { OR: staleKeyPrefixes.map((p) => ({ key: { startsWith: p } })) };
  try {
    const [t, a] = await Promise.all([
      db.siteText.deleteMany({ where: stale }),
      db.siteAsset.deleteMany({ where: stale }),
    ]);
    console.log(`[v3-migration] evicted ${t.count} stale text rows, ${a.count} stale asset rows`);
  } catch {
    /* fresh deploy — tables not reachable; shipped defaults already correct */
  }
}

// GET /api/site/customization — public payload consumed by the live site.
// Returns the shipped defaults merged with Master Admin overrides
// (images, text lines, theme colors). Never cached, so admin edits go
// live on the next fetch (route change, tab focus or hard reload).
export async function GET() {
  try {
    await migrateV3();

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
