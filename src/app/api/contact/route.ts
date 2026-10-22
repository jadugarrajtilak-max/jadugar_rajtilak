import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientIp, isAdminRequest, rateLimit, unauthorized } from "@/lib/guard";

export const dynamic = "force-dynamic";

// POST /api/contact — public contact form. Stores a real
// ContactMessage row (visible in Master Admin → Leads → Messages).
export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(clientIp(req), 6)) {
      return NextResponse.json(
        { ok: false, error: "Too many messages from this connection. Please call us instead." },
        { status: 429 }
      );
    }
    const body = (await req.json().catch(() => null)) as
      | { name?: string; email?: string; message?: string }
      | null;
    const name = body?.name?.trim() ?? "";
    const email = body?.email?.trim() ?? "";
    const message = body?.message?.trim() ?? "";

    if (name.length < 2) {
      return NextResponse.json({ ok: false, error: "Please share your name." }, { status: 422 });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "Please share a valid email." }, { status: 422 });
    }
    if (message.length < 10) {
      return NextResponse.json(
        { ok: false, error: "Please write a little more (10+ characters)." },
        { status: 422 }
      );
    }

    const row = await db.contactMessage.create({ data: { name, email, message } });
    return NextResponse.json({ ok: true, id: row.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not send the message. Please try WhatsApp instead." },
      { status: 500 }
    );
  }
}

// GET /api/contact — admin list of contact messages.
export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const messages = await db.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ ok: true, messages });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to load messages" }, { status: 500 });
  }
}

// PUT /api/contact — mark a message handled/unhandled.
export async function PUT(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  try {
    const body = (await req.json().catch(() => null)) as
      | { id?: string; handled?: boolean }
      | null;
    if (!body?.id || typeof body.handled !== "boolean") {
      return NextResponse.json({ ok: false, error: "Missing id or handled" }, { status: 400 });
    }
    await db.contactMessage.update({ where: { id: body.id }, data: { handled: body.handled } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not update the message" }, { status: 500 });
  }
}
