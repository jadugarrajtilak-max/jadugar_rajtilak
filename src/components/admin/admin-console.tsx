"use client";

import { useCallback, useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Search,
  Settings2,
  Lock,
  Loader2,
  LogOut,
  ShieldCheck,
  ArrowLeft,
  Mail,
  Image as ImageIcon,
  FileText,
  Palette,
  Inbox,
  BarChart3,
  BookOpen,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  adminFetch,
  clearAdminKey,
  getAdminKey,
  loginMaster,
  type Lead,
  type Stats,
} from "@/lib/admin-client";
import { DashboardPanel } from "./dashboard";
import { LeadsCrm } from "./leads-crm";
import { MessagesInbox } from "./messages-inbox";
import { CalendarManager } from "./calendar-manager";
import { BlogStudio } from "./blog-studio";
import { SettingsPanel } from "./settings-panel";
import { ImageManager } from "./image-manager";
import { ContentManager } from "./content-manager";
import { ThemeManager } from "./theme-manager";
import { SeoPanel } from "./seo-panel";
import { AnalyticsPanel } from "./analytics-panel";
import { AgentsPanel } from "./agents-panel";
import { BrandMark } from "@/components/site/navbar";
import type { RouteId } from "@/lib/content";

type Tab =
  | "dashboard"
  | "leads"
  | "messages"
  | "calendar"
  | "blog"
  | "images"
  | "content"
  | "theme"
  | "seo"
  | "analytics"
  | "agents"
  | "settings";

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "leads", label: "Leads CRM", icon: Users },
  { id: "messages", label: "Messages", icon: Inbox },
  { id: "calendar", label: "Availability", icon: CalendarDays },
  { id: "blog", label: "Blog Studio", icon: BookOpen },
  { id: "images", label: "Images", icon: ImageIcon },
  { id: "content", label: "Content", icon: FileText },
  { id: "theme", label: "Theme", icon: Palette },
  { id: "seo", label: "SEO Tools", icon: Search },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "agents", label: "AI Agents", icon: Bot },
  { id: "settings", label: "Settings", icon: Settings2 },
];

export function AdminConsole({ navigate }: { navigate: (r: RouteId) => void }) {
  // Admin view only mounts client-side (hash routing), so lazy init
  // from sessionStorage is hydration-safe.
  const [authed, setAuthed] = useState<boolean | null>(() => {
    if (typeof window === "undefined") return null;
    return !!getAdminKey();
  });
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [checking, setChecking] = useState(false);
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  const loadData = useCallback(async () => {
    const [leadsRes, statsRes] = await Promise.all([
      adminFetch<{ leads: Lead[] }>("/api/leads"),
      adminFetch<Stats>("/api/admin/stats"),
    ]);
    if (leadsRes.ok && leadsRes.data) setLeads(leadsRes.data.leads);
    if (statsRes.ok && statsRes.data) setStats(statsRes.data);
  }, []);

  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    (async () => {
      const [leadsRes, statsRes] = await Promise.all([
        adminFetch<{ leads: Lead[] }>("/api/leads"),
        adminFetch<Stats>("/api/admin/stats"),
      ]);
      if (cancelled) return;
      if (leadsRes.ok && leadsRes.data) setLeads(leadsRes.data.leads);
      if (statsRes.ok && statsRes.data) setStats(statsRes.data);
    })();
    return () => {
      cancelled = true;
    };
  }, [authed]);

  // derived: first load shows spinner, refresh keeps data visible
  const loadingData = authed === true && stats === null;

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    const res = await loginMaster(emailInput.trim(), passwordInput);
    if (res.ok) {
      // token stored — verify it is accepted by the API before opening
      const verify = await adminFetch("/api/admin/stats");
      setChecking(false);
      if (verify.ok) {
        setAuthed(true);
        setPasswordInput("");
        toast({
          title: "Welcome back, Rajtilak saab",
          description: "Master Admin session opened — valid for 8 hours.",
        });
      } else {
        clearAdminKey();
        toast({
          title: "Session rejected",
          description: "The server did not accept this session. Try signing in again.",
          variant: "destructive",
        });
      }
    } else {
      setChecking(false);
      toast({
        title: "Access denied",
        description: res.error ?? "Invalid master credentials.",
        variant: "destructive",
      });
    }
  };

  const logout = () => {
    clearAdminKey();
    setAuthed(false);
    setEmailInput("");
    setPasswordInput("");
  };

  // ── Login gate ──
  if (authed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#2a1b3d]">
        <Loader2 className="h-8 w-8 animate-spin text-[#b8923a]" aria-hidden="true" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#2a1b3d] px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-[#b8923a]/30 bg-[#35224d]/60 p-8 shadow-2xl backdrop-blur">
          <div className="flex flex-col items-center text-center">
            <BrandMark className="h-14 w-14" />
            <h1 className="font-display mt-5 text-3xl font-semibold text-[#faf6ee]">Master Admin</h1>
            <p className="mt-2 text-sm text-[#e7def0]/70">
              Jadugar Rajtilak control room — sign in with your master credentials.
            </p>
          </div>
          <form onSubmit={login} className="mt-8 space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#d9b666]"
              >
                Master email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b8923a]" aria-hidden="true" />
                <Input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="you@example.com"
                  aria-label="Master admin email"
                  className="h-12 rounded-xl border-[#b8923a]/40 bg-[#2a1b3d]/60 pl-11 text-[#faf6ee] placeholder:text-[#e7def0]/40"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#d9b666]"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b8923a]" aria-hidden="true" />
                <Input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••"
                  aria-label="Master admin password"
                  className="h-12 rounded-xl border-[#b8923a]/40 bg-[#2a1b3d]/60 pl-11 text-[#faf6ee] placeholder:text-[#e7def0]/40"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={checking || !emailInput.trim() || !passwordInput}
              className="h-12 w-full rounded-xl bg-[#b3263e] text-[15px] font-semibold hover:bg-[#c2314c]"
            >
              {checking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> Verifying…
                </>
              ) : (
                "Enter the control room"
              )}
            </Button>
          </form>
          <div className="mt-6 rounded-xl border border-[#b8923a]/25 bg-[#2a1b3d]/50 p-4 text-xs leading-6 text-[#e7def0]/70">
            <p className="flex items-center gap-2 font-semibold text-[#d9b666]">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Protected control room
            </p>
            <p className="mt-1">
              Credentials are private and stored encrypted — never displayed on this page. Five
              wrong attempts lock sign-in for 10 minutes; the account locks for 30 minutes after
              ten failures. Change your password anytime from Settings → Security.
            </p>
          </div>
          <button
            onClick={() => navigate("home")}
            className="mt-5 flex w-full items-center justify-center gap-2 text-sm text-[#e7def0]/60 transition-colors hover:text-[#faf6ee]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to the site
          </button>
        </div>
      </div>
    );
  }

  // ── Console shell ──
  return (
    <div className="min-h-screen bg-[#f6f0e2]">
      <div className="mx-auto flex max-w-[1500px] gap-0">
        {/* sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[#e3d9c6] bg-[#2a1b3d] py-6 lg:flex">
          <div className="flex items-center gap-3 px-6">
            <BrandMark className="h-8 w-8" />
            <div>
              <p className="font-display text-base font-semibold leading-tight text-[#faf6ee]">Rajtilak</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#b8923a]">Master Admin</p>
            </div>
          </div>
          <nav className="mt-8 flex-1 space-y-1 px-3" aria-label="Admin sections">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id ? "page" : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                  tab === t.id
                    ? "bg-[#b3263e] text-[#fdf8ee]"
                    : "text-[#e7def0]/70 hover:bg-[#35224d] hover:text-[#faf6ee]"
                }`}
              >
                <t.icon className="h-4.5 w-4.5 h-[18px] w-[18px]" aria-hidden="true" />
                {t.label}
              </button>
            ))}
          </nav>
          <div className="space-y-1 px-3">
            <button
              onClick={() => navigate("home")}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#e7def0]/70 transition-colors hover:bg-[#35224d] hover:text-[#faf6ee]"
            >
              <ArrowLeft className="h-[18px] w-[18px]" aria-hidden="true" /> View site
            </button>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#e7def0]/70 transition-colors hover:bg-[#35224d] hover:text-[#faf6ee]"
            >
              <LogOut className="h-[18px] w-[18px]" aria-hidden="true" /> Sign out
            </button>
          </div>
        </aside>

        {/* mobile tab bar */}
        <div className="w-full">
          <div className="flex gap-2 overflow-x-auto border-b border-[#e3d9c6] bg-[#fffdf7] px-4 py-3 lg:hidden">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
                  tab === t.id ? "bg-[#2a1b3d] text-[#faf6ee]" : "border border-[#e3d9c6] text-[#5b5266]"
                }`}
              >
                <t.icon className="h-4 w-4" aria-hidden="true" />
                {t.label}
              </button>
            ))}
            <button
              onClick={logout}
              className="flex shrink-0 items-center gap-2 rounded-full border border-[#e3d9c6] px-4 py-2 text-sm font-medium text-[#5b5266]"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <main className="p-4 sm:p-6 lg:p-8">
            {loadingData && (
              <div className="mb-4 flex items-center gap-2 text-sm text-[#5b5266]">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading control room data…
              </div>
            )}
            {tab === "dashboard" && <DashboardPanel stats={stats} leads={leads} onRefresh={loadData} />}
            {tab === "leads" && <LeadsCrm leads={leads} onRefresh={loadData} />}
            {tab === "messages" && <MessagesInbox />}
            {tab === "calendar" && <CalendarManager onRefresh={loadData} />}
            {tab === "blog" && <BlogStudio />}
            {tab === "images" && <ImageManager />}
            {tab === "content" && <ContentManager />}
            {tab === "theme" && <ThemeManager />}
            {tab === "seo" && <SeoPanel />}
            {tab === "analytics" && <AnalyticsPanel />}
            {tab === "agents" && <AgentsPanel />}
            {tab === "settings" && <SettingsPanel />}
          </main>
        </div>
      </div>
    </div>
  );
}
