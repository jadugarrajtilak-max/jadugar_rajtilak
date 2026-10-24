"use client";

import { useEffect, useState } from "react";
import { Phone, MessageCircle, CalendarCheck } from "lucide-react";
import { SITE } from "@/lib/content";
import { trackCta } from "@/lib/router";

// ── Sticky conversion CTAs (lead-generation layer) ───────────────
// Mobile: a fixed bottom bar with the three highest-intent actions —
// Call, WhatsApp (pre-filled message) and Check Date. Desktop: a
// floating WhatsApp button. Every tap is tracked (first-party
// CtaClick + GA4 cta_click) so phone-channel interest finally shows
// up in Master Admin next to form leads.
//
// The bar appears AFTER a short scroll delay so it never fights the
// hero CTAs for the first impression, and hides while the mobile
// menu is open (data-jr-menu="open") so nothing overlaps.

const WHATSAPP_TEXT = encodeURIComponent(
  "Namaste! I would like to check a date for a magic show."
);

export function StickyCta({ onCheckDate }: { onCheckDate: () => void }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Delay + scroll gate: appear once the visitor starts reading —
    // the hero CTAs own the first screen.
    const t = setTimeout(() => setShow(true), 2600);
    return () => clearTimeout(t);
  }, []);

  // Keep in sync with the pre-hydration mobile menu attribute so the
  // bar never overlaps the fullscreen menu panel.
  useEffect(() => {
    const sync = () => {
      const menuOpen = document.documentElement.dataset.jrMenu === "open";
      document.body.dataset.jrStickyCta = menuOpen ? "hidden" : "show";
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-jr-menu"],
    });
    return () => observer.disconnect();
  }, []);

  const onWhatsapp = () => trackCta("whatsapp");
  const onCall = () => trackCta("call");
  const onBooking = () => {
    trackCta("booking");
    onCheckDate();
  };

  return (
    <>
      {/* Spacer keeps the footer's last rows clear of the fixed bar
          (mobile only). Sits at the very end of the flex column. */}
      <div aria-hidden="true" className="h-[calc(72px+env(safe-area-inset-bottom))] md:hidden" />

      {/* Desktop floating WhatsApp — one-tap enquiry from any page */}
      {show && (
        <a
          href={`https://wa.me/${SITE.whatsapp}?text=${WHATSAPP_TEXT}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onWhatsapp}
          aria-label="Chat on WhatsApp — reply comes the same day"
          className="fixed bottom-6 right-6 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-[#22c55e] text-white shadow-[0_16px_36px_-10px_rgba(34,197,94,0.65)] transition-transform duration-300 hover:-translate-y-1 md:flex"
        >
          <MessageCircle className="h-6 w-6" aria-hidden="true" />
          <span
            aria-hidden="true"
            className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#22c55e]/40 [animation-duration:2.6s]"
          />
        </a>
      )}

      {/* Mobile bottom bar — Call · WhatsApp · Check Date */}
      {show && (
        <div
          data-jr-sticky-cta=""
          className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--jr-line)] bg-[var(--jr-card)]/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_32px_-18px_rgba(42,27,61,0.45)] backdrop-blur-md md:hidden"
        >
          <div className="grid grid-cols-3" role="navigation" aria-label="Quick contact actions">
            <a
              href={`tel:${SITE.phoneRaw}`}
              onClick={onCall}
              className="flex min-h-[64px] flex-col items-center justify-center gap-1 border-r border-[var(--jr-line)] py-2 text-[var(--jr-plum)] transition-colors active:bg-[var(--jr-sand)]"
            >
              <Phone className="h-5 w-5" aria-hidden="true" />
              <span className="text-[11px] font-semibold tracking-wide">Call Now</span>
            </a>
            <a
              href={`https://wa.me/${SITE.whatsapp}?text=${WHATSAPP_TEXT}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onWhatsapp}
              className="flex min-h-[64px] flex-col items-center justify-center gap-1 border-r border-[var(--jr-line)] py-2 text-[#128c4a] transition-colors active:bg-[#e9f9ef]"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              <span className="text-[11px] font-semibold tracking-wide">WhatsApp</span>
            </a>
            <button
              onClick={onBooking}
              className="flex min-h-[64px] flex-col items-center justify-center gap-1 bg-[var(--jr-crimson)] py-2 text-[var(--jr-ivory)] transition-colors active:bg-[var(--jr-crimson-hover)]"
            >
              <CalendarCheck className="h-5 w-5" aria-hidden="true" />
              <span className="text-[11px] font-semibold tracking-wide">Check Date</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
