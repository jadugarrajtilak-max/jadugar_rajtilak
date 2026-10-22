import { NextResponse, type NextRequest } from "next/server";

// ── Per-route SSR meta for the SPA shell ──────────────────────
// next.config.ts rewrites every public path to the single "/" page,
// so the client router normally learns the real URL only after
// hydration. That means raw HTML for /about, /gallery, /blog/<slug>
// shipped the HOME <title>/description/canonical — duplicate meta for
// crawlers and shared-link previews. This middleware stamps the
// original pathname into a request header the server page reads, so
// the correct per-route SEO tags are server-rendered on first byte.
export function middleware(req: NextRequest) {
  const headers = new Headers(req.headers);
  headers.set("x-pathname", req.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Skip static assets, API routes and generated files — only the
  // HTML shell routes need the pathname header.
  matcher: [
    "/((?!api|_next/static|_next/image|images/|uploads/|favicon.ico|apple-icon.png|icon.png|robots.txt|sitemap.xml|manifest.webmanifest|logo.svg).*)",
  ],
};
