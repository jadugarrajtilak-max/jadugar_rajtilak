"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  IMAGE_SLOT_MAP,
  THEME_TOKENS,
  defaultPayload,
  type SiteCustomizationPayload,
} from "@/lib/customization";

// ─────────────────────────────────────────────────────────────
// Live customization engine.
// The provider renders the shipped defaults on first paint (SSR-safe,
// zero layout shift), then fetches /api/site/customization and swaps
// in Master Admin overrides — so admin edits appear on the live site
// without a rebuild. Refetches on route change, tab focus and after
// every admin save (via refresh()), which means "save in admin →
// switch to the site → change is live".
// ─────────────────────────────────────────────────────────────

type Ctx = {
  ready: boolean;
  payload: SiteCustomizationPayload;
  /** image slot lookup — falls back to the shipped default */
  asset: (key: string) => { src: string; alt: string };
  /** text line lookup — falls back to the shipped default */
  text: (key: string) => string;
  /** gallery frame lookup with caption/category */
  galleryItem: (key: string) => {
    src: string;
    alt: string;
    caption: string;
    cat: string;
  };
  /** re-fetch overrides (called by admin panels after save) */
  refresh: () => Promise<void>;
};

const CustomizationContext = createContext<Ctx | null>(null);

export function SiteCustomizationProvider({ children }: { children: React.ReactNode }) {
  const [payload, setPayload] = useState<SiteCustomizationPayload>(() => defaultPayload());
  const [ready, setReady] = useState(false);
  const inflight = useRef(false);

  const refresh = useCallback(async () => {
    if (inflight.current) return;
    inflight.current = true;
    try {
      const res = await fetch("/api/site/customization", { cache: "no-store" });
      if (res.ok) {
        const json = (await res.json()) as SiteCustomizationPayload;
        if (json?.ok) setPayload(json);
      }
    } catch {
      /* offline — keep current state */
    } finally {
      inflight.current = false;
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();

    // Refetch when the visitor returns to the tab (admin saves in
    // another tab / re-opens the browser → site is current).
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    // Refetch on SPA route change (cheap, keeps pages current).
    const onRoute = () => void refresh();
    window.addEventListener("popstate", onRoute);
    window.addEventListener("jr-customization-changed", onRoute as EventListener);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("popstate", onRoute);
      window.removeEventListener("jr-customization-changed", onRoute as EventListener);
    };
  }, [refresh]);

  // ── Live theme engine: apply colors as CSS custom properties ──
  useEffect(() => {
    const root = document.documentElement;
    for (const token of THEME_TOKENS) {
      const value = payload.theme[token.key] ?? token.defaultValue;
      root.style.setProperty(token.varName, value);
    }
  }, [payload.theme]);

  const value = useMemo<Ctx>(() => {
    const asset = (key: string) => {
      const fallback = IMAGE_SLOT_MAP[key];
      const override = payload.assets[key];
      if (override && (override.src || override.alt)) {
        return {
          src: override.src || fallback?.defaultSrc || "",
          alt: override.alt || fallback?.defaultAlt || "",
        };
      }
      return { src: fallback?.defaultSrc ?? "", alt: fallback?.defaultAlt ?? "" };
    };
    const text = (key: string) => payload.texts[key] ?? "";
    const galleryItem = (key: string) => {
      const slot = IMAGE_SLOT_MAP[key];
      const a = asset(key);
      return {
        src: a.src,
        alt: a.alt,
        caption: text(`${key}.caption`) || slot?.caption || "",
        cat: slot?.cat ?? "stage",
      };
    };
    return { ready, payload, asset, text, galleryItem, refresh };
  }, [payload, ready, refresh]);

  return <CustomizationContext.Provider value={value}>{children}</CustomizationContext.Provider>;
}

export function useSiteCustomization(): Ctx {
  const ctx = useContext(CustomizationContext);
  if (!ctx) {
    // Defensive fallback — provider is mounted in the root page shell.
    const fallback = defaultPayload();
    return {
      ready: false,
      payload: fallback,
      asset: (key) => ({
        src: IMAGE_SLOT_MAP[key]?.defaultSrc ?? "",
        alt: IMAGE_SLOT_MAP[key]?.defaultAlt ?? "",
      }),
      text: (key) => fallback.texts[key] ?? "",
      galleryItem: (key) => {
        const slot = IMAGE_SLOT_MAP[key];
        return {
          src: slot?.defaultSrc ?? "",
          alt: slot?.defaultAlt ?? "",
          caption: slot?.caption ?? "",
          cat: slot?.cat ?? "stage",
        };
      },
      refresh: async () => {},
    };
  }
  return ctx;
}

/** Fire-and-forget ping used by admin panels after a successful save. */
export function announceCustomizationChanged() {
  try {
    window.dispatchEvent(new Event("jr-customization-changed"));
  } catch {
    /* ignore */
  }
}
