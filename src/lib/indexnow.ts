// ─────────────────────────────────────────────────────────────────────
// IndexNow — Bing / Yandex / Seznam / Naver instant-indexing protocol.
//
// A key file lives at /7fa8089434f7ddc6d054461831122e16.txt (public/),
// and this module pings the IndexNow API with URLs that changed. Bing
// then re-crawls them within ~1-2 days instead of waiting for its
// natural discovery cycle (which for this young domain was: never).
//
// Official protocol, free, no account — see indexnow.org.
// Google does NOT use IndexNow; Google indexing stays driven by the
// sitemap + GSC URL Inspection requests.
// ─────────────────────────────────────────────────────────────────────

const INDEXNOW_KEY = "7fa8089434f7ddc6d054461831122e16";
const HOST = "jadugarrajtilak.com";
const ENDPOINTS = [
  "https://api.indexnow.org/IndexNow",
  "https://www.bing.com/indexnow",
];

export type IndexNowResult = {
  ok: boolean;
  submitted: number;
  endpoint: string;
  status?: number;
  error?: string;
};

/** Submit URLs (max 10,000 per call per protocol; we send ≤100). */
export async function submitToIndexNow(urls: string[]): Promise<IndexNowResult> {
  const clean = urls
    .map((u) => u.trim())
    .filter((u) => u.startsWith("https://jadugarrajtilak.com/"))
    .slice(0, 100);
  if (clean.length === 0) {
    return { ok: false, submitted: 0, endpoint: "-", error: "no valid urls" };
  }

  let lastErr = "";
  for (const endpoint of ENDPOINTS) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 15_000);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ host: HOST, key: INDEXNOW_KEY, urlList: clean }),
        signal: ctl.signal,
        cache: "no-store",
      });
      clearTimeout(t);
      // 200 = accepted · 202 = accepted, revalidation later · 422 = key
      // file not verified yet (retry next call) — both 2xx are success.
      if (res.ok || res.status === 202) {
        return { ok: true, submitted: clean.length, endpoint, status: res.status };
      }
      lastErr = `HTTP ${res.status} from ${endpoint}`;
    } catch (e) {
      lastErr = e instanceof Error ? e.message : "fetch failed";
    } finally {
      clearTimeout(t);
    }
  }
  return { ok: false, submitted: 0, endpoint: ENDPOINTS.join(", "), error: lastErr };
}

/** Every sitemap URL — used by the manual full-push endpoint. */
export function allSiteUrls(
  staticPages: string[],
  postSlugs: string[]
): string[] {
  const base = "https://jadugarrajtilak.com";
  return [
    ...staticPages.map((p) => `${base}${p === "/" ? "" : p}`),
    ...postSlugs.map((s) => `${base}/blog/${s}`),
  ];
}
