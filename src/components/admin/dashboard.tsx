"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Users, CalendarCheck, CheckCircle2, TrendingUp, Globe, MousePointerClick, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LEAD_STATUSES } from "@/lib/content";
import type { Lead, Stats } from "@/lib/admin-client";

const GOLD = "#b8923a";
const VERMILION = "#b3263e";
const TEAL = "#3e8e8a";
const PLUM = "#2a1b3d";
const DUSK = "#5b5266";

const EVENT_LABELS: Record<string, string> = {
  wedding: "Wedding",
  corporate: "Corporate",
  birthday: "Birthday",
  college: "College",
  private: "Private",
  virtual: "Virtual",
};

export function DashboardPanel({
  stats,
  leads,
  onRefresh,
}: {
  stats: Stats | null;
  leads: Lead[];
  onRefresh: () => void;
}) {
  if (!stats) {
    return (
      <div className="flex h-64 items-center justify-center text-[#5b5266]">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" /> Crunching the numbers…
      </div>
    );
  }

  const cards = [
    { label: "Total enquiries", value: stats.totals.leads, icon: Users, tint: PLUM },
    { label: "This week", value: stats.totals.thisWeek, icon: TrendingUp, tint: TEAL },
    { label: "Confirmed shows", value: stats.totals.confirmed, icon: CalendarCheck, tint: VERMILION },
    { label: "Completed", value: stats.totals.completed, icon: CheckCircle2, tint: GOLD },
  ];

  const series = stats.series.map((s) => ({
    ...s,
    label: new Date(s.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
  }));

  const sources = Object.entries(stats.bySource)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const events = Object.entries(stats.byEventType).map(([k, v]) => ({
    name: EVENT_LABELS[k] ?? k,
    value: v,
  }));
  const funnelMax = Math.max(...stats.funnel.map((f) => f.count), 1);

  const recent = leads.slice(0, 6);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[#2a1b3d]">Command dashboard</h1>
          <p className="mt-1 text-sm text-[#5b5266]">
            First-party lead analytics · GA4 &amp; Search Console API dashboards arrive with Phase 2
          </p>
        </div>
        <Button onClick={onRefresh} variant="outline" className="border-[#b8923a]/50 hover:bg-[#f3ead3]">
          Refresh data
        </Button>
      </header>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="border-[#e3d9c6] bg-[#fffdf7] card-cine">
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white"
                style={{ background: c.tint }}
              >
                <c.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-display text-3xl font-semibold leading-none text-[#2a1b3d]">{c.value}</p>
                <p className="mt-1.5 text-xs font-medium uppercase tracking-wider text-[#5b5266]">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 14-day enquiry trend */}
        <Card className="border-[#e3d9c6] bg-[#fffdf7]">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg font-semibold text-[#2a1b3d]">
              Enquiries — last 14 days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64" role="img" aria-label="Area chart of enquiries per day over the last 14 days">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={GOLD} stopOpacity={0.45} />
                      <stop offset="100%" stopColor={GOLD} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3d9c6" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: DUSK }} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: DUSK }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#fffdf7",
                      border: "1px solid #e3d9c6",
                      borderRadius: 12,
                      fontSize: 13,
                    }}
                  />
                  <Area type="monotone" dataKey="count" name="Enquiries" stroke={GOLD} strokeWidth={2.5} fill="url(#goldFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* conversion funnel */}
        <Card className="border-[#e3d9c6] bg-[#fffdf7]">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg font-semibold text-[#2a1b3d]">
              Lead pipeline funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3.5 pt-2">
              {stats.funnel.map((f, i) => (
                <div key={f.stage}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-[#2a1b3d]">{f.stage}</span>
                    <span className="text-[#5b5266]">
                      {f.count}
                      {i > 0 && stats.funnel[i - 1].count > 0 && (
                        <span className="ml-2 text-xs text-[#5b5266]">
                          {Math.round((f.count / stats.funnel[i - 1].count) * 100)}%
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-[#efe8da]">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.max(4, (f.count / funnelMax) * 100)}%`,
                        background: `linear-gradient(90deg, ${GOLD}, ${VERMILION})`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 rounded-xl bg-[#f3ead3]/50 p-3.5 text-xs leading-6 text-[#5b5266]">
              Funnel view of the doc §7.2 pipeline: New → Contacted → Quote → Negotiation →
              Advance Paid → Confirmed → Completed / Lost. Drag leads between columns in the CRM.
            </p>
          </CardContent>
        </Card>

        {/* leads by source */}
        <Card className="border-[#e3d9c6] bg-[#fffdf7]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 font-display text-lg font-semibold text-[#2a1b3d]">
              <Globe className="h-4 w-4 text-[#b8923a]" aria-hidden="true" /> Leads by source (UTM)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56" role="img" aria-label="Bar chart of leads by source">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sources.map(([name, value]) => ({ name, value }))} layout="vertical" margin={{ left: 10, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3d9c6" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: DUSK }} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={90}
                    tick={{ fontSize: 11, fill: DUSK }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(184,146,58,0.08)" }}
                    contentStyle={{ background: "#fffdf7", border: "1px solid #e3d9c6", borderRadius: 12, fontSize: 13 }}
                  />
                  <Bar dataKey="value" name="Leads" fill={TEAL} radius={[0, 8, 8, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-xs text-[#5b5266]">
              Every lead stores source/UTM + landing page, so revenue is attributable to a
              specific SEO page or campaign (doc 7.2).
            </p>
          </CardContent>
        </Card>

        {/* leads by event type */}
        <Card className="border-[#e3d9c6] bg-[#fffdf7]">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg font-semibold text-[#2a1b3d]">Leads by occasion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56" role="img" aria-label="Bar chart of leads by event type">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={events} margin={{ left: -18, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3d9c6" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: DUSK }} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: DUSK }} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: "rgba(179,38,62,0.06)" }}
                    contentStyle={{ background: "#fffdf7", border: "1px solid #e3d9c6", borderRadius: 12, fontSize: 13 }}
                  />
                  <Bar dataKey="value" name="Leads" radius={[8, 8, 0, 0]} barSize={34}>
                    {events.map((_, i) => (
                      <Cell key={i} fill={[GOLD, VERMILION, TEAL, PLUM, DUSK, "#8a7aa5"][i % 6]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* recent leads */}
      <Card className="border-[#e3d9c6] bg-[#fffdf7]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-display text-lg font-semibold text-[#2a1b3d]">
            <MousePointerClick className="h-4 w-4 text-[#b8923a]" aria-hidden="true" /> Latest enquiries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto scroll-slim">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#e3d9c6] text-xs uppercase tracking-wider text-[#5b5266]">
                  <th scope="col" className="py-2.5 pr-4 font-semibold">Client</th>
                  <th scope="col" className="py-2.5 pr-4 font-semibold">Occasion</th>
                  <th scope="col" className="py-2.5 pr-4 font-semibold">Date</th>
                  <th scope="col" className="py-2.5 pr-4 font-semibold">City</th>
                  <th scope="col" className="py-2.5 pr-4 font-semibold">Budget</th>
                  <th scope="col" className="py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((l) => {
                  const st = LEAD_STATUSES.find((s) => s.id === l.status);
                  return (
                    <tr key={l.id} className="border-b border-[#efe8da] last:border-0">
                      <td className="py-3 pr-4 font-medium text-[#2a1b3d]">{l.name}</td>
                      <td className="py-3 pr-4 text-[#5b5266]">{EVENT_LABELS[l.eventType] ?? l.eventType}</td>
                      <td className="py-3 pr-4 text-[#5b5266]">
                        {new Date(l.eventDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </td>
                      <td className="py-3 pr-4 text-[#5b5266]">{l.city}</td>
                      <td className="py-3 pr-4 text-[#5b5266]">{l.budget}</td>
                      <td className="py-3">
                        <Badge
                          className={
                            l.status === "lost"
                              ? "bg-[#b3263e]/10 text-[#b3263e] hover:bg-[#b3263e]/10"
                              : l.status === "confirmed" || l.status === "completed"
                                ? "bg-[#3e8e8a]/10 text-[#3e8e8a] hover:bg-[#3e8e8a]/10"
                                : "bg-[#b8923a]/10 text-[#8f6d27] hover:bg-[#b8923a]/10"
                          }
                        >
                          {st?.label ?? l.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
                {recent.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#5b5266]">
                      No enquiries yet — submit one through the booking wizard to see it here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
