import type { RouteId } from "./content";

// ── Route table — shared, environment-free ────────────────────
// Pure, no "use client": both the server page (middleware-stamped
// x-pathname) and the client History router resolve URLs through
// this one module so they can never disagree.
const VALID: RouteId[] = [
  "home",
  "about",
  "services",
  "packages",
  "gallery",
  "testimonials",
  "booking",
  "blog",
  "faq",
  "contact",
  "legal",
  "admin",
];

// Legacy hash URLs (#/about) and friendly aliases resolve to real routes.
const ALIASES: Record<string, RouteId> = {
  shows: "services",
  reviews: "testimonials",
  journal: "blog",
};

export function routeToPath(route: RouteId): string {
  return route === "home" ? "/" : `/${route}`;
}

// /blog/<slug> deep links resolve to the blog route + the post slug.
export function parseRoutePath(pathname: string): { route: RouteId; blogSlug: string | null } {
  if (typeof pathname !== "string" || !pathname) return { route: "home", blogSlug: null };
  const raw = decodeURIComponent(pathname).replace(/^\/+/, "").split("?")[0].replace(/\/+$/, "");
  if (!raw) return { route: "home", blogSlug: null };
  const segments = raw.toLowerCase().split("/");
  const head = segments[0];
  if (head === "blog" || head === "journal") {
    const slug = segments[1] ?? null;
    return { route: "blog", blogSlug: slug && /^[a-z0-9-]{2,120}$/.test(slug) ? slug : null };
  }
  if ((VALID as string[]).includes(head)) return { route: head as RouteId, blogSlug: null };
  if (ALIASES[head]) return { route: ALIASES[head], blogSlug: null };
  return { route: "home", blogSlug: null };
}
