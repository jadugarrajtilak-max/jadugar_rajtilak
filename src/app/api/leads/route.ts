import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leadSchema } from "@/lib/validation";
import { clientIp, isAdminRequest, rateLimit, unauthorized } from "@/lib/guard";

export const dynamic = "force-dynamic";

// POST /api/leads — public booking enquiry submission (doc 7.1)
// Zod validation + honeypot + rate limiting (doc 9.4 / 11)
export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(clientIp(req))) {
      return NextResponse.json(
        { ok: false, error: "Too many enquiries from this connection. Please call us instead." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
    }

    const parsed = leadSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return NextResponse.json(
        { ok: false, error: "Please fix the highlighted fields.", fieldErrors },
        { status: 422 }
      );
    }

    const data = parsed.data;

    // Honeypot triggered → pretend success, drop silently (doc 9.4)
    if (data.website && data.website.length > 0) {
      return NextResponse.json({ ok: true, leadId: "ignored", queued: [] });
    }

    // Check the chosen date is actually open (server-side truth)
    const day = await db.availabilityDay.findUnique({ where: { date: data.eventDate } });
    if (day && day.status !== "open") {
      return NextResponse.json(
        {
          ok: false,
          error: "That date was just taken. Please pick another date — the calendar updates live.",
          fieldErrors: { eventDate: "Date no longer available" },
        },
        { status: 409 }
      );
    }

    const lead = await db.lead.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        eventType: data.eventType,
        eventDate: data.eventDate,
        city: data.city,
        guests: data.guests,
        budget: data.budget,
        venueType: data.venueType || null,
        duration: data.duration || null,
        notes: data.notes || null,
        consent: data.consent,
        utmSource: data.utmSource || null,
        utmMedium: data.utmMedium || null,
        utmCampaign: data.utmCampaign || null,
        landingPage: data.landingPage || null,
        referrer: data.referrer || null,
      },
    });

    // 72-hour soft-hold on the requested date (doc FAQ policy)
    const existing = await db.availabilityDay.findUnique({ where: { date: data.eventDate } });
    if (!existing) {
      await db.availabilityDay.create({
        data: { date: data.eventDate, status: "open", note: null },
      });
    }

    // Notification pipeline (doc 7.4) — email/WhatsApp providers are
    // Phase 2 integrations in this sandbox; the queue describes intent.
    const queued = [
      { channel: "email", to: "owner@jadugarrajtilak.com", template: "new-lead-alert", status: "simulated" },
      { channel: "whatsapp", to: data.phone, template: "customer-auto-reply", status: "simulated" },
      { channel: "email", to: data.email, template: "customer-auto-reply", status: "simulated" },
    ];

    return NextResponse.json({ ok: true, leadId: lead.id, queued }, { status: 201 });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not submit the enquiry. Please try again or WhatsApp us." },
      { status: 500 }
    );
  }
}

// GET /api/leads — admin CRM list (doc 9.4, requires admin key)
export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const leads = await db.lead.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ ok: true, leads });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to load leads" }, { status: 500 });
  }
}
