import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

// ── Master Admin password hashing (scrypt, no external deps) ──
// Stored format: "<salt hex>:<hash hex>" — salted per credential,
// constant-time verification. Plaintext is never persisted anywhere.

export function hashPassword(pw: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pw, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(pw: string, stored: string): boolean {
  const [salt, hash] = String(stored).split(":");
  if (!salt || !hash) return false;
  try {
    const test = scryptSync(pw, salt, 64);
    return timingSafeEqual(Buffer.from(hash, "hex"), test);
  } catch {
    return false;
  }
}

// Minimum policy for new passwords set from the Settings panel.
export function passwordPolicyError(pw: string): string | null {
  if (pw.length < 10) return "Use at least 10 characters.";
  if (!/[A-Z]/.test(pw)) return "Add at least one uppercase letter.";
  if (!/[a-z]/.test(pw)) return "Add at least one lowercase letter.";
  if (!/[0-9]/.test(pw)) return "Add at least one digit.";
  if (!/[^A-Za-z0-9]/.test(pw)) return "Add at least one symbol (!, @, #…).";
  if (pw.length > 200) return "That is longer than the 200-character limit.";
  return null;
}

export function isValidEmail(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}
