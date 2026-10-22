import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

// ── Admin authorisation (doc 11: checked server-side on every request) ──
// Accepted credential: Master Admin session token — HMAC-signed, 8h
// expiry, issued by POST /api/admin/login against the hashed
// credentials in the AdminUser table. The legacy static-key path is
// gated behind an explicitly configured ADMIN_KEY env var (empty by
// default — "rajtilak-demo" style public fallbacks are gone).

const SECRET = process.env.ADMIN_SECRET ?? "rajtilak-master-secret-dev";

function isValidMasterToken(key: string | null): boolean {
  if (!key) return false;
  const parts = key.split(".");
  if (parts.length !== 3) return false;
  const [prefix, expRaw, sig] = parts;
  if (prefix !== "master") return false;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const expected = createHmac("sha256", SECRET)
    .update(`master.${expRaw}`)
    .digest("hex");
  // constant-time comparison of the signature
  const a = Buffer.from(sig ?? "", "utf8");
  const b = Buffer.from(expected, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export function isAdminRequest(req: NextRequest): boolean {
  const key = req.headers.get("x-admin-key");
  if (isValidMasterToken(key)) return true;
  // Optional scripted/maintenance key — only when the operator has
  // deliberately set ADMIN_KEY in the environment. No default value.
  const staticKey = process.env.ADMIN_KEY;
  return Boolean(staticKey) && key === staticKey;
}

export function unauthorized() {
  return NextResponse.json(
    { ok: false, error: "Unauthorized. Master admin credentials required." },
    { status: 401 }
  );
}

// Naive in-memory rate limiter (doc 9.4/11: rate limiting on submissions)
const hits = new Map<string, number[]>();

export function rateLimit(ip: string, limit = 5, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 500) {
    // prune stale keys to keep memory bounded
    for (const [k, v] of hits) {
      if (v.every((t) => now - t > windowMs)) hits.delete(k);
    }
  }
  return list.length <= limit;
}

export function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "local"
  );
}
