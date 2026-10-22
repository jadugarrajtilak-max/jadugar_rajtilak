import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminRequest, unauthorized } from "@/lib/guard";

export const dynamic = "force-dynamic";

// ── Master Admin → Analytics aggregation ─────────────────────
// GET /api/admin/analytics — first-party page-view numbers that
// complement GA4: totals for today / 7d / 30d, daily series, top
// pages and referrers, device split.

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const since30 = daysAgo(30);
    const since7 = daysAgo(7);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const [total30, total7, totalToday, series, topPages, topRefs, devices] = await Promise.all([
      db.pageView.count({ where: { createdAt: { gte: since30 } } }),
      db.pageView.count({ where: { createdAt: { gte: since7 } } }),
      db.pageView.count({ where: { createdAt: { gte: today } } }),
      db.pageView.groupBy({
        by: ["createdAt"],
        where: { createdAt: { gte: since30 } },
        _count: { _all: true },
      }),
      db.pageView.groupBy({
        by: ["path"],
        where: { createdAt: { gte: since30 } },
        _count: { _all: true },
        orderBy: { _count: { path: "desc" } },
        take: 10,
      }),
      db.pageView.groupBy({
        by: ["referrer"],
        where: { createdAt: { gte: since30 }, referrer: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { referrer: "desc" } },
        take: 10,
      }),
      db.pageView.groupBy({
        by: ["device"],
        where: { createdAt: { gte: since30 } },
        _count: { _all: true },
      }),
    ]);

    // Collapse the series into per-day counts.
    const perDay = new Map<string, number>();
    for (const row of series) {
      const k = dayKey(row.createdAt);
      perDay.set(k, (perDay.get(k) ?? 0) + row._count._all);
    }
    const seriesOut: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = daysAgo(i);
      const k = dayKey(d);
      seriesOut.push({ date: k, count: perDay.get(k) ?? 0 });
    }

    return NextResponse.json({
      ok: true,
      totals: { today: totalToday, last7: total7, last30: total30 },
      series: seriesOut,
      topPages: topPages.map((p) => ({ path: p.path, count: p._count._all })),
      topReferrers: topRefs.map((r) => ({ referrer: r.referrer ?? "(direct)", count: r._count._all })),
      devices: devices.map((d) => ({ device: d.device, count: d._count._all })),
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not load analytics." }, { status: 500 });
  }
}
