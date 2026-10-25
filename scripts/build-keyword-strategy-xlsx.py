#!/usr/bin/env python3
# Keyword strategy + rank tracker workbook for Jadugar Rajtilak
# Sheets: 1) Keyword Strategy  2) Current Rank Baseline  3) 7-Day Real-Lead Plan
#         4) Blog Topic Roadmap  5) Technical SEO Fixes Shipped
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
import datetime

GOLD = "B08D2F"; DARK = "2A1B3D"; CREAM = "FDF8EF"; GREEN = "1A7F37"; RED = "B3261E"
wb = Workbook()

def style_header(ws, ncols, title, subtitle):
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=ncols)
    c = ws.cell(1, 1, title)
    c.font = Font(bold=True, size=14, color="FFFFFF")
    c.fill = PatternFill("solid", fgColor=DARK)
    c.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 26
    ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=ncols)
    c2 = ws.cell(2, 1, subtitle)
    c2.font = Font(size=10, italic=True, color=DARK)
    c2.fill = PatternFill("solid", fgColor=CREAM)
    c2.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[2].height = 18

def style_table(ws, header_row, ncols, nrows):
    thin = Border(*[Side(style="thin", color="D9CBB8")] * 4)
    for col in range(1, ncols + 1):
        c = ws.cell(header_row, col)
        c.font = Font(bold=True, color="FFFFFF", size=10)
        c.fill = PatternFill("solid", fgColor=GOLD)
        c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    ws.row_dimensions[header_row].height = 30
    for row in range(header_row + 1, header_row + 1 + nrows):
        for col in range(1, ncols + 1):
            c = ws.cell(row, col)
            c.border = thin
            c.font = Font(size=10)
            c.alignment = Alignment(vertical="center", wrap_text=True)
        if (row - header_row) % 2 == 0:
            for col in range(1, ncols + 1):
                ws.cell(row, col).fill = PatternFill("solid", fgColor="FAF5EC")

def autofit(ws, widths):
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w

# ═══ Sheet 1: Keyword Strategy ═══
ws = wb.active; ws.title = "Keyword Strategy"
style_header(ws, 7, "KEYWORD STRATEGY — Jadugar Rajtilak (India-wide + Udaipur local)",
             f"Generated {datetime.date.today().isoformat()} · White-hat only · Buyer-intent first · Source: live SERP research 2026-10-24")
rows = [
    # keyword, intent, funnel, difficulty, target page, why it matters, status/action
    ("magician in udaipur", "Local buyer", "BOTTOM — highest", "LOW-MED (winnable)", "Home + blog/udaipur-guide", "Your strongest ranking shot — JustDial & VenuLook only competition; GBP (181 reviews) already backs it", "Live — needs de-duped post + internal links"),
    ("wedding magician udaipur", "Local buyer", "BOTTOM", "LOW", "Home + wedding blog posts", "High ₹ value client; 3 posts already target this cluster", "Live — strengthen with links"),
    ("magician for wedding in india", "National buyer", "BOTTOM", "MEDIUM", "New blog draft (queued)", "National wedding queries — volume across all states", "Queued — agent drafts next"),
    ("best magician in india", "National research", "MID", "HIGH (long game)", "Home title/keywords + Brand posts", "Trophy query — realistic timeline 6-12 months via content+reviews", "Keywords live today; content compounding"),
    ("corporate magician india", "National buyer", "BOTTOM", "MEDIUM", "Services page + corporate posts", "GST-invoicing client base; repeat bookings", "2 posts live; more queued"),
    ("best magician in india for corporate events", "National buyer", "BOTTOM", "LOW-MED (long-tail)", "New blog draft (queued)", "Long-tail version of trophy query — winnable in weeks", "Queued"),
    ("how to book a magician in india", "National research", "MID", "LOW-MED", "New blog draft (queued)", "Informational — feeds retargeting + newsletter list", "Queued"),
    ("birthday party magician cost", "National buyer", "BOTTOM", "LOW", "New blog draft (queued)", "Price-searchers convert — they have a date + budget", "Queued (city-wise price bands)"),
    ("close up magician india", "National buyer", "BOTTOM", "LOW-MED", "New blog draft (queued)", "Premium segment anchor", "Queued"),
    ("mentalist for corporate events india", "National buyer", "BOTTOM", "LOW", "New blog draft (queued)", "Mentalism post already live; this variant queued", "1 live + 1 queued"),
    ("magician in delhi", "City buyer", "BOTTOM", "MED (StarClinch)", "New city-guide blog", "Top-3 volume city nationwide; you tour — guide is honest", "Queued"),
    ("magician in mumbai", "City buyer", "BOTTOM", "MED (StarClinch)", "New city-guide blog", "Highest corporate-event volume city", "Queued"),
    ("magician in bangalore", "City buyer", "BOTTOM", "MED (StarClinch)", "New city-guide blog", "IT corporate annual-day market", "Queued"),
    ("destination wedding magician india", "Buyer (high ₹)", "BOTTOM", "LOW-MED", "New blog draft (queued)", "Goa/Rajasthan circuit — premium destination planners search this", "Queued"),
    ("stage magician booking india", "National buyer", "BOTTOM", "LOW-MED", "New blog draft (queued)", "Direct booking intent", "Queued"),
    ("magic show cost in india", "National price search", "MID", "LOW", "magic-show-cost post (LIVE)", "Already published — ranks for related queries", "Live"),
    ("magic show price", "National price search", "MID", "MED", "Same cluster", "Shorter variant; covered by live post", "Live"),
    ("kids birthday magician", "National buyer", "BOTTOM", "MED", "Services + kids posts (2 live)", "Age-safe messaging already differentiated", "Live"),
    ("जादूगर उदयपुर", "Hindi local buyer", "BOTTOM", "VERY LOW", "Hindi blog posts (2 live+queued)", "Hindi searchers are under-served — quick wins", "1 live, more queued"),
    ("magic show ki keemat", "Hindi price search", "MID", "VERY LOW", "Hindi price post (queued)", "Hindi price queries convert well on WhatsApp", "Queued"),
    ("jadugar rajtilak", "Brand", "BOTTOM", "TRIVIAL", "Home + GBP + JustDial", "181-review GBP ranks #1 already — protect it", "Live — owns SERP"),
]
hdr = 4
for i, r in enumerate(rows, hdr + 1):
    for j, v in enumerate(r, 1):
        ws.cell(i, j, v)
style_table(ws, hdr, 7, len(rows))
for c, w in zip("ABCDEFG", [34, 17, 16, 18, 26, 44, 26]):
    ws.column_dimensions[c].width = w
autofit(ws, [34, 17, 16, 18, 26, 44, 26])
ws.freeze_panes = f"A{hdr+1}"
for i in range(hdr + 1, hdr + 1 + len(rows)):
    intent = ws.cell(i, 2).value
    if intent and "buyer" in intent.lower():
        ws.cell(i, 2).fill = PatternFill("solid", fgColor="E6F4EA")

# ═══ Sheet 2: Rank Baseline ═══
ws2 = wb.create_sheet("Rank Baseline")
style_header(ws2, 6, "CURRENT RANK BASELINE (2026-10-24) — recheck weekly",
             "Manual SERP snapshot via live search. Site IS indexed (contact/blog/faq/booking confirmed in Google). Track movement every Monday.")
base = [
    ("jadugar rajtilak", "Yes — GBP + site pages + JustDial own the page", "1 (brand)", "Protect: reply to every new review; keep NAP identical everywhere"),
    ("jadugarrajtilak.com", "Yes — 4+ pages indexed", "n/a (URL search)", "Healthy indexation; sitemap submitted via GSC"),
    ("magician in udaipur", "Not yet in visible results — JustDial/VenuLook/Facebook dominate", "10+", "De-dupe the twin Udaipur posts; city GBP posts weekly; 8-12 weeks to page 1"),
    ("wedding magician udaipur", "Not yet visible", "10+", "3 live posts target this — needs the duplicate-content fix (done today) to consolidate"),
    ("magician for wedding india", "Not yet", "n/a", "Queued draft → publish → 6-10 weeks"),
    ("corporate magician india", "Not yet — competitor blogs (magicianarindam, hire4event) visible", "10+", "Corporate cluster: 2 live + 1 queued posts; LinkedIn sharing helps"),
    ("magician in delhi / mumbai / bangalore", "Not yet — StarClinch aggregator pages rank", "20+ (aggregators)", "City-guide posts queued; personal-experience angle beats aggregator pages post-Helpful-Content-update"),
    ("magic show cost india", "Not yet", "10+", "Live post targets it — give it 4-8 weeks + internal links from home"),
]
hdr2 = 4
for i, r in enumerate(base, hdr2 + 1):
    for j, v in enumerate(r, 1):
        ws2.cell(i, j, v)
style_table(ws2, hdr2, 6, len(base))
ws2.column_dimensions["A"].width = 34; ws2.column_dimensions["B"].width = 46
ws2.column_dimensions["C"].width = 16; ws2.column_dimensions["D"].width = 52
ws2.column_dimensions["E"].width = 10; ws2.column_dimensions["F"].width = 10
ws2.freeze_panes = f"A{hdr2+1}"

# ═══ Sheet 3: 7-Day Real-Lead Plan ═══
ws3 = wb.create_sheet("7-Day Lead Plan")
style_header(ws3, 5, "7-DAY REAL-LEAD ACTION PLAN (aapke 10 minute/day)",
             "Website capture 100% ready hai — booking form, WhatsApp CTA, analytics sab live. Ye plan traffic LEAKS band karta hai jahan leads asal mein milte hain.")
plan = [
    ("Day 1", "GBP (Google Business Profile) mein jaakar 'Google Posts' se 1 post daalein — 'November dates open for wedding magic in Udaipur'", "10 min", "GBP post = direct ranking boost in Maps + shows in 'magician in udaipur' searches", "Owner"),
    ("Day 1", "WA business profile set karein (Settings → Business tools → Business profile)", "5 min", "WhatsApp par aane wale leads catalog + pricing dekh sakte hain", "Owner"),
    ("Day 2", "Blog Studio → 2 duplicate 'Magician in Udaipur' posts mein se ek ko UNPUBLISH karein (status → draft)", "2 min", "Duplicate-content penalty hata — dono posts aapas mein compete kar rahe the", "Owner (admin)"),
    ("Day 2", "Approval Queue → pending India-targeted drafts ko preview karke approve karein (agent ne aaj banaye hain)", "5 min", "Har approval = 1 nayi indexed page = 1 naya keyword jo rank karega", "Owner (admin)"),
    ("Day 3", "Instagram/Facebook par certificate photo + 'LG felicitation' story daalein, link: jadugarrajtilak.com/booking", "10 min", "Social signals + referral traffic; bio mein website link", "Owner"),
    ("Day 3", "JustDial listing update: photos (5+), services, price band verify", "10 min", "JustDial already ranks for 'magician in udaipur' — wahan se phone aata hai", "Owner"),
    ("Day 4", "2 purane clients se Google review maangein (WhatsApp template bhejein)", "10 min", "181 → 190 reviews: review velocity = Maps ranking factor", "Owner"),
    ("Day 5", "VenuLook / WeddingWire / ShaadiSaga profile banao (free listings)", "15 min", "Ye platforms 'wedding magician' searches mein rank karte hain — wahan se direct leads", "Owner"),
    ("Day 6", "GSC (Google Search Console) kholein → Performance → dekhein kaunse queries impressions de rahi hain (searchanalytics ka data)", "5 min", "Jo queries already impressions de rahi hain unke liye content banwa sakte hain (SEO agent ko topic milega)", "Owner/AI"),
    ("Day 7", "Admin → Agents tab → Manager ka report padhein; Approval Queue clear karein", "5 min", "Roz ka routine — 5 minute mein AI ka poora hafta review", "Owner (admin)"),
]
hdr3 = 4
for i, r in enumerate(plan, hdr3 + 1):
    for j, v in enumerate(r, 1):
        ws3.cell(i, j, v)
style_table(ws3, hdr3, 5, len(plan))
ws3.column_dimensions["A"].width = 8; ws3.column_dimensions["B"].width = 60
ws3.column_dimensions["C"].width = 9; ws3.column_dimensions["D"].width = 46
ws3.column_dimensions["E"].width = 14
ws3.freeze_panes = f"A{hdr3+1}"

# ═══ Sheet 4: Blog Topic Roadmap ═══
ws4 = wb.create_sheet("Blog Roadmap")
style_header(ws4, 5, "BLOG ROADMAP — 13 nayi India-wide posts (queued, daily auto-draft)",
             "Blog Writer agent roz 10:30 IST par QUEUE SE NEXT topic ka draft banata hai → aapki approval par publish. Ye queue aaj deploy hui hai.")
topics = [
    ("Magician for Wedding in India: What Top Hosts Book", "magician for wedding in india", "Weddings", "BOTTOM", "1st up next"),
    ("Best Magician in India for Corporate Events", "best magician in india for corporate events", "Corporate", "BOTTOM", "2nd"),
    ("How to Book a Magician in India: Complete Checklist", "how to book a magician in india", "Guides", "MID", "3rd"),
    ("Birthday Party Magician Cost in India: City-Wise", "birthday party magician cost", "Pricing", "BOTTOM", "4th"),
    ("Close-Up Magician for Indian Weddings", "close up magician india", "Weddings", "BOTTOM", "5th"),
    ("Mentalist for Corporate Events in India", "mentalist for corporate events india", "Corporate", "BOTTOM", "6th"),
    ("Magician in Delhi: Complete Booking Guide", "magician in delhi", "City Guides", "BOTTOM", "7th"),
    ("Magician in Mumbai: Corporate & Private", "magician in mumbai", "City Guides", "BOTTOM", "8th"),
    ("Magician in Bangalore: Events & Parties", "magician in bangalore", "City Guides", "BOTTOM", "9th"),
    ("Destination Wedding Magician: Goa & Rajasthan", "destination wedding magician india", "Weddings", "BOTTOM", "10th"),
    ("Stage Magician Booking in India", "stage magician booking india", "Guides", "BOTTOM", "11th"),
    ("इंडिया के टॉप मैजिशियन: बुकिंग गाइड", "india ke top magician", "Hindi", "MID", "12th"),
    ("(Auto after queue) Seasonal + GSC-query topics", "from Search Console data", "Dynamic", "n/a", "Post-queue"),
]
hdr4 = 4
for i, r in enumerate(topics, hdr4 + 1):
    for j, v in enumerate(r, 1):
        ws4.cell(i, j, v)
style_table(ws4, hdr4, 5, len(topics))
ws4.column_dimensions["A"].width = 48; ws4.column_dimensions["B"].width = 34
ws4.column_dimensions["C"].width = 14; ws4.column_dimensions["D"].width = 12
ws4.column_dimensions["E"].width = 18

# ═══ Sheet 5: Tech Fixes Shipped ═══
ws5 = wb.create_sheet("Tech SEO Fixes")
style_header(ws5, 4, "TECHNICAL SEO FIXES — aaj shipped (v7, live)",
             "Sab code-level fixes hain — admin content ko kabhi touch nahi kiya gaya.")
fixes = [
    ("Duplicate meta description on every page", "CRITICAL — layout forced home's description on /services, /packages, /contact…", "Removed from root metadata; per-route SSR tags are now the ONLY description", "FIXED & DEPLOYED"),
    ("Conflicting canonical tags (layout '/' + route path)", "CRITICAL — Google ignores conflicting canonicals; deep URLs lost canonical control", "Layout canonical removed; exactly ONE per-page canonical remains", "FIXED & DEPLOYED"),
    ("No og:site_name / og:locale / twitter:card", "Minor — link previews", "Added to per-route tags", "FIXED & DEPLOYED"),
    ("Titles missing India-wide keywords", "Services/packages/booking/FAQ said nothing about India", "7 page titles rewritten with national keywords (Udaipur retained on home)", "FIXED & DEPLOYED"),
    ("Keywords meta was Udaipur-only", "National queries invisible to meta analysis tools", "+9 national keywords (best magician in india, corporate magician india…)", "FIXED & DEPLOYED"),
    ("Blog queue exhausted (all 30 topics done)", "Agent had nothing new to draft", "+13 India-wide topics appended (buyer-intent + city guides + Hindi)", "FIXED & DEPLOYED"),
    ("Twin 'Magician in Udaipur' posts (duplicate content)", "HIGH — two posts cannibalize the money keyword 'magician in udaipur'", "AI permission system kehta hai: owner hi unpublish kare (2-minute admin action, Day 2 in plan)", "OWNER ACTION"),
    ("Live agents not scheduled in production", "Agents ran manual-only", "Cron active since today 12:40 UTC (10:30/11:00 IST daily)", "DONE (earlier today)"),
]
hdr5 = 4
for i, r in enumerate(fixes, hdr5 + 1):
    for j, v in enumerate(r, 1):
        ws5.cell(i, j, v)
style_table(ws5, hdr5, 4, len(fixes))
ws5.column_dimensions["A"].width = 40; ws5.column_dimensions["B"].width = 48
ws5.column_dimensions["C"].width = 52; ws5.column_dimensions["D"].width = 20
for i in range(hdr5 + 1, hdr5 + 1 + len(fixes)):
    v = ws5.cell(i, 4).value
    if v and "FIXED" in v:
        ws5.cell(i, 4).font = Font(size=10, bold=True, color=GREEN)
    elif v and "OWNER" in v:
        ws5.cell(i, 4).font = Font(size=10, bold=True, color=RED)

out = "/home/z/my-project/download/Jadugar_Rajtilak_Keyword_Strategy_Rank_Tracker.xlsx"
wb.save(out)
print("saved:", out)
