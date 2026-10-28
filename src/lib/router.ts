"use client";

import { useCallback, useEffect, useState } from "react";
import type { RouteId } from "./content";
import { parseRoutePath, routeToPath, VALID, ALIASES } from "./routes";

export { parseRoutePath, routeToPath } from "./routes";
export type { RouteId } from "./content";

// ── Measurement: GA4 + first-party analytics ─────────────────
// gtag.js is loaded once in layout.tsx. GA4 only records the initial
// load automatically; every client-side navigation afterwards pushes
// a page_view event with the virtual path so /about, /gallery and
// /blog/<slug> all appear in GA reports as real pages. The same
// moments also POST to /api/analytics (fire-and-forget) so the Master
// Admin Analytics tab has first-party numbers without cookies.
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function beacon(path: string) {
  try {
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, referrer: document.referrer || null }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* first-party analytics must never break the site */
  }
}

export function trackPageView(path: string, title?: string) {
  if (typeof window === "undefined") return;
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "page_view",
      page_path: path,
      page_title: title ?? document.title,
      page_location: window.location.origin + path,
    });
  } catch {
    /* measurement must never break the site */
  }
  if (path !== "/admin") beacon(path);
}

// Custom conversion events — booking submits, quote CTA clicks,
// WhatsApp opens, article reads. All visible in GA4 Explorations.
export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: name, ...params });
  } catch {
    /* noop */
  }
}

// ── CTA engagement tracking (lead-generation visibility) ──────────
// trackCta("whatsapp") fires when a high-intent CTA (WhatsApp / call /
// booking / contact / quote) is tapped. It records the tap in BOTH
// GA4 (conversion event) and the first-party CtaClick table (Master
// Admin dashboard + Manager Agent funnel report) — phone-channel
// interest stops being invisible. Fire-and-forget: it can never break
// or delay the CTA click itself.
export function trackCta(cta: "whatsapp" | "call" | "booking" | "contact" | "quote") {
  if (typeof window === "undefined") return;
  try {
    trackEvent("cta_click", { cta, path: window.location.pathname });
    void fetch("/api/cta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cta, path: window.location.pathname }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* measurement must never break the CTA */
  }
}

// /blog/<slug> deep links resolve to the blog route + the post slug
// (implementation lives in the shared routes.ts module).

// History-API router with real, crawlable URLs (/about, /services, …).
// The Next rewrites in next.config.ts serve the single-page shell for
// every public path, so each view is a shareable, indexable URL.
// Legacy #/hash links are upgraded in place on first load.
// `initial` comes from the server-rendered pathname so the first paint
// (raw HTML for crawlers + no-JS visitors) already shows the right
// view and per-route <title>/description instead of the home shell.
export function useSiteRouter(initial?: { route: RouteId; blogSlug: string | null }) {
  const [route, setRoute] = useState<RouteId>(initial?.route ?? "home");
  const [blogSlug, setBlogSlug] = useState<string | null>(initial?.blogSlug ?? null);

  useEffect(() => {
    const syncFromLocation = () => {
      // Upgrade legacy hash links (#/about → /about) without reloading.
      if (window.location.hash.startsWith("#/")) {
        const raw = window.location.hash.replace(/^#\/?/, "").split("?")[0].toLowerCase();
        const target = (VALID as string[]).includes(raw)
          ? (raw as RouteId)
          : ALIASES[raw] ?? null;
        if (target) {
          window.history.replaceState(null, "", routeToPath(target));
          setRoute(target);
          setBlogSlug(null);
          window.scrollTo({ top: 0, behavior: "auto" });
          return;
        }
      }
      const parsed = parseRoutePath(window.location.pathname);
      setRoute(parsed.route);
      setBlogSlug(parsed.blogSlug);
      window.scrollTo({ top: 0, behavior: "auto" });
    };

    syncFromLocation();
    // The initial mount also logs one first-party page view (the GA
    // config beacon handles its side automatically, ours does not).
    if (window.location.pathname !== "/admin") beacon(window.location.pathname);
    // Back/forward buttons are real navigations — measure them. (The
    // initial mount is intentionally silent for GA: gtag('config')
    // already records the first page_view, and double-counting would
    // skew reports.)
    const onPop = () => {
      syncFromLocation();
      trackPageView(window.location.pathname);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = useCallback((next: RouteId) => {
    const path = routeToPath(next);
    if (window.location.pathname !== path) {
      window.history.pushState(null, "", path);
      trackPageView(path);
    }
    setRoute(next);
    setBlogSlug(null);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return { route, blogSlug, navigate };
}
