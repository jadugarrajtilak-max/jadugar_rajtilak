import { db } from "@/lib/db";

// ─────────────────────────────────────────────────────────────
// Media lifecycle helpers — keep the MediaAsset tier lean.
// Uploaded images live as /api/media/<id> URLs. When a slot stops
// using one (replaced or reset), the row must be deleted so old
// images never linger (no orphans, no "flashback" of stale
// pictures, no storage bloat). Rows still referenced by ANY
// SiteAsset or BlogPost are always kept.
// ─────────────────────────────────────────────────────────────

const MEDIA_URL_RE = /^\/api\/media\/([a-z0-9]+)$/i;

/** Extract the MediaAsset id from a "/api/media/<id>" URL (else null). */
export function extractMediaId(src: string | null | undefined): string | null {
  if (!src) return null;
  const m = MEDIA_URL_RE.exec(src.trim());
  return m ? m[1] : null;
}

async function isReferenced(id: string): Promise<boolean> {
  // Static /images/... files are never "media" — only API URLs are.
  const asset = await db.siteAsset.findFirst({
    where: { src: { startsWith: `/api/media/${id}` } },
    select: { key: true },
  });
  if (asset) return true;
  const post = await db.blogPost.findFirst({
    where: { featuredImage: { startsWith: `/api/media/${id}` } },
    select: { slug: true },
  });
  return Boolean(post);
}

/**
 * Delete the MediaAsset row behind a "/api/media/<id>" URL — but only
 * when nothing else references it. Safe to call with any src string:
 * static file paths and defaults are ignored.
 */
export async function deleteMediaIfUnreferenced(src: string | null | undefined): Promise<void> {
  const id = extractMediaId(src);
  if (!id) return;
  try {
    if (await isReferenced(id)) return;
    await db.mediaAsset.delete({ where: { id } }).catch(() => {});
  } catch {
    // Never fail the parent operation because cleanup hiccupped.
  }
}

/** Delete several old-src URLs at once (best effort). */
export async function deleteMediaListIfUnreferenced(
  srcs: (string | null | undefined)[]
): Promise<void> {
  const ids = Array.from(
    new Set(srcs.map((s) => extractMediaId(s)).filter((x): x is string => Boolean(x)))
  );
  await Promise.all(ids.map((id) => deleteMediaIfUnreferenced(`/api/media/${id}`)));
}

/**
 * Garbage-collect orphaned uploads — MediaAsset rows older than
 * `olderThanMs` that no SiteAsset or BlogPost references (uploads
 * that were staged but never saved, or replaced without cleanup).
 * Runs inside the upload route so the table stays lean without
 * needing a cron job.
 */
export async function gcOrphanMedia(olderThanMs = 24 * 60 * 60 * 1000): Promise<number> {
  try {
    const cutoff = new Date(Date.now() - olderThanMs);
    const orphans = await db.mediaAsset.findMany({
      where: { createdAt: { lt: cutoff } },
      select: { id: true },
    });
    if (orphans.length === 0) return 0;
    const referenced = new Set<string>();
    for (const row of await db.siteAsset.findMany({ select: { src: true } })) {
      const id = extractMediaId(row.src);
      if (id) referenced.add(id);
    }
    for (const post of await db.blogPost.findMany({ select: { featuredImage: true } })) {
      const id = extractMediaId(post.featuredImage);
      if (id) referenced.add(id);
    }
    const doomed = orphans.filter((o) => !referenced.has(o.id)).map((o) => o.id);
    if (doomed.length === 0) return 0;
    await db.mediaAsset.deleteMany({ where: { id: { in: doomed } } });
    return doomed.length;
  } catch {
    return 0;
  }
}
