"use client";

import dynamic from "next/dynamic";
import { useSiteRouter, routeToPath, type RouteId } from "@/lib/router";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { SiteCustomizationProvider, useSiteCustomization } from "@/components/site/customization-provider";
import { CinematicHero } from "@/components/hero/cinematic-hero";
import {
  BookingStrip,
  CertificatesSection,
  CitiesStrip,
  EventTypesGrid,
  FaqTeaser,
  PackagesTeaser,
  SignatureActs,
  StorySection,
  TestimonialsStrip,
  TrustBar,
  VideoReel,
} from "@/components/home/sections";
import { VIEW_META } from "@/lib/content";

const SITE_URL = "https://jadugarrajtilak.com";

// ── Code splitting (mobile performance) ──────────────────────
// Only the home view lives in the first-load bundle (it is the LCP
// path). Every other route — and especially the ~200 KB Master
// Admin CMS — is split into its own chunk and fetched on demand,
// keeping next/dynamic's default SSR so crawlers still get fully
// rendered HTML on direct /about, /gallery, /blog/<slug> visits.
const ViewSkeleton = () => (
  <div
    role="status"
    aria-label="Loading content"
    className="flex min-h-[70vh] items-center justify-center bg-background"
  >
    <div className="flex flex-col items-center gap-4 text-[var(--jr-gold, #b08d2f)]">
      <span
        className="h-10 w-10 animate-spin rounded-full border-2 border-current border-t-transparent"
        aria-hidden="true"
      />
      <span className="text-sm tracking-wide">Preparing the stage…</span>
    </div>
  </div>
);

const AboutView = dynamic(() => import("@/components/views/info-views").then((m) => m.AboutView), { loading: ViewSkeleton });
const ServicesView = dynamic(() => import("@/components/views/info-views").then((m) => m.ServicesView), { loading: ViewSkeleton });
const PackagesView = dynamic(() => import("@/components/views/offer-views").then((m) => m.PackagesView), { loading: ViewSkeleton });
const GalleryView = dynamic(() => import("@/components/views/offer-views").then((m) => m.GalleryView), { loading: ViewSkeleton });
const TestimonialsView = dynamic(() => import("@/components/views/offer-views").then((m) => m.TestimonialsView), { loading: ViewSkeleton });
// FIX (2026-10-22): same named-export mapping as the views below —
// booking-wizard.tsx has no default export either.
const BookingWizard = dynamic(() => import("@/components/booking/booking-wizard").then((m) => m.BookingWizard), { loading: ViewSkeleton });
const BlogView = dynamic(() => import("@/components/views/support-views").then((m) => m.BlogView), { loading: ViewSkeleton });
const FaqView = dynamic(() => import("@/components/views/support-views").then((m) => m.FaqView), { loading: ViewSkeleton });
const ContactView = dynamic(() => import("@/components/views/support-views").then((m) => m.ContactView), { loading: ViewSkeleton });
const LegalView = dynamic(() => import("@/components/views/support-views").then((m) => m.LegalView), { loading: ViewSkeleton });
// The ~200 KB Master Admin CMS is split into its own chunk and fetched
// on demand. FIX (2026-10-22): the loader now maps the NAMED export —
// admin-console.tsx has no default export, so `dynamic(import(...))`
// resolved to [object Module] and crashed the console both in dev and
// in production. SSR stays off: the console is an auth-gated client
// app (sessionStorage login) with zero public/SEO content — robots.txt
// already disallows /admin.
const AdminConsole = dynamic(() => import("@/components/admin/admin-console").then((m) => m.AdminConsole), { loading: ViewSkeleton, ssr: false });

// Per-route SEO via React 19 metadata elements — <title>, <meta> and
// <link> rendered in the tree are hoisted into <head> and kept in sync
// by React itself, which survives hydration (manual document.title
// writes get reverted by the hydration commit). Real path URLs
// (/about, /services, …) come from the rewrites in next.config.ts.
function RouteSeoTags({ route, ogImage }: { route: RouteId; ogImage: string }) {
  const meta = VIEW_META[route] ?? VIEW_META.home;
  const canonicalPath = routeToPath(route);
  const url = `${SITE_URL}${canonicalPath === "/" ? "/" : canonicalPath}`;
  const fullOg = `${SITE_URL}${ogImage}`;

  return (
    <>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={fullOg} />
      <meta property="og:type" content="website" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={fullOg} />
    </>
  );
}

function Site({ initialRoute, initialBlogSlug }: { initialRoute: RouteId; initialBlogSlug: string | null }) {
  const { route, blogSlug, navigate } = useSiteRouter({
    route: initialRoute,
    blogSlug: initialBlogSlug,
  });
  const { asset } = useSiteCustomization();
  const ogImage = asset("meta.og.image").src;

  const goBooking = () => navigate("booking");
  const scrollToReel = () => {
    const el = document.getElementById("reel");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <RouteSeoTags route={route} ogImage={ogImage} />
      {route !== "admin" && <Navbar route={route} navigate={navigate} />}

      <main className="flex-1">
        {route === "home" && (
          <>
            <CinematicHero onCheckDate={goBooking} onWatch={scrollToReel} />
            <TrustBar />
            <StorySection navigate={navigate} />
            <CertificatesSection />
            <SignatureActs />
            <EventTypesGrid navigate={navigate} />
            <VideoReel />
            <PackagesTeaser navigate={navigate} />
            <TestimonialsStrip />
            <CitiesStrip />
            <FaqTeaser navigate={navigate} />
            <BookingStrip navigate={navigate} />
          </>
        )}
        {route === "about" && <AboutView navigate={navigate} />}
        {route === "services" && <ServicesView navigate={navigate} />}
        {route === "packages" && <PackagesView navigate={navigate} />}
        {route === "gallery" && <GalleryView navigate={navigate} />}
        {route === "testimonials" && <TestimonialsView navigate={navigate} />}
        {route === "booking" && <BookingWizard />}
        {route === "blog" && <BlogView navigate={navigate} initialSlug={blogSlug} />}
        {route === "faq" && <FaqView navigate={navigate} />}
        {route === "contact" && <ContactView navigate={navigate} />}
        {route === "legal" && <LegalView />}
        {route === "admin" && <AdminConsole navigate={navigate} />}
      </main>

      {route !== "admin" && <Footer navigate={navigate} />}
    </div>
  );
}

export function SiteShell({
  initialRoute,
  initialBlogSlug,
}: {
  initialRoute: RouteId;
  initialBlogSlug: string | null;
}) {
  return (
    <SiteCustomizationProvider>
      <Site initialRoute={initialRoute} initialBlogSlug={initialBlogSlug} />
    </SiteCustomizationProvider>
  );
}
