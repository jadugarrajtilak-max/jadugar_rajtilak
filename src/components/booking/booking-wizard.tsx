"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Loader2,
  CalendarCheck,
  MessageCircle,
  Sparkles,
  Heart,
  Briefcase,
  Cake,
  Mic,
  Crown,
  Monitor,
  PartyPopper,
} from "lucide-react";
import {
  BUDGET_RANGES,
  DURATIONS,
  EVENT_TYPES,
  VENUE_TYPES,
  type RouteId,
} from "@/lib/content";
import { leadSchema } from "@/lib/validation";

// ─────────────────────────────────────────────────────────────
// 4-step booking wizard (doc 7.1, mobile-first, max 4 steps)
// Step 1 occasion+date+city · Step 2 audience+budget
// Step 3 contact · Step 4 review+consent → confirmation
// Zod validation on client AND server; honeypot + UTM capture;
// GA4-style events (booking_step_1..4, generate_lead).
// ─────────────────────────────────────────────────────────────

type FormData = {
  eventType: string;
  eventDate: string;
  city: string;
  guests: string;
  venueType: string;
  duration: string;
  budget: string;
  name: string;
  phone: string;
  email: string;
  contactTime: string;
  notes: string;
  consent: boolean;
  website: string; // honeypot
};

const EMPTY: FormData = {
  eventType: "",
  eventDate: "",
  city: "",
  guests: "",
  venueType: "",
  duration: "",
  budget: "",
  name: "",
  phone: "",
  email: "",
  contactTime: "",
  notes: "",
  consent: false,
  website: "",
};

const STEPS = ["Occasion", "Audience", "Contact", "Review"] as const;

const EVENT_ICON = { rings: Heart, briefcase: Briefcase, cake: Cake, mic: Mic, crown: Crown, monitor: Monitor };

type DayInfo = { date: string; status: string; note: string | null };

// GA4-style event tracking (doc 10.5) — pushes to dataLayer when present
function trackEvent(name: string, params: Record<string, unknown> = {}) {
  const w = window as unknown as { dataLayer?: unknown[] };
  if (Array.isArray(w.dataLayer)) w.dataLayer.push({ event: name, ...params });
}

const fmtDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export function BookingWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // attribution (doc 7.2)
  const [attribution] = useState(() => ({
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    landingPage: "",
    referrer: "",
  }));
  useEffect(() => {
    // capture once on mount (sandbox hash-routing keeps query on /)
    const p = new URLSearchParams(window.location.search);
    attribution.utmSource = p.get("utm_source") ?? "";
    attribution.utmMedium = p.get("utm_medium") ?? "";
    attribution.utmCampaign = p.get("utm_campaign") ?? "";
    attribution.landingPage = window.location.pathname + window.location.hash;
    attribution.referrer = document.referrer ?? "";
  }, []);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => {
      if (!e[key]) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  };

  const validateStep = (n: number): boolean => {
    const fields: Record<number, (keyof FormData)[]> = {
      1: ["eventType", "eventDate", "city"],
      2: ["guests", "budget"],
      3: ["name", "phone", "email"],
      4: ["consent"],
    };
    const shape: Record<string, unknown> = {
      eventType: data.eventType,
      eventDate: data.eventDate,
      city: data.city,
      guests: data.guests === "" ? undefined : Number(data.guests),
      venueType: data.venueType,
      duration: data.duration,
      budget: data.budget,
      name: data.name,
      phone: data.phone,
      email: data.email,
      notes: data.notes,
      consent: data.consent,
      website: data.website,
    };
    const picked: Record<string, unknown> = {};
    for (const f of fields[n]) picked[f] = shape[f];
    // consent is boolean literal true in schema — pass through
    const result = leadSchema.partial().safeParse(picked);
    if (result.success) {
      setErrors({});
      return true;
    }
    const map: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!map[key]) map[key] = issue.message;
    }
    setErrors(map);
    return Object.keys(map).length === 0;
  };

  const next = () => {
    if (validateStep(step)) {
      trackEvent(`booking_step_${step}`, { event_type: data.eventType });
      setStep((s) => Math.min(4, s + 1));
    }
  };

  const submit = async () => {
    if (!validateStep(4) || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        eventType: data.eventType,
        eventDate: data.eventDate,
        city: data.city,
        guests: Number(data.guests),
        venueType: data.venueType,
        duration: data.duration,
        budget: data.budget,
        name: data.name,
        phone: data.phone,
        email: data.email,
        notes: [data.contactTime ? `Best time to reach: ${data.contactTime}` : "", data.notes]
          .filter(Boolean)
          .join(" · "),
        consent: data.consent,
        website: data.website,
        ...attribution,
      };
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        if (json.fieldErrors) setErrors(json.fieldErrors);
        setSubmitError(json.error ?? "Submission failed. Please try again.");
        return;
      }
      trackEvent("generate_lead", { event_type: data.eventType, city: data.city });
      setLeadId(json.leadId);
    } catch {
      setSubmitError("Network error — please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (leadId) {
    return <Confirmation leadId={leadId} eventName={data.eventType} date={data.eventDate} />;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6">
      <header className="text-center">
        <p className="eyebrow">Book the Royal Stage</p>
        <h1 className="font-display mt-3 text-display-lg font-medium text-[var(--jr-plum)]">
          Four steps to your date
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[var(--jr-ink)]">
          Live availability, honest quoting, and a 72-hour soft-hold on your date the
          moment you enquire.
        </p>
      </header>

      {/* step indicator */}
      <ol className="mx-auto mt-10 flex max-w-xl items-center" aria-label="Booking progress">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = step > n;
          const current = step === n;
          return (
            <li key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <span
                  aria-current={current ? "step" : undefined}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-500 ${
                    done
                      ? "border-[var(--jr-teal)] bg-[var(--jr-teal)] text-white"
                      : current
                        ? "border-[var(--jr-crimson)] bg-[var(--jr-crimson)] text-[var(--jr-ivory)] shadow-[0_0_0_5px_color-mix(in_srgb,var(--jr-crimson)_15%,transparent)]"
                        : "border-[var(--jr-line)] bg-[var(--jr-card)] text-[var(--jr-ink)]"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : n}
                </span>
                <span
                  className={`text-[11px] font-medium uppercase tracking-wider ${
                    current ? "text-[var(--jr-crimson)]" : "text-[var(--jr-ink)]"
                  }`}
                >
                  {label}
                </span>
              </div>
              {n < 4 && (
                <div className={`mx-2 mb-5 h-px flex-1 ${step > n ? "bg-[var(--jr-teal)]" : "bg-[var(--jr-line)]"}`} />
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 rounded-3xl border border-[var(--jr-line)] bg-[var(--jr-card)] p-6 shadow-[0_30px_70px_-50px_color-mix(in_srgb,var(--jr-plum)_50%,transparent)] sm:p-9">
        {step === 1 && (
          <Step1 data={data} errors={errors} set={set} />
        )}
        {step === 2 && (
          <Step2 data={data} errors={errors} set={set} />
        )}
        {step === 3 && (
          <Step3 data={data} errors={errors} set={set} />
        )}
        {step === 4 && (
          <Step4
            data={data}
            errors={errors}
            set={set}
            submitError={submitError}
            submitting={submitting}
            onSubmit={submit}
          />
        )}

        {/* honeypot — invisible to humans (doc 9.4) */}
        <input
          type="text"
          name="website"
          value={data.website}
          onChange={(e) => set("website", e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="pointer-events-none absolute h-0 w-0 opacity-0"
        />

        <div className="mt-9 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-[var(--jr-ink)] transition-colors hover:bg-[var(--jr-sand-light)] hover:text-[var(--jr-plum)]"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Back
            </button>
          ) : (
            <span />
          )}
          {step < 4 ? (
            <button
              onClick={next}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--jr-crimson)] px-8 py-3 text-[15px] font-semibold text-[var(--jr-ivory)] shadow-[0_16px_35px_-14px_color-mix(in_srgb,var(--jr-crimson)_70%,transparent)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[var(--jr-crimson-hover)]"
            >
              Continue <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={submitting}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--jr-crimson)] px-8 py-3 text-[15px] font-semibold text-[var(--jr-ivory)] shadow-[0_16px_35px_-14px_color-mix(in_srgb,var(--jr-crimson)_70%,transparent)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[var(--jr-crimson-hover)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Submitting…
                </>
              ) : (
                <>
                  <CalendarCheck className="h-4 w-4" aria-hidden="true" /> Submit Enquiry
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Step 1: event type + date + city ─────────────────────────
function Step1({
  data,
  errors,
  set,
}: {
  data: FormData;
  errors: Record<string, string>;
  set: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
  return (
    <fieldset className="space-y-8">
      <legend className="font-display text-2xl font-semibold text-[var(--jr-plum)]">
        What are we celebrating?
      </legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {EVENT_TYPES.map((e) => {
          const Icon = EVENT_ICON[e.icon];
          const active = data.eventType === e.id;
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => set("eventType", e.id)}
              aria-pressed={active}
              className={`flex min-h-11 flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all duration-400 ${
                active
                  ? "border-[var(--jr-crimson)] bg-[var(--jr-crimson)]/[0.06] shadow-[0_10px_25px_-15px_color-mix(in_srgb,var(--jr-crimson)_60%,transparent)]"
                  : "border-[var(--jr-line)] bg-[var(--jr-ivory)] hover:border-[var(--jr-gold)]"
              }`}
            >
              <Icon className={`h-6 w-6 ${active ? "text-[var(--jr-crimson)]" : "text-[var(--jr-gold)]"}`} aria-hidden="true" />
              <span className={`text-sm font-medium ${active ? "text-[var(--jr-crimson)]" : "text-[var(--jr-plum)]"}`}>
                {e.short}
              </span>
            </button>
          );
        })}
      </div>
      {errors.eventType && <FieldError msg={errors.eventType} />}

      <div>
        <label className="mb-3 block text-sm font-semibold text-[var(--jr-plum)]">
          Pick your date <span className="font-normal text-[var(--jr-ink)]">— live availability</span>
        </label>
        <AvailabilityCalendar
          selected={data.eventDate}
          onSelect={(d) => set("eventDate", d)}
        />
        {errors.eventDate && <FieldError msg={errors.eventDate} />}
      </div>

      <div>
        <label htmlFor="city" className="mb-2 block text-sm font-semibold text-[var(--jr-plum)]">
          Which city hosts the show?
        </label>
        <input
          id="city"
          type="text"
          value={data.city}
          onChange={(e) => set("city", e.target.value)}
          placeholder="e.g. Jaipur"
          className="min-h-11 w-full rounded-xl border border-[var(--jr-line)] bg-[var(--jr-ivory)] px-4 text-[15px] text-[var(--jr-plum)] outline-none transition-colors focus:border-[var(--jr-gold)] focus:ring-2 focus:ring-[var(--jr-gold)]/25"
        />
        {errors.city && <FieldError msg={errors.city} />}
      </div>
    </fieldset>
  );
}

// ── Live availability calendar ───────────────────────────────
function AvailabilityCalendar({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (date: string) => void;
}) {
  const today = new Date();
  const [cursor, setCursor] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
  );
  const [days, setDays] = useState<DayInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

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
  }, [cursor, reloadKey, load]);

  const shift = (delta: number) => {
    const [y, m] = cursor.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    const max = new Date(today.getFullYear() + 1, today.getMonth(), 1);
    if (d > max) return;
    setCursor(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  const [y, m] = cursor.split("-").map(Number);
  const monthLabel = new Date(y, m - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
  const firstWeekday = new Date(y, m - 1, 1).getDay();
  const byDate = useMemo(() => new Map(days.map((d) => [d.date, d])), [days]);
  const daysInMonth = new Date(y, m, 0).getDate();

  return (
    <div className="rounded-2xl border border-[var(--jr-line)] bg-[var(--jr-ivory)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--jr-ink)] transition-colors hover:bg-[var(--jr-sand-light)] hover:text-[var(--jr-plum)]"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="font-display text-lg font-semibold text-[var(--jr-plum)]">{monthLabel}</p>
        <button
          type="button"
          onClick={() => shift(1)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--jr-ink)] transition-colors hover:bg-[var(--jr-sand-light)] hover:text-[var(--jr-plum)]"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wider text-[var(--jr-ink)]">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <span key={d} className="py-1">
            {d}
          </span>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-7 gap-1 pt-1" aria-live="polite" aria-label="Loading availability">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-[var(--jr-sand)]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1 pt-1" role="grid" aria-label="Available dates">
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <span key={`blank-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const date = `${cursor}-${String(i + 1).padStart(2, "0")}`;
            const info = byDate.get(date) ?? { date, status: "open", note: null };
            const status = info.status;
            const isSelected = selected === date;
            const disabled = status !== "open";
            return (
              <button
                key={date}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(date)}
                aria-label={`${fmtDate(date)} — ${status}`}
                aria-pressed={isSelected}
                className={`h-10 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isSelected
                    ? "bg-[var(--jr-crimson)] text-[var(--jr-ivory)] shadow-[0_8px_18px_-8px_color-mix(in_srgb,var(--jr-crimson)_70%,transparent)]"
                    : status === "open"
                      ? "bg-[var(--jr-card)] text-[var(--jr-plum)] ring-1 ring-inset ring-[var(--jr-line)] hover:ring-[var(--jr-gold)]"
                      : status === "booked"
                        ? "cursor-not-allowed bg-[var(--jr-crimson)]/10 text-[var(--jr-crimson)]/50 line-through"
                        : status === "blocked"
                          ? "cursor-not-allowed bg-[var(--jr-sand)] text-[var(--jr-ink)]/40"
                          : "cursor-not-allowed text-[var(--jr-ink)]/25"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-[var(--jr-ink)]">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--jr-card)] ring-1 ring-[var(--jr-gold)]" /> Open
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--jr-crimson)]/60" /> Booked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--jr-sand)] ring-1 ring-[var(--jr-line)]" /> Blocked
        </span>
        <button
          type="button"
          onClick={() => setReloadKey((k) => k + 1)}
          className="ml-auto text-[var(--jr-gold)] underline-offset-2 hover:underline"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}

// ── Step 2: audience + budget ────────────────────────────────
function Step2({
  data,
  errors,
  set,
}: {
  data: FormData;
  errors: Record<string, string>;
  set: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
  return (
    <fieldset className="space-y-7">
      <legend className="font-display text-2xl font-semibold text-[var(--jr-plum)]">
        Who is in the audience?
      </legend>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="guests" className="mb-2 block text-sm font-semibold text-[var(--jr-plum)]">
            Approximate guest count
          </label>
          <input
            id="guests"
            type="number"
            min={1}
            max={10000}
            inputMode="numeric"
            value={data.guests}
            onChange={(e) => set("guests", e.target.value)}
            placeholder="e.g. 250"
            className="min-h-11 w-full rounded-xl border border-[var(--jr-line)] bg-[var(--jr-ivory)] px-4 text-[15px] text-[var(--jr-plum)] outline-none transition-colors focus:border-[var(--jr-gold)] focus:ring-2 focus:ring-[var(--jr-gold)]/25"
          />
          {errors.guests && <FieldError msg={errors.guests} />}
        </div>

        <div>
          <label htmlFor="venue" className="mb-2 block text-sm font-semibold text-[var(--jr-plum)]">
            Venue type <span className="font-normal text-[var(--jr-ink)]">(optional)</span>
          </label>
          <SelectShell
            id="venue"
            value={data.venueType}
            onChange={(v) => set("venueType", v)}
            placeholder="Select venue"
            options={VENUE_TYPES.map((v) => ({ value: v, label: v }))}
          />
        </div>

        <div>
          <label htmlFor="duration" className="mb-2 block text-sm font-semibold text-[var(--jr-plum)]">
            Show duration <span className="font-normal text-[var(--jr-ink)]">(optional)</span>
          </label>
          <SelectShell
            id="duration"
            value={data.duration}
            onChange={(v) => set("duration", v)}
            placeholder="Select duration"
            options={DURATIONS.map((d) => ({ value: d, label: d }))}
          />
        </div>

        <div>
          <label htmlFor="budget" className="mb-2 block text-sm font-semibold text-[var(--jr-plum)]">
            Budget range
          </label>
          <SelectShell
            id="budget"
            value={data.budget}
            onChange={(v) => set("budget", v)}
            placeholder="Select budget"
            options={BUDGET_RANGES.map((b) => ({ value: b, label: b }))}
            error={errors.budget}
          />
          {errors.budget && <FieldError msg={errors.budget} />}
        </div>
      </div>

      <p className="rounded-xl bg-[var(--jr-sand-light)]/60 p-4 text-sm leading-6 text-[var(--jr-ink)]">
        Budgets guide the quote — every tier states its inclusions up front, and the
        written quote you receive has no hidden line items.
      </p>
    </fieldset>
  );
}

// ── Step 3: contact ──────────────────────────────────────────
function Step3({
  data,
  errors,
  set,
}: {
  data: FormData;
  errors: Record<string, string>;
  set: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
  return (
    <fieldset className="space-y-6">
      <legend className="font-display text-2xl font-semibold text-[var(--jr-plum)]">
        Where do we send the quote?
      </legend>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-semibold text-[var(--jr-plum)]">
            Your name
          </label>
          <input
            id="name"
            type="text"
            value={data.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Full name"
            autoComplete="name"
            className="min-h-11 w-full rounded-xl border border-[var(--jr-line)] bg-[var(--jr-ivory)] px-4 text-[15px] text-[var(--jr-plum)] outline-none transition-colors focus:border-[var(--jr-gold)] focus:ring-2 focus:ring-[var(--jr-gold)]/25"
          />
          {errors.name && <FieldError msg={errors.name} />}
        </div>
        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-[var(--jr-plum)]">
            Mobile number
          </label>
          <input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="10-digit mobile"
            autoComplete="tel"
            className="min-h-11 w-full rounded-xl border border-[var(--jr-line)] bg-[var(--jr-ivory)] px-4 text-[15px] text-[var(--jr-plum)] outline-none transition-colors focus:border-[var(--jr-gold)] focus:ring-2 focus:ring-[var(--jr-gold)]/25"
          />
          {errors.phone && <FieldError msg={errors.phone} />}
        </div>
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[var(--jr-plum)]">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="min-h-11 w-full rounded-xl border border-[var(--jr-line)] bg-[var(--jr-ivory)] px-4 text-[15px] text-[var(--jr-plum)] outline-none transition-colors focus:border-[var(--jr-gold)] focus:ring-2 focus:ring-[var(--jr-gold)]/25"
          />
          {errors.email && <FieldError msg={errors.email} />}
        </div>
        <div>
          <label htmlFor="contactTime" className="mb-2 block text-sm font-semibold text-[var(--jr-plum)]">
            Best time to reach you <span className="font-normal text-[var(--jr-ink)]">(optional)</span>
          </label>
          <SelectShell
            id="contactTime"
            value={data.contactTime}
            onChange={(v) => set("contactTime", v)}
            placeholder="Any time"
            options={[
              { value: "Morning (9–12)", label: "Morning (9–12)" },
              { value: "Afternoon (12–5)", label: "Afternoon (12–5)" },
              { value: "Evening (5–9)", label: "Evening (5–9)" },
            ]}
          />
        </div>
      </div>
      <div>
        <label htmlFor="notes" className="mb-2 block text-sm font-semibold text-[var(--jr-plum)]">
          Anything we should know? <span className="font-normal text-[var(--jr-ink)]">(optional)</span>
        </label>
        <textarea
          id="notes"
          value={data.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Theme, stage size, timings, past acts you loved…"
          className="w-full rounded-xl border border-[var(--jr-line)] bg-[var(--jr-ivory)] px-4 py-3 text-[15px] text-[var(--jr-plum)] outline-none transition-colors focus:border-[var(--jr-gold)] focus:ring-2 focus:ring-[var(--jr-gold)]/25"
        />
        <p className="mt-1 text-right text-xs text-[var(--jr-ink)]">{data.notes.length}/1000</p>
      </div>
    </fieldset>
  );
}

// ── Step 4: review + consent ─────────────────────────────────
function Step4({
  data,
  errors,
  set,
  submitError,
  submitting,
  onSubmit,
}: {
  data: FormData;
  errors: Record<string, string>;
  set: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  submitError: string | null;
  submitting: boolean;
  onSubmit: () => void;
}) {
  const event = EVENT_TYPES.find((e) => e.id === data.eventType);
  const rows: [string, string][] = [
    ["Occasion", event?.name ?? "—"],
    ["Date", data.eventDate ? fmtDate(data.eventDate) : "—"],
    ["City", data.city || "—"],
    ["Guests", data.guests ? `${data.guests}` : "—"],
    ["Venue", data.venueType || "—"],
    ["Duration", data.duration || "To be advised"],
    ["Budget", data.budget || "—"],
    ["Name", data.name],
    ["Phone", data.phone],
    ["Email", data.email],
    ["Reach at", data.contactTime || "Any time"],
  ];

  return (
    <fieldset className="space-y-6">
      <legend className="font-display text-2xl font-semibold text-[var(--jr-plum)]">
        Review your enquiry
      </legend>

      <dl className="divide-y divide-[var(--jr-sand)] rounded-2xl border border-[var(--jr-line)] bg-[var(--jr-ivory)] px-5">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-4 py-3">
            <dt className="text-sm text-[var(--jr-ink)]">{k}</dt>
            <dd className="text-right text-sm font-medium text-[var(--jr-plum)]">{v}</dd>
          </div>
        ))}
        {data.notes && (
          <div className="py-3">
            <dt className="text-sm text-[var(--jr-ink)]">Notes</dt>
            <dd className="mt-1 text-sm text-[var(--jr-plum)]">{data.notes}</dd>
          </div>
        )}
      </dl>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--jr-line)] bg-[var(--jr-ivory)] p-4">
        <input
          type="checkbox"
          checked={data.consent}
          onChange={(e) => set("consent", e.target.checked)}
          className="mt-0.5 h-5 w-5 accent-[var(--jr-crimson)]"
          aria-describedby="consent-desc"
        />
        <span id="consent-desc" className="text-sm leading-6 text-[var(--jr-ink)]">
          I consent to Jadugar Rajtilak using these details to respond to my enquiry,
          per the{" "}
          <span className="font-medium text-[var(--jr-crimson)] underline underline-offset-2">
            DPDP Act, 2023
          </span>{" "}
          privacy notice. I can withdraw consent or request deletion at any time.
        </span>
      </label>
      {errors.consent && <FieldError msg={errors.consent} />}

      {submitError && (
        <p role="alert" className="rounded-xl border border-[var(--jr-crimson)]/30 bg-[var(--jr-crimson)]/[0.07] p-4 text-sm text-[var(--jr-crimson)]">
          {submitError}
        </p>
      )}

      <p className="text-xs leading-6 text-[var(--jr-ink)]">
        Submitting reserves a 72-hour soft-hold on {data.eventDate ? fmtDate(data.eventDate) : "your date"}.
        You will receive an instant confirmation email and a written quote within 24 hours.
      </p>
    </fieldset>
  );
}

// ── Confirmation (doc 7.1 step 4 → confirmation page) ────────
function Confirmation({ leadId, date, eventName }: { leadId: string; date: string; eventName: string }) {
  const event = EVENT_TYPES.find((e) => e.id === eventName);
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center px-4 pb-24 pt-28 text-center sm:px-6">
      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute inset-0 -m-6 rounded-full opacity-60 blur-2xl"
          style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--jr-gold) 50%, transparent), transparent 70%)" }}
        />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[var(--jr-teal)] text-white shadow-[0_20px_40px_-15px_color-mix(in_srgb,var(--jr-teal)_70%,transparent)]">
          <PartyPopper className="h-9 w-9" aria-hidden="true" />
        </div>
      </div>
      <p className="eyebrow mt-8">Enquiry Received</p>
      <h1 className="font-display mt-3 text-display-md font-medium text-[var(--jr-plum)]">
        The royal stage holds your date
      </h1>
      <p className="mt-4 max-w-md text-[15px] leading-7 text-[var(--jr-ink)]">
        Your {event?.name ?? "show"} enquiry for{" "}
        <strong className="text-[var(--jr-plum)]">{date ? fmtDate(date) : "your date"}</strong> is in
        the pipeline. A confirmation email is on its way, your date is soft-held for 72
        hours, and a written quote arrives within 24 hours.
      </p>
      <p className="mt-5 rounded-full border border-[var(--jr-line)] bg-[var(--jr-card)] px-5 py-2 font-mono text-xs tracking-wider text-[var(--jr-ink)]">
        REF · {leadId.slice(-8).toUpperCase()}
      </p>
      <div className="mt-9 flex flex-col gap-4 sm:flex-row">
        <a
          href="#/home"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--jr-gold)]/60 px-8 py-3 text-[15px] font-semibold text-[var(--jr-plum)] transition-all duration-500 hover:bg-[var(--jr-sand-light)]"
        >
          <Sparkles className="mr-2 h-4 w-4 text-[var(--jr-gold)]" aria-hidden="true" />
          Back to the stage
        </a>
        <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#25d366]/15 px-8 py-3 text-[15px] font-semibold text-[#128c4b] ring-1 ring-[#25d366]/40 transition-all duration-500 hover:bg-[#25d366]/25">
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          WhatsApp the studio
        </button>
      </div>
    </div>
  );
}

// ── shared bits ──────────────────────────────────────────────
function FieldError({ msg }: { msg: string }) {
  return (
    <p role="alert" className="mt-1.5 text-sm text-[var(--jr-crimson)]">
      {msg}
    </p>
  );
}

function SelectShell({
  id,
  value,
  onChange,
  placeholder,
  options,
  error,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  error?: string;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`min-h-11 w-full appearance-none rounded-xl border bg-[var(--jr-ivory)] px-4 pr-10 text-[15px] text-[var(--jr-plum)] outline-none transition-colors focus:ring-2 ${
          error
            ? "border-[var(--jr-crimson)] focus:border-[var(--jr-crimson)] focus:ring-[var(--jr-crimson)]/20"
            : "border-[var(--jr-line)] focus:border-[var(--jr-gold)] focus:ring-[var(--jr-gold)]/25"
        } ${value ? "" : "text-[var(--jr-ink)]"}`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--jr-ink)]"
        aria-hidden="true"
      />
    </div>
  );
}
