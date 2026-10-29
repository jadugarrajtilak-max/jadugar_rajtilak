#!/usr/bin/env python3
"""Generate GSC Request-Indexing deep links for the priority URLs.

Each link opens Google Search Console's URL Inspection for that exact
URL — the owner just clicks "Request Indexing". Deep-link format:
https://search.google.com/search-console/inspect?resource_id=<PROP>&id=<URL>
"""
from urllib.parse import quote

BASE = "https://jadugarrajtilak.com"
PROP = "sc-domain:jadugarrajtilak.com"  # Domain property (DNS-verified)

DAY1_MONEY = [
    "/services/wedding-magician",
    "/services/corporate-shows",
    "/services/birthday-kids",
    "/services/college-stage",
    "/services/private-luxury",
    "/services/virtual-magic",
    "/destination-wedding-magician-udaipur",
    "/magician-in-udaipur",
]

DAY2_BUYER_INTENT = [
    "/blog/magic-show-cost-india",
    "/blog/birthday-party-magician-cost-in-india-2026-city-wise-price-bands",
    "/blog/how-much-does-a-wedding-magician-cost-in-rajasthan",
    "/blog/magician-for-wedding-in-india-what-top-hosts-book-and-what-they-avoid",
    "/blog/best-magician-in-india-for-corporate-events-the-2026-booking-guide",
    "/blog/mentalist-for-corporate-events-in-india-what-mind-reading-adds-to-your-evening",
    "/blog/close-up-magician-for-indian-weddings-roaming-magic-explained",
    "/blog/virtual-magic-show-online-events",
    "/blog/magician-in-jaipur",
    "/blog/magician-for-birthday-party-in-udaipur-full-planning-run-sheet",
]

DAY3_THEMATIC = [
    "/blog/wedding-entertainment-ideas",
    "/blog/sangeet-mehendi-entertainment-ideas",
    "/blog/10-close-up-magic-moments-that-stop-a-sangeet-crowd",
    "/blog/wedding-magician-vs-dj-vs-band-what-udaipur-couples-actually-pick",
    "/blog/destination-wedding-in-udaipur-add-a-magician-to-the-timeline",
    "/blog/corporate-event-entertainment",
    "/blog/corporate-annual-day-magic-show-the-45-minute-format-that-works",
    "/blog/college-fest-magic-headliner",
    "/blog/birthday-party-magician-timeline",
    "/blog/how-to-book-a-magician-in-india-the-complete-2026-checklist",
]

DAY4_SUPPORT = [
    "/",
    "/services",
    "/blog/how-to-choose-a-magician",
    "/blog/mentalism-mind-reading-show-india",
    "/blog/magician-in-delhi-for-weddings-events-the-complete-booking-guide",
    "/blog/jadugar-udaipur-shaadi-magic-show-guide",
    "/faq",
    "/packages",
]

def link(path: str) -> str:
    url = BASE + path
    return (
        "https://search.google.com/search-console/inspect"
        f"?resource_id={quote(PROP, safe='')}&id={quote(url, safe='')}"
    )

def main():
    out = []
    out.append("GSC REQUEST-INDEXING LINKS — jadugarrajtilak.com")
    out.append("Generated 2026-10-29 · 36 priority URLs in 4 day-batches")
    out.append("")
    out.append("HOW TO USE (5-10 min/day):")
    out.append("  1. Open each link below (you must be logged into the Google")
    out.append("     account that owns Search Console).")
    out.append("  2. Click REQUEST INDEXING on the page that opens.")
    out.append("  3. GSC allows ~10-12 requests/day — that is why URLs are")
    out.append("     split into 4 days, highest-value first.")
    out.append("  4. ALSO resubmit the sitemap once (link at the bottom).")
    out.append("")
    for day, (title, paths) in enumerate(
        [
            ("DAY 1 — MONEY PAGES (rank for money keywords)", DAY1_MONEY),
            ("DAY 2 — BUYER-INTENT BLOG POSTS", DAY2_BUYER_INTENT),
            ("DAY 3 — THEMATIC SUPPORTING POSTS", DAY3_THEMATIC),
            ("DAY 4 — CORE + SUPPORTING PAGES", DAY4_SUPPORT),
        ],
        1,
    ):
        out.append(f"── {title} ──")
        for p in paths:
            out.append(f"{BASE}{p}")
            out.append(f"   {link(p)}")
        out.append("")
    out.append("── SITEMAP (resubmit ONCE, takes 10 seconds) ──")
    out.append("Sitemap URL: https://jadugarrajtilak.com/sitemap.xml")
    out.append(
        "Resubmit here: https://search.google.com/search-console/sitemaps"
        f"?resource_id={quote(PROP, safe='')}"
    )
    out.append("")
    out.append("NOTE: If your GSC property is a URL-prefix type instead of a")
    out.append("Domain property, the inspect links may not open — in that case")
    out.append("open Search Console -> URL Inspection manually and paste the URL.")

    text = "\n".join(out)
    path = "/home/z/my-project/scripts/gsc-request-indexing-links.txt"
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"written: {path} ({len(out)} lines)")
    print(f"total URLs: {len(DAY1_MONEY)+len(DAY2_BUYER_INTENT)+len(DAY3_THEMATIC)+len(DAY4_SUPPORT)}")

if __name__ == "__main__":
    main()
