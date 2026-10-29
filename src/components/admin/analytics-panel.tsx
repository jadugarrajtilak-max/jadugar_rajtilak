"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, Loader2, RefreshCw, MousePointerClick, ExternalLink, Smartphone, Monitor, Tablet, Trophy, TrendingUp, TrendingDown, Minus, Search, Sparkle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminFetch } from "@/lib/admin-client";

// ─────────────────────────────────────────────────────────────
// Analytics — first-party visitor numbers (path, referrer, device
// only; no cookies, no PII) alongside a quick jump into the full
// Google Analytics 4 property (G-103JFH1Z6B) that measures the
// site. Numbers refresh on demand.
// ─────────────────────────────────────────────────────────────

type Analytics = {
  ok: true;
  totals: { today: number; last7: number; last30: number };
  series: { date: string; count: number }[];
  topPages: { path: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
  devices: { device: string; count: number }[];
};

const GA_URL = "https://analytics.google.com/analytics/web/#/p505691606/reports/dashboard?r=overview";

// ── Keyword Rankings (organic position tracking) ──────────────────
type RankRow = {
  keyword: string;
  intent: string;
  position: number | null;
  foundUrl: string | null;
  checkedAt: string | null;
  trend: "up" | "down" | "flat" | "new" | null;
  prev: number | null;
  history: { d: string; p: number | null }[];
};
type Rankings = {
  ok: true;
  asOf: string | null;
  tracked: number;
  inTop30: number;
  keywords: RankRow[];
};

function TrendIcon({ trend }: { trend: RankRow["trend"] }) {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-600" aria-hidden="true" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-600" aria-hidden="true" />;
  if (trend === "flat") return <Minus className="h-4 w-4 text-[#5b5266]" aria-hidden="true" />;
  if (trend === "new") return <Sparkle className="h-4 w-4 text-[#b8923a]" aria-hidden="true" />;
  return null;
}

function PositionBadge({ p }: { p: number | null }) {
  if (p === null)
    return (
      <span className="rounded-full bg-[#efe8da] px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-[#8a8494]">
        not in top 30
      </span>
    );
  const tone = p <= 3 ? "bg-green-700" : p <= 10 ? "bg-[#b8923a]" : "bg-[#2a1b3d]";
  return (
    <span className={`${tone} rounded-full px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-[#faf6ee]`}>
      #{p}
    </span>
  );
}

function RankingsCard() {
  const [data, setData] = useState<Rankings | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminFetch<Rankings>("/api/admin/rankings");
    if (res.ok && res.data) setData(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const runNow = async () => {
    setRunning(true);
    setMsg(null);
    const res = await adminFetch<{ ok: boolean; message?: string; error?: string }>("/api/admin/rankings", {
      method: "POST",
    });
    setMsg(res.data?.message ?? res.data?.error ?? "Check complete");
    setRunning(false);
    void load();
  };

  const ordered = useMemo(() => {
    const list = [...(data?.keywords ?? [])];
    list.sort((a, b) => (a.position ?? 99) - (b.position ?? 99) || a.keyword.localeCompare(b.keyword));
    return list;
  }, [data]);

  return (
    <div className="rounded-3xl border border-[#e3d9c6] bg-[#fffdf7] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#2a1b3d]">
          <Trophy className="h-4 w-4 text-[#b8923a]" aria-hidden="true" /> Keyword Rankings —{" "}
          {data ? (
            <span className="tabular-nums">
              {data.inTop30}/{data.tracked} in top 30
            </span>
          ) : (
            "loading…"
          )}
        </p>
        <div className="flex items-center gap-2">
          <Button onClick={runNow} disabled={running} variant="outline" className="rounded-xl border-[#e3d9c6]">
            {running ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Search className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            Check now
          </Button>
          <Button onClick={load} disabled={loading} variant="outline" className="rounded-xl border-[#e3d9c6]">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {msg && <p className="mt-3 text-xs text-[#5b5266]">{msg}</p>}
      {data?.asOf && (
        <p className="mt-1 text-xs text-[#8a8494]">
          Last checked {new Date(data.asOf).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST · daily
          automatic check at 11:45 IST · Bing organic results (trend matches Google for a growing domain)
        </p>
      )}

      <div className="mt-4 divide-y divide-[#efe8da]">
        {ordered.map((k) => (
          <div key={k.keyword} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <PositionBadge p={k.position} />
              <TrendIcon trend={k.trend} />
              <span className="truncate font-medium text-[#2a1b3d]">{k.keyword}</span>
            </span>
            <span className="truncate text-xs text-[#8a8494]" title={k.foundUrl ?? ""}>
              {k.foundUrl ? k.foundUrl.replace(/^https:\/\//, "").slice(0, 48) : k.position === null ? "—" : ""}
            </span>
          </div>
        ))}
        {ordered.length === 0 && !loading && (
          <p className="py-3 text-sm text-[#5b5266]">No checks yet — press “Check now” for the first sweep.</p>
        )}
      </div>

      <p className="mt-4 rounded-2xl bg-[#f3ead3]/50 p-3 text-xs leading-5 text-[#5b5266]">
        Positions update daily. For exact Google positions use Search Console → Performance once access is
        connected; this tracker exists so progress is visible every single day without waiting.
      </p>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-3xl border border-[#e3d9c6] bg-[#fffdf7] p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b8923a]">{label}</p>
      <p className="font-display mt-2 text-4xl font-semibold tabular-nums text-[#2a1b3d]">{value}</p>
      <p className="mt-1 text-xs leading-5 text-[#5b5266]">{hint}</p>
    </div>
  );
}

function DeviceIcon({ d }: { d: string }) {
  if (d === "mobile") return <Smartphone className="h-4 w-4" aria-hidden="true" />;
  if (d === "tablet") return <Tablet className="h-4 w-4" aria-hidden="true" />;
  return <Monitor className="h-4 w-4" aria-hidden="true" />;
}

export function AnalyticsPanel() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await adminFetch<Analytics>("/api/admin/analytics");
    if (res.ok && res.data) setData(res.data);
    setLoading(false);
  };

  useEffect(() => {
    // setState happens after await → safe; disable the compiler's
    // conservative sync-setState warning for this mount-time load
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  const maxCount = useMemo(
    () => Math.max(1, ...(data?.series ?? []).map((s) => s.count)),
    [data]
  );

  const deviceTotal = useMemo(
    () => Math.max(1, (data?.devices ?? []).reduce((a, d) => a + d.count, 0)),
    [data]
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display flex items-center gap-3 text-3xl font-semibold text-[#2a1b3d]">
            <BarChart3 className="h-7 w-7 text-[#b8923a]" aria-hidden="true" /> Analytics
          </h1>
          <p className="mt-1 text-sm text-[#5b5266]">
            First-party visitor measurement (no cookies, no personal data) — deep reporting lives in
            Google Analytics 4.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={load} disabled={loading} variant="outline" className="rounded-xl border-[#e3d9c6]">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />}
            Refresh
          </Button>
          <a
            href={GA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2a1b3d] px-4 text-sm font-semibold text-[#faf6ee] transition-colors hover:bg-[#35224d]"
          >
            Open Google Analytics <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </header>

      {!data && (
        <div className="flex items-center gap-2 rounded-2xl border border-[#e3d9c6] bg-[#fffdf7] p-6 text-sm text-[#5b5266]">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading visitor data…
        </div>
      )}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Views today" value={String(data.totals.today)} hint="Page views since midnight UTC" />
            <StatCard label="Last 7 days" value={String(data.totals.last7)} hint="Page views in the past week" />
            <StatCard label="Last 30 days" value={String(data.totals.last30)} hint="Page views this month" />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            {/* 30-day bar chart */}
            <div className="rounded-3xl border border-[#e3d9c6] bg-[#fffdf7] p-6">
              <p className="text-sm font-semibold text-[#2a1b3d]">Daily views — last 30 days</p>
              <div className="mt-5 flex h-40 items-end gap-1" role="img" aria-label="Bar chart of daily page views over the last 30 days">
                {data.series.map((s) => (
                  <div key={s.date} className="group relative flex-1" title={`${s.date}: ${s.count} views`}>
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-[#b8923a] to-[#d9b666] transition-all"
                      style={{ height: `${Math.max(3, (s.count / maxCount) * 100)}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-[#5b5266]">
                <span>{data.series[0]?.date}</span>
                <span>{data.series[data.series.length - 1]?.date}</span>
              </div>
            </div>

            {/* devices */}
            <div className="rounded-3xl border border-[#e3d9c6] bg-[#fffdf7] p-6">
              <p className="text-sm font-semibold text-[#2a1b3d]">Devices (30 days)</p>
              <div className="mt-4 space-y-3">
                {data.devices.length === 0 && <p className="text-sm text-[#5b5266]">No data yet.</p>}
                {data.devices.map((d) => (
                  <div key={d.device}>
                    <div className="flex items-center justify-between text-sm text-[#5b5266]">
                      <span className="flex items-center gap-2 capitalize"><DeviceIcon d={d.device} /> {d.device}</span>
                      <span className="tabular-nums">{d.count}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-[#efe8da]">
                      <div className="h-full rounded-full bg-[#b3263e]" style={{ width: `${(d.count / deviceTotal) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* top pages */}
            <div className="rounded-3xl border border-[#e3d9c6] bg-[#fffdf7] p-6">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#2a1b3d]">
                <MousePointerClick className="h-4 w-4 text-[#b8923a]" aria-hidden="true" /> Top pages (30 days)
              </p>
              <ol className="mt-4 space-y-2.5">
                {data.topPages.length === 0 && <li className="text-sm text-[#5b5266]">No data yet.</li>}
                {data.topPages.map((p, i) => (
                  <li key={p.path} className="flex items-center justify-between gap-3 rounded-xl border border-[#e3d9c6] bg-[#faf6ee] px-4 py-2.5 text-sm">
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="font-display w-6 shrink-0 text-center text-xs font-semibold text-[#b8923a]">{i + 1}</span>
                      <span className="truncate font-medium text-[#2a1b3d]">{p.path}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-[#2a1b3d] px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-[#faf6ee]">{p.count}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* referrers */}
            <div className="rounded-3xl border border-[#e3d9c6] bg-[#fffdf7] p-6">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#2a1b3d]">
                <ExternalLink className="h-4 w-4 text-[#b8923a]" aria-hidden="true" /> Where visitors come from (30 days)
              </p>
              <ol className="mt-4 space-y-2.5">
                {data.topReferrers.length === 0 && <li className="text-sm text-[#5b5266]">No referrer data yet — most visits are direct or from search.</li>}
                {data.topReferrers.map((r, i) => (
                  <li key={r.referrer} className="flex items-center justify-between gap-3 rounded-xl border border-[#e3d9c6] bg-[#faf6ee] px-4 py-2.5 text-sm">
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="font-display w-6 shrink-0 text-center text-xs font-semibold text-[#b8923a]">{i + 1}</span>
                      <span className="truncate font-medium text-[#2a1b3d]">{r.referrer}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-[#b3263e] px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-[#faf6ee]">{r.count}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <RankingsCard />

          <p className="rounded-2xl bg-[#f3ead3]/50 p-4 text-xs leading-6 text-[#5b5266]">
            Tip: numbers here are simple page-view counts without cookies — the same visit from one
            person across five pages counts five times. For sessions, engagement and demographics,
            open Google Analytics 4 above. Both systems run together automatically.
          </p>
        </>
      )}
    </div>
  );
}
