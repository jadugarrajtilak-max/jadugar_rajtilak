"use client";

import { useMemo, useState } from "react";
import { Search, Info, CheckCircle2, AlertTriangle, XCircle, Monitor, Smartphone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { evaluateSeo, serpPreview } from "@/lib/seo";

// ─────────────────────────────────────────────────────────────
// Blog editor with live SEO guidance panel (doc 9.3 / Prompt 6)
// Internal 0-100 checklist score, SERP preview, clearly labelled
// "guidance score — NOT a Google score". No stuffing encouraged.
// ─────────────────────────────────────────────────────────────

const SAMPLE_BODY = `Every wedding evening has one moment everyone photographs. This guide is about engineering that moment deliberately, with a magician who has staged [N] sangeet sets across [N] cities.

The first decision is where magic fits your timeline: table-side sets during cocktails, a staged twenty minutes between the band and the DJ, or a full reception finale. Each slot changes the act that should be booked — close-up for roaming hours, parlour for the stage between speeches.

Table of contents with anchor links is generated automatically. Internal links below are suggestions from existing pages: packages, wedding show page, booking calendar. External authority: cite the venue's own events page when claiming stage dimensions.`;

export function SeoPanel() {
  const [focusKeyword, setFocusKeyword] = useState("wedding magician");
  const [title, setTitle] = useState("9 Ways a Magician Elevates a Wedding Evening");
  const [slug, setSlug] = useState("wedding-magician-ideas");
  const [meta, setMeta] = useState(
    "Where does magic fit a wedding timeline? Nine staging ideas from cocktail-hour close-up to the reception finale — plus how to brief your magician."
  );
  const [body, setBody] = useState(SAMPLE_BODY);
  const [internalLinks, setInternalLinks] = useState(3);
  const [externalLinks, setExternalLinks] = useState(1);
  const [hasImage, setHasImage] = useState(true);
  const [hasAlt, setHasAlt] = useState(true);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const h2Count = useMemo(() => (body.match(/^##\s.+$/gm) ?? []).length, [body]);

  const { score, checks } = useMemo(
    () =>
      evaluateSeo({
        focusKeyword,
        title,
        slug,
        metaDescription: meta,
        body,
        internalLinks,
        externalLinks,
        hasFeaturedImage: hasImage,
        imageAltText: hasAlt,
        h2Count,
      }),
    [focusKeyword, title, slug, meta, body, internalLinks, externalLinks, hasImage, hasAlt, h2Count]
  );

  const serp = serpPreview(title, slug, meta);
  const scoreColor = score >= 80 ? "#3e8e8a" : score >= 55 ? "#b8923a" : "#b3263e";

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-3xl font-semibold text-[#2a1b3d]">Blog editor · SEO panel</h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-[#5b5266]">
          <Info className="h-4 w-4 text-[#b8923a]" aria-hidden="true" />
          The score is internal guidance modelled on Google&apos;s helpful-content principles —{" "}
          <strong className="text-[#2a1b3d]">not a Google score</strong>. Quality beats checklist-chasing.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        {/* editor */}
        <div className="space-y-5 rounded-3xl border border-[#e3d9c6] bg-[#fffdf7] p-6 sm:p-8">
          <div>
            <Label htmlFor="seo-kw" className="text-sm font-semibold text-[#2a1b3d]">
              Focus keyword <span className="font-normal text-[#5b5266]">(one primary keyword per URL)</span>
            </Label>
            <Input
              id="seo-kw"
              value={focusKeyword}
              onChange={(e) => setFocusKeyword(e.target.value)}
              className="mt-2 border-[#ddd2bc] bg-[#faf6ee]"
              placeholder="e.g. wedding magician"
            />
          </div>
          <div>
            <Label htmlFor="seo-title" className="text-sm font-semibold text-[#2a1b3d]">
              Title <span className="font-normal text-[#5b5266]">{title.length} chars · aim 50–60</span>
            </Label>
            <Input
              id="seo-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 border-[#ddd2bc] bg-[#faf6ee]"
              placeholder="Post title"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="seo-slug" className="text-sm font-semibold text-[#2a1b3d]">
                URL slug
              </Label>
              <Input
                id="seo-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="mt-2 border-[#ddd2bc] bg-[#faf6ee]"
                placeholder="post-slug"
              />
            </div>
            <div>
              <Label htmlFor="seo-links" className="text-sm font-semibold text-[#2a1b3d]">
                Internal links
              </Label>
              <Input
                id="seo-links"
                type="number"
                min={0}
                value={internalLinks}
                onChange={(e) => setInternalLinks(Math.max(0, Number(e.target.value)))}
                className="mt-2 border-[#ddd2bc] bg-[#faf6ee]"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="seo-meta" className="text-sm font-semibold text-[#2a1b3d]">
              Meta description <span className="font-normal text-[#5b5266]">{meta.length} chars · aim 120–160</span>
            </Label>
            <textarea
              id="seo-meta"
              value={meta}
              onChange={(e) => setMeta(e.target.value)}
              rows={2}
              className="mt-2 w-full rounded-xl border border-[#ddd2bc] bg-[#faf6ee] px-4 py-3 text-[15px] outline-none transition-colors focus:border-[#b8923a] focus:ring-2 focus:ring-[#b8923a]/25"
            />
          </div>
          <div>
            <Label htmlFor="seo-body" className="text-sm font-semibold text-[#2a1b3d]">
              Body <span className="font-normal text-[#5b5266]">(use ## for H2 subheadings)</span>
            </Label>
            <textarea
              id="seo-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              className="mt-2 w-full rounded-xl border border-[#ddd2bc] bg-[#faf6ee] px-4 py-3 text-[15px] leading-7 outline-none transition-colors focus:border-[#b8923a] focus:ring-2 focus:ring-[#b8923a]/25"
            />
          </div>
          <div className="flex flex-wrap gap-5">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[#5b5266]">
              <input type="checkbox" checked={hasImage} onChange={(e) => setHasImage(e.target.checked)} className="h-4 w-4 accent-[#b3263e]" />
              Featured image set
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[#5b5266]">
              <input type="checkbox" checked={hasAlt} onChange={(e) => setHasAlt(e.target.checked)} className="h-4 w-4 accent-[#b3263e]" />
              Alt text on all images
            </label>
            <div className="flex items-center gap-2 text-sm text-[#5b5266]">
              External links:
              <Input
                type="number"
                min={0}
                value={externalLinks}
                onChange={(e) => setExternalLinks(Math.max(0, Number(e.target.value)))}
                className="h-9 w-20 border-[#ddd2bc] bg-[#faf6ee]"
                aria-label="External links count"
              />
            </div>
          </div>
        </div>

        {/* guidance sidebar */}
        <div className="space-y-5">
          <div className="rounded-3xl border border-[#e3d9c6] bg-[#fffdf7] p-6">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#2a1b3d]">
                <Search className="h-4 w-4 text-[#b8923a]" aria-hidden="true" /> SEO guidance score
              </p>
              <span className="font-display text-3xl font-semibold" style={{ color: scoreColor }}>
                {score}
                <span className="text-base text-[#5b5266]">/100</span>
              </span>
            </div>
            <Progress value={score} className="mt-3 h-2.5 [&>div]:rounded-full" aria-label={`SEO score ${score} out of 100`} />
            <p className="mt-3 text-xs leading-5 text-[#5b5266]">
              Internal checklist only. Google does not publish a single SEO score; no one can
              guarantee rankings (doc §1). Focus on helpful, people-first content.
            </p>
          </div>

          {/* SERP preview */}
          <div className="rounded-3xl border border-[#e3d9c6] bg-[#fffdf7] p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-[#2a1b3d]">SERP preview</p>
              <div className="flex overflow-hidden rounded-full border border-[#ddd2bc]">
                <button
                  onClick={() => setDevice("desktop")}
                  aria-pressed={device === "desktop"}
                  className={`flex h-8 w-9 items-center justify-center ${device === "desktop" ? "bg-[#2a1b3d] text-[#faf6ee]" : "text-[#5b5266]"}`}
                  aria-label="Desktop preview"
                >
                  <Monitor className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDevice("mobile")}
                  aria-pressed={device === "mobile"}
                  className={`flex h-8 w-9 items-center justify-center ${device === "mobile" ? "bg-[#2a1b3d] text-[#faf6ee]" : "text-[#5b5266]"}`}
                  aria-label="Mobile preview"
                >
                  <Smartphone className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className={`rounded-2xl border border-[#e3d9c6] bg-white p-4 ${device === "mobile" ? "max-w-[340px]" : ""}`}>
              <p className="text-[11px] text-[#5b5266]">jadugarrajtilak.com › journal › {serp.url.split("/").pop()}</p>
              <p className="mt-1 text-[18px] leading-snug text-[#1a0d27] hover:underline" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
                {serp.truncatedTitle}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-[#5b5266]">{serp.truncatedMeta}</p>
            </div>
          </div>

          {/* checklist */}
          <div className="rounded-3xl border border-[#e3d9c6] bg-[#fffdf7] p-6">
            <p className="mb-4 text-sm font-semibold text-[#2a1b3d]">Live checklist</p>
            <ul className="max-h-96 space-y-3.5 overflow-y-auto scroll-slim pr-1">
              {checks.map((c) => (
                <li key={c.id} className="flex items-start gap-3">
                  {c.status === "pass" ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#3e8e8a]" aria-hidden="true" />
                  ) : c.status === "warn" ? (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#b8923a]" aria-hidden="true" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#b3263e]" aria-hidden="true" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-[#2a1b3d]">{c.rule}</p>
                    <p className="text-xs text-[#5b5266]">{c.detail}</p>
                    {c.status !== "pass" && c.fix && (
                      <p className="mt-0.5 text-xs italic text-[#b8923a]">Fix: {c.fix}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <Button className="w-full rounded-full bg-[#b3263e] hover:bg-[#c2314c]">
            Publish post (draft in sandbox)
          </Button>
        </div>
      </div>

      {/* ── Off-page & local SEO roadmap ── */}
      <OffPagePlan />
    </div>
  );
}

// ── Off-page, local & technical SEO roadmap (executed outside the site) ──
type OffItem = {
  title: string;
  detail: string;
  status: "live" | "todo";
};

const OFFPAGE_GROUPS: { group: string; note: string; items: OffItem[] }[] = [
  {
    group: "Google Business Profile — the #1 local ranking lever",
    note: "Already indexed: kgmid /g/11c1p4hlsk · 4.8★ · 181 reviews",
    items: [
      { title: "Claim & verify ownership", detail: "Sign in as the profile owner (jadugar.rajtilak@gmail.com) so posts, photos and the website link can be managed.", status: "todo" },
      { title: "Add the website link + booking UTM", detail: "Website field → https://jadugarrajtilak.com with ?utm_source=google&utm_medium=gbp so profile clicks are measurable.", status: "todo" },
      { title: "Weekly photo posts", detail: "One real show photo per week (the gallery folder doubles as the posting queue). Profiles posting weekly rank visibly higher in the local pack.", status: "todo" },
      { title: "Share the review short-link", detail: "g.page/r/…/review — hand it to every happy host. Ask for 'magician in Udaipur' mentions in reviews; never incentivise.", status: "todo" },
      { title: "Q&A seeding", detail: "Add the top 3 FAQs (price range, travel, safety) as public Q&A on the profile, answered from the FAQ page.", status: "todo" },
    ],
  },
  {
    group: "Citations & directories — NAP consistency",
    note: "Exact same name / phone / address everywhere: Jadugar Rajtilak · +91 97994 68758 · Shiv Colony, Bedla, Udaipur, Rajasthan 313001",
    items: [
      { title: "Justdial listing", detail: "Already live (photos are sourced from it). Claim it, refresh photos, and link the website.", status: "live" },
      { title: "Sulekha + IndiaMART", detail: "Create event-services listings under Magicians in Udaipur with the same NAP.", status: "todo" },
      { title: "Wedding directories", detail: "WedMeGood, Wedded Bliss, Eventjini vendor profiles — wedding-intent traffic converts best.", status: "todo" },
      { title: "Bing Places + Apple Maps", detail: "Duplicate the Google profile data; secondary maps feed many voice and iOS searches.", status: "todo" },
    ],
  },
  {
    group: "Social & content signals",
    note: "Off-page authority is earned, not built overnight — one channel done well beats five done badly.",
    items: [
      { title: "Instagram Reels channel", detail: "15-30s clips of the confetti finale and volunteer reactions; bio links to the booking page. Reels are the discovery engine for entertainers in India.", status: "todo" },
      { title: "YouTube showreel", detail: "One 2-3 minute showreel; embed on the site reel section and add timestamps (YouTube chapters appear in search).", status: "todo" },
      { title: "Journal cadence", detail: "Publish the 4 drafted posts (wedding ideas, pricing, checklist, corporate) one per fortnight — 8 weeks of fresh content.", status: "todo" },
    ],
  },
  {
    group: "Local backlinks — Rajasthan / Udaipur",
    note: "A handful of genuinely relevant local links beats mass directory spam.",
    items: [
      { title: "Wedding planners & venues", detail: "Udaipur is a wedding destination — ask 3-5 planners and venues you have performed for to list you on their vendor pages.", status: "todo" },
      { title: "Event recaps with schools & fests", detail: "Institutions you performed for (school annual days, fest nights) often publish recap posts — request a credit link.", status: "todo" },
      { title: "Press & interviews", detail: "One local-press feature (Dainik Bhaskar Udaipur / Rajasthan Patrika events desk) on the 181-review milestone.", status: "todo" },
    ],
  },
];

function OffPagePlan() {
  return (
    <section className="rounded-3xl border border-[#e3d9c6] bg-[#fffdf7] p-6 sm:p-8" aria-labelledby="offpage-title">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="offpage-title" className="font-display text-2xl font-semibold text-[#2a1b3d]">
          Off-page & local SEO roadmap
        </h2>
        <p className="text-xs text-[#5b5266]">
          Executed outside the site — this panel tracks the plan
        </p>
      </div>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5b5266]">
        On-page and technical SEO are handled inside the site (per-route titles, real NAP in
        structured data, sitemap, robots, canonicals, image alt text). Off-page work happens on
        Google, directories and social — tick items off as they are completed.
      </p>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {OFFPAGE_GROUPS.map((g) => (
          <div key={g.group} className="rounded-2xl border border-[#e3d9c6] bg-[#faf6ee] p-5">
            <p className="text-sm font-semibold text-[#2a1b3d]">{g.group}</p>
            <p className="mt-1 text-xs italic text-[#b8923a]">{g.note}</p>
            <ul className="mt-4 space-y-3">
              {g.items.map((it) => (
                <li key={it.title} className="flex items-start gap-2.5">
                  {it.status === "live" ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#3e8e8a]" aria-hidden="true" />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-[#b8923a]/60"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium text-[#2a1b3d]">
                      {it.title}
                      {it.status === "live" && <span className="ml-2 rounded-full bg-[#3e8e8a]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#3e8e8a]">live</span>}
                    </p>
                    <p className="text-xs leading-5 text-[#5b5266]">{it.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-5 rounded-xl bg-[#f3ead3]/50 p-4 text-xs leading-5 text-[#5b5266]">
        Technical SEO shipped with the site: real crawlable path URLs (/about, /services, …) with
        per-route canonical, Open Graph and Twitter cards; XML sitemap listing every page; robots
        rules; LocalBusiness JSON-LD with the verified 4.8★/181-review rating and Udaipur NAP; geo
        meta tags; live-editable image alt text (Images tab); PWA manifest; favicon set; and
        security headers.
      </p>
    </section>
  );
}
