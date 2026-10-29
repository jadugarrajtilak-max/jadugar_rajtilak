import { cache } from "react";
import { db } from "@/lib/db";

// ─────────────────────────────────────────────────────────────
// Site integrations — Google Analytics 4 + Google Search Console.
// Values live in the SiteSetting table and are edited from
// Master Admin → Settings (no redeploy needed):
//   seo.ga.id     → GA4 Measurement ID (G-…). Rendered by the root
//                   layout's gtag bootstrap. Empty = measurement off.
//   seo.gsc.token → google-site-verification meta token. Empty = no
//                   verification tag emitted.
// The root layout reads these during ISR regeneration (revalidate
// 300 s) and the admin settings route calls revalidatePath on save,
// so a saved key goes live on the next request — never a rebuild.
// ─────────────────────────────────────────────────────────────

export const GA_ID_KEY = "seo.ga.id";
export const GSC_TOKEN_KEY = "seo.gsc.token";

// Fallback when the DB has no row yet — the property created in the
// user's GA account for jadugarrajtilak.com (stream 16179189686).
export const GA_ID_FALLBACK = "G-103JFH1Z6B";

export type SiteSettings = {
  gaId: string;
  gscToken: string;
};

// React cache() dedupes the query per request/regeneration — the
// layout may read settings more than once (script + metadata).
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const rows = await db.siteSetting.findMany({
      where: { key: { in: [GA_ID_KEY, GSC_TOKEN_KEY] } },
      select: { key: true, value: true },
    });
    const map = new Map(rows.map((r) => [r.key, r.value]));
    return {
      gaId: (map.get(GA_ID_KEY) ?? GA_ID_FALLBACK).trim(),
      gscToken: (map.get(GSC_TOKEN_KEY) ?? "").trim(),
    };
  } catch {
    // DB hiccup must never take the site down — fall back to the
    // known-good GA property and no verification tag.
    return { gaId: GA_ID_FALLBACK, gscToken: "" };
  }
});

// Validation for the admin API.
export function isValidGaId(v: string): boolean {
  return v === "" || /^G-[A-Z0-9]{6,12}$/.test(v.trim());
}
export function isValidGscToken(v: string): boolean {
  // Google tokens are base64url-ish; be permissive but bounded.
  return v === "" || /^[A-Za-z0-9_-]{8,256}$/.test(v.trim());
}
