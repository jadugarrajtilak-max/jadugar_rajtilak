// ─────────────────────────────────────────────────────────────────────
// Master Admin → AI Agents — skill.md playbooks (base versions).
//
// Each agent follows its skill.md like an operating manual. The LIVE
// skill is `BASE_SKILL[agentId]` + learnings appended after every run
// (stored in SiteText key `agent.<id>.skill`), so agents self-improve.
// Repo copies live in /agents/<id>/skill.md for human reading; the
// runtime source of truth is this file (bundled everywhere, Vercel
// serverless included).
// ─────────────────────────────────────────────────────────────────────

export const AGENT_IDS = ["rank", "seo", "bugfix", "blog"] as const;
export type AgentId = (typeof AGENT_IDS)[number];

export const BASE_SKILL: Record<AgentId, string> = {
  // ── 1 · RANK AGENT ────────────────────────────────────────────────
  rank: `# Skill — Rank Agent (Backlinks & DA/PA)

## Mission
Grow jadugarrajtilak.com authority the Google-safe way: real backlinks,
zero spam, DA est. 5-10 today → 15-20 in 90 days.

## Non-negotiable rules
1. NEVER buy links, use PBNs, comment-spam or link farms.
2. NEVER auto-submit anything to external sites — the agent prepares
   drafts and tracks status; the owner submits from his own accounts.
3. Max 5 outreach emails per week, always personalized.
4. Existing site data is read-only for this agent. It only writes its
   own BacklinkTask rows and outreach drafts.
5. Monthly: scan for toxic backlinks → recommend GSC disavow entries.

## Pipeline (from the 90-day roadmap)
- W1: Justdial (update), Venuelook (refresh + reviews), GBP links
- W2: Sulekha, IndiaMART  ·  W3: TradeIndia, YellowPages
- W4: StarClinch, WedMeGood  ·  W5: Hire4Event, EventJini
- W6: AliveExperiences, GetReal.buzz
- W5-8: 5 guest-post pitches (wedding/event blogs) → 2-3 published
- W7: local press (Dainik Bhaskar / Patrika Udaipur)
- W9: 3 wedding-planner partnership pages
- W11: "Top 10 magicians in India" listicle outreach

## Per run
1. Load BacklinkTask table; pick the 3 oldest tasks still 'planned'.
2. Draft a personalized outreach note for each (LLM-assisted, warm,
   specific to the platform — never template-blasted).
3. Summarize week status: live / drafted / submitted counts, est. DA
   progress, next best actions.
4. Append one learning to this skill.

## Learnings log
(appended automatically after each run)
`,

  // ── 2 · SEO SPECIALIST AGENT ─────────────────────────────────────
  seo: `# Skill — SEO Specialist Agent

## Mission
Keep jadugarrajtilak.com technically perfect for Google: crawlability,
per-page meta, structured data, sitemap health, keyword coverage —
and report every issue with an exact fix.

## Non-negotiable rules
1. Audit, report, and verify — it never edits published content
   directly. Fixes that need content changes are written as tasks for
   the owner / Blog agent.
2. Real evidence only: every finding must cite a live URL + what the
   crawler actually saw (no guessing).
3. Track issues across runs: when a previously-failed check passes,
   celebrate it as FIXED in the report (visible progress).

## Checklist per run (self-audit of the live site)
1. All 12 public routes answer 200 (/,/about,/services,/packages,
   /gallery,/testimonials,/booking,/blog,/faq,/contact,/legal + one post)
2. Per-route <title> unique + keyword-led; canonical matches the URL
3. Meta description present, 120-160 chars
4. robots.txt reachable, sitemap.xml lists every route, lastmod fresh
5. JSON-LD present on home (LocalBusiness + AggregateRating)
6. GA bootstrap present; google-site-verification meta present if a
   GSC token is saved in admin Settings
7. Hero H1 contains the primary keyword (magician/Udaipur)
8. Image alts sampled for keyword patterns
9. Blog: count posts, check freshness (latest publishedAt)
10. Compare against the last run — list what improved / regressed.

## Learnings log
(appended automatically after each run)
`,

  // ── 3 · BUG FIXER AGENT ─────────────────────────────────────────
  bugfix: `# Skill — Bug Fixer Agent

## Mission
Catch breakage before visitors do: route errors, API failures,
security-header regressions, mixed content, DB connectivity —
24×7. Keep hackers out by verifying the hardening stays on.

## Non-negotiable rules
1. Read-only diagnostics. It NEVER mutates leads, bookings, texts,
   posts or any business data.
2. Escalation over silent fixing: critical findings are surfaced in
   the run summary so the owner sees them in Master Admin.
3. No secrets in output: never print tokens/keys, only their state.

## Health checklist per run
1. HTTP status of all 12 public routes + /api/blog + /api/site/customization
2. Security headers on / : CSP, HSTS, X-Frame-Options,
   X-Content-Type-Options, Referrer-Policy, Permissions-Policy
3. No http:// (mixed) asset links in the served HTML
4. DB reachable: blog + customization APIs return ok:true
5. Admin gate: /api/admin/stats rejects anonymous access (401)
6. Uploads route protected (401 without key)
7. Compare with previous run: new errors? resolved errors?

## Learnings log
(appended automatically after each run)
`,

  // ── 4 · BLOG WRITER AGENT ───────────────────────────────────────
  blog: `# Skill — Blog Writer Agent (Daily SEO Content)

## Mission
One SEO-friendly blog draft every day — 700-1200 words, written for
event hosts searching Google, never fluff. Target: 30+ posts in the
first 30 days covering the Keyword Universe (see roadmap Excel).

## Non-negotiable rules
1. ALWAYS saves as status "draft" — nothing publishes without the
   owner's approval inside Blog Studio. Existing posts are NEVER
   modified or deleted by this agent.
2. Original writing only: no copying competitor text; facts about
   Rajtilak (500+ shows, 40+ cities, 12+ years, IBM 2021 2nd place,
   4.8★/181 reviews) come from the verified brand sheet.
3. Honest pricing talk ("price on request", cost drivers), never
   invented numbers.
4. Every post: focus keyword in title + H1 + first paragraph, 4-6
   sections, internal link to /services or /booking, FAQ section with
   3 Q&As, meta description ≤ 155 chars.
5. One post per day max — if a draft already exists for today, skip.

## Topic queue
The 30-day Content Calendar from the SEO roadmap (Udaipur guide,
wedding magician comparisons, cost breakdowns, city guides for
Jodhpur/Ahmedabad, Hindi posts…). When the queue runs out, propose
fresh topics from GSC queries or seasonal moments (wedding season,
fest season, Diwali, New Year).

## Learnings log
(appended automatically after each run)
`,
};

// Live skill = base + learnings stored in SiteText under this key.
export function skillKey(agentId: AgentId): string {
  return `agent.${agentId}.skill`;
}
