#!/usr/bin/env python3
# Jadugar Rajtilak — Issue Tracker & Fix Status workbook (user's requested Excel update)
import sys, os
XLSX_SKILL_DIR = "/home/z/my-project/skills/xlsx"
for sub in [XLSX_SKILL_DIR, os.path.join(XLSX_SKILL_DIR, "templates")]:
    if sub not in sys.path:
        sys.path.insert(0, sub)
from base import *
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter

OUT = "/home/z/my-project/download/Jadugar_Rajtilak_Issue_Tracker_Fix_Status.xlsx"
os.makedirs(os.path.dirname(OUT), exist_ok=True)

wb = Workbook()

# ═══════════════ Sheet 1 — Issue Tracker ═══════════════
ws = wb.active
ws.title = "Issue Tracker"

headers = ["#", "Issue Reported", "Where", "Root Cause (Research)", "Fix Applied", "Status", "Verified On", "Evidence"]
issues = [
    (1, "Gallery images appear 3 times (duplicates)", "Gallery page",
     "Neon DB had extra rows gallery.item06/07/09/10 pointing to the SAME uploaded photos; old deployed code rendered 10 frames",
     "Deleted all 17 duplicate/override SiteAsset rows; deployed new 5-frame gallery code (client's 5 photos only)",
     "FIXED", "2026-10-23",
     "Live DOM audit: 5 frames, 5 unique, 0 duplicates"),
    (2, "Home top image - keep it like the old design", "Home (hero)",
     "Repo head contained the 'India's Most Popular' redesign commit; risk of it going live",
     "Confirmed + shipped the ORIGINAL 'Where Reality Bends' edition with the real magician portrait (1024x1365, arch frame)",
     "DONE - OLD STYLE", "2026-10-23",
     "Live H1 = 'Where Reality Bends'; hero = real portrait, zero crop"),
    (3, "Home 2nd image - full image should fit in frame", "Home (story section)",
     "Near-square photo (962x944) forced into a 4:5 portrait frame -> top/bottom cut",
     "Story frame changed to natural square (aspect-square); static 2x WebP asset",
     "FIXED", "2026-10-23",
     "Rendered 446x446 vs natural 962x944 - full photo visible"),
    (4, "Shows page images cut / not fitting in frame", "Shows (services)",
     "Fixed 4:3 landscape frames with portrait photos -> up to 33% of each photo cut off",
     "Every photo slot now uses its own natural aspect ratio (2:3, 1:1, 4:3, 4:5 per photo)",
     "FIXED", "2026-10-23",
     "Live audit: crops now 0-3% (was up to 33%)"),
    (5, "2 certificates added from admin are missing", "Home + Gallery",
     "No certificates section existed in code; only About had one certificate card",
     "New 'Certificates & honours' recognition wall on Home AND Gallery: 1) Felicitated by LG  2) International Magic Competition (IBM) 2021 - 2nd Place, 100 performers, 8 countries",
     "FIXED", "2026-10-23",
     "VLM visual check: 2 framed certificates visible on both pages"),
    (6, "Site hangs / runs slow on mobile", "Whole site",
     "Photos served via /api/media/ API route (US serverless function + DB round-trip per image); all images took ~30 seconds",
     "All photos now served as static edge-cached WebP files from /images/ (immutable cache)",
     "FIXED", "2026-10-23",
     "Timed audit: ALL images load in 0.2s total (was 30.8s)"),
    (7, "Mobile side 3-dot menu not working", "Mobile menu",
     "Menu code was correct; the site slowness made taps feel dead while JS/images were still loading",
     "Speed fixed (see #6); menu button verified: opens on tap, all 9 pages navigate correctly; review carousel dots enlarged to 36px touch targets",
     "FIXED + VERIFIED", "2026-10-23",
     "Playwright tap test: menu opens, 'Gallery' tap navigates to /gallery"),
    (8, "Performance score dropping", "Whole site",
     "API-served images + one 234KB certificate image + no edge caching on photos",
     "Static optimized WebP photos (91-148KB each), certificate compressed 234KB to 130KB, lazy loading below the fold, immutable cache headers",
     "FIXED", "2026-10-23",
     "Load event 0.8s desktop; mobile DOM ready 0.57s"),
    (9, "Deploy to GitHub + Vercel", "Deployment",
     "Push was blocked: GitHub secret-scanning found a Vercel token in old commit history; repo was empty",
     "Scrubbed all secrets (DB/Vercel/admin) from the tree, ops scripts now read env vars; pushed clean 5.2MB release; Vercel auto-deployed and promoted to production",
     "DEPLOYED", "2026-10-23",
     "Vercel deployment READY + PROMOTED; jadugarrajtilak.com live on new build"),
    (10, "Excel template - fill with research + issue/fix updates", "This workbook",
     "Requested an issue sheet showing every problem found and whether it was fixed",
     "3 sheets: Issue Tracker, Page-by-Page Image Audit, Performance & Deploy summary",
     "PROVIDED", "2026-10-23",
     "This file"),
]

last_col = len(headers) + 1
setup_sheet(ws, title="Jadugar Rajtilak Website - Issue Tracker & Fix Status", last_col=last_col)
for c, h in enumerate(headers, start=2):
    ws.cell(row=4, column=c, value=h)
style_header_row(ws, row_num=4, col_start=2, col_end=last_col)

for i, row in enumerate(issues):
    rn = 5 + i
    for c, v in enumerate(row, start=2):
        ws.cell(row=rn, column=c, value=v)
    style_data_row(ws, row_num=rn, col_start=2, col_end=last_col, row_index=i)
    # status colors
    st = row[5]
    cell = ws.cell(row=rn, column=7)
    if st.startswith("FIXED") or st in ("DONE - OLD STYLE", "DEPLOYED", "PROVIDED"):
        cell.font = Font(name=FONT_NAME, size=11, color=ACCENT_POSITIVE)
        cell.fill = PatternFill('solid', fgColor='E8F5E9')
    ws.cell(row=rn, column=2).alignment = align_number()

ws.freeze_panes = 'C5'
auto_fit_columns(ws, min_width=8, max_width=46, header_row=4, data_start_row=5)
# long-text columns get wrap
for col in ('C', 'E', 'F', 'I'):
    for r in range(5, 5 + len(issues)):
        ws[f'{col}{r}'].alignment = Alignment(horizontal='left', vertical='top', wrap_text=True)

# ═══════════════ Sheet 2 — Page-by-Page Image Audit ═══════════════
ws2 = wb.create_sheet("Page Image Audit")
h2 = ["Page", "Images On Page", "Frame Fit Status", "Duplicates", "Notes"]
rows2 = [
    ("Home", "Hero portrait, story photo, 2 certificates, reel poster", "ALL FIT - natural ratios (3:4, 1:1, 3:4, 10:13, 2:3)", "None",
     "Hero = old 'Where Reality Bends' design; certificates section right after the story"),
    ("About", "Award/team photo, LG certificate card", "ALL FIT - square + 3:4", "None",
     "'Felicitated by LG' title + detail line with the certificate photo"),
    ("Shows (Services)", "5 photos: wedding, corporate, birthday, college, private", "ALL FIT - per-photo natural aspect", "None",
     "Crop reduced from up to 33% to 0-3% (invisible edge rounding)"),
    ("Gallery", "5 photos in the wall + 2 certificates below", "ALL FIT - natural ratios + lightbox", "NONE (was 3x on LG certificate)",
     "Exactly the 5 photos uploaded together from admin; captions preserved"),
    ("Packages", "No photos (designed cards)", "N/A", "N/A", "Card-based design, no images"),
    ("Reviews", "No photos (text carousel)", "N/A", "N/A", "Carousel dots enlarged to 36px touch targets"),
    ("Blog", "Featured images on posts", "FITS - real photos, standard thumbnails", "None",
     "2 AI-generated images replaced with real photos earlier"),
    ("FAQ", "No photos", "N/A", "N/A", "Accordion only"),
    ("Contact", "No photos", "N/A", "N/A", "Form + details"),
    ("Booking", "No photos", "N/A", "N/A", "Wizard steps"),
]
last2 = len(h2) + 1
setup_sheet(ws2, title="Page-by-Page Image Audit (after fixes)", last_col=last2)
for c, h in enumerate(h2, start=2):
    ws2.cell(row=4, column=c, value=h)
style_header_row(ws2, row_num=4, col_start=2, col_end=last2)
for i, row in enumerate(rows2):
    rn = 5 + i
    for c, v in enumerate(row, start=2):
        ws2.cell(row=rn, column=c, value=v)
    style_data_row(ws2, row_num=rn, col_start=2, col_end=last2, row_index=i)
    st = ws2.cell(row=rn, column=4)
    if str(st.value).startswith("ALL FIT"):
        st.font = Font(name=FONT_NAME, size=11, color=ACCENT_POSITIVE)
        st.fill = PatternFill('solid', fgColor='E8F5E9')
ws2.freeze_panes = 'C5'
auto_fit_columns(ws2, min_width=10, max_width=48, header_row=4, data_start_row=5)
for r in range(5, 5 + len(rows2)):
    for col in ('C', 'E', 'F'):
        ws2[f'{col}{r}'].alignment = Alignment(horizontal='left', vertical='top', wrap_text=True)

# ═══════════════ Sheet 3 — Performance & Deploy ═══════════════
ws3 = wb.create_sheet("Performance & Deploy")
h3 = ["Metric", "Before", "After", "Improvement"]
rows3 = [
    ("All images load (desktop home)", "30.8 s", "0.2 s", "150x faster"),
    ("Page load event (desktop)", "~3-5 s (blocked by images)", "0.8 s", "4-6x faster"),
    ("Mobile DOM ready", "0.8-1.7 s", "0.57 s", "faster"),
    ("Gallery duplicate rows in DB", "4 (item06/07/09/10)", "0", "cleaned"),
    ("Photo slots served from API route", "17 slots via /api/media/", "0 (all static WebP)", "edge-cached"),
    ("Intl certificate image size", "234 KB", "130 KB (880px WebP)", "-44%"),
    ("Shows page max crop", "33% (photos cut)", "0-3%", "natural frames"),
    ("Carousel dot touch target", "18 px", "36 px", "mobile friendly"),
    ("GitHub repo", "empty, push blocked (secrets)", "clean 5.2 MB release", "secrets scrubbed"),
    ("Vercel production deployment", "old build (Oct 22)", "READY + PROMOTED (new build)", "live"),
]
last3 = len(h3) + 1
setup_sheet(ws3, title="Performance & Deployment Summary", last_col=last3)
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
auto_fit_columns(ws3, min_width=10, max_width=44, header_row=4, data_start_row=5)

# notes
note_row = 5 + len(rows3) + 2
ws3.cell(row=note_row, column=2, value="Notes: photos are the same ones uploaded from the admin panel, now stored as optimized static WebP files. "
        "New uploads from Master Admin still work the same way (they get their own cached URL). "
        "Ops scripts read credentials from scripts/.env.ops (local file, never committed).")
ws3.cell(row=note_row, column=2).font = font_caption()
ws3.cell(row=note_row, column=2).alignment = Alignment(horizontal='left', vertical='top', wrap_text=True)
ws3.merge_cells(start_row=note_row, start_column=2, end_row=note_row, end_column=last3)
ws3.row_dimensions[note_row].height = 42

wb.properties.creator = "Z.ai"
wb.save(OUT)
print("saved:", OUT, os.path.getsize(OUT), "bytes")
