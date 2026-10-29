import { db } from "@/lib/db";

// ─────────────────────────────────────────────────────────────────────
// Rank tracker — where does jadugarrajtilak.com actually sit in the
// organic results for the 19 audit keywords?
//
// Method: Bing web search (mkt=en-IN, count=30). Bing's HTML lists
// organic results as <li class="b_algo"> blocks whose <cite> shows the
// display URL — no redirect decoding needed, no API key, no ToS-grey
// scraping of Google. Bing positions are NOT Google positions, but the
// TREND (up/down/stable) tracks Google closely for a young domain and
// is honest about "not in top 30 yet".
//
// Runs on Vercel Cron (US egress → clean international Bing). If Bing
// answers with a CAPTCHA/consent wall the row is saved with a note so
// the gap is visible instead of silently skipped.
// ─────────────────────────────────────────────────────────────────────

export const TRACKED_KEYWORDS: { keyword: string; intent: "national" | "local" | "brand" | "hindi" }[] = [
  // core national / commercial
  { keyword: "magician in udaipur", intent: "local" },
  { keyword: "jadugar rajtilak", intent: "brand" },
  { keyword: "magician for wedding in india", intent: "national" },
  { keyword: "corporate magician india", intent: "national" },
  { keyword: "how much does a magic show cost in india", intent: "national" },
  { keyword: "birthday party magician cost india", intent: "national" },
  { keyword: "mentalist for corporate events india", intent: "national" },
  { keyword: "close-up magician indian weddings", intent: "national" },
  { keyword: "virtual magic show online events", intent: "national" },
  { keyword: "best magician in jaipur", intent: "local" },
  // local / rajasthan
  { keyword: "wedding magician udaipur", intent: "local" },
  { keyword: "magician for birthday party in udaipur", intent: "local" },
  { keyword: "destination wedding magician udaipur", intent: "local" },
  { keyword: "जादूगर उदयपुर", intent: "hindi" },
  { keyword: "magician in rajasthan", intent: "local" },
  { keyword: "wedding magician rajasthan", intent: "local" },
  { keyword: "magician in jodhpur", intent: "local" },
  { keyword: "magician in ahmedabad", intent: "local" },
  { keyword: "magician for sangeet", intent: "national" },
];

const SITE_DOMAIN = "jadugarrajtilak.com";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

export type RankResult = {
  keyword: string;
  engine: string;
  position: number | null;
  foundUrl: string | null;
  notes: string | null;
};

/** Fetch one Bing SERP and return the ordered organic display-URLs. */
async function bingOrganicUrls(keyword: string, depth: number): Promise<string[] | null> {
  const q = encodeURIComponent(keyword);
  const url = `https://www.bing.com/search?q=${q}&mkt=en-IN&setlang=en-IN&count=${depth}`;
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 12_000);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-IN,en;q=0.9",
      },
      signal: ctl.signal,
      cache: "no-store",
    });
    if (!res.ok) return null; // 4xx/5xx → treat as engine failure
    const html = await res.text();
    // CAPTCHA / consent walls have no organic blocks
    const blocks = html.split('<li class="b_algo"');
    if (blocks.length < 2) return null;
    const urls: string[] = [];
    for (let i = 1; i < blocks.length; i++) {
      const citeMatch = blocks[i].match(/<cite[^>]*>([\s\S]*?)<\/cite>/);
      if (!citeMatch) continue;
      // display URL like "https://jadugarrajtilak.com › blog" — the
      // separators are › (and sometimes bold <strong> tags inside)
      const display = citeMatch[1]
        .replace(/<[^>]+>/g, "")
        .replace(/\s*›\s*/g, "/")
        .replace(/\s+/g, "")
        .trim();
      if (display) urls.push(display);
    }
    return urls;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

/** Check one keyword and return the result row (never throws). */
export async function checkKeyword(
  keyword: string,
  depth = 30
): Promise<RankResult> {
  const urls = await bingOrganicUrls(keyword, depth);
  if (urls === null || urls.length === 0) {
    return { keyword, engine: "bing", position: null, foundUrl: null, notes: "engine unavailable — bing blocked or empty" };
  }
  const idx = urls.findIndex((u) => u.includes(SITE_DOMAIN));
  return {
    keyword,
    engine: "bing",
    position: idx >= 0 ? idx + 1 : null,
    foundUrl: idx >= 0 ? urls[idx] : null,
    notes: idx >= 0 ? null : "not in top results",
  };
}

/** Save one result row. */
export async function saveRank(r: RankResult): Promise<void> {
  await db.keywordRank.create({
    data: {
      keyword: r.keyword,
      engine: r.engine,
      position: r.position,
      foundUrl: r.foundUrl,
      notes: r.notes,
    },
  });
}

/** Full sweep — sequential to respect the Neon single-connection pool. */
export async function runRankSweep(): Promise<RankResult[]> {
  const results: RankResult[] = [];
  for (const { keyword } of TRACKED_KEYWORDS) {
    const r = await checkKeyword(keyword);
    await saveRank(r).catch(() => undefined);
    results.push(r);
    // polite gap so 19 queries never look like a burst
    await new Promise((res) => setTimeout(res, 700));
  }
  return results;
}
