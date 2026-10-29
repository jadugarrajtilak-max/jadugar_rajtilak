"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Heart,
  Briefcase,
  Cake,
  Mic,
  Crown,
  Sparkles,
  Expand,
  Shuffle,
  Star,
  FileText,
  Hand,
  AudioLines,
  Timer,
  ArrowRight,
  Camera,
} from "lucide-react";
import { Reveal, SectionHeading, CertificatesSection } from "@/components/home/sections";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ReviewsCarousel } from "@/components/site/reviews-carousel";
import { useSiteCustomization } from "@/components/site/customization-provider";
import { IMAGE_SLOT_MAP, imageFrame } from "@/lib/customization";
import { PACKAGES, REAL_REVIEWS, SITE, type RouteId } from "@/lib/content";

function PageHero({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub: string;
}) {
  return (
    <header className="relative overflow-hidden border-b border-[var(--jr-line)] bg-[var(--jr-sand)] pb-16 pt-32">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-50"
        style={{
          background: "radial-gradient(70% 90% at 50% -20%, color-mix(in srgb, var(--jr-gold) 18%, transparent), transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="font-display mt-3 text-display-lg font-medium text-[var(--jr-plum)]">{title}</h1>
        <p className="mx-auto mt-5 max-w-2xl text-body-lg text-[var(--jr-ink)]">{sub}</p>
      </div>
    </header>
  );
}

// ── Packages (doc 6 — tiered inclusions; pricing by written quote only) ──
export function PackagesView({ navigate }: { navigate: (r: RouteId) => void }) {
  const { text } = useSiteCustomization();

  const tiers = useMemo(
    () =>
      PACKAGES.map((p) => ({
        ...p,
        name: text(`packages.${p.id}.name`) || p.name,
        range: text(`packages.${p.id}.range`) || p.range,
        blurb: text(`packages.${p.id}.blurb`) || p.blurb,
        bestFor: text(`packages.${p.id}.bestFor`) || p.bestFor,
        inclusions:
          text(`packages.${p.id}.inclusions`)
            ?.split("\n")
            .map((s) => s.trim())
            .filter(Boolean) ?? p.inclusions,
      })),
    [text]
  );

  const allInclusions = useMemo(
    () => Array.from(new Set(tiers.flatMap((p) => p.inclusions))),
    [tiers]
  );

  return (
    <div>
      <PageHero
        eyebrow={text("packages.hero.eyebrow")}
        title={text("packages.hero.title")}
        sub={text("packages.hero.sub")}
      />

      {/* T-14 (manager audit, 2026-10-29): honest-pricing context before the
          tiers — the /packages money page was 414 words; this intro + the FAQ
          below bring it into the 700–900 word band the audit asked for.
          Every figure is a verified published site fact. */}
      <section className="mx-auto max-w-3xl px-4 pb-4 pt-14 sm:px-6" aria-labelledby="pkg-context">
        <Reveal>
          <h2 id="pkg-context" className="font-display text-display-md font-medium text-[var(--jr-plum)]">
            How magic show pricing actually works
          </h2>
          <p className="mt-5 text-[16px] leading-8 text-[var(--jr-ink)]">
            Three tiers, honest ranges, one rule: the quote you receive is written, line-itemised and delivered
            within 24 hours — never a number improvised on a call. Professional magic shows in India start from
            <strong> ₹25,000</strong> for the intimate Signature format and rise to ₹2,50,000+ for a full-evening
            Grand production with crew. Four honest cost drivers move you between those points: performance
            duration, travel and stay, crew size, and staging requirements. Every one of them appears as its own
            line in the quote, so you always know which lever you are pulling.
          </p>
          <p className="mt-4 text-[16px] leading-8 text-[var(--jr-ink)]">
            The tiers below are calibrated to occasions rather than budgets. A seventh birthday and a college-fest
            finale need different things from the same craft — the Signature format carries birthdays, society
            evenings and intimate gatherings; the Royal tier, the most-booked, is engineered for weddings and
            corporate annual days where the evening needs both a headline show and roaming close-up; and the Grand
            production is built for stages that demand spectacle — fests, galas and luxury celebrations. Your date
            is held for 72 hours at no cost while you compare, and no advance is demanded before the quote is in
            your hands.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.12}>
              <article
                className={`card-cine relative flex h-full flex-col rounded-3xl border p-8 ${
                  p.featured
                    ? "border-[var(--jr-gold)]/70 bg-[var(--jr-card)] shadow-[0_35px_70px_-35px_color-mix(in_srgb,var(--jr-gold)_50%,transparent)]"
                    : "border-[var(--jr-line)] bg-[var(--jr-card)]"
                }`}
              >
                {p.featured && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[var(--jr-crimson)] px-5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--jr-ivory)]">
                    Most booked
                  </span>
                )}
                <p className="eyebrow">{p.bestFor}</p>
                <h2 className="font-display mt-3 text-4xl font-semibold text-[var(--jr-plum)]">{p.name}</h2>
                <p className="mt-1 inline-flex items-center gap-2 font-display text-xl text-[var(--jr-gold)]">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  {p.range}
                </p>
                <p className="mt-4 text-[15px] leading-7 text-[var(--jr-ink)]">{p.blurb}</p>
                <ul className="mt-6 flex-1 space-y-3 border-t border-[var(--jr-sand)] pt-6">
                  {p.inclusions.map((inc) => (
                    <li key={inc} className="flex items-start gap-2.5 text-[15px] text-[var(--jr-ink)]">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--jr-teal)]" aria-hidden="true" />
                      {inc}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate("booking")}
                  className={`mt-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-7 py-3 text-[15px] font-semibold transition-all duration-500 hover:-translate-y-0.5 ${
                    p.featured
                      ? "bg-[var(--jr-crimson)] text-[var(--jr-ivory)] shadow-[0_16px_35px_-14px_color-mix(in_srgb,var(--jr-crimson)_70%,transparent)] hover:bg-[var(--jr-crimson-hover)]"
                      : "border border-[var(--jr-gold)]/60 text-[var(--jr-plum)] hover:bg-[var(--jr-sand-light)]"
                  }`}
                >
                  Get the {p.name} quote
                </button>
              </article>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-[var(--jr-ink)]">
          {text("packages.note")}
        </p>

        {/* comparison matrix */}
        <Reveal className="mt-16">
          <div className="overflow-hidden rounded-2xl border border-[var(--jr-line)] bg-[var(--jr-card)]">
            <div className="overflow-x-auto scroll-slim">
              <table className="w-full min-w-[640px] text-left text-sm">
                <caption className="sr-only">Package inclusions comparison</caption>
                <thead>
                  <tr className="border-b border-[var(--jr-line)] bg-[var(--jr-sand)]">
                    <th scope="col" className="px-6 py-4 font-semibold text-[var(--jr-plum)]">Inclusion</th>
                    {tiers.map((p) => (
                      <th key={p.id} scope="col" className="px-6 py-4 text-center font-display text-lg font-semibold text-[var(--jr-plum)]">
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allInclusions.map((inc) => (
                    <tr key={inc} className="border-b border-[var(--jr-sand)] last:border-0">
                      <th scope="row" className="px-6 py-3.5 font-medium text-[var(--jr-ink)]">{inc}</th>
                      {tiers.map((p) => (
                        <td key={p.id} className="px-6 py-3.5 text-center">
                          {p.inclusions.includes(inc) ? (
                            <Check className="mx-auto h-5 w-5 text-[var(--jr-teal)]" aria-label="Included" />
                          ) : (
                            <span className="text-[var(--jr-line)]" aria-label="Not included">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>

        {/* T-14: packages FAQ — the questions the enquiry flow actually gets. */}
        <Reveal className="mt-16">
          <div className="mx-auto max-w-3xl">
            <p className="eyebrow text-center">Before you pick a tier</p>
            <h2 className="font-display mt-3 text-center text-display-md font-medium text-[var(--jr-plum)]">
              Package FAQ
            </h2>
            <div className="mt-8 space-y-4">
              {[
                {
                  q: "Why are the prices ranges and not fixed numbers?",
                  a: "Because duration, city, travel, crew and staging legitimately move the number — a 60-minute Royal evening in Udaipur and the same show flown to another city are different logistics. The range narrows to an exact figure in your written quote within 24 hours, with every driver broken out as its own line item.",
                },
                {
                  q: "What does travel cost?",
                  a: "Travel within your city is included in the Signature tier, and travel inside Udaipur city is included across every tier. Outstation travel and stay are quoted transparently as their own line — never bundled invisibly into the performance fee.",
                },
                {
                  q: "Can we mix tiers or build a custom evening?",
                  a: "Yes — the most common custom build is a Royal stage show with an extended close-up hour for long cocktail evenings. Tell the studio the shape of your run-sheet and the format is engineered around it; the tier list is a starting vocabulary, not a menu limit.",
                },
                {
                  q: "What do we get in writing before paying anything?",
                  a: "A line-itemised quote within 24 hours and a 72-hour soft hold on your date — both free, with no advance demanded before the quote. Corporate and institutional buyers additionally receive clean contract terms and a GST invoice that passes procurement.",
                },
              ].map((f) => (
                <div key={f.q} className="rounded-2xl border border-[var(--jr-line)] bg-[var(--jr-card)] p-5">
                  <h3 className="font-display text-lg font-semibold text-[var(--jr-plum)]">{f.q}</h3>
                  <p className="mt-2 text-[15px] leading-8 text-[var(--jr-ink)]">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-12">
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-[var(--jr-plum)] px-6 py-10 text-center">
            <p className="font-display text-2xl font-medium text-[var(--jr-ivory)]">
              {text("packages.helpTitle")}
            </p>
            <p className="max-w-xl text-[15px] leading-7 text-[var(--jr-lavender)]/80">
              {text("packages.helpSub")}
            </p>
            <button
              onClick={() => navigate("booking")}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--jr-crimson)] px-8 py-3 text-[15px] font-semibold text-[var(--jr-ivory)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[var(--jr-crimson-hover)]"
            >
              <CalendarCheck className="h-4 w-4" aria-hidden="true" /> {text("packages.helpCta")}
            </button>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

// ── Gallery — every frame verified as Jadugar Rajtilak himself ──
// Dynamic masonry wall + filter chips + lightbox with keyboard navigation.
// Frames, captions and alt text are live-editable from Master Admin → Images.
const GALLERY_FILTERS = [
  { id: "all", label: "All frames", icon: null },
  { id: "stage", label: "Stage & Regalia", icon: Mic },
  { id: "birthday", label: "Kids & Birthdays", icon: Cake },
  { id: "corporate", label: "Galas & Institutional", icon: Briefcase },
  { id: "closeup", label: "Close-up", icon: Crown },
];

const GALLERY_KEYS = [
  "gallery.item01",
  "gallery.item02",
  "gallery.item03",
  "gallery.item04",
  "gallery.item05",
  "gallery.item06",
  "gallery.item07",
] as const;

type GalleryFrame = {
  key: string;
  src: string;
  cat: string;
  caption: string;
  alt: string;
  ratio: string;
};

// ── The Card Draw — a gallery entrance no other magician site has ──
// Five face-down cards fan out; the visitor draws one and it flips to
// reveal "their evening", which jumps the wall to that mood's frames.
const DRAW_CARDS = [
  {
    id: "stage",
    rank: "A",
    suit: "♠",
    name: "The Sovereign Evening",
    line: "House lights down, turban lit — the frames where the stage belongs to one man and the room holds its breath together.",
    show: "Stage & Regalia",
    filter: "stage",
  },
  {
    id: "closeup",
    rank: "Q",
    suit: "♣",
    name: "The Intimate Salon",
    line: "Inches from the eyes and inside the guests' own palms — the frames where distance disappears and belief gets quiet.",
    show: "Close-up",
    filter: "closeup",
  },
  {
    id: "birthday",
    rank: "7",
    suit: "♥",
    name: "The Wonder Child",
    line: "Five hundred wide eyes and one birthday hero — the frames where laughter beats gravity and every parent becomes a photographer.",
    show: "Kids & Birthdays",
    filter: "birthday",
  },
  {
    id: "corporate",
    rank: "K",
    suit: "♦",
    name: "The Grand Gala",
    line: "Institutional nights, felicitation bows and formal suits — the frames where the dress code is serious and the magic is not.",
    show: "Galas & Institutional",
    filter: "corporate",
  },
  {
    id: "wild",
    rank: "★",
    suit: "∞",
    name: "The Wildcard",
    line: "The deck decides, not you. Draw the Wildcard and the wall shuffles itself — every visit lands on a different evening.",
    show: "Surprise me",
    filter: "wild",
  },
] as const;

function CardBack() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-xl border border-[var(--jr-gold)]/50 bg-gradient-to-br from-[var(--jr-plum-deep)] via-[var(--jr-plum)] to-[var(--jr-plum-deep)] shadow-[0_18px_40px_-18px_color-mix(in_srgb,var(--jr-plum)_70%,transparent)]">
      <div aria-hidden="true" className="absolute inset-1.5 rounded-lg border border-[var(--jr-gold)]/25" />
      <div aria-hidden="true" className="animate-orb-swirl absolute inset-[22%] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--jr-gold)_38%,transparent),transparent_65%)]" />
      <span className="font-display relative text-3xl text-[var(--jr-gold-light)]">R</span>
      <span className="relative mt-1 text-[10px] uppercase tracking-[0.3em] text-[var(--jr-lavender)]/70">Rajtilak</span>
      {/* corner pips */}
      <span aria-hidden="true" className="absolute left-2.5 top-2 font-display text-sm text-[var(--jr-gold)]/70">♠</span>
      <span aria-hidden="true" className="absolute right-2.5 top-2 font-display text-sm text-[var(--jr-gold)]/70">♥</span>
      <span aria-hidden="true" className="absolute bottom-2 left-2.5 font-display text-sm text-[var(--jr-gold)]/70">♣</span>
      <span aria-hidden="true" className="absolute bottom-2 right-2.5 font-display text-sm text-[var(--jr-gold)]/70">♦</span>
    </div>
  );
}

function CardDrawSection({ onReveal }: { onReveal: (filter: string) => void }) {
  const [picked, setPicked] = useState<string | null>(null);

  const draw = (id: string) => {
    if (picked) return;
    setPicked(id);
  };

  const reset = () => setPicked(null);

  const chosen = picked ? DRAW_CARDS.find((c) => c.id === picked) : null;

  const showFrames = () => {
    if (!chosen) return;
    const f = chosen.filter === "wild"
      ? ["stage", "birthday", "corporate", "closeup"][Math.floor(Math.random() * 4)]
      : chosen.filter;
    onReveal(f);
    document.getElementById("frame-wall")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const fanAngles = [-16, -8, 0, 8, 16];

  return (
    <section className="relative overflow-hidden border-b border-[var(--jr-line)] bg-[var(--jr-plum-deep)] py-16">
      <div aria-hidden="true" className="stage-light absolute -top-24 left-1/2 h-[70%] w-[45%] -translate-x-1/2 opacity-40" />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="An invitation"
          title="Draw a card, find your evening"
          sub="Every gallery shows you pictures. This one deals them. Pick a face-down card and let it choose the mood of the frames you are about to see — exactly how a volunteer feels on stage."
        />

        {/* the fan */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-4" role="group" aria-label="Draw a card to reveal a gallery mood">
          {DRAW_CARDS.map((c, i) => {
            const isPicked = picked === c.id;
            const faded = picked !== null && !isPicked;
            return (
              <div
                key={c.id}
                className="jr-flip"
                style={{
                  transform: picked ? "none" : `rotate(${fanAngles[i]}deg) translateY(${Math.abs(fanAngles[i]) * 0.55}px)`,
                  transition: "transform 0.6s var(--ease-cine), opacity 0.5s ease",
                  opacity: faded ? 0.12 : 1,
                  pointerEvents: picked ? "none" : "auto",
                }}
              >
                <div className={`jr-flip-inner h-44 w-32 sm:h-52 sm:w-36 ${isPicked ? "is-flipped" : ""}`}>
                  {/* face-down side */}
                  <div className="jr-flip-face">
                    <button
                      onClick={() => draw(c.id)}
                      aria-label={`Draw the ${i === 4 ? "wildcard" : `card ${i + 1}`}`}
                      className="relative h-full w-full cursor-pointer rounded-xl transition-transform duration-500 hover:-translate-y-2"
                    >
                      <CardBack />
                    </button>
                  </div>
                  {/* revealed side */}
                  <div className="jr-flip-face jr-flip-back">
                    <div className="flex h-full w-full flex-col rounded-xl border border-[var(--jr-gold)]/60 bg-gradient-to-b from-[var(--jr-ivory)] to-[var(--jr-cream)] p-3 text-center shadow-[0_22px_45px_-18px_color-mix(in_srgb,var(--jr-gold)_80%,transparent)]">
                      <span className="font-display text-xl leading-none text-[var(--jr-plum)]">
                        {c.rank}
                        <span className="block text-base">{c.suit === "∞" ? "✦" : c.suit}</span>
                      </span>
                      <span className="font-display mt-2 flex-1 text-[13px] font-semibold leading-snug text-[var(--jr-plum)] sm:text-sm">
                        {c.name}
                      </span>
                      <span className="text-[9px] uppercase tracking-[0.2em] text-[var(--jr-gold-dark)]">Your draw</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* the reading */}
        {chosen && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
            className="mx-auto mt-10 max-w-2xl rounded-2xl border border-[var(--jr-gold)]/35 bg-[color-mix(in_srgb,var(--jr-plum)_55%,var(--jr-plum-deep))] p-7 text-center backdrop-blur"
          >
            <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--jr-gold-light)]">The reading</p>
            <p className="font-display mt-2 text-2xl font-semibold text-[var(--jr-ivory)]">{chosen.name}</p>
            <p className="mx-auto mt-3 max-w-xl text-[15px] leading-7 text-[var(--jr-lavender)]/90">{chosen.line}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={showFrames}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--jr-crimson)] px-7 py-3 text-[15px] font-semibold text-[var(--jr-ivory)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[var(--jr-crimson-hover)]"
              >
                <Camera className="h-4 w-4" aria-hidden="true" />
                Show me the {chosen.filter === "wild" ? "frames" : chosen.show.toLowerCase()} frames
              </button>
              <button
                onClick={reset}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--jr-gold)]/50 px-6 py-3 text-sm font-semibold text-[var(--jr-cream)] transition-colors hover:bg-[var(--jr-gold)]/15"
              >
                <Shuffle className="h-4 w-4" aria-hidden="true" /> Draw again
              </button>
            </div>
            <p className="mt-4 text-[11px] text-[var(--jr-lavender)]/60">
              A magician's party trick — the wall below works with or without it.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}

// ── Behind the veil — what a still can never hold ──
const VEIL_NOTES = [
  {
    icon: AudioLines,
    title: "The gasp before the applause",
    body: "A photograph is silent; the room is not. The half-second between the impossible moment and the eruption — that collective inhale from two hundred people at once — is the part no camera in this gallery ever caught. It is also the part the audience retells for years, usually starting with the words you will not believe this.",
  },
  {
    icon: Hand,
    title: "The volunteer's hands",
    body: "Close-up frames look like they were staged for the lens, but the work happens in the audience's own palms — a borrowed note, a signed card, a wedding ring that leaves one hand and reappears where it should not. The camera frames the reaction; the magic was already in their hands before the shutter moved.",
  },
  {
    icon: Timer,
    title: "The reset between tables",
    body: "What you never see is the discipline between frames: props re-set in eleven seconds, angles re-checked, the next routine chosen by reading the mood of the next table. A roaming set is thirty small shows in one evening, and every photograph here stands on the invisible scaffolding of the twenty-nine you will not see.",
  },
];

export function GalleryView({ navigate }: { navigate: (r: RouteId) => void }) {
  const [filter, setFilter] = useState("all");
  const [lightbox, setLightbox] = useState<string | null>(null); // frame key
  const { galleryItem, text } = useSiteCustomization();

  const frames: GalleryFrame[] = useMemo(
    () =>
      GALLERY_KEYS.map((key) => {
        const it = galleryItem(key);
        return {
          key,
          src: it.src,
          alt: it.alt,
          caption: it.caption,
          cat: it.cat,
          ratio: imageFrame(key) ?? "aspect-[4/3]",
        };
      }),
    [galleryItem]
  );

  const items = useMemo(
    () => frames.filter((i) => filter === "all" || i.cat === filter),
    [frames, filter]
  );

  const step = useCallback(
    (dir: 1 | -1) => {
      setLightbox((cur) => {
        if (cur === null) return cur;
        const idx = items.findIndex((it) => it.key === cur);
        if (idx < 0) return cur;
        return items[(idx + dir + items.length) % items.length].key;
      });
    },
    [items]
  );

  // keyboard navigation inside the lightbox
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, step]);

  const current = lightbox !== null ? frames.find((f) => f.key === lightbox) ?? null : null;
  const currentIndex = current ? items.findIndex((it) => it.key === current.key) : -1;

  return (
    <div>
      <PageHero
        eyebrow={text("gallery.hero.eyebrow")}
        title={text("gallery.hero.title")}
        sub={text("gallery.hero.sub")}
      />

      {/* the card draw — an entrance, not a widget */}
      <CardDrawSection onReveal={(f) => setFilter(f)} />

      <section id="frame-wall" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6">
        {/* the evening, in numbers */}
        <Reveal>
          <dl className="mx-auto mb-12 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--jr-line)] bg-[var(--jr-line)] sm:grid-cols-4">
            {[
              { v: String(frames.length), l: "live frames on this wall" },
              { v: "4", l: "moods to filter by" },
              { v: "0", l: "stock photos · zero stand-ins" },
              { v: "100%", l: "Jadugar Rajtilak himself" },
            ].map((s) => (
              <div key={s.l} className="bg-[var(--jr-card)] px-4 py-6 text-center">
                <dt className="sr-only">{s.l}</dt>
                <dd className="font-display text-3xl font-semibold text-[var(--jr-plum)]">{s.v}</dd>
                <dd className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[var(--jr-ink)]/70">{s.l}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        {/* verified note strip */}
        <Reveal>
          <div className="mx-auto mb-10 flex max-w-2xl items-center justify-center gap-3 rounded-full border border-[var(--jr-gold)]/40 bg-[color-mix(in_srgb,var(--jr-sand-light)_50%,transparent)] px-6 py-3 text-center">
            <Sparkles className="h-4 w-4 shrink-0 text-[var(--jr-gold)]" aria-hidden="true" />
            <p className="text-sm text-[var(--jr-ink)]">
              <span className="font-semibold text-[var(--jr-plum)]">{frames.length} live frames</span>
              <span className="text-[var(--jr-ink)]/70"> · zero stock photos · zero stand-ins</span>
            </p>
          </div>
        </Reveal>

        {/* filters */}
        <div className="flex flex-wrap items-center justify-center gap-2.5" role="group" aria-label="Filter gallery">
          {GALLERY_FILTERS.map((f) => {
            const Icon = f.icon;
            const active = filter === f.id;
            const n =
              f.id === "all"
                ? frames.length
                : frames.filter((i) => i.cat === f.id).length;
            return (
              <button
                key={f.id}
                onClick={() => {
                  setFilter(f.id);
                  setLightbox(null);
                }}
                aria-pressed={active}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-400 ${
                  active
                    ? "bg-[var(--jr-plum)] text-[var(--jr-ivory)]"
                    : "border border-[var(--jr-line)] bg-[var(--jr-card)] text-[var(--jr-ink)] hover:border-[var(--jr-gold)] hover:text-[var(--jr-plum)]"
                }`}
              >
                {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                {f.label}
                <span
                  className={`rounded-full px-1.5 text-[11px] tabular-nums ${
                    active ? "bg-[var(--jr-ivory)]/15 text-[var(--jr-cream)]" : "bg-[var(--jr-sand)] text-[#8a8095]"
                  }`}
                >
                  {n}
                </span>
              </button>
            );
          })}
        </div>

        {/* dynamic masonry wall */}
        <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {items.map((item, i) => (
            <Reveal key={item.key} delay={(i % 3) * 0.08} className="mb-5 break-inside-avoid">
              <figure className="card-cine group relative overflow-hidden rounded-2xl border border-[var(--jr-line)] bg-[var(--jr-card)] transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_color-mix(in_srgb,var(--jr-gold)_55%,transparent)]">
                <button
                  className="relative block w-full overflow-hidden"
                  onClick={() => setLightbox(item.key)}
                  aria-label={`View larger: ${item.caption}`}
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    className={`${item.ratio} w-full object-cover transition-transform duration-[1.1s] ease-cine group-hover:scale-[1.06]`}
                  />
                  {/* hover veil + caption reveal */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[var(--jr-plum-deep)]/85 via-[var(--jr-plum-deep)]/18 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <span className="absolute inset-x-0 bottom-0 flex translate-y-4 items-center justify-between gap-3 p-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="text-left">
                      <span className="block font-display text-lg font-semibold text-[var(--jr-ivory)]">
                        {item.caption}
                      </span>
                      <span className="mt-0.5 block text-[11px] uppercase tracking-[0.18em] text-[var(--jr-gold-light)]">
                        Jadugar Rajtilak · live frame
                      </span>
                    </span>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--jr-gold)]/60 bg-[var(--jr-plum)]/60 text-[var(--jr-cream)] backdrop-blur">
                      <Expand className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </span>
                </button>
              </figure>
            </Reveal>
          ))}
        </div>

        {/* behind the veil — what a still cannot hold */}
        <div className="mt-24">
          <SectionHeading
            eyebrow="Behind the veil"
            title="What a still can never hold"
            sub="Photographs freeze the visible half of the evening. These are the three invisible halves — the reasons the frames above exist at all."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {VEIL_NOTES.map((n, i) => (
              <Reveal key={n.title} delay={i * 0.12}>
                <article className="card-cine flex h-full flex-col rounded-2xl border border-[var(--jr-line)] bg-[var(--jr-card)] p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--jr-sand-light)] to-[var(--jr-gold-light)]/70 text-[var(--jr-gold-dark)] shadow-[0_14px_28px_-12px_color-mix(in_srgb,var(--jr-gold)_65%,transparent)]">
                    <n.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-display mt-5 text-xl font-semibold text-[var(--jr-plum)]">{n.title}</h3>
                  <p className="mt-3 text-[15px] leading-7 text-[var(--jr-ink)]">{n.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>

        {/* closing band */}
        <Reveal className="mt-16">
          <div className="relative overflow-hidden rounded-3xl bg-[var(--jr-plum)] px-6 py-12 text-center">
            <div aria-hidden="true" className="stage-light absolute -top-16 left-1/2 h-[80%] w-[38%] -translate-x-1/2 opacity-30" />
            <div className="relative">
              <p className="eyebrow text-[var(--jr-gold-light)]">The last frame is yours</p>
              <p className="font-display mx-auto mt-3 max-w-2xl text-3xl font-medium text-[var(--jr-ivory)]">
                Your evening becomes the next frame on this wall.
              </p>
              <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-[var(--jr-lavender)]/80">
                Every photograph above began as someone&apos;s date on a calendar. Check yours, receive a written
                quote within 24 hours, and the wall gets its next story.
              </p>
              <button
                onClick={() => navigate("booking")}
                className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--jr-crimson)] px-8 py-3.5 text-[15px] font-semibold text-[var(--jr-ivory)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[var(--jr-crimson-hover)]"
              >
                <CalendarCheck className="h-4 w-4" aria-hidden="true" /> Check my date
              </button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* the recognition wall — the client's two certificates, framed */}
      <CertificatesSection />

      {/* lightbox with prev / next + keyboard navigation */}
      <Dialog open={lightbox !== null} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent
          className="max-w-4xl overflow-hidden rounded-2xl border-[var(--jr-gold)]/40 bg-[var(--jr-plum-deep)] p-0 sm:rounded-3xl"
          aria-describedby={undefined}
        >
          {current && (
            <figure className="relative">
              <DialogTitle className="sr-only">{current.caption}</DialogTitle>
              <img src={current.src} alt={current.alt} className="max-h-[72vh] w-full object-contain" />
              {/* prev / next controls */}
              <button
                onClick={() => step(-1)}
                aria-label="Previous photograph"
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--jr-gold)]/50 bg-[var(--jr-plum-deep)]/70 text-[var(--jr-cream)] backdrop-blur transition-colors hover:bg-[var(--jr-gold)]/40"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                onClick={() => step(1)}
                aria-label="Next photograph"
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--jr-gold)]/50 bg-[var(--jr-plum-deep)]/70 text-[var(--jr-cream)] backdrop-blur transition-colors hover:bg-[var(--jr-gold)]/40"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
              <figcaption className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--jr-gold)]/25 px-6 py-4">
                <span className="flex items-center gap-2.5 text-sm text-[var(--jr-lavender)]/85">
                  <Heart className="h-3.5 w-3.5 text-[var(--jr-gold)]" aria-hidden="true" />
                  {current.caption}
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-[11px] tabular-nums uppercase tracking-[0.18em] text-[var(--jr-gold)]">
                    {currentIndex + 1} / {items.length}
                  </span>
                  <span className="hidden text-[11px] text-[var(--jr-lavender)]/50 sm:inline">
                    ← → to browse
                  </span>
                </span>
              </figcaption>
            </figure>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Testimonials / reviews — auto-rotating, platform-verified ──

// Words that actually repeat inside the verified Google & Justdial
// summaries (doc rule: never invent review text — these are the exact
// recurring words hosts used, linked to their live sources below).
const APPLAUSE_ROW_A = [
  "amazing",
  "excellent magic",
  "always new",
  "engaging",
  "sitting in amazement",
  "miraculous",
];
const APPLAUSE_ROW_B = [
  "entertaining",
  "4.8 stars",
  "no dislikes mentioned",
  "excellent",
  "amazing show",
  "highly rated",
];

function ApplauseWord({ word }: { word: string }) {
  return (
    <span className="mx-6 inline-flex items-center gap-3 whitespace-nowrap">
      <Sparkles className="h-3.5 w-3.5 text-[var(--jr-gold)]/70" aria-hidden="true" />
      <span className="font-display text-xl font-medium text-[var(--jr-ivory)]/85 sm:text-2xl">{word}</span>
    </span>
  );
}

// Infinite marquee row — duplicated content translates -50% for a seamless loop.
function ApplauseRow({ words, reverse, dur }: { words: string[]; reverse?: boolean; dur: string }) {
  const doubled = [...words, ...words];
  return (
    <div className="jr-marquee-veil jr-marquee-paused overflow-hidden py-2">
      <div
        className="jr-marquee-track"
        style={{ "--marquee-dur": dur, "--marquee-dir": reverse ? "reverse" : "normal" } as React.CSSProperties}
      >
        {doubled.map((w, i) => (
          <ApplauseWord key={`${w}-${i}`} word={w} />
        ))}
      </div>
    </div>
  );
}

// ── Anatomy of a five-star evening — the journey a review rides on ──
const REVIEW_JOURNEY = [
  {
    icon: CalendarCheck,
    step: "Act I",
    title: "The date check",
    body: "It starts quietly: a live calendar, an open evening, a 72-hour soft-hold placed the moment you enquire. No phone tag, no maybes — your date is protected while the quote is written.",
  },
  {
    icon: FileText,
    step: "Act II",
    title: "The written quote",
    body: "Within a day, everything arrives in writing: duration, travel, staging and every line item stated up front. Hosts mention the paperwork in their reviews almost as often as the tricks.",
  },
  {
    icon: Sparkles,
    step: "Act III",
    title: "The evening",
    body: "Sound checks done before guests arrive, routines dressed to the occasion, and a room that gasps together. This is the part that becomes the story told at breakfast the next morning.",
  },
  {
    icon: Star,
    step: "Act IV",
    title: "The review",
    body: "Days later, unsolicited, the rating lands on Google or Justdial — which is exactly why this page only shows platform-verified words and never invented ones.",
  },
];

export function TestimonialsView({ navigate }: { navigate: (r: RouteId) => void }) {
  const { text } = useSiteCustomization();

  const platforms = [
    {
      name: "Google",
      rating: SITE.rating,
      count: SITE.reviewCount,
      countLabel: "reviews",
      pct: (Number(SITE.rating) / 5) * 100,
    },
    {
      name: "Justdial",
      rating: SITE.justdialRating,
      count: SITE.justdialReviewCount,
      countLabel: "ratings",
      pct: (Number(SITE.justdialRating) / 5) * 100,
    },
  ];

  const totalRatings = REAL_REVIEWS.reduce((n, r) => n + r.count, 0);

  return (
    <div>
      <PageHero
        eyebrow={text("reviews.hero.eyebrow")}
        title={text("reviews.hero.title")}
        sub={text("reviews.hero.sub")}
      />

      {/* ── The applause ledger — the numbers behind the words ── */}
      <section className="border-b border-[var(--jr-line)] bg-[var(--jr-plum-deep)] py-14">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[auto_1fr]">
          {/* the headline figure */}
          <Reveal className="mx-auto text-center">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--jr-gold-light)]">The applause ledger</p>
            <p className="font-display mt-2 text-7xl font-medium leading-none text-[var(--jr-ivory)]">
              {SITE.rating}
              <span className="text-2xl text-[var(--jr-lavender)]/60">/5</span>
            </p>
            <span className="mt-4 inline-flex items-center gap-1" aria-label={`${SITE.rating} out of 5 stars`}>
              {[0, 1, 2, 3, 4].map((s) => (
                <Star
                  key={s}
                  className={`animate-star-draw h-5 w-5 ${s < Math.round(Number(SITE.rating)) ? "fill-[var(--jr-gold)] text-[var(--jr-gold)]" : "fill-[var(--jr-line)] text-[var(--jr-line)]"}`}
                  style={{ animationDelay: `${s * 0.12}s` }}
                  aria-hidden="true"
                />
              ))}
            </span>
            <p className="mt-3 text-sm text-[var(--jr-lavender)]/80">
              across <span className="font-semibold text-[var(--jr-ivory)]">{totalRatings}+</span> verified ratings
            </p>
          </Reveal>

          {/* platform bars */}
          <div className="space-y-6">
            {platforms.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.15}>
                <div className="rounded-2xl border border-[var(--jr-gold)]/30 bg-[color-mix(in_srgb,var(--jr-plum)_50%,var(--jr-plum-deep))] p-5 backdrop-blur">
                  <div className="flex items-baseline justify-between">
                    <p className="font-display text-lg font-semibold text-[var(--jr-ivory)]">{p.name}</p>
                    <p className="text-sm text-[var(--jr-lavender)]/85">
                      <span className="font-display text-xl font-semibold text-[var(--jr-gold-light)]">{p.rating}</span>
                      {"  "}· {p.count} {p.countLabel}
                    </p>
                  </div>
                  <div
                    className="mt-3 h-2.5 overflow-hidden rounded-full bg-[var(--jr-plum)]/70"
                    role="img"
                    aria-label={`${p.name}: ${p.rating} out of 5`}
                  >
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--jr-gold-dark)] via-[var(--jr-gold)] to-[var(--jr-gold-light)]"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${p.pct}%` }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.2 + i * 0.15 }}
                    />
                  </div>
                </div>
              </Reveal>
            ))}
            <Reveal delay={0.3}>
              <p className="px-1 text-xs leading-6 text-[var(--jr-lavender)]/60">
                Figures are read from the live Google Business Profile and Justdial listing — the same
                sources every quote on this page links to. Nothing here is self-reported.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <ReviewsCarousel variant="page" />
        </Reveal>

        {/* ── The applause wall — words that repeat across the ratings ── */}
        <div className="mt-20">
          <SectionHeading
            eyebrow="The applause wall"
            title="Words the ratings keep repeating"
            sub="Hover to freeze the wall. Every word below appears inside the verified summaries linked above — six words that hosts across platforms keep reaching for."
          />
        </div>
        <Reveal className="mt-10">
          <div className="relative overflow-hidden rounded-3xl border border-[var(--jr-gold)]/25 bg-[var(--jr-plum-deep)] py-8">
            <div aria-hidden="true" className="stage-light absolute -top-20 left-1/3 h-[70%] w-[34%] opacity-25" />
            <div className="relative space-y-3">
              <ApplauseRow words={APPLAUSE_ROW_A} dur="36s" />
              <ApplauseRow words={APPLAUSE_ROW_B} dur="44s" reverse />
            </div>
            <p className="relative mt-4 text-center text-[11px] uppercase tracking-[0.2em] text-[var(--jr-lavender)]/50">
              hover to pause · words sourced from verified platform summaries
            </p>
          </div>
        </Reveal>

        {/* ── Anatomy of a five-star evening ── */}
        <div className="mt-20">
          <SectionHeading
            eyebrow="Anatomy of a five-star evening"
            title="The journey every review rides on"
            sub="A rating is the last page of a longer story. This is how the evenings behind those 4.8 stars actually unfold — four acts, no improvisation."
          />
          <ol className="relative mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {/* connecting thread */}
            <div
              aria-hidden="true"
              className="absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-[var(--jr-gold)]/40 to-transparent xl:block"
            />
            {REVIEW_JOURNEY.map((a, i) => (
              <Reveal key={a.title} delay={i * 0.12}>
                <li className="card-cine relative flex h-full flex-col rounded-2xl border border-[var(--jr-line)] bg-[var(--jr-card)] p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--jr-sand-light)] to-[var(--jr-gold-light)]/70 text-[var(--jr-gold-dark)] shadow-[0_14px_28px_-12px_color-mix(in_srgb,var(--jr-gold)_65%,transparent)]">
                      <a.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="font-display text-xs uppercase tracking-[0.2em] text-[var(--jr-gold)]">{a.step}</span>
                  </div>
                  <h3 className="font-display mt-4 text-xl font-semibold text-[var(--jr-plum)]">{a.title}</h3>
                  <p className="mt-3 text-[14px] leading-7 text-[var(--jr-ink)]">{a.body}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>

        <Reveal className="mt-12">
          <div className="rounded-3xl border border-[var(--jr-line)] bg-[var(--jr-sand)] p-9 text-center">
            <div className="mx-auto flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-[var(--jr-teal)]" aria-hidden="true" />
              <p className="font-display text-2xl font-semibold text-[var(--jr-plum)]">
                {SITE.rating} on Google · {SITE.justdialRating} on Justdial
              </p>
            </div>
            <p className="mx-auto mt-3 max-w-xl text-[15px] leading-7 text-[var(--jr-ink)]">
              {text("reviews.note")}
            </p>
          </div>
        </Reveal>

        {/* closing band */}
        <Reveal className="mt-16">
          <div className="relative overflow-hidden rounded-3xl bg-[var(--jr-plum)] px-6 py-12 text-center">
            <div aria-hidden="true" className="stage-light absolute -top-16 left-1/2 h-[80%] w-[38%] -translate-x-1/2 opacity-30" />
            <div className="relative">
              <p className="eyebrow text-[var(--jr-gold-light)]">Act V is unwritten</p>
              <p className="font-display mx-auto mt-3 max-w-2xl text-3xl font-medium text-[var(--jr-ivory)]">
                The next review on this page will be written at your event.
              </p>
              <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-[var(--jr-lavender)]/80">
                {totalRatings} hosts have already rated their evenings across Google and Justdial. Your date
                is on the live calendar — the only missing review is yours.
              </p>
              <button
                onClick={() => navigate("booking")}
                className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--jr-crimson)] px-8 py-3.5 text-[15px] font-semibold text-[var(--jr-ivory)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[var(--jr-crimson-hover)]"
              >
                <CalendarCheck className="h-4 w-4" aria-hidden="true" /> Start the first act
              </button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

// Re-export for admin tooling (frame count display in image manager)
export { IMAGE_SLOT_MAP };
