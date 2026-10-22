"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star, ExternalLink } from "lucide-react";
import { REAL_REVIEWS, SITE } from "@/lib/content";

const AUTO_MS = 4600;

// ── Auto-rotating reviews carousel ────────────────────────────
// Rotates through the platform-verified review summaries (Google +
// Justdial). Pauses on hover/focus and when the tab is hidden;
// respects prefers-reduced-motion (rotation disabled, manual nav kept).
export function ReviewsCarousel({ variant = "home" }: { variant?: "home" | "page" }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const count = REAL_REVIEWS.length;

  const go = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i + dir + count) % count),
    [count]
  );

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || paused) return;
    let visible = true;
    const onVis = () => {
      visible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", onVis);
    const id = setInterval(() => {
      if (visible && !rootRef.current?.matches(":hover")) {
        setIndex((i) => (i + 1) % count);
      }
    }, AUTO_MS);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [paused, count]);

  const review = REAL_REVIEWS[index];

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Verified reviews — auto-rotating"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className="relative mx-auto w-full max-w-3xl"
    >
      {/* slide viewport */}
      <div className="card-cine relative overflow-hidden rounded-3xl border border-[var(--jr-line)] bg-[var(--jr-card)] shadow-[0_35px_70px_-45px_color-mix(in_srgb,var(--jr-plum)_55%,transparent)]">
        {/* source-coloured top hairline */}
        <div
          aria-hidden="true"
          className="h-1 w-full bg-gradient-to-r from-[var(--jr-gold)] via-[var(--jr-gold-light)] to-[var(--jr-gold)]"
        />
        <div className="relative min-h-[300px] px-7 py-9 sm:min-h-[260px] sm:px-12 sm:py-10">
          {/* keyed remount + CSS enter animation replaces AnimatePresence */}
          <figure
            key={index}
            className="jr-review-enter flex h-full flex-col items-center text-center"
            aria-live="polite"
          >
              {/* platform badge + stars */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                    review.source === "Google"
                      ? "border border-[var(--jr-gold)]/45 bg-[var(--jr-sand-light)]/70 text-[var(--jr-gold-dark)]"
                      : "border border-[color-mix(in_srgb,var(--jr-teal)_35%,transparent)] bg-[color-mix(in_srgb,var(--jr-teal)_10%,var(--jr-card))] text-[color-mix(in_srgb,var(--jr-teal)_80%,black)]"
                  }`}
                >
                  {review.source === "Google" ? (
                    <GoogleGlyph />
                  ) : (
                    <JustdialGlyph />
                  )}
                  {review.source} · {review.count} ratings
                </span>
                <span className="flex items-center gap-1" aria-label={`${review.rating} out of 5 stars`}>
                  {[0, 1, 2, 3, 4].map((s) => (
                    <Star
                      key={s}
                      className={`h-4 w-4 ${
                        s < Math.round(review.rating)
                          ? "fill-[var(--jr-gold)] text-[var(--jr-gold)]"
                          : "fill-[var(--jr-line)] text-[var(--jr-line)]"
                      }`}
                      aria-hidden="true"
                    />
                  ))}
                  <span className="ml-1 text-sm font-semibold text-[var(--jr-plum)]">{review.rating}</span>
                </span>
              </div>

              <blockquote className="mt-5">
                <p className="font-display text-xl font-medium leading-snug text-[var(--jr-plum)] sm:text-2xl">
                  {review.headline}
                </p>
                <p className="mx-auto mt-3 max-w-xl text-[15px] leading-7 text-[var(--jr-ink)]">
                  {review.summary}
                </p>
              </blockquote>

              <figcaption className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-[var(--jr-ink)]">
                <span className="font-semibold uppercase tracking-[0.16em] text-[var(--jr-gold)]">
                  Verified platform summary
                </span>
                <span aria-hidden="true">·</span>
                <a
                  href={review.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium underline decoration-[var(--jr-gold)]/50 underline-offset-2 transition-colors hover:text-[var(--jr-crimson)]"
                >
                  Read the live reviews
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </figcaption>
          </figure>
        </div>

        {/* progress dots — 36px touch targets so they always work on mobile */}
        <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1">
          {REAL_REVIEWS.map((r, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to review ${i + 1} (${r.source})`}
              aria-current={i === index}
              className="group flex h-9 w-9 items-center justify-center"
            >
              <span
                className={`block rounded-full transition-all duration-500 ${
                  i === index ? "h-2 w-8 bg-[var(--jr-gold)]" : "h-2 w-2 bg-[color-mix(in_srgb,var(--jr-ink)_25%,var(--jr-line))] group-hover:bg-[color-mix(in_srgb,var(--jr-gold)_60%,transparent)]"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* prev / next arrows */}
      <button
        onClick={() => go(-1)}
        aria-label="Previous review"
        className="absolute -left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--jr-line)] bg-[var(--jr-card)] text-[var(--jr-plum)] shadow-[0_12px_30px_-12px_color-mix(in_srgb,var(--jr-plum)_45%,transparent)] transition-all duration-400 hover:border-[var(--jr-gold)] hover:bg-[var(--jr-sand-light)] sm:flex"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <button
        onClick={() => go(1)}
        aria-label="Next review"
        className="absolute -right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--jr-line)] bg-[var(--jr-card)] text-[var(--jr-plum)] shadow-[0_12px_30px_-12px_color-mix(in_srgb,var(--jr-plum)_45%,transparent)] transition-all duration-400 hover:border-[var(--jr-gold)] hover:bg-[var(--jr-sand-light)] sm:flex"
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* platform aggregate strip (page variant only) */}
      {variant === "page" && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <a
            href={SITE.googleProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="card-cine flex items-center justify-between gap-4 rounded-2xl border border-[var(--jr-line)] bg-[var(--jr-card)] p-5 transition-colors hover:border-[var(--jr-gold)]/60"
          >
            <div className="flex items-center gap-3">
              <GoogleGlyph />
              <div>
                <p className="font-semibold text-[var(--jr-plum)]">Google Business Profile</p>
                <p className="text-sm text-[var(--jr-ink)]">
                  {SITE.rating}★ · {SITE.reviewCount} reviews
                </p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 shrink-0 text-[var(--jr-gold)]" aria-hidden="true" />
          </a>
          <a
            href={SITE.justdialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="card-cine flex items-center justify-between gap-4 rounded-2xl border border-[var(--jr-line)] bg-[var(--jr-card)] p-5 transition-colors hover:border-[var(--jr-gold)]/60"
          >
            <div className="flex items-center gap-3">
              <JustdialGlyph />
              <div>
                <p className="font-semibold text-[var(--jr-plum)]">Justdial Listing</p>
                <p className="text-sm text-[var(--jr-ink)]">
                  {SITE.justdialRating}★ · {SITE.justdialReviewCount} ratings
                </p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 shrink-0 text-[var(--jr-gold)]" aria-hidden="true" />
          </a>
        </div>
      )}
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.44a5.5 5.5 0 0 1-2.39 3.62v3h3.86c2.26-2.09 3.59-5.17 3.59-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.86-3c-1.08.72-2.45 1.15-4.09 1.15-3.14 0-5.8-2.12-6.75-4.97H1.29v3.1A12 12 0 0 0 12 24Z"
      />
      <path fill="#FBBC05" d="M5.25 14.27a7.2 7.2 0 0 1 0-4.55v-3.1H1.29a12 12 0 0 0 0 10.75l3.96-3.1Z" />
      <path
        fill="#EA4335"
        d="M12 4.76c1.76 0 3.34.61 4.58 1.8l3.44-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.29 6.62l3.96 3.1c.95-2.85 3.61-4.96 6.75-4.96Z"
      />
    </svg>
  );
}

function JustdialGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none">
      <circle cx="12" cy="12" r="10.5" stroke="var(--jr-teal)" strokeWidth="2.4" />
      <path d="M8.2 16.4 12 5.6l3.8 10.8" stroke="var(--jr-teal)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.6 13.2h4.8" stroke="var(--jr-teal)" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
