"use client";

import { ArrowRight, CalendarCheck, CheckCircle2, MessageCircle, Phone, Sparkles, Star, Wand2 } from "lucide-react";
import { Reveal } from "@/components/home/sections";
import { SITE, type RouteId } from "@/lib/content";
import { trackCta } from "@/lib/router";

// ─────────────────────────────────────────────────────────────
// /magician-in-udaipur — the local money page (SEO audit A-02).
// The single strongest local keyword ("magician in udaipur") was
// previously targeted only by two near-duplicate blog posts; a
// commercial query needs a service landing page. The two duplicate
// guides now 301 here, and this page links out to the booking flow,
// packages and the Journal cluster so authority flows both ways.
// Content rule: every claim on this page is a verified site fact
// (4.8★ / 181 Google reviews, 500+ shows, 12+ years, I.B.M. 2021
// international 2nd place, From-₹25,000 pricing from the published
// cost guide). No invented venues, no invented reviews.
// ─────────────────────────────────────────────────────────────

const SHOWS = [
  {
    id: "wedding",
    tagline: "Sangeet · Mehendi · Reception",
    name: "Wedding Magician in Udaipur",
    body:
      "Udaipur hosts the country's most photographed weddings, and the sangeet night is where a close-up magician earns their fee: roaming table magic during cocktails, then a 20-minute stage act that gives every family group a moment they will retell. The repertoire is engineered for mixed generations — nothing blue, nothing dangerous, nothing that needs a volunteer to feel embarrassed — so the elders lean in and the children scream first.",
    points: ["Roaming close-up through cocktails & sangeet", "Stage act tuned for mixed-age family crowds", "Destination-wedding timelines respected to the minute"],
  },
  {
    id: "corporate",
    tagline: "Annual days · Galas · Dealer meets",
    name: "Corporate Magic Shows in Udaipur",
    body:
      "Hotels and resorts across Udaipur host annual days, dealer conferences and leadership offsites — and a corporate magic act is the one item on the agenda nobody checks their phone during. The act can carry your brand: product reveals, key messages and leadership participation woven into illusions, with a GST invoice and a written technical rider the events team can plan around.",
    points: ["Brand-scripted illusions & product reveals", "GST invoicing + written tech rider", "45-minute annual-day format proven across India"],
  },
  {
    id: "birthday",
    tagline: "Kids · Teens · Society gatherings",
    name: "Birthday Party Magician in Udaipur",
    body:
      "From a 7th birthday in Shiv Colony to a society-club evening by the lake — the birthday format is age-safe, high-energy and parent-friendly: the birthday child becomes the star of the finale, every trick lands on a phone camera, and the show arrives with its own sound so no venue coordination is needed. Travel within Udaipur city is included.",
    points: ["Age-safe, parent-approved repertoire", "Birthday child stars in the finale", "Own sound system — zero venue setup"],
  },
];

const FAQS = [
  {
    q: "How much does a magician cost in Udaipur?",
    a: "Professional magic shows in Udaipur start from ₹25,000 for an intimate birthday format and range up to ₹2,50,000+ for a full-evening production with crew — duration, travel, crew and staging are the four honest cost drivers. Every enquiry receives a written quote with no hidden line items.",
  },
  {
    q: "Do you perform at Udaipur's destination-wedding venues?",
    a: "Yes — the studio is based in Udaipur (Shiv Colony, Bedla) and performs at heritage palaces, lake-side resorts and banquet venues across the city. Being local means no travel overhead for Udaipur dates, and the team can join the wedding planner's timeline for a technical visit in advance.",
  },
  {
    q: "How long is a magic show?",
    a: "Birthday and society formats run 30–40 minutes; wedding and corporate headline sets run 45–60 minutes, and a full evening combines a 60-minute stage show with 90 minutes of roaming close-up magic. The right length depends on where the act sits in your run-sheet.",
  },
  {
    q: "How do I check your date and book?",
    a: "Use the Check Date page or WhatsApp +91 97994 68758 directly. You will get a written quote within 24 hours and a 72-hour soft hold on your evening while you decide — no advance demanded before the quote.",
  },
];

export function UdaipurLandingView({ navigate }: { navigate: (r: RouteId) => void }) {
  const goBooking = () => navigate("booking");

  return (
    <div>
      {/* ── Hero — the keyword is the H1 ── */}
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
          <p className="eyebrow">Udaipur · The City of Lakes</p>
          <h1 className="font-display mt-4 text-display-lg font-medium text-[var(--jr-plum)]">
            Magician in Udaipur
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-body-lg text-[var(--jr-ink)]">
            Book Jadugar Rajtilak — Udaipur&apos;s own stage &amp; close-up magician for weddings, corporate
            evenings, birthdays and destination celebrations. 4.8★ from 181 Google reviews, 500+ shows,
            12+ years on stage.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={goBooking}
              className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--jr-crimson)] px-8 py-3 text-[15px] font-semibold text-[var(--jr-ivory)] shadow-[0_18px_40px_-10px_color-mix(in_srgb,var(--jr-crimson)_85%,transparent)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[var(--jr-crimson-hover)]"
            >
              <CalendarCheck className="h-4 w-4" aria-hidden="true" /> Check Your Date
            </button>
            <a
              href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent("Namaste! I am looking for a magician in Udaipur — is my date free?")}`}
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

      {/* ── Local proof strip ── */}
      <section className="border-b border-[var(--jr-line)] bg-[var(--jr-card)] py-6" aria-label="Credentials">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-4 text-center sm:grid-cols-4 sm:px-6">
          {[
            { v: "4.8★", l: "181 Google reviews" },
            { v: "500+", l: "Shows staged" },
            { v: "12+", l: "Years on stage" },
            { v: "I.B.M.", l: "Intl. 2nd place 2021" },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-display text-2xl font-semibold text-[var(--jr-plum)]">{s.v}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--jr-gold)]">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Intro copy ── */}
      <section className="py-16" aria-labelledby="why-udaipur">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal>
            <h2 id="why-udaipur" className="font-display text-display-md font-medium text-[var(--jr-plum)]">
              A magician your city already knows
            </h2>
            <p className="mt-5 text-[16px] leading-8 text-[var(--jr-ink)]">
              Searching for a <strong>magician in Udaipur</strong> usually returns performers flying in from Delhi or
              Mumbai — with flights, stay and freight added to your quote. The studio is based here, in Shiv Colony,
              Bedla, fifteen minutes from the lake palaces. That means a Jaipur-scale stage show at Udaipur logistics:
              no travel overhead inside the city, a planner-friendly technical visit before the event, and a
              coordinator on call on the day itself.
            </p>
            <p className="mt-4 text-[16px] leading-8 text-[var(--jr-ink)]">
              The calendar covers the full Udaipur season — destination weddings through the winter, hotel annual
              days, resort galas, college fests at the engineering and medical campuses, and the birthday-circuit
              weekends in between. Whether you are a wedding planner at a lake palace, an HR team at a Fatehpura
              resort or a parent planning a seventh birthday, the format is calibrated the same way: the room leans
              in, the finale lands on every phone camera, and the host gets the credit.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Show formats ── */}
      {SHOWS.map((s, i) => (
        <section
          key={s.id}
          aria-labelledby={`udaipur-${s.id}`}
          className={`scroll-mt-24 border-t border-[var(--jr-line)] py-16 ${i % 2 === 1 ? "bg-[var(--jr-sand)]" : ""}`}
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <div className="grid items-start gap-10 lg:grid-cols-2">
                <div>
                  <p className="eyebrow">{s.tagline}</p>
                  <h2 id={`udaipur-${s.id}`} className="font-display mt-3 text-display-md font-medium text-[var(--jr-plum)]">
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

      {/* ── Pricing signal (A-07) ── */}
      <section className="border-t border-[var(--jr-line)] py-16" aria-labelledby="udaipur-pricing">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <Reveal>
            <p className="eyebrow">Honest pricing</p>
            <h2 id="udaipur-pricing" className="font-display mt-3 text-display-md font-medium text-[var(--jr-plum)]">
              Magic show cost in Udaipur
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-8 text-[var(--jr-ink)]">
              Udaipur shows start from <strong>₹25,000</strong> for an intimate birthday format and range up to
              <strong> ₹2,50,000+</strong> for a full-evening production with crew. Duration, crew and staging move
              the number — travel inside Udaipur city never does. Every enquiry gets a written, line-itemised quote
              within 24 hours.
            </p>
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
      <section className="border-t border-[var(--jr-line)] bg-[var(--jr-sand)] py-16" aria-labelledby="udaipur-faq">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal>
            <p className="eyebrow text-center">Before you book</p>
            <h2 id="udaipur-faq" className="font-display mt-3 text-center text-display-md font-medium text-[var(--jr-plum)]">
              Booking a magician in Udaipur — FAQ
            </h2>
            <div className="mt-8 space-y-4">
              {FAQS.map((f) => (
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

      {/* ── Final CTA ── */}
      <section className="border-t border-[var(--jr-line)] py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <Reveal>
            <h2 className="font-display text-display-md font-medium text-[var(--jr-plum)]">
              Your date is one message away
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[16px] leading-8 text-[var(--jr-ink)]">
              Udaipur dates fill first in the wedding season — a 72-hour soft hold costs nothing and keeps your
              evening off the calendar while you decide.
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
            <p className="mt-6 text-sm text-[var(--jr-ink)]/70">
              Read the booking guides on the{" "}
              <button onClick={() => navigate("blog")} className="font-semibold text-[var(--jr-crimson)] underline-offset-4 hover:underline">
                Journal
              </button>{" "}
              or see{" "}
              <button onClick={() => navigate("testimonials")} className="font-semibold text-[var(--jr-crimson)] underline-offset-4 hover:underline">
                what hosts say
              </button>
              .
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
