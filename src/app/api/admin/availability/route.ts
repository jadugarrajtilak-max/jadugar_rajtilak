import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { availabilityToggleSchema } from "@/lib/validation";
import { isAdminRequest, unauthorized } from "@/lib/guard";

export const dynamic = "force-dynamic";

// POST /api/admin/availability — block / open a date (doc 9.4 calendar)
export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const body = await req.json().catch(() => null);
    const parsed = availabilityToggleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 422 });
    }

    const { date, status, note } = parsed.data;
    const existing = await db.availabilityDay.findUnique({ where: { date } });
    if (existing && existing.status === "booked") {
      return NextResponse.json(
        { ok: false, error: "That date is booked — resolve the linked lead first." },
        { status: 409 }
      );
    }

    const day = existing
      ? await db.availabilityDay.update({ where: { date }, data: { status, note: note || null } })
      : await db.availabilityDay.create({ data: { date, status, note: note || null } });

    return NextResponse.json({ ok: true, day });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to update availability" }, { status: 500 });
  }
}
