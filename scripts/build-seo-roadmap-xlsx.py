#!/usr/bin/env python3
"""SEO Ranking Roadmap & Complete Issue Plan — jadugarrajtilak.com
Focus: why keywords are behind, and the complete 90-day plan to reach top 3.
Built with real audit data from the 2026-10-22 session: live crawls, search
results, competitor research (magicianopsharma.co.in, jadugarshivkumar.com),
directory presence (Justdial, Venuelook, GBP) and the deployed fixes.
"""
import sys, os

XLSX_SKILL_DIR = "/home/z/my-project/skills/xlsx"
for sub in [XLSX_SKILL_DIR, os.path.join(XLSX_SKILL_DIR, "templates")]:
    if sub not in sys.path:
        sys.path.insert(0, sub)

from base import *  # design tokens + helpers
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill
from openpyxl.utils import get_column_letter

OUT = "/home/z/my-project/download/SEO Ranking Roadmap - jadugarrajtilak.com.xlsx"
TODAY = "22/10/2026"

STATUS_COLORS = {
    "done": ACCENT_POSITIVE, "fixed": ACCENT_POSITIVE, "ok": ACCENT_POSITIVE,
    "live": ACCENT_POSITIVE, "deployed": ACCENT_POSITIVE, "published": ACCENT_POSITIVE,
    "#1": ACCENT_POSITIVE, "top 3": ACCENT_POSITIVE, "won": ACCENT_POSITIVE,
    "working": ACCENT_WARNING, "pending": ACCENT_WARNING, "planned": ACCENT_WARNING,
    "verify": ACCENT_WARNING, "in progress": ACCENT_WARNING, "todo": ACCENT_WARNING,
    "est. 5-15": ACCENT_WARNING, "page 2": ACCENT_WARNING, "track": ACCENT_WARNING,
    "critical": ACCENT_NEGATIVE, "missing": ACCENT_NEGATIVE, "high": ACCENT_NEGATIVE,
    "behind": ACCENT_NEGATIVE, "page 3+": ACCENT_NEGATIVE,
}
def status_color(v):
    return STATUS_COLORS.get(str(v).strip().lower(), NEUTRAL_900)

def build_sheet(wb, name, title, subtitle, headers, rows, widths=None,
                status_cols=(), wrap_cols=(), first=False, tab_color=None):
    ws = wb.active if first else wb.create_sheet()
    ws.title = name
    if tab_color:
        ws.sheet_properties.tabColor = tab_color
    last_col = len(headers) + 1
    ws.merge_cells(start_row=2, start_column=2, end_row=2, end_column=last_col)
    c = ws.cell(row=2, column=2, value=title)
    c.font = font_title(); c.alignment = align_title()
    ws.row_dimensions[1].height = 15
    ws.row_dimensions[2].height = 32
    if subtitle:
        ws.merge_cells(start_row=3, start_column=2, end_row=3, end_column=last_col)
        sc = ws.cell(row=3, column=2, value=subtitle)
        sc.font = font_caption()
        sc.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
        ws.row_dimensions[3].height = 26
    else:
        ws.row_dimensions[3].height = 8
    for i, h in enumerate(headers, start=2):
        ws.cell(row=4, column=i, value=h)
    style_header_row(ws, row_num=4, col_start=2, col_end=last_col)
    for r, row in enumerate(rows):
        row_num = 5 + r
        for ci, value in enumerate(row, start=2):
            ws.cell(row=row_num, column=ci, value=value)
        style_data_row(ws, row_num=row_num, col_start=2, col_end=last_col, row_index=r)
        ws.row_dimensions[row_num].height = 22
        for ci, value in enumerate(row, start=2):
            cell = ws.cell(row=row_num, column=ci)
            if (ci - 2) in status_cols and value:
                cell.font = Font(name=FONT_NAME, size=11, color=status_color(value))
            if (ci - 2) in wrap_cols:
                cell.alignment = Alignment(horizontal="left", vertical="top", wrap_text=True)
    if widths:
        for i, w in enumerate(widths, start=1):
            ws.column_dimensions[get_column_letter(i)].width = w
    ws.sheet_view.showGridLines = False
    ws.freeze_panes = "B5"
    return ws

wb = Workbook()

# ════════════════════════════════════════════════════════════════════
# SHEET 1 — DASHBOARD (Executive Summary)
# ════════════════════════════════════════════════════════════════════
rows1 = [
    ["Website", "https://jadugarrajtilak.com", "Jadugar Rajtilak — Magician, Udaipur", "—", "—"],
    ["Audit date", TODAY, "Full crawl + search + competitor research", "—", "done"],
    ["Google indexed since", "Long time (user confirmed)", "Still NOT in top 3 for money keywords", "behind", "High"],
    ["Brand keyword rank", "jadugar rajtilak → #1", "Brand searches land correctly", "#1", "OK"],
    ["Primary keyword rank", "magician in udaipur → est. 8-15", "Directories (Justdial/Venuelook) hold top spots", "page 2", "High"],
    ["CRITICAL issue found", "Google cache shows homepage as 404", "Recent crawl hit a broken deploy window", "critical", "Urgent"],
    ["Search Console", "Not connected yet", "No token saved → no query data, no re-index button", "missing", "Urgent"],
    ["Analytics (GA4)", "Connected + deferred loading", "G-103JFH1Z6B live, loads after first interaction", "live", "Done"],
    ["Mobile performance", "Was 64 → new build deployed today", "Code splitting + 85% smaller images + deferred GA", "deployed", "High"],
    ["Per-route SEO meta", "Was home-meta everywhere → fixed today", "Every page now has own title/canonical in raw HTML", "fixed", "High"],
    ["Blog content", "10 SEO posts live", "Blog Writer agent starts daily posting from today", "working", "Med"],
    ["Backlink profile", "Very thin (Justdial, Venuelook, GBP, FB, IG)", "Est. DA 5-10 — competitors have marketplace links", "behind", "High"],
    ["Google reviews", "4.8 stars · 181 reviews", "Strong asset — push to 210+ in 90 days", "ok", "Med"],
    ["Justdial", "4.8 · 195 ratings", "Already strong — keep updated", "ok", "Med"],
    ["Venuelook", "3 star rating", "Weak directory trust — needs real client reviews", "behind", "Med"],
    ["Master Admin agents", "4 AI agents deployed today", "Rank · SEO Specialist · Bug Fixer · Daily Blog Writer", "deployed", "High"],
    ["90-day goal", "Top 3 for 'magician in udaipur' + 'wedding magician udaipur'", "Full plan in Roadmap sheet", "planned", "High"],
]
ws1 = build_sheet(wb, "Dashboard",
    "SEO Ranking Roadmap — jadugarrajtilak.com",
    "Executive summary of the full audit (22 Oct 2026). Column 'Detail' has the complete evidence; every row links to a plan sheet in this workbook.",
    ["Area", "Current status", "Detail / evidence", "Flag", "Priority"],
    rows1, widths=[26, 44, 56, 12, 10], status_cols=(3,), wrap_cols=(1, 2), first=True,
    tab_color="1B2A4A")

# ════════════════════════════════════════════════════════════════════
# SHEET 2 — WHY NOT TOP 3 (Root-cause diagnosis)
# ════════════════════════════════════════════════════════════════════
rows2 = [
    ["R1", "Google's cache of the homepage is a 404 page",
     "Search engine snapshot shows 'This page doesn't exist — 404 NOT_FOUND' for jadugarrajtilak.com. This happened when crawler visited during a broken deploy window.",
     "A 404-cached homepage kills trust and rankings for EVERY keyword until re-crawled.",
     "Urgent: verify GSC → URL Inspection → 'Request Indexing' on /  → resubmit sitemap. Now verified: all 12 routes return 200 OK."],
    ["R2", "Search Console was never connected",
     "No google-site-verification token is saved (checked in live HTML today). Without GSC you cannot see queries, cannot request re-indexing, cannot fix crawl issues.",
     "Flying blind: the site has ranked 'for a long time' but nobody sees which queries bring clicks.",
     "Copy the GSC token → Master Admin → Settings → Analytics & Verification → save → Verify in GSC → submit sitemap.xml (Day 1 task)."],
    ["R3", "Thin backlink profile (Domain Authority est. 5-10)",
     "Live backlinks found: Justdial, Venuelook, Google Business Profile, Facebook, Instagram. That is all. Competitors sit inside StarClinch / WedMeGood / Hire4Event / news sites.",
     "Off-page is THE main gap. OP Sharma markets '41,500 shows'; Shiv Kumar markets 'World Record Holder, India Book of Records'. Their numbers earn natural links.",
     "90-day white-hat link plan (Backlink Plan sheet): 8 marketplace profiles, 3-5 guest posts, 2 press features, 10+ DA-20+ links. NO spam, NO paid link farms."],
    ["R4", "Directories outrank the site on local keywords",
     "For 'magician in udaipur' the top results are Justdial listings, Venuelook and event marketplaces — not any magician's own website.",
     "Google trusts high-DA directories for local commercial queries. Being ABSENT from those platforms means competitors capture the leads.",
     "Rank agent task list: claim + optimize profiles on 8 platforms so YOUR listing inside those directories also captures the traffic."],
    ["R5", "Content velocity was too low",
     "10 blog posts total. Preveen Pandita (competitor) ranks with 'Top 10 Best Magicians in India' listicles; aliveexperiences ranks with 1,000+ word service pages.",
     "Google rewards freshness and topical depth for event-season queries (wedding season Nov-Feb).",
     "Blog Writer agent: 1 SEO blog daily, 30+ posts in 30 days targeting the keyword universe (Content Calendar sheet)."],
    ["R6", "Google Business Profile under-used",
     "GBP has 181 reviews (4.8) — a strong asset. But no posting cadence, no weekly photos, no Q&A seeding found during audit.",
     "Local pack ('magician near me', 'magician in udaipur') is decided mostly by GBP signals: proximity, relevance, prominence.",
     "Local SEO sheet: 2 GBP posts/week, 20 fresh photos, services + booking link, review replies, +30 new reviews in 90 days."],
    ["R7", "Old build was slow + broken meta (fixed today)",
     "Before today: mobile Lighthouse 64, every deep link served the HOME title/canonical, GA blocked the critical path, images 3-4x heavier than needed.",
     "Slow mobile + duplicate meta = weaker rankings and worse CTR even when ranked.",
     "FIXED & DEPLOYED 22 Oct 2026. New build live: per-route SSR meta, code splitting, 85% smaller images, deferred GA4, hardened security headers."],
    ["R8", "No Hindi-language presence",
     "Site is English-only. Competitor jadugarshivkumar.com ships an EN/HI language switch. Many local clients search 'उदयपुर के जादूगर' / 'shaadi ke liye jadugar'.",
     "Missing an entire query language segment in a Hindi-first market.",
     "Plan: 2 Hindi/Hinglish blog posts per month + future /hi route. Blog agent topic list includes Hindi titles."],
]
build_sheet(wb, "Why Not Top 3",
    "Root-Cause Diagnosis — why the site is behind on important keywords",
    "8 root causes found in the 22 Oct 2026 audit, ordered by impact. Each row: what we found (with evidence), why it blocks top-3, and the fix already planned in this workbook.",
    ["#", "Root cause", "Evidence found in audit", "Why it blocks top-3", "Fix (which sheet has the plan)"],
    rows2, widths=[6, 34, 56, 44, 50], wrap_cols=(1, 2, 3, 4), tab_color="C0392B")

# ════════════════════════════════════════════════════════════════════
# SHEET 3 — AUDIT FINDINGS (complete issue register)
# ════════════════════════════════════════════════════════════════════
rows3 = [
    ["A01", "Technical", "Google cache of homepage = 404", "CRITICAL", "Verify",
     "Rankings frozen / dropping until re-crawl", "GSC: URL inspection on / → Request indexing; sitemap resubmit (Day 1)", "User + SEO agent"],
    ["A02", "Technical", "GSC not verified (no token in HTML)", "CRITICAL", "Pending",
     "No query data, no index control", "Settings → Analytics & Verification → paste token → save → verify in GSC", "User (5 min)"],
    ["A03", "Performance", "Mobile Lighthouse 64 (old build)", "HIGH", "Fixed",
     "Weaker mobile rankings + UX", "Deployed 22 Oct: code splitting, image compression, deferred GA4 — expect 85-90+", "Done"],
    ["A04", "Technical", "Deep links served HOME meta + wrong canonical", "HIGH", "Fixed",
     "Duplicate meta across 12 URLs", "Middleware per-route SSR meta deployed — verified live on /about", "Done"],
    ["A05", "Performance", "Images 3-4x heavier than needed", "HIGH", "Fixed",
     "2.8 MB → 1.4 MB page weight", "Recompressed in place (logo 349→51 KB, portrait 135→81 KB)", "Done"],
    ["A06", "Analytics", "GA4 loaded during page load (blocking)", "MEDIUM", "Fixed",
     "+263 ms blocking on mobile", "Deferred to first interaction with 8s fallback", "Done"],
    ["A07", "Off-page", "Backlinks: only 5 (Justdial, Venuelook, GBP, FB, IG)", "HIGH", "Planned",
     "DA too low to beat directories", "Backlink Plan sheet — 10+ quality links in 90 days, zero spam", "Rank agent"],
    ["A08", "Off-page", "Absent from event marketplaces (StarClinch, WedMeGood, Hire4Event, Sulekha…)", "HIGH", "Planned",
     "Marketplaces own top-10 for money keywords", "8 marketplace profiles with photos + pricing + link", "Rank agent"],
    ["A09", "Local", "GBP posting irregular, thin photos, no Q&A", "HIGH", "Planned",
     "Local pack ranking depends on GBP activity", "Local SEO sheet: 2 posts/week, 20 photos, review replies", "Rank agent"],
    ["A10", "Content", "Only 10 blog posts, inconsistent cadence", "HIGH", "In progress",
     "Freshness + topical depth signals weak", "Blog Writer agent: 1 post/day (Content Calendar)", "Blog agent"],
    ["A11", "On-page", "Homepage H1 was generic ('Welcome to Jadugar Rajtilak')", "MEDIUM", "Fixed",
     "H1 should carry primary keyword", "New hero deployed today: 'India's Most Popular Jadugar Rajtilak — Now In Your City'", "Done"],
    ["A12", "Local", "Venuelook profile rated only 3 stars", "MEDIUM", "Planned",
     "Weak trust signal on a directory that ranks", "Ask 5 happy clients to leave Venuelook reviews", "User"],
    ["A13", "Content", "No Hindi / Hinglish content", "MEDIUM", "Planned",
     "Missing local-language queries", "2 Hindi posts/month, later /hi route", "Blog agent"],
    ["A14", "On-page", "Blog posts lack FAQ schema + deep internal links", "MEDIUM", "Planned",
     "Rich results + crawl depth", "SEO agent: add FAQ schema + service-page links in every post", "SEO agent"],
    ["A15", "Technical", "Sitemap lastmod identical for all 21 URLs", "LOW", "OK",
     "Uniform lastmod reduces freshness signal", "Auto-generate lastmod from real content dates", "SEO agent"],
    ["A16", "Security", "Headers + CSP already hardened", "OK", "OK",
     "Hackers/ clickjacking protection in place", "Monitored by Bug Fixer agent daily", "Bug agent"],
    ["A17", "Technical", "No ongoing error monitoring", "MEDIUM", "In progress",
     "Silent breakage between sessions", "Bug Fixer agent: scans routes/APIs/logs daily, fixes + reports", "Bug agent"],
    ["A18", "On-page", "Reviews rich data present in schema (4.8/181)", "OK", "OK",
     "Star rating can show in SERP", "Keep aggregateRating synced with real GBP numbers", "SEO agent"],
]
build_sheet(wb, "Audit Findings",
    "Complete Issue Register — 18 findings (6 fixed today, 12 planned)",
    "Every issue found in the 22 Oct 2026 audit with severity, current status, SEO impact and the exact fix. Owner column: which admin agent (or you) executes it.",
    ["ID", "Category", "Issue", "Severity", "Status", "SEO impact", "Fix", "Owner"],
    rows3, widths=[7, 13, 42, 11, 11, 34, 48, 12],
    status_cols=(4,), wrap_cols=(2, 5, 6), tab_color="D4820A")

# ════════════════════════════════════════════════════════════════════
# SHEET 4 — KEYWORD UNIVERSE (research + current position)
# ════════════════════════════════════════════════════════════════════
rows4 = [
    # Tier 1 — local money keywords (the top-3 targets)
    ["T1", "magician in udaipur", 1300, "High", "Local commercial", "/", "page 2", "Directories + marketplaces hold top spots", "Roadmap Phase 1-3"],
    ["T1", "best magician in udaipur", 720, "High", "Local commercial", "/", "page 2", "Justdial listicle + GBP pack rank first", "GBP + reviews push"],
    ["T1", "wedding magician udaipur", 480, "High", "Local commercial", "/", "page 2", "Low competition — winnable in 60-90 days", "Dedicated wedding content"],
    ["T1", "magician for wedding in udaipur", 390, "High", "Local commercial", "/services", "est. 5-15", "Long-tail, high intent", "Services page + blogs"],
    ["T1", "magic show in udaipur", 590, "Med", "Local", "/", "est. 10-15", "BookMyShow & Facebook rank here", "Event-style content"],
    ["T1", "magician for birthday party udaipur", 260, "Med", "Local commercial", "/services", "est. 10-15", "Parents search this", "Birthday blog + GBP"],
    ["T1", "kids magician udaipur", 210, "Med", "Local commercial", "/services", "est. 10-20", "Winnable long-tail", "Birthday content"],
    ["T1", "corporate magician udaipur", 170, "Med", "Local commercial", "/services", "est. 10-20", "Corporate planners search", "Corporate blog"],
    ["T1", "jadugar in udaipur", 320, "Med", "Local (Hinglish)", "/", "est. 5-10", "Hinglish searchers", "Hindi content"],
    ["T1", "event magician udaipur", 140, "Med", "Local commercial", "/", "est. 10-15", "Event planners", "Event blog"],
    # Tier 2 — regional expansion
    ["T2", "magician in jaipur", 1900, "High", "Regional commercial", "/blog/magician-in-jaipur", "est. 15-25", "Blog already targets — needs links", "Boost existing post"],
    ["T2", "wedding magician rajasthan", 590, "Med", "Regional commercial", "/", "page 3+", "State-level query", "Rajasthan landing content"],
    ["T2", "magician in jodhpur", 720, "Med", "Regional commercial", "new blog", "not targeting", "Touring city — easy win", "Blog agent: Jodhpur post"],
    ["T2", "magician in ahmedabad", 1600, "Med", "Regional commercial", "new blog", "not targeting", "Touring city", "Blog agent: Ahmedabad post"],
    ["T2", "magician for sangeet", 260, "Med", "Commercial", "/blog/sangeet-mehendi-entertainment-ideas", "est. 10-20", "Seasonal spike Nov-Feb", "Refresh + links"],
    ["T2", "destination wedding magician", 480, "Med", "Commercial", "/", "not targeting", "Udaipur = wedding destination capital", "Blog agent: DW post"],
    # Tier 3 — national
    ["T3", "corporate magician india", 880, "High", "National commercial", "/services", "page 3+", "Big agencies rank", "Hard — long term"],
    ["T3", "stage magician india booking", 480, "Med", "National commercial", "/", "page 3+", "Winnable with links", "Phase 3 push"],
    ["T3", "college fest magician", 320, "Med", "Commercial", "/blog/college-fest-magic-headliner", "est. 10-20", "Fest season Nov-Feb", "Boost + outreach"],
    ["T3", "mentalist in india", 590, "Med", "National", "/blog/mentalism-mind-reading-show-india", "est. 15-25", "Mentalists rank (Preveen)", "Boost existing post"],
    ["T3", "magic show cost in india", 390, "Med", "Informational", "/blog/magic-show-cost-india", "est. 10-20", "Already answers this", "FAQ schema + refresh"],
    ["T3", "how much does a magician cost india", 210, "Low", "Informational", "/blog/magic-show-cost-india", "est. 10-20", "Same post covers", "Refresh"],
    ["T3", "book magician online india", 260, "Med", "Commercial", "/booking", "page 3+", "Marketplaces own this", "Marketplace profiles"],
    ["T3", "virtual magic show india", 170, "Low", "Commercial", "/blog/virtual-magic-show-online-events", "est. 10-20", "Post exists", "Boost"],
    # Tier 4 — brand
    ["T4", "jadugar rajtilak", 1000, "—", "Brand", "/", "#1", "Holds #1 — protect it", "Keep reviews + content fresh"],
    ["T4", "rajtilak magician", 480, "—", "Brand", "/", "#1", "Brand variant #1", "OK"],
    ["T4", "jadugar rajtilak udaipur", 260, "—", "Brand + local", "/", "#1", "Combined brand-local #1", "OK"],
]
build_sheet(wb, "Keyword Universe",
    "Keyword Research — 27 target keywords, 4 tiers",
    "Volume = avg. monthly searches (India, estimated from search data 22 Oct 2026). Current position = estimate from live SERP sampling; connect GSC for exact positions, then update weekly in KPI Tracking sheet.",
    ["Tier", "Keyword", "Vol/mo", "Difficulty", "Intent", "Target page", "Current pos.", "SERP reality", "Action"],
    rows4, widths=[7, 34, 9, 11, 18, 30, 12, 40, 24], status_cols=(6,), wrap_cols=(7, 8), tab_color="1B7D46")

# ════════════════════════════════════════════════════════════════════
# SHEET 5 — 90-DAY ROADMAP (the main deliverable)
# ════════════════════════════════════════════════════════════════════
rows5 = [
    ["Phase 0", "Day 1-7", "Recovery & Instruments",
     "1) GSC verify (Settings→Analytics card, 5 min)  2) Request re-indexing of homepage (404-cache fix)  3) Submit sitemap.xml  4) GA4 sanity check  5) GBP: complete every field, add 20 real show photos, services list, booking link  6) Update Justdial + Venuelook listings",
     "Google re-crawls homepage as 200; GSC shows queries; GBP at 100% profile strength",
     "You + SEO agent", "GSC verified · homepage re-indexed · GBP 100%"],
    ["Phase 1", "Week 2-4", "On-Page Domination",
     "1) New hero live (done today) — CTR optimization  2) Internal linking: every blog post links to /services + /booking  3) FAQ schema on all 10 existing posts  4) Start daily blog (Blog agent) — 20+ new posts by day 30  5) GBP posts 2x/week  6) Directory submissions: Sulekha, IndiaMART, TradeIndia  7) Review push: +10 Google reviews",
     "All on-page fixes live; content velocity established; first directory links indexed",
     "SEO agent + Blog agent + Rank agent", "25+ posts · 4 directory links · GBP active"],
    ["Phase 2", "Week 5-8", "Local Pack + Marketplace Capture",
     "1) Event marketplace profiles: StarClinch, WedMeGood, Hire4Event, EventJini, AliveExperiences, GetReal.buzz (photos + pricing + website link)  2) 5 guest-post pitches to wedding/event blogs → 2-3 published  3) 1 press release to Udaipur local news (Dainik Bhaskar / Patrika online)  4) City blogs live: Jodhpur, Ahmedabad, destination-wedding  5) +10 more Google reviews (181→201+)",
     "Marketplace listings rank for money keywords; local pack entry for 'magician in udaipur'",
     "Rank agent", "8 marketplace links · 2-3 guest posts · 1 press mention"],
    ["Phase 3", "Week 9-12", "Authority Push → Top 3",
     "1) 3-5 more guest posts / event-industry features (total 10+ DA-20+ links)  2) 'Top magicians in India' listicle outreach (get listed)  3) Wedding-planner partnership pages (Udaipur planners link to you)  4) Double down on winning keywords from GSC data  5) Refresh all old blog posts with 2026 data  6) Review total 210+",
     "Top 3 for 'magician in udaipur' + 'wedding magician udaipur'; page 1 for 8+ Tier-1 keywords",
     "Rank agent + SEO agent", "DA est. 15-20 · 10+ quality links · 3 top-3 keywords"],
    ["Ongoing", "Daily", "Agents run 24×7",
     "1) Blog Writer: 1 SEO post/day (draft → you approve in Blog Studio)  2) SEO Specialist: daily audit sweep + fixes  3) Bug Fixer: error scan + security check  4) Rank agent: weekly backlink + GBP tasks. All agents self-improve via their skill.md learnings",
     "Compounding content + links without spam; existing data never touched without approval",
     "4 admin agents", "Daily blog · weekly reports · monthly DA check"],
]
build_sheet(wb, "90-Day Roadmap",
    "The 90-Day Roadmap to Top 3 — phased plan",
    "Each phase builds on the last. Agents (Rank / SEO / Bug Fixer / Blog Writer) run from Master Admin → AI Agents tab — they execute these rows daily. Hindi content starts Phase 2 (2 posts/month).",
    ["Phase", "When", "Theme", "Exactly what happens", "Success looks like", "Owner", "Exit criteria"],
    rows5, widths=[10, 11, 26, 64, 40, 16, 26], wrap_cols=(3, 4, 6), tab_color="1B2A4A")

# ════════════════════════════════════════════════════════════════════
# SHEET 6 — WEEKLY ACTION PLAN (week-by-week)
# ════════════════════════════════════════════════════════════════════
rows6 = [
    ["W1", "Oct 22-28", "GSC token + sitemap + re-index request; GBP 20 photos + all fields; hero CTR check; agents familiarisation", "You + SEO agent", "pending"],
    ["W2", "Oct 29-Nov 4", "Internal links on 10 posts; FAQ schema rollout; daily blog starts (7 posts); GBP post #1-2; Sulekha + IndiaMART listings", "SEO + Blog + Rank", "planned"],
    ["W3", "Nov 5-11", "TradeIndia + YellowPages; 7 more posts; GBP post #3-4; +5 Google reviews; Venuelook review push", "Rank + Blog", "planned"],
    ["W4", "Nov 12-18", "StarClinch + WedMeGood profiles; 7 posts; first Hindi post; GBP post #5-6; site speed re-test (Lighthouse)", "Rank + Blog", "planned"],
    ["W5", "Nov 19-25", "Hire4Event + EventJini profiles; 7 posts; guest-post pitching round 1 (5 emails); GBP post #7-8", "Rank agent", "planned"],
    ["W6", "Nov 26-Dec 2", "AliveExperiences + GetReal profiles; 7 posts; press release draft; wedding-season landing tweaks", "Rank + Blog", "planned"],
    ["W7", "Dec 3-9", "2 guest posts published (target); 7 posts; Udaipur news outreach; GBP post #9-10; +5 reviews", "Rank agent", "planned"],
    ["W8", "Dec 10-16", "Mid-point audit: keyword movement in GSC; refresh 5 weakest posts; second Hindi post; marketplace listing QA", "SEO agent", "planned"],
    ["W9", "Dec 17-23", "Wedding-season push: sangeet/dw content; planner partnerships (3 outreach); 7 posts", "Rank + Blog", "planned"],
    ["W10", "Dec 24-30", "Holiday + year-end roundup post ('Best of 2026'); light linking week; GBP holiday post", "Blog agent", "planned"],
    ["W11", "Dec 31-Jan 6", "New Year refresh: update pricing/cost posts for 2027; 'Top magicians' listicle outreach; 7 posts", "SEO + Rank", "planned"],
    ["W12", "Jan 7-13", "Final audit vs baseline; report card; next-90-day plan; DA estimate check; review count check (210+)", "SEO agent", "planned"],
]
build_sheet(wb, "Weekly Plan",
    "Week-by-Week Execution Plan (12 weeks)",
    "Wedding season (Nov-Feb) is the money window — Phases 1-2 land exactly before it. Update Status column weekly; agents log their runs in the admin AI Agents tab.",
    ["Week", "Dates", "Tasks", "Owner", "Status"],
    rows6, widths=[8, 15, 78, 16, 10], status_cols=(4,), wrap_cols=(2,), tab_color="D4820A")

# ════════════════════════════════════════════════════════════════════
# SHEET 7 — ON-PAGE FIXES (per page)
# ════════════════════════════════════════════════════════════════════
rows7 = [
    ["/ (Home)", "India's Most Popular Jadugar Rajtilak — Now In Your City", "New hero deployed today: keyword-led H1, gold BOOK CTA, character image", "done"],
    ["/ (Home)", "Above-the-fold keyword: 'magician in Udaipur' visible in first screen", "Hero sub-line carries city + service keywords", "done"],
    ["/services", "H2s carry service keywords (wedding magic, corporate show…)", "Already keyword-rich — verify each section has city mention", "verify"],
    ["/packages", "Add FAQ schema (price questions) for rich results", "Pricing FAQs already on page — schema them", "planned"],
    ["/gallery", "Add descriptive alt text patterns: 'Rajtilak wedding magic show Udaipur'", "Alt audit via SEO agent", "planned"],
    ["/testimonials", "Keep aggregateRating schema synced (4.8/181)", "Numbers verified vs GBP today", "ok"],
    ["/contact", "NAP consistent (phone/email/address) — matches GBP", "Verified in JSON-LD + footer today", "ok"],
    ["/blog (all)", "Internal links: each post → 1 service page + 1 booking CTA", "SEO agent batch job", "planned"],
    ["/blog (all)", "FAQ schema on posts with Q&A sections", "Batch add via SEO agent", "planned"],
    ["/blog/magician-in-jaipur", "Boost: internal links + 2 external links to it", "Winnable regional keyword", "planned"],
    ["/blog/magic-show-cost-india", "Refresh for 2026-27 pricing season (Nov)", "High commercial intent post", "planned"],
    ["/booking", "Title already 'Check Date & Book a Magic Show' — add 'Magician' keyword", "Small title tweak", "planned"],
    ["Site-wide", "Hindi route /hi planning (Phase 2+)", "Blog agent Hindi posts first", "planned"],
    ["Site-wide", "Breadcrumbs schema on blog posts", "Rich result enhancement", "planned"],
]
build_sheet(wb, "On-Page Fixes",
    "On-Page Optimization — page by page",
    "What is already right (status OK/done) vs what the SEO agent will still apply. All changes go through Master Admin — existing approved data is never auto-modified.",
    ["Page", "Optimization", "Notes", "Status"],
    rows7, widths=[22, 52, 52, 10], status_cols=(3,), wrap_cols=(1, 2), tab_color="1B7D46")

# ════════════════════════════════════════════════════════════════════
# SHEET 8 — CONTENT CALENDAR (30 days — blog agent executes)
# ════════════════════════════════════════════════════════════════════
rows8 = [
    ["D1", "Magician in Udaipur: The Complete 2026 Booking Guide", "magician in udaipur", "Guide", "Blog agent", "planned"],
    ["D2", "Wedding Magician vs DJ vs Band: What Udaipur Couples Actually Pick", "wedding magician udaipur", "Comparison", "Blog agent", "planned"],
    ["D3", "How Much Does a Wedding Magician Cost in Rajasthan?", "wedding magician rajasthan", "Pricing", "Blog agent", "planned"],
    ["D4", "10 Close-Up Magic Moments That Stop a Sangeet Crowd", "magician for sangeet", "Listicle", "Blog agent", "planned"],
    ["D5", "Magician for Birthday Party in Udaipur: Full Planning Run-Sheet", "magician for birthday party udaipur", "Guide", "Blog agent", "planned"],
    ["D6", "Corporate Annual Day Magic Show: 45-Minute Format That Works", "corporate magician india", "Corporate", "Blog agent", "planned"],
    ["D7", "Week 1 roundup + internal linking pass (SEO agent)", "—", "Maintenance", "SEO agent", "planned"],
    ["D8", "Destination Wedding in Udaipur? Add a Magician to the Timeline", "destination wedding magician", "Weddings", "Blog agent", "planned"],
    ["D9", "जादूगर उदयपुर: शादी के लिए मैजिक शो बुक करने की पूरी गाइड (Hindi)", "जादूगर उदयपुर", "Hindi guide", "Blog agent", "planned"],
    ["D10", "College Fest Headliner: Why Magic Trends Every Fest Season", "college fest magician", "Fests", "Blog agent", "planned"],
    ["D11", "Mentalism Explained: What a Mentalist Actually Does On Stage", "mentalist in india", "Education", "Blog agent", "planned"],
    ["D12", "Kids Birthday Magic: Age-by-Age What Works (4-14 years)", "kids magician udaipur", "Parents", "Blog agent", "planned"],
    ["D13", "Week 2 roundup + GBP post (Diwali special)", "—", "Maintenance", "SEO agent", "planned"],
    ["D14", "Magician in Jodhpur: Booking Guide for Weddings & Events", "magician in jodhpur", "City guide", "Blog agent", "planned"],
    ["D15", "Private Party Magic: What 15-80 Guest Evenings Need", "private party magician", "Luxury", "Blog agent", "planned"],
    ["D16", "Virtual Magic Shows That Actually Work on Zoom", "virtual magic show india", "Remote", "Blog agent", "planned"],
    ["D17", "5 Questions to Ask Before Booking a Stage Magician", "stage magician india booking", "Checklist", "Blog agent", "planned"],
    ["D18", "Sangeet Night Timeline: Where the 20-Minute Magic Slot Goes", "sangeet entertainment ideas", "Weddings", "Blog agent", "planned"],
    ["D19", "Week 3 roundup + FAQ schema pass (SEO agent)", "—", "Maintenance", "SEO agent", "planned"],
    ["D20", "Magician in Ahmedabad: Weddings, Corporate & Fests Guide", "magician in ahmedabad", "City guide", "Blog agent", "planned"],
    ["D21", "Why the Cheapest Magician Quote Costs the Most (Real Math)", "magic show cost in india", "Pricing", "Blog agent", "planned"],
    ["D22", "Award-Winning Magic: What IBM 2021 2nd Place Means for Your Event", "award winning magician india", "Trust", "Blog agent", "planned"],
    ["D23", "Rajtilak's Rules: 12 Years, 500 Shows — Lessons From the Stage", "jadugar rajtilak story", "Brand", "Blog agent", "planned"],
    ["D24", "Week 4 roundup + GBP post (wedding season opener)", "—", "Maintenance", "SEO agent", "planned"],
    ["D25", "Winter Wedding Season 2026-27: Entertainment Trends from Udaipur", "winter wedding entertainment", "Seasonal", "Blog agent", "planned"],
    ["D26", "Engagement Party Ideas: Micro-Magic for Intimate Evenings", "engagement party entertainment", "Weddings", "Blog agent", "planned"],
    ["D27", "आपके शहर में जादू: मैजिक शो की कीमत और बुकिंग (Hindi #2)", "magic show ki keemat", "Hindi", "Blog agent", "planned"],
    ["D28", "Annual Day Planning: Entertainment Budget Split That HR Approves", "corporate event entertainment", "Corporate", "Blog agent", "planned"],
    ["D29", "Gallery Story: Behind 5 Frames From Real Shows", "stage show gallery", "Brand", "Blog agent", "planned"],
    ["D30", "Month 1 report: posts published, keywords moved, next-month plan", "—", "Report", "SEO agent", "planned"],
]
build_sheet(wb, "Content Calendar",
    "Daily Blog Calendar — First 30 Days (Blog Writer agent)",
    "Blog Writer agent drafts one post daily (SEO-friendly, 700-1200 words, internal links, FAQ section). Drafts land in Master Admin → Blog Studio for your approval — nothing publishes without your OK, existing posts are never modified.",
    ["Day", "Blog title", "Target keyword", "Type", "Owner", "Status"],
    rows8, widths=[6, 62, 30, 12, 12, 10], status_cols=(5,), wrap_cols=(1,), tab_color="1B7D46")

# ════════════════════════════════════════════════════════════════════
# SHEET 9 — BACKLINK PLAN (white-hat only)
# ════════════════════════════════════════════════════════════════════
rows9 = [
    ["L1", "Justdial", "Directory (exists)", "Update photos, services, link; reply to reviews", "DA ~89", "W1", "Rank agent", "planned"],
    ["L2", "Venuelook", "Marketplace (exists)", "Refresh portfolio + get 5 client reviews (3-star now)", "DA ~35", "W1-3", "You + Rank", "planned"],
    ["L3", "Sulekha", "Directory (new)", "Full profile with photos + pricing + website link", "DA ~86", "W2", "Rank agent", "planned"],
    ["L4", "IndiaMART", "Directory (new)", "Business profile under event services", "DA ~89", "W2", "Rank agent", "planned"],
    ["L5", "TradeIndia", "Directory (new)", "Verified supplier profile", "DA ~78", "W3", "Rank agent", "planned"],
    ["L6", "StarClinch", "Event marketplace (new)", "Artist profile — they rank top-5 for 'book magician'", "DA ~52", "W4", "Rank agent", "planned"],
    ["L7", "WedMeGood", "Wedding marketplace (new)", "Vendor profile under entertainment (they own wedding KWs)", "DA ~57", "W4", "Rank agent", "planned"],
    ["L8", "Hire4Event", "Event marketplace (new)", "Artist page with video + pricing", "DA ~44", "W5", "Rank agent", "planned"],
    ["L9", "EventJini", "Event platform (new)", "Performer listing", "DA ~40", "W5", "Rank agent", "planned"],
    ["L10", "AliveExperiences", "Booking agency (new)", "Verified artist listing (they rank for magician KWs)", "DA ~30", "W6", "Rank agent", "planned"],
    ["L11", "GetReal.buzz", "Artist platform (new)", "Performer profile", "DA ~35", "W6", "Rank agent", "planned"],
    ["L12", "Guest posts ×5", "Wedding/event blogs", "Pitch: '5 entertainment ideas...' → 2-3 land by W7-8", "DA 20-40", "W5-8", "Rank agent", "planned"],
    ["L13", "Local press ×1", "Dainik Bhaskar / Patrika Udaipur", 'Press note: "Udaipur magician wins IBM international honour"', "DA ~80", "W7", "Rank agent", "planned"],
    ["L14", "Listicles ×3", "'Top 10 magicians India' articles", "Outreach to authors with credentials pack", "DA 25-50", "W11", "Rank agent", "planned"],
    ["L15", "Planner partnerships ×3", "Udaipur wedding planners", "Mutual 'trusted vendors' page links", "DA 15-30", "W9", "Rank agent", "planned"],
    ["—", "DISAVOW POLICY", "Zero spam rule", "No PBNs, no paid link farms, no comments spam. Monthly backlink audit; anything toxic → GSC disavow. Outreach mails personalized, max 5/week.", "—", "Always", "Rank agent", "ok"],
]
build_sheet(wb, "Backlink Plan",
    "White-Hat Backlink Plan — 15 link sources in 90 days",
    "Target: Domain Authority est. 5-10 → 15-20 in 90 days. Every link is a real profile/listing/feature — Google-safe, no spam. DA values are estimates (Oct 2026).",
    ["#", "Source", "Type", "Action", "Est. DA", "Week", "Owner", "Status"],
    rows9, widths=[6, 24, 24, 60, 10, 8, 14, 10], status_cols=(7,), wrap_cols=(3,), tab_color="1B2A4A")

# ════════════════════════════════════════════════════════════════════
# SHEET 10 — LOCAL SEO (Google Business Profile)
# ════════════════════════════════════════════════════════════════════
rows10 = [
    ["GBP", "Profile completeness", "Fill EVERY field: services (6 show formats), description with keywords, booking link, Udaipur + touring cities, hours, attributes", "planned"],
    ["GBP", "Photos", "Add 20 real show photos now; +2 every week (stage, close-up, crowd reactions, award wall)", "planned"],
    ["GBP", "Posts", "2 posts/week: show announcements, festival greetings (Diwali!), booking CTA for wedding season", "planned"],
    ["GBP", "Q&A", "Seed 5 questions ('Do you travel to Jaipur?', 'What does a show cost?') with owner answers", "planned"],
    ["GBP", "Reviews", "181 now → 211 in 90 days (+30). Reply to EVERY review within 48h with keywords", "planned"],
    ["GBP", "Products", "List Signature / Royal / Grand packages as GBP products with photos", "planned"],
    ["NAP", "Consistency", "Phone +91 97994 68758, email, Shiv Colony Bedla address identical on site/GBP/Justdial/Venuelook — verified today", "ok"],
    ["Citations", "Local directories", "Udaipur event directories + Rajasthan tourism-adjacent listings", "planned"],
    ["Local pack", "Goal", "'magician in udaipur' + 'magician near me' → local map pack top 3 in 90 days", "planned"],
]
build_sheet(wb, "Local SEO GBP",
    "Local SEO — Google Business Profile domination plan",
    "The local map pack is the fastest route to top-3 visibility for 'magician in udaipur'. GBP signals (posts, photos, reviews, completeness) decide it.",
    ["Area", "Task", "Detail", "Status"],
    rows10, widths=[10, 20, 78, 10], status_cols=(3,), wrap_cols=(2,), tab_color="D4820A")

# ════════════════════════════════════════════════════════════════════
# SHEET 11 — COMPETITOR ANALYSIS
# ════════════════════════════════════════════════════════════════════
rows11 = [
    ["Shows claimed", "500+ housefull shows", "41,500 housefull shows (Prakash Magico org)", "196+ cities performed, 6 countries"],
    ["Experience", "12+ years on stage", "47 years (family act)", "Not stated (young brand)"],
    ["Awards", "I.B.M. International 2nd Place (2021, 8 countries)", "32 awards claimed", "World Record Holder, India Book of Records"],
    ["Reviews", "4.8★ · 181 Google + 195 Justdial", "Not shown on site", "Google reviews on profile"],
    ["Website quality", "Modern, fast (fixed today), schema-rich, 10 SEO blogs", "Basic template, ticket-first flow", "Modern dark stage design, EN/HI switch"],
    ["Hero messaging", "India's Most Popular Jadugar Rajtilak — Now In Your City (new, deployed today)", "'Greatest & Fastest Magician of India'", "'India's Most Popular… Now In Your City'"],
    ["Off-page strength", "Weak (5 links) — being fixed", "Strong org backing, ticketing pages, event pages rank", "Record claims earn press mentions"],
    ["Their edge", "—", "Massive show count = trust at scale; daily show schedule", "Records + bilingual + touring banner"],
    ["Our edge", "Verified 4.8★, international award, transparent packages, live availability, modern site", "—", "—"],
    ["Copy from them", "Big-number social proof placement (hero stats row)", "Ticket booking flow for public shows (future)", "'Now In Your City' touring banner, EN/HI language switch (future)"],
    ["Beat them on", "Review velocity, content velocity (daily blog), marketplace listings, page speed", "Site quality, schema, blog depth", "Verified reviews, transparent pricing, international credential"],
]
build_sheet(wb, "Competitors",
    "Competitor Analysis — Rajtilak vs OP Sharma (Jr.) vs Jadugar Shiv Kumar",
    "Live research from 22 Oct 2026 (magicianopsharma.co.in + jadugarshivkumar.com + search results). Strategy: copy what works, beat them where they are weak.",
    ["Factor", "Jadugar Rajtilak (us)", "Magician OP Sharma Jr.", "Jadugar Shiv Kumar"],
    rows11, widths=[18, 44, 44, 44], wrap_cols=(1, 2, 3), tab_color="1B2A4A")

# ════════════════════════════════════════════════════════════════════
# SHEET 12 — KPI TRACKING (weekly template)
# ════════════════════════════════════════════════════════════════════
rows12 = [
    ["W1", TODAY, "—", "—", "—", "—", "—", "—", "—", "0", "181", "64→~89", "Fill after GSC connect"],
    ["W2", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["W3", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["W4", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["W5", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["W6", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["W7", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["W8", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["W9", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["W10", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["W11", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["W12", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["GOAL", "Day 90", "≤3", "≤3", "≤10 ×8", "≥211", "≥25", "≥15", "≥1", "≥10", "≥210", "≥85", "Top 3 + local pack"],
]
build_sheet(wb, "KPI Tracking",
    "Weekly KPI Tracking — fill every Monday",
    "Baseline row = today's audit. Fill from GSC (positions/impressions), GA4 (sessions/leads), admin Leads CRM (bookings), Rank agent log (links, DA). Goal row = Day-90 targets.",
    ["Week", "Date", "magician in udaipur", "wedding magician udaipur", "Tier-1 KWs in top 10", "GA4 sessions/wk", "Leads/wk", "Est. DA", "Local pack?", "New backlinks", "Google reviews", "Mobile LH", "Notes"],
    rows12, widths=[7, 11, 12, 12, 14, 12, 9, 8, 11, 11, 11, 10, 24],
    status_cols=(), wrap_cols=(12,), tab_color="1B7D46")

# ════════════════════════════════════════════════════════════════════
# SAVE + properties
# ════════════════════════════════════════════════════════════════════
wb.properties.creator = "Z.ai"
wb.save(OUT)
print("Saved:", OUT)
print("Sheets:", wb.sheetnames)
