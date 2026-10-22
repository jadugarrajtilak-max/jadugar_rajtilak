"use client";

import { useEffect, useState } from "react";
import { Menu, CalendarCheck, X, ArrowRight } from "lucide-react";
import { NAV_ITEMS, type RouteId } from "@/lib/content";
import { useSiteCustomization } from "@/components/site/customization-provider";

// Brand mark — the client's official golden JR emblem (crown + monogram +
// top hat), rendered as a navy badge with a gold ring. The emblem source
// is live-editable from Master Admin → Images → Brand.
export function BrandMark({ className = "h-10 w-10" }: { className?: string }) {
  const { asset } = useSiteCustomization();
  const emblem = asset("brand.logo.emblem");
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--jr-gold)]/70 bg-[#1b2740] shadow-[0_6px_18px_-6px_rgba(27,39,64,0.55)] ${className}`}
      aria-hidden="true"
    >
      {" "}
      <img
        src={emblem.src}
        alt=""
        className="h-full w-full object-contain"
      />
    </span>
  );
}

export function Navbar({
  route,
  navigate,
}: {
  route: RouteId;
  navigate: (r: RouteId) => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { text } = useSiteCustomization();

  const navLabel = (id: RouteId) => {
    const key = `nav.label.${id}`;
    const hit = NAV_ITEMS.find((n) => n.id === id);
    return text(key) || hit?.label || id;
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the full-screen menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Over the hero the bar is glassy-dark; elsewhere ivory.
  const overHero = route === "home" && !scrolled;

  const go = (r: RouteId) => {
    setOpen(false);
    navigate(r);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
        overHero
          ? "bg-transparent"
          : "border-b border-[var(--jr-line)] bg-[var(--jr-ivory)]/90 shadow-[0_10px_30px_-20px_color-mix(in_srgb,var(--jr-plum)_35%,transparent)] backdrop-blur-md"
      }`}
    >
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6"
        aria-label="Main navigation"
      >
        <button
          onClick={() => go("home")}
          className="flex items-center gap-3"
          aria-label="Jadugar Rajtilak — home"
        >
          <BrandMark className="h-10 w-10" />
          <span className={`font-display text-xl font-semibold tracking-wide ${overHero ? "text-[var(--jr-ivory)]" : "text-[var(--jr-plum)]"}`}>
            {text("nav.brandFirst")} <span className={overHero ? "text-[var(--jr-gold-soft)]" : "text-[var(--jr-gold)]"}>{text("nav.brandLast")}</span>
          </span>
        </button>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => go(item.id)}
                aria-current={route === item.id ? "page" : undefined}
                className={`relative rounded-full px-4 py-2 text-[15px] font-medium transition-colors duration-300 ${
                  route === item.id
                    ? overHero
                      ? "text-[var(--jr-cream)]"
                      : "text-[var(--jr-plum)]"
                    : overHero
                      ? "text-[var(--jr-lavender)]/75 hover:text-[var(--jr-ivory)]"
                      : "text-[var(--jr-ink)] hover:text-[var(--jr-plum)]"
                }`}
              >
                {navLabel(item.id)}
                {route === item.id && (
                  <span
                    className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full"
                    style={{ background: "linear-gradient(90deg, transparent, var(--jr-gold), transparent)" }}
                  />
                )}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button
            onClick={() => go("booking")}
            className="hidden min-h-11 items-center gap-2 rounded-full bg-[var(--jr-crimson)] px-6 py-2.5 text-sm font-semibold text-[var(--jr-ivory)] shadow-[0_14px_30px_-12px_color-mix(in_srgb,var(--jr-crimson)_65%,transparent)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[var(--jr-crimson-hover)] sm:inline-flex"
          >
            <CalendarCheck className="h-4 w-4" aria-hidden="true" />
            Check Date
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full lg:hidden ${
              overHero ? "text-[var(--jr-ivory)]" : "text-[var(--jr-plum)]"
            }`}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu — full-screen takeover so nothing bleeds through */}
      {open && (
        <div className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-[var(--jr-ivory)] lg:hidden">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={{ background: "radial-gradient(70% 40% at 50% -10%, color-mix(in srgb, var(--jr-gold) 14%, transparent), transparent 60%)" }} />
          <div className="relative flex h-16 shrink-0 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <BrandMark className="h-10 w-10" />
              <span className="font-display text-xl font-semibold tracking-wide text-[var(--jr-plum)]">
                Jadugar <span className="text-[var(--jr-gold)]">Rajtilak</span>
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--jr-line)] text-[var(--jr-plum)]"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="relative flex-1 px-6 pb-8 pt-4" aria-label="Mobile navigation">
            <ul className="flex flex-col">
              {NAV_ITEMS.map((item, i) => (
                <li key={item.id} className="border-b border-[var(--jr-sand)]">
                  <button
                    onClick={() => go(item.id)}
                    className={`flex w-full items-center justify-between py-4 text-left font-display text-2xl font-medium transition-colors ${
                      route === item.id ? "text-[var(--jr-crimson)]" : "text-[var(--jr-plum)]"
                    }`}
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="text-[11px] font-semibold tracking-[0.2em] text-[var(--jr-gold)]/70">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {navLabel(item.id)}
                    </span>
                    <ArrowRight className="h-4 w-4 text-[var(--jr-gold)]/60" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={() => go("booking")}
              className="mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--jr-crimson)] px-6 py-3.5 text-sm font-semibold text-[var(--jr-ivory)] shadow-[0_18px_40px_-14px_color-mix(in_srgb,var(--jr-crimson)_65%,transparent)]"
            >
              <CalendarCheck className="h-4 w-4" aria-hidden="true" />
              Check Date Availability
            </button>
            <p className="mt-6 text-center text-xs text-[var(--jr-ink)]/70">
              Weddings · Corporate · Birthdays · Fests — across India
            </p>
          </nav>
        </div>
      )}
    </header>
  );
}
