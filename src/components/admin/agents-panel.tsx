"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bot, Loader2, Play, CheckCircle2, XCircle, AlertTriangle, Clock,
  Trophy, ShieldCheck, Wrench, PenLine, RefreshCw, ChevronDown,
  ExternalLink, Sparkles, Lock, Globe, Copy, Check, Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { adminFetch } from "@/lib/admin-client";

// ── types mirroring /api/admin/agents ────────────────────────────────
type Finding = { check: string; status: "pass" | "fail" | "warn"; detail: string; fix?: string };
type RunRow = {
  id: string; status: string; trigger: string; summary: string;
  startedAt: string; finishedAt: string | null;
  findings: { findings?: Finding[]; details?: Record<string, unknown> } | null;
};
type AgentRow = {
  id: "rank" | "seo" | "bugfix" | "blog";
  name: string; hindi: string; role: string; cadence: string; accent: string;
  lastRunAt: string | null; lastRunStatus: string | null; lastSuccessAt: string | null;
  totalRuns: number; successRuns: number; isDueToday: boolean;
  skill: string; skillIsBase: boolean; recentRuns: RunRow[];
};
type BacklinkRow = {
  id: string; source: string; type: string; action: string; estDa: number;
  week: string; status: string; notes: string; outreach: string;
};
type PendingDraft = {
  id: string; title: string; slug: string; category: string;
  createdAt: string; readingTime: string | null;
};

// Where the owner actually executes each backlink task — the listing /
// signup page for every source in the pipeline. One click, real action.
const SOURCE_URLS: Record<string, string> = {
  Justdial: "https://www.justdial.com/Udaipur/Jadugar-Rajtilak-Opposite-Hotel-Rajkamal-Bhuwana/9999PX294-X294-180528141553-G5M2_BZDET",
  Venuelook: "https://www.venuelook.com/",
  Sulekha: "https://www.sulekha.com/",
  IndiaMART: "https://www.indiamart.com/",
  TradeIndia: "https://www.tradeindia.com/",
  "YellowPages India": "https://www.yellowpages.in/",
  StarClinch: "https://starclinch.com/",
  WedMeGood: "https://www.wedmegood.com/",
  Hire4Event: "https://hire4event.com/",
  EventJini: "https://www.eventjini.com/",
  AliveExperiences: "https://aliveexperiences.com/",
  "GetReal.buzz": "https://getreal.buzz/",
  "Local press (Bhaskar/Patrika Udaipur)": "https://udaipur.bhaskar.com/",
  "'Top 10 magicians India' listicles": "https://www.google.com/search?q=top+10+magicians+in+india",
};

const AGENT_ICONS: Record<string, typeof Bot> = {
  rank: Trophy,
  seo: Sparkles,
  bugfix: Wrench,
  blog: PenLine,
};

const STATUS_CHIP: Record<string, { label: string; cls: string }> = {
  pass: { label: "PASS", cls: "bg-[#e8f5e9] text-[#1B7D46]" },
  fail: { label: "FAIL", cls: "bg-[#fdedec] text-[#C0392B]" },
  warn: { label: "WARN", cls: "bg-[#fef9e7] text-[#D4820A]" },
};

function timeAgo(iso: string | null): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function AgentsPanel() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [backlinks, setBacklinks] = useState<BacklinkRow[]>([]);
  const [autoPublish, setAutoPublish] = useState(true);
  const [pendingDrafts, setPendingDrafts] = useState<PendingDraft[]>([]);
  const [publishedCount, setPublishedCount] = useState(0);
  const [running, setRunning] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>("blog");
  const [showSkill, setShowSkill] = useState<string | null>(null);
  const [showOutreach, setShowOutreach] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await adminFetch<{
      agents: AgentRow[];
      backlinks: BacklinkRow[];
      autoPublish?: boolean;
      pendingDrafts?: PendingDraft[];
      publishedCount?: number;
    }>("/api/admin/agents");
    if (res.ok && res.data) {
      setAgents(res.data.agents);
      setBacklinks(res.data.backlinks);
      setAutoPublish(res.data.autoPublish !== false);
      setPendingDrafts(res.data.pendingDrafts ?? []);
      setPublishedCount(res.data.publishedCount ?? 0);
    } else if (res.error) {
      toast({ title: "Could not load agents", description: res.error, variant: "destructive" });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    // initial + minute-by-minute refresh (setState happens after await → safe)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const t = setInterval(load, 60_000); // live status every minute
    return () => clearInterval(t);
  }, [load]);

  const runAgent = async (agentId: string) => {
    setRunning(agentId);
    const res = await adminFetch<{ ok: boolean; summary: string }>("/api/admin/agents/run", {
      method: "POST",
      body: JSON.stringify({ agentId }),
    });
    setRunning(null);
    if (res.ok && res.data) {
      toast({
        title: `${agents.find((a) => a.id === agentId)?.name ?? "Agent"} finished`,
        description: res.data.summary.slice(0, 220),
      });
    } else {
      toast({ title: "Agent run failed", description: res.error ?? "Unknown error", variant: "destructive" });
    }
    load();
  };

  const setBacklinkStatus = async (id: string, status: string) => {
    const res = await adminFetch("/api/admin/agents", {
      method: "PATCH",
      body: JSON.stringify({ backlinkId: id, status }),
    });
    if (res.ok) {
      setBacklinks((rows) => rows.map((r) => (r.id === id ? { ...r, status } : r)));
      toast({ title: "Backlink status updated", description: `Marked as ${status}.` });
    } else {
      toast({ title: "Update failed", description: res.error ?? "Try again", variant: "destructive" });
    }
  };

  const toggleAutoPublish = async (next: boolean) => {
    setAutoPublish(next); // optimistic
    const res = await adminFetch("/api/admin/agents", {
      method: "PATCH",
      body: JSON.stringify({ setting: "autopublish", value: next ? "on" : "off" }),
    });
    if (res.ok) {
      toast({
        title: next ? "Auto-publish ON" : "Auto-publish OFF",
        description: next
          ? "Blog Writer ab har roz ka post seedha live publish karega (toggle kabhi bhi off kar sakte hain)."
          : "Blog Writer sirf draft banayega — Blog Studio mein aapke approval ka intezaar.",
      });
    } else {
      setAutoPublish(!next);
      toast({ title: "Could not save setting", description: res.error ?? "Try again", variant: "destructive" });
    }
  };

  const publishDraft = async (draft: PendingDraft) => {
    setPublishing(draft.id);
    const res = await adminFetch<{ published: { slug: string } }>("/api/admin/agents", {
      method: "PATCH",
      body: JSON.stringify({ publishDraftId: draft.id }),
    });
    setPublishing(null);
    if (res.ok) {
      toast({
        title: "Published live",
        description: `jadugarrajtilak.com/blog/${res.data?.published?.slug ?? draft.slug} is live and in the sitemap.`,
      });
      setPendingDrafts((rows) => rows.filter((r) => r.id !== draft.id));
      setPublishedCount((n) => n + 1);
    } else {
      toast({ title: "Publish failed", description: res.error ?? "Try again", variant: "destructive" });
    }
  };

  const copyOutreach = (id: string, outreach: { to?: string; subject?: string; body?: string }) => {
    const text = `To: ${outreach.to || "platform contact"}\nSubject: ${outreach.subject || ""}\n\n${outreach.body || ""}`;
    navigator.clipboard
      ?.writeText(text)
      .then(() => {
        setCopied(id);
        setTimeout(() => setCopied(null), 1600);
      })
      .catch(() => toast({ title: "Copy failed", description: "Select and copy manually.", variant: "destructive" }));
  };

  const dueCount = useMemo(() => agents.filter((a) => a.isDueToday && (!a.lastSuccessAt || new Date(a.lastSuccessAt).toISOString().slice(0, 10) !== new Date().toISOString().slice(0, 10))).length, [agents]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-[#5b5266]">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" /> Waking up the agents…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[#2a1b3d]">AI Agents</h1>
          <p className="mt-1 text-sm text-[#5b5266]">
            Aapki 24×7 growth crew — Rank, SEO, Bug Fixer aur Blog Writer. Har run ke baad agents apne
            skill.md se seekhte hain. Blog Writer roz ka post publish bhi karta hai — switch se control karein.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* execution switch — the owner decides if agents publish or only draft */}
          <div className="flex items-center gap-3 rounded-full border border-[#e3d9c6] bg-[#fffdf7] px-4 py-2">
            <Send className="h-4 w-4 text-[#b8923a]" aria-hidden="true" />
            <div className="leading-tight">
              <p className="text-[12px] font-semibold text-[#2a1b3d]">Auto-publish</p>
              <p className="text-[10px] text-[#8c8a84]">{autoPublish ? "ON — posts go live" : "OFF — drafts only"}</p>
            </div>
            <Switch
              checked={autoPublish}
              onCheckedChange={toggleAutoPublish}
              aria-label="Toggle automatic publishing of the daily blog post"
            />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f5e9] px-3 py-1.5 text-xs font-semibold text-[#1B7D46]">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Scheduler: 24×7 active
          </span>
          <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Refresh
          </Button>
        </div>
      </div>

      {dueCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e3d9c6] bg-[#fef9e7] px-5 py-4">
          <p className="flex items-center gap-2 text-sm font-medium text-[#8a6116]">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            {dueCount} agent(s) aaj ke liye due hain — scheduler apne time pe khud chala dega, ya abhi run karein.
          </p>
          <Button
            size="sm"
            className="bg-[#2a1b3d] hover:bg-[#35224d]"
            onClick={() => {
              agents.filter((a) => a.isDueToday).forEach((a) => runAgent(a.id));
            }}
          >
            <Play className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Run due agents
          </Button>
        </div>
      )}

      {/* ── pending drafts — one click to execute ── */}
      {pendingDrafts.length > 0 && (
        <Card className="border-[#e3d9c6] bg-[#fffdf7] shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#2a1b3d]">
                  <PenLine className="h-5 w-5 text-[#4c3a75]" aria-hidden="true" /> Pending drafts — waiting to go live
                </CardTitle>
                <p className="mt-1 text-sm text-[#5b5266]">
                  {pendingDrafts.length} draft(s) ready. Publish now, ya Blog Studio mein poori post dekh kar edit karein.
                </p>
              </div>
              <span className="rounded-full bg-[#e8f0fe] px-3 py-1.5 text-[11px] font-semibold text-[#1a56db]">
                {publishedCount} published so far
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 space-y-2 overflow-y-auto scroll-slim">
              {pendingDrafts.map((d) => (
                <div
                  key={d.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#f0ead9] bg-white px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-[#2a1b3d]">{d.title}</p>
                    <p className="text-[11px] text-[#8c8a84]">
                      {d.category} · {new Date(d.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      {d.readingTime ? ` · ${d.readingTime}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/blog/${d.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-[#e3d9c6] px-3.5 py-1.5 text-[12px] font-medium text-[#5b5266] transition-colors hover:border-[#b8923a] hover:text-[#2a1b3d]"
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> Preview
                    </a>
                    <Button
                      size="sm"
                      disabled={publishing === d.id}
                      onClick={() => publishDraft(d)}
                      className="h-8 rounded-full bg-[#2f6d4f] px-4 hover:bg-[#256043]"
                    >
                      {publishing === d.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                      ) : (
                        <Send className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      Publish now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── agent cards ── */}
      <div className="grid gap-5 lg:grid-cols-2">
        {agents.map((agent) => {
          const Icon = AGENT_ICONS[agent.id] ?? Bot;
          const successRate = agent.totalRuns > 0 ? Math.round((agent.successRuns / agent.totalRuns) * 100) : null;
          const isRunning = running === agent.id;
          const open = expanded === agent.id;
          return (
            <Card key={agent.id} className="border-[#e3d9c6] bg-[#fffdf7] shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-inner"
                      style={{ background: agent.accent }}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-[#2a1b3d]">
                        {agent.name} <span className="text-sm font-normal text-[#8c8a84]">· {agent.hindi}</span>
                      </CardTitle>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#8c8a84]">
                        <Clock className="h-3 w-3" aria-hidden="true" /> {agent.cadence}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      agent.lastRunStatus === "running"
                        ? "bg-[#e8f0fe] text-[#1a56db]"
                        : agent.lastRunStatus === "error"
                        ? "bg-[#fdedec] text-[#C0392B]"
                        : agent.lastRunStatus === "success"
                        ? "bg-[#e8f5e9] text-[#1B7D46]"
                        : "bg-[#f0eeea] text-[#8c8a84]"
                    }`}
                  >
                    {agent.lastRunStatus === "running" ? (
                      <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                    ) : agent.lastRunStatus === "success" ? (
                      <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                    ) : agent.lastRunStatus === "error" ? (
                      <XCircle className="h-3 w-3" aria-hidden="true" />
                    ) : (
                      <Bot className="h-3 w-3" aria-hidden="true" />
                    )}
                    {agent.lastRunStatus === "success"
                      ? "Active"
                      : agent.lastRunStatus === "error"
                      ? "Needs attention"
                      : agent.lastRunStatus === "running"
                      ? "Running"
                      : "Idle"}
                  </span>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-[#5b5266]">{agent.role}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* stat strip */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-[#f6f0e2] px-2 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8c8a84]">Last run</p>
                    <p className="mt-0.5 text-[13px] font-semibold text-[#2a1b3d]">{timeAgo(agent.lastRunAt)}</p>
                  </div>
                  <div className="rounded-xl bg-[#f6f0e2] px-2 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8c8a84]">Runs</p>
                    <p className="mt-0.5 text-[13px] font-semibold text-[#2a1b3d]">{agent.totalRuns}</p>
                  </div>
                  <div className="rounded-xl bg-[#f6f0e2] px-2 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8c8a84]">Success</p>
                    <p className="mt-0.5 text-[13px] font-semibold text-[#2a1b3d]">{successRate === null ? "—" : `${successRate}%`}</p>
                  </div>
                </div>

                {/* actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    disabled={isRunning}
                    onClick={() => runAgent(agent.id)}
                    className="bg-[#b3263e] hover:bg-[#c2314c]"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Running…
                      </>
                    ) : (
                      <>
                        <Play className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Run now
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-[#e3d9c6] text-[#5b5266]"
                    onClick={() => setShowSkill(showSkill === agent.id ? null : agent.id)}
                  >
                    <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                    {showSkill === agent.id ? "Hide" : "View"} skill.md
                    {(() => {
                      const idx = agent.skill.indexOf("## Learnings log");
                      const n = idx >= 0 ? agent.skill.slice(idx).split("\n").filter((l) => l.startsWith("- ")).length : 0;
                      return n > 0 ? (
                        <span className="rounded-full bg-[#e8f5e9] px-1.5 py-0.5 text-[9px] font-bold text-[#1B7D46]">
                          {n} learnings
                        </span>
                      ) : null;
                    })()}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1 text-[#8c8a84]"
                    onClick={() => setExpanded(open ? null : agent.id)}
                  >
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
                    Run log
                  </Button>
                </div>

                {/* skill.md viewer */}
                {showSkill === agent.id && (
                  <div className="max-h-72 overflow-y-auto scroll-slim rounded-xl border border-[#e3d9c6] bg-[#2a1b3d] p-4">
                    <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-[#e7def0]">{agent.skill}</pre>
                  </div>
                )}

                {/* run log */}
                {open && (
                  <div className="space-y-2.5">
                    {agent.recentRuns.length === 0 && (
                      <p className="rounded-xl bg-[#f6f0e2] px-4 py-3 text-sm text-[#8c8a84]">
                        No runs yet — press “Run now” ya scheduler ko apne time pe chalne dein.
                      </p>
                    )}
                    {agent.recentRuns.map((r) => (
                      <div key={r.id} className="rounded-xl border border-[#e3d9c6] bg-white px-4 py-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="flex items-center gap-2 text-[13px] font-semibold text-[#2a1b3d]">
                            {r.status === "success" ? (
                              <CheckCircle2 className="h-4 w-4 text-[#1B7D46]" aria-hidden="true" />
                            ) : r.status === "error" ? (
                              <XCircle className="h-4 w-4 text-[#C0392B]" aria-hidden="true" />
                            ) : (
                              <Loader2 className="h-4 w-4 animate-spin text-[#1a56db]" aria-hidden="true" />
                            )}
                            {r.summary.slice(0, 120)}
                          </p>
                          <p className="text-[11px] text-[#8c8a84]">
                            {new Date(r.startedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} IST · {r.trigger}
                          </p>
                        </div>
                        {/* findings chips */}
                        {r.findings?.findings && r.findings.findings.length > 0 && (
                          <div className="mt-2.5 space-y-1.5">
                            {r.findings.findings.slice(0, 8).map((f, i) => (
                              <div key={i} className="flex items-start gap-2 text-[12px] leading-snug">
                                <span
                                  className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold ${STATUS_CHIP[f.status]?.cls ?? ""}`}
                                >
                                  {STATUS_CHIP[f.status]?.label ?? f.status.toUpperCase()}
                                </span>
                                <span className="text-[#5b5266]">
                                  <span className="font-semibold text-[#2a1b3d]">{f.check}</span>
                                  {" — "}
                                  {f.detail}
                                  {f.fix ? <span className="text-[#8a6116]"> (fix: {f.fix})</span> : null}
                                </span>
                              </div>
                            ))}
                            {r.findings.findings.length > 8 && (
                              <p className="text-[11px] text-[#8c8a84]">+{r.findings.findings.length - 8} more in full log…</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <BacklinkBoard
        backlinks={backlinks}
        onStatus={setBacklinkStatus}
        showOutreach={showOutreach}
        setShowOutreach={setShowOutreach}
        copied={copied}
        onCopy={copyOutreach}
      />

      {/* safety note */}
      <div className="rounded-2xl border border-[#e3d9c6] bg-[#fffdf7] px-5 py-4 text-[13px] leading-relaxed text-[#5b5266]">
        <p className="flex items-center gap-2 font-semibold text-[#2a1b3d]">
          <Lock className="h-4 w-4 text-[#b8923a]" aria-hidden="true" /> Safety commitments
        </p>
        <p className="mt-1.5">
          Blog Writer roz ka post publish karta hai jab auto-publish ON ho — switch se kabhi bhi draft-only mode
          par lautein. Existing posts kabhi modify/delete nahi hote. Bug Fixer read-only hai. Rank Agent kabhi
          koi external site pe kuch auto-submit nahi karta (spam zero) — outreach aap apne email se bhejte hain.
          Sab agent APIs admin-auth ke peeche hain aur secrets output mein kabhi print nahi hote. Leads aur
          bookings data kabhi agent ke haath mein nahi aata.
        </p>
      </div>
    </div>
  );
}

// ── Rank agent's backlink board ──────────────────────────────────────
const BL_STATUS: { id: string; label: string; chip: string }[] = [
  { id: "planned", label: "Planned", chip: "bg-[#f0eeea] text-[#5b5266]" },
  { id: "drafted", label: "Draft ready", chip: "bg-[#e8f0fe] text-[#1a56db]" },
  { id: "submitted", label: "Submitted", chip: "bg-[#fef9e7] text-[#8a6116]" },
  { id: "live", label: "LIVE ✓", chip: "bg-[#e8f5e9] text-[#1B7D46]" },
  { id: "skipped", label: "Skipped", chip: "bg-[#fdedec] text-[#C0392B]" },
];

function BacklinkBoard({
  backlinks,
  onStatus,
  showOutreach,
  setShowOutreach,
  copied,
  onCopy,
}: {
  backlinks: BacklinkRow[];
  onStatus: (id: string, status: string) => void;
  showOutreach: string | null;
  setShowOutreach: (v: string | null) => void;
  copied: string | null;
  onCopy: (id: string, outreach: { to?: string; subject?: string; body?: string }) => void;
}) {
  const live = backlinks.filter((b) => b.status === "live").length;
  const drafted = backlinks.filter((b) => b.status === "drafted").length;
  const planned = backlinks.filter((b) => b.status === "planned").length;

  return (
    <Card className="border-[#e3d9c6] bg-[#fffdf7] shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#2a1b3d]">
              <Trophy className="h-5 w-5 text-[#b8923a]" aria-hidden="true" /> Rank Agent — Backlink Pipeline
            </CardTitle>
            <p className="mt-1 text-sm text-[#5b5266]">
              White-hat sources only — zero spam. Har row pe “Open platform” seedha listing page kholta hai;
              outreach draft copy karke apne email se bhejein. Link live hone par status update karein.
            </p>
          </div>
          <div className="flex gap-2 text-center text-[11px] font-semibold">
            <span className="rounded-full bg-[#e8f5e9] px-3 py-1.5 text-[#1B7D46]">{live} LIVE</span>
            <span className="rounded-full bg-[#e8f0fe] px-3 py-1.5 text-[#1a56db]">{drafted} drafted</span>
            <span className="rounded-full bg-[#f0eeea] px-3 py-1.5 text-[#5b5266]">{planned} planned</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[430px] overflow-y-auto scroll-slim">
          <table className="w-full text-left text-[13px]">
            <thead className="sticky top-0 bg-[#fffdf7]">
              <tr className="border-b border-[#e3d9c6] text-[11px] uppercase tracking-wider text-[#8c8a84]">
                <th className="py-2 pr-3 font-semibold">Source</th>
                <th className="py-2 pr-3 font-semibold">Type</th>
                <th className="hidden py-2 pr-3 font-semibold md:table-cell">Action</th>
                <th className="py-2 pr-3 font-semibold">DA~</th>
                <th className="py-2 pr-3 font-semibold">Week</th>
                <th className="py-2 pr-3 font-semibold">Status</th>
                <th className="py-2 font-semibold">Execute</th>
              </tr>
            </thead>
            <tbody>
              {backlinks.map((b) => {
                const chip = BL_STATUS.find((s) => s.id === b.status) ?? BL_STATUS[0];
                let outreach: { to?: string; subject?: string; body?: string } | null = null;
                try {
                  outreach = b.outreach ? JSON.parse(b.outreach) : null;
                } catch {
                  outreach = null;
                }
                const sourceUrl = SOURCE_URLS[b.source];
                return (
                  <tr key={b.id} className="border-b border-[#f0ead9] align-top">
                    <td className="py-2.5 pr-3 font-semibold text-[#2a1b3d]">{b.source}</td>
                    <td className="py-2.5 pr-3 text-[#5b5266]">{b.type}</td>
                    <td className="hidden max-w-[260px] py-2.5 pr-3 text-[12px] text-[#5b5266] md:table-cell">{b.action}</td>
                    <td className="py-2.5 pr-3 font-semibold text-[#b8923a]">{b.estDa}</td>
                    <td className="py-2.5 pr-3 text-[#8c8a84]">{b.week}</td>
                    <td className="py-2.5 pr-3">
                      <select
                        value={b.status}
                        onChange={(e) => onStatus(b.id, e.target.value)}
                        aria-label={`Status for ${b.source}`}
                        className={`cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-semibold outline-none ${chip.chip}`}
                      >
                        {BL_STATUS.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="relative py-2.5">
                      <div className="flex items-center gap-1.5">
                        {sourceUrl && (
                          <a
                            href={sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Open ${b.source} — listing / signup page`}
                            className="inline-flex items-center gap-1 rounded-full border border-[#e3d9c6] px-2.5 py-1 text-[11px] font-semibold text-[#5b5266] transition-colors hover:border-[#b8923a] hover:text-[#2a1b3d]"
                          >
                            <Globe className="h-3 w-3" aria-hidden="true" /> Open
                          </a>
                        )}
                        {outreach && (
                          <button
                            onClick={() => setShowOutreach(showOutreach === b.id ? null : b.id)}
                            className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#1a56db] hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" aria-hidden="true" />
                            {showOutreach === b.id ? "Hide" : "Draft"}
                          </button>
                        )}
                        {!outreach && !sourceUrl && <span className="text-[11px] text-[#8c8a84]">—</span>}
                      </div>
                      {showOutreach === b.id && outreach && (
                        <div className="absolute z-10 mt-2 w-[min(420px,90vw)] rounded-xl border border-[#e3d9c6] bg-white p-4 shadow-xl">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8c8a84]">To</p>
                          <p className="text-[13px] text-[#2a1b3d]">{outreach.to || "platform contact"}</p>
                          <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-[#8c8a84]">Subject</p>
                          <p className="text-[13px] font-semibold text-[#2a1b3d]">{outreach.subject}</p>
                          <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-[#8c8a84]">Body</p>
                          <p className="mt-0.5 whitespace-pre-wrap text-[12.5px] leading-relaxed text-[#5b5266]">{outreach.body}</p>
                          <div className="mt-3 flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 rounded-full border-[#b8923a]/50 text-[#2a1b3d] hover:bg-[#f3ead3]"
                              onClick={() => onCopy(b.id, outreach as { to?: string; subject?: string; body?: string })}
                            >
                              {copied === b.id ? (
                                <>
                                  <Check className="mr-1 h-3.5 w-3.5 text-[#2f6d4f]" aria-hidden="true" /> Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="mr-1 h-3.5 w-3.5" aria-hidden="true" /> Copy outreach
                                </>
                              )}
                            </Button>
                            {sourceUrl && (
                              <a
                                href={sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#2a1b3d] px-4 text-[12px] font-semibold text-[#faf6ee] transition-colors hover:bg-[#35224d]"
                              >
                                <Globe className="h-3.5 w-3.5" aria-hidden="true" /> Open {b.source.split(" ")[0]}
                              </a>
                            )}
                          </div>
                          <p className="mt-3 rounded-lg bg-[#fef9e7] px-3 py-2 text-[11px] text-[#8a6116]">
                            Apne email se bhejein — agent kabhi auto-send nahi karta (no-spam rule).
                          </p>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
