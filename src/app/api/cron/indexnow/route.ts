import { NextRequest, NextResponse } from "next/server";
import { submitToIndexNow } from "@/lib/indexnow";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ── /api/cron/indexnow — push the full sitemap to IndexNow ────────
// Bing's instant-indexing ping. Called:
//   1. manually right after new money pages / posts ship (this is how
//      the whole site got into Bing within days instead of months);
//   2. optionally on a schedule — but IndexNow should really only hear
//      about CHANGED urls, so we keep it manual/on-demand.
//
// Reads the LIVE sitemap.xml (always in sync with reality), extracts
// every <loc>, and submits. Auth identical to /api/agents/cron.
function isSchedulerAuthed(req: NextRequest): boolean {
  const keys = [process.env.AGENT_SCHEDULER_KEY, process.env.CRON_SECRET].filter(
    (k): k is string => Boolean(k)
  );
  if (!keys.length) return false;
  const header = req.headers.get("x-scheduler-key");
  const auth = req.headers.get("authorization");
  const bearer = auth?.replace(/^Bearer\s+/i, "");
  const presented = [header, bearer].filter(Boolean) as string[];
  return presented.some((p) => keys.includes(p));
}

async function handle(req: NextRequest) {
  if (!process.env.AGENT_SCHEDULER_KEY && !process.env.CRON_SECRET) {
    return NextResponse.json(
      { ok: false, error: "Scheduler not configured" },
      { status: 503 }
    );
  }
  if (!isSchedulerAuthed(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. pull the live sitemap so the URL list is never stale
    const res = await fetch("https://jadugarrajtilak.com/sitemap.xml", {
      cache: "no-store",
      headers: { "User-Agent": "rajtilak-indexnow-pusher/1.0" },
    });
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `sitemap fetch HTTP ${res.status}` },
        { status: 502 }
      );
    }
    const xml = await res.text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    if (urls.length === 0) {
      return NextResponse.json({ ok: false, error: "sitemap had no urls" }, { status: 502 });
    }

    // 2. submit (module caps at 100 — the sitemap is 43 today)
    const result = await submitToIndexNow(urls);
    return NextResponse.json({
      ok: result.ok,
      sitemapUrls: urls.length,
      submitted: result.submitted,
      endpoint: result.endpoint,
      status: result.status ?? null,
      error: result.error ?? null,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "indexnow push failed" },
      { status: 500 }
    );
  }
}

export { handle as GET, handle as POST };
