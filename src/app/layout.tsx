import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { db } from "@/lib/db";
import { TEXT_LINE_MAP } from "@/lib/customization";

// Self-hosted fonts for speed and privacy (doc 4.1)
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Brand domain — canonical home once DNS is pointed at the production host
const SITE_URL = "https://jadugarrajtilak.com";

// Google Analytics 4 — visitor measurement (user's property).
// The shipped default is overridden by the Master Admin → Settings →
// Analytics & Verification card (saved as a SiteText line) so the key
// can be changed without a redeploy. Same for the Search Console
// ownership token below.
const GA_ID = TEXT_LINE_MAP["seo.ga.measurementId"]?.value || "G-103JFH1Z6B";

// Server-side lookup of the admin-saved keys. Falls back to the
// shipped defaults when the DB is unreachable (build-time, offline).
async function getSeoKeys(): Promise<{ gaId: string; gscToken: string }> {
  const fallback = { gaId: GA_ID, gscToken: "" };
  try {
    const rows = await db.siteText.findMany({
      where: { key: { in: ["seo.ga.measurementId", "seo.gsc.verificationToken"] } },
      select: { key: true, value: true },
    });
    const map = new Map(rows.map((r) => [r.key, r.value]));
    return {
      gaId: map.get("seo.ga.measurementId") || GA_ID,
      gscToken: (map.get("seo.gsc.verificationToken") || "").trim(),
    };
  } catch {
    return fallback;
  }
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Versioned icon URLs — busts browser/favicon caches when assets change
  icons: {
    icon: [{ url: "/images/icon-v2.png", type: "image/png", sizes: "512x512" }],
    apple: [{ url: "/images/apple-icon-v2.png", type: "image/png", sizes: "180x180" }],
  },
  // NOTE: no `title`, `description`, `canonical`, `openGraph` or `twitter`
  // here on purpose — page.tsx server-renders the per-route tags
  // (site-shell RouteSeoTags) from the middleware pathname. A layout-level
  // copy of any of these would render a SECOND tag first in <head>, and
  // crawlers read the first: every deep link would inherit the home
  // description + canonical "/" (duplicate-content signal — the exact bug
  // fixed 2026-10-24). og/twitter for non-JS scrapers (WhatsApp previews)
  // are also rendered per-route by RouteSeoTags, which SSRs into raw HTML.
  keywords: [
    "Jadugar Rajtilak",
    "best magician in India",
    "magician in India",
    "magician for wedding India",
    "wedding magician India",
    "corporate magician India",
    "hire magician India",
    "book magician online India",
    "stage magician India",
    "birthday party magician India",
    "kids birthday magician",
    "mentalist India",
    "magic show price in India",
    "close-up magician India",
    "college fest magician",
    "magician in Udaipur",
    "magician Udaipur Rajasthan",
    "wedding magician Rajasthan",
    "event entertainment Udaipur",
    "best magician in Rajasthan",
  ],
  authors: [{ name: "Jadugar Rajtilak" }],
  creator: "Jadugar Rajtilak",
  publisher: "Jadugar Rajtilak",
  // (canonical / openGraph / twitter intentionally omitted — see the
  // comment above the keywords block; RouteSeoTags renders all of them
  // per-route into the server-rendered HTML.)
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  manifest: "/manifest.webmanifest",
  category: "Entertainment",
};

export const viewport: Viewport = {
  themeColor: "#2a1b3d",
  width: "device-width",
  initialScale: 1,
};

// Sitewide structured data — NAP and rating verified against the live
// Google Business Profile (kgmid /g/11c1p4hlsk, Shiv Colony Bedla Udaipur).
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["EntertainmentBusiness", "LocalBusiness"],
      "@id": `${SITE_URL}/#business`,
      name: "Jadugar Rajtilak",
      alternateName: "Magician Rajtilak",
      description:
        "Live magic shows and event entertainment by Jadugar Rajtilak — stage illusions, wedding magic, corporate shows, birthday acts, college fest headline sets and private salon evenings across India.",
      url: SITE_URL,
      telephone: "+919799468758",
      email: "jadugar.rajtilak@gmail.com",
      priceRange: "₹₹₹",
      image: `${SITE_URL}/images/hero-portrait-v2.jpg`,
      logo: `${SITE_URL}/images/logo-full-v2.png`,
      address: {
        "@type": "PostalAddress",
        streetAddress: "Shiv Colony, Bedla",
        addressLocality: "Udaipur",
        addressRegion: "Rajasthan",
        postalCode: "313001",
        addressCountry: "IN",
      },
      geo: { "@type": "GeoCoordinates", latitude: 24.5674, longitude: 73.6736 },
      areaServed: [
        { "@type": "City", name: "Udaipur" },
        { "@type": "City", name: "Jaipur" },
        { "@type": "City", name: "Jodhpur" },
        { "@type": "City", name: "Ahmedabad" },
        { "@type": "State", name: "Rajasthan" },
        { "@type": "Country", name: "India" },
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        reviewCount: 181,
        bestRating: "5",
        worstRating: "1",
      },
      sameAs: [
        "https://www.google.com/search?kgmid=/g/11c1p4hlsk&q=Jadugar+Rajtilak",
        "https://www.facebook.com/rajtilak.jadugar",
        "https://www.instagram.com/p/DCJ3hBhg8xh/",
        "https://www.justdial.com/Udaipur-Rajasthan/Jadugar-Rajtilak-Opposite-Hotel-Rajkamal-Bhuwana/9999PX294-X294-180528141553-G5M2_BZDET",
      ],
      makesOffer: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Wedding Magic Show" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Corporate Magic Show" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Birthday Magic Show" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "College Fest Illusion Show" } },
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Jadugar Rajtilak",
      publisher: { "@id": `${SITE_URL}/#business` },
      inLanguage: "en-IN",
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: "Jadugar Rajtilak — Magician in Udaipur, Rajasthan",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#business` },
      primaryImageOfPage: `${SITE_URL}/images/hero-portrait-v2.jpg`,
    },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { gaId, gscToken } = await getSeoKeys();
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Google Search Console ownership proof — the token saved in
            Master Admin → Settings. Renders in raw HTML so Google's
            verifier (which does not execute JS) can read it. */}
        {gscToken ? <meta name="google-site-verification" content={gscToken} /> : null}
        {/* Geo meta — local SEO signal for Udaipur, Rajasthan */}
        <meta name="geo.region" content="IN-RJ" />
        <meta name="geo.placename" content="Udaipur" />
        <meta name="geo.position" content="24.5674;73.6736" />
        <meta name="ICBM" content="24.5674, 73.6736" />
      </head>
      <body
        className={`${cormorant.variable} ${inter.variable} antialiased bg-background text-foreground`}
      >
        {/* Pre-hydration mobile menu fallback. On slow phones a tap on the
            3-dot button in the first seconds after load did nothing —
            React had not hydrated yet, so no click handler existed. This
            tiny native listener (registered before anything else in the
            body) toggles data-jr-menu on <html>; globals.css shows the
            server-rendered panel from that attribute, and nav buttons
            carry data-jr-nav paths so they navigate via a full page load.
            The moment React hydrates, Navbar sets window.__jrHydrated and
            this listener steps aside — React owns the menu from then on. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
  document.addEventListener('click', function(e){
    if (window.__jrHydrated) return;
    var t = e.target && e.target.closest ? e.target.closest('[data-jr-menu-toggle]') : null;
    if (t) {
      var root = document.documentElement;
      if (root.getAttribute('data-jr-menu') === 'open') {
        root.removeAttribute('data-jr-menu');
        document.body.style.overflow = '';
      } else {
        root.setAttribute('data-jr-menu', 'open');
        document.body.style.overflow = 'hidden';
      }
      return;
    }
    var nav = e.target && e.target.closest ? e.target.closest('[data-jr-nav]') : null;
    if (nav) {
      var href = nav.getAttribute('data-jr-nav');
      if (href) {
        document.documentElement.removeAttribute('data-jr-menu');
        document.body.style.overflow = '';
        window.location.assign(href);
      }
    }
  }, true);
})();`,
          }}
        />
        {/* Google Analytics 4 — deferred until the first real user signal
            (pointerdown / keydown / wheel / touchstart) with an 8s idle
            fallback. A ~180 KB third-party script otherwise sits on
            the mobile critical path (LCP/TBT); deferring it keeps the lab
            and field numbers fast while losing almost nothing: window.
            dataLayer is a plain queue that gtag.js drains on arrival, and
            the client router's page_view pushes queue up correctly even
            before the script lands. Real users interact within seconds;
            truly interaction-less bounces are the only (acceptable) loss.
            The measurement ID is the Master Admin → Settings value. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
  var GID='${gaId}';
  if(!/^G-[A-Za-z0-9]{4,}$/.test(GID)) return;
  function load(){
    if(window.__gaLoaded) return; window.__gaLoaded=1;
    window.dataLayer=window.dataLayer||[];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', GID, { anonymize_ip: true });
    var s=document.createElement('script');
    s.async=true;
    s.src='https://www.googletagmanager.com/gtag/js?id='+GID;
    document.head.appendChild(s);
  }
  var ev=['pointerdown','keydown','wheel','touchstart'];
  function trig(){ load(); cleanup(); }
  function cleanup(){
    for(var i=0;i<ev.length;i++) window.removeEventListener(ev[i],trig,true);
    clearTimeout(t);
  }
  var t=setTimeout(trig,8000);
  for(var j=0;j<ev.length;j++) window.addEventListener(ev[j],trig,{once:true,capture:true,passive:true});
})();`,
          }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
