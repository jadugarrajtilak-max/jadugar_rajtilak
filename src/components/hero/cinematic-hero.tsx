"use client";

import { useEffect, useRef } from "react";
import { GoldDust } from "./gold-dust";
import { ChevronDown, Play, CalendarCheck } from "lucide-react";
import { useSiteCustomization } from "@/components/site/customization-provider";

// ─────────────────────────────────────────────────────────────
// The royal stage — direct edition.
// The cinematic entry (ivory preloader → tilak bloom → parting
// curtains → 6.5s reveal gate) has been removed per client request:
// the full hero is visible on first paint. A short, non-blocking
// entrance (headline rise ≈1s, reduced-motion aware) keeps the
// premium feel without gating content, and pointer parallax on
// desktop remains.
// ─────────────────────────────────────────────────────────────

// Cards pinned into safe vertical zones (above the logo / below the
// CTAs on the copy side; above and below the portrait on the right)
// so they never collide with the headline, logo, portrait or CTAs.
const CARDS = [
  { suit: "♠", side: "l", offset: "3.5%", top: "6%", tilt: -16, depth: 18, dur: 9.5, delay: 0 },
  { suit: "♥", side: "l", offset: "5%", top: "82%", tilt: 10, depth: 30, dur: 11, delay: 1.2 },
  { suit: "♦", side: "r", offset: "4%", top: "8%", tilt: 14, depth: 26, dur: 10, delay: 0.3 },
  { suit: "♣", side: "r", offset: "6.5%", top: "80%", tilt: -10, depth: 34, dur: 12, delay: 1.6 },
] as const;

export function CinematicHero({
  onCheckDate,
  onWatch,
}: {
  onCheckDate: () => void;
  onWatch: () => void;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { asset, text } = useSiteCustomization();

  const logo = asset("brand.logo.full");
  const portrait = asset("home.hero.portrait");

  // Pointer parallax — desktop only, weighted & cinematic (doc 4.2)
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        section.style.setProperty("--px", x.toFixed(3));
        section.style.setProperty("--py", y.toFixed(3));
      });
    };
    section.addEventListener("mousemove", onMove);
    return () => {
      section.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex min-h-[92vh] items-center justify-center overflow-hidden bg-[var(--jr-plum)]"
      aria-label="Jadugar Rajtilak — royal stage magician, Udaipur"
    >
      {/* ── The royal stage — layered plum theatre with the portrait ── */}
      <div className="absolute inset-0">
        {/* deep plum base */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(168deg, var(--jr-plum-mid) 0%, var(--jr-plum) 42%, var(--jr-plum-mid) 78%, var(--jr-plum-deep) 100%)",
          }}
        />
        {/* spotlight beam from above */}
        <div
          aria-hidden="true"
          className="stage-light absolute -top-16 left-1/2 h-[95%] w-[46%] -translate-x-1/2 opacity-70"
        />
        {/* warm gold pool behind the portrait */}
        <div
          aria-hidden="true"
          className="absolute right-[-8%] top-1/2 hidden h-[80%] w-[52%] -translate-y-1/2 lg:block"
          style={{
            background:
              "radial-gradient(58% 52% at 55% 50%, color-mix(in srgb, var(--jr-gold) 30%, transparent) 0%, color-mix(in srgb, var(--jr-gold) 8%, transparent) 45%, transparent 72%)",
          }}
        />
        {/* floor vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 118%, color-mix(in srgb, var(--jr-gold) 16%, transparent) 0%, transparent 46%), linear-gradient(180deg, transparent 62%, color-mix(in srgb, var(--jr-plum-deep) 85%, transparent) 100%)",
          }}
        />

        {/* gold dust drifting through the beam light */}
        <GoldDust density={70} />

        {/* floating playing cards — edge-pinned, behind the copy */}
        {CARDS.map((c, i) => (
          <div
            key={i}
            aria-hidden="true"
            className="animate-card-drift absolute hidden select-none lg:block"
            style={
              {
                [c.side === "l" ? "left" : "right"]: c.offset,
                top: c.top,
                "--tilt": `${c.tilt}deg`,
                "--dur": `${c.dur}s`,
                "--delay": `${c.delay}s`,
                transform: `translate3d(calc(var(--px, 0) * ${c.depth * 6}px), calc(var(--py, 0) * ${c.depth * 4}px), 0) rotate(${c.tilt}deg)`,
                opacity: 0.5,
                zIndex: 1,
              } as React.CSSProperties
            }
          >
            <div className="flex h-24 w-17 items-center justify-center rounded-lg border border-[color-mix(in_srgb,var(--jr-gold)_50%,transparent)] bg-gradient-to-br from-[var(--jr-ivory)] to-[var(--jr-cream)] shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)]">
              <span className="font-display text-3xl text-[var(--jr-plum)]">{c.suit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Real HTML content — painted immediately (LCP safe) ── */}
      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 px-6 pb-24 pt-24 sm:px-8 sm:pb-28 sm:pt-28 lg:grid-cols-[1.12fr_0.88fr] lg:gap-14">
        {/* copy column */}
        <div className="order-2 text-center lg:order-1 lg:text-left">
          {/* the official brand crest — full logo from the client's sheet */}
          <div className="mx-auto mb-4 w-[min(150px,44vw)] sm:mb-6 sm:w-[min(215px,32vw)] lg:mx-0 animate-fade-in-soft">
            <img
              src={logo.src}
              alt={logo.alt}
              className="w-full drop-shadow-[0_10px_36px_rgba(0,0,0,0.6)]"
              style={{ filter: "drop-shadow(0 0 26px color-mix(in srgb, var(--jr-gold) 35%, transparent))" }}
            />
          </div>
          <p className="eyebrow mb-5 sm:mb-6 animate-fade-in-soft" style={{ animationDelay: "0.08s" }}>
            {text("home.hero.eyebrow")}
          </p>
          <h1
            className="font-display text-display-xl font-medium text-[var(--jr-ivory)]"
            style={{ filter: "drop-shadow(0 6px 26px rgba(0,0,0,0.65))" }}
          >
            <span className="block animate-headline-rise" style={{ animationDelay: "0.05s" }}>
              {text("home.hero.h1a")}
            </span>
            <span
              className="block text-gold-gradient italic animate-headline-rise"
              style={{ animationDelay: "0.2s" }}
            >
              {text("home.hero.h1b")}
            </span>
          </h1>
          <p
            className="mx-auto mt-7 max-w-2xl text-body-lg text-[var(--jr-lavender)] lg:mx-0 animate-fade-in-soft"
            style={{ animationDelay: "0.25s", textShadow: "0 2px 18px rgba(0,0,0,0.7)" }}
          >
            {text("home.hero.sub")}
          </p>
          <div
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start animate-fade-in-soft"
            style={{ animationDelay: "0.35s" }}
          >
            <button
              onClick={onCheckDate}
              className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--jr-crimson)] px-8 py-3 text-[15px] font-semibold text-[var(--jr-ivory)] shadow-[0_18px_40px_-10px_color-mix(in_srgb,var(--jr-crimson)_85%,transparent)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[var(--jr-crimson-hover)]"
            >
              <CalendarCheck className="h-4 w-4" aria-hidden="true" />
              {text("home.hero.ctaPrimary")}
            </button>
            <button
              onClick={onWatch}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--jr-gold)_70%,transparent)] bg-[color-mix(in_srgb,var(--jr-plum)_40%,transparent)] px-8 py-3 text-[15px] font-semibold text-[var(--jr-cream)] backdrop-blur-md transition-all duration-500 hover:-translate-y-0.5 hover:border-[var(--jr-gold)] hover:bg-[color-mix(in_srgb,var(--jr-gold)_15%,transparent)]"
            >
              <Play className="h-4 w-4" aria-hidden="true" />
              {text("home.hero.ctaSecondary")}
            </button>
          </div>
        </div>

        {/* portrait column — the magician himself, in a royal arched frame */}
        <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
          <div className="relative w-[min(250px,68vw)] sm:w-[min(300px,52vw)] lg:w-[min(400px,36vw)] animate-fade-in-soft">
            {/* glowing sigil halo behind the frame */}
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ opacity: 0.3 }}
            >
              <Sigil className="h-[130%] w-[130%] max-h-none max-w-none" />
            </div>

            {/* ornate gold arch frame with a museum plaque beneath the portrait */}
            <div className="relative rounded-t-[999px] rounded-b-[1.6rem] bg-gradient-to-br from-[var(--jr-gold-light)] via-[var(--jr-gold)] to-[var(--jr-gold-dark)] p-[3px] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.75)]">
              <div className="rounded-t-[999px] rounded-b-[1.55rem] bg-[var(--jr-plum-deep)] p-[7px]">
                <div className="relative overflow-hidden rounded-t-[999px] rounded-b-[0.9rem]">
                  <img
                    src={portrait.src}
                    alt={portrait.alt}
                    className="aspect-[3/4] w-full object-cover object-[center_16%]"
                    fetchPriority="high"
                  />
                  {/* studio-to-stage grade — blends the white backdrop into the scene */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(90% 70% at 50% 32%, transparent 42%, color-mix(in srgb, var(--jr-plum-deep) 30%, transparent) 78%, color-mix(in srgb, var(--jr-plum-deep) 55%, transparent) 100%)",
                    }}
                  />
                </div>
                {/* nameplate — mounted on the frame itself, below the portrait */}
                <div className="border-t border-[color-mix(in_srgb,var(--jr-gold)_40%,transparent)] px-4 pb-3.5 pt-3 text-center">
                  <p className="font-display text-lg font-semibold tracking-wide text-[var(--jr-ivory)]">
                    {text("home.hero.nameplateName")}
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--jr-gold)]">
                    {text("home.hero.nameplateSub")}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* scroll hint */}
      <div
        aria-hidden="true"
        className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 text-[var(--jr-gold)]"
        style={{ animation: "fade-in-soft 0.8s var(--ease-cine) 1.2s both" }}
      >
        <ChevronDown className="animate-scroll-hint h-6 w-6" />
      </div>
    </section>
  );
}

// Gold tilak sigil — the focal ornament (doc 4.3)
function Sigil({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sigil-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--jr-gold-light)" />
          <stop offset="55%" stopColor="var(--jr-gold)" />
          <stop offset="100%" stopColor="var(--jr-gold-dark)" />
        </linearGradient>
      </defs>
      {/* outer diamond */}
      <path
        d="M60 10 L104 60 L60 110 L16 60 Z"
        stroke="url(#sigil-gold)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* tilak stroke */}
      <path
        d="M60 26 L60 96"
        stroke="url(#sigil-gold)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* vermilion tilak base dot */}
      <circle cx="60" cy="104" r="5" fill="var(--jr-crimson)" />
      {/* orbit accents */}
      <circle cx="60" cy="60" r="4" fill="url(#sigil-gold)" />
      <path d="M38 60 L48 60 M72 60 L82 60" stroke="url(#sigil-gold)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
