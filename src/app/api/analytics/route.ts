import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/guard";

export const dynamic = "force-dynamic";

// ── First-party analytics collector ──────────────────────────
// POST /api/analytics { path, referrer }
// Privacy-light: stores path, referrer host and device class only —
// no cookies, no PII, no fingerprinting. Rate-limited per IP.
// Aggregated in the Master Admin Analytics tab; deep measurement
// stays in Google Analytics 4 (G-103JFH1Z6B).

const MAX_PATH = 300;
const MAX_REF = 300;

function deviceClass(ua: string): string {
  const s = ua.toLowerCase();
  if (/bot|crawler|spider|crawling|preview|slurp|bing|semrush|ahrefs|lighthouse/.test(s)) return "bot";
  if (/ipad|tablet|silk/.test(s)) return "tablet";
  if (/mobi|iphone|android.*mobile/.test(s)) return "mobile";
  return "desktop";
}

function refHost(ref: string | null): string | null {
  if (!ref) return null;
  try {
    return new URL(ref).hostname.slice(0, MAX_REF);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (!rateLimit(`analytics:${ip}`, 120, 10 * 60 * 1000)) {
    return NextResponse.json({ ok: true, skipped: true });
  }
  try {
    const body = (await req.json().catch(() => null)) as { path?: string; referrer?: string } | null;
    const rawPath = typeof body?.path === "string" ? body.path : "";
    if (!rawPath.startsWith("/") || rawPath.length > MAX_PATH) {
      return NextResponse.json({ ok: true, skipped: true });
    }
    // Normalise: strip query strings, keep blog slugs intact.
    const path = rawPath.split("?")[0].slice(0, MAX_PATH);
    if (path === "/admin") {
      return NextResponse.json({ ok: true, skipped: true }); // never log the console itself
    }
    const ua = req.headers.get("user-agent") ?? "";
    const device = deviceClass(ua);
    if (device === "bot") {
      return NextResponse.json({ ok: true, skipped: true }); // keep reports human
    }
    await db.pageView.create({
      data: { path, referrer: refHost(typeof body?.referrer === "string" ? body.referrer : null), device },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true, skipped: true }); // analytics must never 500 the client
  }
}
