"use client";

import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";

// ── Scroll-reveal without framer-motion ───────────────────────
// A single shared IntersectionObserver flips a CSS class; the motion
// itself lives in globals.css (.jr-reveal). Cost per element is one
// class toggle — no animation runtime in the first-load bundle.
// Respects prefers-reduced-motion via the CSS media query, and the
// shipped no-js/no-IO fallbacks guarantee content is never hidden.
export function JrReveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  /** seconds */
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "figure" | "article";
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-visible");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "-60px 0px", threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const style: CSSProperties = delay ? { "--reveal-delay": `${delay}s` } as CSSProperties : {};

  return (
    <Tag ref={ref as never} className={`jr-reveal ${className ?? ""}`.trim()} style={style}>
      {children}
    </Tag>
  );
}
