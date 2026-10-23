"use client";

import { Phone, Mail, MessageCircle, MapPin, Star } from "lucide-react";
import { BrandMark } from "./navbar";
import { useSiteCustomization } from "@/components/site/customization-provider";
import { EVENT_TYPES, NAV_ITEMS, SITE, type RouteId } from "@/lib/content";

export function Footer({ navigate }: { navigate: (r: RouteId) => void }) {
  const { text } = useSiteCustomization();
  return (
    <footer className="mt-auto border-t border-[var(--jr-line)] bg-[var(--jr-sand)]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <BrandMark className="h-11 w-11" />
              <p className="font-display text-xl font-semibold text-[var(--jr-plum)]">
                {text("nav.brandFirst")} <span className="text-[var(--jr-gold)]">{text("nav.brandLast")}</span>
              </p>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-6 text-[var(--jr-ink)]">
              {text("footer.tagline")}
            </p>
            <a
              href={SITE.googleProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--jr-gold)]/50 bg-[var(--jr-card)] px-4 py-2 text-sm font-medium text-[var(--jr-plum)] transition-colors hover:border-[var(--jr-gold)]"
              aria-label={`${SITE.rating} stars from ${SITE.reviewCount} Google reviews — open the Google profile`}
            >
              <Star className="h-4 w-4 fill-[var(--jr-gold)] text-[var(--jr-gold)]" aria-hidden="true" />
              {SITE.rating}★ · {SITE.reviewCount} Google reviews
            </a>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a
                href={SITE.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--jr-line)] bg-[var(--jr-card)] px-4 py-2 text-xs font-medium text-[var(--jr-ink)] transition-colors hover:border-[var(--jr-gold)] hover:text-[var(--jr-plum)]"
                aria-label="Jadugar Rajtilak on Facebook"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-[var(--jr-gold-dark)]" aria-hidden="true">
                  <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2.1-.1-2.1 0-3.6 1.3-3.6 3.7V11H8.2v3h2.5v7h2.8Z" />
                </svg>
                Facebook
              </a>
              <a
                href={SITE.instagramPostUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--jr-line)] bg-[var(--jr-card)] px-4 py-2 text-xs font-medium text-[var(--jr-ink)] transition-colors hover:border-[var(--jr-gold)] hover:text-[var(--jr-plum)]"
                aria-label="Jadugar Rajtilak's show reel on Instagram"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-[var(--jr-gold-dark)] stroke-2" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.2" cy="6.8" r="1" fill="var(--jr-gold-dark)" stroke="none" />
                </svg>
                The Reel
              </a>
            </div>
          </div>

          <nav aria-label="Footer — explore">
            <p className="eyebrow mb-4">{text("footer.exploreLabel")}</p>
            <ul className="space-y-2.5">
              {NAV_ITEMS.slice(1).map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => navigate(n.id)}
                    className="text-sm text-[var(--jr-ink)] transition-colors hover:text-[var(--jr-crimson)]"
                  >
                    {text(`nav.label.${n.id}`) || n.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer — shows">
            <p className="eyebrow mb-4">{text("footer.showsLabel")}</p>
            <ul className="space-y-2.5">
              {EVENT_TYPES.map((e) => (
                <li key={e.id}>
                  <button
                    onClick={() => navigate("services")}
                    className="text-sm text-[var(--jr-ink)] transition-colors hover:text-[var(--jr-crimson)]"
                  >
                    {e.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="eyebrow mb-4">{text("footer.contactLabel")}</p>
            <ul className="space-y-3 text-sm text-[var(--jr-ink)]">
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-[var(--jr-gold)]" aria-hidden="true" />
                <a href={`tel:${SITE.phoneRaw}`} className="transition-colors hover:text-[var(--jr-crimson)]">
                  {SITE.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-[var(--jr-gold)]" aria-hidden="true" />
                <a href={`mailto:${SITE.email}`} className="break-all transition-colors hover:text-[var(--jr-crimson)]">
                  {SITE.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle className="h-4 w-4 shrink-0 text-[var(--jr-gold)]" aria-hidden="true" />
                <a
                  href={`https://wa.me/${SITE.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[var(--jr-crimson)]"
                >
                  WhatsApp — same number
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--jr-gold)]" aria-hidden="true" />
                <a
                  href={SITE.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[var(--jr-crimson)]"
                >
                  {SITE.address} · touring pan-India
                </a>
              </li>
            </ul>
            <button
              onClick={() => navigate("booking")}
              className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[var(--jr-crimson)] px-6 py-2.5 text-sm font-semibold text-[var(--jr-ivory)] transition-all duration-500 hover:bg-[var(--jr-crimson-hover)]"
            >
              Book a Show
            </button>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--jr-line)] pt-6 sm:flex-row">
          <p className="text-xs text-[var(--jr-ink)]">
            {text("footer.copyright")}
          </p>
          <div className="flex items-center gap-5 text-xs text-[var(--jr-ink)]">
            <button onClick={() => navigate("legal")} className="transition-colors hover:text-[var(--jr-crimson)]">
              Privacy Policy
            </button>
            <button onClick={() => navigate("legal")} className="transition-colors hover:text-[var(--jr-crimson)]">
              Terms
            </button>
            <button onClick={() => navigate("legal")} className="transition-colors hover:text-[var(--jr-crimson)]">
              Cancellation
            </button>
            {/* XML sitemap for crawlers + a visible link for visitors */}
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[var(--jr-crimson)]"
            >
              Sitemap
            </a>
            <button onClick={() => navigate("admin")} className="transition-colors hover:text-[var(--jr-gold)]">
              Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
