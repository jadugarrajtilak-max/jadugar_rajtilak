import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminRequest, unauthorized } from "@/lib/guard";

export const dynamic = "force-dynamic";

// GET /api/admin/stats — dashboard aggregates (doc 9.5)
// In production this also pulls GA4 + Search Console APIs; those are
// Phase-2 integrations, so this endpoint serves first-party lead data.
export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const leads = await db.lead.findMany({ orderBy: { createdAt: "asc" } });
    const availability = await db.availabilityDay.findMany();

    const byStatus: Record<string, number> = {};
    const byEventType: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    const byCity: Record<string, number> = {};
    const byDay: Record<string, number> = {};

    for (const l of leads) {
      byStatus[l.status] = (byStatus[l.status] ?? 0) + 1;
      byEventType[l.eventType] = (byEventType[l.eventType] ?? 0) + 1;
      const src = l.utmSource ?? "direct";
      bySource[src] = (bySource[src] ?? 0) + 1;
      byCity[l.city] = (byCity[l.city] ?? 0) + 1;
      const day = l.createdAt.toISOString().slice(0, 10);
      byDay[day] = (byDay[day] ?? 0) + 1;
    }

    // last 14 days series (fill gaps)
    const series: { date: string; count: number }[] = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      series.push({ date: key, count: byDay[key] ?? 0 });
    }

    const weekAgo = new Date(today.getTime() - 7 * 86400000);
    const thisWeek = leads.filter((l) => l.createdAt >= weekAgo).length;

    const bookedDates = availability.filter((a) => a.status === "booked").length;
    const blockedDates = availability.filter((a) => a.status === "blocked").length;

    // ── CTA engagement (lead-generation visibility, 2026-10-24) ────
    // WhatsApp / call / booking taps are real buying signals. They now
    // sit next to form leads on the dashboard so the phone channel
    // stops being invisible.
    const ctaSince = new Date(today.getTime() - 14 * 86400000);
    const ctaRows = await db.ctaClick.findMany({
      where: { createdAt: { gte: ctaSince } },
      select: { cta: true, createdAt: true, path: true },
    });
    const ctaByType: Record<string, number> = {};
    const ctaByDay: Record<string, number> = {};
    const ctaByPath: Record<string, number> = {};
    for (const c of ctaRows) {
      ctaByType[c.cta] = (ctaByType[c.cta] ?? 0) + 1;
      ctaByPath[c.path] = (ctaByPath[c.path] ?? 0) + 1;
      const day = c.createdAt.toISOString().slice(0, 10);
      ctaByDay[day] = (ctaByDay[day] ?? 0) + 1;
    }
    const ctaThisWeek = ctaRows.filter((c) => c.createdAt >= weekAgo).length;

    // Pending AI proposals — the approval-queue badge on the dashboard.
    const pendingApprovals = await db.agentApproval.count({ where: { status: "pending" } });

    // Conversion funnel (doc 9.4: leads by source, funnel, revenue mix)
    const funnel = [
      { stage: "Enquiry", count: leads.length },
      { stage: "Contacted", count: leads.filter((l) => !["new"].includes(l.status)).length },
      {
        stage: "Quoted",
        count: leads.filter((l) => ["quote", "negotiation", "advance", "confirmed", "completed"].includes(l.status))
          .length,
      },
      {
        stage: "Confirmed",
        count: leads.filter((l) => ["advance", "confirmed", "completed"].includes(l.status)).length,
      },
      { stage: "Completed", count: leads.filter((l) => l.status === "completed").length },
    ];

    return NextResponse.json({
      ok: true,
      totals: {
        leads: leads.length,
        thisWeek,
        confirmed: funnel[3].count,
        completed: funnel[4].count,
        bookedDates,
        blockedDates,
      },
      byStatus,
      byEventType,
      bySource,
      byCity,
      series,
      funnel,
      cta: {
        total: ctaRows.length,
        thisWeek: ctaThisWeek,
        byType: ctaByType,
        byPath: Object.fromEntries(Object.entries(ctaByPath).sort((a, b) => b[1] - a[1]).slice(0, 8)),
        series: series.map((s) => ({ date: s.date, count: ctaByDay[s.date] ?? 0 })),
      },
      pendingApprovals,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to compute stats" }, { status: 500 });
  }
}
