#!/usr/bin/env python3
"""Patch customization.ts: gallery 5 photos + 2 certs + WebP defaults everywhere."""
import re, sys

P = "/home/z/my-project/src/lib/customization.ts"
src = open(P, encoding="utf-8").read()
orig = src

# ── 1. Story photo alt (accidentally dropped earlier) ──
src = src.replace(
    '''    defaultSrc: "/images/story-performance-v3.webp",
    hint: "Portrait 4:5",''',
    '''    defaultSrc: "/images/story-performance-v3.webp",
    defaultAlt:
      "Jadugar Rajtilak performing live in his royal blue suit — children in red chairs watching under a glowing crescent-moon stage set",
    hint: "Portrait 4:5",''',
    1,
)

# ── 2. Reel poster / about / services slots → WebP ──
src = src.replace('defaultSrc: "/images/reel-poster-v2.jpg"', 'defaultSrc: "/images/reel-poster-v3.webp"', 1)
src = src.replace('defaultSrc: "/images/about-award-v2.jpg"', 'defaultSrc: "/images/about-award-v3.webp"', 1)
src = src.replace('defaultSrc: "/images/gallery-crystal.jpg"', 'defaultSrc: "/images/gallery-crystal-v3.webp"', 1)
src = src.replace('defaultSrc: "/images/svc-corporate.jpg"', 'defaultSrc: "/images/svc-corporate-v3.webp"', 1)
src = src.replace('defaultSrc: "/images/svc-college-v2.jpg"', 'defaultSrc: "/images/svc-college-v3.webp"', 1)
src = src.replace('defaultSrc: "/images/svc-private-v2.jpg"', 'defaultSrc: "/images/svc-private-v3.webp"', 1)

# services.birthday → the new kids photo (a genuine kids-show moment)
src = src.replace(
    '''    label: "Shows — Birthday & Kids photo",
    defaultSrc: "/images/story-performance-v2.jpg",
    defaultAlt:
      "Jadugar Rajtilak performing in his royal blue suit before children seated in red chairs under a glowing crescent-moon set",''',
    '''    label: "Shows — Birthday & Kids photo",
    defaultSrc: "/images/gallery-kids-wonder.webp",
    defaultAlt:
      "Jadugar Rajtilak in a black sequin suit performing interactive magic for two child volunteers at a private birthday celebration",''',
    1,
)

# ── 3. Replace gallery items 01-10 with 5 photos + 2 certificates ──
m = re.search(r"  // Gallery \(10 frames\)\n", src)
if not m:
    print("ERROR: gallery block marker not found"); sys.exit(1)
start = m.start()
m2 = re.search(r"  // Meta\n", src)
if not m2:
    print("ERROR: meta marker not found"); sys.exit(1)
end = m2.start()

GALLERY = '''  // Gallery (5 live frames + 2 certificates — every frame is Rajtilak himself)
  {
    key: "gallery.item01",
    page: "gallery",
    label: "Gallery frame 1",
    defaultSrc: "/images/gallery-stage-mic.webp",
    defaultAlt:
      "Jadugar Rajtilak performing live on stage at night — black suit under warm golden stage lights, microphone raised, the room hanging on every word",
    cat: "stage",
    caption: "The royal voice — a live night under golden light",
    hint: "2:3",
  },
  {
    key: "gallery.item02",
    page: "gallery",
    label: "Gallery frame 2",
    defaultSrc: "/images/gallery-umbrella-portrait.webp",
    defaultAlt:
      "Jadugar Rajtilak in his shimmering royal blue suit holding two black-and-white umbrellas in a playful staged portrait — comedy timed like a tailor",
    cat: "stage",
    caption: "The umbrella interlude — comedy, tailored",
    hint: "2:3",
  },
  {
    key: "gallery.item03",
    page: "gallery",
    label: "Gallery frame 3",
    defaultSrc: "/images/gallery-kids-wonder.webp",
    defaultAlt:
      "Jadugar Rajtilak in a black sequin suit performing interactive magic for two child volunteers at a private birthday celebration",
    cat: "birthday",
    caption: "Two volunteers, one miracle — the kids' table",
    hint: "3:4",
  },
  {
    key: "gallery.item04",
    page: "gallery",
    label: "Gallery frame 4",
    defaultSrc: "/images/gallery-arvanah-gala.webp",
    defaultAlt:
      "Jadugar Rajtilak in his burgundy velvet suit hosting the Arvanah shopping destination's first-anniversary gala in Udaipur — a world-wonders themed celebration stage",
    cat: "corporate",
    caption: "Arvanah anniversary gala — Udaipur celebrates one year",
    hint: "1:1",
  },
  {
    key: "gallery.item05",
    page: "gallery",
    label: "Gallery frame 5",
    defaultSrc: "/images/gallery-felicitation-hug.webp",
    defaultAlt:
      "Jadugar Rajtilak embraced by an event organiser on a red-carpet stage after the finale — LED screen glowing behind, the evening's warmest frame",
    cat: "corporate",
    caption: "After the final bow — the organiser's embrace",
    hint: "4:5",
  },
  // Certificates (gallery honours section + home strip)
  {
    key: "gallery.cert01",
    page: "gallery",
    label: "Certificate — I.B.M. international honour",
    defaultSrc: "/images/certificate-ibm-honour.webp",
    defaultAlt:
      "Certificate of Recognition awarded to Jadugar Rajtilak (India) — 2nd place, International Online Magic Contest by the International Brotherhood of Magicians (I.B.M.), March 2021, among 100 magicians from 8 countries",
    cat: "certificate",
    caption: "2nd Place — International Online Magic Contest · I.B.M. · March 2021",
    hint: "Portrait 3:4",
  },
  {
    key: "gallery.cert02",
    page: "gallery",
    label: "Certificate — International competition 2021",
    defaultSrc: "/images/certificate-intl-competition.webp",
    defaultAlt:
      "Online International Magic Competition 2021 poster — winners and judges from eight countries under the I.B.M. International Brotherhood of Magicians banner",
    cat: "certificate",
    caption: "Online International Magic Competition 2021 — winners & judges wall",
    hint: "Portrait 3:4",
  },
'''
src = src[:start] + GALLERY + src[end:]

# ── 4. Remove old gallery caption text lines (item01..10 .caption) ──
src = re.sub(r'  \{ key: "gallery\.item\d+\.caption", page: "gallery".*?\},\n', "", src)

# ── 5. Add text lines for cert sections + home honours ──
CERT_TEXTS = '''  // ── Gallery · certificates ──
  { key: "gallery.certs.eyebrow", page: "gallery", label: "Certificates eyebrow", value: "Honours & Certifications" },
  { key: "gallery.certs.title", page: "gallery", label: "Certificates heading", value: "The paper the trophies are made of" },
  {
    key: "gallery.certs.sub",
    page: "gallery",
    label: "Certificates subheading",
    multiline: true,
    value:
      "Two documents from the International Brotherhood of Magicians — the body that has set the global standard for professional magic since 1922. Click either frame to read it full-size.",
  },
  { key: "gallery.certs.note", page: "gallery", label: "Certificates note", value: "Click a certificate to view it full-size" },
  // ── Home · honours strip ──
  { key: "home.honours.eyebrow", page: "home", label: "Honours eyebrow", value: "International Honours" },
  { key: "home.honours.title", page: "home", label: "Honours heading", value: "Recognised beyond borders" },
  {
    key: "home.honours.sub",
    page: "home",
    label: "Honours subheading",
    multiline: true,
    value:
      "In March 2021, magicians from eight countries competed in the International Online Magic Contest under the I.B.M. banner — and a stage from Udaipur, Rajasthan came home with the second place. The certificates hang here, framed exactly as they arrived.",
  },
  { key: "home.honours.stat1", page: "home", label: "Honours stat 1", value: "2nd Place" },
  { key: "home.honours.stat1Sub", page: "home", label: "Honours stat 1 note", value: "International Online Magic Contest · I.B.M. 2021" },
  { key: "home.honours.stat2", page: "home", label: "Honours stat 2", value: "8 countries" },
  { key: "home.honours.stat2Sub", page: "home", label: "Honours stat 2 note", value: "100 magicians · an international judging panel" },
  { key: "home.honours.cta", page: "home", label: "Honours CTA label", value: "See the honours wall" },
'''
anchor = "  // ── Home · packages teaser ──"
if anchor in src:
    src = src.replace(anchor, CERT_TEXTS + anchor, 1)
else:
    print("WARN: home·packages anchor not found; appending texts after gallery captions")
    src = src.rstrip() + "\n" + CERT_TEXTS

open(P, "w", encoding="utf-8").write(src)
print("customization.ts patched OK")
print("webp defaults now:", src.count('.webp"'), "| old jpg/png defaults left:", len(re.findall(r'/images/[a-z0-9-]+\.(?:jpg|png)"', src)))
