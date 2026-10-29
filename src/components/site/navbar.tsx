"use client";

import { useEffect, useState } from "react";
import { Menu, CalendarCheck, X, ArrowRight } from "lucide-react";
import { NAV_ITEMS, type RouteId } from "@/lib/content";
import { routeToPath } from "@/lib/routes";
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
  // SEO fix (manager audit T-01a, 2026-10-29): every navigation item is
  // now a real <a href> anchor — crawlable in the raw HTML (anchor-text
  // signals, non-JS crawlers, AI answer engines, open-in-new-tab) —
  // while onClick + preventDefault preserves the client-side SPA
  // navigation. Before React hydrates, the anchors still work natively
  // (full page load to the SSR'd route), which is the correct fallback.
  const [scrolled, setScrolled] = useState(false);
  // The mobile menu is also operable BEFORE React hydration finishes:
  // an inline script in layout.tsx toggles data-jr-menu on <html>, and
  // globals.css shows the panel from that attribute. That matters on
  // slow phones — a tap on the 3-dot button in the first seconds after
  // load used to do nothing because the React handler was not attached
  // yet. On mount we adopt whatever state the native fallback left.
  const [open, setOpen] = useState(false);
  const { text } = useSiteCustomization();

  const navLabel = (id: RouteId) => {
    const key = `nav.label.${id}`;
    const hit = NAV_ITEMS.find((n) => n.id === id);
    return text(key) || hit?.label || id;
  };

  useEffect(() => {
    // adopt pre-hydration state + tell the native fallback to stand down.
    // Writing a plain flag on window is not React state — the compiler's
    // set-state-in-effect rule misreads it; disabled deliberately.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (document.documentElement.dataset.jrMenu === "open") setOpen(true);
    (window as unknown as Record<string, unknown>).__jrHydrated = true;
    return () => {
      (window as unknown as Record<string, unknown>).__jrHydrated = false;
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Single source of truth for panel visibility: the data-jr-menu
  // attribute on <html> (kept in sync with React state) — the same
  // attribute the pre-hydration script toggles.
  useEffect(() => {
    document.documentElement.dataset.jrMenu = open ? "open" : "closed";
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

  // Anchor click handler: plain left-click → SPA navigate; modified
  // clicks (new tab / window) fall through to the browser's default
  // anchor behaviour. Same for middle-click: no onClick fires at all.
  const navHref = (e: React.MouseEvent<HTMLAnchorElement>, r: RouteId) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    go(r);
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
        <a
          href="/"
          onClick={(e) => navHref(e, "home")}
          className="flex items-center gap-3"
          aria-label="Jadugar Rajtilak — home"
        >
          <BrandMark className="h-10 w-10" />
          <span className={`font-display text-xl font-semibold tracking-wide ${overHero ? "text-[var(--jr-ivory)]" : "text-[var(--jr-plum)]"}`}>
            {text("nav.brandFirst")} <span className={overHero ? "text-[var(--jr-gold-soft)]" : "text-[var(--jr-gold)]"}>{text("nav.brandLast")}</span>
          </span>
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <a
                href={routeToPath(item.id)}
                onClick={(e) => navHref(e, item.id)}
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
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href="/booking"
            onClick={(e) => navHref(e, "booking")}
            className="hidden min-h-11 items-center gap-2 rounded-full bg-[var(--jr-crimson)] px-6 py-2.5 text-sm font-semibold text-[var(--jr-ivory)] shadow-[0_14px_30px_-12px_color-mix(in_srgb,var(--jr-crimson)_65%,transparent)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[var(--jr-crimson-hover)] sm:inline-flex"
          >
            <CalendarCheck className="h-4 w-4" aria-hidden="true" />
            Check Date
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            data-jr-menu-toggle=""
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

      {/* Mobile menu — full-screen takeover so nothing bleeds through.
          Always in the DOM (SSR) so the pre-hydration script + CSS rule
          can show it before React is ready; React keeps it in sync. */}
      <div
        data-jr-mobile-panel=""
        className={`fixed inset-0 z-[70] flex-col overflow-y-auto bg-[var(--jr-ivory)] lg:hidden ${
          open ? "flex" : "hidden"
        }`}
      >
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
              data-jr-menu-toggle=""
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
                  <a
                    href={routeToPath(item.id)}
                    onClick={(e) => navHref(e, item.id)}
                    data-jr-nav={routeToPath(item.id)}
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
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="/booking"
              onClick={(e) => navHref(e, "booking")}
              data-jr-nav={routeToPath("booking")}
              className="mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--jr-crimson)] px-6 py-3.5 text-sm font-semibold text-[var(--jr-ivory)] shadow-[0_18px_40px_-14px_color-mix(in_srgb,var(--jr-crimson)_65%,transparent)]"
            >
              <CalendarCheck className="h-4 w-4" aria-hidden="true" />
              Check Date Availability
            </a>
            <p className="mt-6 text-center text-xs text-[var(--jr-ink)]/70">
              Weddings · Corporate · Birthdays · Fests — across India
            </p>
          </nav>
      </div>
    </header>
  );
}
