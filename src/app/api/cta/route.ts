import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/guard";

export const dynamic = "force-dynamic";

// ── CTA click collector (lead-generation visibility) ─────────────
// POST /api/cta { cta, path }
// Privacy-light, first-party: records WHICH high-intent CTA was tapped
// (whatsapp / call / booking / contact / quote) from which page and
// device class. No cookies, no PII. These taps are REAL buying signals
// — phone-channel enquiries that previously vanished into thin air now
// show up in Master Admin (Dashboard + Manager Agent funnel report)
// next to form leads.
//
// Failure is always silent (ok:true) — measurement must never break
// the CTA itself (the WhatsApp window still opens).

const ALLOWED = new Set(["whatsapp", "call", "booking", "contact", "quote"]);

function deviceClass(ua: string): string {
  const s = ua.toLowerCase();
  if (/bot|crawler|spider|crawling|preview|slurp|bing|semrush|ahrefs|lighthouse/.test(s)) return "bot";
  if (/ipad|tablet|silk/.test(s)) return "tablet";
  if (/mobi|iphone|android.*mobile/.test(s)) return "mobile";
  return "desktop";
}

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);
    if (!rateLimit(`cta:${ip}`, 40, 10 * 60 * 1000)) {
      return NextResponse.json({ ok: true, skipped: true });
    }
    const body = (await req.json().catch(() => null)) as { cta?: string; path?: string } | null;
    const cta = typeof body?.cta === "string" ? body.cta : "";
    if (!ALLOWED.has(cta)) {
      return NextResponse.json({ ok: true, skipped: true });
    }
    const rawPath = typeof body?.path === "string" ? body.path : "/";
    const path = rawPath.startsWith("/") ? rawPath.split("?")[0].slice(0, 300) : "/";
    const device = deviceClass(req.headers.get("user-agent") ?? "");
    if (device === "bot") {
      return NextResponse.json({ ok: true, skipped: true });
    }
    await db.ctaClick.create({ data: { cta, path, device } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true, skipped: true }); // never block the CTA
  }
}
