"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  Search,
  Download,
  LayoutGrid,
  Table2,
  Mail,
  MessageCircle,
  Phone,
  Trash2,
  GripVertical,
  Users,
  Sparkles,
  CalendarCheck,
  IndianRupee,
  Copy,
  Check,
  TrendingUp,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { adminFetch, type Lead } from "@/lib/admin-client";
import { LEAD_STATUSES } from "@/lib/content";

const EVENT_LABELS: Record<string, string> = {
  wedding: "Wedding",
  corporate: "Corporate",
  birthday: "Birthday",
  college: "College",
  private: "Private",
  virtual: "Virtual",
};

const EVENT_ICON: Record<string, string> = {
  wedding: "💍",
  corporate: "💼",
  birthday: "🎂",
  college: "🎓",
  private: "🎩",
  virtual: "🖥",
};

const STATUS_TINTS: Record<string, string> = {
  new: "#b8923a",
  contacted: "#8a7aa5",
  quote: "#3e8e8a",
  negotiation: "#d4820a",
  advance: "#2f6d4f",
  confirmed: "#2f6d4f",
  completed: "#2a1b3d",
  lost: "#b3263e",
};

const fmt = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" });

/** WhatsApp link from any Indian phone format (10-digit, +91…, 91…). */
function waLink(phone: string, name: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  const full = digits.length === 10 ? `91${digits}` : digits;
  const text = encodeURIComponent(
    `Namaste ${name.split(" ")[0]}! Jadugar Rajtilak's studio here — following up on your magic show enquiry.`
  );
  return `https://wa.me/${full}?text=${text}`;
}

/** Avatar initials — consistent plum/gold chip per lead. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

/** Days until the event (negative = past). */
function daysTo(eventDate: string): number {
  const ms = new Date(eventDate + "T00:00:00").getTime() - new Date(new Date().toDateString()).getTime();
  return Math.round(ms / 86_400_000);
}

export function LeadsCrm({ leads, onRefresh }: { leads: Lead[]; onRefresh: () => void }) {
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [query, setQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [dragging, setDragging] = useState<Lead | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const filtered = useMemo(
    () =>
      leads.filter((l) => {
        const q = query.trim().toLowerCase();
        const matchQ =
          !q ||
          l.name.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          l.email.toLowerCase().includes(q);
        const matchE = eventFilter === "all" || l.eventType === eventFilter;
        return matchQ && matchE;
      }),
    [leads, query, eventFilter]
  );

  const byStatus = useMemo(() => {
    const map: Record<string, Lead[]> = {};
    for (const s of LEAD_STATUSES) map[s.id] = [];
    for (const l of filtered) (map[l.status] ??= []).push(l);
    return map;
  }, [filtered]);

  // ── KPI strip ──
  const kpis = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86_400_000;
    const total = leads.length;
    const newWeek = leads.filter((l) => new Date(l.createdAt).getTime() > weekAgo).length;
    const booked = leads.filter((l) => l.status === "confirmed" || l.status === "advance" || l.status === "completed").length;
    const upcoming = leads.filter((l) => {
      const d = daysTo(l.eventDate);
      return d >= 0 && d <= 30 && l.status !== "lost";
    }).length;
    return { total, newWeek, booked, upcoming };
  }, [leads]);

  const moveLead = async (lead: Lead, status: string) => {
    if (lead.status === status) return;
    onRefresh(); // parent refresh keeps list live; optimistic feel via toast
    const res = await adminFetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast({
        title: "Pipeline updated",
        description: `${lead.name} → ${LEAD_STATUSES.find((s) => s.id === status)?.label}`,
      });
      if (selected?.id === lead.id) setSelected({ ...lead, status });
    } else {
      toast({ title: "Could not update", description: res.error, variant: "destructive" });
    }
    onRefresh();
  };

  const deleteLead = async (lead: Lead) => {
    const res = await adminFetch(`/api/leads/${lead.id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: "Lead removed", description: `${lead.name} deleted from the pipeline.` });
      setSelected(null);
      onRefresh();
    } else {
      toast({ title: "Could not delete", description: res.error, variant: "destructive" });
    }
  };

  const copy = (label: string, value: string) => {
    navigator.clipboard
      ?.writeText(value)
      .then(() => {
        setCopied(label);
        setTimeout(() => setCopied(null), 1600);
      })
      .catch(() => toast({ title: "Copy failed", description: "Select and copy manually.", variant: "destructive" }));
  };

  const exportCsv = () => {
    const header = ["Name", "Phone", "Email", "Occasion", "Event Date", "City", "Guests", "Budget", "Status", "Source", "Created"];
    const rows = filtered.map((l) =>
      [l.name, l.phone, l.email, EVENT_LABELS[l.eventType] ?? l.eventType, l.eventDate, l.city, l.guests, l.budget, l.status, l.utmSource ?? "direct", l.createdAt.slice(0, 10)]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const blob = new Blob([[header.join(","), ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rajtilak-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV exported", description: `${filtered.length} leads downloaded.` });
  };

  const onDragStart = (e: DragStartEvent) => {
    const lead = leads.find((l) => l.id === e.active.id);
    setDragging(lead ?? null);
  };

  const onDragEnd = (e: DragEndEvent) => {
    setDragging(null);
    const lead = leads.find((l) => l.id === e.active.id);
    const overId = e.over?.id as string | undefined;
    if (lead && overId && overId !== lead.status && LEAD_STATUSES.some((s) => s.id === overId)) {
      moveLead(lead, overId);
    }
  };

  return (
    <div className="space-y-5">
      {/* ── header ── */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[#2a1b3d]">Leads CRM</h1>
          <p className="mt-1 text-sm text-[#5b5266]">
            Every enquiry from the booking form — drag cards across the pipeline, or open a lead for
            one-tap WhatsApp, call and email actions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f5e9] px-3 py-1.5 text-xs font-semibold text-[#2f6d4f]">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2f6d4f] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2f6d4f]" />
            </span>
            Live pipeline
          </span>
        </div>
      </header>

      {/* ── KPI strip — the studio's week at a glance ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total leads", value: kpis.total, icon: Users, tint: "#2a1b3d" },
          { label: "New this week", value: kpis.newWeek, icon: Sparkles, tint: "#b8923a" },
          { label: "Booked shows", value: kpis.booked, icon: CalendarCheck, tint: "#2f6d4f" },
          { label: "Events ≤ 30 days", value: kpis.upcoming, icon: TrendingUp, tint: "#3e8e8a" },
        ].map((k) => (
          <div key={k.label} className="flex items-center gap-3.5 rounded-2xl border border-[#e3d9c6] bg-[#fffdf7] px-4 py-3.5 shadow-sm">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
              style={{ background: k.tint }}
            >
              <k.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-2xl font-semibold leading-tight text-[#2a1b3d]">{k.value}</p>
              <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-[#8c8a84]">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── toolbar ── */}
      <div className="flex flex-wrap items-center gap-2.5 pb-1">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5b5266]" aria-hidden="true" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, city, phone…"
            aria-label="Search leads"
            className="h-10 w-56 rounded-full border-[#ddd2bc] bg-[#fffdf7] pl-10"
          />
        </div>
        <Select value={eventFilter} onValueChange={setEventFilter}>
          <SelectTrigger className="h-10 w-40 rounded-full border-[#ddd2bc] bg-[#fffdf7]" aria-label="Filter by occasion">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All occasions</SelectItem>
            {Object.entries(EVENT_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex overflow-hidden rounded-full border border-[#ddd2bc] bg-[#fffdf7]">
          <button
            onClick={() => setView("kanban")}
            aria-pressed={view === "kanban"}
            className={`flex h-10 items-center gap-1.5 px-4 text-sm font-medium ${view === "kanban" ? "bg-[#2a1b3d] text-[#faf6ee]" : "text-[#5b5266]"}`}
          >
            <LayoutGrid className="h-4 w-4" aria-hidden="true" /> Kanban
          </button>
          <button
            onClick={() => setView("table")}
            aria-pressed={view === "table"}
            className={`flex h-10 items-center gap-1.5 px-4 text-sm font-medium ${view === "table" ? "bg-[#2a1b3d] text-[#faf6ee]" : "text-[#5b5266]"}`}
          >
            <Table2 className="h-4 w-4" aria-hidden="true" /> Table
          </button>
        </div>
        <Button onClick={exportCsv} variant="outline" className="h-10 rounded-full border-[#b8923a]/50 hover:bg-[#f3ead3]">
          <Download className="mr-1.5 h-4 w-4" aria-hidden="true" /> CSV
        </Button>
        <span className="ml-auto text-xs text-[#8c8a84]">
          {filtered.length} of {leads.length} leads
        </span>
      </div>

      {view === "kanban" ? (
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto scroll-slim pb-4" role="list" aria-label="Lead pipeline columns">
            {LEAD_STATUSES.map((s) => (
              <KanbanColumn key={s.id} status={s.id} label={s.label} leads={byStatus[s.id] ?? []} onOpen={setSelected} />
            ))}
          </div>
          <DragOverlay>
            {dragging && (
              <div className="w-64 rotate-2 opacity-95">
                <LeadCard lead={dragging} dragging />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#e3d9c6] bg-[#fffdf7]">
          <div className="overflow-x-auto scroll-slim">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#e3d9c6] bg-[#f6f0e2] text-xs uppercase tracking-wider text-[#5b5266]">
                  <th scope="col" className="px-5 py-3 font-semibold">Client</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Occasion</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Event date</th>
                  <th scope="col" className="px-5 py-3 font-semibold">City</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Guests</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Budget</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Source</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr
                    key={l.id}
                    onClick={() => setSelected(l)}
                    className="cursor-pointer border-b border-[#efe8da] transition-colors last:border-0 hover:bg-[#f3ead3]/40"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-[#faf6ee]"
                          style={{ background: STATUS_TINTS[l.status] ?? "#2a1b3d" }}
                          aria-hidden="true"
                        >
                          {initials(l.name)}
                        </span>
                        <div>
                          <p className="font-medium text-[#2a1b3d]">{l.name}</p>
                          <p className="text-[11px] text-[#8c8a84]">{l.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#5b5266]">
                      <span aria-hidden="true" className="mr-1.5">{EVENT_ICON[l.eventType] ?? "✨"}</span>
                      {EVENT_LABELS[l.eventType] ?? l.eventType}
                    </td>
                    <td className="px-5 py-3 text-[#5b5266]">{fmt(l.eventDate)}</td>
                    <td className="px-5 py-3 text-[#5b5266]">{l.city}</td>
                    <td className="px-5 py-3 text-[#5b5266]">{l.guests}</td>
                    <td className="px-5 py-3 font-medium text-[#2a1b3d]">{l.budget}</td>
                    <td className="px-5 py-3 text-[#8c8a84]">{l.utmSource ?? "direct"}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                        style={{ background: `${STATUS_TINTS[l.status]}18`, color: STATUS_TINTS[l.status] }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_TINTS[l.status] }} aria-hidden="true" />
                        {LEAD_STATUSES.find((s) => s.id === l.status)?.label ?? l.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-[#5b5266]">
                      <Inbox className="mx-auto mb-2 h-6 w-6 text-[#b8923a]/60" aria-hidden="true" />
                      No leads match this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── lead detail dialog — the studio desk for one enquiry ── */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto scroll-slim border-[#e3d9c6] bg-[#fffdf7] p-0 sm:max-w-2xl">
          {selected && (
            <>
              {/* header band */}
              <div className="relative overflow-hidden rounded-t-lg bg-[#2a1b3d] px-6 pb-5 pt-6">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-60"
                  style={{ background: "radial-gradient(70% 90% at 85% -20%, color-mix(in srgb, #b8923a 22%, transparent), transparent 60%)" }}
                />
                <div className="relative flex items-start gap-4">
                  <span
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-display text-xl font-semibold text-[#faf6ee]"
                    style={{ background: STATUS_TINTS[selected.status] ?? "#b3263e" }}
                    aria-hidden="true"
                  >
                    {initials(selected.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <DialogTitle className="font-display text-2xl font-semibold leading-tight text-[#faf6ee]">
                      {selected.name}
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-[13px] text-[#e7def0]/75">
                      Enquiry #{selected.id.slice(-8).toUpperCase()} · {fmt(selected.eventDate)} · {selected.city}
                    </DialogDescription>
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      <span
                        className="rounded-full px-3 py-1 text-[11px] font-semibold"
                        style={{ background: `${STATUS_TINTS[selected.status]}30`, color: "#faf6ee" }}
                      >
                        {LEAD_STATUSES.find((s) => s.id === selected.status)?.label ?? selected.status}
                      </span>
                      <span className="rounded-full bg-[#faf6ee]/10 px-3 py-1 text-[11px] font-semibold text-[#d9b666]">
                        {EVENT_ICON[selected.eventType] ?? "✨"} {EVENT_LABELS[selected.eventType] ?? selected.eventType}
                      </span>
                      {(() => {
                        const d = daysTo(selected.eventDate);
                        if (d < 0) return null;
                        return (
                          <span className="rounded-full bg-[#faf6ee]/10 px-3 py-1 text-[11px] font-semibold text-[#e7def0]">
                            {d === 0 ? "Today" : d === 1 ? "Tomorrow" : `in ${d} days`}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5 px-6 py-5">
                {/* one-tap actions — these actually work */}
                <div className="flex flex-wrap gap-2">
                  <a
                    href={waLink(selected.phone, selected.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-[#25d366] px-5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#1fb457]"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
                  </a>
                  <a
                    href={`tel:${selected.phone}`}
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-[#2a1b3d] px-5 text-sm font-semibold text-[#faf6ee] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#35224d]"
                  >
                    <Phone className="h-4 w-4" aria-hidden="true" /> Call
                  </a>
                  <a
                    href={`mailto:${selected.email}?subject=${encodeURIComponent("Your magic show enquiry — Jadugar Rajtilak")}&body=${encodeURIComponent(`Namaste ${selected.name},\n\nThank you for your enquiry for ${EVENT_LABELS[selected.eventType] ?? selected.eventType} on ${fmt(selected.eventDate)} in ${selected.city}.\n\n`)}`}
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-[#b8923a] px-5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#a07e2e]"
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" /> Email
                  </a>
                  <button
                    onClick={() => copy("phone", selected.phone)}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-[#e3d9c6] px-4 text-sm font-medium text-[#5b5266] transition-colors hover:border-[#b8923a] hover:text-[#2a1b3d]"
                  >
                    {copied === "phone" ? (
                      <Check className="h-4 w-4 text-[#2f6d4f]" aria-hidden="true" />
                    ) : (
                      <Copy className="h-4 w-4" aria-hidden="true" />
                    )}
                    {copied === "phone" ? "Copied" : "Copy phone"}
                  </button>
                </div>

                {/* enquiry details */}
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3.5 text-sm sm:grid-cols-3">
                  {[
                    ["Phone", selected.phone],
                    ["Email", selected.email],
                    ["Occasion", EVENT_LABELS[selected.eventType] ?? selected.eventType],
                    ["Guests", String(selected.guests)],
                    ["Budget", selected.budget],
                    ["Venue", selected.venueType ?? "—"],
                    ["Duration", selected.duration ?? "—"],
                    ["Source", selected.utmSource ?? "direct"],
                    ["Created", fmt(selected.createdAt.slice(0, 10))],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#b8923a]">{k}</dt>
                      <dd className="mt-0.5 break-words font-medium text-[#2a1b3d]">{v}</dd>
                    </div>
                  ))}
                </dl>

                {selected.notes && (
                  <div className="rounded-xl bg-[#f3ead3]/50 p-4 text-sm leading-6 text-[#5b5266]">
                    {selected.notes}
                  </div>
                )}

                {/* pipeline stage */}
                <div>
                  <p className="mb-2 text-sm font-semibold text-[#2a1b3d]">Pipeline stage</p>
                  <div className="flex flex-wrap gap-2">
                    {LEAD_STATUSES.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => moveLead(selected, s.id)}
                        aria-pressed={selected.status === s.id}
                        className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                          selected.status === s.id
                            ? "text-white shadow-md"
                            : "border border-[#e3d9c6] bg-[#faf6ee] text-[#5b5266] hover:border-[#b8923a]"
                        }`}
                        style={selected.status === s.id ? { background: STATUS_TINTS[s.id] } : undefined}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 border-t border-[#efe8da] pt-4">
                  <p className="mr-auto text-[11px] text-[#8c8a84]">
                    <IndianRupee className="mr-1 inline h-3 w-3" aria-hidden="true" />
                    Budget {selected.budget} · {selected.guests} guests · {selected.city}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full border-[#b3263e]/40 text-[#b3263e] hover:bg-[#b3263e]/10"
                    onClick={() => deleteLead(selected)}
                  >
                    <Trash2 className="mr-1.5 h-4 w-4" aria-hidden="true" /> Remove lead
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Kanban column (droppable) ──
function KanbanColumn({
  status,
  label,
  leads,
  onOpen,
}: {
  status: string;
  label: string;
  leads: Lead[];
  onOpen: (l: Lead) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const tint = STATUS_TINTS[status] ?? "#2a1b3d";
  return (
    <div
      ref={setNodeRef}
      className={`w-64 shrink-0 overflow-hidden rounded-2xl border transition-colors ${
        isOver ? "border-[#b8923a] bg-[#f3ead3]/70 shadow-md" : "border-[#e3d9c6] bg-[#f6f0e2]/70"
      }`}
    >
      {/* colored column cap */}
      <div className="h-1.5 w-full" style={{ background: tint }} aria-hidden="true" />
      <div className="p-3">
        <div className="mb-3 flex items-center justify-between px-1.5">
          <p className="flex items-center gap-2 text-sm font-semibold text-[#2a1b3d]">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: tint }} aria-hidden="true" />
            {label}
          </p>
          <span className="rounded-full bg-[#fffdf7] px-2.5 py-0.5 text-xs font-semibold text-[#5b5266] shadow-sm">
            {leads.length}
          </span>
        </div>
        <div className="flex min-h-24 flex-col gap-2.5" role="list" aria-label={`${label} leads`}>
          {leads.map((l) => (
            <DraggableCard key={l.id} lead={l} onOpen={onOpen} />
          ))}
          {leads.length === 0 && (
            <p className="rounded-xl border border-dashed border-[#ddd2bc] p-4 text-center text-xs text-[#5b5266]/70">
              Drop a lead here
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Draggable lead card ──
function DraggableCard({ lead, onOpen }: { lead: Lead; onOpen: (l: Lead) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id });
  return (
    <div
      ref={setNodeRef}
      style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined}
      className={`group cursor-grab touch-none rounded-xl border border-[#e3d9c6] bg-[#fffdf7] p-3.5 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing ${
        isDragging ? "opacity-40" : ""
      }`}
      {...attributes}
      {...listeners}
      role="listitem"
      aria-label={`Lead: ${lead.name}`}
    >
      <LeadCard lead={lead} onOpen={onOpen} />
    </div>
  );
}

function LeadCard({ lead, onOpen, dragging = false }: { lead: Lead; onOpen?: (l: Lead) => void; dragging?: boolean }) {
  const d = daysTo(lead.eventDate);
  const soon = d >= 0 && d <= 14 && lead.status !== "lost" && lead.status !== "completed";
  return (
    <div className={dragging ? "rounded-xl border border-[#b8923a] bg-[#fffdf7] p-3.5 shadow-xl" : ""}>
      <div className="flex items-start gap-2.5">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-[#faf6ee]"
          style={{ background: STATUS_TINTS[lead.status] ?? "#2a1b3d" }}
          aria-hidden="true"
        >
          {initials(lead.name)}
        </span>
        <button
          className="min-w-0 flex-1 text-left"
          onClick={(e) => {
            if (onOpen) {
              e.stopPropagation();
              onOpen(lead);
            }
          }}
        >
          <span className="block truncate text-sm font-semibold text-[#2a1b3d] hover:text-[#b3263e]">{lead.name}</span>
          <span className="mt-0.5 block text-xs text-[#5b5266]">
            {EVENT_ICON[lead.eventType] ?? "✨"} {EVENT_LABELS[lead.eventType] ?? lead.eventType} · {fmt(lead.eventDate)}
          </span>
        </button>
        {!dragging && (
          <GripVertical className="h-3.5 w-3.5 shrink-0 text-[#e3d9c6] group-hover:text-[#b8923a]" aria-hidden="true" />
        )}
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span className="truncate text-xs text-[#5b5266]">
          {lead.city} · {lead.guests} guests
          {soon ? <span className="ml-1.5 font-semibold text-[#b3263e]">· {d === 0 ? "today!" : `${d}d`}</span> : null}
        </span>
        <Badge
          variant="secondary"
          className="px-2 py-0 text-[10px] font-semibold"
          style={{ background: `${STATUS_TINTS[lead.status]}15`, color: STATUS_TINTS[lead.status] }}
        >
          {lead.budget.replace("₹", "").trim()}
        </Badge>
      </div>
    </div>
  );
}
