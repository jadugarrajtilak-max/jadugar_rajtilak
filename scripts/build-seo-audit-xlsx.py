#!/usr/bin/env python3
"""SEO Dashboard & Technical Audit — jadugarrajtilak.com
Built on the laxree.com dashboard template structure, replaced with
Jadugar Rajtilak's magician website data, real audit findings from the
2026-10-22 technical session, keyword research, and a 12-week plan.
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

OUT = "/home/z/my-project/download/SEO Dashboard & Technical Audit - jadugarrajtilak.com.xlsx"
TODAY = "22/10/2026"

STATUS_COLORS = {
    # green family
    "done": ACCENT_POSITIVE, "fixed": ACCENT_POSITIVE, "ok": ACCENT_POSITIVE,
    "live": ACCENT_POSITIVE, "indexed": ACCENT_POSITIVE, "published": ACCENT_POSITIVE,
    # amber family
    "working": ACCENT_WARNING, "pending": ACCENT_WARNING, "planned": ACCENT_WARNING,
    "track": ACCENT_WARNING, "not indexed": ACCENT_WARNING, "todo": ACCENT_WARNING,
    "verify": ACCENT_WARNING,
    # red family
    "critical": ACCENT_NEGATIVE, "missing": ACCENT_NEGATIVE, "high": ACCENT_NEGATIVE,
}

def status_color(v):
    return STATUS_COLORS.get(str(v).strip().lower(), NEUTRAL_900)

def build_sheet(wb, name, title, subtitle, headers, rows, widths=None,
                status_cols=(), wrap_cols=(), first=False):
    """Generic sheet builder following design.md layout rules."""
    ws = wb.active if first else wb.create_sheet()
    ws.title = name
    last_col = len(headers) + 1  # data starts at column B

    # Title (B2) + subtitle (B3)
    ws.merge_cells(start_row=2, start_column=2, end_row=2, end_column=last_col)
    c = ws.cell(row=2, column=2, value=title)
    c.font = font_title(); c.alignment = align_title()
    ws.row_dimensions[1].height = 15
    ws.row_dimensions[2].height = 32
    if subtitle:
        ws.merge_cells(start_row=3, start_column=2, end_row=3, end_column=last_col)
        sc = ws.cell(row=3, column=2, value=subtitle)
        sc.font = font_caption(); sc.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
        ws.row_dimensions[3].height = 26
    else:
        ws.row_dimensions[3].height = 8

    # Header row (row 4)
    for i, h in enumerate(headers, start=2):
        ws.cell(row=4, column=i, value=h)
    style_header_row(ws, row_num=4, col_start=2, col_end=last_col)

    # Data rows
    for r, row in enumerate(rows):
        row_num = 5 + r
        for ci, value in enumerate(row, start=2):
            ws.cell(row=row_num, column=ci, value=value)
        style_data_row(ws, row_num=row_num, col_start=2, col_end=last_col, row_index=r)
        ws.row_dimensions[row_num].height = 22
        # status coloring + wrap for long text
        for ci, value in enumerate(row, start=2):
            cell = ws.cell(row=row_num, column=ci)
            if (ci - 2) in status_cols and value:
                cell.font = Font(name=FONT_NAME, size=11, color=status_color(value))
            if (ci - 2) in wrap_cols:
                cell.alignment = Alignment(horizontal="left", vertical="top", wrap_text=True)

    # Column widths
    if widths:
        for i, w in enumerate(widths, start=1):
            ws.column_dimensions[get_column_letter(i)].width = w
    else:
        auto_fit_columns(ws, min_width=8, max_width=34, header_row=4, data_start_row=5)

    ws.sheet_view.showGridLines = False
    ws.freeze_panes = "B5"
    return ws


wb = Workbook()
wb.properties.creator = "Z.ai"

# ═══════════════════════════════════════════════════════════════
# Sheet 1 — Project Requirements
# ═══════════════════════════════════════════════════════════════
req_rows = [
    ["SEO Requirements", "Full technical + on-page audit, keyword research, off-page plan", "Business Name", "Jadugar Rajtilak (Magician Rajtilak)"],
    ["Existing Keywords list", "magician in Udaipur · wedding magician · corporate magic show · stage magician booking · kids birthday magician · college fest magician", "Website", "https://jadugarrajtilak.com/"],
    ["Website Credentials", "Master Admin at /admin (hashed login, brute-force lockout)", "Business Address", "Shiv Colony, Bedla, Udaipur, Rajasthan 313001"],
    ["Target Locations", "Udaipur primary; Jaipur, Jodhpur, Ahmedabad secondary; India-wide travel", "Business Phone", "+91 97994 68758"],
    ["Business Rating", "4.8 stars · 181 Google reviews (Google Business Profile)", "Business Email", "jadugar.rajtilak@gmail.com"],
    ["GA Access", "GA4 property G-103JFH1Z6B — live; editable via Master Admin → Settings → Analytics & Verification", "Google Business Profile", "kgmid /g/11c1p4hlsk — Opposite Hotel Rajkamal, Bhuwana, Udaipur"],
    ["GSC Access", "Verification panel built (Settings → Analytics & Verification). Token to be pasted + verified — PENDING", "Facebook", "https://www.facebook.com/rajtilak.jadugar"],
    ["Off-Page Email ID", "To be created (dedicated outreach inbox recommended)", "Instagram", "https://www.instagram.com/p/DCJ3hBhg8xh/ (official reel)"],
    ["Off-Page ID Password", "To be stored securely in the Master Admin password manager", "Justdial", "https://www.justdial.com/Udaipur-Rajasthan/Jadugar-Rajtilak-Opposite-Hotel-Rajkamal-Bhuwana/9999PX294-X294-180528141553-G5M2_BZDET"],
    ["Business Opening", "Event-driven; enquiries answered within 24h (written quote promise)", "Competitor Benchmark", "https://magicianopsharma.co.in/ (design + SEO reference)"],
]
build_sheet(
    wb, "Project Requirements",
    "Jadugar Rajtilak — SEO Project Requirements",
    f"Audit date {TODAY} · website https://jadugarrajtilak.com · entertainment / event services, Udaipur (Rajasthan)",
    ["SEO Project Setup", "Detail", "Business Information", "Detail"],
    req_rows,
    widths=[3, 24, 52, 26, 46],
    wrap_cols=(1, 3),
    first=True,
)

# ═══════════════════════════════════════════════════════════════
# Sheet 2 — Audit Findings (the core issue list)
# ═══════════════════════════════════════════════════════════════
findings = [
    [1, "Performance", "Mobile Lighthouse performance score was 64 — entire site (~430 KB first-party JS + 180 KB GA script) loaded in one bundle on the critical path", "Critical", "LCP 4.1s · TBT 680ms on 4x-throttled mobile", "Fixed", "Code-split every route view + the 200 KB Master Admin CMS into lazy chunks; only the home view ships on first load"],
    [2, "Performance", "framer-motion animation library (~90 KB) shipped on the home page just for scroll-reveal effects", "High", "+870ms script evaluation during hydration", "Fixed", "Replaced with pure CSS transitions + one shared IntersectionObserver (.jr-reveal) — zero animation runtime"],
    [3, "Performance", "Google Analytics gtag.js (~180 KB) downloaded + executed during page load", "High", "+263ms main-thread blocking, delayed LCP", "Fixed", "Deferred until first user interaction (pointerdown/keydown/wheel/touchstart) with 8s idle fallback — dataLayer queue keeps all pageviews"],
    [4, "Performance", "Images unoptimized — 2,818 KB total; logo alone 349 KB displayed at 215px", "High", "Slow LCP on 3G/4G mobile", "Fixed", "In-place recompression (49.4% saved → 1,427 KB); logos resized to display dimensions (logo 349→51 KB, emblem 47→5 KB)"],
    [5, "SEO — Critical", "Every deep link (/about, /services, /contact, /blog/*) served the HOME <title>, description and canonical in raw HTML — duplicate meta across all URLs", "Critical", "Google sees one page 12 times; wrong SERP titles; broken link previews", "Fixed", "Middleware stamps x-pathname; server now renders the correct per-route title/description/canonical on first byte (verified: /about, /contact, /services each render their own meta)"],
    [6, "Performance", "Smoke effect / heavy 3D card effects caused mobile jank and low scores", "Medium", "Sustained GPU load on mid-range phones", "Fixed", "Smoke effect removed; 3D tilt kept only on lazy-loaded views; reveals are now CSS-only and respect prefers-reduced-motion"],
    [7, "Deployment", "Live production site is an older build — still shows the old hero (Welcome to…) and old title, missing all October fixes", "High", "Users + Google see the unoptimized site", "Pending", "Redeploy the current build (all fixes in this audit are in the codebase and verified locally at score 88-91)"],
    [8, "SEO — Tools", "Google Search Console not verified — no indexing insight, no query data, no sitemap submission", "High", "Cannot measure or accelerate indexing", "Panel Ready", "Settings → Analytics & Verification card built: paste the GSC HTML-tag token, save, press Verify in Search Console, then submit /sitemap.xml"],
    [9, "SEO — Indexing", "Indexing status of the 11 static pages + 6 blog posts unverified", "Medium", "Unknown crawl coverage", "Pending", "After GSC verification: submit sitemap, request indexing for key pages, watch Pages report for 2 weeks"],
    [10, "Content", "Only 6 blog posts live; no publishing cadence since launch", "Medium", "Thin topical authority vs competitors posting 2+/month", "Planned", "Content Calendar sheet: 2 SEO blogs per month + weekly GBP posts for the next 12 weeks"],
    [11, "Off-Page SEO", "No backlinks, business profiles, or citations beyond GBP + Justdial", "Medium", "Weak domain authority for competitive keywords", "Planned", "Off-Page Activities sheet: profile creation, directories, image/blog submissions, communities — 15-20 submissions/month"],
    [12, "Local SEO", "Google Business Profile not posting regularly; review velocity stalled at 181", "Medium", "Local pack ranking depends on GBP activity + fresh reviews", "Planned", "GMB Post sheet: 2 posts/week (real show photos) + review-request flow after every booked show"],
    [13, "Analytics", "GA4 property active with SPA page_view tracking on all routes", "Low", "—", "OK", "Pageviews for /about, /gallery, /blog/* all recorded; first-party analytics also feeds the Master Admin Analytics tab"],
    [14, "Technical", "robots.txt, dynamic sitemap.xml (auto-adds new blog posts), JSON-LD schema (LocalBusiness + EntertainmentBusiness + AggregateRating 4.8/181 + WebSite + WebPage), CSP/HSTS security headers, canonical + OG/Twitter cards", "Low", "—", "OK", "All verified live; schema NAP matches the Google Business Profile"],
]
build_sheet(
    wb, "Audit Findings",
    "Technical & SEO Audit Findings — jadugarrajtilak.com",
    f"Audit run {TODAY} · 14 findings: 6 fixed in this session, 1 panel-ready, 5 planned, 2 verified-OK · Lighthouse mobile 64 → 88-91",
    ["#", "Category", "Issue Found", "Severity", "Impact", "Status", "Fix Applied / Action Needed"],
    findings,
    widths=[3, 6, 15, 46, 11, 26, 12, 52],
    status_cols=(3, 5),
    wrap_cols=(2, 4, 7),
)
ws = wb["Audit Findings"]
# taller rows for wrapped audit text
for r in range(5, 5 + len(findings)):
    ws.row_dimensions[r].height = 44
# severity color emphasis
for r in range(5, 5 + len(findings)):
    ws.cell(row=r, column=6).alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)

# ═══════════════════════════════════════════════════════════════
# Sheet 3 — On Page & Technical Checklist (template format)
# ═══════════════════════════════════════════════════════════════
checklist = [
    ["Alt text / image optimisation", "Done — descriptive alts on all slots; files recompressed 49%", "Schema Markup", "Done — LocalBusiness + AggregateRating + WebSite + WebPage + BlogPosting", "Unminified JS & CSS", "Done — production build minifies; first-load JS cut ~60%"],
    ["Heading tags optimisation", "Done — single H1 per route, semantic H2/H3 sections", "Robots.txt", "Done — crawlers allowed, /api and /admin excluded", "Broken internal JS/CSS", "Done — no broken bundles (smoke-tested all routes)"],
    ["Meta titles & descriptions", "Done — per-route SSR meta fixed this session (was duplicated home meta)", "XML Sitemaps", "Done — dynamic: blog posts auto-added on publish", "Render-blocking resources", "Done — GA deferred; fonts display:swap; CSS single file"],
    ["Content optimisation", "Working — home/services/about copy keyword-mapped; blogs next", "Favicon", "Done — branded icon + apple icon, versioned URLs", "HSTS support", "Done — max-age 2y incl. subdomains, preload ready"],
    ["Competitor analysis", "Done — magicianopsharma.co.in benchmarked (design + keywords)", "Google Search Console", "Pending — verification panel built, token to be pasted", "Image compression", "Done — 2,818 KB → 1,427 KB (49.4% saved)"],
    ["Internal linking", "Done — blog → booking/services contextual links", "Canonical implementation", "Done — per-route canonicals in raw HTML", "Code splitting / lazy loading", "Done — every route + admin CMS in on-demand chunks"],
]
build_sheet(
    wb, "On Page & technical checklist",
    "On-Page & Technical Checklist",
    "On-page, technical and developer actions with live status — updated " + TODAY,
    ["On-Page Actions", "Status", "Technical Actions", "Status", "Developer Actions", "Status"],
    checklist,
    widths=[3, 24, 44, 24, 44, 26, 42],
    wrap_cols=(1, 3, 5),
)

print("Sheets 1-3 built OK")

# ═══════════════════════════════════════════════════════════════
# Sheet 4 — Keywords Ranking
# ═══════════════════════════════════════════════════════════════
core_kw = [
    [1, "magician in udaipur", "Informational / Booking", "High", "Home — https://jadugarrajtilak.com/", "Track weekly", "Primary local money keyword — GBP + home page"],
    [2, "magician for wedding", "Commercial", "High", "/services (Wedding Magic)", "Track weekly", "Highest-value booking intent"],
    [3, "wedding magician india", "Commercial", "Medium", "/services (Wedding Magic)", "Track weekly", "National variant of #2"],
    [4, "corporate magician india", "Commercial", "Medium", "/services (Corporate Shows)", "Track weekly", "Annual-day / offsite bookings"],
    [5, "kids birthday magician udaipur", "Commercial", "High", "/services (Birthday & Kids)", "Track weekly", "Age-safe show angle"],
    [6, "birthday party magician near me", "Local", "High", "/services (Birthday & Kids)", "Track weekly", "Near-me pack — GBP critical"],
    [7, "college fest magician india", "Commercial", "Medium", "/services (College & Stage)", "Track weekly", "Fest-season (Oct-Feb) spike"],
    [8, "stage magician booking india", "Transactional", "Medium", "/booking", "Track weekly", "Direct booking intent"],
    [9, "magic show cost india", "Informational", "Medium", "/blog/magic-show-cost-india", "Track weekly", "Blog captures price-research traffic"],
    [10, "mentalist india events", "Commercial", "Low", "/about (mentalist angle)", "Track weekly", "Differentiator vs generic magicians"],
    [11, "event entertainment udaipur", "Commercial", "Medium", "Home", "Track weekly", "Udaipur wedding-venue ecosystem"],
    [12, "magician in jaipur", "Local", "Medium", "Home (CitiesStrip: Jaipur)", "Track weekly", "Secondary city — travel-ready"],
    [13, "magician in jodhpur", "Local", "Low", "Home (CitiesStrip: Jodhpur)", "Track weekly", "Secondary city"],
    [14, "best magician in rajasthan", "Commercial", "Medium", "Home", "Track weekly", "Review-proof: 4.8★/181"],
    [15, "jadugar rajtilak", "Navigational", "—", "Brand", "Likely #1", "Own the brand SERP (GBP + socials stack)"],
]
build_sheet(
    wb, "Keywords Ranking",
    "Keyword Research & Ranking Tracker",
    f"Core + local keyword set for a Udaipur stage magician · baseline {TODAY} · re-check positions weekly and note movement",
    ["Sr. No", "Core / Local Keyword", "Search Intent", "Competition", "Target URL", f"Position {TODAY}", "Notes / Strategy"],
    core_kw,
    widths=[3, 7, 27, 19, 12, 34, 15, 40],
    status_cols=(6,),
    wrap_cols=(6,),
)

# ═══════════════════════════════════════════════════════════════
# Sheet 5 — Website Blogs
# ═══════════════════════════════════════════════════════════════
blogs = [
    [1, "https://jadugarrajtilak.com/blog/wedding-entertainment-ideas", "9 Ways a Magician Elevates a Wedding Evening (Beyond the Stage Show)", "/services", "wedding magician · wedding entertainment ideas · magician for wedding", "Published", "Not indexed", "Submit via GSC after verification; internal-links to /booking"],
    [2, "https://jadugarrajtilak.com/blog/how-to-choose-a-magician", "How to Choose a Magician for Your Event: A 10-Point Checklist", "/services", "how to choose a magician · magician booking checklist", "Published", "Not indexed", "Trust-builder; targets comparison stage"],
    [3, "https://jadugarrajtilak.com/blog/magic-show-cost-india", "How Much Does a Magic Show Cost? An Honest Breakdown", "/packages", "magic show cost india · magic show price · magician fees", "Published", "Not indexed", "Price-query magnet; links to /packages tiers"],
    [4, "https://jadugarrajtilak.com/blog/corporate-event-entertainment", "Corporate Event Entertainment That Is Not a Piano Playlist", "/services", "corporate event entertainment · corporate magician india", "Published", "Not indexed", "Annual-day season Oct-Jan push"],
    [5, "https://jadugarrajtilak.com/blog/birthday-party-magician-timeline", "The Birthday Party Run-Sheet: Where the Magic Slot Actually Goes", "/services", "birthday party magician · kids party entertainment udaipur", "Published", "Not indexed", "Parents' planning query; weekend booking intent"],
    [6, "https://jadugarrajtilak.com/blog/college-fest-magic-headliner", "Fest Night Architecture: Scheduling a Magic Headliner That Trends", "/services", "college fest magician · fest night entertainment", "Published", "Not indexed", "Fest committee audience; Nov-Jan window"],
    [7, "(planned) udaipur-wedding-venues-magic", "The Udaipur Wedding Season Entertainer Guide (venue-by-venue)", "/services", "udaipur wedding magician · destination wedding entertainment", "Planned", "—", "Local SEO pillar — City + venue names"],
    [8, "(planned) illusion-vs-reality-show", "Illusion vs. Reality: What a Stage Illusion Show Actually Involves", "/gallery", "stage illusion show · illusionist india", "Planned", "—", "Showcases craft; gallery internal links"],
]
build_sheet(
    wb, "Website Blogs",
    "Website Blog Tracker",
    "6 posts published at audit date + 2 planned · GSC indexing to be requested right after verification",
    ["#", "Live URL", "Blog Topic", "Targeted URL", "Keywords Targeted", "Status", "GSC Indexing", "Next Action"],
    blogs,
    widths=[3, 5, 44, 42, 12, 38, 11, 12, 34],
    status_cols=(5, 6),
    wrap_cols=(2, 3, 4, 8),
)
ws = wb["Website Blogs"]
for r in range(5, 5 + len(blogs)):
    ws.row_dimensions[r].height = 30

# ═══════════════════════════════════════════════════════════════
# Sheet 6 — Content Calendar (12 weeks, Mon/Wed/Fri)
# ═══════════════════════════════════════════════════════════════
calendar = [
    ["Week 1 (Oct 26-30)", "GBP post: real stage photo + 4.8★ review badge (Diwali week wishes)", "Blog: The Udaipur Wedding Season Entertainer Guide", "GBP post: Reel embed — 30s royal stage clip"],
    ["Week 2 (Nov 2-6)", "GBP post: Corporate annual-day show photo + enquiry CTA", "GBP post: Birthday show finale photo (age-safe framing)", "Blog: Illusion vs. Reality — what a stage show involves"],
    ["Week 3 (Nov 9-13)", "GBP post: Behind-the-scenes prop case photo", "GBP post: Client testimonial graphic (Justdial 5★)", "GBP post: Fest-season college show photo"],
    ["Week 4 (Nov 16-20)", "Blog: 5 Questions to Ask Before Booking a Wedding Magician", "GBP post: Wedding sangeet magic moment", "GBP post: Weekend availability reminder (Check Date CTA)"],
    ["Week 5 (Nov 23-27)", "GBP post: Udaipur venue spotlight (photo + tag venue)", "Blog: Why Live Magic Beats a DJ Interlude at Sangeet", "GBP post: New review spotlight"],
    ["Week 6 (Nov 30-Dec 4)", "GBP post: Corporate year-end party pitch + written-quote promise", "GBP post: Behind the gold curtain teaser", "Blog: A Magician's Tech Rider, Explained for Event Planners"],
    ["Week 7 (Dec 7-11)", "GBP post: Winter wedding show photo", "GBP post: College fest highlights", "GBP post: Gift-experience angle — book magic for the family"],
    ["Week 8 (Dec 14-18)", "Blog: New Year's Eve Party Entertainment Ideas (India)", "GBP post: NYE availability countdown", "GBP post: Year-in-review collage (shows map)"],
    ["Week 9 (Dec 21-25)", "GBP post: Christmas / winter camp magic for kids", "Blog: Winter Birthday Party Ideas with a Magic Twist", "GBP post: Client spotlight — a December wedding"],
    ["Week 10 (Dec 28-Jan 1)", "GBP post: New Year wishes from the stage", "GBP post: Best photos of 2026 collage", "Blog: Fest Season 2027 Planning Guide for College Committees"],
    ["Week 11 (Jan 5-9)", "GBP post: Wedding season opener photo", "GBP post: Review of the week", "Blog: What 500+ Shows Taught Me About Reading a Room"],
    ["Week 12 (Jan 12-16)", "GBP post: Corporate kickoff-week entertainment pitch", "GBP post: Prop care / craftsmanship photo", "Blog: Destination Weddings in Udaipur — the Entertainment Checklist"],
]
build_sheet(
    wb, "Content Calendar",
    "12-Week Content Calendar — GBP Posts + SEO Blogs",
    "Cadence: 2 GBP posts + 1 blog per week (minimum) · every GBP post uses a real show photo · blogs 1,200+ words with internal links",
    ["Week", "Monday", "Wednesday", "Friday"],
    calendar,
    widths=[3, 21, 42, 42, 42],
    wrap_cols=(1, 2, 3),
)

# ═══════════════════════════════════════════════════════════════
# Sheet 7 — GMB Post (planner/tracker)
# ═══════════════════════════════════════════════════════════════
gmb = [
    [1, "Diwali stage wishes + 4.8★ badge", "October 24", "Planned", "Photo post", "Real stage photo, festival greeting, Check Date CTA"],
    [2, "Wedding sangeet magic moment", "October 27", "Planned", "Photo post", "Wedding show frame + review quote"],
    [3, "Reel embed — 30s royal stage clip", "October 30", "Planned", "Video post", "Instagram reel cross-post"],
    [4, "Corporate annual-day show", "November 3", "Planned", "Photo post", "Corporate angle + written-quote promise"],
    [5, "Birthday finale photo", "November 6", "Planned", "Photo post", "Age-safe kids show framing"],
    [6, "Testimonial graphic", "November 10", "Planned", "Update", "Justdial 5★ review design"],
    [7, "Fest-season college show", "November 13", "Planned", "Photo post", "College fest photo + hashtags"],
    [8, "Prop case behind-the-scenes", "November 17", "Planned", "Photo post", "Craftsmanship story"],
]
build_sheet(
    wb, "GMB Post",
    "Google Business Profile Post Plan",
    "2 posts/week minimum · GBP is the #1 local-pack lever for near-me keywords · add share.google links after publishing",
    ["Sr. No", "GMB Post", "Date of publish", "Status", "Type", "Creative / Notes"],
    gmb,
    widths=[3, 7, 36, 15, 11, 13, 40],
    status_cols=(3,),
    wrap_cols=(1, 5),
)

# ═══════════════════════════════════════════════════════════════
# Sheet 8 — Off Page Activities (plan + tracker)
# ═══════════════════════════════════════════════════════════════
offpage = [
    [1, "https://jadugarrajtilak.com/", "Jadugar Rajtilak", "about.me", "Profile Creation", "Planned", "High-authority bio page with NAP"],
    [2, "https://jadugarrajtilak.com/", "magician in udaipur", "solo.to", "Community backlink", "Planned", "Link-in-bio aggregator"],
    [3, "https://jadugarrajtilak.com/services", "wedding magician india", "event industry directories (Eventbrite organisers, WeddingWire India vendor listing)", "Directory Submission", "Planned", "Wedding vendor category"],
    [4, "https://jadugarrajtilak.com/", "event magician udaipur", "Justdial + Sulekha enhanced listings", "Directory Submission", "Planned", "Existing Justdial profile — enrich photos/posts"],
    [5, "https://jadugarrajtilak.com/gallery", "stage magician india", "Behance / 500px (show photography)", "Image Submission", "Planned", "5 best performance frames with captions"],
    [6, "https://jadugarrajtilak.com/blog/magic-show-cost-india", "magic show cost india", "Reddit r/IndiaEvents / r/weddingsIndia Q&A", "Forum Submission", "Planned", "Answer cost questions genuinely, cite blog"],
    [7, "https://jadugarrajtilak.com/", "magician booking", "Quora answers (event entertainment questions)", "Forum Submission", "Planned", "3 answers/month, no hard pitch"],
    [8, "https://jadugarrajtilak.com/services", "corporate magician", "LinkedIn company page + posts", "Branding Submission", "Planned", "Corporate decision-maker reach"],
    [9, "https://jadugarrajtilak.com/", "Jadugar Rajtilak", "Issuu / SlideServe (magician press kit PDF)", "PDF Submission", "Planned", "Styled press kit with photos + stats"],
    [10, "https://jadugarrajtilak.com/", "Udaipur magician", "Local press / UdaipurTimes event coverage pitch", "Press Release", "Planned", "After 2-3 landmark shows (felicitation angle)"],
    [11, "https://jadugarrajtilak.com/blog/*", "varies", "Blogger / Tumblr / Medium reposts (canonical note)", "Blog Promotion", "Planned", "1 repost per new blog, canonical back to site"],
    [12, "", "", "", "", "", "Add rows as submissions go live — keep the Live URL column filled for tracking"],
]
build_sheet(
    wb, "Off page activites",
    "Off-Page SEO Activity Plan & Tracker",
    "Target: 15-20 quality submissions/month · always match anchor keyword to the target page's intent · avoid spam networks",
    ["S.No", "Target URL", "Keyword / Naked URL", "Platform", "Off-Page Task", "Status", "Notes / Live URL"],
    offpage,
    widths=[3, 6, 34, 26, 34, 18, 11, 36],
    status_cols=(5,),
    wrap_cols=(2, 3, 4, 7),
)

# ═══════════════════════════════════════════════════════════════
# Sheet 9 — Reporting (week 1 actual + projections)
# ═══════════════════════════════════════════════════════════════
reporting = [
    ["20 Oct - 22 Oct (Audit Week)", "Full technical + on-page audit of jadugarrajtilak.com completed. Mobile performance fixed 64 → 88-91 (code splitting, animation-runtime removal, GA deferral, 49% image compression). Duplicate per-route meta fixed via middleware SSR. GA/GSC key management built into Master Admin Settings. Keyword research, content calendar and 12-week off-page plan produced (this dashboard).", "Redeploy latest build; verify GSC + submit sitemap; start GBP posting cadence; begin off-page profile submissions; first two blogs of the calendar", "NA", "NA", 0, 0, 0, 0, 0, 0, 0, "GA baseline starts post-redeploy"],
    ["23 Oct - 29 Oct (Week 1)", "Planned: GSC verification, sitemap submission, indexing requests for 6 blogs + 5 key pages, GBP post #1-3, off-page profiles (about.me, solo.to), redeploy + PageSpeed re-check", "2 GBP posts, 5 off-page submissions, indexing report from GSC Pages crawl", "Track", "Track", 0, 0, 0, 0, 0, 0, 0, 0, "Fill sessions/impressions after first full week in GA4 + GSC"],
    ["30 Oct - 5 Nov (Week 2)", "Planned: blog #7 (Udaipur wedding guide) published + promoted, directory submissions (wedding/event vendors), 2 GBP posts, Behance image submission set", "First blog indexed; 5 more backlinks; impressions baseline recorded", "Track", "Track", 0, 0, 0, 0, 0, 0, 0, 0, "Keyword positions baseline (all 15 keywords)"],
]
build_sheet(
    wb, "Reporting",
    "Jadugar Rajtilak — Weekly SEO Report",
    "Week-1 column is the completed audit; following rows are the committed plan · fill GA/GSC numbers as they land",
    ["Week", "SEO Task (This Week)", "Next Week Projection", "Website Traffic (Sessions)", "Impressions", "Facebook Published", "Instagram Published", "LinkedIn Published", "Total Posts Created", "Total Reels Created", "GBP Posts Published", "Backlinks Created", "Notes"],
    reporting,
    widths=[3, 20, 56, 44, 14, 13, 11, 11, 11, 11, 11, 11, 11, 24],
    wrap_cols=(1, 2),
)
ws = wb["Reporting"]
for r in range(5, 5 + len(reporting)):
    ws.row_dimensions[r].height = 58

# ═══════════════════════════════════════════════════════════════
# Sheet 10 — Weekly updates (task log)
# ═══════════════════════════════════════════════════════════════
updates = [
    ["20 Oct 26 to 22 Oct 26", "Conducted full technical SEO audit (Lighthouse mobile, bundle analysis, meta/canonical/schema review, robots + sitemap verification). Fixed mobile performance 64 → 88-91 via route-level code splitting, removal of the framer-motion runtime from the home page, GA4 interaction-based deferral and 49.4% image recompression. Fixed duplicate raw-HTML meta on all deep links (middleware x-pathname + per-route SSR meta). Built GA4 + Search Console key management into Master Admin → Settings (Analytics & Verification). Produced keyword research (15 keywords), 12-week content calendar, GMB post plan and off-page activity plan. Verified SPA navigation, per-route titles and zero console errors via headless-browser smoke test."],
]
build_sheet(
    wb, "Weekly updates",
    "Weekly Updates Log",
    "Append one row per week — what was actually completed",
    ["Date Range", "Task Completed"],
    updates,
    widths=[3, 20, 120],
    wrap_cols=(1,),
)
ws = wb["Weekly updates"]
for r in range(5, 5 + len(updates)):
    ws.row_dimensions[r].height = 100

wb.save(OUT)
print("saved:", OUT)
print("sheets:", wb.sheetnames)

