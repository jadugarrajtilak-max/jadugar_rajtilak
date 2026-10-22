"use client";

import { useMemo, useRef, useState } from "react";
import {
  Image as ImageIcon,
  Upload,
  Save,
  RotateCcw,
  Loader2,
  Check,
  Sparkles,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { adminFetch, getAdminKey } from "@/lib/admin-client";
import {
  IMAGE_SLOTS,
  PAGE_LABELS,
  type ImageSlot,
  type PageKey,
} from "@/lib/customization";
import {
  useSiteCustomization,
  announceCustomizationChanged,
} from "@/components/site/customization-provider";

// ─────────────────────────────────────────────────────────────
// Image Manager — every image on the live website, grouped
// page-wise. Replace any image (upload), edit its live alt text,
// or restore the shipped default. Changes go live instantly:
// the customization payload refreshes right after saving.
// ─────────────────────────────────────────────────────────────

type Draft = { src?: string; alt?: string; uploading?: boolean };

export function ImageManager() {
  const { asset, refresh, payload } = useSiteCustomization();
  const { toast } = useToast();
  const [page, setPage] = useState<PageKey | "all">("all");
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const slots = useMemo(() => {
    let list = IMAGE_SLOTS;
    if (page !== "all") list = list.filter((s) => s.page === page);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (s) =>
          s.label.toLowerCase().includes(q) ||
          s.key.toLowerCase().includes(q) ||
          s.defaultAlt.toLowerCase().includes(q)
      );
    }
    return list;
  }, [page, query]);

  const pages: (PageKey | "all")[] = [
    "all",
    ...Array.from(new Set(IMAGE_SLOTS.map((s) => s.page))),
  ];

  const isCustom = (slot: ImageSlot) => {
    const live = payload.assets[slot.key];
    return !!live && (live.src !== slot.defaultSrc || live.alt !== slot.defaultAlt);
  };

  const draftFor = (slot: ImageSlot): Draft => drafts[slot.key] ?? {};
  const liveFor = (slot: ImageSlot) => asset(slot.key);
  const dirty = (slot: ImageSlot) => {
    const d = draftFor(slot);
    const live = liveFor(slot);
    return (d.src !== undefined && d.src !== live.src) || (d.alt !== undefined && d.alt !== live.alt);
  };

  const upload = async (slot: ImageSlot, file: File) => {
    setDrafts((m) => ({ ...m, [slot.key]: { ...draftFor(slot), uploading: true } }));
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "x-admin-key": getAdminKey() ?? "" },
        body: form,
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) {
        setDrafts((m) => ({ ...m, [slot.key]: { ...draftFor(slot), src: json.url, uploading: false } }));
        toast({
          title: "Image uploaded",
          description: `${slot.label} staged — click Save to make it live.`,
        });
      } else {
        setDrafts((m) => ({ ...m, [slot.key]: { ...draftFor(slot), uploading: false } }));
        toast({
          title: "Upload failed",
          description: json?.error ?? `HTTP ${res.status}`,
          variant: "destructive",
        });
      }
    } catch {
      setDrafts((m) => ({ ...m, [slot.key]: { ...draftFor(slot), uploading: false } }));
      toast({ title: "Upload failed", description: "Network error", variant: "destructive" });
    }
  };

  const save = async (slot: ImageSlot) => {
    const d = draftFor(slot);
    const body: { key: string; src?: string; alt?: string } = { key: slot.key };
    if (d.src !== undefined) body.src = d.src;
    if (d.alt !== undefined) body.alt = d.alt;
    setSavingKey(slot.key);
    const res = await adminFetch("/api/admin/assets", {
      method: "PUT",
      body: JSON.stringify(body),
    });
    setSavingKey(null);
    if (res.ok) {
      setDrafts((m) => {
        const next = { ...m };
        delete next[slot.key];
        return next;
      });
      await refresh();
      announceCustomizationChanged();
      toast({
        title: "Live now",
        description: `${slot.label} updated on the website.`,
      });
    } else {
      toast({
        title: "Could not save",
        description: res.error ?? "Try again",
        variant: "destructive",
      });
    }
  };

  const resetSlot = async (slot: ImageSlot) => {
    setSavingKey(slot.key);
    const res = await adminFetch("/api/admin/reset", {
      method: "POST",
      body: JSON.stringify({ scope: "assets", keys: [slot.key] }),
    });
    setSavingKey(null);
    if (res.ok) {
      setDrafts((m) => {
        const next = { ...m };
        delete next[slot.key];
        return next;
      });
      await refresh();
      announceCustomizationChanged();
      toast({ title: "Restored", description: `${slot.label} is back to the shipped image.` });
    }
  };

  const resetAll = async () => {
    setResetting(true);
    const res = await adminFetch("/api/admin/reset", {
      method: "POST",
      body: JSON.stringify({ scope: "assets" }),
    });
    setResetting(false);
    if (res.ok) {
      setDrafts({});
      await refresh();
      announceCustomizationChanged();
      toast({ title: "All images restored", description: "Every slot is back to its shipped default." });
    }
  };

  const customCount = IMAGE_SLOTS.filter(isCustom).length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display flex items-center gap-3 text-3xl font-semibold text-[#2a1b3d]">
            <ImageIcon className="h-7 w-7 text-[#b8923a]" aria-hidden="true" /> Image Manager
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[#5b5266]">
            Every image on the live website, page-wise — replace any image, edit its alt
            text, and the change is live the moment you save. {customCount > 0 ? (
              <span className="font-semibold text-[#b3263e]">{customCount} custom image{customCount === 1 ? "" : "s"} live.</span>
            ) : (
              <span className="font-semibold text-[#3e8e8a]">All images are the shipped defaults.</span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          disabled={resetting || customCount === 0}
          onClick={resetAll}
          className="rounded-full border-[#e3d9c6] text-[#5b5266] hover:bg-[#f3ead3]"
        >
          {resetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />}
          Restore all defaults
        </Button>
      </header>

      {/* page filter + search */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter images by page">
          {pages.map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              aria-pressed={page === p}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                page === p
                  ? "bg-[#2a1b3d] text-[#faf6ee]"
                  : "border border-[#e3d9c6] bg-[#fffdf7] text-[#5b5266] hover:border-[#b8923a] hover:text-[#2a1b3d]"
              }`}
            >
              {p === "all" ? "All pages" : PAGE_LABELS[p]}
              <span className="ml-2 rounded-full bg-black/10 px-1.5 text-[11px] tabular-nums">
                {p === "all" ? IMAGE_SLOTS.length : IMAGE_SLOTS.filter((s) => s.page === p).length}
              </span>
            </button>
          ))}
        </div>
        <div className="relative lg:ml-auto lg:w-72">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b8923a]" aria-hidden="true" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search images or alt text…"
            aria-label="Search image slots"
            className="rounded-full border-[#ddd2bc] bg-[#fffdf7] pl-10"
          />
        </div>
      </div>

      {/* slot cards */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {slots.map((slot) => {
          const live = liveFor(slot);
          const d = draftFor(slot);
          const previewSrc = d.src ?? live.src;
          const altValue = d.alt ?? live.alt;
          const isDirty = dirty(slot);
          return (
            <article
              key={slot.key}
              className={`flex flex-col overflow-hidden rounded-2xl border bg-[#fffdf7] transition-shadow ${
                isDirty ? "border-[#b8923a] shadow-[0_18px_40px_-24px_rgba(184,146,58,0.7)]" : "border-[#e3d9c6]"
              }`}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#f6f0e2]">
                <img
                  src={previewSrc}
                  alt={altValue || slot.label}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
                  <span className="rounded-full bg-[#2a1b3d]/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#faf6ee] backdrop-blur">
                    {PAGE_LABELS[slot.page]}
                  </span>
                  {isCustom(slot) && (
                    <span className="rounded-full bg-[#b3263e]/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#fdf8ee] backdrop-blur">
                      Custom
                    </span>
                  )}
                </div>
                {d.uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#2a1b3d]/60">
                    <Loader2 className="h-8 w-8 animate-spin text-[#f3e7c8]" aria-hidden="true" />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-3.5 p-5">
                <div>
                  <p className="text-sm font-semibold text-[#2a1b3d]">{slot.label}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#5b5266]/80">
                    <code className="rounded bg-[#efe8da] px-1.5 py-0.5">{slot.key}</code>
                    {slot.hint && <span>· {slot.hint}</span>}
                  </p>
                </div>

                <div>
                  <label htmlFor={`alt-${slot.key}`} className="mb-1.5 flex items-center justify-between text-xs font-semibold text-[#2a1b3d]">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-[#b8923a]" aria-hidden="true" /> Alt text (live SEO)
                    </span>
                    <span className="font-normal tabular-nums text-[#5b5266]/60">{altValue.length}</span>
                  </label>
                  <textarea
                    id={`alt-${slot.key}`}
                    rows={2}
                    value={altValue}
                    onChange={(e) => setDrafts((m) => ({ ...m, [slot.key]: { ...d, alt: e.target.value } }))}
                    placeholder="Describe this image for search engines and screen readers…"
                    className="w-full rounded-xl border border-[#ddd2bc] bg-[#faf6ee] px-3.5 py-2.5 text-sm text-[#2a1b3d] outline-none transition-colors focus:border-[#b8923a] focus:ring-2 focus:ring-[#b8923a]/25"
                  />
                </div>

                <input
                  ref={(el) => { fileInputs.current[slot.key] = el; }}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void upload(slot, f);
                    e.target.value = "";
                  }}
                />

                <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    onClick={() => fileInputs.current[slot.key]?.click()}
                    disabled={d.uploading}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#b8923a]/60 px-4 py-2 text-sm font-semibold text-[#2a1b3d] transition-colors hover:bg-[#f3ead3] disabled:opacity-60"
                  >
                    <Upload className="h-4 w-4" aria-hidden="true" />
                    {d.src ? "Replace upload" : "Upload new image"}
                  </button>
                  <Button
                    size="sm"
                    disabled={!isDirty || savingKey === slot.key || d.uploading}
                    onClick={() => void save(slot)}
                    className="rounded-full bg-[#b3263e] px-5 hover:bg-[#c2314c]"
                  >
                    {savingKey === slot.key ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <>
                        <Save className="mr-1.5 h-4 w-4" aria-hidden="true" /> Save & go live
                      </>
                    )}
                  </Button>
                  {isCustom(slot) && (
                    <button
                      onClick={() => void resetSlot(slot)}
                      disabled={savingKey === slot.key}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-[#5b5266] underline-offset-4 hover:text-[#b3263e] hover:underline"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reset
                    </button>
                  )}
                  {!isDirty && !isCustom(slot) && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#3e8e8a]">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" /> Live default
                    </span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {slots.length === 0 && (
        <p className="rounded-2xl border border-dashed border-[#e3d9c6] bg-[#fffdf7] p-10 text-center text-sm text-[#5b5266]">
          No image slots match this filter.
        </p>
      )}
    </div>
  );
}
