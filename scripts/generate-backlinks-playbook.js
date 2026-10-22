// ── Off-Page SEO & Backlinks Growth Playbook — jadugarrajtilak.com ──
// English business report · R1 cover recipe · TOC · Formal profile A.
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, PageNumber, PageBreak,
  BorderStyle, WidthType, ShadingType, TableLayoutType, SectionType,
  TableOfContents, VerticalAlign,
} = require("docx");
const fs = require("fs");

// Palette — consulting/report mood (Terracotta-leaning, matches brand gold)
const P = {
  primary: "#241E1A", body: "#000000", secondary: "#68605A",
  accent: "#B08050", surface: "#FDFBF9", bg: "241E1A",
  titleColor: "F5EFE6", subtitleColor: "D9CFBE", metaColor: "CFC5B2", footerColor: "A99C86",
};
const c = (h) => h.replace("#", "");

// ── helpers ──────────────────────────────────────────────────
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 160 },
    children: [new TextRun({ text, bold: true, size: 32, color: c(P.primary), font: { ascii: "Times New Roman", eastAsia: "SimHei" } })],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 120 },
    children: [new TextRun({ text, bold: true, size: 28, color: c(P.primary), font: { ascii: "Times New Roman", eastAsia: "SimHei" } })],
  });
}
function body(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 120 },
    ...(opts.indent === false ? {} : { indent: { firstLine: 480 } }),
    children: [new TextRun({ text, size: 24, color: c(P.body), font: { ascii: "Times New Roman", eastAsia: "SimSun" } })],
  });
}
function bullet(text) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { line: 312, after: 80 },
    indent: { left: 480, hanging: 260 },
    children: [
      new TextRun({ text: "\u2022  ", size: 24, color: c(P.accent), bold: true, font: { ascii: "Times New Roman" } }),
      new TextRun({ text, size: 24, color: c(P.body), font: { ascii: "Times New Roman" } }),
    ],
  });
}
function num(n, text) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { line: 312, after: 80 },
    indent: { left: 480, hanging: 300 },
    children: [
      new TextRun({ text: `${n}. `, size: 24, bold: true, color: c(P.accent), font: { ascii: "Times New Roman" } }),
      new TextRun({ text, size: 24, color: c(P.body), font: { ascii: "Times New Roman" } }),
    ],
  });
}

// Table cell helpers
const cellMargins = { top: 60, bottom: 60, left: 120, right: 120 };
function thCell(text, width) {
  return new TableCell({
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    shading: { type: ShadingType.CLEAR, fill: c(P.primary) },
    margins: cellMargins,
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { line: 280 },
      children: [new TextRun({ text, bold: true, size: 20, color: "FFFFFF", font: { ascii: "Times New Roman" } })],
    })],
  });
}
function tdCell(text, fill, opts = {}) {
  return new TableCell({
    shading: { type: ShadingType.CLEAR, fill: fill ?? "FFFFFF" },
    margins: cellMargins,
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { line: 280 },
      children: [new TextRun({ text, size: 20, bold: !!opts.bold, color: opts.color ? c(opts.color) : c(P.body), font: { ascii: "Times New Roman" } })],
    })],
  });
}
function makeTable(headers, rows, widths) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: c(P.accent) },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: c(P.accent) },
      left: { style: BorderStyle.SINGLE, size: 2, color: "E5DDD0" },
      right: { style: BorderStyle.SINGLE, size: 2, color: "E5DDD0" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "E5DDD0" },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "E5DDD0" },
    },
    rows: [
      new TableRow({
        tableHeader: true, cantSplit: true,
        children: headers.map((t, i) => thCell(t, widths?.[i])),
      }),
      ...rows.map((r, ri) => new TableRow({
        cantSplit: true,
        children: r.map((t, ci) => tdCell(String(t), ri % 2 === 0 ? c(P.surface) : "FFFFFF", ci === 0 ? { bold: true } : {})),
      })),
    ],
  });
}

// ── Cover (Recipe R1 — validated) ────────────────────────────
function calcTitleLayout(title, maxWidthTwips, preferredPt = 40, minPt = 24) {
  const charWidth = (pt) => pt * 20;
  const charsPerLine = (pt) => Math.floor(maxWidthTwips / charWidth(pt));
  const breakAfter = new Set([..." \t-_/", ..."\uFF0C\u3002\u3001\uFF1B\uFF1A\uFF01\uFF1F"]);
  function splitTitleLines(t, cpl) {
    if (t.length <= cpl) return [t];
    const lines = [];
    let remaining = t;
    while (remaining.length > cpl) {
      let breakAt = -1;
      for (let i = cpl; i >= Math.floor(cpl * 0.6); i--) {
        if (i < remaining.length && breakAfter.has(remaining[i - 1])) { breakAt = i; break; }
      }
      if (breakAt === -1) {
        const limit = Math.min(remaining.length, Math.ceil(cpl * 1.3));
        for (let i = cpl + 1; i < limit; i++) {
          if (breakAfter.has(remaining[i - 1])) { breakAt = i; break; }
        }
      }
      if (breakAt === -1) breakAt = cpl;
      lines.push(remaining.slice(0, breakAt).trim());
      remaining = remaining.slice(breakAt).trim();
    }
    if (remaining) lines.push(remaining);
    if (lines.length > 1 && lines[lines.length - 1].length <= 2) {
      const last = lines.pop();
      lines[lines.length - 1] += " " + last;
    }
    return lines;
  }
  let titlePt = preferredPt, lines;
  while (titlePt >= minPt) {
    const cpl = charsPerLine(titlePt);
    if (cpl < 2) { titlePt -= 2; continue; }
    lines = splitTitleLines(title, cpl);
    if (lines.length <= 3) break;
    titlePt -= 2;
  }
  if (!lines || lines.length > 3) {
    lines = splitTitleLines(title, charsPerLine(minPt));
    titlePt = minPt;
  }
  return { titlePt, titleLines: lines };
}
function calcCoverSpacing(params) {
  const { titleLineCount = 1, titlePt = 36, hasSubtitle = false, hasEnglishLabel = false,
    metaLineCount = 0, fixedHeight = 800, pageHeight = 16838, marginTop = 0, marginBottom = 0 } = params;
  const SAFETY = 1200;
  const usableHeight = pageHeight - marginTop - marginBottom - SAFETY;
  const titleHeight = titleLineCount * (titlePt * 23 + 200);
  const subtitleHeight = hasSubtitle ? (12 * 23 + 600) : 0;
  const englishLabelHeight = hasEnglishLabel ? (9 * 23 + 600) : 0;
  const metaHeight = metaLineCount * (10 * 23 + 100);
  const implicitParaHeight = 3 * 300;
  const contentHeight = titleHeight + subtitleHeight + englishLabelHeight + metaHeight + fixedHeight + implicitParaHeight;
  const remainingSpace = usableHeight - contentHeight;
  const safeRemaining = Math.max(remainingSpace, 400);
  const FOOTER_MIN = 800;
  const rawTop = Math.floor(safeRemaining * 0.45);
  const rawBottom = Math.floor(safeRemaining * 0.45);
  const bottomSpacing = Math.max(rawBottom, FOOTER_MIN);
  const topSpacing = Math.max(rawTop - Math.max(0, FOOTER_MIN - rawBottom), 400);
  const midSpacing = Math.max(safeRemaining - topSpacing - bottomSpacing, 0);
  return { topSpacing, midSpacing, bottomSpacing };
}

const noBorders = {
  top: { style: BorderStyle.NONE, size: 0, color: "auto" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
  left: { style: BorderStyle.NONE, size: 0, color: "auto" },
  right: { style: BorderStyle.NONE, size: 0, color: "auto" },
};
const allNoBorders = { ...noBorders, insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" }, insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" } };

function buildCoverR1(config) {
  const C = config.palette;
  const padL = 1200, padR = 800;
  const availableWidth = 11906 - padL - padR - 300;
  const { titlePt, titleLines } = calcTitleLayout(config.title, availableWidth, 40, 24);
  const titleSize = titlePt * 2;
  const spacing = calcCoverSpacing({
    titleLineCount: titleLines.length, titlePt,
    hasSubtitle: !!config.subtitle, hasEnglishLabel: !!config.englishLabel,
    metaLineCount: (config.metaLines || []).length, fixedHeight: 400,
  });
  const accentLeft = { style: BorderStyle.SINGLE, size: 8, color: c(C.accent), space: 12 };
  const children = [];
  children.push(new Paragraph({ spacing: { before: spacing.topSpacing } }));
  if (config.englishLabel) {
    children.push(new Paragraph({
      indent: { left: padL, right: padR }, spacing: { after: 500 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: c(C.accent), space: 8 } },
      children: [new TextRun({ text: config.englishLabel.split("").join("  "), size: 18, color: c(C.accent), font: { ascii: "Calibri", eastAsia: "SimHei" }, characterSpacing: 40 })],
    }));
  }
  for (let i = 0; i < titleLines.length; i++) {
    children.push(new Paragraph({
      indent: { left: padL },
      spacing: { after: i < titleLines.length - 1 ? 100 : 300, line: Math.ceil(titlePt * 23), lineRule: "atLeast" },
      children: [new TextRun({ text: titleLines[i], size: titleSize, bold: true, color: c(C.titleColor), font: { eastAsia: "SimHei", ascii: "Arial" } })],
    }));
  }
  if (config.subtitle) {
    children.push(new Paragraph({
      indent: { left: padL }, spacing: { after: 800 },
      children: [new TextRun({ text: config.subtitle, size: 24, color: c(C.subtitleColor), font: { eastAsia: "Microsoft YaHei", ascii: "Arial" } })],
    }));
  }
  for (const line of (config.metaLines || [])) {
    children.push(new Paragraph({
      indent: { left: padL + 200 }, spacing: { after: 80 },
      border: { left: accentLeft },
      children: [new TextRun({ text: line, size: 24, color: c(C.metaColor), font: { eastAsia: "Microsoft YaHei", ascii: "Arial" } })],
    }));
  }
  children.push(new Paragraph({ spacing: { before: spacing.bottomSpacing } }));
  children.push(new Paragraph({
    indent: { left: padL, right: padR },
    border: { top: { style: BorderStyle.SINGLE, size: 2, color: c(C.accent), space: 8 } },
    spacing: { before: 200 },
    children: [
      new TextRun({ text: config.footerLeft || "", size: 16, color: c(C.footerColor), font: { ascii: "Arial" } }),
      new TextRun({ text: "                                        " }),
      new TextRun({ text: config.footerRight || "", size: 16, color: c(C.footerColor), font: { ascii: "Arial" } }),
    ],
  }));
  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: 16838, rule: "exact" },
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: c(C.bg) }, borders: noBorders,
        children,
      })],
    })],
  })];
}

// ── Body content ─────────────────────────────────────────────
const bodyChildren = [];

// TOC page
bodyChildren.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 480, after: 360 },
  children: [new TextRun({ text: "Table of Contents", bold: true, size: 32, font: { ascii: "Times New Roman", eastAsia: "SimHei" }, color: c(P.primary) })],
}));
bodyChildren.push(new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-2" }));
bodyChildren.push(new Paragraph({
  spacing: { before: 200 },
  children: [new TextRun({
    text: "Note: This Table of Contents is generated via field codes. To ensure page number accuracy after editing, please right-click the TOC and select \"Update Field.\"",
    italics: true, size: 18, color: "888888", font: { ascii: "Times New Roman" },
  })],
}));
bodyChildren.push(new Paragraph({ children: [new PageBreak()] }));

// 1. Executive Summary
bodyChildren.push(h1("1. Executive Summary"));
bodyChildren.push(body("This playbook is the off-page half of the SEO work for jadugarrajtilak.com. The on-site foundation is already complete: Google Analytics 4 is live (G-103JFH1Z6B), the site serves a dynamic sitemap and robots.txt, every page carries structured data (LocalBusiness with a verified 4.8-star, 181-review rating), and the new Blog section carries ten SEO-optimised articles with proper H1/H2 hierarchy, alt text on every image, internal links and reference citations. What remains — and what no website can do for itself — is earning links from other websites."));
bodyChildren.push(body("Domain Authority (DA) and Page Authority (PA) are third-party scores that approximate how strong a site's backlink profile is. They grow through one mechanism only: relevant, quality websites linking to yours. There is no legitimate shortcut. What this playbook provides is a realistic, four-week action plan targeting 25+ placement opportunities across business directories, wedding and event platforms, content communities and local press, followed by a maintenance rhythm that compounds month after month."));
bodyChildren.push(body("Honest expectation-setting: top-5 Google rankings for high-volume national keywords (such as \u201Cmagician in India\u201D) typically take six to eighteen months of consistent effort against established competitors. Local, high-intent keywords (such as \u201Cmagician in Udaipur\u201D, \u201Cmagician in Jaipur\u201D, \u201Cwedding magician Rajasthan\u201D) are reachable far sooner — often within weeks — because the site already has the local signals: verified Google Business Profile, reviews, city-specific landing content and now locally-targeted blog articles."));

// 2. Current status
bodyChildren.push(h1("2. What Is Already Done (On-Site Foundation)"));
bodyChildren.push(body("The following are live on production as of October 2026 and require no further work; they are listed here so that the off-page effort below is not duplicated or misdirected."));
bodyChildren.push(bullet("Technical SEO: dynamic sitemap.xml (auto-includes every blog post), robots.txt, canonical URLs on every page, HTTPS with HSTS, fast edge hosting, mobile-first responsive layout."));
bodyChildren.push(bullet("Structured data: LocalBusiness/EntertainmentBusiness schema with NAP, geo-coordinates, service offers and aggregate rating; Article schema on every blog post; per-post Open Graph and Twitter cards."));
bodyChildren.push(bullet("Content: ten SEO blog posts (wedding ideas, pricing, corporate, college fests, birthdays, performer checklist, Jaipur local guide, virtual shows, mentalism, sangeet ideas) — each with meta title/description, featured image with descriptive alt text, internal links and a visible references section."));
bodyChildren.push(bullet("Measurement: GA4 with SPA page-view tracking on every route and article, plus first-party analytics visible inside the Master Admin panel."));
bodyChildren.push(bullet("Google Business Profile: verified, 4.8 stars from 181 reviews, linked from the site's structured data and blog references."));

// 3. How DA/PA works
bodyChildren.push(h1("3. How DA/PA Actually Grow"));
bodyChildren.push(body("Domain Authority is Moz's estimate (0-100) of a site's ranking strength, derived almost entirely from the quantity and quality of linking root domains. Ahrefs' equivalent is Domain Rating; Semrush calls it Authority Score. All three move the same way: more unique, relevant, trustworthy domains linking to you."));
bodyChildren.push(body("One link from a strong, relevant website (a wedding platform, a news outlet, an established blog) is worth more than hundreds of links from weak or unrelated sites. Links from comments, forums signature blocks, low-quality directories and paid link farms are ignored at best and penalised at worst — Google's spam policies specifically target buying links and excessive link exchanges. The plan below deliberately avoids every grey technique, because a new domain cannot afford a manual penalty."));
bodyChildren.push(body("The compounding mechanic worth understanding: every new quality link raises the site's overall authority slightly, which lifts the ranking ability of every page — including the booking pages that actually convert into shows. That is why off-page work is worth the weekly discipline even though nothing \u201Cbreaks\u201D when it is skipped."));

// 4. The 4-week plan
bodyChildren.push(h1("4. The Four-Week Backlink Plan"));
bodyChildren.push(body("Each week has a theme and a concrete submission list. Budget roughly three hours per week. Every listing uses the exact same Name-Address-Phone (\u201CNAP\u201D) details — consistency across directories is itself a local ranking factor — and links back to jadugarrajtilak.com with the anchor text noted in Section 5."));

bodyChildren.push(h2("Week 1 — Foundation Listings (Highest Priority)"));
bodyChildren.push(body("These are the trust-layer listings Google expects a real business to have. They are free, fast, and several are powerful ranking signals in their own right."));
bodyChildren.push(num(1, "Google Business Profile (google.com/business) — claim/verify, add website link, service list (Wedding Magic Show, Corporate Magic Show, Birthday Magic Show, Stage Illusion Show), photos weekly, and reply to every review. This alone drives the local map pack."));
bodyChildren.push(num(2, "Bing Places for Business — import from Google, verify, same NAP."));
bodyChildren.push(num(3, "JustDial — the existing listing is live; enhance with photos, full service descriptions and the website URL."));
bodyChildren.push(num(4, "Sulekha — create a services listing under Event Organisers/Magicians with service areas Udaipur, Jaipur, Jodhpur, Rajasthan."));
bodyChildren.push(num(5, "IndiaMART — register as a service provider under Entertainment/Event Services."));
bodyChildren.push(num(6, "Facebook & Instagram — ensure the website link is present in both bios; these are followed links from high-authority domains and feed social signals."));

bodyChildren.push(h2("Week 2 — Wedding & Event Directories (Relevance Layer)"));
bodyChildren.push(body("These links matter because they are topically relevant — a magician listed on wedding platforms is exactly the link profile Google expects to see for this business."));
bodyChildren.push(num(1, "WedMeGood (wedmegood.com) — vendor listing under Entertainment; the single most relevant wedding platform in India."));
bodyChildren.push(num(2, "ShaadiSaga (shaadisaga.com) — vendor profile under Entertainment/Bands & DJs alternatives."));
bodyChildren.push(num(3, "WeddingWire India (weddingwire.in) — vendor listing."));
bodyChildren.push(num(4, "Eventjini / Event Management directories — performer listing where available."));
bodyChildren.push(num(5, "Local city directories — Udaipur and Jaipur business directories (e.g., UdaipurMart, city-specific portals) under Entertainment."));
bodyChildren.push(num(6, "College fest platforms (FestHub, KnowAFest) — performer/artist listings, which also generate direct booking enquiries."));

bodyChildren.push(h2("Week 3 — Content Amplification (Earned Layer)"));
bodyChildren.push(body("This week turns the ten blog posts into link magnets. The technique is answering real questions where real people ask them, with a link back as the source."));
bodyChildren.push(num(1, "Quora — search \u201Cwedding entertainment ideas India\u201D, \u201Chow much does a magician cost\u201D, \u201Ccorporate event ideas\u201D; write genuinely useful 200-300 word answers that reference the relevant blog article as the detailed source. Five answers this week."));
bodyChildren.push(num(2, "Medium — republish one blog post per week as a canonical-linked article (use the canonical link feature so Google attributes the original)."));
bodyChildren.push(num(3, "YouTube Shorts / Instagram Reels — post one 30-second performance clip per week with the website in the description; video results rank in Google for many of these keywords."));
bodyChildren.push(num(4, "Pinterest — pin the blog posts' images with keyword-rich descriptions; pins index in Google and persist for years."));
bodyChildren.push(num(5, "Reddit (r/IndiaWeddings, r/event planning subs) — participate honestly; links only when contextually warranted."));

bodyChildren.push(h2("Week 4 — PR & Community (Authority Layer)"));
bodyChildren.push(body("One or two links from news or established blogs outweigh dozens of directory links. This week plants those seeds."));
bodyChildren.push(num(1, "Local press — Rajasthan Samachar, Dainik Bhaskar city desk, Udaipur Times: a short pitch on \u201CUdaipur magician performing across N cities / new online show format\u201D. Local newspapers link to websites in their online editions."));
bodyChildren.push(num(2, "HARO-equivalents (Featured, Qwoted, Help a B2B Writer) — respond to journalist requests for \u201Cevent entertainment expert\u201D quotes; each response is a chance at a news-domain link."));
bodyChildren.push(num(3, "Guest posts — offer one article (\u201CHow we plan a college fest finale\u201D) to an event-management or wedding blog in exchange for a short author bio link."));
bodyChildren.push(num(4, "Partnerships — venues, decorators, event planners in Udaipur/Jaipur: exchange \u201Crecommended vendors\u201D page links. Event vendor partner pages are the most natural link source this business has."));
bodyChildren.push(num(5, "Testimonials — send a short testimonial to suppliers the studio genuinely uses (costume, sound, printing); they often publish testimonials with a link back."));

// 5. Anchor text strategy
bodyChildren.push(h1("5. Anchor Text Strategy"));
bodyChildren.push(body("Anchor text is the clickable words of a link. Over-optimised anchors (every link saying \u201Cbest magician in India\u201D) are a classic spam signal; a natural profile is mostly branded and URL-based. Use this mix when creating listings and content links:"));
bodyChildren.push(makeTable(
  ["Anchor type", "Example", "Share of links"],
  [
    ["Brand / name", "Jadugar Rajtilak", "40%"],
    ["URL (naked)", "jadugarrajtilak.com", "25%"],
    ["Natural phrase", "visit the website / book a show here", "20%"],
    ["Partial keyword", "magician based in Udaipur / magic shows", "10%"],
    ["Exact keyword (max!)", "magician in Jaipur / wedding magician Rajasthan", "5%"],
  ],
  [26, 46, 28]
));
bodyChildren.push(body("The 5% ceiling on exact-match anchors is deliberate and important: exceeding it is one of the few ways a small site actively earns a penalty rather than merely being ignored."));

// 6. Tracker
bodyChildren.push(h1("6. Placement Tracker"));
bodyChildren.push(body("Track every submission in one sheet: platform, date submitted, live status, URL of the listing, and the anchor used. The table below is the master target list with approximate domain strength at the time of writing — re-verify with Ahrefs' free backlink checker or Semrush before investing time."));

bodyChildren.push(h2("Directory targets (Weeks 1-2)"));
bodyChildren.push(makeTable(
  ["Platform", "Type", "Priority", "Notes"],
  [
    ["Google Business Profile", "Map listing", "P0", "Already verified - enhance, post weekly"],
    ["Bing Places", "Map listing", "P0", "Import from GBP"],
    ["JustDial", "Directory", "P0", "Listing live - add site link + photos"],
    ["Sulekha", "Directory", "P1", "Create under Event Services"],
    ["IndiaMART", "Directory", "P1", "Service provider profile"],
    ["WedMeGood", "Wedding platform", "P0", "Most relevant wedding listing"],
    ["ShaadiSaga", "Wedding platform", "P1", "Vendor profile"],
    ["WeddingWire India", "Wedding platform", "P1", "Vendor listing"],
    ["Facebook Page", "Social", "P0", "Bio link + weekly clips"],
    ["Instagram", "Social", "P0", "Bio link + Reels"],
    ["YouTube channel", "Video", "P1", "Shorts with site in description"],
    ["Pinterest", "Visual", "P2", "Pin blog images"],
    ["Quora profile", "Q&A", "P1", "5 keyword-targeted answers"],
    ["Medium", "Publishing", "P2", "Canonical-linked reposts"],
  ],
  [26, 20, 14, 40]
));

bodyChildren.push(h2("Expected results timeline"));
bodyChildren.push(makeTable(
  ["Timeframe", "Milestone"],
  [
    ["Weeks 1-2", "Foundation listings live: GBP enhanced, 6-8 directory links"],
    ["Month 1", "12-18 referring domains; local keywords (magician in Udaipur) top 10"],
    ["Month 2-3", "Wedding directories + Quora/Medium links; DA estimate 8-15"],
    ["Month 4-6", "First press/partner links; Jaipur + wedding keywords top 5-10"],
    ["Month 6-12", "20-40 referring domains; DA 15-25; national keywords enter top 10-20"],
  ],
  [22, 78]
));

// 7. Rules
bodyChildren.push(h1("7. What NOT to Do (Link Schemes That Backfire)"));
bodyChildren.push(body("Google's spam policies are enforced by algorithm and by human review, and recovery from a manual action can take longer than building a new site. Every technique below is used by sellers of \u201Ccheap backlink packages\u201D; all of them put the domain at risk:"));
bodyChildren.push(bullet("Never buy links from Fiverr/SEO packages promising 100+ backlinks — these are link farms and private blog networks (PBNs)."));
bodyChildren.push(bullet("Never use automated directory submission software — it submits to spam networks with identical anchors."));
bodyChildren.push(bullet("Never swap links at scale (reciprocal link pages, \u201Clink exchange\u201D WhatsApp groups)."));
bodyChildren.push(bullet("Never hide links on the site (display:none, white-on-white text) — hidden links are treated as cloaking."));
bodyChildren.push(bullet("Never spam blog comments or forum signatures — they are nofollow/ignored and waste the hours."));
bodyChildren.push(body("The blog's references sections use visible, contextual citations by design: honest outbound links to the business's own verified profiles (Google reviews, JustDial, social) build the entity's credibility, and the internal links between the ten articles concentrate ranking signals where they convert — the booking pages."));

// 8. Measuring
bodyChildren.push(h1("8. Measuring Progress"));
bodyChildren.push(num(1, "Google Search Console (search.google.com/search-console) — verify the domain; this is the source of truth for impressions, average position and clicks. Check weekly; it is free."));
bodyChildren.push(num(2, "GA4 (G-103JFH1Z6B) — already live: watch Organic Search sessions under Reports > Acquisition, and the first-party Analytics tab in Master Admin for a quick daily-views pulse."));
bodyChildren.push(num(3, "Ahrefs free tools / Moz Link Explorer free tier — check referring domains and DA/PA once a month; expect small monthly movements, not weekly jumps."));
bodyChildren.push(num(4, "Manual spot-check — search the three priority keyword groups monthly and note positions: (a) magician in Udaipur / Rajasthan, (b) magician in Jaipur, (c) wedding / corporate magician India."));

// 9. Next steps
bodyChildren.push(h1("9. Immediate Next Steps"));
bodyChildren.push(num(1, "Log into Google Business Profile this week and complete the service list, photos and website link (30 minutes, highest ROI of anything in this document)."));
bodyChildren.push(num(2, "Work through Week 1's list in order — every item is free and takes under twenty minutes."));
bodyChildren.push(num(3, "Verify the site in Google Search Console and submit the sitemap (one-time, five minutes)."));
bodyChildren.push(num(4, "Keep publishing: one new blog post per fortnight from Blog Studio keeps the site fresh and gives every directory and community platform something new to link to."));
bodyChildren.push(num(5, "Track everything in the placement tracker from Section 6 — visibility into what was submitted where is what turns SEO from luck into a system."));

// ── Assemble document ────────────────────────────────────────
const header = new Header({
  children: [new Paragraph({
    alignment: AlignmentType.RIGHT,
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: c(P.accent), space: 4 } },
    children: [new TextRun({ text: "jadugarrajtilak.com — Off-Page SEO Playbook", size: 16, color: c(P.secondary), font: { ascii: "Times New Roman" } })],
  })],
});
const footer = new Footer({
  children: [new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: c(P.secondary), font: { ascii: "Times New Roman" } })],
  })],
});

const doc = new Document({
  creator: "Jadugar Rajtilak Studio",
  title: "Off-Page SEO & Backlinks Growth Playbook",
  styles: {
    default: {
      document: {
        run: { font: { ascii: "Times New Roman", eastAsia: "SimSun" }, size: 24, color: c(P.body) },
        paragraph: { spacing: { line: 312 } },
      },
    },
  },
  sections: [
    {
      properties: {
        page: { size: { width: 11906, height: 16838 }, margin: { top: 0, bottom: 0, left: 0, right: 0 } },
      },
      children: buildCoverR1({
        title: "Off-Page SEO & Backlinks Growth Playbook",
        subtitle: "jadugarrajtilak.com — building domain authority that ranks",
        englishLabel: "GROWTH PLAYBOOK",
        metaLines: [
          "Prepared for: Jadugar Rajtilak — Magician, Udaipur",
          "Scope: Off-page SEO, backlinks, DA/PA growth",
          "Companion to: on-site technical + blog SEO (complete)",
          "Date: October 2026",
        ],
        footerLeft: "JADUGAR RAJTILAK",
        footerRight: "SEO GROWTH SERIES",
        palette: P,
      }),
    },
    {
      properties: {
        type: SectionType.NEXT_PAGE,
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          pageNumbers: { start: 1 },
        },
      },
      headers: { default: header },
      footers: { default: footer },
      children: bodyChildren,
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("/home/z/my-project/download/Backlinks-SEO-Playbook-jadugarrajtilak.docx", buf);
  console.log("Written: download/Backlinks-SEO-Playbook-jadugarrajtilak.docx", buf.length, "bytes");
});
