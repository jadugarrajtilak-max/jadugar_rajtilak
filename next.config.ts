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
    ];
    return pages.map((source) => ({ source, destination: "/" }));
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
