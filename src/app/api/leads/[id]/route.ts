import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leadStatusSchema } from "@/lib/validation";
import { isAdminRequest, unauthorized } from "@/lib/guard";

export const dynamic = "force-dynamic";

// PATCH /api/leads/[id] — move lead through the pipeline (doc 7.2)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const { id } = await params;
    const body = await req.json().catch(() => null);
    const parsed = leadStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid status payload" }, { status: 422 });
    }

    const lead = await db.lead.findUnique({ where: { id } });
    if (!lead) {
      return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
    }

    const updated = await db.lead.update({
      where: { id },
      data: {
        status: parsed.data.status,
        lostReason: parsed.data.lostReason || null,
      },
    });

    // Keep the availability calendar in sync with the pipeline
    if (parsed.data.status === "confirmed" || parsed.data.status === "advance") {
      const day = await db.availabilityDay.findUnique({ where: { date: lead.eventDate } });
      if (!day) {
        await db.availabilityDay.create({
          data: { date: lead.eventDate, status: "booked", note: `Lead ${id.slice(-6)}` },
        });
      } else if (day.status !== "booked") {
        await db.availabilityDay.update({
          where: { date: lead.eventDate },
          data: { status: "booked", note: `Lead ${id.slice(-6)}` },
        });
      }
    }

    return NextResponse.json({ ok: true, lead: updated });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to update lead" }, { status: 500 });
  }
}

// DELETE /api/leads/[id] — remove spam entries (admin)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const { id } = await params;
    await db.lead.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to delete lead" }, { status: 500 });
  }
}
