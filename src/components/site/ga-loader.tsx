"use client";

import { useEffect } from "react";

// ─────────────────────────────────────────────────────────────
// GA4 loader — idle-deferred.
// next/script lazyOnload still lands the 177 KB gtag.js download +
// evaluation inside the load window, where it competes with React
// hydration for the main thread (TBT / LCP on mid-range phones).
// This loader defers the third-party fetch until the browser is
// truly idle AFTER the load event (2.5 s cap, 1.2 s fallback on
// Safari). The inline dataLayer bootstrap in layout.tsx still runs
// immediately, so page_view / custom events pushed before gtag
// arrives are stored in dataLayer and replayed when it loads.
// Measurement impact is limited to sub-2-second bounces.
// ─────────────────────────────────────────────────────────────
export function GALoader({ gaId }: { gaId: string }) {
  useEffect(() => {
    if (!gaId) return;
    let done = false;
    const inject = () => {
      if (done) return;
      done = true;
      try {
        const s = document.createElement("script");
        s.async = true;
        s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(s);
      } catch {
        /* measurement must never break the site */
      }
    };
    const scheduleIdle = () => {
      try {
        if (typeof requestIdleCallback === "function") {
          requestIdleCallback(inject, { timeout: 2500 });
        } else {
          setTimeout(inject, 1200);
        }
      } catch {
        inject();
      }
    };
    if (document.readyState === "complete") {
      scheduleIdle();
    } else {
      window.addEventListener("load", scheduleIdle, { once: true });
    }
    return () => {
      done = true; // never double-inject across route changes
    };
  }, [gaId]);

  return null;
}
