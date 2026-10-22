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
  Trash2,
  GripVertical,
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

const STATUS_TINTS: Record<string, string> = {
  new: "#b8923a",
  contacted: "#8a7aa5",
  quote: "#3e8e8a",
  negotiation: "#b8923a",
  advance: "#d9b666",
  confirmed: "#3e8e8a",
  completed: "#2a1b3d",
  lost: "#b3263e",
};

const fmt = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" });

export function LeadsCrm({ leads, onRefresh }: { leads: Lead[]; onRefresh: () => void }) {
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [query, setQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [dragging, setDragging] = useState<Lead | null>(null);
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
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[#2a1b3d]">Leads CRM</h1>
          <p className="mt-1 text-sm text-[#5b5266]">
            Real enquiries from the booking form — every change is verified server-side.
            Contact-page messages now live in their own “Messages” tab.
          </p>
        </div>
      </header>

      <>
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
            <table className="w-full min-w-[860px] text-left text-sm">
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
                    <td className="px-5 py-3.5 font-medium text-[#2a1b3d]">{l.name}</td>
                    <td className="px-5 py-3.5 text-[#5b5266]">{EVENT_LABELS[l.eventType] ?? l.eventType}</td>
                    <td className="px-5 py-3.5 text-[#5b5266]">{fmt(l.eventDate)}</td>
                    <td className="px-5 py-3.5 text-[#5b5266]">{l.city}</td>
                    <td className="px-5 py-3.5 text-[#5b5266]">{l.guests}</td>
                    <td className="px-5 py-3.5 text-[#5b5266]">{l.budget}</td>
                    <td className="px-5 py-3.5 text-[#5b5266]">{l.utmSource ?? "direct"}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className="rounded-full px-3 py-1 text-xs font-semibold"
                        style={{ background: `${STATUS_TINTS[l.status]}18`, color: STATUS_TINTS[l.status] }}
                      >
                        {LEAD_STATUSES.find((s) => s.id === l.status)?.label ?? l.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-[#5b5266]">
                      No leads match this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* lead detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto scroll-slim border-[#e3d9c6] bg-[#fffdf7] sm:max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl font-semibold text-[#2a1b3d]">
                  {selected.name}
                </DialogTitle>
                <DialogDescription className="text-[#5b5266]">
                  Enquiry #{selected.id.slice(-8).toUpperCase()} · {fmt(selected.eventDate)} · {selected.city}
                </DialogDescription>
              </DialogHeader>

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
                    <dd className="mt-0.5 font-medium text-[#2a1b3d]">{v}</dd>
                  </div>
                ))}
              </dl>

              {selected.notes && (
                <div className="rounded-xl bg-[#f3ead3]/50 p-4 text-sm leading-6 text-[#5b5266]">
                  {selected.notes}
                </div>
              )}

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
                          ? "text-white"
                          : "border border-[#e3d9c6] bg-[#faf6ee] text-[#5b5266] hover:border-[#b8923a]"
                      }`}
                      style={selected.status === s.id ? { background: STATUS_TINTS[s.id] } : undefined}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 border-t border-[#efe8da] pt-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full border-[#b8923a]/50 hover:bg-[#f3ead3]"
                  onClick={() =>
                    toast({ title: "Email reply drafted", description: "Template loaded — provider integration is Phase 2." })
                  }
                >
                  <Mail className="mr-1.5 h-4 w-4" aria-hidden="true" /> Reply by email
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full border-[#25d366]/50 text-[#128c4b] hover:bg-[#25d366]/10"
                  onClick={() =>
                    toast({ title: "WhatsApp template ready", description: "Click-to-chat opens — WhatsApp Business API is Phase 2." })
                  }
                >
                  <MessageCircle className="mr-1.5 h-4 w-4" aria-hidden="true" /> WhatsApp
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto rounded-full border-[#b3263e]/40 text-[#b3263e] hover:bg-[#b3263e]/10"
                  onClick={() => deleteLead(selected)}
                >
                  <Trash2 className="mr-1.5 h-4 w-4" aria-hidden="true" /> Remove
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      </>
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
  return (
    <div
      ref={setNodeRef}
      className={`w-64 shrink-0 rounded-2xl border p-3 transition-colors ${
        isOver ? "border-[#b8923a] bg-[#f3ead3]/70" : "border-[#e3d9c6] bg-[#f6f0e2]/70"
      }`}
    >
      <div className="mb-3 flex items-center justify-between px-1.5">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#2a1b3d]">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_TINTS[status] }} aria-hidden="true" />
          {label}
        </p>
        <span className="rounded-full bg-[#fffdf7] px-2.5 py-0.5 text-xs font-semibold text-[#5b5266]">
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
  return (
    <div className={dragging ? "rounded-xl border border-[#b8923a] bg-[#fffdf7] p-3.5 shadow-xl" : ""}>
      <div className="flex items-start justify-between gap-2">
        <button
          className="text-left text-sm font-semibold text-[#2a1b3d] hover:text-[#b3263e]"
          onClick={(e) => {
            if (onOpen) {
              e.stopPropagation();
              onOpen(lead);
            }
          }}
        >
          {lead.name}
        </button>
        {!dragging && (
          <GripVertical className="h-3.5 w-3.5 shrink-0 text-[#e3d9c6] group-hover:text-[#b8923a]" aria-hidden="true" />
        )}
      </div>
      <p className="mt-1 text-xs text-[#5b5266]">
        {EVENT_LABELS[lead.eventType] ?? lead.eventType} · {fmt(lead.eventDate)}
      </p>
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span className="text-xs text-[#5b5266]">
          {lead.city} · {lead.guests} guests
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
