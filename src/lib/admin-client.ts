"use client";

// Admin API client — Master Admin auth via /api/admin/login,
// which issues an 8-hour HMAC-signed session token stored in
// sessionStorage and sent as the x-admin-key header on every call.
// Production replaces this with Payload CMS sessions + TOTP 2FA
// and server-side RBAC (doc 9.1 / 11).

export const ADMIN_KEY_STORAGE = "rajtilak-admin-key";

export async function loginMaster(
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      return { ok: false, error: json.error ?? `HTTP ${res.status}` };
    }
    setAdminKey(json.token);
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error" };
  }
}

export function getAdminKey(): string | null {
  try {
    return sessionStorage.getItem(ADMIN_KEY_STORAGE);
  } catch {
    return null;
  }
}

export function setAdminKey(key: string) {
  try {
    sessionStorage.setItem(ADMIN_KEY_STORAGE, key);
  } catch {
    /* ignore */
  }
}

export function clearAdminKey() {
  try {
    sessionStorage.removeItem(ADMIN_KEY_STORAGE);
  } catch {
    /* ignore */
  }
}

export async function adminFetch<T>(
  path: string,
  init?: RequestInit
): Promise<{ ok: boolean; data: T | null; error?: string }> {
  try {
    const res = await fetch(path, {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        "Content-Type": "application/json",
        "x-admin-key": getAdminKey() ?? "",
      },
    });
    const json = await res.json();
    if (!res.ok || !json.ok) return { ok: false, data: null, error: json.error ?? `HTTP ${res.status}` };
    return { ok: true, data: json as T };
  } catch {
    return { ok: false, data: null, error: "Network error" };
  }
}

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  eventType: string;
  eventDate: string;
  city: string;
  guests: number;
  budget: string;
  venueType: string | null;
  duration: string | null;
  notes: string | null;
  status: string;
  lostReason: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  createdAt: string;
};

export type Stats = {
  ok: true;
  totals: { leads: number; thisWeek: number; confirmed: number; completed: number; bookedDates: number; blockedDates: number };
  byStatus: Record<string, number>;
  byEventType: Record<string, number>;
  bySource: Record<string, number>;
  byCity: Record<string, number>;
  series: { date: string; count: number }[];
  funnel: { stage: string; count: number }[];
};
