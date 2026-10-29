# -*- coding: utf-8 -*-
"""Update the SEO audit workbook with the fixes deployed on 2026-10-28.

Keeps every formula intact (Exec Summary counts are live formulas on the
checklist statuses — LibreOffice recalc re-evaluates them after the edit).
Output: download/Jadugar_Rajtilak_SEO_Audit_UPDATED_2026-10-28.xlsx
"""
from openpyxl import load_workbook

SRC = "/home/z/my-project/upload/Jadugar_Rajtilak_SEO_Audit.xlsx"
OUT = "/home/z/my-project/download/Jadugar_Rajtilak_SEO_Audit_UPDATED_2026-10-28.xlsx"
DONE = "Fixed 2026-10-28"

# ID -> (new status, evidence note). None = keep status, just annotate.
FIXED = {
    "T-02": ("Pass", "FIXED 2026-10-28: /blog/<slug> now server-renders each post's own metaTitle, metaDescription, self-canonical, BlogPosting JSON-LD and the FULL article body in raw HTML. Unknown/draft slugs return a real 404. Live-verified on /blog/magician-in-jaipur."),
    "T-03": ("Pass", "Verified + improved: inner pages stream real content in the raw HTML; blog deep links now SSR the complete article (Reading Room opens server-side)."),
    "T-05": ("Pass", "FIXED: sitemap lastmod now carries real content-change dates for static pages and publishedAt for posts (no more 'today' on every build)."),
    "T-06": ("Pass", "FIXED: both duplicate Udaipur guides drafted + 301 to /magician-in-udaipur; post-20261024 renamed to keyword slug (jadugar-udaipur-shaadi-magic-show-guide) with 301; sitemap now 35 clean URLs."),
    "T-07": ("Pass", "Verified live: robots.txt allows public pages, Disallows /api/ and /admin, references the sitemap."),
    "T-08": ("Pass", "FIXED: Admin link removed from the public footer; /admin now sends X-Robots-Tag: noindex, nofollow (live-verified); robots.txt already disallowed it."),
    "T-09": ("Pass", "FIXED: every blog post URL now has a self-referencing canonical (live-verified)."),
    "T-11": ("Pass", "Verified: hero image is 81 KB with fetchPriority=high already set; a WebP conversion was tested and gave no size gain, so the optimised JPG stays."),
    "T-16": ("Pass", "Verified live: unknown top-level paths AND unknown blog slugs both return HTTP 404."),
    "T-18": ("Pass", "Verified live: http→https and www→non-www both permanent-redirect (308) in ONE hop to https://jadugarrajtilak.com."),
    "O-01": ("Pass", "FIXED: all route titles rewritten ≤60 chars, keyword first, brand last. Home is now 'Magician in Udaipur & India | Jadugar Rajtilak' (46)."),
    "O-02": ("Pass", "FIXED: all descriptions ≤155 chars with a CTA; the 'SEO-friendly guides' phrase on the blog description is gone."),
    "O-03": ("Pass", "FIXED: keyword-rich H1s live — home 'Magician in Udaipur & Across India — Where Reality Bends.', services and blog H1s rewritten, money page H1 'Magician in Udaipur'."),
    "A-02": ("Pass", "FIXED: /magician-in-udaipur money page is LIVE (900+ words, local proof, pricing, FAQ, CTAs); both duplicate blog guides 301 into it."),
    "A-07": ("Pass", "FIXED: packages now show From ₹25,000 / ₹75,000 / ₹1,50,000 (aligned with the published cost guide) — editable in Master Admin."),
    "N-02": ("Pass", "FIXED: both duplicate 'Magician in Udaipur booking guide' URLs 301 to the new money page and are drafted out of the sitemap/index."),
    "U-02": ("Pass", "Verified live: tel:+919799468758, mailto: and wa.me links on /contact (with click tracking)."),
    "U-03": ("Pass", "Verified: the 'Preparing the stage…' state is a streamed loading fallback — the real content arrives in the SAME HTML response, and the home page (LCP path) renders immediately with no preloader."),
}
# Keep status, annotate only.
ANNOTATE = {
    "T-14": "Owner decision 2026-10-28: AdSense stays (monetisation, ca-pub-8152770887372804 verified in AdSense). Next: add ads.txt when AdSense serves.",
    "T-17": "Partial: blog cards/CTAs remain SPA buttons; footer + sitemap links are real <a>; pre-hydration nav fallback handles crawlers. Blog post links now render in raw HTML.",
}

wb = load_workbook(SRC)
ws = wb["Audit Checklist"]

header_row = 4
id_col, status_col, evidence_col, done_col = 1, 4, 6, 11
updated = 0
for r in range(header_row + 1, ws.max_row + 1):
    rid = ws.cell(row=r, column=id_col).value
    if not rid or not str(rid).strip():
        continue
    rid = str(rid).strip()
    if rid in FIXED:
        status, evidence = FIXED[rid]
        ws.cell(row=r, column=status_col).value = status
        ws.cell(row=r, column=evidence_col).value = evidence
        ws.cell(row=r, column=done_col).value = DONE
        updated += 1
    elif rid in ANNOTATE:
        cur = ws.cell(row=r, column=evidence_col).value or ""
        ws.cell(row=r, column=evidence_col).value = (cur + " | " + ANNOTATE[rid]).strip(" |")
        ws.cell(row=r, column=done_col).value = "Partial"

# ── On-Page Audit sheet: refresh current titles for the four key rows ──
op = wb["On-Page Audit"]
NEW_TITLES = {
    "Home": "Magician in Udaipur & India | Jadugar Rajtilak",
    "Services": "Wedding, Corporate & Birthday Magic Shows | Rajtilak",
    "Blog index": "Magician Booking Guides & Event Ideas | Jadugar Rajtilak",
    "Blog post (test)": "Best Magician in Jaipur for Weddings & Events (2026)",
}
for r in range(1, op.max_row + 1):
    page = op.cell(row=r, column=1).value
    if page in NEW_TITLES:
        op.cell(row=r, column=3).value = NEW_TITLES[page]
    if page == "NEW: Udaipur landing":
        op.cell(row=r, column=2).value = "/magician-in-udaipur (LIVE 2026-10-28)"

wb.save(OUT)
print(f"updated {updated} checklist rows -> {OUT}")
