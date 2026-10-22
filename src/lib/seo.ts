// ─────────────────────────────────────────────────────────────
// SEO guidance checklist (doc 9.3) — internal score, 0-100.
// Labelled in UI as guidance, NOT a Google score (doc rule).
// Follows Google's published helpful-content guidance: quality
// over length, no keyword stuffing, people-first writing.
// ─────────────────────────────────────────────────────────────

export type SeoCheckStatus = "pass" | "warn" | "fail";

export type SeoCheck = {
  id: string;
  rule: string;
  status: SeoCheckStatus;
  detail: string;
  fix?: string;
  weight: number;
};

export type SeoPostDraft = {
  focusKeyword: string;
  title: string;
  slug: string;
  metaDescription: string;
  body: string; // plain text for analysis
  internalLinks: number;
  externalLinks: number;
  hasFeaturedImage: boolean;
  imageAltText: boolean;
  h2Count: number;
};

const countWords = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

function avgSentenceLength(text: string): number {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (!sentences.length) return 0;
  return countWords(text) / sentences.length;
}

export function evaluateSeo(draft: SeoPostDraft): {
  score: number;
  checks: SeoCheck[];
} {
  const kw = draft.focusKeyword.trim().toLowerCase();
  const title = draft.title.trim();
  const meta = draft.metaDescription.trim();
  const slug = draft.slug.trim().toLowerCase();
  const bodyLower = draft.body.toLowerCase();
  const first100 = draft.body.trim().split(/\s+/).slice(0, 100).join(" ").toLowerCase();
  const words = countWords(draft.body);
  const checks: SeoCheck[] = [];

  const kwIn = (s: string) => kw.length > 0 && s.includes(kw);

  // Focus keyword placement (natural use, no stuffing)
  checks.push({
    id: "kw-title",
    rule: "Focus keyword in title",
    status: kwIn(title.toLowerCase()) ? "pass" : "fail",
    detail: kwIn(title.toLowerCase()) ? "Present in title tag." : "Not found in the title.",
    fix: "Work the keyword naturally into the first half of the title.",
    weight: 12,
  });
  checks.push({
    id: "kw-intro",
    rule: "Keyword in first 100 words",
    status: kwIn(first100) ? "pass" : "fail",
    detail: kwIn(first100) ? "Found in the introduction." : "Not found in the first 100 words.",
    fix: "Open the post by naming the topic plainly — readers and crawlers both orient faster.",
    weight: 10,
  });
  checks.push({
    id: "kw-h2",
    rule: "Keyword in one H2",
    status: draft.h2Count === 0 ? "fail" : kwIn(bodyLower) ? "pass" : "warn",
    detail:
      draft.h2Count === 0
        ? "No H2 subheadings detected."
        : "Detected in body — verify it appears in a subheading.",
    fix: "Use the keyword in one descriptive H2; keep other headings varied.",
    weight: 8,
  });
  checks.push({
    id: "kw-slug",
    rule: "Keyword in URL slug",
    status: kwIn(slug) ? "pass" : "warn",
    detail: kwIn(slug) ? "Slug contains the keyword." : "Slug does not contain the keyword.",
    fix: "Shorten the slug and include the keyword, e.g. /wedding-magician-ideas.",
    weight: 6,
  });
  checks.push({
    id: "kw-meta",
    rule: "Keyword in meta description",
    status: kwIn(meta.toLowerCase()) ? "pass" : "warn",
    detail: kwIn(meta.toLowerCase()) ? "Present in meta description." : "Missing from meta description.",
    fix: "One natural mention with a benefit and a call to action.",
    weight: 6,
  });

  // Title tag length (50-60 chars guidance)
  const tLen = title.length;
  checks.push({
    id: "title-len",
    rule: "Title length 50–60 characters",
    status: tLen >= 50 && tLen <= 60 ? "pass" : tLen >= 45 && tLen <= 68 ? "warn" : "fail",
    detail: `Currently ${tLen} characters.`,
    fix: "Aim for 50–60 so the title is not truncated in results.",
    weight: 8,
  });

  // Meta description 120-160 with CTA
  const mLen = meta.length;
  checks.push({
    id: "meta-len",
    rule: "Meta description 120–160 characters",
    status: mLen >= 120 && mLen <= 160 ? "pass" : mLen >= 100 && mLen <= 180 ? "warn" : "fail",
    detail: `Currently ${mLen} characters.`,
    fix: "One benefit + one action ('Check your date') converts best.",
    weight: 8,
  });

  // Heading structure
  checks.push({
    id: "headings",
    rule: "Logical heading structure",
    status: draft.h2Count >= 2 ? "pass" : draft.h2Count === 1 ? "warn" : "fail",
    detail: `${draft.h2Count} H2 subheading${draft.h2Count === 1 ? "" : "s"} detected.`,
    fix: "Break the body into scannable sections with descriptive H2s.",
    weight: 8,
  });

  // Content depth — guidance only (quality over length)
  checks.push({
    id: "depth",
    rule: "Content depth (guidance)",
    status: words >= 600 ? "pass" : words >= 300 ? "warn" : "fail",
    detail: `${words} words. Guidance only — helpful beats long.`,
    fix: "Cover the topic fully: examples, one table or checklist, real photos.",
    weight: 8,
  });

  // Internal links (2-3 minimum)
  checks.push({
    id: "internal",
    rule: "At least 2 internal links",
    status: draft.internalLinks >= 2 ? "pass" : draft.internalLinks === 1 ? "warn" : "fail",
    detail: `${draft.internalLinks} internal link${draft.internalLinks === 1 ? "" : "s"}.`,
    fix: "Link to a service page, the booking page, or a related post with descriptive anchors.",
    weight: 8,
  });

  // External authoritative source
  checks.push({
    id: "external",
    rule: "1 authoritative external link",
    status: draft.externalLinks >= 1 ? "pass" : "warn",
    detail: draft.externalLinks >= 1 ? "External source linked." : "No external source yet.",
    fix: "Cite one authoritative source where claims are made.",
    weight: 4,
  });

  // Images
  checks.push({
    id: "images",
    rule: "Featured image + alt text",
    status: draft.hasFeaturedImage && draft.imageAltText ? "pass" : draft.hasFeaturedImage ? "warn" : "fail",
    detail: draft.hasFeaturedImage
      ? draft.imageAltText
        ? "Featured image with alt text set."
        : "Featured image set, alt text missing."
      : "No featured image.",
    fix: "Set a real photo with descriptive alt text (e.g. wedding-magic-show-jaipur.webp).",
    weight: 8,
  });

  // Readability
  const asl = avgSentenceLength(draft.body);
  checks.push({
    id: "readability",
    rule: "Readable sentences",
    status: asl > 0 && asl <= 20 ? "pass" : asl <= 25 ? "warn" : "fail",
    detail: asl > 0 ? `Average sentence length ${asl.toFixed(1)} words.` : "No body text yet.",
    fix: "Split sentences longer than ~25 words; vary rhythm.",
    weight: 6,
  });

  // Keyword stuffing guard (doc: no stuffing)
  if (kw) {
    const occurrences = bodyLower.split(kw).length - 1;
    const density = words > 0 ? (occurrences * kw.split(" ").length) / words : 0;
    checks.push({
      id: "stuffing",
      rule: "No keyword stuffing",
      status: density > 0.03 ? "fail" : density > 0.02 ? "warn" : "pass",
      detail: `Density ${(density * 100).toFixed(1)}% (${occurrences} uses).`,
      fix: "Use synonyms and natural phrasing — write for people first.",
      weight: 6,
    });
  } else {
    checks.push({
      id: "kw-set",
      rule: "Focus keyword set",
      status: "fail",
      detail: "No focus keyword chosen.",
      fix: "Pick exactly one primary keyword this post should target.",
      weight: 10,
    });
  }

  const total = checks.reduce((s, c) => s + c.weight, 0);
  const earned = checks.reduce(
    (s, c) => s + (c.status === "pass" ? c.weight : c.status === "warn" ? c.weight * 0.5 : 0),
    0
  );
  return { score: Math.round((earned / total) * 100), checks };
}

// SERP preview renderer helper
export function serpPreview(title: string, slug: string, meta: string) {
  const truncatedTitle = title.length > 62 ? title.slice(0, 59).trimEnd() + "…" : title;
  const truncatedMeta = meta.length > 165 ? meta.slice(0, 162).trimEnd() + "…" : meta;
  return { truncatedTitle, url: `jadugarrajtilak.com/${slug || "post-slug"}`, truncatedMeta };
}
