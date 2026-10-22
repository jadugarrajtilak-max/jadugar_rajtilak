import { headers } from "next/headers";
import { SiteShell } from "@/components/site/site-shell";
import { parseRoutePath } from "@/lib/routes";

// Server component — reads the middleware-stamped pathname so deep
// links (/about, /gallery, /blog/<slug>, legacy /shows …) server-render
// the correct view and per-route <title>/description/canonical in the
// raw HTML that crawlers and link previews consume. Without this the
// SPA shell shipped the home meta for every URL (duplicate meta issue).
export const dynamic = "force-dynamic";

export default async function Page() {
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/";
  const { route, blogSlug } = parseRoutePath(pathname);

  return (
    <SiteShell initialRoute={route} initialBlogSlug={blogSlug} />
  );
}
