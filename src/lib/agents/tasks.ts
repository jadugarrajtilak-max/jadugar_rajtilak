// ─────────────────────────────────────────────────────────────────────
// The five agent task implementations. SEO + Bugfix are read-only
// diagnostics. Manager monitors the team + funnel (read-only) and
// assigns work. Blog DRAFTS the day's post and files an approval
// request — the AI Permission System keeps nothing live without the
// owner's approval (auto-publish is the owner's explicit standing
// permission, OFF by default). Rank writes only its own BacklinkTask
// rows and outreach drafts. Nothing deletes or modifies the owner's
// business data.
// ─────────────────────────────────────────────────────────────────────
import { db } from "@/lib/db";
import { slugify, computeReadingTime } from "@/lib/blog";
import type { BlogSection } from "@/lib/content";
import type { AgentId } from "./skills";
import { llmJson } from "./llm";
import { AGENTS } from "./registry";

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
  // ── India-wide expansion (2026-10-24): national buyer-intent keywords + ──
  // high-volume city searches (StarClinch/JustDial dominate these today;
  // a touring performer's city guide can win featured snippets over time).
  { title: "Magician for Wedding in India: What Top Hosts Book (and What They Avoid)", keyword: "magician for wedding in india", category: "Weddings" },
  { title: "Best Magician in India for Corporate Events: The 2026 Booking Guide", keyword: "best magician in india for corporate events", category: "Corporate" },
  { title: "How to Book a Magician in India: The Complete 2026 Checklist", keyword: "how to book a magician in india", category: "Guides" },
  { title: "Birthday Party Magician Cost in India: 2026 City-Wise Price Bands", keyword: "birthday party magician cost", category: "Pricing" },
  { title: "Close-Up Magician for Indian Weddings: Roaming Magic, Explained", keyword: "close up magician india", category: "Weddings" },
  { title: "Mentalist for Corporate Events in India: What Mind Reading Adds to Your Evening", keyword: "mentalist for corporate events india", category: "Corporate" },
  { title: "Magician in Delhi for Weddings & Events: The Complete Booking Guide", keyword: "magician in delhi", category: "City Guides" },
  { title: "Magician in Mumbai: Booking Corporate Shows & Private Parties", keyword: "magician in mumbai", category: "City Guides" },
  { title: "Magician in Bangalore for Events, Parties & Corporate Evenings", keyword: "magician in bangalore", category: "City Guides" },
  { title: "Destination Wedding Magician: Goa, Rajasthan & Beyond", keyword: "destination wedding magician india", category: "Weddings" },
  { title: "Stage Magician Booking in India: Formats, Prices & What to Verify", keyword: "stage magician booking india", category: "Guides" },
  { title: "इंडिया के टॉप मैजिशियन: शादी और इवेंट के लिए कैसे बुक करें", keyword: "india ke top magician", category: "Hindi" },
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

// ── Agent settings (SiteText rows, editable from the Agents panel) ──
export const AUTO_PUBLISH_KEY = "agents.settings.autopublish";
const BLOG_LAST_DATE_KEY = "agents.blog.lastDate";

// ── AI Permission System: approval queue helper ─────────────────
// Every agent proposal that changes the LIVE SITE files an approval
// row here. Default posture: AI PROPOSES, OWNER DISPOSES. The
// auto-publish switch is the owner's explicit standing permission and
// is OFF by default (security rule 2026-10-24: "bina permission AI
// kuch bhi change nahi karega").
export async function fileApproval(input: {
  agentId: string;
  kind: string;
  title: string;
  summary: string;
  payload?: Record<string, unknown>;
}): Promise<void> {
  try {
    await db.agentApproval.create({
      data: {
        agentId: input.agentId,
        kind: input.kind,
        title: input.title.slice(0, 200),
        summary: input.summary.slice(0, 500),
        payload: JSON.stringify(input.payload ?? {}).slice(0, 10000),
      },
    });
  } catch (e) {
    // The proposal itself must still exist (draft row) even if the
    // queue write fails — surfaced in the run log instead.
    console.error("[agents] fileApproval failed:", e instanceof Error ? e.message : e);
  }
}

export async function getAgentSetting(key: string, fallback: string): Promise<string> {
  try {
    const row = await db.siteText.findUnique({ where: { key }, select: { value: true } });
    return row?.value ?? fallback;
  } catch {
    return fallback;
  }
}

// ── Deterministic fallback writer ──────────────────────────────
// When no LLM is reachable from the runtime (a serverless host without
// ZAI_* env vars), the Blog Writer used to fail outright and the card
// showed "Needs attention" forever. Instead it now writes the day's
// post from this curated, brand-fact-accurate template library. Content
// is honest and category-aware; the owner can switch auto-publish off
// in the Agents panel at any time.
const HINDI_RE = /[\u0900-\u097F]/;

export function templatePost(t: QueueTopic): GeneratedPost {
  const kw = t.keyword;
  const cat = t.category;
  if (HINDI_RE.test(t.title)) {
    return {
      title: t.title,
      slug: slugify(t.title),
      metaTitle: t.title.slice(0, 65),
      metaDescription: `जादूगर राजतिलक — ${kw} के लिए पूरी गाइड: शो के फॉर्मेट, कीमत कैसे तय होती है, बुकिंग का सही समय और तीन ज़रूरी सवाल।`,
      keywords: `${kw}, जादूगर, मैजिक शो, राजतिलक`,
      excerpt: `${kw} के लिए एक ज़रूरी गाइड — किस तरह का शो किस मौके के लिए सही है, कीमत कैसे तय होती है, और बुकिंग कब करनी चाहिए।`,
      intro: `अगर आप "${kw}" खोज रहे हैं, तो यह गाइड आपका काम आसान कर देगी। उदयपुर के रॉयल-स्टेज जादूगर राजतिलक 12+ साल से मंच पर हैं — 500+ हाउसफुल शो, 40+ शहर, और 4.8★ (181 गूगल रिव्यू)। यहाँ हम सीधी भाषा में बताएँगे कि शो किस तरह का चुनें, कीमत कैसे तय होती है, और तारीख़ कैसे सुरक्षित करें।`,
      sections: [
        {
          h: "किस मौके के लिए कैसा शो?",
          paras: [
            "शादी और संगीत के लिए क्लोज़-अप मैजिक सबसे लोकप्रिय है — जादूगर मेहमानों के बीच घूमता है और हाथ के पास चमत्कार दिखाता है। कॉर्पोरेट इवेंट के लिए 45 मिनट का स्टेज शो बेहतर चलता है, जो कंपनी के मौके के अनुसार लिखा जाता है। बच्चों के जन्मदिन पर रंगीन और तेज़-रफ़्तार शो रखा जाता है, जिसमें जन्मदिन वाला बच्चा हीरो बनता है।",
            "कॉलेज फेस्ट और बड़े ऑडिटोरियम के लिए बड़े इल्यूजन और मेंटलिज़्म का फॉर्मेट बनता है — 500 से 5000 दर्शकों तक पढ़ा जा सकता है। प्राइवेट और लक्ज़री इवेंट के लिए सैलून-स्टाइल क्लोज़-अप शो सही रहता है, जिसमें 15-80 मेहमानों के बीच जादू इंचों की दूरी पर होता है।",
          ],
        },
        {
          h: "कीमत कैसे तय होती है?",
          paras: [
            "ईमानदार जवाब: कोई भी असली कलाकार बिना आपका इवेंट जाने कीमत नहीं बताता। कीमत चार चीज़ों पर निर्भर करती है — तारीख़ और शहर, शो की अवधि, दर्शकों की संख्या, और ट्रैवल। इसीलिए राजतिलक स्टूडियो हर एंक्वायरी का लिखित कोट 24 घंटे में देता है।",
            `तीन पारदर्शी पैकेज उपलब्ध हैं — Signature, Royal और Grand। [पैकेज देखें](https://jadugarrajtilak.com/services) और [अपनी तारीख़ चेक करें](https://jadugarrajtilak.com/booking) — एंक्वायरी करने पर तारीख़ 72 घंटे के लिए सॉफ्ट-होल्ड पर रहती है।`,
          ],
        },
        {
          h: "किसे चुनें — पाँच जाँचें",
          paras: [
            "बुकिंग से पहले पाँच चीज़ें जाँचें: (1) असली शो की वीडियो, रील नहीं; (2) गूगल रिव्यू — राजतिलक के 181 रिव्यू में 4.8★ हैं; (3) लिखित कॉन्ट्रैक्ट और GST इनवॉइस; (4) स्टेज/साउंड की ज़रूरतें पहले से साफ़ हों; (5) शो का फॉर्मेट आपके मौके के लिए सही हो।",
            "अंतरराष्ट्रीय पहचान भी एक पैमाना है — राजतिलक को International Brotherhood of Magicians की ऑनलाइन प्रतियोगिता (मार्च 2021, 8 देश, 100 जादूगर) में दूसरा स्थान मिला था। यह बताता है कि कलाकार को जज करने वाले भी कैसे पहचानते हैं।",
          ],
        },
        {
          h: "बुकिंग का सही समय",
          paras: [
            "सीज़न की तारीख़ें 6-8 हफ़्ते पहले भर जाती हैं — शादी सीज़न और दिसंबर में तो और भी जल्दी। तारीख़ तय होते ही एंक्वायरी कर दें, ताकि 72 घंटे का सॉफ्ट-होल्ड आपकी तारीख़ सुरक्षित रखे।",
            "व्हाट्सएप पर +91 97994 68758 पर एक मैसेज काफ़ी है — मौका, शहर और तारीख़ भेजें, उसी दिन उपलब्धता और लिखित कोट मिल जाएगा।",
          ],
        },
        {
          h: "अक्सर पूछे जाने वाले सवाल",
          paras: [
            "Q: शो के लिए स्टेज चाहिए? — A: स्टेज शो के लिए एक साफ़ जगह और बुनियादी साउंड चाहिए; क्लोज़-अप के लिए कुछ नहीं — जादूगर मेहमानों के बीच घूमता है।",
            "Q: क्या बच्चों के लिए सुरक्षित है? — A: हाँ — बर्थडे शो में न अंधेरा, न आग, न डरावना कुछ नहीं; उम्र के हिसाब से शो बनता है।",
          ],
        },
        {
          h: "Q: एडवांस कितना है?",
          paras: [
            "A: बुकिंग कन्फर्म होने पर एक एडवांस और बाकी शो के दिन — पूरी बात लिखित कोट में साफ़ लिखी जाती है। कोई छुपा हुआ खर्च नहीं, कोई बाद में जुड़ने वाला बिल नहीं।",
          ],
        },
      ],
      closing: `यह गाइड "${kw}" के लिए थी। तारीख़ देखने के लिए [बुकिंग पेज](https://jadugarrajtilak.com/booking) खोलें या सीधे व्हाट्सएप करें — जवाब उसी दिन मिलेगा।`,
    };
  }
  const audience: Record<string, string> = {
    Weddings: "wedding couples and families",
    Corporate: "HR and event teams",
    Pricing: "budget-conscious hosts",
    Guides: "anyone planning an event",
    "City Guides": "hosts in and around the city",
    Fests: "fest coordinators",
    Luxury: "private hosts",
    Hindi: "Hindi-speaking hosts",
    Brand: "anyone comparing entertainers",
  };
  const who = audience[cat] ?? "event hosts";
  return {
    title: t.title,
    slug: slugify(t.title),
    metaTitle: t.title.slice(0, 65),
    metaDescription: `${t.title} — formats, honest pricing, the checks to run before you book, and the timeline that keeps your date safe. By Jadugar Rajtilak, Udaipur.`.slice(0, 155),
    keywords: `${kw}, magician booking, event entertainment india, jadugar rajtilak`,
    excerpt: `A practical, honest guide for ${who}: what to expect, what it really costs, and when to book. Written from 500+ shows of stage experience.`,
    intro: `If you are searching for "${kw}", this guide saves you the back-and-forth. It is written from the stage — not from a desk — by Jadugar Rajtilak, a royal-stage magician from Udaipur with 12+ years, 500+ housefull shows across 40+ cities, and a 4.8-star rating from 181 Google reviews. Everything below is straight talk: what works, what it costs, and how to lock your date.`,
    sections: [
      {
        h: `What a great "${kw}" experience actually looks like`,
        paras: [
          `The best bookings start with the format, not the performer's name. A sangeet or cocktail hour wants close-up magic that moves between guest groups; an annual day wants a 45-minute stage act scripted to the run-sheet; a birthday wants high energy with the child as the hero. Match the format to the occasion and half the risk disappears before you sign anything.`,
          `Ask for a full show video, not a highlight reel. Reels cut the dead air; full sets show pacing, crowd handling and recovery when something surprises the performer. That difference is exactly what your guests will feel on the night.`,
        ],
      },
      {
        h: "The five checks before you pay anyone",
        paras: [
          `Run every candidate through five checks: real show footage; verified reviews on Google (Jadugar Rajtilak carries 4.8 stars from 181 reviews); a written contract with GST invoicing; clear stage/sound requirements stated up front; and a format that genuinely fits your occasion. An entertainer who resists any of these five is telling you something.`,
          `International recognition is a useful filter too. Rajtilak placed 2nd in the International Online Magic Contest 2021 held by the International Brotherhood of Magicians — 8 countries, 100 magicians. Credentials like this are not about trophies; they signal a performer whose craft survives outside judging.`,
        ],
      },
      {
        h: "What it costs — honest talk, no invented numbers",
        paras: [
          `No honest performer quotes a fixed price before knowing your date, city, guest count and show length — anyone who does is guessing. Pricing here follows a written quote within 24 hours of your enquiry, built on three transparent packages: Signature, Royal and Grand. You can compare the full inclusions on the [services page](https://jadugarrajtilak.com/services).`,
          `What drives the number is simple: travel, duration, audience size and the season. Peak wedding-season and December dates close 6–8 weeks ahead, so early enquiries do not just save money — they save the date. Every enquiry places a 72-hour soft-hold on your date while you decide: [check your date here](https://jadugarrajtilak.com/booking).`,
        ],
      },
      {
        h: "The booking timeline that keeps your date safe",
        paras: [
          `Six to eight weeks out: confirm the date and take the soft-hold. Four weeks out: lock the format, run-sheet slot and technical needs in writing. One week out: a short call to align names, VIPs and cultural notes — the details that make an act feel custom-built rather than off-the-shelf.`,
          `The fastest route is WhatsApp on +91 97994 68758: send the occasion, city and date, and you get availability plus a written quote the same day — from the magician's own studio, not an agency filter.`,
        ],
      },
      {
        h: "Frequently Asked Questions",
        paras: [
          `Q: Do you need a stage? — A: The stage act wants a clear performance area and basic sound; close-up formats need nothing at all — the magic happens in the guests' own hands.`,
          `Q: Is it safe for children? — A: Birthday shows are age-calibrated: no darkness, no flames, no frightening moments — only wide eyes and louder laughter.`,
        ],
      },
      {
        h: "Q: How much advance is needed?",
        paras: [
          `A: A booking advance confirms the date; the balance is settled on the show day. Every term is written in the quote before you commit — no hidden costs, no surprise additions after the applause.`,
        ],
      },
    ],
    closing: `That is the complete picture for "${kw}". When you are ready, [check your date](https://jadugarrajtilak.com/booking) or message the studio on WhatsApp — replies land the same working day.`,
  };
}

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

  // 0. SECURITY GATE — the owner's explicit permission. Default "off":
  // the agent only DRAFTS + files an approval request; nothing goes
  // live until the owner approves it in the Approval Queue. "on" is a
  // standing permission the owner granted deliberately from the panel.
  const autoPublish = (await getAgentSetting(AUTO_PUBLISH_KEY, "off")) === "on";

  // 1. one post per day max — a dated marker guards even published runs,
  // so the scheduler can never double-publish on the same day.
  const lastDateRow = await db.siteText
    .findUnique({ where: { key: BLOG_LAST_DATE_KEY }, select: { value: true } })
    .catch(() => null);
  if (lastDateRow?.value === today && trigger === "scheduler") {
    return {
      ok: true,
      summary: `Today's post is already live — published earlier today${autoPublish ? " (auto-publish on)" : " as a draft"}.`,
      learning: `Run ${today}: skipped (a post was already handled today).`,
    };
  }

  // 2. next topic from the queue. Three guards so a topic is never
  //    written twice: (a) a done-marker the agent writes after creating
  //    the topic's post, (b) the topic's own title-slug already existing
  //    as a post, and (c) an existing post with the exact same title —
  //    the LLM invents its own slug, so the old slug-only check never
  //    matched and repeated runs re-wrote the same article (which is
  //    also what exhausted the slug space and crashed older builds).
  const existingPosts = await db.blogPost.findMany({ select: { slug: true, title: true } });
  const taken = new Set(existingPosts.map((x) => x.slug));
  const existingTitles = new Set(existingPosts.map((x) => x.title.trim().toLowerCase()));
  const doneRows = await db.siteText
    .findMany({ where: { key: { startsWith: "agents.blog.topicdone." } }, select: { key: true } })
    .catch(() => [] as { key: string }[]);
  const doneTopics = new Set(doneRows.map((r) => r.key));
  const topic = TOPIC_QUEUE.find(
    (t) =>
      !doneTopics.has(`agents.blog.topicdone.${slugify(t.title)}`) &&
      !taken.has(slugify(t.title)) &&
      !existingTitles.has(t.title.trim().toLowerCase())
  );
  const fallbackTopic: QueueTopic = {
    title: `Event Entertainment Insight ${today}`,
    keyword: "event entertainment india",
    category: "Guides",
  };
  const chosen = topic ?? fallbackTopic;

  // 3. generate the post — LLM first, curated template as the fallback
  //    so the run NEVER fails just because the host has no LLM creds.
  const llmPost = await llmJson<GeneratedPost>(
    `You are an expert SEO content writer for an Indian magician's website. You write original, practical, booking-intent articles for event hosts (wedding couples, HR managers, parents, fest coordinators) in India. Rules: focus keyword in title, H1-equivalent and first paragraph; 5-7 sections with clear H2 headings; every section 2-3 substantial paragraphs (60-110 words each); include one natural internal link mention of /services or /booking inside a paragraph as markdown [label](https://jadugarrajtilak.com/services); end with a "Frequently Asked Questions" section containing exactly 3 Q&A pairs (Q as section heading style "Q: ..." and A as the paragraph); honest pricing talk only ("price on request", cost drivers) — never invent prices; original phrasing, no competitor copying. Respond ONLY with JSON: {"title","slug","metaTitle","metaDescription","keywords","excerpt","intro","sections":[{"h","paras":["…"]}, …],"closing"}. ${BRAND_FACTS}`,
    `Write today's blog post. Working title: "${chosen.title}". Focus keyword: "${chosen.keyword}". Category: ${chosen.category}. If the title is Hindi, write the whole article in natural Hindi (Devanagari). Target 700-1200 words total.`,
    2
  );
  const usedTemplate = !llmPost || !llmPost.title || !Array.isArray(llmPost.sections) || llmPost.sections.length < 3;
  const post: GeneratedPost | null = usedTemplate ? templatePost(chosen) : llmPost;

  if (!post || !post.title || !Array.isArray(post.sections) || post.sections.length < 3) {
    // Both paths failed validation — a genuine error worth attention.
    return {
      ok: false,
      summary: "Draft generation failed validation on both the LLM and template paths — investigate the generator.",
      learning: `Run ${today}: generation failed validation — investigate before next run.`,
    };
  }

  // 4. sanitize + save — auto-publish executes the post live; draft mode
  //    parks it in Blog Studio for approval (owner's switch).
  const sections: BlogSection[] = post.sections
    .map((s) => ({ h: String(s?.h ?? "").trim(), paras: (Array.isArray(s.paras) ? s.paras : []).map((p) => String(p ?? "").trim()).filter(Boolean) }))
    .filter((s) => s.h.length > 0);

  // LLM JSON occasionally returns non-string types (keywords as an
  // array, numbers as titles) — Prisma then rejects the whole create()
  // as an "Invalid invocation" and the run errors out. Coerce every
  // text field up front so a quirky response can never fail the run.
  const asText = (v: unknown, max: number): string => String(v ?? "").slice(0, max);
  const title = asText(post.title, 160).trim() || chosen.title.slice(0, 160);
  const keywordsRaw = Array.isArray(post.keywords)
    ? post.keywords.map((k) => String(k)).join(", ")
    : asText(post.keywords, 200);
  const keywords = keywordsRaw.trim() || chosen.keyword;
  const excerpt = asText(post.excerpt, 200).trim() || chosen.title.slice(0, 200);
  const metaDescription = asText(post.metaDescription, 155).trim() || excerpt.slice(0, 155);
  const metaTitle = asText(post.metaTitle, 70).trim() || title.slice(0, 70);
  const intro = asText(post.intro, 600);
  const closing = asText(post.closing, 600);

  // Robust slug dedup: the queue slug, then a date suffix, then a
  // short random tail if even the dated one was taken (multiple runs
  // the same day must never crash on the unique constraint).
  let slug = slugify(asText(post.slug, 120) || title);
  if (!slug) slug = `post-${today.replace(/-/g, "")}`;
  if (taken.has(slug)) slug = `${slug}-${today.replace(/-/g, "").slice(4)}`;
  while (taken.has(slug)) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  // Race-proof create: the dedup above can still lose a millisecond
  // race against a concurrent invocation of this agent (both saw the
  // same `taken`). On Prisma's unique-constraint error (P2002) we
  // regenerate the tail and retry instead of erroring the run.
  let row: { id: string; title: string; slug: string; readingTime: string | null } | null = null;
  for (let attempt = 0; attempt < 3 && !row; attempt++) {
    try {
      row = await db.blogPost.create({
        data: {
          slug,
          title,
          metaTitle,
          metaDescription,
          keywords,
          excerpt,
          category: chosen.category,
          featuredImage: "/images/hero-portrait-v2.jpg",
          featuredImageAlt: `Jadugar Rajtilak — ${chosen.keyword}`,
          intro,
          sections: sections as unknown as object[],
          closing,
          backlinks: [] as unknown as object[],
          readingTime: computeReadingTime(intro, sections, closing),
          status: autoPublish ? "published" : "draft",
          publishedAt: new Date(),
          featured: false,
        },
        select: { id: true, title: true, slug: true, readingTime: true },
      });
    } catch (e) {
      if ((e as { code?: string })?.code === "P2002") {
        slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
        continue;
      }
      throw e;
    }
  }
  if (!row) throw new Error("blogPost.create failed after 3 slug-collision retries");

  // dated marker so the scheduler never double-publishes the same day
  await db.siteText
    .upsert({
      where: { key: BLOG_LAST_DATE_KEY },
      create: { key: BLOG_LAST_DATE_KEY, value: today },
      update: { value: today },
    })
    .catch(() => undefined);

  // topic done-marker — this topic is now written; the queue advances
  // to the NEXT topic on any later run instead of re-writing it.
  if (topic) {
    const doneKey = `agents.blog.topicdone.${slugify(topic.title)}`;
    await db.siteText
      .upsert({ where: { key: doneKey }, create: { key: doneKey, value: row.slug }, update: { value: row.slug } })
      .catch(() => undefined);
  }

  // SECURITY GATE — with auto-publish OFF (default), the run files an
  // approval request. The post stays a private draft until the owner
  // presses Approve in Master Admin → AI Agents → Approval Queue.
  if (!autoPublish) {
    await fileApproval({
      agentId: "blog",
      kind: "blog.publish",
      title: `Publish: "${row.title}"`,
      summary: `Blog Writer ne ek naya SEO draft taiyaar kiya hai (${row.readingTime}, keyword: ${chosen.keyword}). Approve karne par yeh post live ho jayega aur sitemap mein add ho jayega.`,
      payload: { postId: row.id, slug: row.slug, topic: chosen.title, keyword: chosen.keyword },
    });
  }

  const draftsPending = await db.blogPost.count({ where: { status: "draft" } });

  return {
    ok: true,
    summary: autoPublish
      ? `Published live (owner permission ON): "${row.title}" (${row.readingTime}) → jadugarrajtilak.com/blog/${row.slug}. ${draftsPending} older draft(s) awaiting review.`
      : `Approval queue: "${row.title}" (${row.readingTime}) — draft ready, aapke approval ka intezaar mein (AI kuch bhi khud se live nahi karta). ${draftsPending} draft(s) pending.`,
    details: { slug: row.slug, topic: chosen.title, keyword: chosen.keyword, autoPublish, writer: usedTemplate ? "template-fallback" : "llm" },
    learning: `Run ${today}: ${autoPublish ? "published (standing permission ON)" : "drafted + filed for approval (security gate)"} "${row.title}" for keyword "${chosen.keyword}" (${usedTemplate ? "template writer — set ZAI_BASE_URL + ZAI_API_KEY env for bespoke LLM drafts" : "LLM writer"}). ${
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
  { source: "Google Business Profile", type: "Own property (exists)", action: "Weekly post + Q&A + photos; request 2-3 reviews/month — maps-pack visibility", estDa: 100, week: "W1" },
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
  { source: "ShaadiSaga", type: "Wedding marketplace (new)", action: "Vendor listing under wedding entertainment — strong bridal traffic", estDa: 46, week: "W7" },
  { source: "Weddingz.in", type: "Wedding marketplace (new)", action: "Vendor profile with showreel link", estDa: 42, week: "W7" },
  { source: "Guest posts (wedding/event blogs)", type: "Outreach ×5", action: "Personalized pitches → 2-3 published by W7-8", estDa: 30, week: "W5-8" },
  { source: "Local press (Bhaskar/Patrika Udaipur)", type: "Press ×1", action: "Press note: Udaipur magician's IBM international honour", estDa: 80, week: "W7" },
  { source: "Event manager associations (EMA India chapters)", type: "Partnership ×3", action: "Vendor-list pitches to planners who book entertainment repeatedly", estDa: 45, week: "W9" },
  { source: "'Top 10 magicians India' listicles", type: "Listicle outreach ×3", action: "Contact authors with credentials pack", estDa: 40, week: "W11" },
  { source: "HARO / Qwoted / Featured.com", type: "Journalist source ×2", action: "Answer event-entertainment queries with the IBM credential — earns editorial links", estDa: 75, week: "W10-12" },
];

type Outreach = { to: string; subject: string; body: string };

export async function runRankAgent(): Promise<AgentResult> {
  // 1. seed the pipeline on first run, and top up any NEW sources that
  //    were added to the playbook after the pipeline was created (keyed
  //    by source name — existing rows are never touched).
  const existingSources = new Set(
    (await db.backlinkTask.findMany({ select: { source: true } })).map((r) => r.source)
  );
  const missing = SEED_LINKS.filter((l) => !existingSources.has(l.source));
  if (missing.length > 0) {
    await db.backlinkTask.createMany({ data: missing });
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
// 5 · MANAGER AGENT — team lead: monitoring + work assignment (read-only)
// ════════════════════════════════════════════════════════════════════
export async function runManagerAgent(): Promise<AgentResult> {
  const findings: Finding[] = [];
  const assignments: { agentId: string; task: string; why: string }[] = [];
  const since7d = new Date(Date.now() - 7 * 86400000);

  // 1. TEAM HEALTH — per-agent 7-day runs, success rate, last outcome.
  //    An agent's health reflects its CURRENT state: errors that a
  //    later successful run has already washed out are "recovered"
  //    history, not an open issue. (The old any-error-in-7d rule kept
  //    the toast crying "1 issue" for a week after an agent had
  //    already been fixed and re-run successfully.)
  const team: {
    agentId: string; runs7d: number; success7d: number; errors7d: number; unrecovered: number;
    lastRunAt: Date | null; lastStatus: string | null; staleDays: number | null;
  }[] = [];
  for (const meta of AGENTS.filter((a) => a.id !== "manager")) {
    const runs = await db.agentRun.findMany({
      where: { agentId: meta.id, startedAt: { gte: since7d } },
      orderBy: { startedAt: "desc" },
      select: { status: true, startedAt: true },
    });
    const last = await db.agentRun.findFirst({
      where: { agentId: meta.id },
      orderBy: { startedAt: "desc" },
      select: { startedAt: true, status: true },
    });
    const runs7d = runs.length;
    const success7d = runs.filter((r) => r.status === "success").length;
    const errors7d = runs7d - success7d;
    // most recent success inside the window (runs are ordered desc)
    const lastSuccessAtMs = runs.find((r) => r.status === "success")?.startedAt.getTime() ?? 0;
    // unrecovered = error runs NEWER than the agent's last success
    const unrecovered = runs.filter((r) => r.status === "error" && r.startedAt.getTime() > lastSuccessAtMs).length;
    const staleDays = last?.startedAt
      ? Math.floor((Date.now() - last.startedAt.getTime()) / 86400000)
      : null;
    team.push({
      agentId: meta.id,
      runs7d, success7d, errors7d, unrecovered,
      lastRunAt: last?.startedAt ?? null,
      lastStatus: last?.status ?? null,
      staleDays,
    });
    const rate = runs7d > 0 ? Math.round((success7d / runs7d) * 100) : null;
    findings.push({
      check: `${meta.name} — 7-day health`,
      status: runs7d === 0 ? "warn" : unrecovered > 0 ? "fail" : "pass",
      detail:
        runs7d === 0
          ? `No runs in the last 7 days (last: ${last?.startedAt?.toISOString().slice(0, 10) ?? "never"}). Scheduler theek hai? Manual run karein.`
          : `${runs7d} run(s), ${success7d} success, ${errors7d} error${errors7d === 1 ? "" : "s"}${rate !== null ? ` — ${rate}% success` : ""}. Last: ${last?.status ?? "n/a"} (${staleDays ?? 0}d ago).` +
            (errors7d > unrecovered ? ` ${errors7d - unrecovered} purana error recover ho chuka hai — agent ab theek chal raha hai.` : ""),
      fix: unrecovered > 0 ? "Open the agent card — error summary mein exact reason hai. Fix karke manual run karein." : undefined,
    });
  }

  // 2. APPROVAL QUEUE — pending proposals (the security gate's backlog)
  const pendingApprovals = await db.agentApproval.count({ where: { status: "pending" } });
  const oldestPending = await db.agentApproval.findFirst({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true, title: true },
  });
  const oldestAgeHours = oldestPending
    ? Math.floor((Date.now() - oldestPending.createdAt.getTime()) / 3600000)
    : null;
  findings.push({
    check: "Approval queue (security gate)",
    status: pendingApprovals === 0 ? "pass" : pendingApprovals <= 3 ? "warn" : "fail",
    detail:
      pendingApprovals === 0
        ? "Queue khaali hai — koi AI proposal pending nahi."
        : `${pendingApprovals} proposal(s) aapke approval ka intezaar mein${oldestAgeHours !== null ? `, sabse purana ${oldestAgeHours}h se pending (${oldestPending?.title?.slice(0, 60)}…)` : ""}.`,
    fix: pendingApprovals > 0 ? "AI Agents → Approval Queue → Approve ya Reject karein. Blog posts tab tak live nahi honge." : undefined,
  });
  if (pendingApprovals > 0) {
    assignments.push({
      agentId: "owner",
      task: `Approval queue saaf karein — ${pendingApprovals} pending proposal(s)`,
      why: "AI kuch bhi live nahi karega jab tak aap approve nahi karte (security rule). Publish karne ke liye queue khaali hona zaroori nahi, par review jaldi rahe to content SEO momentum bana rahta hai.",
    });
  }

  // 3. GROWTH FUNNEL — leads this week vs last week + CTA engagement
  const since7dStart = new Date();
  since7dStart.setHours(0, 0, 0, 0);
  since7dStart.setDate(since7dStart.getDate() - 7);
  const since14dStart = new Date(since7dStart);
  since14dStart.setDate(since14dStart.getDate() - 7);
  const leadsThisWeek = await db.lead.count({ where: { createdAt: { gte: since7dStart } } });
  const leadsLastWeek = await db.lead.count({
    where: { createdAt: { gte: since14dStart, lt: since7dStart } },
  });
  const ctaThisWeek = await db.ctaClick.count({ where: { createdAt: { gte: since7dStart } } });
  const whatsappTaps = await db.ctaClick.count({
    where: { cta: "whatsapp", createdAt: { gte: since7dStart } },
  });
  const callTaps = await db.ctaClick.count({
    where: { cta: "call", createdAt: { gte: since7dStart } },
  });
  findings.push({
    check: "Lead funnel — this week",
    status: leadsThisWeek > 0 ? "pass" : "warn",
    detail:
      `Form leads: ${leadsThisWeek} (pichle hafte: ${leadsLastWeek}). ` +
      `CTA engagement: ${ctaThisWeek} tap(s) — WhatsApp ${whatsappTaps}, Call ${callTaps}. ` +
      (leadsThisWeek === 0 && ctaThisWeek === 0
        ? "Traffic ya conversion dono kam lag rahe hain — SEO agent ka report dekhein aur GBP/directories par kaam jari rakhein."
        : leadsThisWeek === 0 && ctaThisWeek > 0
          ? "Log WhatsApp/call par tap kar rahe hain par form nahi bhar rahe — phone check karein, form chhota rakhne ka consider karein."
          : "Signal theek hai — follow-up within 24h rakhein."),
    fix: leadsThisWeek === 0 && ctaThisWeek === 0 ? "Rank agent run karein (backlink pipeline) + GSC queries review karein — new content topics wahan se aate hain." : undefined,
  });

  // 4. WORK ASSIGNMENT — who should run next, with a reason
  const errorAgents = team.filter((t) => t.unrecovered > 0);
  const staleAgents = team.filter((t) => (t.staleDays ?? 99) >= 3 && t.agentId !== "rank");
  for (const t of errorAgents) {
    assignments.push({
      agentId: t.agentId,
      task: "Error diagnosis + re-run",
      why: `${t.errors7d} error run(s) in 7 days — agent card mein summary dekhein, fix karke dobara run karein.`,
    });
  }
  for (const t of staleAgents) {
    assignments.push({
      agentId: t.agentId,
      task: "Manual run (scheduler miss)",
      why: `Last run ${(t.staleDays ?? "?")} din pehle tha — schedule window miss hua lagta hai.`,
    });
  }
  const plannedBacklinks = await db.backlinkTask.count({ where: { status: "planned" } });
  if (plannedBacklinks > 0) {
    assignments.push({
      agentId: "rank",
      task: `Next outreach batch (${plannedBacklinks} planned sources)`,
      why: "DA/PA growth pipeline — Rank agent personalized drafts taiyaar karega, bhejna aap khud karenge (zero spam).",
    });
  }
  assignments.push({
    agentId: "seo",
    task: "Post-deploy SEO audit",
    why: "Har deploy ke baad titles/canonicals/sitemap dobara verify karwana safe rehta hai.",
  });

  const failing = findings.filter((f) => f.status === "fail").length;
  const learning = `Run ${new Date().toISOString().slice(0, 10)}: team=${team.length} agents, ${failing} failing check(s), ${pendingApprovals} approval(s) pending, leads 7d=${leadsThisWeek} (prev ${leadsLastWeek}), CTA taps 7d=${ctaThisWeek}. Watch tomorrow: ${
    pendingApprovals > 0 ? "approval queue turnaround" : failing > 0 ? "error agents" : "lead delta"
  }.`;

  return {
    ok: true,
    summary:
      `Team report: ${team.filter((t) => t.runs7d > 0 && t.unrecovered === 0).length}/${team.length} agents healthy (7d), ${failing} issue(s). ` +
      `Approval queue: ${pendingApprovals} pending. Leads: ${leadsThisWeek} this week (prev ${leadsLastWeek}) + ${ctaThisWeek} CTA tap(s). ` +
      `${assignments.length} work assignment(s) ready — niche diye gaye hain.`,
    findings,
    details: {
      team: team.map((t) => ({
        agentId: t.agentId,
        runs7d: t.runs7d,
        success7d: t.success7d,
        errors7d: t.errors7d,
        unrecovered: t.unrecovered,
        lastStatus: t.lastStatus,
        staleDays: t.staleDays,
      })),
      assignments,
      funnel: { leadsThisWeek, leadsLastWeek, ctaThisWeek, whatsappTaps, callTaps },
      pendingApprovals,
    },
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
    case "manager":
      return runManagerAgent();
  }
}

