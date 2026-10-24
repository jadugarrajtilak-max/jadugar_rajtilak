#!/usr/bin/env python3
# Jadugar Rajtilak — Issue Tracker & Fix Status workbook (v6 update)
# Updated after: Manager Agent team-report fix ("3/4 agents healthy, 1
# issue" false positive — recovered errors now recognized), Blog Writer
# hardening (slug-collision P2002 retry, LLM type coercion, topic-queue
# advance so repeated runs never re-write the same article), error
# summaries that show the real cause, 11:30 IST manager cron slot.
import sys, os
XLSX_SKILL_DIR = "/home/z/my-project/skills/xlsx"
for sub in [XLSX_SKILL_DIR, os.path.join(XLSX_SKILL_DIR, "templates")]:
    if sub not in sys.path:
        sys.path.insert(0, sub)
from base import *
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

OUT = "/home/z/my-project/download/Jadugar_Rajtilak_Issue_Tracker_Fix_Status.xlsx"
os.makedirs(os.path.dirname(OUT), exist_ok=True)

wb = Workbook()

# ═══════════════ Sheet 1 — Issue Tracker ═══════════════
ws = wb.active
ws.title = "Issue Tracker"

headers = ["#", "Issue Reported", "Where", "Root Cause (Research)", "Fix Applied", "Status", "Verified On", "Evidence"]
issues = [
    # ── v3 batch (previous session — already live) ──
    (1, "Gallery images appear 3 times (duplicates)", "Gallery page",
     "Neon DB had extra rows gallery.item06/07/09/10 pointing to the SAME uploaded photos; old deployed code rendered 10 frames",
     "Deleted duplicate/override SiteAsset rows; gallery rebuilt: exactly the 7 client photos, one frame each",
     "FIXED", "2026-10-23",
     "Live DOM audit: 7 frames, 7 unique, 0 duplicates"),
    (2, "Home top image - keep it like the old design", "Home (hero)",
     "Repo head contained the 'India's Most Popular' redesign commit; risk of it going live",
     "Confirmed + shipped the ORIGINAL 'Where Reality Bends' edition with the real magician portrait (1024x1365, arch frame)",
     "DONE - OLD STYLE", "2026-10-23",
     "Live hero = real portrait, zero crop"),
    (3, "Home 2nd image - full image should fit in frame", "Home (story section)",
     "Near-square photo (962x944) forced into a square frame -> slight edge crop",
     "Story frame changed to the photo's exact natural ratio (aspect 962/944); rendered via the slot registry",
     "FIXED", "2026-10-23",
     "Live: rendered ratio == natural ratio (fitDelta < 0.02), full photo visible"),
    (4, "Shows page images cut / not fitting in frame", "Shows (services)",
     "Fixed 4:3 landscape frames with portrait photos -> up to 33% of each photo cut off",
     "Every services photo now renders in its own natural-ratio frame from the image slot registry",
     "FIXED", "2026-10-23",
     "Live: all 5 photos fitDelta 0.0000-0.0017 (zero visible crop)"),
    (5, "2 certificates missing - make a proper separate section", "Home + Gallery",
     "Certificates existed only as admin uploads, never placed on the site pages",
     "Dedicated 'Certificates & honours' section on BOTH Home and Gallery with the 2 official scans in gold frames with caption plates",
     "FIXED", "2026-10-23",
     "Live + VLM visual check: Certificate of Recognition + competition poster, framed, titled"),
    (6, "Old certificate showing instead of the admin-uploaded one (LG)", "Certificates",
     "Stale DB override rows pointed at pre-upload assets",
     "v3 one-time migration evicts stale cert/gallery rows on first request; admin-uploaded scans now win",
     "FIXED", "2026-10-23",
     "Live cert section = certificate-intl-2021.webp + certificate-competition-2021.webp (admin scans)"),
    (7, "Site slow / performance dropping (mobile + desktop)", "Whole site",
     "2093KB PNG poster + 2527KB PNG gallery photo + 7 unused stock images; API-bound images blocking render",
     "Recompressed to 241KB/210KB WebP; removed 7 stock files; static assets; lazy loading",
     "FIXED", "2026-10-23",
     "Live perf (both viewports): TTFB 6-29ms, FCP 440-752ms, DCL 390-648ms, JS 70KB"),
    (8, "Broken blog post images", "Blog (2 posts)",
     "2 live posts pointed at deleted /api/media/... URLs",
     "repairFeaturedImages() safety net repoints to identical static webp on first /api/blog hit",
     "FIXED", "2026-10-23",
     "Live blog: 0 broken images, 10 post cards render"),
    # ── v4 batch (this session) ──
    (9, "Mobile: tapping the 3-dot menu does not open sections", "Mobile nav (all pages)",
     "Tap happened BEFORE React hydration finished on slow phones - the button was in the HTML but had no click handler yet, so nothing opened",
     "Pre-hydration fallback: tiny native script in <body> toggles data-jr-menu on <html>; menu panel is always server-rendered; CSS shows it instantly; nav buttons carry data-jr-nav paths and navigate via full page load. React adopts the state on mount and owns the menu afterwards",
     "FIXED", "2026-10-23",
     "Live test with ALL JavaScript blocked (slow-phone simulation): tap opens full-screen menu (390x844) with all 9 sections + booking CTA; About navigates. Post-hydration flow re-verified, zero console errors"),
    (10, "Contact page does not look good - make it better", "Contact page",
     "Plain sand hero + separate status strip felt flat; channel cards stacked in one long list; bottom CTA repeated the hero actions",
     "Redesign: dark plum 'velvet-lobby' hero with gold light, 3 promise chips, one-tap WhatsApp/call CTAs; 4 channel cards in a 2x2 grid; 'Before you write' quick-answers panel linking FAQ; redundant bottom CTA removed",
     "FIXED", "2026-10-23",
     "VLM design review: all core checks PASS (hero premium, grid aligned, form clean). Live mobile + desktop screenshots verified"),
    (11, "About page - make it even better", "About page",
     "Text-only story, thin timeline dots, no numbers band, no pull quote - less premium than the rest of the site",
     "Career stats band (12+ years / 500+ shows / 40+ cities / 4.8 stars, 181 reviews); drop-cap story + gold pull-quote card; milestone timeline in gold-plate cards; touring cities strip + CTA; certificate card retained",
     "FIXED", "2026-10-23",
     "VLM review: PASS on all 6 checks. All admin text-customization keys preserved"),
    (12, "Sitemap not added - add it", "Site-wide",
     "XML sitemap + robots.txt WERE already live (all 11 routes + blog URLs, sitemap referenced in robots) but nothing visible linked to it, so it looked 'missing'",
     "Visible 'Sitemap' link added to the footer bottom bar -> opens /sitemap.xml; XML sitemap auto-includes every published post (agent-published posts appear same day)",
     "PROVIDED + VISIBLE", "2026-10-23",
     "Live: /sitemap.xml 200 (all routes + blog slugs), robots.txt references it, footer link present in live HTML"),
    (13, "Admin Leads CRM not professional - redesign it", "Admin > Leads CRM",
     "Functional but plain: no KPIs, flat cards, and the WhatsApp/email buttons were fake toasts ('Phase 2')",
     "Professional redesign: KPI strip (total / new this week / booked / events within 30 days); kanban with colored column caps, avatars, event countdown badges; polished table; detail dialog with dark header band and REAL one-tap actions - WhatsApp (wa.me with normalized +91 number and prefilled text), call (tel:), email (mailto: with subject/body), copy phone",
     "FIXED", "2026-10-23",
     "Local end-to-end: dialog opens, links verified (wa.me/91982..., tel:..., mailto:...), pipeline move saves + toast, drag-drop retained"),
    (14, "Agents create drafts but never publish/execute", "Admin > AI Agents",
     "Blog Writer saved drafts only by design; publishing required opening Blog Studio for each post; Rank Agent drafts had no execution path",
     "Auto-publish mode (default ON, owner toggle in the panel): Blog Writer publishes the daily post straight to the live site and it enters the sitemap; per-day guard prevents double publishing; 'Pending drafts' board with one-click 'Publish now' + preview; Rank pipeline rows get 'Open platform' buttons (direct listing/signup URLs) + copy-outreach",
     "FIXED", "2026-10-23",
     "Verified run: 'Published live: Magician in Udaipur: The Complete 2026 Booking Guide -> /blog/magician-in-udaipur-2026-booking-guide - already in the sitemap' (writer: llm). Toggle OFF/ON persists. Draft published via button; copy outreach works"),
    (15, "Blog Writer agent shows 'Needs attention'", "Admin > AI Agents",
     "On hosts without LLM credentials the run failed outright (LLM not reachable) -> status stuck on error -> 'Needs attention' chip",
     "Curated template fallback writer (English + Hindi) produces a complete post (6 sections, ~500-580 words, FAQ, internal links) whenever the LLM is unreachable, so every run succeeds; LLM still used when available",
     "FIXED", "2026-10-23",
     "Template unit test: 6 sections / ~582 words (EN) and ~510 words (HI), ALL CHECKS PASS. Agent card now shows 'Active'"),
    (16, "Deploy without any error", "Deployment",
     "Needed a clean lint + build + push + Vercel pipeline",
     "Lint to 0 errors (object-key quoting, JSX nesting, per-render regex, 2 pre-existing rules); production build passed; commit 09560ad pushed to GitHub main; Vercel auto-deploy live",
     "DEPLOYED", "2026-10-23",
     "Live routes all 200; new HTML contains pre-hydration menu script + footer sitemap link; VLM live QA PASS"),
    # ── v5 batch (AI security + manager + leads session) ──
    (17, "AI should never change anything on the site without the owner's permission (security)", "Admin > AI Agents / Blog Writer",
     "Auto-publish was ON by default: the Blog Writer agent published posts straight to the live site with no owner sign-off — any agent run could change the public site on its own",
     "AI Permission System: new AgentApproval table + Approval Queue in the agents panel. Blog Writer now saves a DRAFT and files an approval request; approving (one click) publishes the post, rejecting keeps the draft and closes the request. Auto-publish default flipped to OFF and reframed as the owner's explicit standing permission (toggle). Every decision is kept in an audit trail with timestamp. Cron priority puts the manager last so reports stay accurate",
     "FIXED — SECURITY", "2026-10-24",
     "Local E2E (18 checks): draft created + approval pending; approve → 'published → /blog/...' live in /api/blog; reject → draft stays, audit row recorded; anonymous API 401; unknown approval 404; invalid decision 422"),
    (18, "No one monitors the agents — need a manager agent that assigns work", "Admin > AI Agents",
     "Four independent agents with no oversight: failures, stale schedules and pending approvals could sit unnoticed; leads funnel was nobody's job",
     "5th agent — Manager Agent (team lead, daily 11:30 IST, runs last): monitors per-agent 7-day runs/success/errors, approval-queue backlog with age, lead funnel (this week vs last week + WhatsApp/call CTA taps); assigns work with reasons (error re-runs, scheduler misses, next outreach batch, post-deploy audits); read-only — it never executes anything itself",
     "FIXED — NEW AGENT", "2026-10-24",
     "Run verified: team table (4 agents, health chips), 4 work assignments incl. owner task for the approval queue, funnel chips (leads 7d vs prev, CTA taps breakdown); Manager's Desk card renders in the panel"),
    (19, "Not a single lead is coming — can't see who is actually interested", "Site-wide + Admin dashboard",
     "Lead capture existed (booking wizard + contact form) but two gaps: (1) no persistent one-tap contact path on mobile — visitors scrolled past CTAs; (2) WhatsApp/call interest was invisible — taps left no record anywhere, so phone-channel enquiries looked like zero leads",
     "Lead-generation layer: sticky mobile bottom bar (Call | WhatsApp with pre-filled message | Check Date, appears after 2.6s, hides under the menu, safe-area aware) + floating WhatsApp button on desktop; trackCta() on every high-intent CTA (sticky bar, footer, home booking strip, contact hero/channels, blog quote CTA) records GA4 cta_click + first-party CtaClick row via new POST /api/cta; Dashboard gets a 5th KPI (WhatsApp/Call taps 14d), a 'Real buying signals' card (per-type taps + where-they-tapped) and a pending-approvals badge; Manager Agent funnel report includes the same numbers",
     "FIXED — LEAD LAYER", "2026-10-24",
     "Browser E2E: sticky bar fixed at viewport bottom (390px wide, 65px tall, hides when menu opens); WhatsApp tap → CtaClick row 'whatsapp @ / (mobile)'; stats API returns cta breakdown; dashboard card renders with per-path chips"),
    (20, "DA/PA growth without spam — work the agents harder (white-hat only)", "Admin > AI Agents > Rank",
     "Pipeline had 15 sources; several strong white-hat channels were missing",
     "Rank pipeline expanded to 20 sources: Google Business Profile (weekly posts + reviews), ShaadiSaga + Weddingz.in (bridal traffic), event-manager associations (EMA chapters — repeat bookers), HARO/Qwoted/Featured.com (journalist queries → editorial links). Top-up seeding keyed by source name adds new sources to an existing pipeline without touching current rows. Zero-spam rules unchanged: no auto-submit, max 5 personalized outreach/week, owner sends from his own email",
     "FIXED — EXPANDED", "2026-10-24",
     "Rank run after restart: 'Backlink pipeline: 20 tracked sources · 0 live · 12 drafted · 8 planned'; existing 15 rows untouched, 5 new sources added"),
    (21, "Blog Writer agent crashes when run twice on the same day", "Admin > AI Agents > Blog Writer",
     "Slug dedup appended a date-based suffix (…-1024); a second run the same day with the queue exhausted computed the SAME suffixed slug → Prisma unique-constraint violation → run failed ('Needs attention' risk)",
     "Robust slug dedup: queue slug → date suffix → short random tail loop until unique; second same-day run now succeeds",
     "FIXED", "2026-10-24",
     "Two consecutive manual runs both ok: 'Approval queue: … draft ready' (distinct slugs, no crash)"),
    (22, "Deploy v5 with the new database tables, without any error", "Deployment",
     "Two new tables (AgentApproval, CtaClick) must exist on Neon Postgres before the new endpoints run in production; no local access to the production DATABASE_URL from the sandbox",
     "package.json build now runs 'prisma db push --skip-generate && next build …' — the Vercel build itself creates the new tables (purely additive, no data loss) using the project's env vars; lint 0 errors; pushed to GitHub main → Vercel auto-deploy",
     "DEPLOYED", "2026-10-24",
     "Post-deploy live verification: routes 200, approval API + CTA endpoint healthy, agents panel loads with the new sections"),
    # ── v6 batch (manager report + blog agent hardening session) ──
    (23, "Manager Agent toast: '3/4 agents healthy (7d), 1 issue(s)' — fix the issue", "Admin > AI Agents > Manager's Desk",
     "THREE stacked causes: (1) the Blog Writer's blogPost.create() crashed on a slug unique-constraint violation — the running dev server still executed PRE-fix code (error frame showed no random-tail loop), so 4 manual re-runs errored; (2) the Manager counted EVERY error inside the 7-day window as an open issue even after the agent's LATER runs succeeded (recovered errors stayed 'issues' for a week); (3) root cause of the collisions: the topic queue re-picked the SAME topic every run because the LLM returns its own slug (never equal to the topic-title slug) — 4 duplicate articles of one topic, slug space exhausted",
     "Blog Writer hardened: (a) topic done-markers + title-match guard advance the queue — a topic is never written twice; (b) P2002 unique-constraint catch + slug-tail retry loop makes concurrent runs race-proof; (c) all LLM text fields coerced to strings (keywords array, numeric titles can no longer fail the create). Manager health logic now reports CURRENT state: errors newer than the agent's last success = issue; older errors = 'recover ho chuka hai' note, not a failure. runAgent error summaries keep head+tail so the real Prisma reason is visible in the panel. vercel.json gets a second daily cron (11:30 IST) so the Manager report runs after the workers in production",
     "FIXED — 4/4 HEALTHY", "2026-10-24",
     "Local E2E (scripts/verify-agent-fixes.ts, 7 checks ALL PASS): blog run picked the NEXT topic (Wedding Magician vs DJ vs Band), exactly 1 post + 1 approval, done-marker written; manager summary now 'Team report: 4/4 agents healthy (7d), 0 issue(s)' with blog: 5 errors, 0 unrecovered, last=success. v6 deployed — Vercel commit status: success"),
]
last_col = len(headers) + 1
setup_sheet(ws, title="Jadugar Rajtilak - Issue Tracker & Fix Status (v6)", last_col=last_col)
ws.cell(row=3, column=2, value="23 issues tracked - all FIXED / PROVIDED / DEPLOYED and verified. Batch v3: gallery, certificates, image fit, performance. Batch v4: mobile menu, Contact/About redesign, sitemap link, Leads CRM, agent execution, deploy. Batch v5: AI Permission security system, Manager Agent, lead-generation layer (sticky CTAs + tap tracking), 20-source white-hat rank pipeline, slug-crash fix, auto-migration deploy. Batch v6: manager team-report accuracy (recovered errors), blog-agent race/type hardening + topic-queue advance, real-cause error summaries, manager cron slot.")
ws.cell(row=3, column=2).font = font_caption()
ws.cell(row=3, column=2).alignment = Alignment(horizontal='left', vertical='top', wrap_text=True)
ws.merge_cells(start_row=3, start_column=2, end_row=3, end_column=last_col)
for c, h in enumerate(headers, start=2):
    ws.cell(row=4, column=c, value=h)
style_header_row(ws, row_num=4, col_start=2, col_end=last_col)

for i, row in enumerate(issues):
    rn = 5 + i
    for c, v in enumerate(row, start=2):
        ws.cell(row=rn, column=c, value=v)
    style_data_row(ws, row_num=rn, col_start=2, col_end=last_col, row_index=i)
    st = row[5]
    cell = ws.cell(row=rn, column=7)
    if st.startswith(("FIXED", "DONE", "DEPLOYED", "PROVIDED", "VERIFIED")):
        cell.font = Font(name=FONT_NAME, size=11, color=ACCENT_POSITIVE)
        cell.fill = PatternFill('solid', fgColor='E8F5E9')
    ws.cell(row=rn, column=2).alignment = align_number()

ws.freeze_panes = 'C5'
auto_fit_columns(ws, min_width=8, max_width=46, header_row=4, data_start_row=5)
for col in ('C', 'E', 'F', 'I'):
    for r in range(5, 5 + len(issues)):
        ws[f'{col}{r}'].alignment = Alignment(horizontal='left', vertical='top', wrap_text=True)

# ═══════════════ Sheet 2 — Page-by-Page Status ═══════════════
ws2 = wb.create_sheet("Page Status")
h2 = ["Page", "v4 Changes", "Live Status", "Notes"]
rows2 = [
    ("Home", "Sticky CTA layer (mobile bottom bar + desktop floating WhatsApp), BookingStrip CTA tracking", "ENHANCED v5", "Every WhatsApp/Check-Date tap now records a buying signal in admin"),
    ("About", "Career stats band, drop-cap + pull quote, gold-plate milestones, touring strip + CTA (v4)", "OK", "All text customization keys preserved for admin edits"),
    ("Shows (Services)", "None this batch", "OK", "Natural-ratio photo frames from v3"),
    ("Packages", "None this batch", "OK", "Card-based design"),
    ("Gallery", "None this batch", "OK", "7 client photos + certificates wall from v3"),
    ("Reviews", "None this batch", "OK", "Text carousel"),
    ("Blog", "Quote CTA tracking; posts publish ONLY after owner approval (security gate)", "SECURED v5", "Blog Writer drafts + files approval requests; approve = live, reject = stays draft"),
    ("FAQ", "None this batch", "OK", "Contact page links into it"),
    ("Contact", "Call/WhatsApp/Email channel cards + hero actions now tracked", "ENHANCED v5", "Same v4 design; every channel tap is now a visible signal"),
    ("Booking", "None this batch", "OK", "Wizard verified E2E again in v5 (lead landed in DB)"),
    ("Admin: Dashboard", "5th KPI (WhatsApp/Call taps), 'Real buying signals' CTA card, pending-approvals badge", "ENHANCED v5", "Phone-channel interest finally visible next to form leads"),
    ("Admin: Leads CRM", "KPI strip, professional kanban + table, real WhatsApp/call/email actions (v4)", "OK", "One-tap actions verified end-to-end locally"),
    ("Admin: AI Agents", "AI Permission System (Approval Queue + audit trail, default OFF), Manager Agent card + Manager's Desk (team health + work assignments)", "SECURED v5", "Approve/Reject verified in UI; manager report verified with 4 assignments"),
    ("Footer", "Call/WhatsApp links tracked", "ENHANCED v5", "Sitemap link from v4 retained"),
    ("Mobile navigation", "Sticky CTA bar hides while the fullscreen menu is open", "OK v5", "Pre-hydration menu fix from v4 retained"),
    ("Mobile CTA layer", "NEW: fixed bottom bar Call | WhatsApp | Check Date after 2.6s + safe-area padding", "NEW v5", "Fixed at viewport bottom, hides under menu, spacer keeps footer clear"),
]
last2 = len(h2) + 1
setup_sheet(ws2, title="Page-by-Page Status (v6)", last_col=last2)
for c, h in enumerate(h2, start=2):
    ws2.cell(row=4, column=c, value=h)
style_header_row(ws2, row_num=4, col_start=2, col_end=last2)
for i, row in enumerate(rows2):
    rn = 5 + i
    for c, v in enumerate(row, start=2):
        ws2.cell(row=rn, column=c, value=v)
    style_data_row(ws2, row_num=rn, col_start=2, col_end=last2, row_index=i)
    st = ws2.cell(row=rn, column=4)
    if st.value and ("REDESIGNED" in st.value or "ENHANCED" in st.value or "UPDATED" in st.value or "FIXED" in st.value or "SECURED" in st.value or "NEW" in st.value or "OK" == st.value):
        st.font = Font(name=FONT_NAME, size=11, color=ACCENT_POSITIVE)
auto_fit_columns(ws2, min_width=10, max_width=52, header_row=4, data_start_row=5)
for col in ('C', 'E'):
    for r in range(5, 5 + len(rows2)):
        ws2[f'{col}{r}'].alignment = Alignment(horizontal='left', vertical='top', wrap_text=True)

# ═══════════════ Sheet 3 — Performance & Deploy ═══════════════
ws3 = wb.create_sheet("Performance & Deploy")
h3 = ["Metric", "Before v6", "After v6 (2026-10-24)", "Result"]
rows3 = [
    ("AI permission posture", "Blog Writer auto-published straight to the live site (default ON)", "AI Permission System: draft + approval request by default; approve/reject in one click; audit trail; toggle = explicit standing permission (default OFF)", "SECURED + VERIFIED"),
    ("Manager Agent", "Did not exist", "5th agent: daily team-health report, approval-queue watch, lead funnel (incl. CTA taps), work assignments with reasons — read-only", "NEW + VERIFIED"),
    ("Phone-channel lead visibility", "WhatsApp/call taps left no record — interest invisible", "First-party CtaClick table + GA4 cta_click; dashboard 'Real buying signals' card; Manager funnel chips", "WORKING"),
    ("Mobile conversion path", "CTAs scroll away; nothing persistent", "Sticky bottom bar (Call | WhatsApp pre-filled | Check Date) + desktop floating WhatsApp; hides under the menu", "WORKING"),
    ("Rank pipeline breadth", "15 white-hat sources", "20 sources (GBP, ShaadiSaga, Weddingz, EMA, HARO/Qwoted); top-up seeding never touches existing rows; zero-spam rules intact", "EXPANDED"),
    ("Blog agent stability", "Crashed (unique slug violation) when run twice in a day", "Robust slug dedup with random tail; consecutive same-day runs succeed", "FIXED"),
    ("DB migration on deploy", "Manual prisma db push needed (not possible from sandbox)", "Build runs prisma db push --skip-generate on Vercel — new tables auto-created, additive-only", "AUTOMATED"),
    ("ESLint errors", "0 (since v4)", "0 errors (5 pre-existing warnings only)", "CLEAN"),
    ("All routes HTTP (local)", "200", "200 — 11 site routes + blog post + sitemap + robots", "VERIFIED"),
    ("Console/page errors (local)", "None", "None on home/contact/gallery/booking/admin flows", "CLEAN"),
    ("Booking wizard E2E", "Working", "Re-verified: 4 steps → submit → lead row in DB → CRM kanban", "VERIFIED"),
    ("Deployment", "c890f7d → 09560ad (v4)", "v5 commit pushed → Vercel auto-deploy with auto-migration", "LIVE"),
    ("Manager report accuracy", "Any error inside the 7-day window = 'issue' for a full week, even after the agent recovered — toast said '3/4 healthy, 1 issue' while all agents actually worked", "Health reflects the CURRENT state: only errors NEWER than the agent's last success count; recovered ones show as a note ('recover ho chuka hai')", "FIXED — 4/4"),
    ("Blog Writer duplicate articles", "Topic queue re-picked the same topic every run (LLM slug ≠ topic-title slug): 4 copies of one article, slug collisions, crash risk", "Topic done-markers + title-match guard; queue advances to the next topic after each post; fallback topic stays dated", "FIXED"),
    ("Blog Writer crash safety", "Unique-constraint violation possible on racing runs; non-string LLM fields could fail the create entirely", "P2002 catch + slug-tail retry (3 attempts); every LLM text field coerced (array keywords joined, numbers stringified)", "HARDENED"),
    ("Agent error visibility", "Error summary truncated at 500 chars BEFORE the cause — Prisma puts the real reason after a long code frame, so the panel showed no reason", "Summaries keep head + tail: the actual cause is always visible in the agent card", "IMPROVED"),
    ("Manager cron slot (production)", "Single 10:30 IST cron tick — manager (due 11:30 IST) never fired on Vercel", "Second daily cron entry at 11:30 IST; manager reports after the workers ran", "ADDED"),
    ("Deployment", "v5 (bb352c8)", "v6 (1ea445d) pushed → Vercel auto-deploy: GitHub commit status 'success — Deployment has completed'; 14 live route checks 200, admin API still 401-anonymous", "LIVE — VERIFIED"),
]
last3 = len(h3) + 1
setup_sheet(ws3, title="Performance, Security & Deployment Summary (v6)", last_col=last3)
for c, h in enumerate(h3, start=2):
    ws3.cell(row=4, column=c, value=h)
style_header_row(ws3, row_num=4, col_start=2, col_end=last3)
for i, row in enumerate(rows3):
    rn = 5 + i
    for c, v in enumerate(row, start=2):
        ws3.cell(row=rn, column=c, value=v)
    style_data_row(ws3, row_num=rn, col_start=2, col_end=last3, row_index=i)
    imp = ws3.cell(row=rn, column=5)
    imp.font = Font(name=FONT_NAME, size=11, color=ACCENT_POSITIVE)
auto_fit_columns(ws3, min_width=10, max_width=48, header_row=4, data_start_row=5)

note_row = 5 + len(rows3) + 2
ws3.cell(row=note_row, column=2, value="How the AI Permission System works: Master Admin -> AI Agents -> Approval Queue. Blog Writer ab sirf DRAFT + approval request banata hai — "
        "Approve dabane par post live hota hai, Reject par draft surakshit rehta hai. Har decision audit trail mein timestamp ke saath rakha jaata hai. "
        "'AI Publish Permission' toggle (default OFF) aapki standing permission hai — ON karne par hi agent khud publish kar sakta hai. "
        "Manager Agent roz sab agents ki health, approval queue aur lead funnel (form leads + WhatsApp/call taps) check karke work assign karta hai. "
        "Rank Agent 20 white-hat sources par kaam karta hai — zero spam, no auto-submit; outreach aap apne email se bhejte hain. "
        "Dashboard par 'Real buying signals' card mein WhatsApp/Call/Check-Date taps dikhte hain — phone par aane wale interest ab measure hota hai.")
ws3.cell(row=note_row, column=2).font = font_caption()
ws3.cell(row=note_row, column=2).alignment = Alignment(horizontal='left', vertical='top', wrap_text=True)
ws3.merge_cells(start_row=note_row, start_column=2, end_row=note_row, end_column=last3)
ws3.row_dimensions[note_row].height = 56

wb.properties.creator = "Z.ai"
wb.save(OUT)
print("saved:", OUT, os.path.getsize(OUT), "bytes")
