import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminRequest, unauthorized } from "@/lib/guard";
import { TRACKED_KEYWORDS, runRankSweep } from "@/lib/rank-tracker";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ── Master Admin → Keyword Rankings ─────────────────────────────
// GET  /api/admin/rankings — latest position + 14-day history for
//       each tracked keyword (the Rankings card in Analytics).
// POST /api/admin/rankings — run a fresh sweep now (same engine the
//       daily cron uses) and return the new standings.
//
// Rows are written by /api/cron/rank-track daily at 06:15 UTC and by
// this manual trigger. position=null means "checked, not in top 30".

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const since = new Date(Date.now() - 21 * 24 * 3600 * 1000);
    // sequential-friendly: one fetch for the window, group in JS
    const rows = await db.keywordRank.findMany({
      where: { checkedAt: { gte: since } },
      orderBy: { checkedAt: "asc" },
    });

    const byKeyword = new Map<string, typeof rows>();
    for (const r of rows) {
      const list = byKeyword.get(r.keyword) ?? [];
      list.push(r);
      byKeyword.set(r.keyword, list);
    }

    const keywords = TRACKED_KEYWORDS.map(({ keyword, intent }) => {
      const hist = byKeyword.get(keyword) ?? [];
      const last = hist[hist.length - 1] ?? null;
      // previous value from a DIFFERENT day (trend arrow)
      const prevRow =
        [...hist].reverse().find((r) => last && r.checkedAt.toDateString() !== last.checkedAt.toDateString()) ?? null;
      const pos = last?.position ?? null;
      const prev = prevRow?.position ?? null;
      const trend: "up" | "down" | "flat" | "new" | null =
        pos === null ? null : prev === null ? "new" : pos < prev ? "up" : pos > prev ? "down" : "flat";
      return {
        keyword,
        intent,
        position: pos,
        foundUrl: last?.foundUrl ?? null,
        checkedAt: last?.checkedAt?.toISOString() ?? null,
        engine: last?.engine ?? null,
        trend,
        prev,
        history: hist.slice(-14).map((h) => ({
          d: h.checkedAt.toISOString().slice(5, 10),
          p: h.position,
        })),
      };
    });

    const ranked = keywords.filter((k) => k.position !== null).length;
    return NextResponse.json({
      ok: true,
      asOf: rows.length ? rows[rows.length - 1].checkedAt.toISOString() : null,
      tracked: keywords.length,
      inTop30: ranked,
      keywords,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "failed to load rankings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const results = await runRankSweep();
    const ranked = results.filter((r) => r.position !== null).length;
    return NextResponse.json({
      ok: true,
      message: `Checked ${results.length} keywords — ${ranked} in top-30`,
      results,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "rank sweep failed" },
      { status: 500 }
    );
  }
}
