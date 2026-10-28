# -*- coding: utf-8 -*-
"""Google Search Console URL Submission workbook for jadugarrajtilak.com.

Two sheets:
  1. Submit Guide  — step-by-step GSC instructions (sitemap first, then
     manual Request Indexing with the ~10/day quota plan).
  2. URLs to Submit — all 33 live URLs (11 static + 22 blog posts) from
     the live sitemap (2026-10-25), ordered into a 4-day manual-request
     plan, with a Status dropdown (Pending/Requested/Indexed) for
     tracking.

Design system: skills/xlsx/templates/base.py (professional palette).
"""
import sys, os

XLSX_SKILL_DIR = "/home/z/my-project/skills/xlsx"
for sub in [XLSX_SKILL_DIR, os.path.join(XLSX_SKILL_DIR, "templates")]:
    if sub not in sys.path:
        sys.path.insert(0, sub)

from base import (
    FONT_NAME, HEADER_BOLD, PRIMARY, NEUTRAL_600, NEUTRAL_900,
    setup_sheet, style_header_row, style_data_row, style_total_row,
    auto_fit_columns, font_caption, font_body,
)
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.utils import get_column_letter

OUT = "/home/z/my-project/download/Google-Search-Console-URL-Submission.xlsx"
SITE = "https://jadugarrajtilak.com"
TODAY = "2026-10-25"

# ── Live sitemap data (fetched 2026-10-25): url, lastmod, priority, changefreq
STATIC = [
    (SITE + "/",                    TODAY, "1",   "weekly"),
    (SITE + "/services",            TODAY, "0.9", "monthly"),
    (SITE + "/booking",             TODAY, "0.9", "monthly"),
    (SITE + "/about",               TODAY, "0.8", "monthly"),
    (SITE + "/packages",            TODAY, "0.8", "monthly"),
    (SITE + "/contact",             TODAY, "0.8", "monthly"),
    (SITE + "/gallery",             TODAY, "0.7", "weekly"),
    (SITE + "/testimonials",        TODAY, "0.7", "weekly"),
    (SITE + "/blog",                TODAY, "0.6", "weekly"),
    (SITE + "/faq",                 TODAY, "0.6", "monthly"),
    (SITE + "/legal",               TODAY, "0.3", "yearly"),
]
STATIC_TOPIC = {
    "/": "Home — main landing page",
    "/services": "Shows / Services — what he performs",
    "/booking": "Booking — enquiry / booking page",
    "/about": "About — profile & story",
    "/packages": "Packages — pricing tiers",
    "/contact": "Contact — phone, WhatsApp, form",
    "/gallery": "Gallery — photos & certificates",
    "/testimonials": "Reviews — client testimonials",
    "/blog": "Journal / Blog index",
    "/faq": "FAQ — common booking questions",
    "/legal": "Legal — privacy & terms",
}

BLOG = [
    # slug, topic, lastmod, day (buyer-intent first)
    ("magician-in-udaipur-2026-booking-guide", "Magician in Udaipur — 2026 booking guide", "2026-10-22", "Day 2"),
    ("magician-for-wedding-in-india-what-top-hosts-book-and-what-they-avoid", "Magician for wedding in India — what top hosts book", "2026-10-22", "Day 2"),
    ("best-magician-in-india-for-corporate-events-the-2026-booking-guide", "Best magician in India for corporate events — booking guide", "2026-10-23", "Day 2"),
    ("how-to-book-a-magician-in-india-the-complete-2026-checklist", "How to book a magician in India — complete 2026 checklist", "2026-10-23", "Day 2"),
    ("magic-show-cost-india", "Magic show cost in India — pricing guide", "2026-10-22", "Day 2"),
    ("how-much-does-a-wedding-magician-cost-in-rajasthan", "Wedding magician cost in Rajasthan", "2026-10-22", "Day 2"),
    ("magician-in-jaipur", "Magician in Jaipur", "2026-10-23", "Day 2"),
    ("corporate-annual-day-magic-show-the-45-minute-format-that-works", "Corporate annual day magic show — 45-minute format", "2026-10-23", "Day 2"),
    ("corporate-event-entertainment", "Corporate event entertainment ideas", "2026-10-22", "Day 2"),
    ("destination-wedding-in-udaipur-add-a-magician-to-the-timeline", "Destination wedding in Udaipur — magician in the timeline", "2026-10-22", "Day 2"),
    ("magician-for-birthday-party-in-udaipur-full-planning-run-sheet", "Birthday party magician in Udaipur — planning run sheet", "2026-10-22", "Day 3"),
    ("birthday-party-magician-timeline", "Birthday party magician timeline", "2026-10-22", "Day 3"),
    ("wedding-magician-vs-dj-vs-band-what-udaipur-couples-actually-pick", "Wedding magician vs DJ vs band — what Udaipur couples pick", "2026-10-22", "Day 3"),
    ("wedding-entertainment-ideas", "Wedding entertainment ideas", "2026-10-22", "Day 3"),
    ("sangeet-mehendi-entertainment-ideas", "Sangeet & mehendi entertainment ideas", "2026-10-22", "Day 3"),
    ("mentalism-mind-reading-show-india", "Mentalism / mind-reading show in India", "2026-10-22", "Day 3"),
    ("college-fest-magic-headliner", "College fest magic headliner sets", "2026-10-22", "Day 3"),
    ("virtual-magic-show-online-events", "Virtual magic show for online events", "2026-10-22", "Day 3"),
    ("how-to-choose-a-magician", "How to choose a magician", "2026-10-22", "Day 3"),
    ("10-close-up-magic-moments-that-stop-a-sangeet-crowd", "10 close-up magic moments that stop a sangeet crowd", "2026-10-22", "Day 3"),
    ("magician-in-udaipur-the-complete-2026-booking-guide", "Magician in Udaipur — complete guide (review: similar to Day 2 post)", "2026-10-22", "Day 4"),
    ("post-20261024", "Auto-generated post (review: give it a proper slug in Blog CMS)", "2026-10-24", "Day 4"),
]

wb = Workbook()

# ════════════════════════════════════════════════════════════════
# Sheet 1 — Submit Guide
# ════════════════════════════════════════════════════════════════
gs = wb.active
gs.title = "Submit Guide"
G_HEADERS = ["Step", "Action", "Where in Search Console", "Details"]
g_last_col = len(G_HEADERS) + 1  # ends at column E

setup_sheet(gs, title="Google Search Console — URL Submission Guide", last_col=g_last_col)
gs.cell(row=3, column=2, value="Site: " + SITE + "   |   Generated: " + TODAY + "   |   33 URLs live").font = font_caption()

for col, h in enumerate(G_HEADERS, 2):
    gs.cell(row=4, column=col, value=h)
style_header_row(gs, row_num=4, col_start=2, col_end=g_last_col)

GUIDE_ROWS = [
    (1, "Verify the property (one time only)",
     "Add property → URL prefix → " + SITE,
     "If not verified yet: choose the “HTML tag” method, copy the token, paste it in Master Admin → Settings → "
     "Search Console token field, save, then press Verify here. The tag is already live on the site."),
    (2, "Submit the sitemap — covers ALL 33 URLs in one shot",
     "Sitemaps → “Add a new sitemap”",
     "Type exactly: sitemap.xml  → press Submit. New blog posts are added to the sitemap automatically — "
     "re-submit only occasionally. This is the single most important step."),
    (3, "Request indexing for key pages (10 per day)",
     "URL Inspection (search bar at the top)",
     "Paste one URL from the “URLs to Submit” sheet → press Enter → “Request Indexing”. Google allows about "
     "10 manual requests per day, so the sheet splits all URLs into Day 1–Day 4."),
    (4, "Check what got indexed (after 3–7 days)",
     "URL Inspection + Indexing → Pages report",
     "Search the URL in URL Inspection and look for “URL is on Google”. The Pages report shows Indexed / "
     "Not indexed / Duplicate counts for the whole site."),
    (5, "Weekly routine — keep the flywheel running",
     "URL Inspection (new posts only)",
     "The blog autopilot publishes new posts automatically. Every week: request indexing for new posts, "
     "re-check a few important pages, and fix anything shown as “Not indexed”."),
]
for i, row_data in enumerate(GUIDE_ROWS):
    r = 5 + i
    for col, value in enumerate(row_data, 2):
        gs.cell(row=r, column=col, value=value)
    style_data_row(gs, row_num=r, col_start=2, col_end=g_last_col, row_index=i)
    gs.cell(row=r, column=2).alignment = Alignment(horizontal="center", vertical="top")

# Notes block below the table
notes_start = 5 + len(GUIDE_ROWS) + 2
NOTES = [
    "Notes:",
    "• AdSense: the meta tag google-adsense-account (ca-pub-8152770887372804) is live on every page — "
    "AdSense verification happens inside AdSense itself (Sites → Add site), not in Search Console.",
    "• Two Udaipur guide posts cover almost the same topic (see Day 2 and Day 4 in the next sheet) — "
    "consider merging them and redirecting one URL, so Google does not treat them as duplicates.",
    "• The post named “post-20261024” is an auto-generated slug — rename it to a keyword slug in "
    "Master Admin → Blog CMS before requesting indexing.",
    "• Manual “Request Indexing” speeds discovery up, but the sitemap (Step 2) already guarantees Google "
    "finds every URL. Indexing itself is Google’s decision — good titles, descriptions and internal "
    "links improve it.",
]
for i, note in enumerate(NOTES):
    cell = gs.cell(row=notes_start + i, column=2, value=note)
    cell.font = font_caption() if i > 0 else Font(name=FONT_NAME, size=9, bold=HEADER_BOLD, color=PRIMARY)
    cell.alignment = Alignment(horizontal="left", vertical="top", wrap_text=True)
    gs.merge_cells(start_row=notes_start + i, start_column=2, end_row=notes_start + i, end_column=g_last_col)
    gs.row_dimensions[notes_start + i].height = 26 if len(note) < 110 else 38

auto_fit_columns(gs, min_width=8, max_width=34, header_row=4, data_start_row=5)
gs.column_dimensions["E"].width = 62
for r in range(5, 5 + len(GUIDE_ROWS)):
    gs.cell(row=r, column=5).alignment = Alignment(horizontal="left", vertical="top", wrap_text=True)
    gs.row_dimensions[r].height = 58
gs.column_dimensions["C"].width = 34
gs.column_dimensions["D"].width = 30

# ════════════════════════════════════════════════════════════════
# Sheet 2 — URLs to Submit
# ════════════════════════════════════════════════════════════════
ws = wb.create_sheet("URLs to Submit")
U_HEADERS = ["#", "URL", "Type", "Page / Topic", "Priority", "Last Updated", "Request Day", "Status"]
u_last_col = len(U_HEADERS) + 1  # ends at column I

setup_sheet(ws, title="URLs to Submit — " + SITE, last_col=u_last_col)
ws.cell(row=3, column=2, value="All 33 live URLs from the sitemap (" + TODAY + "). Day 1–Day 4 = manual “Request Indexing” plan (~10 per day). Track progress in the Status column.").font = font_caption()

for col, h in enumerate(U_HEADERS, 2):
    ws.cell(row=4, column=col, value=h)
style_header_row(ws, row_num=4, col_start=2, col_end=u_last_col)

# Build rows: Day 1 = 10 static pages, then blog posts by day, legal last (sitemap only)
rows = []
n = 0
for url, lastmod, prio, freq in STATIC:
    path = url.replace(SITE, "") or "/"
    if path == "/legal":
        continue
    n += 1
    ptype = "Home" if path == "/" else "Core page"
    rows.append((n, url, ptype, STATIC_TOPIC[path], prio, lastmod, "Day 1", "Pending"))
for slug, topic, lastmod, day in BLOG:
    n += 1
    rows.append((n, SITE + "/blog/" + slug, "Blog post", topic, "0.6", lastmod, day, "Pending"))
rows.append((n + 1, SITE + "/legal", "Legal", STATIC_TOPIC["/legal"], "0.3", TODAY, "Sitemap only", "Pending"))

DATA_START = 5
for i, row_data in enumerate(rows):
    r = DATA_START + i
    for col, value in enumerate(row_data, 2):
        ws.cell(row=r, column=col, value=value)
    style_data_row(ws, row_num=r, col_start=2, col_end=u_last_col, row_index=i)
    ws.cell(row=r, column=2).alignment = Alignment(horizontal="center", vertical="center")
    ws.cell(row=r, column=6).alignment = Alignment(horizontal="center", vertical="center")
    ws.cell(row=r, column=7).alignment = Alignment(horizontal="center", vertical="center")
    ws.cell(row=r, column=8).alignment = Alignment(horizontal="center", vertical="center")
    ws.cell(row=r, column=9).alignment = Alignment(horizontal="center", vertical="center")

last_data_row = DATA_START + len(rows) - 1

# Totals row (live formula per Design Principle #1)
total_row = last_data_row + 1
ws.cell(row=total_row, column=2, value="Total")
ws.cell(row=total_row, column=3, value="=COUNTA(C{}:C{})&\" URLs\"".format(DATA_START, last_data_row))
ws.cell(row=total_row, column=6, value="=SUM(F{}:F{})&\" prio sum\"".format(DATA_START, last_data_row))
ws.cell(row=total_row, column=8, value="Days 1–4 + sitemap")
style_total_row(ws, row_num=total_row, col_start=2, col_end=u_last_col)

# Status dropdown
dv = DataValidation(type="list", formula1='"Pending,Requested,Indexed"', allow_blank=True)
dv.prompt = "Pick the current status"
dv.promptTitle = "Submission status"
ws.add_data_validation(dv)
dv.add("I{}:I{}".format(DATA_START, last_data_row))

auto_fit_columns(ws, min_width=8, max_width=30, header_row=4, data_start_row=DATA_START)
ws.column_dimensions["C"].width = 58   # full URLs on one line
ws.column_dimensions["E"].width = 44
ws.freeze_panes = "C5"

wb.properties.creator = "Z.ai"
os.makedirs(os.path.dirname(OUT), exist_ok=True)
wb.save(OUT)
print("saved:", OUT, "| rows:", len(rows), "| total row at", total_row)
