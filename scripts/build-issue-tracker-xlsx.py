#!/usr/bin/env python3
# Jadugar Rajtilak — Issue Tracker & Fix Status workbook (v3 update)
# Updated after the Gallery v3 rebuild + certificate wall + live audit (2026-10-23).
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
     "Every photo slot now uses its own natural aspect ratio (2:3, 962/944, 4:3, 1136/1384 per photo)",
     "FIXED", "2026-10-23",
     "Live audit: fitDelta 0.0000-0.0017 on all 5 photos (zero visible crop)"),
    (5, "2 certificates added from admin are missing - place them in a proper separate section on Home AND Gallery", "Home + Gallery",
     "Certificates existed as admin MediaAsset uploads but were never wired into a certificates section; only the About page had a certificate card",
     "New 'Certificates & honours' recognition wall on Home AND Gallery showing the two certificate scans: 1) Certificate of Recognition - 2nd Place, Online International Magic Competition (I.B.M.) March 2021  2) The official 2021 competition poster (winners + international jury). Both displayed in gold frames with caption plates, natural 10:13 ratio",
     "FIXED", "2026-10-23",
     "Live DOM: 2 cert images on both pages; VLM visual check: 2 official certificate documents framed with caption plates; titles verified"),
    (6, "Gallery should show only the photos I uploaded - place them properly", "Gallery page",
     "2 of the 9 uploaded photos (ARVANAH anniversary + kids birthday party) were optimized but never wired into gallery slots",
     "Gallery v3: 7 frames = exactly the 7 uploaded event photos (confetti stage, mic close-up, umbrella act, felicitation hug, LG group photo, ARVANAH mall stage, kids birthday); filters: All 7 / Stage 2 / Birthdays 1 / Galas 3 / Close-up 1; lightbox + captions intact",
     "FIXED", "2026-10-23",
     "Live: frameCount=7, uniqueCount=7, allLoad=true, filter counts verified"),
    (7, "Site hangs / runs slow on mobile", "Whole site",
     "Photos served via /api/media/ API route (US serverless function + DB round-trip per image); all images took ~30 seconds",
     "All photos now served as static edge-cached WebP files from /images/ (immutable cache)",
     "FIXED", "2026-10-23",
     "All images load in ~0.2s total (was 30.8s)"),
    (8, "Mobile side 3-dot menu not working", "Mobile menu",
     "Menu code was correct; the site slowness made taps feel dead while JS/images were still loading",
     "Speed fixed (see #7); menu verified: opens on tap, all 9 pages navigate, menu closes after navigation; no horizontal scroll",
     "FIXED + VERIFIED", "2026-10-23",
     "Playwright mobile tap test: menu opens, Gallery tap navigates to /gallery, 7 frames render, menu closes"),
    (9, "Performance score dropping", "Whole site",
     "API-served images + large certificate image + no edge caching on photos",
     "Static optimized WebP photos, new competition-poster certificate compressed 2093KB PNG to 241KB WebP, ARVANAH recompressed 236KB to 210KB, lazy loading below the fold, immutable cache headers",
     "FIXED", "2026-10-23",
     "Live perf: TTFB 6-29ms, FCP 440-752ms on mobile AND desktop; home transfer ~1.0MB with all lazy images; JS bundle 70KB"),
    (10, "Deploy to GitHub + Vercel", "Deployment",
     "Push was blocked: GitHub secret-scanning found a Vercel token in old commit history; repo was empty",
     "Secrets scrubbed; clean repo pushed; Vercel auto-deployed. v3 release pushed 2026-10-23 (gallery + certificates) and auto-deployed in ~60s",
     "DEPLOYED", "2026-10-23",
     "jadugarrajtilak.com serving the v3 build; new customization payload live"),
    (11, "Old edits keep reverting / captions coming back wrong", "Whole site (DB)",
     "Stale SiteText rows (old 10-frame captions, old LG-card certificate texts) in the production DB shadow the shipped defaults after every code update",
     "One-time v3 migration added to /api/site/customization: evicts stale rows (gallery.item*, home.cert*, about.certificate*, certificates.*) on first request after deploy; client-authored contact.* edits preserved",
     "FIXED", "2026-10-23",
     "Live API: new captions + certificate texts live; contact page user edits intact ('Contact Us / Get in Touch')"),
    (12, "Full website + backend + admin analysis - all functions working?", "Whole site",
     "Requested a complete check: every page, every function, mobile + desktop",
     "11 routes return 200 with correct SEO titles (/, about, services, packages, gallery, testimonials, blog, faq, contact, legal, admin); gallery 7 unique frames; certificates on Home+Gallery; blog 10 posts render, article open + deep link work, 0 broken images; contact form present; booking wizard date-check present; reviews page 4.8 rating; mobile menu + no horizontal scroll",
     "VERIFIED", "2026-10-23",
     "Playwright live audit (desktop 1366px + mobile 390px): all checks pass"),
    (13, "Excel template - fill with research + issue/fix updates", "This workbook",
     "Requested an issue sheet showing every problem found and whether it was fixed",
     "3 sheets: Issue Tracker, Page-by-Page Image Audit, Performance & Deploy summary",
     "PROVIDED", "2026-10-23",
     "This file (v3 update)"),
]

last_col = len(headers) + 1
setup_sheet(ws, title="Jadugar Rajtilak Website - Issue Tracker & Fix Status (v3 - 2026-10-23)", last_col=last_col)
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

# ═══════════════ Sheet 2 — Page-by-Page Image Audit ═══════════════
ws2 = wb.create_sheet("Page Image Audit")
h2 = ["Page", "Images On Page", "Frame Fit Status", "Duplicates", "Notes"]
rows2 = [
    ("Home", "Hero portrait, story photo, 2 certificate scans, reel poster", "ALL FIT - natural ratios (3:4, 962/944, 10:13, 2:3)", "None",
     "Certificates & honours section shows the Certificate of Recognition + competition poster in gold frames"),
    ("About", "Award/team photo, LG certificate card", "ALL FIT - natural 962/944 + 3:4 contain", "None",
     "'Felicitated by LG' card kept - the LG felicitation moment"),
    ("Shows (Services)", "5 photos: wedding, corporate, birthday, college, private", "ALL FIT - per-photo natural aspect", "None",
     "fitDelta 0.0000-0.0017 live (zero visible crop)"),
    ("Gallery", "7 photos in the wall + 2 certificates in a separate section below", "ALL FIT - natural ratios + lightbox", "NONE (was 3x)",
     "Exactly the 7 photos uploaded together; filters All 7 / Stage 2 / Birthdays 1 / Galas 3 / Close-up 1; captions editable from admin"),
    ("Packages", "No photos (designed cards)", "N/A", "N/A", "Card-based design, no images"),
    ("Reviews", "No photos (text carousel)", "N/A", "N/A", "4.8 rating verified live; carousel dots 36px touch targets"),
    ("Blog", "Featured images on 10 posts", "FITS - real photos, all load", "None",
     "10 post cards render; article overlay + /blog/<slug> deep links work; safety net added for any missing media"),
    ("FAQ", "No photos", "N/A", "N/A", "Accordion only"),
    ("Contact", "No photos", "N/A", "N/A", "Form present (client's own edited texts live)"),
    ("Booking", "No photos", "N/A", "N/A", "Date-check wizard renders"),
]
last2 = len(h2) + 1
setup_sheet(ws2, title="Page-by-Page Image Audit (after v3 fixes)", last_col=last2)
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
h3 = ["Metric", "Before", "After (live 2026-10-23)", "Improvement"]
rows3 = [
    ("All images load (desktop home)", "30.8 s", "0.2 s", "150x faster"),
    ("TTFB (all pages, mobile + desktop)", "n/a (API images blocked rendering)", "6-29 ms", "edge-cached"),
    ("First Contentful Paint", "blocked", "440-752 ms (mobile + desktop)", "fast"),
    ("DOM content loaded", "0.8-1.7 s", "390-648 ms", "2x faster"),
    ("Gallery frames", "10 frames, photos repeated 3x", "7 frames, 7 unique photos", "rebuilt"),
    ("Certificates shown", "0 (missing)", "2 scans on Home + Gallery", "added"),
    ("Competition poster certificate size", "2093 KB PNG (upload)", "241 KB WebP (1101x1428)", "-88%"),
    ("ARVANAH gallery photo", "2527 KB PNG (upload)", "210 KB WebP (1200x1200)", "-92%"),
    ("Unused stock images in repo", "7 files", "0 (removed)", "cleaned"),
    ("Stale DB text rows causing reverts", "~12 rows", "0 (v3 migration)", "self-healing"),
    ("Shows page max crop", "33% (photos cut)", "0.02% (invisible)", "natural frames"),
    ("Mobile 3-dot menu", "felt dead", "opens, navigates, closes correctly", "verified"),
    ("Vercel production deployment", "old build", "v3 build live (deploy ~60s after push)", "live"),
]
last3 = len(h3) + 1
setup_sheet(ws3, title="Performance & Deployment Summary (v3)", last_col=last3)
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

note_row = 5 + len(rows3) + 2
ws3.cell(row=note_row, column=2, value="Notes: the gallery now shows exactly the 7 photos uploaded together from admin, and the two certificates "
        "(Certificate of Recognition + official competition poster) sit in their own 'Certificates & honours' section on Home and Gallery. "
        "The LG felicitation stays visible in the trust bar, the story paragraph, the About certificate card and gallery frame 5. "
        "New uploads / text edits from Master Admin still work the same way and go live instantly.")
ws3.cell(row=note_row, column=2).font = font_caption()
ws3.cell(row=note_row, column=2).alignment = Alignment(horizontal='left', vertical='top', wrap_text=True)
ws3.merge_cells(start_row=note_row, start_column=2, end_row=note_row, end_column=last3)
ws3.row_dimensions[note_row].height = 56

wb.properties.creator = "Z.ai"
wb.save(OUT)
print("saved:", OUT, os.path.getsize(OUT), "bytes")
