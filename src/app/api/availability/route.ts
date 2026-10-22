import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { availabilityQuerySchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

// GET /api/availability?month=YYYY-MM
// Live availability for the booking wizard step 1 (doc 7.1)
export async function GET(req: NextRequest) {
  try {
    const month = req.nextUrl.searchParams.get("month") ?? "";
    const parsed = availabilityQuerySchema.safeParse({ month });
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "month query param must be YYYY-MM" },
        { status: 400 }
      );
    }

    const [y, m] = month.split("-").map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
      today.getDate()
    ).padStart(2, "0")}`;

    // fetch stored day records for this month
    const records = await db.availabilityDay.findMany({
      where: { date: { startsWith: month } },
    });
    const byDate = new Map(records.map((r) => [r.date, r]));

    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const date = `${month}-${String(i + 1).padStart(2, "0")}`;
      const rec = byDate.get(date);
      const status = date < todayStr ? "past" : rec ? rec.status : "open";
      return { date, status, note: rec?.note ?? null };
    });

    return NextResponse.json({ ok: true, month, days });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to load availability" },
      { status: 500 }
    );
  }
}
