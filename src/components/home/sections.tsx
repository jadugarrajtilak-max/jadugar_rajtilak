"use client";

import { useState } from "react";
import { JrReveal } from "@/components/site/reveal";
import {
  Heart,
  Briefcase,
  Cake,
  Mic,
  Crown,
  Monitor,
  Play,
  ShieldCheck,
  CalendarCheck,
  MessageCircle,
  Sparkles,
  MapPin,
  ArrowRight,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ReviewsCarousel } from "@/components/site/reviews-carousel";
import { useSiteCustomization } from "@/components/site/customization-provider";
import { imageFrame } from "@/lib/customization";
import { CITIES, EVENT_TYPES, FAQS, PACKAGES, SIGNATURE_ACTS, SITE, TRUST_ITEMS, type RouteId } from "@/lib/content";
import { trackCta } from "@/lib/router";

// Scroll-reveal wrapper — CSS + IntersectionObserver (doc 4.2).
// Same motion language as the old framer-motion version (opacity/y,
// 0.7s, same easing) without shipping an animation runtime on load.
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <JrReveal delay={delay} className={className}>
      {children}
    </JrReveal>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  align?: "center" | "left";
}) {
  return (
    <Reveal className={align === "center" ? "text-center" : "text-left"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="font-display mt-3 text-display-lg font-medium text-[var(--jr-plum)]">{title}</h2>
      {sub && (
        <p
          className={`mt-4 text-body-lg text-[var(--jr-ink)] ${
            align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl"
          }`}
        >
          {sub}
        </p>
      )}
    </Reveal>
  );
}

const EVENT_ICONS = { rings: Heart, briefcase: Briefcase, cake: Cake, mic: Mic, crown: Crown, monitor: Monitor };

// ── Trust bar — deep plum band with gold figures ──
export function TrustBar() {
  return (
    <section aria-label="Trust indicators" className="relative overflow-hidden bg-[var(--jr-plum)]">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-50"
        style={{ background: "radial-gradient(70% 120% at 50% 130%, color-mix(in srgb, var(--jr-gold) 28%, transparent), transparent 65%)" }}
      />
      <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-4 py-12 sm:px-6 md:grid-cols-4 md:py-14">
        {TRUST_ITEMS.map((t, i) => (
          <div
            key={t.label}
            className={`flex flex-col items-center text-center ${i > 0 ? "md:border-l md:border-[var(--jr-gold)]/25" : ""}`}
          >
            <p className="font-display text-4xl font-semibold text-gold-gradient">{t.value}</p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-[var(--jr-lavender)]/70">{t.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── The magician — editorial story section with real photograph ──
export function StorySection({ navigate }: { navigate: (r: RouteId) => void }) {
  const { text, asset } = useSiteCustomization();
  const storyPhoto = asset("home.story.photo");
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6" aria-labelledby="story-title">
      <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal className="relative mx-auto w-full max-w-md">
          <div
            aria-hidden="true"
            className="absolute -inset-3 rotate-[-2deg] rounded-[1.75rem] border border-[var(--jr-gold)]/45"
          />
          <div className="card-cine relative overflow-hidden rounded-3xl border border-[var(--jr-line)] shadow-[0_45px_90px_-45px_color-mix(in_srgb,var(--jr-plum)_65%,transparent)]">
            <img
              src={storyPhoto.src}
              alt={storyPhoto.alt}
              className={`${imageFrame("home.story.photo") ?? "aspect-square"} w-full object-cover`}
              loading="lazy"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{ background: "linear-gradient(180deg, transparent 55%, color-mix(in srgb, var(--jr-plum-deep) 45%, transparent) 100%)" }}
            />
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3">
              <div>
                <p className="font-display text-2xl font-semibold text-[var(--jr-ivory)]">{text("home.story.cardName")}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--jr-lavender)]/75">{text("home.story.cardRole")}</p>
              </div>
              <span className="shrink-0 rounded-full border border-[var(--jr-gold)]/70 bg-[var(--jr-plum)]/60 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--jr-cream)] backdrop-blur">
                {SITE.rating}★ Google
              </span>
            </div>
          </div>
        </Reveal>

        <div>
          <SectionHeading
            align="left"
            eyebrow={text("home.story.eyebrow")}
            title={text("home.story.title")}
            sub=""
          />
          <div className="mt-5 space-y-5 text-[16px] leading-8 text-[var(--jr-ink)]">
            <p>{text("home.story.p1")}</p>
            <p>{text("home.story.p2")}</p>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-5">
            {[
              { k: "500+", v: "shows staged" },
              { k: "40+", v: "cities toured" },
              { k: "6", v: "show formats" },
            ].map((s) => (
              <div key={s.v} className="flex items-baseline gap-2.5">
                <span className="font-display text-3xl font-semibold text-[var(--jr-gold)]">{s.k}</span>
                <span className="text-sm text-[var(--jr-ink)]">{s.v}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate("about")}
            className="mt-9 inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--jr-gold)]/60 px-8 py-3 text-[15px] font-semibold text-[var(--jr-plum)] transition-all duration-500 hover:bg-[var(--jr-sand-light)]"
          >
            {text("home.story.cta")}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}

// ── Certificates & honours — the recognition wall (the client's two
// certificate scans) ──
// Framed-document presentation: natural 10:13 aspect so the certificates
// are never cropped, gold double-frame, award chip. Rendered on Home AND
// at the bottom of the Gallery page. Live-editable from Master Admin →
// Images (certificates.intl / certificates.competition) and → Texts.
export function CertificatesSection() {
  const { text, asset } = useSiteCustomization();
  const recognition = asset("certificates.intl");
  const competition = asset("certificates.competition");

  const cards = [
    {
      img: recognition,
      frame: imageFrame("certificates.intl") ?? "aspect-[10/13]",
      tag: text("home.cert.intlTag"),
      title: text("home.cert.intlTitle"),
      detail: text("home.cert.intlDetail"),
      tilt: "md:-rotate-1",
    },
    {
      img: competition,
      frame: imageFrame("certificates.competition") ?? "aspect-[10/13]",
      tag: text("home.cert.posterTag"),
      title: text("home.cert.posterTitle"),
      detail: text("home.cert.posterDetail"),
      tilt: "md:rotate-1",
    },
  ];

  return (
    <section className="border-y border-[var(--jr-line)] bg-[var(--jr-sand)] py-20" aria-labelledby="cert-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow={text("home.cert.eyebrow")}
          title={text("home.cert.title")}
          sub={text("home.cert.sub")}
        />
        <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-8 lg:gap-12">
          {cards.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.14}>
              <article className={`group relative mx-auto w-full max-w-sm ${c.tilt} transition-transform duration-700 hover:rotate-0 md:mx-0`}>
                {/* the wall pin */}
                <span
                  aria-hidden="true"
                  className="absolute -top-3 left-1/2 z-10 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border border-[var(--jr-gold)]/60 bg-[var(--jr-plum)] shadow-[0_6px_14px_-4px_color-mix(in_srgb,var(--jr-plum)_60%,transparent)]"
                >
                  <Crown className="h-3.5 w-3.5 text-[var(--jr-gold)]" aria-hidden="true" />
                </span>
                {/* gold double frame */}
                <div
                  aria-hidden="true"
                  className="absolute -inset-2.5 rounded-[1.4rem] border border-[var(--jr-gold)]/45"
                />
                <div className="relative overflow-hidden rounded-2xl border border-[var(--jr-gold)]/60 bg-[var(--jr-card)] p-2.5 shadow-[0_40px_80px_-40px_color-mix(in_srgb,var(--jr-plum)_70%,transparent)]">
                  <div className="overflow-hidden rounded-xl bg-white">
                    <img
                      src={c.img.src}
                      alt={c.img.alt}
                      className={`${c.frame} w-full object-cover`}
                      loading="lazy"
                    />
                  </div>
                </div>
                {/* caption plate */}
                <div className="relative -mt-1 rounded-b-2xl border border-t-0 border-[var(--jr-line)] bg-[var(--jr-card)] px-5 py-4 text-center shadow-[0_18px_36px_-24px_color-mix(in_srgb,var(--jr-plum)_55%,transparent)]">
                  <p className="inline-flex items-center gap-1.5 rounded-full border border-[var(--jr-gold)]/45 bg-[color-mix(in_srgb,var(--jr-sand-light)_60%,transparent)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--jr-gold-dark)]">
                    <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                    {c.tag}
                  </p>
                  <h3 id={i === 0 ? "cert-title" : undefined} className="font-display mt-2.5 text-xl font-semibold text-[var(--jr-plum)]">
                    {c.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-6 text-[var(--jr-ink)]">{c.detail}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Signature acts ──
export function SignatureActs() {
  const { text } = useSiteCustomization();
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6" aria-labelledby="acts-title">
      <SectionHeading
        eyebrow={text("home.acts.eyebrow")}
        title={text("home.acts.title")}
        sub={text("home.acts.sub")}
      />
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {SIGNATURE_ACTS.map((act, i) => (
          <Reveal key={act.title} delay={i * 0.12}>
            <article className="card-cine group relative h-full overflow-hidden rounded-2xl border border-[var(--jr-line)] bg-[var(--jr-card)] p-7">
              <div
                aria-hidden="true"
                className="absolute -right-6 -top-6 flex h-28 w-28 items-center justify-center rounded-full bg-[var(--jr-sand-light)] text-5xl text-[var(--jr-gold)]/40 transition-transform duration-700 group-hover:scale-110"
              >
                {act.suit}
              </div>
              <p className="eyebrow">{act.kind}</p>
              <h3 className="font-display mt-3 text-2xl font-semibold text-[var(--jr-plum)]">{act.title}</h3>
              <p className="mt-4 text-[15px] leading-7 text-[var(--jr-ink)]">{act.description}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ── Event types grid ──
export function EventTypesGrid({ navigate }: { navigate: (r: RouteId) => void }) {
  const { text } = useSiteCustomization();
  return (
    <section className="bg-[var(--jr-sand)] py-20" aria-labelledby="events-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow={text("home.events.eyebrow")}
          title={text("home.events.title")}
          sub={text("home.events.sub")}
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {EVENT_TYPES.map((e, i) => {
            const Icon = EVENT_ICONS[e.icon];
            return (
              <Reveal key={e.id} delay={(i % 3) * 0.1}>
                <button
                  onClick={() => navigate("services")}
                  className="card-cine group h-full w-full rounded-2xl border border-[var(--jr-line)] bg-[var(--jr-card)] p-7 text-left"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--jr-sand-light)] text-[var(--jr-gold)] transition-colors duration-500 group-hover:bg-[var(--jr-gold)] group-hover:text-[var(--jr-ivory)]">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="font-display mt-5 text-2xl font-semibold text-[var(--jr-plum)]">{e.name}</h3>
                  <p className="mt-1 text-sm italic text-[var(--jr-gold)]">{e.tagline}</p>
                  <p className="mt-4 line-clamp-3 text-[15px] leading-7 text-[var(--jr-ink)]">{e.description}</p>
                  <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--jr-crimson)]">
                    {text("home.events.cta")}
                    <span aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                  </p>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Video reel — the official Instagram reel, click-to-load embed ──
export function VideoReel() {
  const [playing, setPlaying] = useState(false);
  const { text, asset } = useSiteCustomization();
  const poster = asset("home.reel.poster");
  const POST = "https://www.instagram.com/p/DCJ3hBhg8xh/";
  return (
    <section id="reel" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6" aria-labelledby="reel-title">
      <SectionHeading
        eyebrow={text("home.reel.eyebrow")}
        title={text("home.reel.title")}
        sub={text("home.reel.sub")}
      />
      <Reveal className="mt-12">
        <div className="group relative mx-auto aspect-[2/3] w-full max-w-md overflow-hidden rounded-2xl border border-[var(--jr-line)] shadow-[0_45px_90px_-45px_color-mix(in_srgb,var(--jr-plum)_70%,transparent)]">
          {playing ? (
            <div className="relative h-full bg-[var(--jr-plum-deep)]">
              {/* Instagram reel embed — loads on demand, plays inside the frame */}
              <iframe
                src={`${POST}embed`}
                title="Jadugar Rajtilak — official Instagram reel: thirty seconds of the royal stage"
                className="h-full w-full border-0 bg-[var(--jr-plum-deep)]"
                loading="lazy"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          ) : (
            <>
              <img
                src={poster.src}
                alt={poster.alt}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-cine group-hover:scale-[1.03]"
                loading="lazy"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{ background: "linear-gradient(180deg, color-mix(in srgb, var(--jr-plum-deep) 15%, transparent) 0%, color-mix(in srgb, var(--jr-plum-deep) 55%, transparent) 100%)" }}
              />
              <div className="stage-light absolute -top-6 left-[30%] h-[70%] w-[40%] opacity-50" aria-hidden="true" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
                <button
                  className="flex h-20 w-20 items-center justify-center rounded-full border border-[var(--jr-gold)]/70 bg-[var(--jr-plum)]/45 backdrop-blur-md transition-all duration-500 hover:scale-105 hover:bg-[var(--jr-gold)]/35"
                  aria-label="Play the official Instagram reel"
                  onClick={() => setPlaying(true)}
                >
                  <Play className="h-8 w-8 translate-x-0.5 text-[var(--jr-cream)]" aria-hidden="true" />
                </button>
                <p className="text-sm font-medium tracking-wide text-[var(--jr-ivory)]/90">{text("home.reel.badge")}</p>
              </div>
              <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-xs text-[var(--jr-lavender)]/85">
                  <Sparkles className="h-3.5 w-3.5 text-[var(--jr-gold)]" aria-hidden="true" />
                  {text("home.reel.note")}
                </span>
                <span className="shrink-0 rounded-full border border-[var(--jr-gold)]/60 bg-[var(--jr-plum)]/55 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--jr-cream)] backdrop-blur">
                  Instagram
                </span>
              </div>
            </>
          )}
        </div>
      </Reveal>
      {/* direct link — always reachable even if embeds are blocked */}
      <p className="mt-5 text-center text-sm text-[var(--jr-ink)]">
        Prefer Instagram? {""}
        <a
          href={POST}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[var(--jr-crimson)] underline-offset-4 hover:underline"
        >
          Watch the reel on Instagram →
        </a>
      </p>
    </section>
  );
}

// ── Packages teaser ──
export function PackagesTeaser({ navigate }: { navigate: (r: RouteId) => void }) {
  const { text } = useSiteCustomization();
  return (
    <section className="bg-[var(--jr-sand)] py-20" aria-labelledby="packages-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow={text("home.packages.eyebrow")}
          title={text("home.packages.title")}
          sub={text("home.packages.sub")}
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PACKAGES.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.12}>
              <article
                className={`card-cine relative h-full rounded-2xl border p-7 ${
                  p.featured
                    ? "border-[var(--jr-gold)]/70 bg-[var(--jr-card)] shadow-[0_30px_60px_-30px_color-mix(in_srgb,var(--jr-gold)_45%,transparent)]"
                    : "border-[var(--jr-line)] bg-[var(--jr-card)]"
                }`}
              >
                {p.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--jr-crimson)] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--jr-ivory)]">
                    {text("home.packages.featuredBadge")}
                  </span>
                )}
                <p className="eyebrow">{p.bestFor}</p>
                <h3 className="font-display mt-2 text-3xl font-semibold text-[var(--jr-plum)]">{p.name}</h3>
                <p className="mt-1 font-display text-lg text-[var(--jr-gold)]">{p.range}</p>
                <p className="mt-4 text-[15px] leading-7 text-[var(--jr-ink)]">{p.blurb}</p>                <ul className="mt-5 space-y-2.5">
                  {p.inclusions.slice(0, 4).map((inc) => (
                    <li key={inc} className="flex items-start gap-2.5 text-sm text-[var(--jr-ink)]">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--jr-teal)]" aria-hidden="true" />
                      {inc}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 text-center">
          <button
            onClick={() => navigate("packages")}
            className="inline-flex min-h-11 items-center rounded-full border border-[var(--jr-gold)]/60 px-8 py-3 text-[15px] font-semibold text-[var(--jr-plum)] transition-all duration-500 hover:bg-[var(--jr-sand-light)]"
          >
            {text("home.packages.cta")}
          </button>
        </Reveal>
      </div>
    </section>
  );
}

// ── Testimonials strip — auto-rotating verified platform reviews ──
export function TestimonialsStrip() {
  const { text } = useSiteCustomization();
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6" aria-labelledby="reviews-title">
      <SectionHeading
        eyebrow={text("home.reviews.eyebrow")}
        title={text("home.reviews.title")}
        sub={text("home.reviews.sub")}
      />
      <Reveal className="mt-12">
        <ReviewsCarousel />
      </Reveal>
      <p className="mt-6 text-center text-[11px] text-[var(--jr-ink)]/60">
        Platform summaries · {SITE.rating}★ from {SITE.reviewCount} reviews on the live{" "}
        <a
          href={SITE.googleProfileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-[var(--jr-gold)]/60 underline-offset-2 hover:text-[var(--jr-crimson)]"
        >
          Google profile
        </a>{" "}
        · {SITE.justdialRating}★ from {SITE.justdialReviewCount} ratings on{" "}
        <a
          href={SITE.justdialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-[var(--jr-gold)]/60 underline-offset-2 hover:text-[var(--jr-crimson)]"
        >
          Justdial
        </a>
      </p>
    </section>
  );
}

// ── Cities strip — where the stage travels ──
export function CitiesStrip() {
  const { text } = useSiteCustomization();
  return (
    <section aria-label="Cities performed in" className="border-y border-[var(--jr-line)] bg-[var(--jr-sand)] py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4">
        <p className="eyebrow">{text("home.cities.eyebrow")}</p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {CITIES.map((c, i) => (
            <span key={c} className="flex items-center gap-8">
              <span className="flex items-center gap-2.5 font-display text-xl font-medium text-[var(--jr-plum)]">
                <MapPin className="h-4 w-4 text-[var(--jr-gold)]" aria-hidden="true" />
                {c}
              </span>
              {i < CITIES.length - 1 && (
                <span aria-hidden="true" className="hidden h-1 w-1 rounded-full bg-[var(--jr-gold)]/50 sm:block">
                  ·
                </span>
              )}
            </span>
          ))}
        </div>
        <p className="text-[13px] text-[var(--jr-ink)]">
          {text("home.cities.note")}
        </p>
      </div>
    </section>
  );
}

// ── FAQ teaser ──
export function FaqTeaser({ navigate }: { navigate: (r: RouteId) => void }) {
  const { text } = useSiteCustomization();
  return (
    <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6" aria-labelledby="faq-title">
      <SectionHeading
        eyebrow={text("home.faq.eyebrow")}
        title={text("home.faq.title")}
        sub={text("home.faq.sub")}
      />
      <Reveal className="mt-10">
        <Accordion type="single" collapsible className="rounded-2xl border border-[var(--jr-line)] bg-[var(--jr-card)] px-6">
          {FAQS.slice(0, 3).map((f) => (
            <AccordionItem key={f.q} value={f.q} className="border-[var(--jr-line)]">
              <AccordionTrigger className="text-left font-display text-lg font-semibold text-[var(--jr-plum)] hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-[15px] leading-7 text-[var(--jr-ink)]">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("faq")}
            className="text-sm font-semibold text-[var(--jr-crimson)] underline-offset-4 hover:underline"
          >
            {text("home.faq.cta")}
          </button>
        </div>
      </Reveal>
    </section>
  );
}

// ── Booking CTA strip ──
export function BookingStrip({ navigate }: { navigate: (r: RouteId) => void }) {
  const { text } = useSiteCustomization();
  return (
    <section aria-labelledby="cta-title" className="relative overflow-hidden bg-[var(--jr-plum)] py-24">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-60"
        style={{
          background: "radial-gradient(90% 80% at 50% 120%, color-mix(in srgb, var(--jr-plum-mid) 80%, var(--jr-crimson)) 0%, transparent 60%)",
        }}
      />
      <div className="stage-light absolute -top-10 left-[38%] h-[90%] w-[24%] opacity-60" aria-hidden="true" />
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <Reveal>
          <p className="eyebrow">{text("home.cta.eyebrow")}</p>
          <h2 id="cta-title" className="font-display mt-4 text-display-lg font-medium text-[var(--jr-ivory)]">
            {text("home.cta.title")}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-body-lg text-[var(--jr-lavender)]/85">
            {text("home.cta.sub")}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => {
                trackCta("booking");
                navigate("booking");
              }}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--jr-crimson)] px-8 py-3 text-[15px] font-semibold text-[var(--jr-ivory)] shadow-[0_18px_40px_-14px_color-mix(in_srgb,var(--jr-crimson)_80%,transparent)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[var(--jr-crimson-hover)]"
            >
              <CalendarCheck className="h-4 w-4" aria-hidden="true" />
              {text("home.cta.button")}
            </button>
            <a
              href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent("Namaste! I would like to check a date for a magic show.")}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCta("whatsapp")}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--jr-gold)]/60 px-8 py-3 text-[15px] font-semibold text-[var(--jr-cream)] transition-all duration-500 hover:bg-[var(--jr-gold)]/10"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              {text("home.cta.whatsapp")}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
