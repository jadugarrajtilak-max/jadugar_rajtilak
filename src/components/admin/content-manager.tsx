"use client";

import { useMemo, useState } from "react";
import {
  FileText,
  Save,
  RotateCcw,
  Loader2,
  CircleDot,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { adminFetch } from "@/lib/admin-client";
import { PAGE_LABELS, TEXT_LINES, type PageKey } from "@/lib/customization";
import {
  useSiteCustomization,
  announceCustomizationChanged,
} from "@/components/site/customization-provider";

// ─────────────────────────────────────────────────────────────
// Content Manager — line-by-line text editing for every page of
// the live website. Pick a page, edit any line, save; the live
// site refreshes its text instantly (no rebuild, no redeploy).
// ─────────────────────────────────────────────────────────────

const PAGES: PageKey[] = [
  "home",
  "about",
  "services",
  "packages",
  "gallery",
  "testimonials",
  "faq",
  "contact",
  "blog",
  "booking",
  "footer",
  "brand",
];

export function ContentManager() {
  const { text, refresh, payload } = useSiteCustomization();
  const { toast } = useToast();
  const [page, setPage] = useState<PageKey>("home");
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const lines = useMemo(() => {
    let list = TEXT_LINES.filter((l) => l.page === page);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (l) => l.label.toLowerCase().includes(q) || l.value.toLowerCase().includes(q) || l.key.toLowerCase().includes(q)
      );
    }
    return list;
  }, [page, query]);

  const isCustom = (key: string) => {
    const line = TEXT_LINES.find((l) => l.key === key);
    return !!line && payload.texts[key] !== line.value;
  };

  const dirtyCount = lines.filter((l) => (drafts[l.key] ?? text(l.key)) !== text(l.key)).length;
  const customCount = lines.filter((l) => isCustom(l.key)).length;

  const savePage = async () => {
    const updates = lines
      .map((l) => ({ key: l.key, value: drafts[l.key] ?? text(l.key) }))
      .filter((u) => {
        const original = text(u.key);
        return u.value !== original;
      });
    if (updates.length === 0) {
      toast({ title: "Nothing to save", description: "No changed lines on this page." });
      return;
    }
    setSaving(true);
    const res = await adminFetch("/api/admin/texts", {
      method: "PUT",
      body: JSON.stringify({ updates }),
    });
    setSaving(false);
    if (res.ok) {
      setDrafts((m) => {
        const next = { ...m };
        for (const u of updates) delete next[u.key];
        return next;
      });
      await refresh();
      announceCustomizationChanged();
      toast({
        title: "Live now",
        description: `${updates.length} line${updates.length === 1 ? "" : "s"} updated on ${PAGE_LABELS[page]}.`,
      });
    } else {
      toast({ title: "Could not save", description: res.error ?? "Try again", variant: "destructive" });
    }
  };

  const resetPage = async () => {
    setResetting(true);
    const res = await adminFetch("/api/admin/reset", {
      method: "POST",
      body: JSON.stringify({ scope: "texts", keys: lines.map((l) => l.key) }),
    });
    setResetting(false);
    if (res.ok) {
      setDrafts((m) => {
        const next = { ...m };
        for (const l of lines) delete next[l.key];
        return next;
      });
      await refresh();
      announceCustomizationChanged();
      toast({ title: "Page restored", description: `${PAGE_LABELS[page]} is back to its shipped text.` });
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display flex items-center gap-3 text-3xl font-semibold text-[#2a1b3d]">
            <FileText className="h-7 w-7 text-[#b8923a]" aria-hidden="true" /> Content Manager
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[#5b5266]">
            Line-by-line text for every live page — headlines, paragraphs, buttons, FAQs.
            Save and the website updates instantly.
            {customCount > 0 && (
              <span className="ml-1 font-semibold text-[#b3263e]">{customCount} custom line{customCount === 1 ? "" : "s"} on this page.</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            disabled={resetting || customCount === 0}
            onClick={() => void resetPage()}
            className="rounded-full border-[#e3d9c6] text-[#5b5266] hover:bg-[#f3ead3]"
          >
            {resetting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            Reset page
          </Button>
          <Button
            disabled={saving || dirtyCount === 0}
            onClick={() => void savePage()}
            className="rounded-full bg-[#b3263e] px-6 hover:bg-[#c2314c]"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            Save & go live{dirtyCount > 0 ? ` (${dirtyCount})` : ""}
          </Button>
        </div>
      </header>

      {/* page tabs + search */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a page to edit">
          {PAGES.map((p) => (
            <button
              key={p}
              onClick={() => {
                setPage(p);
                setQuery("");
              }}
              aria-pressed={page === p}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                page === p
                  ? "bg-[#2a1b3d] text-[#faf6ee]"
                  : "border border-[#e3d9c6] bg-[#fffdf7] text-[#5b5266] hover:border-[#b8923a] hover:text-[#2a1b3d]"
              }`}
            >
              {PAGE_LABELS[p]}
            </button>
          ))}
        </div>
        <div className="relative lg:ml-auto lg:w-72">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b8923a]" aria-hidden="true" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lines…"
            aria-label="Search text lines"
            className="rounded-full border-[#ddd2bc] bg-[#fffdf7] pl-10"
          />
        </div>
      </div>

      {/* line editors */}
      <div className="space-y-3.5">
        {lines.map((l) => {
          const value = drafts[l.key] ?? text(l.key);
          const dirty = value !== text(l.key);
          return (
            <div
              key={l.key}
              className={`rounded-2xl border bg-[#fffdf7] p-4.5 px-5 py-4 transition-colors ${
                dirty ? "border-[#b8923a]" : "border-[#e3d9c6]"
              }`}
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <label htmlFor={`line-${l.key}`} className="flex items-center gap-2 text-sm font-semibold text-[#2a1b3d]">
                  {dirty ? (
                    <CircleDot className="h-3.5 w-3.5 fill-[#b8923a] text-[#b8923a]" aria-hidden="true" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#3e8e8a]" aria-hidden="true" />
                  )}
                  {l.label}
                </label>
                <span className="flex items-center gap-2 text-[11px] text-[#5b5266]/70">
                  <code className="rounded bg-[#efe8da] px-1.5 py-0.5">{l.key}</code>
                  <span className="tabular-nums">{value.length} chars</span>
                </span>
              </div>
              {l.multiline ? (
                <textarea
                  id={`line-${l.key}`}
                  rows={Math.min(6, Math.max(2, Math.ceil(value.length / 90)))}
                  value={value}
                  onChange={(e) => setDrafts((m) => ({ ...m, [l.key]: e.target.value }))}
                  className="w-full rounded-xl border border-[#ddd2bc] bg-[#faf6ee] px-3.5 py-2.5 text-[15px] leading-7 text-[#2a1b3d] outline-none transition-colors focus:border-[#b8923a] focus:ring-2 focus:ring-[#b8923a]/25"
                />
              ) : (
                <input
                  id={`line-${l.key}`}
                  value={value}
                  onChange={(e) => setDrafts((m) => ({ ...m, [l.key]: e.target.value }))}
                  className="w-full rounded-xl border border-[#ddd2bc] bg-[#faf6ee] px-3.5 py-2.5 text-[15px] text-[#2a1b3d] outline-none transition-colors focus:border-[#b8923a] focus:ring-2 focus:ring-[#b8923a]/25"
                />
              )}
              {dirty && (
                <button
                  onClick={() =>
                    setDrafts((m) => {
                      const next = { ...m };
                      delete next[l.key];
                      return next;
                    })
                  }
                  className="mt-1.5 text-xs font-semibold text-[#5b5266] underline-offset-4 hover:text-[#b3263e] hover:underline"
                >
                  Discard change
                </button>
              )}
            </div>
          );
        })}
        {lines.length === 0 && (
          <p className="rounded-2xl border border-dashed border-[#e3d9c6] bg-[#fffdf7] p-10 text-center text-sm text-[#5b5266]">
            No text lines match this filter.
          </p>
        )}
      </div>
    </div>
  );
}
