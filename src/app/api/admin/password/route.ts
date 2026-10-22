import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminRequest, unauthorized, clientIp, rateLimit } from "@/lib/guard";
import { hashPassword, verifyPassword, passwordPolicyError, isValidEmail } from "@/lib/auth";

export const dynamic = "force-dynamic";

// ── Master credential rotation ───────────────────────────────
// POST /api/admin/password
//   { currentPassword, newPassword, newEmail? }
// Requires a valid admin session token AND the current password —
// so a stolen session alone cannot take over the account. The new
// password is stored as a fresh scrypt hash; the old one stops
// working immediately.

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  if (!rateLimit(`pwchange:${clientIp(req)}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: "Too many attempts. Try again later." }, { status: 429 });
  }

  try {
    const body = (await req.json().catch(() => null)) as
      | { currentPassword?: string; newPassword?: string; newEmail?: string }
      | null;
    if (!body || typeof body.currentPassword !== "string" || typeof body.newPassword !== "string") {
      return NextResponse.json({ ok: false, error: "Current and new password are required." }, { status: 400 });
    }

    const user = await db.adminUser.findFirst({
      select: { id: true, email: true, passwordHash: true },
    });
    if (!user) {
      return NextResponse.json({ ok: false, error: "No master account exists yet — sign in once first." }, { status: 404 });
    }

    if (!verifyPassword(body.currentPassword, user.passwordHash)) {
      await sleep(400);
      return NextResponse.json({ ok: false, error: "The current password you entered is not correct." }, { status: 401 });
    }

    const policy = passwordPolicyError(body.newPassword);
    if (policy) {
      return NextResponse.json({ ok: false, error: `New password rejected — ${policy}` }, { status: 422 });
    }

    let newEmail: string | null = null;
    if (typeof body.newEmail === "string" && body.newEmail.trim()) {
      const e = body.newEmail.trim().toLowerCase();
      if (!isValidEmail(e)) {
        return NextResponse.json({ ok: false, error: "The new email address does not look valid." }, { status: 422 });
      }
      newEmail = e;
    }

    await db.adminUser.update({
      where: { id: user.id },
      data: {
        passwordHash: hashPassword(body.newPassword),
        ...(newEmail ? { email: newEmail } : {}),
        failedAttempts: 0,
        lockedUntil: null,
      },
    });

    return NextResponse.json({
      ok: true,
      message: newEmail
        ? "Master email and password updated. Use the new credentials at next sign-in."
        : "Master password updated. Use the new password at next sign-in.",
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not update credentials. Try again." }, { status: 500 });
  }
}
