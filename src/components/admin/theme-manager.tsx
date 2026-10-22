"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Palette,
  Save,
  RotateCcw,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { adminFetch } from "@/lib/admin-client";
import { THEME_TOKENS, THEME_PRESETS, THEME_DEFAULTS } from "@/lib/customization";
import {
  useSiteCustomization,
  announceCustomizationChanged,
} from "@/components/site/customization-provider";

// ─────────────────────────────────────────────────────────────
// Theme Manager — change the live website's colours with an
// instant preview. Pick a preset or fine-tune any token, preview
// on the whole site (same session), then Save to publish for
// every visitor. Reset restores the shipped palette.
// ─────────────────────────────────────────────────────────────

const GROUPS: { id: "accents" | "stage" | "light"; label: string; note: string }[] = [
  { id: "accents", label: "Accents & CTA", note: "Gold trim, buttons, links" },
  { id: "stage", label: "Stage (dark)", note: "Hero, dark bands, footers" },
  { id: "light", label: "Light surfaces", note: "Page background, cards, text" },
];

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function ThemeManager() {
  const { refresh, payload } = useSiteCustomization();
  const { toast } = useToast();

  const savedTheme = payload.theme;
  const [draft, setDraft] = useState<Record<string, string>>({ ...savedTheme });
  const [lastSaved, setLastSaved] = useState(savedTheme);
  const [previewLive, setPreviewLive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Keep the draft in sync when the saved theme loads/changes —
  // React's "adjust state during render" pattern (no effect needed).
  if (lastSaved !== savedTheme) {
    setLastSaved(savedTheme);
    setDraft((cur) => {
      const changed = THEME_TOKENS.some((t) => cur[t.key] !== savedTheme[t.key]);
      return changed ? cur : { ...savedTheme };
    });
  }

  // "Preview on whole site" applies the draft to the live CSS vars
  useEffect(() => {
    if (!previewLive) return;
    const root = document.documentElement;
    for (const token of THEME_TOKENS) {
      root.style.setProperty(token.varName, draft[token.key] ?? token.defaultValue);
    }
    return () => {
      // restore the saved theme when preview ends
      for (const token of THEME_TOKENS) {
        root.style.setProperty(token.varName, savedTheme[token.key] ?? token.defaultValue);
      }
    };
  }, [previewLive, draft, savedTheme]);

  const dirty = useMemo(
    () => THEME_TOKENS.some((t) => (draft[t.key] ?? t.defaultValue) !== (savedTheme[t.key] ?? t.defaultValue)),
    [draft, savedTheme]
  );

  const applyPreset = (presetId: string) => {
    const preset = THEME_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setDraft({ ...preset.colors });
    toast({ title: `${preset.name} loaded`, description: "Review the preview, then Save & go live." });
  };

  const save = async () => {
    const colors: Record<string, string> = {};
    for (const token of THEME_TOKENS) {
      const value = (draft[token.key] ?? token.defaultValue).toLowerCase();
      if (HEX_RE.test(value)) colors[token.key] = value;
    }
    setSaving(true);
    const res = await adminFetch("/api/admin/theme", {
      method: "PUT",
      body: JSON.stringify({ colors }),
    });
    setSaving(false);
    if (res.ok) {
      await refresh();
      announceCustomizationChanged();
      setPreviewLive(false);
      toast({
        title: "Theme is live",
        description: "Every visitor now sees the new colours.",
      });
    } else {
      toast({ title: "Could not save theme", description: res.error ?? "Try again", variant: "destructive" });
    }
  };

  const reset = async () => {
    setResetting(true);
    const res = await adminFetch("/api/admin/reset", {
      method: "POST",
      body: JSON.stringify({ scope: "theme" }),
    });
    setResetting(false);
    if (res.ok) {
      setDraft({ ...THEME_DEFAULTS });
      setPreviewLive(false);
      await refresh();
      announceCustomizationChanged();
      toast({ title: "Palette restored", description: "The shipped Royal Gold theme is live again." });
    }
  };

  const previewVars = useMemo(() => {
    const style: Record<string, string> = {};
    for (const token of THEME_TOKENS) {
      style[token.varName] = draft[token.key] ?? token.defaultValue;
    }
    return style as React.CSSProperties;
  }, [draft]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display flex items-center gap-3 text-3xl font-semibold text-[#2a1b3d]">
            <Palette className="h-7 w-7 text-[#b8923a]" aria-hidden="true" /> Theme Manager
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[#5b5266]">
            Change the live website's colours — pick a preset or fine-tune any token,
            preview it on the real site, then publish. Visitors see the change instantly.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant={previewLive ? "default" : "outline"}
            onClick={() => setPreviewLive((v) => !v)}
            className={`rounded-full ${
              previewLive
                ? "bg-[#3e8e8a] text-[#faf6ee] hover:bg-[#35736f]"
                : "border-[#b8923a]/60 text-[#2a1b3d] hover:bg-[#f3ead3]"
            }`}
          >
            {previewLive ? <EyeOff className="mr-2 h-4 w-4" aria-hidden="true" /> : <Eye className="mr-2 h-4 w-4" aria-hidden="true" />}
            {previewLive ? "Stop site preview" : "Preview on live site"}
          </Button>
          <Button
            variant="outline"
            disabled={resetting}
            onClick={() => void reset()}
            className="rounded-full border-[#e3d9c6] text-[#5b5266] hover:bg-[#f3ead3]"
          >
            {resetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />}
            Reset palette
          </Button>
          <Button
            disabled={saving || !dirty}
            onClick={() => void save()}
            className="rounded-full bg-[#b3263e] px-6 hover:bg-[#c2314c]"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="mr-2 h-4 w-4" aria-hidden="true" />}
            Save & go live{dirty ? "" : " (no changes)"}
          </Button>
        </div>
      </header>

      {/* presets */}
      <section className="rounded-3xl border border-[#e3d9c6] bg-[#fffdf7] p-6 sm:p-8">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#2a1b3d]">
          <Sparkles className="h-4 w-4 text-[#b8923a]" aria-hidden="true" /> Curated presets
        </p>
        <div className="mt-5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className="group rounded-2xl border border-[#e3d9c6] bg-[#faf6ee] p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[#b8923a]"
            >
              <div className="flex h-10 items-center gap-1.5 overflow-hidden rounded-full border border-black/5">
                {["gold", "crimson", "plum", "ivory", "teal"].map((k) => (
                  <span
                    key={k}
                    className="h-full flex-1"
                    style={{ background: preset.colors[k] }}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="mt-3 text-sm font-semibold text-[#2a1b3d] group-hover:text-[#b3263e]">{preset.name}</p>
              <p className="mt-0.5 text-[11px] leading-4 text-[#5b5266]">{preset.note}</p>
            </button>
          ))}
        </div>
        {previewLive && (
          <p className="mt-5 rounded-xl border border-[#3e8e8a]/40 bg-[#e3efee]/70 px-4 py-3 text-sm text-[#2f6f6b]">
            Site preview is ON — open the website in this tab (View site) to walk the
            pages with these colours. Saving publishes; stopping the preview reverts.
          </p>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        {/* token editors */}
        <div className="space-y-5">
          {GROUPS.map((group) => (
            <section key={group.id} className="rounded-3xl border border-[#e3d9c6] bg-[#fffdf7] p-6 sm:p-7">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-semibold text-[#2a1b3d]">{group.label}</p>
                <p className="text-xs text-[#5b5266]">{group.note}</p>
              </div>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {THEME_TOKENS.filter((t) => t.group === group.id).map((token) => {
                  const value = draft[token.key] ?? token.defaultValue;
                  const changed = value.toLowerCase() !== (savedTheme[token.key] ?? token.defaultValue).toLowerCase();
                  return (
                    <li
                      key={token.key}
                      className={`flex items-center gap-3 rounded-2xl border bg-[#faf6ee] p-3 ${
                        changed ? "border-[#b8923a]" : "border-[#e3d9c6]"
                      }`}
                    >
                      <label className="relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-black/10 shadow-inner">
                        <span className="absolute inset-0" style={{ background: value }} aria-hidden="true" />
                        <input
                          type="color"
                          value={HEX_RE.test(value) ? value : token.defaultValue}
                          onChange={(e) => setDraft((m) => ({ ...m, [token.key]: e.target.value }))}
                          className="absolute inset-0 cursor-pointer opacity-0"
                          aria-label={`${token.label} colour picker`}
                        />
                      </label>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#2a1b3d]">{token.label}</p>
                        <input
                          value={value}
                          onChange={(e) => setDraft((m) => ({ ...m, [token.key]: e.target.value }))}
                          aria-label={`${token.label} hex value`}
                          className="mt-0.5 w-full rounded-md border border-transparent bg-transparent font-mono text-xs uppercase text-[#5b5266] outline-none focus:border-[#b8923a] focus:bg-[#fffdf7] focus:px-1.5"
                        />
                      </div>
                      {changed && (
                        <button
                          onClick={() => setDraft((m) => ({ ...m, [token.key]: savedTheme[token.key] ?? token.defaultValue }))}
                          className="shrink-0 text-[11px] font-semibold text-[#5b5266] underline-offset-2 hover:text-[#b3263e] hover:underline"
                        >
                          revert
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        {/* live preview mock */}
        <aside className="xl:sticky xl:top-6 xl:self-start">
          <section
            className="overflow-hidden rounded-3xl border border-black/10 shadow-[0_35px_80px_-45px_rgba(42,27,61,0.55)]"
            style={previewVars}
            aria-label="Theme preview"
          >
            {/* mini hero */}
            <div
              className="relative px-6 py-10"
              style={{
                background:
                  "linear-gradient(168deg, var(--jr-plum-mid) 0%, var(--jr-plum) 42%, var(--jr-plum-mid) 78%, var(--jr-plum-deep) 100%)",
              }}
            >
              <p className="eyebrow text-[10px]">The Royal Stage · Udaipur</p>
              <p
                className="mt-2 font-display text-3xl font-medium"
                style={{ color: "var(--jr-ivory)" }}
              >
                Where <span className="text-gold-gradient italic">Reality</span> Bends.
              </p>
              <p className="mt-2 text-xs leading-5" style={{ color: "var(--jr-lavender)" }}>
                Cinematic stage magic for weddings, corporate evenings and festivals.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold"
                  style={{
                    background: "var(--jr-crimson)",
                    color: "var(--jr-ivory)",
                    boxShadow: "0 12px 26px -10px color-mix(in srgb, var(--jr-crimson) 80%, transparent)",
                  }}
                >
                  Check Date
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold"
                  style={{
                    borderColor: "color-mix(in srgb, var(--jr-gold) 70%, transparent)",
                    color: "var(--jr-cream)",
                    background: "color-mix(in srgb, var(--jr-plum) 40%, transparent)",
                  }}
                >
                  Watch the Show
                </span>
              </div>
            </div>

            {/* light section mock */}
            <div className="px-6 py-7" style={{ background: "var(--jr-ivory)" }}>
              <div className="rounded-2xl border p-4" style={{ borderColor: "var(--jr-line)", background: "var(--jr-card)" }}>
                <p className="eyebrow text-[10px]">Signature Acts</p>
                <p className="mt-1.5 font-display text-lg font-semibold" style={{ color: "var(--jr-plum)" }}>
                  Three moments the room does not forget
                </p>
                <p className="mt-1.5 text-xs leading-5" style={{ color: "var(--jr-ink)" }}>
                  Every evening is engineered for its room — a preview of body copy in the
                  light surfaces of the site.
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-semibold"
                    style={{ background: "var(--jr-sand-light)", color: "var(--jr-gold-dark)" }}
                  >
                    <span style={{ color: "var(--jr-teal)" }}>✓</span> Included
                  </span>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[11px] font-semibold"
                    style={{ border: "1px solid color-mix(in srgb, var(--jr-gold) 60%, transparent)", color: "var(--jr-plum)" }}
                  >
                    Most booked
                  </span>
                </div>
              </div>
              <div className="mt-4 flex gap-2 overflow-hidden">
                {["--jr-gold", "--jr-gold-light", "--jr-crimson", "--jr-plum", "--jr-teal", "--jr-sand"].map((v) => (
                  <span key={v} className="h-8 flex-1 rounded-lg border border-black/5" style={{ background: `var(${v})` }} aria-hidden="true" />
                ))}
              </div>
            </div>
          </section>
          <p className="mt-3 text-center text-xs text-[#5b5266]">
            Preview updates as you edit · {dirty ? "Unsaved changes" : "Matches the live theme"}
          </p>
        </aside>
      </div>
    </div>
  );
}
