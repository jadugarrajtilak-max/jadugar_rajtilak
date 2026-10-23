"use client";

import { Sparkles, MapPin, CalendarCheck, ArrowRight, Award } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/home/sections";
import { useSiteCustomization } from "@/components/site/customization-provider";
import { imageFrame } from "@/lib/customization";
import { EVENT_TYPES, type RouteId } from "@/lib/content";

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
          background:
            "radial-gradient(70% 90% at 50% -20%, color-mix(in srgb, var(--jr-gold) 18%, transparent), transparent 60%)",
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

// ── About the magician ──
export function AboutView({ navigate }: { navigate: (r: RouteId) => void }) {
  const { text, asset } = useSiteCustomization();
  const awardPhoto = asset("about.award.photo");
  const certificatePhoto = asset("about.certificate.photo");
  const milestones: { year: string; text: string }[] = [
    { year: "I", text: text("about.milestone1") },
    { year: "II", text: text("about.milestone2") },
    { year: "III", text: text("about.milestone3") },
    { year: "IV", text: text("about.milestone4") },
  ];

  return (
    <div>
      <PageHero
        eyebrow={text("about.hero.eyebrow")}
        title={text("about.hero.title")}
        sub={text("about.hero.sub")}
      />

      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal>
          <h2 className="font-display text-display-md font-medium text-[var(--jr-plum)]">{text("about.story.title")}</h2>
          <div className="mt-6 space-y-5 text-[16px] leading-8 text-[var(--jr-ink)]">
            <p>{text("about.story.p1")}</p>
            <p>{text("about.story.p2")}</p>
            <p>{text("about.story.p3")}</p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl border border-[var(--jr-line)] bg-[var(--jr-plum-deep)] shadow-[0_40px_80px_-50px_color-mix(in_srgb,var(--jr-plum)_80%,transparent)]">
              <div className="stage-light absolute -top-8 left-1/2 h-[45%] w-[50%] -translate-x-1/2 opacity-60" aria-hidden="true" />
              <img
                src={awardPhoto.src}
                alt={awardPhoto.alt}
                className={`${imageFrame("about.award.photo") ?? "aspect-square"} relative w-full object-cover`}
                loading="lazy"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{ background: "linear-gradient(180deg, transparent 55%, color-mix(in srgb, var(--jr-plum-deep) 60%, transparent) 100%)" }}
              />
              <div className="absolute inset-x-0 bottom-0 p-7 text-center">
                <p className="font-display text-2xl font-semibold text-[var(--jr-ivory)]">{text("about.card.name")}</p>
                <p className="mt-1 text-sm text-[var(--jr-lavender)]/75">{text("about.card.role")}</p>
                <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-[var(--jr-gold)] to-transparent" />
                <ul className="mt-5 space-y-1.5 text-sm text-[var(--jr-lavender)]/85">
                  <li>12+ years on stage</li>
                  <li>500+ shows across 40+ cities</li>
                  <li>Weddings · Corporate · Fests</li>
                </ul>
              </div>
            </div>

            {/* Certificate of Recognition — Online International Magic Competition 2021 */}
            <figure className="relative overflow-hidden rounded-3xl border border-[var(--jr-gold)]/50 bg-[var(--jr-card)] p-4 shadow-[0_30px_60px_-40px_color-mix(in_srgb,var(--jr-gold)_45%,transparent)]">
              <div className="flex items-center gap-2.5 px-2 pb-3 pt-1">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--jr-sand-light)] text-[var(--jr-gold)]">
                  <Award className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-display text-lg font-semibold leading-tight text-[var(--jr-plum)]">{text("about.certificate.title")}</p>
                  <p className="text-xs text-[var(--jr-ink)]">{text("about.certificate.detail")}</p>
                </div>
              </div>
              <div className="relative rounded-2xl border border-[var(--jr-gold)]/35 bg-[var(--jr-ivory)] p-2.5">
                <img
                  src={certificatePhoto.src}
                  alt={certificatePhoto.alt}
                  className="aspect-[3/4] w-full rounded-xl object-contain"
                  loading="lazy"
                />
              </div>
            </figure>
          </div>
        </Reveal>
      </section>

      {/* milestones timeline */}
      <section className="bg-[var(--jr-sand)] py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <SectionHeading eyebrow={text("about.milestones.eyebrow")} title={text("about.milestones.title")} />
          <ol className="mt-12 space-y-0">
            {milestones.map((m, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <li className="relative flex gap-6 pb-10 last:pb-0">
                  <div className="flex flex-col items-center">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--jr-gold)]/60 bg-[var(--jr-card)] font-display text-sm font-semibold text-[var(--jr-gold)]">
                      {m.year}
                    </span>
                    {i < milestones.length - 1 && (
                      <span className="mt-1 w-px flex-1 bg-gradient-to-b from-[var(--jr-gold)]/50 to-transparent" />
                    )}
                  </div>
                  <div className="pt-1.5">
                    <p className="mt-1 max-w-xl text-[15px] leading-7 text-[var(--jr-ink)]">{m.text}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* philosophy */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow={text("about.philosophy.eyebrow")}
          title={text("about.philosophy.title")}
          sub={text("about.philosophy.sub")}
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              t: text("about.philosophy1t"),
              d: text("about.philosophy1d"),
            },
            {
              t: text("about.philosophy2t"),
              d: text("about.philosophy2d"),
            },
            {
              t: text("about.philosophy3t"),
              d: text("about.philosophy3d"),
            },
          ].map((p, i) => (
            <Reveal key={p.t} delay={i * 0.12}>
              <article className="card-cine h-full rounded-2xl border border-[var(--jr-line)] bg-[var(--jr-card)] p-7">
                <Sparkles className="h-6 w-6 text-[var(--jr-gold)]" aria-hidden="true" />
                <h3 className="font-display mt-4 text-2xl font-semibold text-[var(--jr-plum)]">{p.t}</h3>
                <p className="mt-3 text-[15px] leading-7 text-[var(--jr-ink)]">{p.d}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-12 text-center">
          <button
            onClick={() => navigate("booking")}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--jr-crimson)] px-8 py-3 text-[15px] font-semibold text-[var(--jr-ivory)] shadow-[0_16px_35px_-14px_color-mix(in_srgb,var(--jr-crimson)_70%,transparent)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[var(--jr-crimson-hover)]"
          >
            Book a Show <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </Reveal>
      </section>
    </div>
  );
}

// ── Services (6 event types, alternating detail sections — every photo VLM-identity-verified as Jadugar Rajtilak himself) ──
// Image + note slots live in the customization registry (services.<id>.photo).
const SERVICE_PHOTO_KEYS: Record<string, string> = {
  wedding: "services.wedding.photo",
  corporate: "services.corporate.photo",
  birthday: "services.birthday.photo",
  college: "services.college.photo",
  private: "services.private.photo",
};

export function ServicesView({ navigate }: { navigate: (r: RouteId) => void }) {
  const { text, asset } = useSiteCustomization();
  return (
    <div>
      <PageHero
        eyebrow={text("services.hero.eyebrow")}
        title={text("services.hero.title")}
        sub={text("services.hero.sub")}
      />

      {EVENT_TYPES.map((e, i) => {
        const photoKey = SERVICE_PHOTO_KEYS[e.id];
        const photo = photoKey ? asset(photoKey) : null;
        const noteKey = `services.${e.id}.note`;
        return (
        <section
          key={e.id}
          id={e.id}
          className={`scroll-mt-24 py-16 ${i % 2 === 1 ? "bg-[var(--jr-sand)]" : ""}`}
          aria-labelledby={`${e.id}-title`}
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div
              className={`grid items-center gap-10 lg:grid-cols-2 ${
                i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <Reveal>
                <div>
                  <p className="eyebrow">{text(`services.${e.id}.tagline`) || e.tagline}</p>
                  <h2 id={`${e.id}-title`} className="font-display mt-3 text-display-md font-medium text-[var(--jr-plum)]">
                    {text(`services.${e.id}.name`) || e.name}
                  </h2>
                  <p className="mt-5 text-[16px] leading-8 text-[var(--jr-ink)]">{text(`services.${e.id}.description`) || e.description}</p>
                  <dl className="mt-6 grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-[var(--jr-line)] bg-[var(--jr-card)] p-4">
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-[var(--jr-gold)]">
                        Format
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-[var(--jr-plum)]">{e.duration}</dd>
                    </div>
                    <div className="rounded-xl border border-[var(--jr-line)] bg-[var(--jr-card)] p-4">
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-[var(--jr-gold)]">
                        Ideal for
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-[var(--jr-plum)]">{e.idealFor[0]}</dd>
                    </div>
                  </dl>
                  <ul className="mt-6 space-y-2.5">
                    {e.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2.5 text-[15px] text-[var(--jr-ink)]">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--jr-crimson)]" />
                        {h}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate("booking")}
                    className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--jr-plum)] px-7 py-3 text-[15px] font-semibold text-[var(--jr-ivory)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[var(--jr-plum-mid)]"
                  >
                    Get a Quote <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </Reveal>

              <Reveal delay={0.15}>
                {photo ? (
                  <div className="card-cine group relative overflow-hidden rounded-3xl border border-[var(--jr-line)] shadow-[0_40px_80px_-50px_color-mix(in_srgb,var(--jr-plum)_90%,transparent)]">
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      loading="lazy"
                      className={`${imageFrame(photoKey) ?? "aspect-[4/3]"} w-full object-cover transition-transform duration-[1.2s] ease-cine group-hover:scale-[1.04]`}
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(180deg, color-mix(in srgb, var(--jr-plum-deep) 5%, transparent) 45%, color-mix(in srgb, var(--jr-plum-deep) 72%, transparent) 100%)" }}
                    />
                    <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-3 p-6">
                      <p className="text-sm font-medium text-[var(--jr-ivory)]">{text(noteKey) || "Live show frame"}</p>
                      <span className="rounded-full border border-[var(--jr-gold)]/70 bg-[var(--jr-plum)]/55 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--jr-cream)] backdrop-blur">
                        Live show frame
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="relative overflow-hidden rounded-3xl border border-[var(--jr-line)] bg-gradient-to-br from-[var(--jr-plum)] via-[var(--jr-plum-mid)] to-[var(--jr-plum-deep)] p-10 shadow-[0_40px_80px_-50px_color-mix(in_srgb,var(--jr-plum)_90%,transparent)]">
                    <div className="stage-light absolute -top-10 left-[30%] h-[80%] w-[40%] opacity-70" aria-hidden="true" />
                    <div className="relative flex flex-col items-center gap-6 py-8 text-center">
                      <div className="flex gap-3" aria-hidden="true">
                        {["♠", "♥", "♦", "♣"].map((s, j) => (
                          <span
                            key={s}
                            className="animate-card-drift flex h-20 w-14 items-center justify-center rounded-lg border border-[var(--jr-gold)]/50 bg-gradient-to-br from-[var(--jr-ivory)] to-[var(--jr-cream)] font-display text-2xl text-[var(--jr-plum)]"
                            style={{ "--delay": `${j * 0.5}s`, "--tilt": `${(j - 1.5) * 8}deg` } as React.CSSProperties}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                      <p className="max-w-xs text-sm leading-6 text-[var(--jr-lavender)]/80">
                        {e.idealFor.join(" · ")}
                      </p>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--jr-gold)]">
                        Camera-ready staging & lighting
                      </p>
                    </div>
                  </div>
                )}
              </Reveal>
            </div>
          </div>
        </section>
        );
      })}

      {/* city landing note (doc 6/10.3 — unique local pages, no doorways) */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <Reveal>
          <div className="rounded-3xl border border-[var(--jr-line)] bg-[var(--jr-card)] p-9">
            <MapPin className="mx-auto h-8 w-8 text-[var(--jr-gold)]" aria-hidden="true" />
            <h2 className="font-display mt-4 text-2xl font-semibold text-[var(--jr-plum)]">
              Performing in your city
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[15px] leading-7 text-[var(--jr-ink)]">
              {text("services.cityNote")}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {["Delhi NCR", "Mumbai", "Jaipur", "Bengaluru", "Hyderabad", "Pune"].map((c) => (
                <span key={c} className="rounded-full border border-[var(--jr-line)] bg-[var(--jr-ivory)] px-5 py-2 text-sm font-medium text-[var(--jr-ink)]">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal className="mt-8">
          <button
            onClick={() => navigate("booking")}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--jr-crimson)] px-8 py-3 text-[15px] font-semibold text-[var(--jr-ivory)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[var(--jr-crimson-hover)]"
          >
            <CalendarCheck className="h-4 w-4" aria-hidden="true" /> {text("services.cta")}
          </button>
        </Reveal>
      </section>
    </div>
  );
}
