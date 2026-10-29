import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone is only for the sandbox/self-hosted preview server.
  // On Vercel it must stay off — the platform injects its own runtime.
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Hide the dev-mode route indicator badge — it overlapped page content in QA
  devIndicators: false,
  // Allow the sandbox preview domain to hit dev assets without warnings
  allowedDevOrigins: ["*.space-z.ai"],
  // Real, crawlable URLs: every public page path serves the SPA shell
  // (client router renders the matching view + per-route SEO meta).
  // Aliases keep legacy /shows, /reviews, /journal links working.
  async rewrites() {
    const pages = [
      "/about",
      "/services",
      "/packages",
      "/gallery",
      "/testimonials",
      "/booking",
      "/blog",
      "/blog/:slug",
      "/faq",
      "/contact",
      "/legal",
      "/admin",
      "/shows",
      "/reviews",
      "/journal",
      "/journal/:slug",
      // Local money pages (SEO audit A-02) — exact keyword URLs.
      "/magician-in-udaipur",
      // Dedicated service money pages (audit T-13 / roadmap R-18, R-19,
      // R-20, R-22 + O-01, 2026-10-29) — one URL per commercial keyword.
      "/services/wedding-magician",
      "/services/corporate-shows",
      "/services/birthday-kids",
      "/services/college-stage",
      "/services/virtual-magic",
      "/services/private-luxury",
      "/destination-wedding-magician-udaipur",
    ];
    return pages.map((source) => ({ source, destination: "/" }));
  },
  // SEO cleanup (audit N-02 / T-06, 2026-10-28): the two near-duplicate
  // “Magician in Udaipur booking guide” posts consolidated into the new
  // /magician-in-udaipur money page, and the auto-generated post slug
  // renamed to a keyword slug in the CMS — permanent redirects keep
  // every existing link and Google's index flowing to the right page.
  async redirects() {
    return [
      {
        source: "/blog/magician-in-udaipur-2026-booking-guide",
        destination: "/magician-in-udaipur",
        permanent: true,
      },
      {
        source: "/blog/magician-in-udaipur-the-complete-2026-booking-guide",
        destination: "/magician-in-udaipur",
        permanent: true,
      },
      {
        source: "/blog/post-20261024",
        destination: "/blog/jadugar-udaipur-shaadi-magic-show-guide",
        permanent: true,
      },
    ];
  },
  // Technical SEO + hardened security headers (doc 11)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Content-Security-Policy",
            // Pragmatic CSP: GA4 + gtag inline bootstrap allowed; everything
            // else must come from this origin. frame-ancestors blocks
            // clickjacking of the admin console.
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com",
              "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
            ].join("; "),
          },
        ],
      },
      {
        source: "/images/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // Admin-uploaded images can be replaced at any time — always revalidate.
        source: "/uploads/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;
