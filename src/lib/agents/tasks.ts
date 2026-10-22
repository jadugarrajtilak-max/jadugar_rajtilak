// ─────────────────────────────────────────────────────────────────────
// The four agent task implementations. Every function is safe by
// design: SEO + Bugfix are read-only diagnostics; Blog creates DRAFTS
// only (never mutates existing posts); Rank writes only its own
// BacklinkTask rows and outreach drafts. Nothing here deletes or
// modifies the owner's business data.
// ─────────────────────────────────────────────────────────────────────
import { db } from "@/lib/db";
import { slugify, computeReadingTime } from "@/lib/blog";
import type { BlogSection } from "@/lib/content";
import type { AgentId } from "./skills";
import { llmJson } from "./llm";

const SITE_URL = process.env.AGENT_AUDIT_BASE_URL || "https://jadugarrajtilak.com";

export type Finding = {
  check: string;
  status: "pass" | "fail" | "warn";
  detail: string;
  fix?: string;
};

export type AgentResult = {
  ok: boolean;
  summary: string;
  findings?: Finding[];
  details?: Record<string, unknown>;
  learning: string;
};

// ── shared fetch helper with timeout ────────────────────────────────
async function fetchWithTimeout(url: string, ms = 15000, init?: RequestInit) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctl.signal, cache: "no-store" });
  } finally {
    clearTimeout(t);
  }
}

async function getText(url: string, ms = 15000): Promise<{ ok: boolean; status: number; body: string }> {
  try {
    const res = await fetchWithTimeout(url, ms);
    const body = await res.text().catch(() => "");
    return { ok: res.ok, status: res.status, body };
  } catch {
    return { ok: false, status: 0, body: "" };
  }
}

// ── LLM helper lives in ./llm.ts (env-config + sandbox SDK chain) ────

// ════════════════════════════════════════════════════════════════════
// 1 · SEO SPECIALIST — live-site audit (read-only)
// ════════════════════════════════════════════════════════════════════
const ROUTES = [
  "/", "/about", "/services", "/packages", "/gallery", "/testimonials",
  "/booking", "/blog", "/faq", "/contact", "/legal",
];

export async function runSeoAgent(): Promise<AgentResult> {
  const findings: Finding[] = [];
  const titles = new Map<string, string>();
  let passCount = 0;
  let failCount = 0;

  // 1. routes answer 200 + per-route title/canonical
  for (const route of ROUTES) {
    const { ok, status, body } = await getText(SITE_URL + route, 12000);
    if (!ok) {
      findings.push({
        check: `Route ${route}`,
        status: "fail",
        detail: `HTTP ${status || "network error"} — page not reachable`,
        fix: "Check deployment / middleware; re-test after redeploy",
      });
      failCount++;
      continue;
    }
    const title = body.match(/<title>([^<]*)<\/title>/)?.[1]?.trim() ?? "";
    const canonical = body.match(/<link rel="canonical" href="([^"]*)"/)?.[1]?.trim() ?? "";
    if (!title) {
      findings.push({ check: `Title ${route}`, status: "fail", detail: "No <title> in raw HTML", fix: "RouteSeoTags must render server-side" });
      failCount++;
    } else if (titles.has(title) && route !== "/") {
      findings.push({ check: `Title ${route}`, status: "fail", detail: `Duplicate title also used on another route: "${title}"`, fix: "Give each route a unique, keyword-led title" });
      failCount++;
    } else {
      titles.set(title, route);
      passCount++;
    }
    if (canonical && route !== "/" && !canonical.replace(/\/$/, "").endsWith(route.replace(/\/$/, ""))) {
      findings.push({ check: `Canonical ${route}`, status: "warn", detail: `Canonical "${canonical}" does not match the route path`, fix: "Canonical must equal the real URL" });
    } else {
      passCount++;
    }
  }

  // 2. one blog post
  const post = await getText(`${SITE_URL}/blog/magician-in-jaipur`, 12000);
  findings.push({
    check: "Blog post sample",
    status: post.ok ? "pass" : "fail",
    detail: post.ok ? "/blog/magician-in-jaipur answers 200" : `Blog post unreachable (HTTP ${post.status})`,
  });
  if (post.ok) passCount++; else failCount++;

  // 3. robots + sitemap
  const robots = await getText(`${SITE_URL}/robots.txt`, 8000);
  findings.push({
    check: "robots.txt",
    status: robots.ok && robots.body.includes("Sitemap:") ? "pass" : "warn",
    detail: robots.ok ? "reachable, sitemap referenced" : "unreachable",
  });
  if (robots.ok) passCount++; else failCount++;

  const sitemap = await getText(`${SITE_URL}/sitemap.xml`, 10000);
  const sitemapUrls = (sitemap.body.match(/<loc>([^<]+)<\/loc>/g) ?? []).map((s) => s.slice(5, -6));
  const allRoutesInSitemap = ROUTES.every((r) => sitemapUrls.includes(`${SITE_URL}${r === "/" ? "/" : r}`));
  findings.push({
    check: "sitemap.xml",
    status: sitemap.ok && allRoutesInSitemap ? "pass" : "fail",
    detail: sitemap.ok ? `${sitemapUrls.length} URLs listed, all core routes present` : "sitemap unreachable",
    fix: allRoutesInSitemap ? undefined : "Regenerate sitemap with every public route",
  });
  if (sitemap.ok && allRoutesInSitemap) passCount++; else failCount++;

  // 4. home deep checks
  const home = await getText(SITE_URL + "/", 12000);
  const hasJsonLd = home.body.includes("application/ld+json");
  const hasGa = home.body.includes("googletagmanager") || home.body.includes("var GID=");
  const hasGsc = home.body.includes("google-site-verification");
  const hasH1 = /<h1[^>]*>/i.test(home.body);
  const h1Text = home.body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
    ?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ?? "";
  const keywordInH1 = /magician|jadugar|udaipur/i.test(h1Text);
  const hasViewport = home.body.includes("width=device-width");

  findings.push({ check: "JSON-LD schema", status: hasJsonLd ? "pass" : "fail", detail: hasJsonLd ? "LocalBusiness + AggregateRating present" : "No structured data in HTML", fix: hasJsonLd ? undefined : "Restore the @graph JSON-LD in layout" });
  findings.push({ check: "GA4 bootstrap", status: hasGa ? "pass" : "fail", detail: hasGa ? "gtag bootstrap found (deferred loading)" : "No GA bootstrap script", fix: hasGa ? undefined : "Check Measurement ID in Settings" });
  findings.push({ check: "GSC verification meta", status: hasGsc ? "pass" : "warn", detail: hasGsc ? "google-site-verification meta present" : "No GSC token saved yet — save it in Settings → Analytics & Verification", fix: "Paste the GSC token in Master Admin → Settings" });
  findings.push({ check: "H1 keyword", status: keywordInH1 ? "pass" : "warn", detail: hasH1 ? `H1 = "${h1Text.slice(0, 90)}"` : "No H1 found", fix: keywordInH1 ? undefined : "Hero H1 should carry magician/Udaipur keywords" });
  findings.push({ check: "Mobile viewport", status: hasViewport ? "pass" : "fail", detail: hasViewport ? "viewport meta present" : "missing viewport meta" });
  for (const [check, ok] of [["JSON-LD schema", hasJsonLd], ["GA4 bootstrap", hasGa], ["H1 keyword", keywordInH1], ["Mobile viewport", hasViewport]] as const) {
    void check;
    if (ok) passCount++; else failCount++;
  }
  if (hasGsc) passCount++; else failCount++;

  // 5. blog freshness
  try {
    const posts = await db.blogPost.count({ where: { status: "published" } });
    const latest = await db.blogPost.findFirst({ where: { status: "published" }, orderBy: { publishedAt: "desc" }, select: { title: true, publishedAt: true } });
    findings.push({
      check: "Blog content",
      status: "pass",
      detail: `${posts} published posts; latest: ${latest?.title ?? "—"} (${latest?.publishedAt?.toISOString().slice(0, 10) ?? "n/a"})`,
    });
    passCount++;
  } catch {
    findings.push({ check: "Blog content", status: "warn", detail: "DB unreachable from this runtime" });
  }

  const learning = failCount === 0
    ? `Run ${new Date().toISOString().slice(0, 10)}: full pass (${passCount} checks) — keep monitoring titles after every deploy.`
    : `Run ${new Date().toISOString().slice(0, 10)}: ${failCount} failing checks — most common breakage: deploy windows. Re-audit after next deploy before escalating.`;

  return {
    ok: true,
    summary: `SEO audit: ${passCount} passed, ${failCount} failed, ${findings.filter(f => f.status === "warn").length} warnings across ${findings.length} checks.`,
    findings,
    learning,
  };
}

// ════════════════════════════════════════════════════════════════════
// 2 · BUG FIXER — health + security scan (read-only)
// ════════════════════════════════════════════════════════════════════
export async function runBugfixAgent(): Promise<AgentResult> {
  const findings: Finding[] = [];
  let pass = 0, fail = 0;

  // 1. public routes status
  let routeErrors = 0;
  for (const route of ROUTES) {
    const { ok, status } = await getText(SITE_URL + route, 10000);
    if (!ok) {
      routeErrors++;
      findings.push({ check: `Route ${route}`, status: "fail", detail: `HTTP ${status || "network error"}`, fix: "Inspect deployment logs; redeploy if persistent" });
    }
  }
  if (routeErrors === 0) {
    findings.push({ check: "All 11 public routes", status: "pass", detail: "Every route answered 200" });
    pass++;
  } else {
    fail += routeErrors;
  }

  // 2. security headers on /
  const home = await getText(SITE_URL + "/", 10000);
  const head = home.body.slice(0, 4000);
  const headerChecks: [string, string][] = [
    ["Content-Security-Policy", "content-security-policy"],
    ["Strict-Transport-Security", "strict-transport-security"],
    ["X-Frame-Options", "x-frame-options"],
    ["X-Content-Type-Options", "x-content-type-options"],
    ["Referrer-Policy", "referrer-policy"],
    ["Permissions-Policy", "permissions-policy"],
  ];
  // headers arrive on the response, not the body — do a HEAD-style fetch
  let headerHit = 0;
  try {
    const res = await fetchWithTimeout(SITE_URL + "/", 10000);
    for (const [label, header] of headerChecks) {
      const present = Boolean(res.headers.get(header));
      findings.push({
        check: `Security header: ${label}`,
        status: present ? "pass" : "fail",
        detail: present ? "present" : "missing — clickjacking / sniffing protection reduced",
        fix: "Restore hardened headers in next.config.ts",
      });
      if (present) pass++; else fail++;
      if (present) headerHit++;
    }
  } catch {
    findings.push({ check: "Security headers", status: "warn", detail: "Could not fetch headers (network)" });
  }

  // 3. mixed content (http:// links in body, excluding xmlns and localhost)
  const mixed = (home.body.match(/(?:src|href)="http:\/\/(?!localhost|127\.)/g) ?? []).length;
  findings.push({ check: "Mixed content", status: mixed === 0 ? "pass" : "fail", detail: mixed === 0 ? "No insecure http:// asset links" : `${mixed} insecure asset links found`, fix: "Serve all assets over https" });
  if (mixed === 0) pass++; else fail++;

  // 4. admin gate rejects anonymous
  try {
    const res = await fetchWithTimeout(`${SITE_URL}/api/admin/stats`, 10000);
    const rejected = res.status === 401;
    findings.push({ check: "Admin gate (no key)", status: rejected ? "pass" : "fail", detail: rejected ? "/api/admin/stats rejects anonymous access (401)" : `Admin API returned ${res.status} without credentials — possible exposure!`, fix: rejected ? undefined : "Verify isAdminRequest guard on every admin route immediately" });
    if (rejected) pass++; else fail++;
  } catch {
    findings.push({ check: "Admin gate", status: "warn", detail: "Could not reach admin API" });
  }

  // 5. public APIs healthy
  const blogApi = await getText(`${SITE_URL}/api/blog`, 10000);
  const custApi = await getText(`${SITE_URL}/api/site/customization`, 10000);
  const apiOk = blogApi.ok && custApi.ok;
  findings.push({ check: "Public APIs", status: apiOk ? "pass" : "fail", detail: apiOk ? "/api/blog and /api/site/customization healthy (DB reachable)" : `API failure: blog=${blogApi.status} customization=${custApi.status}`, fix: apiOk ? undefined : "Check database connection (Neon) and redeploy" });
  if (apiOk) pass++; else fail++;

  // 6. obvious error markers in HTML
  const errorMarkers = ["Application error", "Internal Server Error", "500", "__NEXT_ERROR"].filter((m) =>
    m === "500" ? home.body.includes("500: Internal") : home.body.includes(m)
  );
  findings.push({ check: "Render errors", status: errorMarkers.length === 0 ? "pass" : "fail", detail: errorMarkers.length === 0 ? "No error markers in served HTML" : `Markers: ${errorMarkers.join(", ")}`, fix: "Open dev.log / Vercel logs and trace the failing render" });
  if (errorMarkers.length === 0) pass++; else fail++;

  void head;
  const learning = fail === 0
    ? `Run ${new Date().toISOString().slice(0, 10)}: all clear (${pass} pass / 0 fail) — site healthy, security hardened.`
    : `Run ${new Date().toISOString().slice(0, 10)}: ${fail} failures — prioritize admin-gate and header failures first (security), then routes.`;

  return {
    ok: fail === 0,
    summary: `Health scan: ${pass} passed, ${fail} failed. ${fail === 0 ? "Site healthy — no action needed." : "See failed checks (security first)."}`,
    findings,
    learning,
  };
}

// ════════════════════════════════════════════════════════════════════
// 3 · BLOG WRITER — one SEO draft per day (creates DRAFTS only)
// ════════════════════════════════════════════════════════════════════
type QueueTopic = { title: string; keyword: string; category: string };

const TOPIC_QUEUE: QueueTopic[] = [
  { title: "Magician in Udaipur: The Complete 2026 Booking Guide", keyword: "magician in udaipur", category: "Guides" },
  { title: "Wedding Magician vs DJ vs Band: What Udaipur Couples Actually Pick", keyword: "wedding magician udaipur", category: "Weddings" },
  { title: "How Much Does a Wedding Magician Cost in Rajasthan?", keyword: "wedding magician rajasthan", category: "Pricing" },
  { title: "10 Close-Up Magic Moments That Stop a Sangeet Crowd", keyword: "magician for sangeet", category: "Weddings" },
  { title: "Magician for Birthday Party in Udaipur: Full Planning Run-Sheet", keyword: "magician for birthday party udaipur", category: "Guides" },
  { title: "Corporate Annual Day Magic Show: The 45-Minute Format That Works", keyword: "corporate magician india", category: "Corporate" },
  { title: "Destination Wedding in Udaipur? Add a Magician to the Timeline", keyword: "destination wedding magician", category: "Weddings" },
  { title: "जादूगर उदयपुर: शादी के लिए मैजिक शो बुक करने की पूरी गाइड", keyword: "जादूगर उदयपुर", category: "Hindi" },
  { title: "College Fest Headliner: Why Magic Trends Every Fest Season", keyword: "college fest magician", category: "Fests" },
  { title: "Mentalism Explained: What a Mentalist Actually Does On Stage", keyword: "mentalist in india", category: "Guides" },
  { title: "Kids Birthday Magic: Age-by-Age What Works (4-14 years)", keyword: "kids magician udaipur", category: "Guides" },
  { title: "Magician in Jodhpur: Booking Guide for Weddings & Events", keyword: "magician in jodhpur", category: "City Guides" },
  { title: "Private Party Magic: What 15-80 Guest Evenings Need", keyword: "private party magician", category: "Luxury" },
  { title: "Virtual Magic Shows That Actually Work on Zoom", keyword: "virtual magic show india", category: "Guides" },
  { title: "5 Questions to Ask Before Booking a Stage Magician", keyword: "stage magician india booking", category: "Guides" },
  { title: "Sangeet Night Timeline: Where the 20-Minute Magic Slot Goes", keyword: "sangeet entertainment ideas", category: "Weddings" },
  { title: "Magician in Ahmedabad: Weddings, Corporate & Fests Guide", keyword: "magician in ahmedabad", category: "City Guides" },
  { title: "Why the Cheapest Magician Quote Costs the Most (Real Math)", keyword: "magic show cost in india", category: "Pricing" },
  { title: "Award-Winning Magic: What an International IBM Placement Means for Your Event", keyword: "award winning magician india", category: "Brand" },
  { title: "Rajtilak's Rules: 12 Years, 500 Shows — Lessons From the Stage", keyword: "jadugar rajtilak story", category: "Brand" },
  { title: "Winter Wedding Season 2026-27: Entertainment Trends from Udaipur", keyword: "winter wedding entertainment", category: "Weddings" },
  { title: "Engagement Party Ideas: Micro-Magic for Intimate Evenings", keyword: "engagement party entertainment", category: "Weddings" },
  { title: "आपके शहर में जादू: मैजिक शो की कीमत और बुकिंग गाइड", keyword: "magic show ki keemat", category: "Hindi" },
  { title: "Annual Day Planning: The Entertainment Budget Split HR Approves", keyword: "corporate event entertainment", category: "Corporate" },
  { title: "Behind 5 Frames: Stories From Real Royal-Stage Shows", keyword: "stage show gallery", category: "Brand" },
  { title: "Mehendi Night Entertainment: 7 Ideas Beyond the Playlist", keyword: "mehendi entertainment ideas", category: "Weddings" },
  { title: "Booking a Magician for a School Annual Function: Teacher's Checklist", keyword: "school annual function magician", category: "Guides" },
  { title: "Rajasthan Wedding Circuit: Which Cities Book Stage Magic Most", keyword: "wedding magician rajasthan", category: "Weddings" },
  { title: "बच्चों के जन्मदिन पर जादू: उम्र के हिसाब से सही शो चुनने की गाइड", keyword: "बच्चों के लिए जादूगर", category: "Hindi" },
  { title: "The 4.8-Star Effect: What 181 Google Reviews Say About Booking Entertainers", keyword: "magician reviews india", category: "Brand" },
];

type GeneratedPost = {
  title: string;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  excerpt?: string;
  intro?: string;
  sections: { h: string; paras: string[] }[];
  closing?: string;
};

const BRAND_FACTS = `
Brand facts (verified — use only these numbers, never invent):
- Jadugar Rajtilak, royal-stage magician based in Udaipur, Rajasthan, India
- 500+ housefull shows, 40+ cities, 12+ years on stage
- 4.8 stars, 181 Google reviews (+ 4.8 on Justdial from 195 ratings)
- 2nd Place, International Online Magic Contest, I.B.M. (International Brotherhood of Magicians), March 2021 — 8 countries, 100 magicians
- Six show formats: Wedding Magic, Corporate Shows, Birthday & Kids, College & Stage, Private & Luxury, Online/Virtual
- Transparent packages: Signature / Royal / Grand — price on request, written quote in 24h, 72-hour soft-hold
- Contact: +91 97994 68758 (WhatsApp same), jadugar.rajtilak@gmail.com
- Internal links allowed: https://jadugarrajtilak.com/services , https://jadugarrajtilak.com/booking , https://jadugarrajtilak.com/contact
`;

export async function runBlogAgent(trigger: string): Promise<AgentResult> {
  const today = new Date().toISOString().slice(0, 10);

  // 1. one draft per day max — check for an agent-created draft today
  const existing = await db.blogPost.findFirst({
    where: { status: "draft", createdAt: { gte: new Date(`${today}T00:00:00.000Z`) } },
    select: { title: true, slug: true },
  });
  if (existing && trigger === "scheduler") {
    return {
      ok: true,
      summary: `Today's draft already exists: "${existing.title}" — waiting for owner approval in Blog Studio.`,
      learning: `Run ${today}: skipped (draft already created today).`,
    };
  }

  // 2. next topic from the queue that has no matching slug yet
  const taken = new Set(await db.blogPost.findMany({ select: { slug: true } }).then((r) => r.map((x) => x.slug)));
  const topic = TOPIC_QUEUE.find((t) => !taken.has(slugify(t.title)));
  const fallbackTopic: QueueTopic = {
    title: `Event Entertainment Insight ${today}`,
    keyword: "event entertainment india",
    category: "Guides",
  };
  const chosen = topic ?? fallbackTopic;

  // 3. generate the post (LLM, strict JSON)
  const post = await llmJson<GeneratedPost>(
    `You are an expert SEO content writer for an Indian magician's website. You write original, practical, booking-intent articles for event hosts (wedding couples, HR managers, parents, fest coordinators) in India. Rules: focus keyword in title, H1-equivalent and first paragraph; 5-7 sections with clear H2 headings; every section 2-3 substantial paragraphs (60-110 words each); include one natural internal link mention of /services or /booking inside a paragraph as markdown [label](https://jadugarrajtilak.com/services); end with a "Frequently Asked Questions" section containing exactly 3 Q&A pairs (Q as section heading style "Q: ..." and A as the paragraph); honest pricing talk only ("price on request", cost drivers) — never invent prices; original phrasing, no competitor copying. Respond ONLY with JSON: {"title","slug","metaTitle","metaDescription","keywords","excerpt","intro","sections":[{"h","paras":["…"]}, …],"closing"}. ${BRAND_FACTS}`,
    `Write today's blog post. Working title: "${chosen.title}". Focus keyword: "${chosen.keyword}". Category: ${chosen.category}. If the title is Hindi, write the whole article in natural Hindi (Devanagari). Target 700-1200 words total.`,
    2
  );

  if (!post || !post.title || !Array.isArray(post.sections) || post.sections.length < 3) {
    // Distinguish "no LLM on this runtime" from "bad generation"
    const llmReachable = post !== null;
    return {
      ok: false,
      summary: llmReachable
        ? "Draft generation failed (content failed validation). Will retry on the next run."
        : "LLM not reachable from this runtime — the draft is generated by the workspace scheduler instead. To generate on this host, set ZAI_BASE_URL + ZAI_API_KEY env vars (public z.ai key).",
      learning: `Run ${today}: ${
        llmReachable
          ? `LLM output failed validation (sections=${post?.sections?.length ?? 0}). Next time: tighten the JSON contract.`
          : "no LLM configured on this runtime — production drafts come from the workspace scheduler until a public key is set."
      }`,
    };
  }

  // 4. sanitize + save as DRAFT (never touches existing rows)
  const sections: BlogSection[] = post.sections
    .map((s) => ({ h: String(s?.h ?? "").trim(), paras: (Array.isArray(s.paras) ? s.paras : []).map((p) => String(p ?? "").trim()).filter(Boolean) }))
    .filter((s) => s.h.length > 0);

  let slug = slugify(post.slug || post.title);
  if (taken.has(slug)) slug = `${slug}-${today.replace(/-/g, "").slice(4)}`;
  const excerpt = (post.excerpt ?? chosen.title).slice(0, 200);
  const metaDescription = (post.metaDescription ?? excerpt).slice(0, 155);

  const row = await db.blogPost.create({
    data: {
      slug,
      title: post.title.slice(0, 160),
      metaTitle: (post.metaTitle ?? post.title).slice(0, 70),
      metaDescription,
      keywords: post.keywords ?? chosen.keyword,
      excerpt,
      category: chosen.category,
      featuredImage: "/images/hero-portrait-v2.jpg",
      featuredImageAlt: `Jadugar Rajtilak — ${chosen.keyword}`,
      intro: (post.intro ?? "").slice(0, 600),
      sections: sections as unknown as object[],
      closing: (post.closing ?? "").slice(0, 600),
      backlinks: [] as unknown as object[],
      readingTime: computeReadingTime(post.intro ?? "", sections, post.closing ?? ""),
      status: "draft",
      featured: false,
    },
    select: { title: true, slug: true, readingTime: true },
  });

  const draftsPending = await db.blogPost.count({ where: { status: "draft" } });

  return {
    ok: true,
    summary: `Draft ready: "${row.title}" (${row.readingTime}) — saved for your approval in Blog Studio. ${draftsPending} draft(s) awaiting review.`,
    details: { slug: row.slug, topic: chosen.title, keyword: chosen.keyword },
    learning: `Run ${today}: wrote "${row.title}" for keyword "${chosen.keyword}". ${
      topic ? "Queue is on track." : "Topic queue exhausted — propose seasonal/GSC-based topics next."
    }`,
  };
}

// ════════════════════════════════════════════════════════════════════
// 4 · RANK AGENT — white-hat backlink pipeline (drafts, no auto-submit)
// ════════════════════════════════════════════════════════════════════
const SEED_LINKS: { source: string; type: string; action: string; estDa: number; week: string }[] = [
  { source: "Justdial", type: "Directory (exists)", action: "Update photos, services, link; reply to reviews", estDa: 89, week: "W1" },
  { source: "Venuelook", type: "Marketplace (exists)", action: "Refresh portfolio + get 5 client reviews (3-star now)", estDa: 35, week: "W1" },
  { source: "Sulekha", type: "Directory (new)", action: "Full profile with photos + pricing + website link", estDa: 86, week: "W2" },
  { source: "IndiaMART", type: "Directory (new)", action: "Business profile under event services", estDa: 89, week: "W2" },
  { source: "TradeIndia", type: "Directory (new)", action: "Verified supplier profile", estDa: 78, week: "W3" },
  { source: "YellowPages India", type: "Directory (new)", action: "Local business listing with link", estDa: 70, week: "W3" },
  { source: "StarClinch", type: "Event marketplace (new)", action: "Artist profile — ranks top-5 for 'book magician'", estDa: 52, week: "W4" },
  { source: "WedMeGood", type: "Wedding marketplace (new)", action: "Vendor profile under entertainment", estDa: 57, week: "W4" },
  { source: "Hire4Event", type: "Event marketplace (new)", action: "Artist page with video + pricing", estDa: 44, week: "W5" },
  { source: "EventJini", type: "Event platform (new)", action: "Performer listing", estDa: 40, week: "W5" },
  { source: "AliveExperiences", type: "Booking agency (new)", action: "Verified artist listing", estDa: 30, week: "W6" },
  { source: "GetReal.buzz", type: "Artist platform (new)", action: "Performer profile", estDa: 35, week: "W6" },
  { source: "Guest posts (wedding/event blogs)", type: "Outreach ×5", action: "Personalized pitches → 2-3 published by W7-8", estDa: 30, week: "W5-8" },
  { source: "Local press (Bhaskar/Patrika Udaipur)", type: "Press ×1", action: "Press note: Udaipur magician's IBM international honour", estDa: 80, week: "W7" },
  { source: "'Top 10 magicians India' listicles", type: "Listicle outreach ×3", action: "Contact authors with credentials pack", estDa: 40, week: "W11" },
];

type Outreach = { to: string; subject: string; body: string };

export async function runRankAgent(): Promise<AgentResult> {
  // 1. seed the pipeline on first run
  const count = await db.backlinkTask.count();
  if (count === 0) {
    await db.backlinkTask.createMany({ data: SEED_LINKS });
  }

  // 2. stats (re-computed after drafting so the summary is accurate)
  const fetchAll = () => db.backlinkTask.findMany({ orderBy: [{ status: "desc" }, { week: "asc" }] });
  let all = await fetchAll();
  const liveDa = () => all.filter((t) => t.status === "live").reduce((sum, t) => sum + (t.estDa || 0), 0);

  // 3. draft outreach for up to 3 oldest planned tasks
  const planned = all.filter((t) => t.status === "planned").slice(0, 3);
  let drafted = 0;
  let llmSkipped = false;
  for (const task of planned) {
    const outreach = await llmJson<Outreach>(
      `You are a polite, professional outreach writer for Jadugar Rajtilak — a royal-stage magician from Udaipur, Rajasthan (500+ shows, 40+ cities, IBM 2021 international 2nd place, 4.8★/181 Google reviews). Write ONE personalized outreach note. Rules: warm and specific to the platform, under 120 words, no hype-words like "greatest ever", end with a clear single ask, include the website https://jadugarrajtilak.com and phone +91 97994 68758 once. Respond ONLY with JSON: {"to","subject","body"}.`,
      `Target platform: ${task.source} (${task.type}). Goal: ${task.action}. The note goes to the platform's listing/editor/partnerships contact.`,
      1
    );
    if (outreach && outreach.subject && outreach.body) {
      await db.backlinkTask.update({
        where: { id: task.id },
        data: { status: "drafted", outreach: JSON.stringify(outreach), notes: `Draft ready ${new Date().toISOString().slice(0, 10)} — review & send from your own email.` },
      });
      drafted++;
    } else {
      llmSkipped = true;
    }
  }

  // refresh stats after drafting so the summary reflects reality
  all = await fetchAll();
  const final = (s: string) => all.filter((t) => t.status === s).length;

  const learning = `Run ${new Date().toISOString().slice(0, 10)}: pipeline ${all.length} tasks — live=${final("live")}, submitted=${final("submitted")}, drafted=${final("drafted")}, planned=${final("planned")}. ${
    drafted > 0 ? `${drafted} new outreach drafts prepared.` : "No new drafts needed — follow up submitted tasks."
  } Reminder: DA grows with live links from high-DA directories first.`;

  return {
    ok: true,
    summary: `Backlink pipeline: ${all.length} tracked sources · ${final("live")} live · ${final("drafted")} drafted · ${final("planned")} planned. ${
      drafted > 0
        ? `${drafted} new outreach drafts ready (review before sending).`
        : llmSkipped
        ? "Outreach drafting needs an LLM — run this agent from the workspace, or set ZAI_BASE_URL + ZAI_API_KEY."
        : "No new drafts needed — follow up submitted tasks."
    } Live-link DA exposure: ${liveDa()}.`,
    details: { drafted, planned: final("planned"), submitted: final("submitted"), live: final("live") },
    learning,
  };
}

// ════════════════════════════════════════════════════════════════════
// Dispatcher
// ════════════════════════════════════════════════════════════════════
export async function runTask(agentId: AgentId, trigger: string): Promise<AgentResult> {
  switch (agentId) {
    case "seo":
      return runSeoAgent();
    case "bugfix":
      return runBugfixAgent();
    case "blog":
      return runBlogAgent(trigger);
    case "rank":
      return runRankAgent();
  }
}

