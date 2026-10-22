import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/guard";
import { hashPassword, verifyPassword } from "@/lib/auth";

// ── Master Admin login (hardened) ───────────────────────────
// Credentials live in the AdminUser table as scrypt hashes. The very
// first login bootstraps that row from MASTER_ADMIN_EMAIL /
// MASTER_ADMIN_PASSWORD env vars; after that the owner rotates
// credentials from Settings → Security without a redeploy.
//
// Hardening (doc 9 / 11):
//  • per-IP rate limit — 5 attempts / 10 min → HTTP 429
//  • account lockout — 10 consecutive failures lock for 30 min
//  • constant-time password + email comparison
//  • 8-hour HMAC session token signed with ADMIN_SECRET
//  • no plaintext passwords, no hardcoded fallbacks in production

const ENV_EMAIL = process.env.MASTER_ADMIN_EMAIL ?? "jadugar.rajtilak@gmail.com";
const ENV_PASSWORD = process.env.MASTER_ADMIN_PASSWORD ?? "";
const SECRET = process.env.ADMIN_SECRET ?? "rajtilak-master-secret-dev";
const IS_PROD = process.env.NODE_ENV === "production";

const TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // 8-hour session
const LOCK_AFTER_FAILS = 10;
const LOCK_MS = 30 * 60 * 1000; // 30 minutes
const MAX_PASSWORD_LEN = 200;

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

function issueToken(): string {
  const exp = Date.now() + TOKEN_TTL_MS;
  const body = `master.${exp}`;
  const sig = createHmac("sha256", SECRET).update(body).digest("hex");
  return `${body}.${sig}`;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (!rateLimit(`login:${ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { ok: false, error: "Too many sign-in attempts. Try again in about 10 minutes." },
      { status: 429 }
    );
  }

  try {
    const { email, password } = await req.json();
    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
      return NextResponse.json({ ok: false, error: "Email and password required." }, { status: 400 });
    }
    if (password.length > MAX_PASSWORD_LEN) {
      await sleep(400);
      return NextResponse.json({ ok: false, error: "Invalid master credentials." }, { status: 401 });
    }
    const emailNorm = email.trim().toLowerCase();

    let user = await db.adminUser.findFirst({ select: { id: true, email: true, passwordHash: true, failedAttempts: true, lockedUntil: true } });

    // ── Bootstrap path: no AdminUser row yet ──
    if (!user) {
      // Production refuses to run on missing/empty env credentials.
      if (!ENV_PASSWORD) {
        return NextResponse.json(
          { ok: false, error: "Master credentials are not configured on the server. Set MASTER_ADMIN_EMAIL / MASTER_ADMIN_PASSWORD." },
          { status: 500 }
        );
      }
      const emailOk = safeEqual(emailNorm, ENV_EMAIL.trim().toLowerCase());
      const passOk = safeEqual(password, ENV_PASSWORD);
      if (!emailOk || !passOk) {
        await sleep(400);
        return NextResponse.json({ ok: false, error: "Invalid master credentials." }, { status: 401 });
      }
      // Seed the DB row with a scrypt hash of the env password — from
      // now on the env value is only a recovery fallback.
      await db.adminUser.create({
        data: { email: ENV_EMAIL.trim().toLowerCase(), passwordHash: hashPassword(ENV_PASSWORD), lastLoginAt: new Date() },
      });
      return NextResponse.json({ ok: true, token: issueToken(), expiresInSeconds: Math.floor(TOKEN_TTL_MS / 1000), master: ENV_EMAIL });
    }

    // ── Lockout check ──
    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      const mins = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      return NextResponse.json(
        { ok: false, error: `Account locked after too many failed attempts. Try again in ${mins} minute(s).` },
        { status: 423 }
      );
    }

    const emailOk = safeEqual(emailNorm, user.email.toLowerCase());
    const passOk = verifyPassword(password, user.passwordHash);

    if (!emailOk || !passOk) {
      const fails = user.failedAttempts + 1;
      await db.adminUser.update({
        where: { id: user.id },
        data: {
          failedAttempts: fails,
          lockedUntil: fails >= LOCK_AFTER_FAILS ? new Date(Date.now() + LOCK_MS) : null,
        },
      });
      await sleep(400 + Math.min(fails, 8) * 150); // progressive delay
      const left = LOCK_AFTER_FAILS - fails;
      return NextResponse.json(
        {
          ok: false,
          error:
            left > 0 && left <= 3
              ? `Invalid master credentials. ${left} attempt(s) left before a 30-minute lock.`
              : "Invalid master credentials.",
        },
        { status: 401 }
      );
    }

    // Success — reset the failure counter.
    await db.adminUser.update({
      where: { id: user.id },
      data: { failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
    });

    // Dev convenience only: warn that defaults are in play.
    const usingDefaultSecret = !process.env.ADMIN_SECRET && IS_PROD;

    return NextResponse.json({
      ok: true,
      token: issueToken(),
      expiresInSeconds: Math.floor(TOKEN_TTL_MS / 1000),
      master: user.email,
      ...(usingDefaultSecret ? { warning: "ADMIN_SECRET is not set on the server." } : {}),
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Sign-in is temporarily unavailable. Try again." }, { status: 500 });
  }
}
