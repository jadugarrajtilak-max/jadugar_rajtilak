"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useSiteRouter, routeToPath, type RouteId } from "@/lib/router";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { StickyCta } from "@/components/site/sticky-cta";
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
import { FAQS, HINDI_POST_SLUGS, VIEW_META } from "@/lib/content";
import type { InitialPost } from "@/lib/post-types";
// Static import (not next/dynamic): the Udaipur money page is the highest
// organic-value URL on the site — it must ship fully formed in the raw
// first-byte HTML, with no streamed-chunk fallback in between.
import { UdaipurLandingView } from "@/components/views/udaipur-landing";

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
//
// SEO fix (2026-10-28): /blog/<slug> deep links now stamp the POST's
// own metaTitle/metaDescription, a self-referencing canonical and a
// BlogPosting JSON-LD block. Previously every post inherited the blog
// index's title/description and canonicalised to /blog — Google read
// all ~25 posts as duplicates of the index and ranked none of them.
function RouteSeoTags({ route, ogImage, post }: { route: RouteId; ogImage: string; post?: InitialPost | null }) {
  const isPost = route === "blog" && !!post;
  // SEO fix (manager audit T-07, 2026-10-29): Hindi posts also declare
  // og:locale hi_IN so social scrapers and search engines serve the
  // right language.
  const isHindiPost = isPost && HINDI_POST_SLUGS.includes(post!.slug);
  const meta = isPost
    ? {
        title: post!.metaTitle || post!.title,
        description: post!.metaDescription || post!.excerpt,
      }
    : VIEW_META[route] ?? VIEW_META.home;
  const canonicalPath = isPost ? `/blog/${post!.slug}` : routeToPath(route);
  const url = `${SITE_URL}${canonicalPath === "/" ? "/" : canonicalPath}`;
  const fullOg = `${SITE_URL}${ogImage}`;

  // SEO fix (manager audit T-17, 2026-10-29): FAQPage schema for the
  // VISIBLE on-page Q&A on /faq only — Google's guideline: every
  // Question/Answer pair in the markup must be present on the page.
  const faqLd = route === "faq"
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  const blogLd = isPost
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: (post!.metaTitle || post!.title).slice(0, 110),
        author: { "@type": "Person", name: post!.author || "Jadugar Rajtilak", url: `${SITE_URL}/about` },
        publisher: { "@id": `${SITE_URL}/#business` },
        datePublished: post!.publishedISO,
        dateModified: post!.updatedISO,
        ...(post!.featuredImage ? { image: `${SITE_URL}${post!.featuredImage}` } : {}),
        mainEntityOfPage: url,
        description: meta.description,
      }
    : null;

  return (
    <>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={fullOg} />
      <meta property="og:type" content={isPost ? "article" : "website"} />
      <meta property="og:site_name" content="Jadugar Rajtilak" />
      <meta property="og:locale" content={isHindiPost ? "hi_IN" : "en_IN"} />
      {isPost ? <meta property="article:published_time" content={post!.publishedISO} /> : null}
      {isPost ? <meta property="article:modified_time" content={post!.updatedISO} /> : null}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={fullOg} />
      {blogLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogLd) }} />
      ) : null}
      {faqLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      ) : null}
    </>
  );
}

function Site({
  initialRoute,
  initialBlogSlug,
  initialPost,
  initialPosts,
}: {
  initialRoute: RouteId;
  initialBlogSlug: string | null;
  initialPost?: InitialPost | null;
  initialPosts?: InitialPost[];
}) {
  const { route, blogSlug, navigate } = useSiteRouter({
    route: initialRoute,
    blogSlug: initialBlogSlug,
  });
  const { asset } = useSiteCustomization();
  const ogImage = asset("meta.og.image").src;

  // SEO fix (manager audit T-07, 2026-10-29): keep <html lang> in sync
  // when the client router navigates into / out of Hindi posts (the SSR
  // side — the first byte — is handled in layout.tsx via x-pathname).
  useEffect(() => {
    const isHindi = blogSlug ? HINDI_POST_SLUGS.includes(blogSlug) : false;
    document.documentElement.lang = isHindi ? "hi-IN" : "en-IN";
  }, [blogSlug]);

  const goBooking = () => navigate("booking");
  const scrollToReel = () => {
    const el = document.getElementById("reel");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <RouteSeoTags route={route} ogImage={ogImage} post={route === initialRoute ? initialPost : null} />
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
        {route === "blog" && <BlogView navigate={navigate} initialSlug={blogSlug} initialPost={initialPost} initialPosts={initialPosts} />}
        {route === "faq" && <FaqView navigate={navigate} />}
        {route === "contact" && <ContactView navigate={navigate} />}
        {route === "legal" && <LegalView />}
        {route === "admin" && <AdminConsole navigate={navigate} />}
        {route === "udaipur" && <UdaipurLandingView navigate={navigate} />}
      </main>

      {route !== "admin" && <Footer navigate={navigate} />}

      {/* Conversion layer — sticky Call/WhatsApp/Check-Date bar (mobile)
          + floating WhatsApp (desktop). Every tap is tracked as a
          first-party CtaClick so phone-channel leads show in admin. */}
      {route !== "admin" && <StickyCta onCheckDate={goBooking} />}
    </div>
  );
}

export function SiteShell({
  initialRoute,
  initialBlogSlug,
  initialPost,
  initialPosts,
}: {
  initialRoute: RouteId;
  initialBlogSlug: string | null;
  initialPost?: InitialPost | null;
  initialPosts?: InitialPost[];
}) {
  return (
    <SiteCustomizationProvider>
      <Site initialRoute={initialRoute} initialBlogSlug={initialBlogSlug} initialPost={initialPost} initialPosts={initialPosts} />
    </SiteCustomizationProvider>
  );
}
