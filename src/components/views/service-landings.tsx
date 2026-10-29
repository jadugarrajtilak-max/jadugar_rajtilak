"use client";

import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CheckCircle2,
  Clock,
  FileText,
  MessageCircle,
  Mic2,
  Music4,
  Phone,
  Receipt,
  Sparkles,
  Star,
  Users,
  Wand2,
} from "lucide-react";
import { Reveal } from "@/components/home/sections";
import { SITE, type RouteId } from "@/lib/content";
import { routeToPath } from "@/lib/routes";
import { trackCta } from "@/lib/router";

// ─────────────────────────────────────────────────────────────
// Dedicated service money pages (SEO audit T-13, roadmap R-18 /
// R-19 / R-20 / R-22 + O-01, 2026-10-29).
//
// The six show formats previously lived only as sections of
// /services — competitors rank with dedicated URLs for the
// commercial keywords. These pages give each keyword its own
// crawlable, canonical, 700+ word landing page with FAQ, honest
// pricing signal, internal links OUT (crawlable <a href>) and
// Service + Breadcrumb JSON-LD (stamped in site-shell).
//
// Content rule (same as /magician-in-udaipur): every claim is a
// verified site fact — 4.8★ / 181 Google reviews, 500+ shows,
// 12+ years, 40+ cities, I.B.M. 2021 international 2nd place,
// From-₹25,000 published pricing. No invented venues, reviews
// or awards.
// ─────────────────────────────────────────────────────────────

type LandingConfig = {
  eyebrow: string;
  h1: string;
  heroSub: string;
  whatsappText: string;
  proof: { v: string; l: string }[];
  introHeading: string;
  introParas: string[];
  formats: {
    id: string;
    tagline: string;
    name: string;
    body: string;
    points: string[];
  }[];
  includesHeading: string;
  includesIntro: string;
  includes: { icon: "clock" | "rider" | "gst" | "sound" | "hold" | "quote"; title: string; body: string }[];
  pricingHeading: string;
  pricingBody: string;
  faqHeading: string;
  faqs: { q: string; a: string }[];
  relatedHeading: string;
  related: { label: string; route: RouteId }[];
};

// Shared scaffold — every money page follows the proven
// /magician-in-udaipur structure: keyword H1 hero, proof strip,
// intro copy, format sections, deliverables, honest pricing,
// FAQ and a link block of crawlable internal anchors.
function LandingView({ cfg, navigate }: { cfg: LandingConfig; navigate: (r: RouteId) => void }) {
  const goBooking = () => navigate("booking");
  const navHref = (e: React.MouseEvent<HTMLAnchorElement>, r: RouteId) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    navigate(r);
  };

  const INCLUDE_ICONS = {
    clock: Clock,
    rider: FileText,
    gst: Receipt,
    sound: Music4,
    hold: CalendarCheck,
    quote: BadgeCheck,
  } as const;

  return (
    <div>
      {/* ── Hero — the commercial keyword is the H1 ── */}
      <header className="relative overflow-hidden border-b border-[var(--jr-line)] bg-[var(--jr-sand)] pb-16 pt-32">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(70% 90% at 50% -20%, color-mix(in srgb, var(--jr-gold) 18%, transparent), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <p className="eyebrow">{cfg.eyebrow}</p>
          <h1 className="font-display mt-4 text-display-lg font-medium text-[var(--jr-plum)]">{cfg.h1}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-body-lg text-[var(--jr-ink)]">{cfg.heroSub}</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={goBooking}
              className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--jr-crimson)] px-8 py-3 text-[15px] font-semibold text-[var(--jr-ivory)] shadow-[0_18px_40px_-10px_color-mix(in_srgb,var(--jr-crimson)_85%,transparent)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[var(--jr-crimson-hover)]"
            >
              <CalendarCheck className="h-4 w-4" aria-hidden="true" /> Check Your Date
            </button>
            <a
              href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(cfg.whatsappText)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCta("whatsapp")}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--jr-gold)_70%,transparent)] bg-[color-mix(in_srgb,var(--jr-plum)_40%,transparent)] px-8 py-3 text-[15px] font-semibold text-[var(--jr-cream)] backdrop-blur-md transition-all duration-500 hover:-translate-y-0.5 hover:border-[var(--jr-gold)]"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp the Studio
            </a>
          </div>
        </div>
      </header>

      {/* ── Proof strip ── */}
      <section className="border-b border-[var(--jr-line)] bg-[var(--jr-card)] py-6" aria-label="Credentials">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-4 text-center sm:grid-cols-4 sm:px-6">
          {cfg.proof.map((s) => (
            <div key={s.l}>
              <p className="font-display text-2xl font-semibold text-[var(--jr-plum)]">{s.v}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--jr-gold)]">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Intro copy ── */}
      <section className="py-16" aria-labelledby="landing-intro">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal>
            <h2 id="landing-intro" className="font-display text-display-md font-medium text-[var(--jr-plum)]">
              {cfg.introHeading}
            </h2>
            {cfg.introParas.map((p) => (
              <p key={p.slice(0, 40)} className="mt-5 text-[16px] leading-8 text-[var(--jr-ink)]">
                {p}
              </p>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── Format sections ── */}
      {cfg.formats.map((s, i) => (
        <section
          key={s.id}
          aria-labelledby={`fmt-${s.id}`}
          className={`scroll-mt-24 border-t border-[var(--jr-line)] py-16 ${i % 2 === 1 ? "bg-[var(--jr-sand)]" : ""}`}
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <div className="grid items-start gap-10 lg:grid-cols-2">
                <div>
                  <p className="eyebrow">{s.tagline}</p>
                  <h2 id={`fmt-${s.id}`} className="font-display mt-3 text-display-md font-medium text-[var(--jr-plum)]">
                    {s.name}
                  </h2>
                  <p className="mt-5 text-[16px] leading-8 text-[var(--jr-ink)]">{s.body}</p>
                  <button
                    onClick={goBooking}
                    className="mt-6 inline-flex items-center gap-2 text-[15px] font-semibold text-[var(--jr-crimson)] transition-colors hover:brightness-110"
                  >
                    Check your date <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <ul className="space-y-4">
                  {s.points.map((p) => (
                    <li key={p} className="flex items-start gap-3 rounded-xl border border-[var(--jr-line)] bg-[var(--jr-card)] p-4">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--jr-teal)]" aria-hidden="true" />
                      <span className="text-[15px] leading-7 text-[var(--jr-ink)]">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>
      ))}

      {/* ── What's included ── */}
      <section className="border-t border-[var(--jr-line)] bg-[var(--jr-sand)] py-16" aria-labelledby="landing-includes">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="eyebrow text-center">Every booking ships with</p>
            <h2 id="landing-includes" className="font-display mt-3 text-center text-display-md font-medium text-[var(--jr-plum)]">
              {cfg.includesHeading}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-[16px] leading-8 text-[var(--jr-ink)]">{cfg.includesIntro}</p>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cfg.includes.map((inc) => {
                const Icon = INCLUDE_ICONS[inc.icon];
                return (
                  <div key={inc.title} className="rounded-2xl border border-[var(--jr-line)] bg-[var(--jr-card)] p-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--jr-sand-light)] text-[var(--jr-gold)]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="font-display mt-4 text-lg font-semibold text-[var(--jr-plum)]">{inc.title}</h3>
                    <p className="mt-2 text-[15px] leading-7 text-[var(--jr-ink)]">{inc.body}</p>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Pricing signal ── */}
      <section className="border-t border-[var(--jr-line)] py-16" aria-labelledby="landing-pricing">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <Reveal>
            <p className="eyebrow">Honest pricing</p>
            <h2 id="landing-pricing" className="font-display mt-3 text-display-md font-medium text-[var(--jr-plum)]">
              {cfg.pricingHeading}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-8 text-[var(--jr-ink)]">{cfg.pricingBody}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={goBooking}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--jr-plum)] px-8 py-3 text-[15px] font-semibold text-[var(--jr-ivory)] transition-all duration-500 hover:-translate-y-0.5"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" /> Get a written quote
              </button>
              <button
                onClick={() => navigate("packages")}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--jr-line)] px-8 py-3 text-[15px] font-semibold text-[var(--jr-plum)] transition-all duration-500 hover:-translate-y-0.5 hover:border-[var(--jr-gold)]"
              >
                <Wand2 className="h-4 w-4" aria-hidden="true" /> Compare packages
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-t border-[var(--jr-line)] bg-[var(--jr-sand)] py-16" aria-labelledby="landing-faq">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal>
            <p className="eyebrow text-center">Before you book</p>
            <h2 id="landing-faq" className="font-display mt-3 text-center text-display-md font-medium text-[var(--jr-plum)]">
              {cfg.faqHeading}
            </h2>
            <div className="mt-8 space-y-4">
              {cfg.faqs.map((f) => (
                <div key={f.q} className="rounded-2xl border border-[var(--jr-line)] bg-[var(--jr-card)] p-5">
                  <h3 className="flex items-start gap-2 font-display text-lg font-semibold text-[var(--jr-plum)]">
                    <Star className="mt-1 h-4 w-4 shrink-0 text-[var(--jr-gold)]" aria-hidden="true" /> {f.q}
                  </h3>
                  <p className="mt-3 text-[15px] leading-8 text-[var(--jr-ink)]">{f.a}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Internal links OUT — real crawlable anchors ── */}
      <section className="border-t border-[var(--jr-line)] py-14" aria-labelledby="landing-related">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 id="landing-related" className="font-display text-2xl font-medium text-[var(--jr-plum)]">
            {cfg.relatedHeading}
          </h2>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {cfg.related.map((r) => (
              <a
                key={r.route}
                href={routeToPath(r.route)}
                onClick={(e) => navHref(e, r.route)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--jr-line)] bg-[var(--jr-card)] px-6 py-2.5 text-[15px] font-semibold text-[var(--jr-plum)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--jr-gold)]"
              >
                {r.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="border-t border-[var(--jr-line)] py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <Reveal>
            <h2 className="font-display text-display-md font-medium text-[var(--jr-plum)]">Your date is one message away</h2>
            <p className="mx-auto mt-4 max-w-xl text-[16px] leading-8 text-[var(--jr-ink)]">
              A 72-hour soft hold costs nothing and keeps your evening off the calendar while you decide — the written,
              line-itemised quote arrives within 24 hours.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={goBooking}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--jr-crimson)] px-8 py-3 text-[15px] font-semibold text-[var(--jr-ivory)] shadow-[0_18px_40px_-10px_color-mix(in_srgb,var(--jr-crimson)_85%,transparent)] transition-all duration-500 hover:-translate-y-0.5"
              >
                <CalendarCheck className="h-4 w-4" aria-hidden="true" /> Check Date
              </button>
              <a
                href={`tel:${SITE.phoneRaw}`}
                onClick={() => trackCta("call")}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--jr-line)] px-8 py-3 text-[15px] font-semibold text-[var(--jr-plum)] transition-all duration-500 hover:-translate-y-0.5 hover:border-[var(--jr-gold)]"
              >
                <Phone className="h-4 w-4" aria-hidden="true" /> {SITE.phoneDisplay}
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// PAGE 1 — /services/wedding-magician ("wedding magician india")
// ═════════════════════════════════════════════════════════════
const WEDDING_CFG: LandingConfig = {
  eyebrow: "Sangeet · Mehendi · Cocktail · Reception",
  h1: "Wedding Magician in India",
  heroSub:
    "Jadugar Rajtilak stages wedding magic across India — close-up sets through the sangeet and cocktails, a reception finale every phone camera catches, and a repertoire dressed for mixed generations. 4.8★ from 181 Google reviews, 500+ shows, 12+ years on stage.",
  whatsappText: "Namaste! We are planning our wedding — could a wedding magician work on our date?",
  proof: [
    { v: "4.8★", l: "181 Google reviews" },
    { v: "500+", l: "Wedding & event shows" },
    { v: "40+", l: "Cities performed in" },
    { v: "12+", l: "Years on stage" },
  ],
  introHeading: "The one act both families agree on",
  introParas: [
    "An Indian wedding runs three days and brings together generations who otherwise share nothing on an itinerary — grandparents who want to sit, cousins who want to dance, and a hundred guests who have seen every dance troupe and DJ setup the circuit has to offer. A wedding magician slots into exactly those gaps: roaming close-up magic during the mehendi and cocktail hours when the room is loose, and a 20-to-45-minute stage act on the sangeet or reception night that gives every family group one moment they will retell.",
    "The repertoire is engineered for mixed-age family crowds — nothing blue, nothing dangerous, nothing that embarrasses a volunteer in front of their in-laws. That discipline is why hosts book a wedding magician after the DJ and photographer are locked: the magic is the unpredictable part of the evening, and it has to be safe for every hierarchy in the room while still fooling the engineers and the uncles who 'know how it's done'.",
    "Based in Udaipur — India's wedding capital — and touring pan-India across 40+ cities, the studio plans around your wedding timeline, not the other way around: the act length is set by where it sits in the run-sheet, and a technical visit with your planner or hotel team can be arranged before the date.",
  ],
  formats: [
    {
      id: "sangeet",
      tagline: "The roaming warm-up",
      name: "Sangeet & Mehendi Close-Up Magic",
      body:
        "While the sangeet rehearsals run on stage, the magician works the tables and mehendi circles: borrowed rings, signed cards and predictions that happen a metre from the guests' eyes. Roaming sets turn waiting time into the most photographed half-hour of the afternoon — and every aunt who sees a trick up close becomes the show's marketing team for the rest of the wedding.",
      points: [
        "60–120 minute roaming sets across mehendi, high-tea and cocktails",
        "Magic that happens in guests' hands — rings, watches, borrowed notes",
        "Zero staging needs: no lights, no sound, no venue coordination",
      ],
    },
    {
      id: "cocktail",
      tagline: "Between the vows and the party",
      name: "Cocktail-Hour Strolling Magic",
      body:
        "The cocktail hour is the hardest 90 minutes to programme — music is low, the bar is loud, and guests who know four people are looking for a reason to mingle. A strolling magician moves through that room in 8-minute loops, giving each cluster a shared moment that breaks the ice better than any emcee game. It is also the segment wedding planners most often re-book, because it fills the exact gap their run-sheet never solves.",
      points: [
        "8-minute loop format designed for standing, mingling crowds",
        "Material calibrated for adult audiences — sophisticated, not silly",
        "Fits venue constraints: poolside, terrace, lawn or banquet foyer",
      ],
    },
    {
      id: "reception",
      tagline: "The finale on the big night",
      name: "Reception & Sangeet Night Stage Show",
      body:
        "A 20-to-45-minute stage act built for the main night: illusions scaled to the hall, the couple woven into the finale, and a closing sequence engineered to land on every phone camera in the room. The act coordinates sound and cues with your DJ and anchor in advance, so the handover is seamless and the host gets the credit for the evening's most talked-about segment.",
      points: [
        "20–45 minute headline act with sound & light cues pre-planned with your DJ",
        "The couple stars in the closing illusion — scripted, never surprising",
        "Full-evening format combines stage show + roaming close-up across the wedding",
      ],
    },
  ],
  includesHeading: "What every wedding booking includes",
  includesIntro:
    "Weddings run on checklists, so the show ships like a vendor that understands them. Every booking carries the same professional scaffolding — the things planners and families only discover are missing when a cheaper act doesn't deliver them.",
  includes: [
    { icon: "clock", title: "Run-sheet-timed performance", body: "The act is planned against your wedding timeline — sangeet, mehendi, cocktail or reception — with start times agreed in writing, not improvised on the day." },
    { icon: "rider", title: "Written technical rider", body: "Sound, staging and lighting requirements documented in advance for the hotel or planner team, so the venue's AV crew is never surprised." },
    { icon: "gst", title: "GST invoice & contract", body: "A clean written contract with clear terms and a GST invoice — the paperwork finance teams and corporate families expect from a professional vendor." },
    { icon: "sound", title: "Self-contained birthday-stage kit", body: "For intimate gatherings and villa settings, the show arrives with its own sound — zero additional venue coordination needed." },
    { icon: "hold", title: "72-hour soft hold", body: "Your date is held for 72 hours while families compare quotes — no advance demanded before a written quote is in your hands." },
    { icon: "quote", title: "24-hour written quote", body: "Line-itemised pricing within 24 hours of the enquiry: duration, travel, crew and staging separated — never one opaque number." },
  ],
  pricingHeading: "Wedding magic show cost",
  pricingBody:
    "Wedding bookings start from ₹25,000 for an intimate close-up segment and range up to ₹2,50,000+ for a full-evening production with crew across multiple functions. Duration, travel, crew and staging are the four honest cost drivers — every quote is line-itemised so you can see exactly which lever moves the number.",
  faqHeading: "Wedding magician — FAQ",
  faqs: [
    {
      q: "How much does a wedding magician cost in India?",
      a: "Professional wedding magic starts from ₹25,000 for an intimate close-up segment and ranges to ₹2,50,000+ for a full-evening multi-function production with crew. Duration, city, travel and staging move the number — you receive a written, line-itemised quote within 24 hours so nothing is hidden.",
    },
    {
      q: "Which functions should the magic sit in?",
      a: "The two proven slots are roaming close-up through mehendi and cocktail hours, and a 20–45 minute stage act on the sangeet or reception night. A full-evening format combines both: the roaming sets warm the room across functions while the stage act gives the main night its headline moment.",
    },
    {
      q: "Is the act safe for family audiences?",
      a: "Yes — the wedding repertoire is engineered for mixed generations: no fire, no dangerous apparatus, no adult-only material, and volunteers are never embarrassed in front of their families. The same discipline plays at corporate annual days, so the act is safe for every hierarchy in the room.",
    },
    {
      q: "Do you travel for destination weddings?",
      a: "Yes — the studio is based in Udaipur, India's destination-wedding capital, and tours pan-India across 40+ cities. Travel and stay are quoted transparently as their own line items, and a technical visit with the wedding planner or hotel can be arranged before the date.",
    },
  ],
  relatedHeading: "Plan the wedding entertainment",
  related: [
    { label: "Destination weddings in Udaipur", route: "destWedding" },
    { label: "Magician in Udaipur", route: "udaipur" },
    { label: "Compare packages", route: "packages" },
    { label: "Wedding entertainment ideas (Journal)", route: "blog" },
    { label: "Check your date", route: "booking" },
  ],
};

export function WeddingMagicianView({ navigate }: { navigate: (r: RouteId) => void }) {
  return <LandingView cfg={WEDDING_CFG} navigate={navigate} />;
}

// ═════════════════════════════════════════════════════════════
// PAGE 2 — /services/corporate-shows ("corporate magician india")
// ═════════════════════════════════════════════════════════════
const CORPORATE_CFG: LandingConfig = {
  eyebrow: "Annual Days · Dealer Meets · Award Nights",
  h1: "Corporate Magician for Events in India",
  heroSub:
    "Corporate magic shows that hold the room — brand-woven illusions, mentalism for dealer meets and a 45-minute annual-day format proven across India. GST invoicing, a written tech rider and clean contracts that pass procurement. 4.8★ from 181 Google reviews.",
  whatsappText: "Hello! We are planning our corporate event — what would a magic show for our team look like?",
  proof: [
    { v: "4.8★", l: "181 Google reviews" },
    { v: "500+", l: "Shows staged" },
    { v: "40+", l: "Cities performed in" },
    { v: "GST", l: "Invoicing & contracts" },
  ],
  introHeading: "The agenda item nobody checks their phone during",
  introParas: [
    "Corporate event teams book a magician for one measurable reason: the room stays off its phones. Annual days, dealer conferences, award nights and town halls are long, and every segment after lunch competes with email. A professional magic act is the one slot where 500 people watch the same thing at the same time — and mentalism, the mind-reading segment of the show, is specifically built for sceptical, senior, hard-to-impress audiences.",
    "The corporate format is run like a vendor that understands procurement: a written technical rider the AV team can plan around, GST invoicing, clean contract terms, and a show that can carry your brand — product reveals scripted into illusions, key messages woven through the mentalism, and leadership participation rehearsed in advance so no executive is surprised on stage.",
    "The 45-minute annual-day format has been staged across India in 40+ cities, from engineering-college auditoriums to five-star banquet halls. Content is calibrated clean: humour that is safe for every hierarchy in the room, no political material, nothing that puts a guest on the spot in front of their reporting line.",
  ],
  formats: [
    {
      id: "annual",
      tagline: "The proven 45-minute format",
      name: "Annual Day & Award Night Show",
      body:
        "The flagship 45-minute stage show: grand illusions scaled to the hall, audience participation with volunteers from every department, and a closing sequence the internal comms team can film for the recap. The format has been refined across annual days pan-India — tight enough to sit between the CFO speech and the dinner, big enough to be the evening's talking point.",
      points: [
        "45-minute headline act timed to sit inside the evening run-sheet",
        "Volunteer moments engineered to flatter, never embarrass, employees",
        "Filming-friendly finale — a vertical-video moment for the company page",
      ],
    },
    {
      id: "dealer",
      tagline: "Sales conferences & partner meets",
      name: "Dealer Meet & Product Launch Mentalism",
      body:
        "Mentalism for commercial rooms: demonstrations that feel impossible while your product data and key messages are woven through the act — the number your channel partners compete to guess, the launch date predicted in advance, the USP revealed inside the illusion. It is the one format where the entertainment and the business objective are the same thing.",
      points: [
        "Product reveals and launch dates scripted into the illusions",
        "Key sales messages reinforced inside the mentalism demonstrations",
        "Runs in conference lighting — no blackout requirements",
      ],
    },
    {
      id: "townhall",
      tagline: "Offsites & town halls",
      name: "Town Hall & Offsite Stage Magic",
      body:
        "For leadership offsites and town halls, a 30-to-60-minute act that plays to teams who already know each other — crowd work, mind reading and illusions built on the company's own year. The material adapts to the room's seniority: the same show that plays an engineering all-hands plays a board-level private evening, with the participation moments re-scripted for the audience.",
      points: [
        "30–60 minute flexible length for agenda gaps",
        "Crowd work calibrated to room seniority",
        "Optional leadership participation rehearsed in advance — never sprung",
      ],
    },
  ],
  includesHeading: "What every corporate booking includes",
  includesIntro:
    "Corporate buyers have procurement rules, so the act ships with the paperwork a professional vendor needs to clear them. These are standard in every booking — not premium add-ons discovered later.",
  includes: [
    { icon: "rider", title: "Written technical rider", body: "Sound, staging, lighting and backstage requirements documented for the hotel or AV team well before load-in — the crew is never guessing." },
    { icon: "gst", title: "GST invoice & clean contract", body: "A written contract with clear cancellation terms and a proper GST invoice — the two documents finance and legal teams ask for first." },
    { icon: "clock", title: "Run-sheet coordination", body: "Start time, cues and handovers agreed with your event agency in writing; the act is rehearsed into the evening's flow, not dropped into it." },
    { icon: "sound", title: "Self-sufficient production", body: "Where the venue cannot provide adequate sound, the show arrives with its own system — one less vendor coordination call for your team." },
    { icon: "hold", title: "72-hour soft hold", body: "Your date is held for 72 hours while approvals move through the chain — no advance demanded before the written quote." },
    { icon: "quote", title: "24-hour written quote", body: "Line-itemised pricing within 24 hours: performance, travel, crew and staging separated for the budget sheet, never one opaque number." },
  ],
  pricingHeading: "Corporate magic show cost",
  pricingBody:
    "Corporate bookings start from ₹35,000 for a compact 30-minute town-hall set and range to ₹2,50,000+ for a full-evening annual-day production with crew and staging. Performance duration, city, travel and crew are the honest cost drivers — every quote is line-itemised for your budget sheet within 24 hours.",
  faqHeading: "Corporate shows — FAQ",
  faqs: [
    {
      q: "How much does a corporate magician cost in India?",
      a: "Corporate shows start from ₹35,000 for a compact 30-minute set and range to ₹2,50,000+ for a full-evening production with crew. Duration, city and staging move the number; every quote arrives line-itemised within 24 hours so procurement sees exactly what they are paying for.",
    },
    {
      q: "Can the act feature our brand or product?",
      a: "Yes — brand-woven routines are a core part of the corporate format: product reveals, launch dates and key sales messages scripted into the illusions and mentalism. Brand integration is planned on a call before the script is locked, and leadership participation is rehearsed in advance.",
    },
    {
      q: "What does the venue's AV team need to know?",
      a: "A written technical rider covers it: sound, staging, lighting and backstage needs, delivered to the venue or event agency before load-in. Where a venue cannot provide adequate sound, the show arrives self-sufficient with its own system.",
    },
    {
      q: "Is the content safe for mixed-hierarchy audiences?",
      a: "Yes — corporate material is calibrated clean for every hierarchy in the room: no adult-only content, no political humour, and volunteer moments engineered so employees and executives are flattered, never embarrassed, in front of their reporting lines.",
    },
  ],
  relatedHeading: "Explore corporate entertainment",
  related: [
    { label: "Mentalism & mind reading", route: "svcVirtual" },
    { label: "College & fest shows", route: "svcCollege" },
    { label: "Compare packages", route: "packages" },
    { label: "Corporate event guides (Journal)", route: "blog" },
    { label: "Check your date", route: "booking" },
  ],
};

export function CorporateShowsView({ navigate }: { navigate: (r: RouteId) => void }) {
  return <LandingView cfg={CORPORATE_CFG} navigate={navigate} />;
}

// ═════════════════════════════════════════════════════════════
// PAGE 3 — /services/birthday-kids ("birthday party magician")
// ═════════════════════════════════════════════════════════════
const BIRTHDAY_CFG: LandingConfig = {
  eyebrow: "Ages 4–12 · Kids · Teens · Society Gatherings",
  h1: "Birthday Party Magician — Udaipur & India",
  heroSub:
    "Age-calibrated birthday magic shows (ages 4–12): the golden window between snacks and cake, the birthday child starring in the finale, and a take-home magic trick for every child. Own sound, zero venue setup, travel inside Udaipur city included. 4.8★ from 181 Google reviews.",
  whatsappText: "Namaste! We are planning our child's birthday party — is our date free for a magic show?",
  proof: [
    { v: "4.8★", l: "181 Google reviews" },
    { v: "500+", l: "Shows staged" },
    { v: "4–12", l: "Age-calibrated formats" },
    { v: "₹25k", l: "Starting price (intimate)" },
  ],
  introHeading: "Forty-five minutes of pure, safe chaos",
  introParas: [
    "A birthday magic show lives or dies on one thing: the age of the room. A four-year-old audience and an eleven-year-old audience are different species — the younger one needs colour, noise and a rabbit-out-of-a-hat pace; the older one needs to be fooled, and will absolutely tell you if they worked it out. Every birthday format here is age-calibrated: the same 45-minute slot plays completely differently at seven than it does at eleven.",
    "The structure is engineered for the golden window between snacks and cake — the 45 minutes when sugar levels are peaking and parents most need the room held. The birthday child becomes the star of the finale, every trick lands where a phone camera can catch it, and every child leaves with a take-home magic trick, which quietly makes yours the party the class talks about on Monday.",
    "For parents, the practical part matters most: the show arrives with its own sound system, needs no venue setup beyond a wall to stand against, and travel inside Udaipur city is included in the quote. Society-club evenings and community gatherings get the same treatment — a calibrated, high-energy format that respects the venue and the neighbours.",
  ],
  formats: [
    {
      id: "ages47",
      tagline: "The first magic shows (ages 4–7)",
      name: "Early-Birthday Magic (Ages 4–7)",
      body:
        "Colour-changing silks, appearing paper doves, and a pace built for the shortest attention spans in the room. Nothing is dark, nothing is scary, and the birthday child is on stage for the finale — the rabbit appears, the room screams, and the photo every parent wants lands itself. Volunteers are guided gently; four-year-olds get to say the magic words, not perform the trick.",
      points: [
        "No darkness, no fire, no frightening moments — ages 4–7 calibrated",
        "The birthday child stars in the finale with guided, gentle participation",
        "Pace tuned for short attention spans — a trick every 90 seconds",
      ],
    },
    {
      id: "ages812",
      tagline: "For the skeptics (ages 8–12)",
      name: "Big-Kid Birthday Magic (Ages 8–12)",
      body:
        "The age when children decide magic is for little kids — and the age when being genuinely fooled matters most. This format leans into card work, predictions and mind reading, the material that makes an eleven-year-old's eyes go wide and their theories collapse. The birthday child still gets the finale; the difference is the room now applauds because they were actually fooled, not because they were told to.",
      points: [
        "Card, prediction and mind-reading material that genuinely fools this age",
        "The birthday child as the star volunteer of an impossible finale",
        "Every child leaves with a take-home magic trick to learn and perform",
      ],
    },
    {
      id: "society",
      tagline: "Society & community gatherings",
      name: "Society & Community Magic Evenings",
      body:
        "Housing-society event nights, community centre evenings and school annual functions run on mixed-age crowds — toddlers to grandparents in one hall. This format stitches the kids' show with grown-up close-up segments: a stage act for the young audience, then roaming table magic for the adults while the children chase each other around the chairs. One booking, both generations entertained.",
      points: [
        "Stage act for the kids followed by roaming close-up for the adults",
        "Repeatable in batches for large society gatherings",
        "Own sound system — zero setup demands on the society committee",
      ],
    },
  ],
  includesHeading: "What every birthday booking includes",
  includesIntro:
    "Parents planning a birthday have exactly 47 things to coordinate. The show deliberately removes itself from that list — everything below arrives with the performance as standard, not as add-ons.",
  includes: [
    { icon: "sound", title: "Own sound system", body: "The show arrives with its own sound — no venue coordination, no dependence on the banquet's AV, no setup time charged to your evening." },
    { icon: "clock", title: "The golden-window slot", body: "A 45-minute show engineered for the gap between snacks and cake — the moment parents most need the room held and photographers most need the reactions." },
    { icon: "hold", title: "72-hour soft hold", body: "Your date is held for 72 hours while you compare venues and caterers — no advance demanded before the written quote is in your hands." },
    { icon: "quote", title: "24-hour written quote", body: "Line-itemised pricing within 24 hours: performance, travel and add-ons separated, so the birthday budget stays transparent." },
    { icon: "rider", title: "Zero venue demands", body: "No lights, no stage, no blackout — the birthday format needs a wall and a power point, and respects venues that other acts cannot." },
    { icon: "gst", title: "GST invoice available", body: "For corporate and society bookings that need the paperwork, a clean GST invoice and written terms ship as standard." },
  ],
  pricingHeading: "Birthday magic show cost",
  pricingBody:
    "Birthday shows start from ₹25,000 for the intimate 45-minute format — travel inside Udaipur city included — and scale with guest count, repeat batches for large gatherings and outstation travel. Every enquiry receives a written, line-itemised quote within 24 hours; the starting figure comes straight from the published cost guide.",
  faqHeading: "Birthday party magician — FAQ",
  faqs: [
    {
      q: "How much does a birthday party magician cost?",
      a: "The intimate 45-minute birthday format starts from ₹25,000, with travel inside Udaipur city included in the quote. Guest count, repeat batches for large gatherings and outstation travel move the number — every quote is written and line-itemised within 24 hours.",
    },
    {
      q: "What age group does the show suit?",
      a: "The core birthday format is calibrated for ages 4–12: the 4–7 show runs on colour, pace and gentle participation, while the 8–12 format leans into card work and mind reading that genuinely fools that age. Society and community evenings mix both with adult close-up segments.",
    },
    {
      q: "What does the venue need to provide?",
      a: "Nothing beyond a wall to perform against and a power point — the show arrives with its own sound system and needs no stage, lights or blackout. That simplicity is why the format plays living rooms, banquet halls, society lawns and school auditoriums equally well.",
    },
    {
      q: "How long is the show and when should it run?",
      a: "The birthday show runs 45 minutes — the golden window between snacks and cake when sugar levels peak and parents need the room held. For larger gatherings the format is repeatable in batches, and society evenings combine the stage act with roaming close-up.",
    },
  ],
  relatedHeading: "Plan the birthday party",
  related: [
    { label: "Magician in Udaipur", route: "udaipur" },
    { label: "Birthday cost guide (Journal)", route: "blog" },
    { label: "Compare packages", route: "packages" },
    { label: "Kids' party run-sheet (Journal)", route: "blog" },
    { label: "Check your date", route: "booking" },
  ],
};

export function BirthdayKidsView({ navigate }: { navigate: (r: RouteId) => void }) {
  return <LandingView cfg={BIRTHDAY_CFG} navigate={navigate} />;
}

// ═════════════════════════════════════════════════════════════
// PAGE 4 — /services/college-stage ("college fest magician")
// ═════════════════════════════════════════════════════════════
const COLLEGE_CFG: LandingConfig = {
  eyebrow: "Fest Headliners · Annual Days · Youth Fests",
  h1: "College Fest Magician & Illusion Headliner",
  heroSub:
    "Big-stage illusion shows built for 500–5,000 seat auditoriums: crowd work that plays to students, illusions scaled to the fest mainstage, and a vertical-video finale your fest page can post on Monday morning. 4.8★ from 181 Google reviews, 500+ shows, 12+ years on stage.",
  whatsappText: "Hello! Our college fest is looking for a magic/illusion headliner — is our date available?",
  proof: [
    { v: "4.8★", l: "181 Google reviews" },
    { v: "500+", l: "Shows staged" },
    { v: "500–5,000", l: "Seat auditoriums" },
    { v: "I.B.M.", l: "Intl. 2nd place 2021" },
  ],
  introHeading: "The fest-night act students actually stay for",
  introParas: [
    "College fest line-ups are crowded with bands and DJs — and the slot that trends on the fest page the next morning is increasingly the illusion act. A fest magician brings what a music act cannot: audience members becoming the show, volunteers from the crowd doing the impossible in front of their batchmates, and a finale engineered to be filmed vertically and posted horizontally across every student's story.",
    "The college format is genuinely big-stage: illusions scaled for 500-to-5,000-seat auditoriums, sight lines planned for the back row, and material calibrated for the toughest audience in entertainment — students, who have seen every YouTube magician and will fact-check your act in real time. The crowd work is fast, the humour is campus-safe but not sanitised, and the pace never drops below the energy of a fest crowd at full volume.",
    "Fest season runs November through February, and headline dates go early. The booking process is built for student committees: a written quote within 24 hours, a tech rider the auditorium crew can execute, and coordination with your fest core team on cues, run-sheet and the volunteer selection plan.",
  ],
  formats: [
    {
      id: "headliner",
      tagline: "The main night closer",
      name: "Fest Night Illusion Headliner",
      body:
        "The 45-to-60-minute headline set for the main night: large illusions with volunteers pulled from the crowd, mind-reading segments that play to the whole auditorium, and a closing sequence built to be captured on a hundred phones. The act is engineered for the back row as much as the front — sight lines, pacing and sound all planned for a full auditorium, not a banquet hall.",
      points: [
        "45–60 minute headline set with crowd volunteers from the audience",
        "Illusions scaled for 500–5,000 seat auditoriums and balcony sight lines",
        "A vertical-video finale designed for the fest page's Monday post",
      ],
    },
    {
      id: "annual",
      tagline: "College annual day",
      name: "College Annual Day Magic Show",
      body:
        "Annual days need an act that respects the institution as much as it plays to the students — clean, campus-safe material with the energy intact. The format runs 30-to-45 minutes, slots into the ceremony flow between the chief guest's speech and the prize distribution, and can involve faculty volunteers in moments that flatter them in front of the student body.",
      points: [
        "30–45 minute format timed into the annual-day run-sheet",
        "Campus-safe humour that keeps the student energy without faculty complaints",
        "Faculty volunteer moments engineered to flatter, never embarrass",
      ],
    },
    {
      id: "eng",
      tagline: "Engineering & departmental fests",
      name: "Tech-Fest & Departmental Shows",
      body:
        "Engineering campuses are the toughest rooms in the country — future engineers walk in determined to reverse-engineer every trick, and the show leans into it. The mentalism segments especially play to analytical audiences: predictions that survive scrutiny and demonstrations the campus's smartest minds cannot reconstruct. Departments get a format that fits smaller seminar halls as well as main auditoriums.",
      points: [
        "Mentalism built for analytical, sceptical, determined-to-catch-you audiences",
        "Scales from seminar halls to main auditoriums",
        "Fest-season (Nov–Feb) availability with early booking advised",
      ],
    },
  ],
  includesHeading: "What every college booking includes",
  includesIntro:
    "Student committees run on deadlines and approvals, so the booking ships like a vendor that has cleared a hundred of them. The paperwork and planning below are standard — not premium add-ons discovered after the advance.",
  includes: [
    { icon: "rider", title: "Auditorium-ready tech rider", body: "A written rider the auditorium or AV crew can execute: sound, staging, lighting and backstage needs delivered well before load-in day." },
    { icon: "clock", title: "Run-sheet coordination", body: "Cues, volunteer plans and handovers agreed with the fest core team in writing — the act drops into your run-sheet, never on top of it." },
    { icon: "gst", title: "Institutional paperwork", body: "GST invoice and clean contract terms for the college administration's finance process — the documents the accounts section asks for first." },
    { icon: "hold", title: "72-hour soft hold", body: "Fest dates are held for 72 hours while the committee's approvals move — no advance demanded before the written quote arrives." },
    { icon: "quote", title: "24-hour written quote", body: "Line-itemised pricing within 24 hours: performance, travel, crew and staging separated for the budget sheet your faculty advisor signs." },
    { icon: "sound", title: "Self-sufficient production", body: "Where the venue's sound cannot carry an auditorium show, the production arrives with its own system — one less vendor the committee must chase." },
  ],
  pricingHeading: "College fest magic show cost",
  pricingBody:
    "College bookings start from ₹50,000 for a 45-minute auditorium headline set and range upward with production scale, crew and travel. Fest-season dates (November–February) fill first — the written, line-itemised quote arrives within 24 hours so the committee can move through approvals while the date is held.",
  faqHeading: "College fest magician — FAQ",
  faqs: [
    {
      q: "How much does a college fest magician cost?",
      a: "A 45-minute auditorium headline set starts from ₹50,000, with production scale, crew size and travel moving the number upward for larger auditoriums. Fest-season dates fill first, so committees are advised to book early — a written, line-itemised quote arrives within 24 hours.",
    },
    {
      q: "What auditorium sizes does the act play?",
      a: "The act is engineered for 500-to-5,000-seat auditoriums — sight lines, pacing and sound planned for the back row and balcony, not just the front. Departmental and seminar-hall formats scale the same material down for smaller rooms.",
    },
    {
      q: "Can students be volunteers?",
      a: "Yes — crowd volunteers from the student body are the heart of the fest format, and the selection plan is coordinated with the core team in advance. Volunteer moments are engineered to make the student the hero in front of their batchmates, never the joke.",
    },
    {
      q: "Is the content appropriate for a college audience?",
      a: "Yes — campus-safe material with the energy intact: humour that plays to students without generating a faculty complaint, and the same clean-repertoire discipline that plays corporate annual days and family weddings. Faculty volunteers are flattered on stage, never embarrassed.",
    },
  ],
  relatedHeading: "Explore stage formats",
  related: [
    { label: "Corporate shows", route: "svcCorporate" },
    { label: "Wedding magician", route: "svcWedding" },
    { label: "College fest guides (Journal)", route: "blog" },
    { label: "Compare packages", route: "packages" },
    { label: "Check your date", route: "booking" },
  ],
};

export function CollegeStageView({ navigate }: { navigate: (r: RouteId) => void }) {
  return <LandingView cfg={COLLEGE_CFG} navigate={navigate} />;
}

// ═════════════════════════════════════════════════════════════
// PAGE 5 — /services/virtual-magic ("virtual magic show")
// ═════════════════════════════════════════════════════════════
const VIRTUAL_CFG: LandingConfig = {
  eyebrow: "Remote Teams · Online Events · Hybrid Shows",
  h1: "Virtual Magic Shows for Online Events",
  heroSub:
    "Camera-first virtual magic for remote teams and online events — Zoom-ready routines engineered for the small screen, tech checklists that just work, and honest formatting for 20–500 screens. 4.8★ from 181 Google reviews, 500+ shows, 12+ years on stage.",
  whatsappText: "Hello! We are planning a virtual event for our remote team — what does an online magic show look like?",
  proof: [
    { v: "4.8★", l: "181 Google reviews" },
    { v: "500+", l: "Shows staged" },
    { v: "20–500", l: "Screens per show" },
    { v: "12+", l: "Years on stage" },
  ],
  introHeading: "Magic built for the gallery view",
  introParas: [
    "A virtual magic show is a different craft from a stage act — the camera is the stage. Every routine in the virtual repertoire is engineered for the small screen: close-up material framed so the audience sees exactly what their own eyes would see at a live table, and interactive segments where the audience's own webcam becomes part of the trick. This is not a stage show pointed at a camera; it is magic designed for the medium.",
    "The interactive core is what separates virtual magic from a video: predictions written before the show that resolve against choices the audience makes live in the chat, mind-reading demonstrations that use participants' own names and answers, and moments where every viewer follows along with an object from their own desk. A remote team that has sat through a year of webinars suddenly finds something their webcam is actually part of.",
    "The format runs honestly from 20 to 500 screens — intimate team celebrations at one end, company-wide town halls at the other — with formats from a tight 20-minute energiser to a full 45-minute show. Every booking includes the technical checklist, a run-through with your platform admin, and delivery that respects corporate IT's security constraints.",
  ],
  formats: [
    {
      id: "team",
      tagline: "Remote team celebrations",
      name: "Remote Team Magic Session",
      body:
        "For distributed teams, a 20-to-45-minute session that plays the gallery view like a room: participants' names woven into predictions, their answers feeding the mind-reading, and routines the whole team follows with objects from their own desks. It is the format HR teams re-book for onboarding cohorts, project milestones and festival catch-ups — a shared moment that actually involves the audience.",
      points: [
        "20–45 minute formats from energiser to full show",
        "Interactive routines using participants' own names, answers and desk objects",
        "Chat-integrated moments — the audience's messages become part of the act",
      ],
    },
    {
      id: "townhall",
      tagline: "Company-wide online events",
      name: "Virtual Town Hall Show",
      body:
        "The company-wide format scales the interactivity to hundreds of screens: broadcast-quality framing, demonstrations that resolve against audience polls, and a pace tuned for attention spans that drop faster online than on stage. The show slots into an existing town-hall agenda as its energy peak — the segment between the quarterly numbers and the CEO's close that people stay logged in for.",
      points: [
        "Scales from 20 to 500 screens with the same interactivity",
        "Poll- and chat-integrated demonstrations for large audiences",
        "Slot-ready for existing town-hall agendas — no full-evening commitment",
      ],
    },
    {
      id: "hybrid",
      tagline: "Hybrid events & launches",
      name: "Hybrid Event Magic",
      body:
        "For hybrid launches and offsites where part of the room is live and part is remote, the act plays both audiences at once: stage material for the in-room crowd framed for camera, and virtual-native segments where the remote audience's responses drive the outcome. It is the hardest format in virtual entertainment and the one hybrid event teams most often cannot source elsewhere.",
      points: [
        "One act, both audiences — live room and remote screens simultaneously",
        "Remote-audience-driven outcomes the in-room crowd sees resolve live",
        "Technical run-through with your AV and platform admin included",
      ],
    },
  ],
  includesHeading: "What every virtual booking includes",
  includesIntro:
    "Virtual events fail on logistics, not content — so the booking ships with the technical scaffolding that makes the platform behave. Everything below is standard, and the tech check has kept every show on schedule.",
  includes: [
    { icon: "rider", title: "Platform tech checklist", body: "Zoom, Meet or Teams — a written checklist of settings, roles and breakout behaviour for your platform, delivered before the run-through." },
    { icon: "clock", title: "Live run-through", body: "A technical rehearsal with your admin or IT contact: framing, audio, screen-share handovers and the contingency plan for connection drops." },
    { icon: "gst", title: "GST invoice & contract", body: "Clean contract terms and a GST invoice — the paperwork a corporate L&D or events budget needs, with no advance demanded before the quote." },
    { icon: "sound", title: "Broadcast-grade audio", body: "Professional audio chain on the performer's side — the one component virtual events most often get wrong and the one that kills a magic show first." },
    { icon: "hold", title: "72-hour soft hold", body: "Your date is held for 72 hours while internal approvals move — no advance demanded before the written quote is in your inbox." },
    { icon: "quote", title: "24-hour written quote", body: "Line-itemised pricing within 24 hours: performance, platform support and rehearsal separated for the events budget." },
  ],
  pricingHeading: "Virtual magic show cost",
  pricingBody:
    "Virtual shows start from ₹20,000 for a 20-minute team energiser and scale with length, audience size and rehearsal needs — a full 45-minute company-wide show with run-through sits higher. Every quote is written, line-itemised and delivered within 24 hours, with timezone-flexible slots for distributed teams.",
  faqHeading: "Virtual magic shows — FAQ",
  faqs: [
    {
      q: "How much does a virtual magic show cost?",
      a: "Virtual shows start from ₹20,000 for a 20-minute team energiser; a full 45-minute company-wide show with a live run-through sits higher. Length, audience size and rehearsal needs move the number — every quote is line-itemised and delivered within 24 hours.",
    },
    {
      q: "Is the show actually interactive, or just watching tricks on video?",
      a: "Genuinely interactive — the audience's names, chat messages, poll answers and desk objects feed directly into the routines, and several segments resolve against choices the viewers make live. The webcam is part of the show, not a window onto it.",
    },
    {
      q: "Which platforms work?",
      a: "Zoom, Google Meet and Microsoft Teams all work — each has a written tech checklist covering settings, roles and the handovers magic needs, and a live run-through with your admin is included in every booking before the show date.",
    },
    {
      q: "We have a global team across timezones — can you accommodate that?",
      a: "Yes — virtual slots are timezone-flexible, with early-morning and late-evening India slots routinely booked for EU and US overlap. The format's honest range is 20 to 500 screens, from intimate team celebrations to company-wide town halls.",
    },
  ],
  relatedHeading: "Explore online & corporate formats",
  related: [
    { label: "Corporate shows", route: "svcCorporate" },
    { label: "Virtual event guides (Journal)", route: "blog" },
    { label: "Compare packages", route: "packages" },
    { label: "Check your date", route: "booking" },
  ],
};

export function VirtualMagicView({ navigate }: { navigate: (r: RouteId) => void }) {
  return <LandingView cfg={VIRTUAL_CFG} navigate={navigate} />;
}

// ═════════════════════════════════════════════════════════════
// PAGE 6 — /services/private-luxury ("private party magician")
// ═════════════════════════════════════════════════════════════
const PRIVATE_CFG: LandingConfig = {
  eyebrow: "Salon Evenings · Villa Parties · Intimate Celebrations",
  h1: "Private & Luxury Event Magician",
  heroSub:
    "Close-up and parlour magic for private celebrations — salon evenings, villa gatherings, anniversary dinners and destination celebrations. Discreet, polished, scaled to your guest list, with the professionalism luxury planners expect. 4.8★ from 181 Google reviews, 500+ shows.",
  whatsappText: "Namaste! We are planning a private celebration — could a close-up magician fit our guest list and date?",
  proof: [
    { v: "4.8★", l: "181 Google reviews" },
    { v: "500+", l: "Shows staged" },
    { v: "40+", l: "Cities performed in" },
    { v: "12+", l: "Years on stage" },
  ],
  introHeading: "Sophisticated magic for rooms that have seen everything",
  introParas: [
    "The hardest rooms in entertainment are small, wealthy and unimpressed: villa gatherings where guests have watched magicians in Vegas, salon evenings where the audience has been entertained professionally for decades, and milestone celebrations where the host's reputation rides on every element of the evening. These rooms do not want a birthday-party act at lower volume — they want material engineered to survive sophistication.",
    "The private format is close-up and parlour magic: impossible things happening in guests' own hands, mind-reading demonstrations that play to the smartest person in the room, and a parlour set for after dinner that needs no stage and no lights — just a turning of the chairs. The repertoire leans elegant over spectacular: the miracle happens two feet away, and the room's most cynical member is the one who examines it.",
    "Discretion is part of the service: no banners, no self-promotion into your event's story, no filming your guests without the host's permission. Luxury planners and villa teams get the same professional scaffolding corporate procurement does — a written rider, contractual cleanliness, and coordination with your event's flow rather than an imposition on it.",
  ],
  formats: [
    {
      id: "salon",
      tagline: "After-dinner parlour magic",
      name: "Salon & After-Dinner Parlour Set",
      body:
        "The classic format for intimate evenings: guests turn their chairs after dessert and a 20-to-30-minute parlour act plays in the round — no stage, no lights, no amplification. Mind reading, impossible objects and the kind of material that has kept salon magic the choice of Europe's private rooms for two centuries. It is the segment that gives a dinner party its story for the next decade.",
      points: [
        "20–30 minute parlour act in the round — no stage or technical setup",
        "Material engineered for adult, sophisticated, well-travelled audiences",
        "Plays in living rooms, villa lounges and private dining spaces equally",
      ],
    },
    {
      id: "roaming",
      tagline: "Cocktails & villa evenings",
      name: "Strolling Close-Up for Private Gatherings",
      body:
        "For cocktail hours, poolside evenings and villa weekends, roaming close-up magic in 8-minute loops through the guest clusters — borrowed watches, signed notes and predictions a metre from the eyes. The format's power is its scalability: it works identically for twelve guests around one fire pit or a hundred across a villa's terraces, and it never requires the room's attention all at once.",
      points: [
        "8-minute loop format that scales from 12 to 100+ guests",
        "Magic in guests' own hands — watches, rings, borrowed belongings",
        "No staging, no sound, no interruption of the evening's own rhythm",
      ],
    },
    {
      id: "milestone",
      tagline: "Anniversaries & milestone dinners",
      name: "Milestone Celebration Magic",
      body:
        "For anniversaries, retirement dinners and family milestones, the act is scripted around the guest of honour: their history woven into the material, a finale built on their own story, and the emotional beat the evening needs delivered inside the impossibility. It is the difference between entertainment booked for an event and a performance made for one.",
      points: [
        "Material scripted around the guest of honour's own story",
        "A finale built on their history — the emotional beat of the evening",
        "Discreet coordination with family or planners on sensitive elements",
      ],
    },
  ],
  includesHeading: "What every private booking includes",
  includesIntro:
    "Private and luxury events run on trust as much as budget, so the booking ships with the discretion and professionalism that trust is built on. Every element below is standard — the things luxury planners list as reasons for re-booking.",
  includes: [
    { icon: "rider", title: "Venue & planner coordination", body: "Written coordination with your villa team, hotel or planner on arrival, setup and the evening's flow — the act arrives as part of the event, not a delivery to it." },
    { icon: "clock", title: "Flow-timed performance", body: "Performance timing planned around your evening — after dinner, between courses or across cocktail hours — with start times agreed in writing with the host or planner." },
    { icon: "gst", title: "Clean contracts & invoicing", body: "Contractual cleanliness for family offices and corporate hosts: written terms, GST invoicing and payment terms that respect professional accounts." },
    { icon: "sound", title: "Zero footprint", body: "No banners, no signage, no footprint on your venue beyond the performance itself — the room looks the same before and after, minus one impossible memory." },
    { icon: "hold", title: "72-hour soft hold", body: "Your date is held for 72 hours while you finalise guest lists and venues — no advance demanded before the written quote is in your hands." },
    { icon: "quote", title: "24-hour written quote", body: "Line-itemised pricing within 24 hours: performance, travel and any custom scripting separated, so luxury budgets stay transparent." },
  ],
  pricingHeading: "Private event magic cost",
  pricingBody:
    "Private and luxury bookings start from ₹25,000 for an intimate strolling-close-up segment and scale with guest count, duration and custom scripting. Travel to villas and resorts is quoted transparently as its own line — every quote is written, line-itemised and delivered within 24 hours.",
  faqHeading: "Private party magician — FAQ",
  faqs: [
    {
      q: "How much does a private party magician cost?",
      a: "Private bookings start from ₹25,000 for an intimate strolling close-up segment and scale with guest count, duration and custom scripting for milestone celebrations. Travel to villas and resorts is quoted as its own transparent line item — the written, line-itemised quote arrives within 24 hours.",
    },
    {
      q: "What size of gathering does the format suit?",
      a: "The strolling format scales from twelve guests around one fire pit to a hundred across a villa's terraces, while the after-dinner parlour set plays best for rooms of ten to forty. The material is engineered for adult, sophisticated audiences — it survives the scrutiny that smaller, well-travelled rooms bring.",
    },
    {
      q: "Can the act be built around our guest of honour?",
      a: "Yes — milestone celebrations are scripted around the guest of honour: their history woven into the material and a finale built on their own story, coordinated discreetly with family or planners on any sensitive elements. The performance is made for the evening, not booked to it.",
    },
    {
      q: "Do you perform at destination villas and resorts?",
      a: "Yes — the studio is based in Udaipur, where the villa and destination-celebration market is strongest, and tours pan-India across 40+ cities. Travel and stay are quoted transparently, and coordination with the villa or resort team happens before the date.",
    },
  ],
  relatedHeading: "Explore private formats",
  related: [
    { label: "Destination weddings in Udaipur", route: "destWedding" },
    { label: "Wedding magician", route: "svcWedding" },
    { label: "Magician in Udaipur", route: "udaipur" },
    { label: "Compare packages", route: "packages" },
    { label: "Check your date", route: "booking" },
  ],
};

export function PrivateLuxuryView({ navigate }: { navigate: (r: RouteId) => void }) {
  return <LandingView cfg={PRIVATE_CFG} navigate={navigate} />;
}

// ═════════════════════════════════════════════════════════════
// PAGE 7 — /destination-wedding-magician-udaipur
// ("destination wedding magician udaipur" — audit O-01)
// ═════════════════════════════════════════════════════════════
const DEST_CFG: LandingConfig = {
  eyebrow: "Udaipur · Palace Weddings · The City of Lakes",
  h1: "Destination Wedding Magician in Udaipur",
  heroSub:
    "Udaipur's own magician for destination weddings — sangeet close-up sets, poolside roaming magic and a palace-stage finale, planned into the three-day timeline with your wedding planner. Based in Udaipur: no travel overhead, technical visits before the date. 4.8★ from 181 Google reviews.",
  whatsappText: "Namaste! We are planning a destination wedding in Udaipur — could the magic shows work across our three-day timeline?",
  proof: [
    { v: "4.8★", l: "181 Google reviews" },
    { v: "500+", l: "Shows staged" },
    { v: "Local", l: "Based in Udaipur" },
    { v: "I.B.M.", l: "Intl. 2nd place 2021" },
  ],
  introHeading: "India's wedding capital deserves a local magician",
  introParas: [
    "Udaipur hosts the country's most photographed destination weddings — three-day palace productions where every element is flown in from Delhi or Mumbai, with flights, stay and freight added to every quote. The one vendor that does not need to fly in is the magician: the studio is based here, in Shiv Colony, Bedla, fifteen minutes from the lake palaces. A Jaipur-scale stage show at Udaipur logistics — no travel overhead inside the city, a technical visit with your planner before the date, and a coordinator on call on the day itself.",
    "Destination weddings run on the three-day timeline: welcome brunch, mehendi by the afternoon pool, sangeet on the palace stage, and the reception to close. Magic slots into each of those windows with a different format — roaming close-up while the mehendi artists work, a stage act tuned to the sangeet's energy, and parlour magic for the villa nights the families actually remember. The act is planned into the timeline minute by minute with your wedding planner, not dropped into the gaps.",
    "Outstation guests are the audience a destination wedding magician is truly built for: international family members, friends flown in from four cities, and a room where English, Hindi and Gujarati all need to land. The repertoire is engineered for exactly that mixed, jet-lagged, dressed-up crowd — visual where language fails, warm where the room needs warming.",
  ],
  formats: [
    {
      id: "mehendi",
      tagline: "Day one · welcome & mehendi",
      name: "Mehendi & Welcome-Brunch Magic",
      body:
        "While the mehendi artists work and the welcome brunch stretches through the afternoon, roaming close-up magic moves between the family clusters — the hours a destination wedding most struggles to fill. Borrowed rings, signed cards and impossible moments a metre from guests' eyes, in sets long enough to feel generous and short enough to leave them wanting the sangeet.",
      points: [
        "Roaming sets through mehendi, high-tea and welcome brunch hours",
        "Visual, language-independent material for international and mixed guests",
        "No staging demands — the artists and the magic share the afternoon",
      ],
    },
    {
      id: "sangeet",
      tagline: "The palace-stage night",
      name: "Sangeet Night Stage Show",
      body:
        "The headline slot: a 20-to-45-minute stage act on the sangeet stage, scaled to the palace setting, with the couple woven into the finale and sound cues coordinated with the DJ and anchor. This is the night the phones come out — and the act's closing sequence is engineered so the clip your guests post is the one that makes the wedding look like the wedding.",
      points: [
        "20–45 minute palace-stage act with pre-planned sound & light cues",
        "The couple stars in the closing illusion — scripted, never surprising",
        "Runs with DJ and anchor coordination — a seamless handover, not a pause",
      ],
    },
    {
      id: "villa",
      tagline: "The nights the families remember",
      name: "Villa & Poolside Parlour Nights",
      body:
        "The quiet third format destination planners keep off the run-sheet: after the main nights, when the families gather at the villa with nowhere to be, a parlour set in the round — no stage, no lights, mind reading and impossible objects two feet from the eyes. These are the evenings the couple's parents talk about for years, and the format that most often gets added to the booking after the first is confirmed.",
      points: [
        "Parlour magic in the round — no stage, lights or technical setup",
        "Mind-reading material for the intimate, post-production family hours",
        "The format most often added to bookings after the sangeet is confirmed",
      ],
    },
  ],
  includesHeading: "What every destination booking includes",
  includesIntro:
    "Destination weddings are logistics marathons, and the magician is the one vendor that can arrive without adding to them. Being Udaipur-based changes what the booking includes — everything below is standard.",
  includes: [
    { icon: "clock", title: "Three-day timeline planning", body: "The act is planned into the full wedding timeline with your planner — mehendi, sangeet and villa formats matched to each window, start times in writing." },
    { icon: "rider", title: "Pre-date technical visit", body: "A technical visit to the venue with your planner or hotel team before the wedding — staging, sight lines and sound checked while there is still time to change them." },
    { icon: "sound", title: "Zero travel overhead (Udaipur)", body: "Being based in Shiv Colony, Bedla means no flights, stay or freight on Udaipur dates — the one line item every other outstation vendor carries, removed." },
    { icon: "gst", title: "Planner-clean paperwork", body: "GST invoicing and written contract terms that pass destination-wedding production houses and their account processes without friction." },
    { icon: "hold", title: "72-hour soft hold", body: "Wedding dates are held for 72 hours while families finalise venues and vendors — no advance demanded before the written quote is in your hands." },
    { icon: "quote", title: "24-hour written quote", body: "Line-itemised pricing within 24 hours: each format, each function and any outstation travel separated — a quote planners can slot straight into the budget sheet." },
  ],
  pricingHeading: "Destination wedding magic cost",
  pricingBody:
    "Destination bookings start from ₹25,000 for an intimate mehendi close-up segment and range to ₹2,50,000+ for multi-function productions across the full three-day timeline — stage show, roaming sets and villa parlour nights combined. Udaipur dates carry zero travel overhead; outstation destination weddings quote travel transparently as its own line.",
  faqHeading: "Destination wedding magician — FAQ",
  faqs: [
    {
      q: "How much does a destination wedding magician cost in Udaipur?",
      a: "Destination bookings start from ₹25,000 for an intimate mehendi close-up segment and range to ₹2,50,000+ for full multi-function productions across the three-day timeline. Being locally based removes the travel overhead every outstation vendor carries — each format is line-itemised in the written quote within 24 hours.",
    },
    {
      q: "Which functions can the magic sit in?",
      a: "All three proven slots: roaming close-up through mehendi and welcome-brunch hours, the 20-to-45-minute sangeet-night stage act, and villa parlour nights after the main productions. The formats are planned into the full timeline with your wedding planner rather than booked as one evening.",
    },
    {
      q: "Do you coordinate with our wedding planner?",
      a: "Yes — the booking includes a pre-date technical visit with your planner or hotel team, run-sheet coordination in writing, and sound cues planned with the DJ and anchor. The act is engineered to drop into a destination production's flow without adding coordination load.",
    },
    {
      q: "Our guests are flying in from abroad — does the show work for them?",
      a: "Yes — the destination repertoire is engineered for international and mixed-lingual rooms: visual magic where language fails, and warm, crowd-safe participation that plays to jet-lagged, dressed-up, multi-generational audiences. It is the same discipline that plays corporate annual days and national weddings.",
    },
  ],
  relatedHeading: "Plan the destination wedding",
  related: [
    { label: "Wedding magician in India", route: "svcWedding" },
    { label: "Magician in Udaipur", route: "udaipur" },
    { label: "Private & villa parties", route: "svcPrivate" },
    { label: "Wedding ideas (Journal)", route: "blog" },
    { label: "Check your date", route: "booking" },
  ],
};

export function DestinationWeddingView({ navigate }: { navigate: (r: RouteId) => void }) {
  return <LandingView cfg={DEST_CFG} navigate={navigate} />;
}
