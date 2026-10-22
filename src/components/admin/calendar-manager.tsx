"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Lock, Unlock, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { adminFetch } from "@/lib/admin-client";

type Day = { date: string; status: string; note: string | null };

export function CalendarManager({ onRefresh }: { onRefresh: () => void }) {
  const today = new Date();
  const [cursor, setCursor] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
  );
  const [days, setDays] = useState<Day[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const { toast } = useToast();

  const load = useCallback(async (month: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/availability?month=${month}`);
      const json = await res.json();
      setDays(json.ok ? json.days : []);
    } catch {
      setDays([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(cursor);
  }, [cursor, load]);

  const shift = (delta: number) => {
    const [y, m] = cursor.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setCursor(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  const toggle = async (day: Day) => {
    if (day.status === "past") return;
    if (day.status === "booked") {
      toast({
        title: "Date is booked",
        description: "Resolve the linked lead first — booked dates are locked.",
        variant: "destructive",
      });
      return;
    }
    const nextStatus = day.status === "blocked" ? "open" : "blocked";
    setBusy(day.date);
    const res = await adminFetch("/api/admin/availability", {
      method: "POST",
      body: JSON.stringify({ date: day.date, status: nextStatus }),
    });
    setBusy(null);
    if (res.ok) {
      toast({
        title: nextStatus === "blocked" ? "Date blocked" : "Date reopened",
        description: `${day.date} is now ${nextStatus}.`,
      });
      load(cursor);
      onRefresh();
    } else {
      toast({ title: "Could not update", description: res.error, variant: "destructive" });
    }
  };

  const [y, m] = cursor.split("-").map(Number);
  const monthLabel = new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const firstWeekday = new Date(y, m - 1, 1).getDay();
  const daysInMonth = new Date(y, m, 0).getDate();

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[#2a1b3d]">Availability calendar</h1>
          <p className="mt-1 text-sm text-[#5b5266]">
            Click an open date to block it (travel, rest, private commitments). The booking
            wizard reads this live — confirming a lead marks its date booked automatically.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="rounded-full border-[#ddd2bc]" onClick={() => shift(-1)} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <p className="min-w-40 text-center font-display text-lg font-semibold text-[#2a1b3d]">{monthLabel}</p>
          <Button variant="outline" size="icon" className="rounded-full border-[#ddd2bc]" onClick={() => shift(1)} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="rounded-3xl border border-[#e3d9c6] bg-[#fffdf7] p-5 sm:p-7">
        <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-wider text-[#5b5266]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <span key={d} className="py-1">
              {d}
            </span>
          ))}
        </div>
        {loading ? (
          <div className="grid grid-cols-7 gap-2 pt-2" aria-live="polite">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-xl bg-[#efe8da]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2 pt-2">
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <span key={`b-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = days.find((d) => d.date.endsWith(`-${String(i + 1).padStart(2, "0")}`));
              const status = day?.status ?? "open";
              const isBusy = busy === day?.date;
              return (
                <button
                  key={i}
                  onClick={() => day && toggle(day)}
                  disabled={status === "past" || isBusy}
                  aria-label={`${day?.date ?? i + 1} — ${status}${status === "blocked" ? ", click to reopen" : status === "open" ? ", click to block" : ""}`}
                  className={`group relative flex aspect-square flex-col items-center justify-center rounded-xl border text-sm font-medium transition-all duration-300 ${
                    status === "open"
                      ? "border-[#e3d9c6] bg-[#faf6ee] text-[#2a1b3d] hover:border-[#b8923a] hover:shadow-md"
                      : status === "booked"
                        ? "cursor-not-allowed border-[#b3263e]/30 bg-[#b3263e]/10 text-[#b3263e]"
                        : status === "blocked"
                          ? "border-[#5b5266]/30 bg-[#efe8da] text-[#5b5266]/70"
                          : "cursor-not-allowed border-transparent text-[#5b5266]/25"
                  }`}
                >
                  {isBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#b8923a]" aria-hidden="true" />
                  ) : (
                    <>
                      <span>{i + 1}</span>
                      {status === "open" && (
                        <Unlock className="absolute bottom-1.5 h-3 w-3 text-[#b8923a]/0 transition-colors group-hover:text-[#b8923a]" aria-hidden="true" />
                      )}
                      {status === "blocked" && (
                        <Lock className="absolute bottom-1.5 h-3 w-3 text-[#5b5266]/50" aria-hidden="true" />
                      )}
                      {status === "booked" && (
                        <CalendarDays className="absolute bottom-1.5 h-3 w-3 text-[#b3263e]/70" aria-hidden="true" />
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#efe8da] pt-4 text-xs text-[#5b5266]">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border border-[#e3d9c6] bg-[#faf6ee]" /> Open
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border border-[#5b5266]/30 bg-[#efe8da]" /> Blocked (click to reopen)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border border-[#b3263e]/30 bg-[#b3263e]/10" /> Booked (locked)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded opacity-25" /> Past
          </span>
        </div>
      </div>
    </div>
  );
}
