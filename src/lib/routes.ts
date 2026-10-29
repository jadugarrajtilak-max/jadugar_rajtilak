import type { RouteId } from "./content";

// ── Route table — shared, environment-free ────────────────────
// Pure, no "use client": both the server page (middleware-stamped
// x-pathname) and the client History router resolve URLs through
// this one module so they can never disagree.
export const VALID: RouteId[] = [
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
  "udaipur",
  "svcWedding",
  "svcCorporate",
  "svcBirthday",
  "svcCollege",
  "svcVirtual",
  "svcPrivate",
  "destWedding",
];

// Legacy hash URLs (#/about) and friendly aliases resolve to real routes.
export const ALIASES: Record<string, RouteId> = {
  shows: "services",
  reviews: "testimonials",
  journal: "blog",
};

// Keyword money pages — the public URL differs from the internal route id
// so the route table stays readable while the URL carries the exact search
// phrase ("magician in udaipur" — the strongest local keyword). The seven
// service money pages (audit T-13/R-18..R-22/O-01) follow the same pattern:
// URL carries the commercial keyword, route id stays internal.
const MONEY_PATHS: Partial<Record<RouteId, string>> = {
  udaipur: "/magician-in-udaipur",
  svcWedding: "/services/wedding-magician",
  svcCorporate: "/services/corporate-shows",
  svcBirthday: "/services/birthday-kids",
  svcCollege: "/services/college-stage",
  svcVirtual: "/services/virtual-magic",
  svcPrivate: "/services/private-luxury",
  destWedding: "/destination-wedding-magician-udaipur",
};

export function routeToPath(route: RouteId): string {
  if (route === "home") return "/";
  const money = MONEY_PATHS[route];
  if (money) return money;
  return `/${route}`;
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
  // Money pages: /magician-in-udaipur & friends resolve through the path map.
  for (const [routeId, path] of Object.entries(MONEY_PATHS)) {
    if (raw === path.replace(/^\/+/, "")) return { route: routeId as RouteId, blogSlug: null };
  }
  if ((VALID as string[]).includes(head)) return { route: head as RouteId, blogSlug: null };
  if (ALIASES[head]) return { route: ALIASES[head], blogSlug: null };
  return { route: "home", blogSlug: null };
}
