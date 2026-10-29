// ─────────────────────────────────────────────────────────────
// Live customization registries (Master Admin → live site)
// Every editable image slot, text line and theme token on the
// website is declared here with its shipped default. The public
// site renders these defaults immediately (SSR-safe, zero CLS),
// then swaps in Master Admin overrides once /api/site/customization
// responds. Admin panels are generated from the same registries,
// so pages, images and lines stay in sync automatically.
// ─────────────────────────────────────────────────────────────

export type PageKey =
  | "home"
  | "about"
  | "services"
  | "packages"
  | "gallery"
  | "testimonials"
  | "booking"
  | "blog"
  | "faq"
  | "contact"
  | "footer"
  | "brand"
  | "seo";

export const PAGE_LABELS: Record<PageKey, string> = {
  home: "Home",
  about: "About",
  services: "Shows / Services",
  packages: "Packages",
  gallery: "Gallery",
  testimonials: "Reviews",
  booking: "Booking",
  blog: "Journal / Blog",
  faq: "FAQ",
  contact: "Contact",
  footer: "Footer",
  brand: "Brand & Logo",
  seo: "SEO & Analytics",
};

// ── Image slots ────────────────────────────────────────────────

export type ImageSlot = {
  key: string;
  page: PageKey;
  label: string;
  defaultSrc: string;
  defaultAlt: string;
  /** aspect guidance shown in the admin manager */
  hint?: string;
  /** tailwind aspect class matching the default photo's natural ratio,
   *  so the shipped photo always fits its frame without cropping */
  frame?: string;
  /** gallery-only extras */
  cat?: string;
  caption?: string;
};

export const IMAGE_SLOTS: ImageSlot[] = [
  // Brand
  {
    key: "brand.logo.full",
    page: "brand",
    label: "Full logo (hero crest, pre-brand surfaces)",
    defaultSrc: "/images/logo-full-v2.png",
    defaultAlt:
      "Jadugar Rajtilak — official logo: golden JR monogram crowned with rubies above a magician's top hat and wand",
    hint: "Transparent PNG · ~2:1.5",
  },
  {
    key: "brand.logo.emblem",
    page: "brand",
    label: "Emblem badge (navbar, footer, admin)",
    defaultSrc: "/images/logo-emblem-v2.png",
    defaultAlt: "Jadugar Rajtilak golden JR emblem",
    hint: "Square transparent PNG",
  },
  // Home
  {
    key: "home.hero.portrait",
    page: "home",
    label: "Hero — royal portrait (arched frame)",
    defaultSrc: "/images/hero-portrait-v2.jpg",
    defaultAlt:
      "Jadugar Rajtilak — royal portrait of the magician in his navy stage suit, hands raised mid-flourish",
    hint: "Portrait 3:4 · min 800px wide",
  },
  {
    key: "home.story.photo",
    page: "home",
    label: "Home — story section photo",
    defaultSrc: "/images/rajtilak-stage-confetti.webp",
    defaultAlt:
      "Jadugar Rajtilak performing live on stage in his maroon velvet blazer as gold confetti rains down around him",
    hint: "≈Square 1:1 (962×944)",
    frame: "aspect-[962/944]",
  },
  {
    key: "home.reel.poster",
    page: "home",
    label: "Home — reel poster frame",
    defaultSrc: "/images/rajtilak-mic-closeup.webp",
    defaultAlt:
      "Jadugar Rajtilak speaking into the microphone in his black blazer and yellow shirt — poster frame from the official reel",
    hint: "Portrait 2:3",
    frame: "aspect-[2/3]",
  },
  // About
  {
    key: "about.award.photo",
    page: "about",
    label: "About — award / team photo card",
    defaultSrc: "/images/rajtilak-stage-confetti.webp",
    defaultAlt:
      "Jadugar Rajtilak performing live on stage in his maroon velvet blazer as gold confetti rains down around him",
    hint: "≈Square 1:1 (962×944)",
    frame: "aspect-[962/944]",
  },
  {
    key: "about.certificate.photo",
    page: "about",
    label: "About — LG felicitation certificate",
    defaultSrc: "/images/rajtilak-lg-certificate.webp",
    defaultAlt:
      "Jadugar Rajtilak holding his framed felicitation certificate bearing the LG emblem, flanked by his team and organisers on stage",
    hint: "Portrait 3:4",
  },
  // Certificates — the recognition wall on Home + Gallery (the client's
  // two certificate scans: Certificate of Recognition + competition poster)
  {
    key: "certificates.intl",
    page: "home",
    label: "Certificate 1 — Certificate of Recognition (Intl. 2021)",
    defaultSrc: "/images/certificate-intl-2021.webp",
    defaultAlt:
      "Certificate of Recognition — Second Place won by Jadugar Rajtilak of India at the Online International Magic Competition (I.B.M.), March 2021",
    hint: "Portrait 10:13",
    frame: "aspect-[10/13]",
  },
  {
    key: "certificates.competition",
    page: "home",
    label: "Certificate 2 — Competition Poster (Intl. 2021)",
    defaultSrc: "/images/certificate-competition-2021.webp",
    defaultAlt:
      "Official poster of the Online International Magic Competition 2021 — category winners, the international jury and partner magic societies from around the world",
    hint: "Portrait 10:13",
    frame: "aspect-[10/13]",
  },
  // Services (Shows)
  {
    key: "services.wedding.photo",
    page: "services",
    label: "Shows — Wedding Magic photo",
    defaultSrc: "/images/rajtilak-mic-closeup.webp",
    defaultAlt:
      "Jadugar Rajtilak addressing the wedding audience with the microphone, black blazer over his yellow stage shirt",
    hint: "Portrait 2:3",
    frame: "aspect-[2/3]",
  },
  {
    key: "services.corporate.photo",
    page: "services",
    label: "Shows — Corporate photo",
    defaultSrc: "/images/rajtilak-umbrella-act.webp",
    defaultAlt:
      "Jadugar Rajtilak in his shimmering blue suit posing with his black-and-white umbrella stage props against a plain backdrop",
    hint: "Portrait 2:3",
    frame: "aspect-[2/3]",
  },
  {
    key: "services.birthday.photo",
    page: "services",
    label: "Shows — Birthday & Kids photo",
    defaultSrc: "/images/rajtilak-stage-confetti.webp",
    defaultAlt:
      "Jadugar Rajtilak performing on stage in his maroon velvet blazer as confetti rains down — a birthday celebration in full swing",
    hint: "≈Square 1:1",
    frame: "aspect-[962/944]",
  },
  {
    key: "services.college.photo",
    page: "services",
    label: "Shows — College & Stage photo",
    defaultSrc: "/images/svc-college-v2.jpg",
    defaultAlt:
      "Jadugar Rajtilak on a school annual-day stage holding red flower bouquets, banner behind him",
    hint: "Landscape 4:3",
    frame: "aspect-[4/3]",
  },
  {
    key: "services.private.photo",
    page: "services",
    label: "Shows — Private & Luxury photo",
    defaultSrc: "/images/rajtilak-felicitation-hug.webp",
    defaultAlt:
      "Jadugar Rajtilak embracing a fellow performer on stage under green lights — an intimate felicitation evening",
    hint: "≈Portrait 4:5",
    frame: "aspect-[1136/1384]",
  },
  // Gallery (7 frames — every photo uploaded by the client, nothing stock.
  // Frame classes match each photo's natural ratio so nothing is cropped.)
  {
    key: "gallery.item01",
    page: "gallery",
    label: "Gallery frame 1",
    defaultSrc: "/images/rajtilak-stage-confetti.webp",
    defaultAlt:
      "Jadugar Rajtilak performing live on stage in his maroon velvet blazer as gold confetti rains down around him",
    cat: "stage",
    caption: "Confetti night — the stage erupts",
    hint: "≈1:1",
    frame: "aspect-[962/944]",
  },
  {
    key: "gallery.item02",
    page: "gallery",
    label: "Gallery frame 2",
    defaultSrc: "/images/rajtilak-mic-closeup.webp",
    defaultAlt:
      "Close-up of Jadugar Rajtilak speaking into the microphone, black blazer over his yellow shirt",
    cat: "closeup",
    caption: "Holding the room — every word a spell",
    hint: "2:3",
    frame: "aspect-[2/3]",
  },
  {
    key: "gallery.item03",
    page: "gallery",
    label: "Gallery frame 3",
    defaultSrc: "/images/rajtilak-umbrella-act.webp",
    defaultAlt:
      "Jadugar Rajtilak in his shimmering blue suit posing with two black-and-white umbrella stage props",
    cat: "stage",
    caption: "The umbrella act — props with a life of their own",
    hint: "2:3",
    frame: "aspect-[2/3]",
  },
  {
    key: "gallery.item04",
    page: "gallery",
    label: "Gallery frame 4",
    defaultSrc: "/images/rajtilak-felicitation-hug.webp",
    defaultAlt:
      "Jadugar Rajtilak embracing a fellow performer on stage under green lights during a felicitation evening",
    cat: "corporate",
    caption: "Felicitation evening — an embrace from the hosts",
    hint: "≈4:5",
    frame: "aspect-[1136/1384]",
  },
  {
    key: "gallery.item05",
    page: "gallery",
    label: "Gallery frame 5",
    defaultSrc: "/images/rajtilak-lg-certificate.webp",
    defaultAlt:
      "Jadugar Rajtilak holding his framed felicitation certificate bearing the LG emblem, flanked by his team and organisers on stage",
    cat: "corporate",
    caption: "Felicitated by LG — the certificate moment",
    hint: "3:4",
    frame: "aspect-[3/4]",
  },
  {
    key: "gallery.item06",
    page: "gallery",
    label: "Gallery frame 6",
    defaultSrc: "/images/gallery-arvanah.webp",
    defaultAlt:
      "Jadugar Rajtilak on the ARVANAH shopping-destination anniversary stage in his maroon velvet suit, presenting a commemorative album under a world-wonders backdrop",
    cat: "corporate",
    caption: "ARVANAH anniversary night — the mall stage",
    hint: "1:1",
    frame: "aspect-square",
  },
  {
    key: "gallery.item07",
    page: "gallery",
    label: "Gallery frame 7",
    defaultSrc: "/images/gallery-closeup-kids.webp",
    defaultAlt:
      "Jadugar Rajtilak in his black sequin jacket hosting a birthday celebration, surrounded by children and applauding families",
    cat: "birthday",
    caption: "Birthday party — the smallest guests, loudest cheers",
    hint: "≈3:4",
    frame: "aspect-[3/4]",
  },
  // Meta
  {
    key: "meta.og.image",
    page: "brand",
    label: "Social share image (OG / Twitter card)",
    defaultSrc: "/images/hero-portrait-v2.jpg",
    defaultAlt: "Jadugar Rajtilak — royal stage magician",
    hint: "Portrait · used by WhatsApp/Facebook link previews",
  },
];

export const IMAGE_SLOT_MAP: Record<string, ImageSlot> = Object.fromEntries(
  IMAGE_SLOTS.map((s) => [s.key, s])
);

/** Tailwind aspect class that matches the slot's default photo ratio —
 *  views use it so the shipped photo fits its frame without cropping. */
export function imageFrame(key: string): string | undefined {
  return IMAGE_SLOT_MAP[key]?.frame;
}

// ── Text lines ─────────────────────────────────────────────────

export type TextLine = {
  key: string;
  page: PageKey;
  label: string;
  value: string;
  multiline?: boolean;
};

export const TEXT_LINES: TextLine[] = [
  // ── SEO · analytics & verification (Master Admin → Settings) ──
  // GA4 measurement ID is read server-side in layout.tsx (DB override
  // over the shipped default); the GSC token renders as
  // <meta name="google-site-verification"> in raw HTML for Search
  // Console ownership proof.
  {
    key: "seo.ga.measurementId",
    page: "seo",
    label: "Google Analytics 4 — Measurement ID",
    value: "G-103JFH1Z6B",
  },
  {
    key: "seo.gsc.verificationToken",
    page: "seo",
    label: "Google Search Console — verification token (google-site-verification content value)",
    value: "",
  },
  {
    key: "seo.adsense.accountId",
    page: "seo",
    label: "Google AdSense — Publisher ID (google-adsense-account content value)",
    value: "ca-pub-8152770887372804",
  },
  // ── Home · hero ──
  { key: "home.hero.eyebrow", page: "home", label: "Hero eyebrow", value: "The Royal Stage · Udaipur · India" },
  // SEO fix (manager audit T-05, 2026-10-29): the homepage H1 now leads
  // with the India-wide commercial intent — 'magician in udaipur' is
  // owned by the /magician-in-udaipur landing page, so the homepage H1
  // stops cannibalising the local head term. Same length class as the
  // previous line, so the hero layout is unaffected.
  { key: "home.hero.h1a", page: "home", label: "Headline line 1 (keyword H1)", value: "Wedding & Corporate Magician in India" },
  { key: "home.hero.h1b", page: "home", label: "Headline line 2 (gold italic tagline)", value: "— Where Reality Bends." },
  {
    key: "home.hero.sub",
    page: "home",
    label: "Hero paragraph",
    multiline: true,
    value:
      "Cinematic stage magic for weddings, corporate evenings, birthdays and festivals — a royal show your guests will retell for years.",
  },
  { key: "home.hero.ctaPrimary", page: "home", label: "Primary CTA label", value: "Check Date" },
  { key: "home.hero.ctaSecondary", page: "home", label: "Secondary CTA label", value: "Watch the Show" },
  { key: "home.hero.nameplateName", page: "home", label: "Portrait nameplate (name)", value: "जादूगर राजतिलक" },
  { key: "home.hero.nameplateSub", page: "home", label: "Portrait nameplate (subtitle)", value: "Jadugar Rajtilak · Magician" },
  // ── Home · story ──
  { key: "home.story.eyebrow", page: "home", label: "Story eyebrow", value: "The Magician" },
  { key: "home.story.title", page: "home", label: "Story heading", value: "The hand behind the wonder" },
  {
    key: "home.story.p1",
    page: "home",
    label: "Story paragraph 1",
    multiline: true,
    value:
      "Jadugar Rajtilak belongs to the old school of Indian stage magic — satin and spotlights, doves and disappearances — rebuilt with the pacing of modern cinema. Twelve years and more than five hundred shows later, the mission has not changed: make an entire hall stop breathing at the same instant.",
  },
  {
    key: "home.story.p2",
    page: "home",
    label: "Story paragraph 2",
    multiline: true,
    value:
      "Every evening is engineered for its room. A sangeet gets warmth and participation, a corporate annual day gets precision to the run-sheet, a college fest gets scale the back row can feel. What never changes is the refusal to perform anything the cheapest seat cannot see. The craft has also been recognised on stage by LG — a felicitation certificate that now travels with the props.",
  },
  { key: "home.story.cardName", page: "home", label: "Story card name", value: "Jadugar Rajtilak" },
  { key: "home.story.cardRole", page: "home", label: "Story card role", value: "Magician · Udaipur" },
  { key: "home.story.cta", page: "home", label: "Story CTA label", value: "Read the full story" },
  // ── Home · certificates (the recognition wall — the client's two scans) ──
  { key: "home.cert.eyebrow", page: "home", label: "Certificates eyebrow", value: "Recognition Wall" },
  { key: "home.cert.title", page: "home", label: "Certificates heading", value: "Certificates & honours" },
  {
    key: "home.cert.sub",
    page: "home",
    label: "Certificates sub-line",
    multiline: true,
    value:
      "The paper behind the applause — an international Certificate of Recognition and the official competition poster, earned alongside an on-stage felicitation by LG.",
  },
  { key: "home.cert.intlTag", page: "home", label: "Recognition certificate tag", value: "International · March 2021" },
  { key: "home.cert.intlTitle", page: "home", label: "Recognition certificate title", value: "Certificate of Recognition — 2nd Place" },
  {
    key: "home.cert.intlDetail",
    page: "home",
    label: "Recognition certificate detail",
    multiline: true,
    value:
      "Online International Magic Competition (I.B.M.) — second place among 100 performers from 8 countries, signed by an international jury.",
  },
  { key: "home.cert.posterTag", page: "home", label: "Poster certificate tag", value: "I.B.M. · Official Poster" },
  { key: "home.cert.posterTitle", page: "home", label: "Poster certificate title", value: "The competition wall — winners & judges" },
  {
    key: "home.cert.posterDetail",
    page: "home",
    label: "Poster certificate detail",
    multiline: true,
    value:
      "The official 2021 competition poster — category winners, the seven-member international jury and partner magic societies from around the world.",
  },
  // ── Home · signature acts ──
  { key: "home.acts.eyebrow", page: "home", label: "Acts eyebrow", value: "Signature Acts" },
  { key: "home.acts.title", page: "home", label: "Acts heading", value: "Three moments the room does not forget" },
  {
    key: "home.acts.sub",
    page: "home",
    label: "Acts subheading",
    multiline: true,
    value:
      "Every Rajtilak evening is built around set-piece illusions, staged with cinematic light and score — these are the three your guests will describe on Monday.",
  },
  // ── Home · events grid ──
  { key: "home.events.eyebrow", page: "home", label: "Events eyebrow", value: "Shows & Occasions" },
  { key: "home.events.title", page: "home", label: "Events heading", value: "One craft, six stages" },
  {
    key: "home.events.sub",
    page: "home",
    label: "Events subheading",
    multiline: true,
    value:
      "Each occasion gets its own calibrated act — the wedding stage is not the corporate run-sheet, and the birthday finale is not the fest headline.",
  },
  { key: "home.events.cta", page: "home", label: "Event card CTA", value: "Explore the act" },
  // ── Home · reel ──
  { key: "home.reel.eyebrow", page: "home", label: "Reel eyebrow", value: "The Reel" },
  { key: "home.reel.title", page: "home", label: "Reel heading", value: "Thirty seconds of the royal stage" },
  {
    key: "home.reel.sub",
    page: "home",
    label: "Reel subheading",
    multiline: true,
    value:
      "Watch the room change when the curtain parts — laughter, silence, and the eruption that follows. Played from the official Instagram reel.",
  },
  { key: "home.reel.badge", page: "home", label: "Reel poster badge", value: "Official reel · Instagram" },
  { key: "home.reel.note", page: "home", label: "Reel poster note", value: "Live stage footage — plays the official reel" },
  // ── Home · packages teaser ──
  { key: "home.packages.eyebrow", page: "home", label: "Packages teaser eyebrow", value: "Transparent Tiers" },
  { key: "home.packages.title", page: "home", label: "Packages teaser heading", value: "Packages built to be compared" },
  {
    key: "home.packages.sub",
    page: "home",
    label: "Packages teaser subheading",
    multiline: true,
    value:
      "Three honest tiers with stated inclusions — every enquiry receives a written quote with travel and staging stated up front. No hidden line items.",
  },
  { key: "home.packages.cta", page: "home", label: "Packages teaser CTA", value: "Compare all inclusions" },
  { key: "home.packages.featuredBadge", page: "home", label: "Featured tier badge", value: "Most booked" },
  // ── Home · reviews strip ──
  { key: "home.reviews.eyebrow", page: "home", label: "Reviews eyebrow", value: "Word of Mouth" },
  { key: "home.reviews.title", page: "home", label: "Reviews heading", value: "What hosts say after the show" },
  {
    key: "home.reviews.sub",
    page: "home",
    label: "Reviews subheading",
    multiline: true,
    value:
      "Verified review summaries from the live Google and Justdial profiles — rotating on their own, always linked to the source.",
  },
  // ── Home · cities ──
  { key: "home.cities.eyebrow", page: "home", label: "Cities eyebrow", value: "The stage travels" },
  {
    key: "home.cities.note",
    page: "home",
    label: "Cities footnote",
    value: "…plus 35+ more cities across India — travel quoted as actuals, confirmed in writing.",
  },
  // ── Home · FAQ teaser ──
  { key: "home.faq.eyebrow", page: "home", label: "FAQ teaser eyebrow", value: "Before You Ask" },
  { key: "home.faq.title", page: "home", label: "FAQ teaser heading", value: "The questions every host asks" },
  {
    key: "home.faq.sub",
    page: "home",
    label: "FAQ teaser subheading",
    value: "Pricing, travel, tech riders and safety — answered plainly. The full list lives on the FAQ page.",
  },
  { key: "home.faq.cta", page: "home", label: "FAQ teaser CTA", value: "Read all FAQs →" },
  // ── Home · booking strip ──
  { key: "home.cta.eyebrow", page: "home", label: "Booking strip eyebrow", value: "The Curtain Is Waiting" },
  { key: "home.cta.title", page: "home", label: "Booking strip heading", value: "Your date is on the royal calendar" },
  {
    key: "home.cta.sub",
    page: "home",
    label: "Booking strip paragraph",
    multiline: true,
    value:
      "Live availability, a written quote within 24 hours, and a 72-hour soft-hold on your date the moment you enquire.",
  },
  { key: "home.cta.button", page: "home", label: "Booking strip button", value: "Check Date & Enquire" },
  { key: "home.cta.whatsapp", page: "home", label: "Booking strip WhatsApp label", value: "WhatsApp Us" },
  // ── About ──
  { key: "about.hero.eyebrow", page: "about", label: "About eyebrow", value: "About the Magician" },
  { key: "about.hero.title", page: "about", label: "About heading", value: "The hand behind the tilak" },
  {
    key: "about.hero.sub",
    page: "about",
    label: "About subheading",
    value: "The story behind the vermilion mark — craft, milestones and the standard every Rajtilak show answers to.",
  },
  { key: "about.story.title", page: "about", label: "Story heading", value: "The story so far" },
  {
    key: "about.story.p1",
    page: "about",
    label: "About paragraph 1",
    multiline: true,
    value:
      "Jadugar Rajtilak stepped onto a stage for the first time at a school function — and discovered that a room full of strangers falling silent together is the most addictive sound in theatre. What began as card tricks at family gatherings became twelve years of staged performances across more than forty cities.",
  },
  {
    key: "about.story.p2",
    page: "about",
    label: "About paragraph 2",
    multiline: true,
    value:
      "The craft sits at the intersection of sleight-of-hand, stagecraft and audience psychology. Every Rajtilak show is rebuilt for its room: the wedding sangeet needs warmth, the corporate annual day needs precision to a run-sheet, the college fest needs scale. The constant is a refusal to perform anything the back row cannot see or the front row cannot feel.",
  },
  {
    key: "about.story.p3",
    page: "about",
    label: "About paragraph 3",
    multiline: true,
    value:
      "Off stage, the practice is unglamorous and deliberate — rehearsing timings to a metronome, building props by hand, and retiring an effect the moment it stops surprising the performer. That is the standard a Rajtilak audience is paying for.",
  },
  { key: "about.card.name", page: "about", label: "About card name", value: "Jadugar Rajtilak" },
  { key: "about.card.role", page: "about", label: "About card role", value: "Stage Magician · Mentalist · India" },
  { key: "about.certificate.title", page: "about", label: "Certificate card title", value: "Felicitated by LG" },
  {
    key: "about.certificate.detail",
    page: "about",
    label: "Certificate card detail line",
    value: "Certificate of felicitation presented to Jadugar Rajtilak — recognised on stage by LG",
  },
  { key: "about.milestones.title", page: "about", label: "Milestones heading", value: "The road to the royal stage" },
  { key: "about.milestones.eyebrow", page: "about", label: "Milestones eyebrow", value: "Milestones" },
  { key: "about.milestone1", page: "about", label: "Milestone I", value: "The first stage — a school function, a borrowed deck, and a hall that would not stop clapping." },
  { key: "about.milestone2", page: "about", label: "Milestone II", value: "The referral chain — the first corporate annual day that quietly booked the next three." },
  { key: "about.milestone3", page: "about", label: "Milestone III", value: "Wedding seasons — hundreds of sangeets, receptions and cocktail evenings across the country." },
  { key: "about.milestone4", page: "about", label: "Milestone IV", value: "The Grand production — full crew, projection design and the large-format illusion act." },
  { key: "about.philosophy.eyebrow", page: "about", label: "Philosophy eyebrow", value: "Philosophy" },
  { key: "about.philosophy.title", page: "about", label: "Philosophy heading", value: "Three rules the act answers to" },
  { key: "about.philosophy.sub", page: "about", label: "Philosophy subheading", value: "The same principles decide which effects make the set — and which are retired." },
  { key: "about.philosophy1t", page: "about", label: "Philosophy 1 title", value: "The back row is the client" },
  {
    key: "about.philosophy1d",
    page: "about",
    label: "Philosophy 1 text",
    value: "If it cannot read from the last seat, it does not go on the rider. Scale, light and timing are engineered for the cheapest seat in the house.",
  },
  { key: "about.philosophy2t", page: "about", label: "Philosophy 2 title", value: "Never fool, always charm" },
  {
    key: "about.philosophy2d",
    page: "about",
    label: "Philosophy 2 text",
    value: "Astonishment without humiliation. Volunteers leave the stage taller than they arrived — the host is thanked, never trapped.",
  },
  { key: "about.philosophy3t", page: "about", label: "Philosophy 3 title", value: "Rehearse like theatre" },
  {
    key: "about.philosophy3d",
    page: "about",
    label: "Philosophy 3 text",
    value: "Metronome-timed pacing, scored transitions, contingency choreography for prop failure. Magic is a stagecraft discipline first.",
  },
  { key: "about.cta", page: "about", label: "About CTA button", value: "Book a Show" },
  // ── Services (Shows) ──
  { key: "services.hero.eyebrow", page: "services", label: "Shows eyebrow", value: "Shows & Services" },
  { key: "services.hero.title", page: "services", label: "Shows heading (H1)", value: "Wedding, Corporate & Birthday Magic Shows" },
  {
    key: "services.hero.sub",
    page: "services",
    label: "Shows subheading",
    multiline: true,
    value:
      "Every occasion gets a calibrated act — format, pacing and effects chosen for the room. Pick your occasion to see the shape of the evening.",
  },
  { key: "services.wedding.name", page: "services", label: "Wedding — name", value: "Wedding Magic" },
  { key: "services.wedding.tagline", page: "services", label: "Wedding — tagline", value: "Unforgettable moments between the vows and the vows-to-be" },
  {
    key: "services.wedding.description",
    page: "services",
    label: "Wedding — description",
    multiline: true,
    value:
      "Close-up magic during the sangeet and cocktail hours, and a stage act that gives your families one story they will retell for years. Every routine is dressed for the occasion — elegant, warm, and never at the expense of the couple's spotlight.",
  },
  { key: "services.wedding.note", page: "services", label: "Wedding — photo note", value: "Sangeet & reception evenings" },
  { key: "services.corporate.name", page: "services", label: "Corporate — name", value: "Corporate Shows" },
  { key: "services.corporate.tagline", page: "services", label: "Corporate — tagline", value: "The act your annual day will be remembered by" },
  {
    key: "services.corporate.description",
    page: "services",
    label: "Corporate — description",
    multiline: true,
    value:
      "A polished stage show for annual days, award nights and dealer meets — scripted to your brand, timed to the run-sheet, and delivered with GST invoicing and a clean contract. Clean humour that is safe for every hierarchy in the room.",
  },
  { key: "services.corporate.note", page: "services", label: "Corporate — photo note", value: "Annual days & award nights" },
  { key: "services.birthday.name", page: "services", label: "Birthday — name", value: "Birthday & Kids" },
  { key: "services.birthday.tagline", page: "services", label: "Birthday — tagline", value: "Safe, fast, hilarious — built for short attention spans" },
  {
    key: "services.birthday.description",
    page: "services",
    label: "Birthday — description",
    multiline: true,
    value:
      "A high-energy 45-minute show of colour-changing silks, appearing doves of paper, and tricks where the birthday child becomes the hero. Every effect is age-calibrated: no darkness, no flames, no frightening moments — only wide eyes and louder laughter.",
  },
  { key: "services.birthday.note", page: "services", label: "Birthday — photo note", value: "Ages 4–12, age-safe acts" },
  { key: "services.college.name", page: "services", label: "College — name", value: "College & Stage" },
  { key: "services.college.tagline", page: "services", label: "College — tagline", value: "Big energy for big auditoriums" },
  {
    key: "services.college.description",
    page: "services",
    label: "College — description",
    multiline: true,
    value:
      "A large-format illusion and mentalism act engineered for 500–5,000 seat venues and fest-scale energy. Crowd-work segments read the room live, and the pace never drops between acts. Built to trend on the fest reel by Monday morning.",
  },
  { key: "services.college.note", page: "services", label: "College — photo note", value: "Fest & annual-day headline nights" },
  { key: "services.private.name", page: "services", label: "Private — name", value: "Private & Luxury" },
  { key: "services.private.tagline", page: "services", label: "Private — tagline", value: "An evening your drawing room will not forget" },
  {
    key: "services.private.description",
    page: "services",
    label: "Private — description",
    multiline: true,
    value:
      "Salon-grade close-up magic for intimate gatherings of 15–80 guests, where the magic happens inches from the eyes — in guests' own hands, with their own belongings. Discreet, elegant, and tailored for settings where subtlety is the luxury.",
  },
  { key: "services.private.note", page: "services", label: "Private — photo note", value: "Salon-format evenings" },
  { key: "services.virtual.name", page: "services", label: "Virtual — name", value: "Online / Virtual" },
  { key: "services.virtual.tagline", page: "services", label: "Virtual — tagline", value: "A camera-ready show for remote teams" },
  {
    key: "services.virtual.description",
    page: "services",
    label: "Virtual — description",
    multiline: true,
    value:
      "An interactive show designed for the webcam frame — mind-reading that works through screens, predictions built from the chat window, and moments where remote attendees influence the outcome live. Ideal for distributed teams and hybrid events.",
  },
  {
    key: "services.cityNote",
    page: "services",
    label: "City landing note",
    multiline: true,
    value:
      "Home-city shows include travel; everywhere else in India is quoted as actuals and confirmed in writing before booking. City pages launch with real local proof — venues performed and photographs from that city.",
  },
  { key: "services.cta", page: "services", label: "Services CTA button", value: "Check Your Date" },
  // ── Packages ──
  { key: "packages.hero.eyebrow", page: "packages", label: "Packages eyebrow", value: "Transparent Tiers" },
  { key: "packages.hero.title", page: "packages", label: "Packages heading", value: "Choose the shape of your evening" },
  {
    key: "packages.hero.sub",
    page: "packages",
    label: "Packages subheading",
    multiline: true,
    value:
      "Three tiers with stated inclusions. Pricing is shared as a written quote after your enquiry — travel and staging are never hidden line items.",
  },
  { key: "packages.signature.name", page: "packages", label: "Signature tier — name", value: "Signature" },
  { key: "packages.signature.range", page: "packages", label: "Signature tier — price line", value: "From ₹25,000" },
  {
    key: "packages.signature.blurb",
    page: "packages",
    label: "Signature tier — blurb",
    value: "The essential Rajtilak evening for intimate gatherings.",
  },
  { key: "packages.signature.bestFor", page: "packages", label: "Signature tier — best for", value: "Birthdays & society events" },
  {
    key: "packages.signature.inclusions",
    page: "packages",
    label: "Signature tier — inclusions (one per line)",
    multiline: true,
    value:
      "30–40 min stage magic show\nSound system & stage lights\n2 crowd-participation routines\nTravel within your city included",
  },
  { key: "packages.royal.name", page: "packages", label: "Royal tier — name", value: "Royal" },
  { key: "packages.royal.range", page: "packages", label: "Royal tier — price line", value: "From ₹75,000" },
  {
    key: "packages.royal.blurb",
    page: "packages",
    label: "Royal tier — blurb",
    value: "Our most-booked tier — a full evening engineered to be remembered.",
  },
  { key: "packages.royal.bestFor", page: "packages", label: "Royal tier — best for", value: "Weddings & corporate annual days" },
  {
    key: "packages.royal.inclusions",
    page: "packages",
    label: "Royal tier — inclusions (one per line)",
    multiline: true,
    value:
      "60 min headline stage show\n90 min roaming close-up magic\nCustom routine woven to your occasion\nProfessional light & sound rider\nDedicated coordinator on call",
  },
  { key: "packages.grand.name", page: "packages", label: "Grand tier — name", value: "Grand" },
  { key: "packages.grand.range", page: "packages", label: "Grand tier — price line", value: "From ₹1,50,000" },
  {
    key: "packages.grand.blurb",
    page: "packages",
    label: "Grand tier — blurb",
    value: "The full cinematic production for stages that demand spectacle.",
  },
  { key: "packages.grand.bestFor", page: "packages", label: "Grand tier — best for", value: "College fests & luxury events" },
  {
    key: "packages.grand.inclusions",
    page: "packages",
    label: "Grand tier — inclusions (one per line)",
    multiline: true,
    value:
      "90 min large-format illusion act\nPre-show salon close-up hour\nIllusionist assistant & stage crew\nFull production rider & rehearsal\nCinematic intro projection design",
  },
  {
    key: "packages.note",
    page: "packages",
    label: "Packages footnote",
    value:
      "Exact pricing travels with the written quote — city, duration, guest count and staging are stated up front, with no hidden line items.",
  },
  { key: "packages.helpTitle", page: "packages", label: "Help block heading", value: "Not sure which tier fits your evening?" },
  {
    key: "packages.helpSub",
    page: "packages",
    label: "Help block text",
    multiline: true,
    value:
      "Tell us the occasion, city and guest count — the recommendation and the exact price come back in the same written quote, with the reasoning stated.",
  },
  { key: "packages.helpCta", page: "packages", label: "Help block button", value: "Ask for a Recommendation" },
  // ── Gallery ──
  { key: "gallery.hero.eyebrow", page: "gallery", label: "Gallery eyebrow", value: "Gallery & Films" },
  { key: "gallery.hero.title", page: "gallery", label: "Gallery heading", value: "The evening, in stills" },
  {
    key: "gallery.hero.sub",
    page: "gallery",
    label: "Gallery subheading",
    multiline: true,
    value:
      "A living wall of frames from real shows — every photograph verified as Jadugar Rajtilak himself on stage. Tap any frame to view it large.",
  },
  // Gallery captions (one per frame — the client's own photographs)
  { key: "gallery.item01.caption", page: "gallery", label: "Gallery frame 1 caption", value: "Confetti night — the stage erupts" },
  { key: "gallery.item02.caption", page: "gallery", label: "Gallery frame 2 caption", value: "Holding the room — every word a spell" },
  { key: "gallery.item03.caption", page: "gallery", label: "Gallery frame 3 caption", value: "The umbrella act — props with a life of their own" },
  { key: "gallery.item04.caption", page: "gallery", label: "Gallery frame 4 caption", value: "Felicitation evening — an embrace from the hosts" },
  { key: "gallery.item05.caption", page: "gallery", label: "Gallery frame 5 caption", value: "Felicitated by LG — the certificate moment" },
  { key: "gallery.item06.caption", page: "gallery", label: "Gallery frame 6 caption", value: "ARVANAH anniversary night — the mall stage" },
  { key: "gallery.item07.caption", page: "gallery", label: "Gallery frame 7 caption", value: "Birthday party — the smallest guests, loudest cheers" },
  // ── Reviews page ──
  { key: "reviews.hero.eyebrow", page: "testimonials", label: "Reviews eyebrow", value: "Reviews" },
  { key: "reviews.hero.title", page: "testimonials", label: "Reviews heading", value: "What hosts say, in their words" },
  {
    key: "reviews.hero.sub",
    page: "testimonials",
    label: "Reviews subheading",
    multiline: true,
    value:
      "Verified review summaries from the live Google (4.8★ · 181 reviews) and Justdial (4.8★ · 195 ratings) profiles — rotating on their own, always linked to the source.",
  },
  {
    key: "reviews.note",
    page: "testimonials",
    label: "Reviews note block",
    multiline: true,
    value:
      "Every review on those platforms comes from a real booked show — reviews are requested from clients only, never bought or invented. Click any card above to read them in full on the platform itself.",
  },
  // ── FAQ page ──
  { key: "faq.hero.eyebrow", page: "faq", label: "FAQ eyebrow", value: "Frequently Asked" },
  { key: "faq.hero.title", page: "faq", label: "FAQ heading", value: "Everything hosts ask before booking" },
  {
    key: "faq.hero.sub",
    page: "faq",
    label: "FAQ subheading",
    value:
      "Pricing, travel, technical riders, safety and cancellation — answered plainly. Anything else, the studio replies within a working day.",
  },
  { key: "faq.q1", page: "faq", label: "FAQ question 1", value: "How much does a show cost?" },
  {
    key: "faq.a1",
    page: "faq",
    label: "FAQ answer 1",
    multiline: true,
    value:
      "Pricing is shared as a written quote after your enquiry — it depends on city, duration, guest count and staging, and every quote states travel and technical requirements up front with no hidden line items. Share your date and occasion to receive the exact figure in writing.",
  },
  { key: "faq.q2", page: "faq", label: "FAQ question 2", value: "Do you travel to other cities?" },
  {
    key: "faq.a2",
    page: "faq",
    label: "FAQ answer 2",
    multiline: true,
    value:
      "Yes. Travel within Udaipur and across Rajasthan is included in most tiers; outside travel is quoted as actuals (fare + stay) and confirmed in writing before booking. Availability can be checked live on the booking calendar before you enquire.",
  },
  { key: "faq.q3", page: "faq", label: "FAQ question 3", value: "What technical setup do you need?" },
  {
    key: "faq.a3",
    page: "faq",
    label: "FAQ answer 3",
    multiline: true,
    value:
      "A stage area of roughly 12×10 ft, a basic sound system with two microphones, and general stage lighting. The Royal and Grand tiers include a full technical rider, and the team coordinates directly with your venue or DJ.",
  },
  { key: "faq.q4", page: "faq", label: "FAQ question 4", value: "Is the show safe for children?" },
  {
    key: "faq.a4",
    page: "faq",
    label: "FAQ answer 4",
    multiline: true,
    value:
      "The birthday tier is age-calibrated: no fire, no darkness, no frightening content. Effects are colour-forward and participatory, and the birthday child stars in the finale. Parents are welcome to film the entire act.",
  },
  { key: "faq.q5", page: "faq", label: "FAQ question 5", value: "What is your cancellation policy?" },
  {
    key: "faq.a5",
    page: "faq",
    label: "FAQ answer 5",
    multiline: true,
    value:
      "Cancellations 30+ days before the show receive a full refund of any advance; within 30 days, the advance is adjusted against a rescheduled date within 12 months. Full terms are on the Legal page and confirmed in the booking contract.",
  },
  { key: "faq.q6", page: "faq", label: "FAQ question 6", value: "How far ahead should we book?" },
  {
    key: "faq.a6",
    page: "faq",
    label: "FAQ answer 6",
    multiline: true,
    value:
      "Peak wedding and festive season dates typically close 6–8 weeks ahead. The booking calendar shows live availability, and an enquiry reserves a soft-hold on your date for 72 hours while the quote is prepared.",
  },
  { key: "faq.q7", page: "faq", label: "FAQ question 7", value: "How does a booking actually come together, step by step?" },
  {
    key: "faq.a7",
    page: "faq",
    label: "FAQ answer 7",
    multiline: true,
    value:
      "Every booking follows the same four steps: check your date on the live calendar, enquire with your occasion details, receive a written quote (with a 72-hour soft-hold on your evening while you decide), then confirm with an advance and a clear contract. Between confirmation and showtime the team coordinates directly with your venue, DJ or planner so nothing is left to the day itself.",
  },
  { key: "faq.q8", page: "faq", label: "FAQ question 8", value: "Can the act be customised to our occasion?" },
  {
    key: "faq.a8",
    page: "faq",
    label: "FAQ answer 8",
    multiline: true,
    value:
      "Yes — customisation is built into the craft, not an add-on. Wedding routines are woven around the couple's story, corporate acts are scripted to the brand and the run-sheet, and the birthday child always stars in the finale. The private tier even begins with a planning call to curate the set-list for your guest list. Share the occasion when you enquire and the routine is dressed for it.",
  },
  { key: "faq.q9", page: "faq", label: "FAQ question 9", value: "Can our guests film and photograph the show?" },
  {
    key: "faq.a9",
    page: "faq",
    label: "FAQ answer 9",
    multiline: true,
    value:
      "Yes — families and guests are welcome to film. The birthday tier explicitly invites parents to film the entire act, and many of the most-shared frames in the gallery were taken by guests at their tables. If your event has an official photographer or videographer, the team coordinates the angles in advance so staged lighting and camera flashes work together instead of against each other.",
  },
  { key: "faq.cta", page: "faq", label: "FAQ CTA button", value: "Still curious? Contact the studio" },
  // ── Contact ──
  { key: "contact.hero.eyebrow", page: "contact", label: "Contact eyebrow", value: "Contact" },
  { key: "contact.hero.title", page: "contact", label: "Contact heading", value: "Knock on the stage door" },
  {
    key: "contact.hero.sub",
    page: "contact",
    label: "Contact subheading",
    value:
      "Call, WhatsApp, or write — whichever suits your planning style. Serious enquiries get a written reply within one working day.",
  },
  { key: "contact.channelCallLabel", page: "contact", label: "Channel — call label", value: "Call the magician" },
  { key: "contact.channelCallNote", page: "contact", label: "Channel — call note", value: "Mon–Sat, 10:00–19:00 IST" },
  { key: "contact.channelWhatsAppLabel", page: "contact", label: "Channel — WhatsApp label", value: "WhatsApp click-to-chat" },
  { key: "contact.channelWhatsAppNote", page: "contact", label: "Channel — WhatsApp note", value: "Fastest for date checks" },
  { key: "contact.channelEmailLabel", page: "contact", label: "Channel — email label", value: "Email" },
  { key: "contact.channelEmailNote", page: "contact", label: "Channel — email note", value: "Quotes & contracts in writing" },
  { key: "contact.channelStudioLabel", page: "contact", label: "Channel — studio label", value: "Studio" },
  { key: "contact.channelStudioNote", page: "contact", label: "Channel — studio note", value: "Visits by appointment · touring pan-India" },
  // ── Blog ──
  { key: "blog.hero.eyebrow", page: "blog", label: "Blog eyebrow", value: "The Blog" },
  { key: "blog.hero.title", page: "blog", label: "Blog heading (H1)", value: "Magician Booking Guides & Event Ideas" },
  {
    key: "blog.hero.sub",
    page: "blog",
    label: "Blog subheading",
    value:
      "Guides for hosts: what magic costs, how to book it, and how to make an evening memorable. Published 2–4 times a month, updated twice a year.",
  },
  { key: "blog.post1.title", page: "blog", label: "Post 1 title", value: "9 Ways a Magician Elevates a Wedding Evening (Beyond the Stage Show)" },
  {
    key: "blog.post1.excerpt",
    page: "blog",
    label: "Post 1 excerpt",
    multiline: true,
    value:
      "From sangeet table-side sets to a reception finale — where live magic fits into a wedding timeline, and how to brief your magician so it lands.",
  },
  { key: "blog.post2.title", page: "blog", label: "Post 2 title", value: "How to Choose a Magician for Your Event: A 10-Point Checklist" },
  {
    key: "blog.post2.excerpt",
    page: "blog",
    label: "Post 2 excerpt",
    multiline: true,
    value:
      "Videos, contracts, technical riders and the questions that separate a professional act from a hobbyist with a deck of cards.",
  },
  { key: "blog.post3.title", page: "blog", label: "Post 3 title", value: "How Much Does a Magic Show Cost? An Honest Breakdown" },
  {
    key: "blog.post3.excerpt",
    page: "blog",
    label: "Post 3 excerpt",
    multiline: true,
    value:
      "What actually drives pricing — duration, travel, crew and staging — and why the cheapest quote usually costs the most.",
  },
  { key: "blog.post4.title", page: "blog", label: "Post 4 title", value: "Corporate Event Entertainment That Is Not a Piano Playlist" },
  {
    key: "blog.post4.excerpt",
    page: "blog",
    label: "Post 4 excerpt",
    multiline: true,
    value:
      "Why interactive entertainment outperforms passive acts at annual days, and how to align a magic act with your brand message.",
  },
  { key: "blog.post5.title", page: "blog", label: "Post 5 title", value: "The Birthday Party Run-Sheet: Where the Magic Slot Actually Goes" },
  {
    key: "blog.post5.excerpt",
    page: "blog",
    label: "Post 5 excerpt",
    multiline: true,
    value:
      "Cake time, meltdown time and the twenty minutes that decide the party — a parent's timeline for booking a children's magician.",
  },
  { key: "blog.post6.title", page: "blog", label: "Post 6 title", value: "Fest Night Architecture: Scheduling a Magic Headliner That Trends" },
  {
    key: "blog.post6.excerpt",
    page: "blog",
    label: "Post 6 excerpt",
    multiline: true,
    value:
      "Big auditoriums eat small acts. A programmer's guide to staging illusions for 500–5,000 seats — and the finale moment built for the Monday-morning reel.",
  },
  // ── Footer ──
  { key: "footer.tagline", page: "footer", label: "Footer tagline", multiline: true, value: "A royal stage where reality bends. Premium magic shows for weddings, corporate evenings, birthdays and festivals — based in Udaipur, touring across India." },
  { key: "footer.exploreLabel", page: "footer", label: "Footer explore column label", value: "Explore" },
  { key: "footer.showsLabel", page: "footer", label: "Footer shows column label", value: "Shows" },
  { key: "footer.contactLabel", page: "footer", label: "Footer contact column label", value: "Contact" },
  { key: "footer.copyright", page: "footer", label: "Footer copyright", value: "© 2026 Jadugar Rajtilak. All rights reserved." },
  { key: "footer.bookCta", page: "footer", label: "Footer book button", value: "Book a Show" },
  // ── Nav labels ──
  { key: "nav.label.home", page: "home", label: "Nav label — Home", value: "Home" },
  { key: "nav.label.about", page: "about", label: "Nav label — About", value: "About" },
  { key: "nav.label.services", page: "services", label: "Nav label — Shows", value: "Shows" },
  { key: "nav.label.packages", page: "packages", label: "Nav label — Packages", value: "Packages" },
  { key: "nav.label.gallery", page: "gallery", label: "Nav label — Gallery", value: "Gallery" },
  { key: "nav.label.testimonials", page: "testimonials", label: "Nav label — Reviews", value: "Reviews" },
  { key: "nav.label.blog", page: "blog", label: "Nav label — Blog", value: "Blog" },
  { key: "nav.label.faq", page: "faq", label: "Nav label — FAQ", value: "FAQ" },
  { key: "nav.label.contact", page: "contact", label: "Nav label — Contact", value: "Contact" },
  { key: "nav.brandFirst", page: "brand", label: "Brand name — first word", value: "Jadugar" },
  { key: "nav.brandLast", page: "brand", label: "Brand name — second word", value: "Rajtilak" },
];

export const TEXT_LINE_MAP: Record<string, TextLine> = Object.fromEntries(
  TEXT_LINES.map((l) => [l.key, l])
);

// ── Theme tokens ───────────────────────────────────────────────

export type ThemeToken = {
  key: string;
  varName: string;
  label: string;
  group: "accents" | "stage" | "light";
  defaultValue: string;
};

export const THEME_TOKENS: ThemeToken[] = [
  { key: "gold", varName: "--jr-gold", label: "Champagne Gold", group: "accents", defaultValue: "#b8923a" },
  { key: "goldLight", varName: "--jr-gold-light", label: "Light Gold", group: "accents", defaultValue: "#e6c477" },
  { key: "goldSoft", varName: "--jr-gold-soft", label: "Soft Gold (nav highlight)", group: "accents", defaultValue: "#d9b666" },
  { key: "goldDark", varName: "--jr-gold-dark", label: "Deep Gold", group: "accents", defaultValue: "#8f6d27" },
  { key: "crimson", varName: "--jr-crimson", label: "Vermilion (primary CTA)", group: "accents", defaultValue: "#b3263e" },
  { key: "crimsonHover", varName: "--jr-crimson-hover", label: "CTA hover", group: "accents", defaultValue: "#c2314c" },
  { key: "teal", varName: "--jr-teal", label: "Mist Teal (success)", group: "accents", defaultValue: "#3e8e8a" },
  { key: "plum", varName: "--jr-plum", label: "Midnight Plum (dark bg / headings)", group: "stage", defaultValue: "#2a1b3d" },
  { key: "plumMid", varName: "--jr-plum-mid", label: "Plum mid (panel)", group: "stage", defaultValue: "#35224d" },
  { key: "plumDeep", varName: "--jr-plum-deep", label: "Plum deep (darkest bg)", group: "stage", defaultValue: "#150c20" },
  { key: "ivory", varName: "--jr-ivory", label: "Pearl Ivory (page background)", group: "light", defaultValue: "#faf6ee" },
  { key: "card", varName: "--jr-card", label: "Card surface", group: "light", defaultValue: "#fffdf7" },
  { key: "sand", varName: "--jr-sand", label: "Soft Sand (band background)", group: "light", defaultValue: "#efe8da" },
  { key: "sandLight", varName: "--jr-sand-light", label: "Champagne wash (hovers)", group: "light", defaultValue: "#f3ead3" },
  { key: "cream", varName: "--jr-cream", label: "Cream (text on dark)", group: "light", defaultValue: "#f3e7c8" },
  { key: "lavender", varName: "--jr-lavender", label: "Lavender (body text on dark)", group: "light", defaultValue: "#e7def0" },
  { key: "ink", varName: "--jr-ink", label: "Dusk Grey (body text on light)", group: "light", defaultValue: "#5b5266" },
  { key: "line", varName: "--jr-line", label: "Border line", group: "light", defaultValue: "#e3d9c6" },
];

export const THEME_DEFAULTS: Record<string, string> = Object.fromEntries(
  THEME_TOKENS.map((t) => [t.key, t.defaultValue])
);

export const THEME_TOKEN_MAP: Record<string, ThemeToken> = Object.fromEntries(
  THEME_TOKENS.map((t) => [t.key, t])
);

// Theme presets for the admin Theme Manager.
export type ThemePreset = { id: string; name: string; note: string; colors: Record<string, string> };

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "royal-gold",
    name: "Royal Gold (current)",
    note: "The shipped signature palette",
    colors: THEME_DEFAULTS,
  },
  {
    id: "emerald-royal",
    name: "Emerald Royal",
    note: "Emerald accent with deep green stage",
    colors: {
      ...THEME_DEFAULTS,
      gold: "#2f7d5a",
      goldLight: "#5aa885",
      goldSoft: "#4b9673",
      goldDark: "#1f5640",
      crimson: "#a33245",
      crimsonHover: "#b53d52",
      plum: "#14261f",
      plumMid: "#1d3529",
      plumDeep: "#0b1712",
    },
  },
  {
    id: "sapphire-night",
    name: "Sapphire Night",
    note: "Sapphire blues with silver accents",
    colors: {
      ...THEME_DEFAULTS,
      gold: "#7a8fb5",
      goldLight: "#aebfd9",
      goldSoft: "#93a6c7",
      goldDark: "#55668a",
      crimson: "#9b2f4f",
      crimsonHover: "#ad3a5d",
      plum: "#131d33",
      plumMid: "#1c2947",
      plumDeep: "#0a1120",
    },
  },
  {
    id: "ruby-theatre",
    name: "Ruby Theatre",
    note: "Warm ruby and burgundy velvet",
    colors: {
      ...THEME_DEFAULTS,
      gold: "#b8743a",
      goldLight: "#d9a06b",
      goldSoft: "#c98a52",
      goldDark: "#8c5227",
      crimson: "#8e1f34",
      crimsonHover: "#a12740",
      plum: "#2b1520",
      plumMid: "#3d1f2e",
      plumDeep: "#170a11",
    },
  },
  {
    id: "moonlight-silver",
    name: "Moonlight Silver",
    note: "Cool platinum with midnight ink",
    colors: {
      ...THEME_DEFAULTS,
      gold: "#8f97a3",
      goldLight: "#bfc6cf",
      goldSoft: "#a6adb7",
      goldDark: "#6a7280",
      crimson: "#7d2a3d",
      crimsonHover: "#903247",
      plum: "#191d24",
      plumMid: "#252a33",
      plumDeep: "#0e1115",
    },
  },
];

// ── Shared payload types ───────────────────────────────────────

export type SiteCustomizationPayload = {
  ok: true;
  rev: number;
  assets: Record<string, { src: string; alt: string }>;
  texts: Record<string, string>;
  theme: Record<string, string>;
};

export function defaultPayload(): SiteCustomizationPayload {
  return {
    ok: true,
    rev: 0,
    assets: Object.fromEntries(
      IMAGE_SLOTS.map((s) => [s.key, { src: s.defaultSrc, alt: s.defaultAlt }])
    ),
    texts: Object.fromEntries(TEXT_LINES.map((l) => [l.key, l.value])),
    theme: { ...THEME_DEFAULTS },
  };
}
