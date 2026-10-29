# -*- coding: utf-8 -*-
"""Patch VIEW_META in content.ts with SEO-correct titles/descriptions.

Robust against unicode ambiguity: replaces the whole VIEW_META block
matched by line numbers (regex on `export const VIEW_META` ... `};`).
"""
import re, io

PATH = "/home/z/my-project/src/lib/content.ts"
src = io.open(PATH, encoding="utf-8").read()

NEW_META = '''export const VIEW_META: Record<RouteId, { title: string; description: string }> = {
  home: {
    title: "Magician in Udaipur & India | Jadugar Rajtilak",
    description:
      "Hire Jadugar Rajtilak \\u2013 Udaipur's 4.8\\u2605 magician (181 Google reviews). Stage & close-up magic for weddings, corporate & birthday shows. Check your date.",
  },
  about: {
    title: "About Jadugar Rajtilak | Udaipur Magician, 12+ Years",
    description:
      "Meet Jadugar Rajtilak: 12+ years on stage, 500+ shows, 40+ cities and an international magic competition award. Read his story.",
  },
  services: {
    title: "Wedding, Corporate & Birthday Magic Shows | Rajtilak",
    description:
      "Six magic show formats by Jadugar Rajtilak: wedding sangeet, corporate annual day, kids birthday, college fest, private & virtual. Get a quote in 24 hrs.",
  },
  packages: {
    title: "Magic Show Packages & Prices in India | Rajtilak",
    description:
      "Compare Signature, Royal and Grand magic show packages with inclusions and starting prices. Written quote within 24 hours.",
  },
  gallery: {
    title: "Magic Show Photos & Videos | Jadugar Rajtilak",
    description:
      "See photos and video clips of Jadugar Rajtilak performing at weddings, corporate events, college fests and birthdays.",
  },
  testimonials: {
    title: "Reviews of Jadugar Rajtilak | 4.8\\u2605 Udaipur Magician",
    description:
      "Read verified client reviews of Jadugar Rajtilak from Google and Justdial \\u2013 weddings, corporate shows and birthdays across India.",
  },
  booking: {
    title: "Book a Magician in Udaipur | Check Your Date",
    description:
      "Enquire in 60 seconds: share date, city and event type and receive a written quote and 72-hour soft hold.",
  },
  blog: {
    title: "Magician Booking Guides & Event Ideas | Jadugar Rajtilak",
    description:
      "Practical guides on hiring a magician in India: costs, wedding & corporate entertainment ideas, birthday run-sheets and booking checklists.",
  },
  faq: {
    title: "Magician Booking FAQs: Price, Travel & Setup",
    description:
      "Answers on magic show cost, travel, show length, sound/light setup, advance payment and cancellation for Jadugar Rajtilak bookings.",
  },
  contact: {
    title: "Contact Jadugar Rajtilak | Check Date & Get Quote",
    description:
      "Call, WhatsApp or email Jadugar Rajtilak to check date availability and get a written quote within 24 hours.",
  },
  legal: {
    title: "Legal \\u2014 Privacy, Terms & Cancellation",
    description: "Privacy policy, terms of service and cancellation policy for Jadugar Rajtilak bookings.",
  },
  admin: { title: "Master Admin", description: "Control room" },
  udaipur: {
    title: "Magician in Udaipur | Wedding & Birthday Shows",
    description:
      "Looking for a magician in Udaipur? Jadugar Rajtilak \\u2013 4.8\\u2605 on Google \\u2013 performs at weddings, hotels, corporate events & birthdays. Check your date.",
  },
};'''

# Decode the \uXXXX escapes into real characters for the final file
NEW_META = NEW_META.encode().decode("unicode_escape")

pattern = re.compile(
    r"export const VIEW_META: Record<RouteId, \{ title: string; description: string \}\> = \{.*?\n\};",
    re.S,
)
m = pattern.search(src)
assert m, "VIEW_META block not found"
src = src[: m.start()] + NEW_META + src[m.end() :]

# Update the stale comment line right above the block
src = src.replace(
    "// Per-view metadata (SPA titles \u2014 applied client-side per route)",
    "// Per-view metadata (SPA titles \u2014 applied client-side per route).\n"
    "// SEO fix (2026-10-28): titles \u226460 chars, keyword first, brand last;\n"
    "// descriptions \u2264155 chars with a CTA. The old set led with the brand\n"
    "// and overran Google's display limits (home title was 88 chars).",
)

io.open(PATH, "w", encoding="utf-8").write(src)
print("VIEW_META patched OK")
