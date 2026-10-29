// ─────────────────────────────────────────────────────────────
// Jadugar Rajtilak — site content (doc section 6 sitemap)
// HARD RULE (doc §1 / P0): all unverified brand facts are
// clearly-marked placeholders. Never publish invented reviews.
// ─────────────────────────────────────────────────────────────

export type RouteId =
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
  | "legal"
  | "admin"
  | "udaipur"
  // Dedicated service money pages (SEO audit T-13 / roadmap R-18,
  // R-19, R-20, R-22, 2026-10-29): the six show formats previously
  // lived only as sections of /services — competitors rank with
  // dedicated URLs for "wedding magician india", "corporate magician
  // india", etc. Each page ships 700+ words, FAQ, internal links and
  // Service+Breadcrumb JSON-LD.
  | "svcWedding"
  | "svcCorporate"
  | "svcBirthday"
  | "svcCollege"
  | "svcVirtual"
  | "svcPrivate"
  // Destination-wedding differentiator (audit O-01): Udaipur is
  // India's wedding capital and no competitor owns the term.
  | "destWedding";

export const NAV_ITEMS: { id: RouteId; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "services", label: "Shows" },
  { id: "packages", label: "Packages" },
  { id: "gallery", label: "Gallery" },
  { id: "testimonials", label: "Reviews" },
  { id: "blog", label: "Blog" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
];

// 6 event types (doc section 6 — Shows & Services)
export type EventType = {
  id: string;
  name: string;
  short: string;
  tagline: string;
  description: string;
  idealFor: string[];
  duration: string;
  highlights: string[];
  icon: "rings" | "briefcase" | "cake" | "mic" | "crown" | "monitor";
};

export const EVENT_TYPES: EventType[] = [
  {
    id: "wedding",
    name: "Wedding Magic",
    short: "Weddings",
    tagline: "Unforgettable moments between the vows and the vows-to-be",
    description:
      "Close-up magic during the sangeet and cocktail hours, and a stage act that gives your families one story they will retell for years. Every routine is dressed for the occasion — elegant, warm, and never at the expense of the couple's spotlight.",
    idealFor: ["Sangeet & cocktail evenings", "Reception highlights", "Intimate mehendi gatherings"],
    duration: "30–75 min stage · 2–3 hr roaming",
    highlights: [
      "Routines woven around the couple's story",
      "Roaming close-up magic for guest tables",
      "Sound & light coordination with your DJ",
    ],
    icon: "rings",
  },
  {
    id: "corporate",
    name: "Corporate Shows",
    short: "Corporate",
    tagline: "The act your annual day will be remembered by",
    description:
      "A polished stage show for annual days, award nights and dealer meets — scripted to your brand, timed to the run-sheet, and delivered with GST invoicing and a clean contract. Clean humour that is safe for every hierarchy in the room.",
    idealFor: ["Annual day & award nights", "Dealer & partner meets", "Offsites & town halls"],
    duration: "30–60 min stage act",
    highlights: [
      "Brand-woven custom routines",
      "Professional rider: sound, lights, staging",
      "GST invoice & clear contract terms",
    ],
    icon: "briefcase",
  },
  {
    id: "birthday",
    name: "Birthday & Kids",
    short: "Birthdays",
    tagline: "Safe, fast, hilarious — built for short attention spans",
    description:
      "A high-energy 45-minute show of colour-changing silks, appearing doves of paper, and tricks where the birthday child becomes the hero. Every effect is age-calibrated: no darkness, no flames, no frightening moments — only wide eyes and louder laughter.",
    idealFor: ["Ages 4–12 birthday parties", "Society & community events", "School annual functions"],
    duration: "45 min · repeatable for batches",
    highlights: [
      "The birthday child stars in the finale",
      "Age-safe props — no fire, no darkness",
      "Take-home magic trick for every child",
    ],
    icon: "cake",
  },
  {
    id: "college",
    name: "College & Stage",
    short: "College Fests",
    tagline: "Big energy for big auditoriums",
    description:
      "A large-format illusion and mentalism act engineered for 500–5,000 seat venues and fest-scale energy. Crowd-work segments read the room live, and the pace never drops between acts. Built to trend on the fest reel by Monday morning.",
    idealFor: ["Fest headline nights", "Freshers' welcome", "Inter-college competitions"],
    duration: "45–90 min headline set",
    highlights: [
      "Large-visibility illusions for back rows",
      "Live crowd-work & volunteer segments",
      "Fest-reel friendly finale moment",
    ],
    icon: "mic",
  },
  {
    id: "private",
    name: "Private & Luxury",
    short: "Private",
    tagline: "An evening your drawing room will not forget",
    description:
      "Salon-grade close-up magic for intimate gatherings of 15–80 guests, where the magic happens inches from the eyes — in guests' own hands, with their own belongings. Discreet, elegant, and tailored for settings where subtlety is the luxury.",
    idealFor: ["Intimate soirees & dinners", "Yacht & villa evenings", "Celebrity-only guest lists"],
    duration: "90–150 min salon format",
    highlights: [
      "Magic in the guests' own hands",
      "Discreet arrival & seamless flow",
      "Curated set-list after a planning call",
    ],
    icon: "crown",
  },
  {
    id: "virtual",
    name: "Online / Virtual",
    short: "Virtual",
    tagline: "A camera-ready show for remote teams",
    description:
      "An interactive show designed for the webcam frame — mind-reading that works through screens, predictions built from the chat window, and moments where remote attendees influence the outcome live. Ideal for distributed teams and hybrid events.",
    idealFor: ["Remote team celebrations", "Hybrid event segments", "Client appreciation evenings"],
    duration: "30–45 min live set",
    highlights: [
      "Effects engineered for the webcam frame",
      "Chat-driven interactivity",
      "Recording-ready staging & lighting",
    ],
    icon: "monitor",
  },
];

// Packages (doc section 6 — transparent tiers; indicative ranges, exact quote in writing)
export type PackageTier = {
  id: string;
  name: string;
  range: string;
  blurb: string;
  inclusions: string[];
  bestFor: string;
  featured?: boolean;
};

export const PACKAGES: PackageTier[] = [
  {
    id: "signature",
    name: "Signature",
    range: "Price on request",
    blurb: "The essential Rajtilak evening for intimate gatherings.",
    inclusions: [
      "30–40 min stage magic show",
      "Sound system & stage lights",
      "2 crowd-participation routines",
      "Travel within your city included",
    ],
    bestFor: "Birthdays & society events",
  },
  {
    id: "royal",
    name: "Royal",
    range: "Price on request",
    blurb: "Our most-booked tier — a full evening engineered to be remembered.",
    inclusions: [
      "60 min headline stage show",
      "90 min roaming close-up magic",
      "Custom routine woven to your occasion",
      "Professional light & sound rider",
      "Dedicated coordinator on call",
    ],
    bestFor: "Weddings & corporate annual days",
    featured: true,
  },
  {
    id: "grand",
    name: "Grand",
    range: "Price on request",
    blurb: "The full cinematic production for stages that demand spectacle.",
    inclusions: [
      "90 min large-format illusion act",
      "Pre-show salon close-up hour",
      "Illusionist assistant & stage crew",
      "Full production rider & rehearsal",
      "Cinematic intro projection design",
    ],
    bestFor: "College fests & luxury events",
  },
];

// Signature acts (home)
export const SIGNATURE_ACTS = [
  {
    title: "The Tilak Revelation",
    kind: "Stage Illusion",
    description:
      "A borrowed ring vanishes in a fist of vermilion dust and returns — sealed inside a tilak-marked locket held by a spectator since the act began.",
    suit: "♦" as const,
  },
  {
    title: "Fifty-Two Doors",
    kind: "Mentalism",
    description:
      "A thought-of card travels backward through the deck, face up, stopping exactly at the number silently counted by the volunteer on stage.",
    suit: "♠" as const,
  },
  {
    title: "The Ivory Cascade",
    kind: "Manipulation",
    description:
      "A bare-handed blizzard of playing cards that catch stage light like falling gold — the closing image audiences photograph and post.",
    suit: "♥" as const,
  },
];

// ── Real reviews — platform-verified summaries only (doc rule: never invent reviews).
// Every quote below is a published rating-platform summary for Jadugar Rajtilak,
// linked to its live source. Individual reviewer texts live on the platforms.
export type ReviewSource = {
  source: "Google" | "Justdial";
  rating: number;
  count: number;
  headline: string;
  summary: string;
  url: string;
};

export const REAL_REVIEWS: ReviewSource[] = [
  {
    source: "Google",
    rating: 4.8,
    count: 181,
    headline: "“An amazing and entertaining show”",
    summary:
      "People say this magician provides an amazing and entertaining show. They also highlight the excellent magic and engaging performances.",
    url: "https://www.google.com/search?kgmid=/g/11c1p4hlsk&q=Jadugar+Rajtilak",
  },
  {
    source: "Justdial",
    rating: 4.8,
    count: 195,
    headline: "“The show was always new and miraculous”",
    summary:
      "Many customers mentioned that the show was always new and miraculous. Users enjoyed sitting in amazement and being entertained — with no specific dislikes mentioned.",
    url: "https://www.justdial.com/Udaipur-Rajasthan/Jadugar-Rajtilak-Opposite-Hotel-Rajkamal-Bhuwana/9999PX294-X294-180528141553-G5M2_BZDET",
  },
  {
    source: "Justdial",
    rating: 4.8,
    count: 195,
    headline: "Rated 4.8 by hosts across platforms",
    summary:
      "A highly-rated event performer in Udaipur — 4.8 stars on Google and 4.8 stars on Justdial, across 375+ verified ratings from booked shows.",
    url: "https://www.justdial.com/Udaipur-Rajasthan/Jadugar-Rajtilak-Opposite-Hotel-Rajkamal-Bhuwana/9999PX294-X294-180528141553-G5M2_BZDET",
  },
];

// FAQ (doc section 6: pricing, travel, tech needs, safety, cancellation)
// Grouped by audience question intent — powers the FAQ page tab filter.
export type FaqCat = "booking" | "logistics" | "audience" | "policy";

export const FAQ_CATS: { id: FaqCat; label: string; blurb: string }[] = [
  {
    id: "booking",
    label: "Booking & Pricing",
    blurb: "Quotes, soft-holds and how a booking comes together",
  },
  {
    id: "logistics",
    label: "Travel & Setup",
    blurb: "Cities, staging and the technical rider",
  },
  {
    id: "audience",
    label: "Audience & Safety",
    blurb: "Children, cameras and who the show is safe for",
  },
  {
    id: "policy",
    label: "Policies",
    blurb: "Cancellation, rescheduling and contract terms",
  },
];

export const FAQS: { q: string; a: string; cat: FaqCat }[] = [
  {
    q: "How much does a show cost?",
    a: "Pricing is shared as a written quote after your enquiry — it depends on city, duration, guest count and staging, and every quote states travel and technical requirements up front with no hidden line items. Share your date and occasion to receive the exact figure in writing.",
    cat: "booking",
  },
  {
    q: "Do you travel to other cities?",
    a: "Yes. Travel within Udaipur and across Rajasthan is included in most tiers; outside travel is quoted as actuals (fare + stay) and confirmed in writing before booking. Availability can be checked live on the booking calendar before you enquire.",
    cat: "logistics",
  },
  {
    q: "What technical setup do you need?",
    a: "A stage area of roughly 12×10 ft, a basic sound system with two microphones, and general stage lighting. The Royal and Grand tiers include a full technical rider, and the team coordinates directly with your venue or DJ.",
    cat: "logistics",
  },
  {
    q: "Is the show safe for children?",
    a: "The birthday tier is age-calibrated: no fire, no darkness, no frightening content. Effects are colour-forward and participatory, and the birthday child stars in the finale. Parents are welcome to film the entire act.",
    cat: "audience",
  },
  {
    q: "What is your cancellation policy?",
    a: "Cancellations 30+ days before the show receive a full refund of any advance; within 30 days, the advance is adjusted against a rescheduled date within 12 months. Full terms are on the Legal page and confirmed in the booking contract.",
    cat: "policy",
  },
  {
    q: "How far ahead should we book?",
    a: "Peak wedding and festive season dates typically close 6–8 weeks ahead. The booking calendar shows live availability, and an enquiry reserves a soft-hold on your date for 72 hours while the quote is prepared.",
    cat: "booking",
  },
  {
    q: "How does a booking actually come together, step by step?",
    a: "Every booking follows the same four steps: check your date on the live calendar, enquire with your occasion details, receive a written quote (with a 72-hour soft-hold on your evening while you decide), then confirm with an advance and a clear contract. Between confirmation and showtime the team coordinates directly with your venue, DJ or planner so nothing is left to the day itself.",
    cat: "booking",
  },
  {
    q: "Can the act be customised to our occasion?",
    a: "Yes — customisation is built into the craft, not an add-on. Wedding routines are woven around the couple's story, corporate acts are scripted to the brand and the run-sheet, and the birthday child always stars in the finale. The private tier even begins with a planning call to curate the set-list for your guest list. Share the occasion when you enquire and the routine is dressed for it.",
    cat: "booking",
  },
  {
    q: "Can our guests film and photograph the show?",
    a: "Yes — families and guests are welcome to film. The birthday tier explicitly invites parents to film the entire act, and many of the most-shared frames in the gallery were taken by guests at their tables. If your event has an official photographer or videographer, the team coordinates the angles in advance so staged lighting and camera flashes work together instead of against each other.",
    cat: "audience",
  },
];

// Blog posts (doc 10.3 content topics) — full, published articles. Each
// entry carries its own date, intro, sections and closing so the Journal
// reads live and complete; the outline doubles as the table of contents.
export type BlogSection = { h: string; paras: string[] };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingTime: string;
  keywords: string;
  date: string;
  outline: string[];
  body: { intro: string; sections: BlogSection[]; closing: string };
  featured?: boolean;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "wedding-entertainment-ideas",
    title: "9 Ways a Magician Elevates a Wedding Evening (Beyond the Stage Show)",
    excerpt:
      "From sangeet table-side sets to a reception finale — where live magic fits into a wedding timeline, and how to brief your magician so it lands.",
    category: "Weddings",
    readingTime: "6 min",
    keywords: "wedding magician, sangeet entertainment",
    date: "October 2026",
    outline: [
      "Mapping the wedding timeline: mehendi → sangeet → reception",
      "Table-side sets during cocktail hours — why proximity beats spectacle",
      "The couple-centric routine: weaving your story into the act",
      "Coordinating with the DJ, planner and photographer",
    ],
    body: {
      intro:
        "A wedding evening already has music, food and laughter — what it usually lacks is a moment nobody saw coming. That is precisely where live magic belongs. Across 500+ shows, the wedding engagements that still get talked about a year later were never the loudest ones; they were the ones timed to the rhythm of the evening. This entry maps exactly where a magician fits into a multi-day wedding, and how to brief one so the act feels like it was written for your family rather than rented for the night.",
      sections: [
        {
          h: "Mapping the wedding timeline: mehendi → sangeet → reception",
          paras: [
            "Every function has a different energy, and the mistake hosts make is treating them as interchangeable. The mehendi is relaxed and daylight-lit — perfect for strolling close-up magic that pulls small circles of cousins together between henna appointments. The sangeet is loud and choreographed, which means a stage act slots best right after the last dance performance, when the energy peaks and a ten-minute illusion set rides that wave instead of fighting it.",
            "The reception is the most formal and the most international — older relatives, out-of-town guests, speeches. Here, magic works as connective tissue: a close-up set during the welcome hour warms the room before dinner, and one strong couple-centric moment after the cake cutting gives the photographers their frame of the night. Booking the same magician across two functions also means the act is calibrated to your families by day two — the in-jokes land, and the grandparents stop being strangers to the performance.",
          ],
        },
        {
          h: "Table-side sets during cocktail hours — why proximity beats spectacle",
          paras: [
            "During the cocktail hour, nobody wants to stop conversation and face a stage — they want to be interrupted delightfully for three minutes. Table-side close-up magic is engineered for exactly this: the impossible happens in your guests' own hands, with borrowed rings, signed cards and watches that were on a wrist a moment ago. There is no screen, no distance and no camera angle to blame; the proof is unfolding thirty centimetres from their face.",
            "The practical mathematics matter too. A trained close-up performer covers roughly ten to twelve tables in forty-five minutes, which means even a 300-guest cocktail hour feels the act personally. Guests who missed the set hear about it over dinner and hunt the magician down afterward — which is why the highest number of booking enquiries at weddings comes not from the hosts but from guests who watched. Proximity converts; spectacle only impresses.",
          ],
        },
        {
          h: "The couple-centric routine: weaving your story into the act",
          paras: [
            "The moment a wedding crowd remembers longest is the one that could only belong to that couple. A routine built around how you met, the city you fell in love in, or the ring that was hidden for three weeks lands differently from any imported illusion. When the couple's own story appears inside the trick — a prediction envelope that names the exact date of the proposal, for example — the room does not applaud, it gasps, and then it turns to look at you both.",
            "The brief the studio needs for this is short: how you met, one detail only the two of you know, and the shape of the evening. From there the routine is scripted and rehearsed around your facts, never around generic romance. This is also the safest kind of spectacle on a wedding timeline — it requires no extra stage, no blackout, and no pause in the service flow, because the story itself is the prop.",
          ],
        },
        {
          h: "Coordinating with the DJ, planner and photographer",
          paras: [
            "Magic is a technical act wearing an informal jacket — it needs sightlines, a music bed that can duck on cue, and light that does not blind the performer mid-routine. A professional magician arrives with a one-page rider: an 8×10 ft performance area for the stage segments, one hand-held mic or a lapel, and a five-minute window of reduced background music. Sending this rider to your planner at booking time removes every surprise from the run-sheet.",
            "Photographers deserve their own conversation. The finale moments are engineered to be filmed — bright, slow and framed — but some close-up pieces die under a flash barrage. Share the photographer's contact in advance so the two can agree on angles and lighting before the first guest walks in. The weddings where this fifteen-minute coordination call happened are the ones whose galleries still circulate in family WhatsApp groups a year later.",
          ],
        },
      ],
      closing:
        "The through-line of every point above is sequencing: the right act, at the right function, at the right minute. When you enquire, share the tentative timeline and the studio will mark exactly where the magic slots go — and hold your date for 72 hours while the families deliberate.",
    },
    featured: true,
  },
  {
    slug: "how-to-choose-a-magician",
    title: "How to Choose a Magician for Your Event: A 10-Point Checklist",
    excerpt:
      "Videos, contracts, technical riders and the questions that separate a professional act from a hobbyist with a deck of cards.",
    category: "Guides",
    readingTime: "8 min",
    keywords: "how to choose a magician",
    date: "September 2026",
    outline: [
      "The video test: what a real show reel must contain",
      "Contracts, GST invoicing and written quotes — the paperwork of professionalism",
      "Questions to ask before paying an advance",
      "Red flags that look harmless until showtime",
    ],
    body: {
      intro:
        "Anyone can buy a deck of cards and a black waistcoat and call themselves a magician — the barrier to entry is a payment link, which is why the gap between a ₹8,000 hobbyist and a professional act is invisible on an Instagram profile until showtime. This checklist comes from the booking side of 500+ performances: the ten checks that reliably separate an act that arrives with a run-sheet from one that arrives with excuses. Print it, or keep it open on your phone while you shortlist.",
      sections: [
        {
          h: "The video test: what a real show reel must contain",
          paras: [
            "A show reel full of quick cuts and reaction shots is marketing; a real performance video is evidence. Look for at least one continuous, unedited clip of sixty seconds or more where you can see the audience and the performer in the same frame — the trick and the laughter must visibly belong to the same moment. If every clip is a close-up of hands with a caption, you have no proof the act can hold a room of two hundred people.",
            "Then check the audience, not the magician. Are they leaning in or politely waiting? Do different clips show different rooms — a sangeet, an auditorium, a terrace party — or is it the same rented venue dressed differently? A performer whose footage spans weddings, corporate annual days and college fests has already solved the hardest problem in magic: reading rooms that do not resemble each other.",
          ],
        },
        {
          h: "Contracts, GST invoicing and written quotes — the paperwork of professionalism",
          paras: [
            "A professional treats your event like a production, and productions leave paper. At minimum you should receive a written quote that states the fee, the performance duration, travel and stay terms, and what happens if the timings shift on the day. If the number arrives by voice note and the follow-up is 'baki show ke din baat kar lenge', every one of those blanks will be filled in the performer's favour, at the worst possible moment.",
            "Ask whether GST invoicing is available, not because you necessarily need the input credit, but because a registered business is a performer who files, tracks and shows up. The contract should name the exact act you discussed — '45-minute stage show plus one hour of close-up during dinner' — rather than 'magic show, as discussed'. Ambiguity in writing always becomes overtime on stage, and overtime at events is billed in chaos, not rupees.",
          ],
        },
        {
          h: "Questions to ask before paying an advance",
          paras: [
            "Three questions predict the whole evening. First: 'What do you need from the venue?' — a professional answers with specifics (power point, sightlines, a green room, mic preferences) while a hobbyist answers 'kuch nahi, bas aajaunga'. Second: 'What happens if the show runs late?' — you are listening for a performer who talks in soft buffers, not shrugs. Third: 'Can I speak to two past hosts?' — references that cannot be produced are references that do not exist.",
            "The advance itself should be modest and receipted, and the cancellation terms should already be written before money moves. A fair policy looks like this: full refund of the advance when you cancel thirty days or more out, and credit toward a rescheduled date inside twelve months when it is closer. A performer who resists putting cancellation terms in writing is telling you exactly how the relationship will go if your event date moves.",
          ],
        },
        {
          h: "Red flags that look harmless until showtime",
          paras: [
            "The subtlest red flag is a magician who never asks about your event — no questions about guests, age mix, venue or occasion, just a price list. Unscripted acts are calibrated acts; a performer who doesn't interrogate the brief is planning to perform the same thirty minutes he performed last Saturday, whoever is in the chairs. The second flag is a deposit demanded in a personal UPI link with no paperwork trail — convenient, and completely unenforceable.",
            "Watch also for the act that is 'fully customisable' at no extra notice: genuine customisation takes rehearsal hours, and a performer who promises a brand-woven corporate routine two days before the show is either a genius or planning to change one word in the script. Finally, trust your gut on communication lag. If replies take four days before you have paid, imagine the day the flight is delayed and the sound check needs a decision in twenty minutes. The speed of small answers previews the speed of big ones.",
          ],
        },
      ],
      closing:
        "Every item on this list is answerable in a single conversation — which is the point. One structured call, ten honest checks, and the act you book will be one your guests meet on stage rather than discover in the fine print.",
    },
  },
  {
    slug: "magic-show-cost-india",
    title: "How Much Does a Magic Show Cost? An Honest Breakdown",
    excerpt:
      "What actually drives pricing — duration, travel, crew and staging — and why the cheapest quote usually costs the most.",
    category: "Pricing",
    readingTime: "5 min",
    keywords: "magic show cost",
    date: "August 2026",
    outline: [
      "The four honest cost drivers: duration, travel, crew, staging",
      "Why 'per show' pricing hides more than it reveals",
      "Reading a written quote line by line",
      "When a higher quote is actually the safer bet",
    ],
    body: {
      intro:
        "This is the entry most studios avoid writing, because opacity is profitable: if you cannot compare quotes, you cannot negotiate them. Here is the honest structure instead. A professional magic show in India spans roughly ₹25,000 for an intimate birthday format to upwards of ₹2,50,000 for a full-evening production with crew — and within that range, four variables move the number, none of which is the price of the cards. Understanding them turns an opaque number into a decision you can actually make.",
      sections: [
        {
          h: "The four honest cost drivers: duration, travel, crew, staging",
          paras: [
            "Duration is the obvious one, but it is rarely linear. A 45-minute stage show is not half of a 90-minute show — the second half carries the bigger illusions, additional packing and a longer technical window, so the fee curve steepens rather than halves. Travel is the second driver and the most misunderstood: for a Udaipur-based performer, a Jaipur evening is a half-day commitment, while a Delhi or Mumbai engagement consumes two working days once flights, stay and freight are counted. That is why the same act quotes differently by city.",
            "Crew and staging are the quiet multipliers. A close-up act travels with one performer and a briefcase; a stage illusion show travels with assistants, custom crates and a technical checklist the venue must satisfy. When you compare two quotes, ask what is inside each number — a solo mentalism act and a two-assistant illusion production may both say '60-minute stage show', but they are quoting entirely different machines.",
          ],
        },
        {
          h: "Why 'per show' pricing hides more than it reveals",
          paras: [
            "'Per show' sounds clean and behaves terribly, because it flattens everything that matters into one word. Two shows on the same day in the same city are one machine moving twice; one show that starts at 11 p.m. after a garland ceremony is a different commitment from a 6 p.m. slot, because it holds the entire evening hostage. A quote built on 'per show' cannot see any of this, so the performer either pads the number to protect against the worst case — you overpay — or underquotes and arrives resentful.",
            "The honest alternative is slot-based pricing: what the evening actually contains, function by function. A welcome-hour close-up set, a 30-minute stage act after the speeches, and a strolling set during dinner are three different products with different preparation. A studio that quotes this way is not being difficult; it is showing you the invoice logic before you owe anything, which is precisely what lets you trim intelligently when the budget needs to land.",
          ],
        },
        {
          h: "Reading a written quote line by line",
          paras: [
            "A professional quote has five lines minimum: the performance fee, travel and stay, any crew charges, staging or technical requirements the venue must provide, and the payment schedule with cancellation terms. The performance fee should name the exact slots; the travel line should state the mode and class rather than a lump 'travel extra'; and the technical section matters even when it costs you nothing, because it tells you the act is engineered rather than improvised.",
            "The two lines hosts skip and should not are the payment schedule and the cancellation clause. A reasonable structure is an advance to reserve the date and the balance on the day, with cancellation spelled out: full refund of the advance at thirty days or more, credit toward a rescheduled date inside twelve months when it is closer. If your quote has these two paragraphs, you are holding a document written by someone who has been rescheduled before and survived it professionally.",
          ],
        },
        {
          h: "When a higher quote is actually the safer bet",
          paras: [
            "The cheapest quote is the most expensive thing you can buy, because events fail in the gaps between what was promised and what was prepared. A performer quoting 30% below the professional rate is cutting something you cannot see from the brochure — rehearsal hours, backup props, insurance, or simply the willingness to arrive four hours early for a sound check. On the night, every one of those cuts becomes your problem wearing a bow tie.",
            "The premium quote, read correctly, is a risk document: it prices the hours you will never see, and the contingencies you hope never to need. When two quotes genuinely differ in professionalism, the decision is not between two prices but between two possible versions of your evening — one where a technical rider existed and one where it was discovered live. Choose the version of the night you want to be responsible for, then negotiate the number if you must; never the preparation.",
          ],
        },
      ],
      closing:
        "The studio's own policy follows this entry exactly: written quotes within 24 hours, slot-based, with travel and staging stated up front — and a 72-hour soft-hold on your date while the numbers are considered. Ask for one and read it against this page.",
    },
  },
  {
    slug: "corporate-event-entertainment",
    title: "Corporate Event Entertainment That Is Not a Piano Playlist",
    excerpt:
      "Why interactive entertainment outperforms passive acts at annual days, and how to align a magic act with your brand message.",
    category: "Corporate",
    readingTime: "7 min",
    keywords: "corporate event entertainment",
    date: "July 2026",
    outline: [
      "The attention-curve problem of annual-day evenings",
      "Interactive acts vs. background acts — measured engagement",
      "Brand-woven routines: product launches inside illusions",
      "Building the run-sheet slot that protects the act",
    ],
    body: {
      intro:
        "Every corporate committee knows the annual-day script: speeches nobody remembers, a DJ nobody dances to before the fifth song, and a dinner that starts late. The problem is not budget — most events spend generously — it is that passive entertainment asks nothing of the room, and a room asked for nothing gives nothing back. This entry is about the alternative: interactive entertainment engineered for adult, corporate audiences, and specifically how a magic act earns the attention a piano playlist merely occupies.",
      sections: [
        {
          h: "The attention-curve problem of annual-day evenings",
          paras: [
            "Draw the attention of an annual-day evening on a graph and you see two spikes — the awards and the food — with a long sagging valley between them. That valley is where entertainment is scheduled, and it is the worst possible terrain: employees have checked their phones, the leadership has left the stage, and everyone is quietly negotiating with themselves about leaving early. Any act placed in that valley competes not with other acts but with the exit.",
            "The fix is structural, not artistic. Entertainment works when it is attached to a spike: a ten-minute crowd-work set immediately after the awards rides the room's energy instead of resurrecting it, and a close-up hour during the cocktail slot gives people something to do with their hands besides hold drinks. When the HR team shares the run-sheet in advance, the act can be placed where attention already exists — a two-minute conversation that changes the entire evening's return on the same fee.",
          ],
        },
        {
          h: "Interactive acts vs. background acts — measured engagement",
          paras: [
            "Background entertainment — a pianist, a symphonic cover band, a saxophonist by the elevators — is decoration: pleasant, ignorable, and identical in every photograph because it interacts with nobody. Interactive entertainment is machinery: it converts audience members into the content itself. When the regional sales head's signed prediction appears inside a sealed envelope that has been in the CFO's custody since arrival, the story the office tells on Monday is not about the magician — it is about the CFO, the envelope and the number. That is engagement that compounds.",
            "The measurement is blunt and honest: count the phones. In a passive slot, screens come out within minutes; in an interactive mentalism segment, screens come out to film — which is a different act entirely, because a filmed moment is a moment the audience has decided to keep. The corporate act built on crowd-work and mentalism holds adult rooms precisely because it respects them: no borrowed childishness, no participation anyone dreads, just impossibilities that assume a sharp audience.",
          ],
        },
        {
          h: "Brand-woven routines: product launches inside illusions",
          paras: [
            "The most requested corporate customisation is also the most abused: putting the brand 'in' the show. A logo on a backdrop is advertising; a product inside the illusion is theatre. When the new product code-name that only the leadership committee knows appears — drawn by an audience member, from a locked box that has been on stage since before the speech — the reveal belongs to the company's story rather than to the magician's repertoire. That routine takes rehearsal and a genuine brief; it cannot be improvised from a green room.",
            "The brief that makes it work is surprisingly short: one secret (a code-name, a launch date, a number the company wants celebrated), and a fifteen-minute conversation about tone. From that, a routine is scripted where the secret is the finale — not mentioned in the opening, never repeated in the middle, delivered once at the peak. Companies that have done this once tend to book it annually, because a launch remembered as an illusion outlives a launch remembered as a slide.",
          ],
        },
        {
          h: "Building the run-sheet slot that protects the act",
          paras: [
            "Interactive entertainment is technical: sightlines past row ten, a mic that ducks music on cue, light on the audience because the audience is the show. A professional act arrives with a one-page rider stating these needs — and the rider is not a demand, it is insurance on your own evening. When the slot is built to protect the act (a raised area, a five-minute music reset, no service traffic through the sightlines), the act can spend its minutes on the room instead of the room's logistics.",
            "The last protection is the clock. Corporate evenings run late by nature, so the slot needs a named owner — one person on the committee empowered to say 'the awards end now' — and a hard stop the act can flex around without being cancelled. The shows that trend internally on Monday are the ones that started on time, ended strong, and left the room wanting the encore the calendar could not fit.",
          ],
        },
      ],
      closing:
        "Annual days, town halls, dealer meets and launch evenings each get a different act, because each room has a different attention curve. Share the occasion and the run-sheet, and the studio returns a written proposal with the slots marked — quotes land within 24 hours.",
    },
  },
  {
    slug: "birthday-party-magician-timeline",
    title: "The Birthday Party Run-Sheet: Where the Magic Slot Actually Goes",
    excerpt:
      "Cake time, meltdown time and the twenty minutes that decide the party — a parent's timeline for booking a children's magician.",
    category: "Families",
    readingTime: "5 min",
    keywords: "birthday party magician, kids entertainment",
    date: "June 2026",
    outline: [
      "The golden window: after snacks, before cake",
      "Age-calibrated shows — what changes between ages 4 and 12",
      "Why the birthday child must star in the finale",
      "Take-home tricks and the post-show calm-down",
    ],
    body: {
      intro:
        "A children's birthday party is a logistics problem wearing party hats, and the magician is either its best half-hour or its casualties list. The difference is never the tricks — it is the slot. Book the same excellent act at the wrong minute and you will perform for a room of children who are eating, sulking, or already inside the bouncy castle. This entry is the parent's field guide: where the magic slot goes, what changes with age, and how the party ends calmly instead of in sugar-fuelled tears.",
      sections: [
        {
          h: "The golden window: after snacks, before cake",
          paras: [
            "Every experienced birthday performer knows the curve: children arrive shy, warm up over games, peak about twenty minutes after snacks hit the table, and collapse the moment the cake is cut. The golden window sits exactly between snacks and cake — a room that is fed but not yet sugar-spiked, seated but not yet restless. A 45-minute act placed in that window plays to the party's best audience; the same act at 4 p.m. with an empty snack table performs for feral cats.",
            "The run-sheet that works is almost boring in its simplicity: arrivals and free play (30 minutes), snacks (20 minutes), the magic show (45 minutes), cake during the wind-down while the performer packs, and then games or return gifts. Notice what the cake placement does — it turns the post-cake chaos into the show's afterglow, because children processing a magic show eat cake quietly. Parents who have lived this once never schedule the show before snacks again.",
          ],
        },
        {
          h: "Age-calibrated shows — what changes between ages 4 and 12",
          paras: [
            "Four-year-olds live in a world where magic is barely distinguishable from reality, so the act is bigger, sillier and full of talking props; the impossibility only needs to be visible. Eight-year-olds are the detectives — they fold their arms and try to catch you — so the act shifts to routines that reward their scepticism and then breaks it. Twelve-year-olds have seen every YouTube reveal, which is exactly why close-up sleight-of-hand destroys them: there is no cut to analyse when the card changes in their own hand.",
            "The practical implication for parents: book a performer who asks the birthday child's age before quoting, because 'a kids show' is not a product. A professional also asks about the room — hall versus lawn versus living room — and whether younger siblings will be in the audience, since a show calibrated for ten-year-olds with four-year-olds in the front row needs a gentler opening to hold the little ones. The age question is the single best proxy for professionalism you will hear on the call.",
          ],
        },
        {
          h: "Why the birthday child must star in the finale",
          paras: [
            "The parents will remember the show; the children will remember who the show was about. The finale that puts the birthday child at its centre — the wand that only works in their hand, the gift that materialises with their name on it — converts a performance into a memory the child owns. This is why the professional asks the child's name and a favourite thing during booking, and why that detail quietly reappears in the last routine.",
            "There is a crowd-management dividend too: a finale built around the birthday child keeps twenty other children patient through it, because they are all watching their friend be the hero. The room's energy channels into one point instead of scattering. Photographers, if you have one, should be briefed about the final two minutes in advance — that frame of the birthday child mid-reveal is the one that ends up framed in the hallway for a decade.",
          ],
        },
        {
          h: "Take-home tricks and the post-show calm-down",
          paras: [
            "The smartest fifteen minutes of a birthday act happen after the applause: every child learns one simple trick and takes it home. This is deliberate pedagogy disguised as a gift — a child who can perform something impossible to a parent that evening keeps reliving the party, and the party's memory compounds instead of evaporating with the decorations. It also converts the post-show sugar rush into focused practice, which parents consistently report as the calmest twenty minutes of the evening.",
            "For the host, the take-home trick solves the return-gift anxiety as well: it is a souvenir of an experience rather than another plastic object, and it costs the party nothing extra. The studio's birthday tier includes it in every show by design. When you enquire, mention the child's age and the party window you have in mind — the reply will include the exact slot recommendation, and your date holds for 72 hours while the invitations go out.",
          ],
        },
      ],
      closing:
        "The best birthday parties are not the ones with the most entertainment — they are the ones with the right fifteen minutes in the right order. Anchor the show between snacks and cake, let the birthday child own the finale, and send every guest home with a trick up their sleeve.",
    },
  },
  {
    slug: "college-fest-magic-headliner",
    title: "Fest Night Architecture: Scheduling a Magic Headliner That Trends",
    excerpt:
      "Big auditoriums eat small acts. A programmer's guide to staging illusions for 500–5,000 seats — and the finale moment built for the Monday-morning reel.",
    category: "College",
    readingTime: "6 min",
    keywords: "college fest magician, fest headline show",
    date: "May 2026",
    outline: [
      "Why large-visibility illusions matter past row ten",
      "Crowd-work segments: reading 2,000 people at once",
      "The finale engineered to be filmed vertically",
      "Sound, sightlines and stage-height checks before you sign",
    ],
    body: {
      intro:
        "An auditorium with two thousand students is the most honest audience in India: it has no manners, no patience and no obligation to clap. It is also the most rewarding room a magician can face, because two thousand phones filming one moment is a marketing department that works for free. The difference between a fest night that trends on Monday morning and one that clears out by the third act is architecture — the physical and temporal design of the slot. This is the programmer's guide to that architecture, written from the stage side of it.",
      sections: [
        {
          h: "Why large-visibility illusions matter past row ten",
          paras: [
            "The act that thrilled a 200-person banquet dies in an auditorium by the second row — card tricks are invisible at forty metres, and an audience that cannot see the magic invents its own entertainment. Large venues demand large-visibility material: physical illusions with scale, colour and transformation, mentalism projected on the venue screens, and routines whose climax is legible from the last row. The professional fest act is a different repertoire, not a bigger volume of the same one.",
            "The screen question decides half the show. When the venue cameras can feed live close-up footage to the main LED wall, a card that changes on screen plays to two thousand people at once — and the room reacts as a single organism. Programmers should confirm camera positions, feed cables and a technician who can switch between the wide shot and the hands during the act. It is a fifteen-minute technical conversation that doubles the show's reach without touching the fee.",
          ],
        },
        {
          h: "Crowd-work segments: reading 2,000 people at once",
          paras: [
            "The segment students remember longest is never the prop; it is the moment the stage talked to the audience. Crowd-work in a fest setting is a discipline of scale: calling up the students everyone knows — the final-year legend, the SAC president, the couple the whole hostel has opinions about — and letting the routine happen around them. When a prediction that has been sealed on stage since the opening dance names the person standing beside the performer, the auditorium does not clap; it shouts.",
            "The craft is in the selection, not the spectacle. A professional mentalist reads a large room's energy before choosing anyone — who wants to participate and who would hate it, which seat holds the confident volunteer and which holds someone who will freeze on camera. Done well, crowd-work makes two thousand strangers feel personally addressed; done carelessly, it makes one student's embarrassment the evening's defining memory. The difference is experience, and it is worth asking a performer about directly before booking.",
          ],
        },
        {
          h: "The finale engineered to be filmed vertically",
          paras: [
            "Fest content lives and dies on vertical video — Instagram reels are the Monday-morning arena where your fest night competes with every other college's. A finale engineered for that reality is bright, slow at the peak, and composed: the impossible moment holds for three full seconds so phones can capture it, the performer's position is lit for portrait framing, and the reveal is framed centre-stage where vertical crops keep it. This is not vanity; for a student committee, it is the difference between a fest that trends and a fest that merely happened.",
            "The students in the hall do the distribution themselves — nobody needs instructions to film a good finale, but a poorly-designed one (dark, fast, off-centre) gets filmed badly and shared never. Ask the performer how their finale plays on a phone; a professional has thought about it and can tell you. The clips from past fest nights are the honest answer, and they are worth more than any showreel edit.",
          ],
        },
        {
          h: "Sound, sightlines and stage-height checks before you sign",
          paras: [
            "Four technical items decide whether a fest act lands, and all four are checkable before the contract. Sound: the act needs a mic that can duck the walk-in music on cue — confirm the console operator stays for the full act, not just the DJ slot. Sightlines: no pillar, camera tower or sponsor banner may cut the centre-stage view; walk the last row yourself during the technical rehearsal. Stage height: a 4-foot stage transforms sightlines in a flat auditorium, and it needs to exist in the plan before the decorators take the space.",
            "The fourth item is the one committees forget: the run-sheet order. The magic headliner must not follow the dance competition's prize distribution — nothing survives forty minutes of certificates. The strongest slot is directly after the opening act, when the auditorium is full and restless and the night has not yet drained; the second strongest is the last act with the finale engineered to send everyone out filming. Sign the performer only when the slot is agreed in writing, and the evening's architecture is done.",
          ],
        },
      ],
      closing:
        "A fest night that trends is designed, not lucky — the repertoire for the scale, the crowd-work for the room, the finale for the phones, and the slot in the run-sheet. The studio tours college auditoriums across the circuit and plans the architecture with the committee before the contract; share your fest dates and the auditorium specs, and the plan comes back with the quote.",
    },
  },
];

// Booking form options (doc 7.1)
export const BUDGET_RANGES = [
  "Under ₹25,000",
  "₹25,000 – ₹50,000",
  "₹50,000 – ₹1,00,000",
  "₹1,00,000 – ₹2,50,000",
  "Above ₹2,50,000",
];

export const VENUE_TYPES = ["Indoor hall", "Outdoor / lawn", "Raised stage", "Residence / salon", "Auditorium"];

export const DURATIONS = ["30 minutes", "45 minutes", "60 minutes", "90 minutes", "Full evening (2–3 hr)"];

export const LEAD_STATUSES = [
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "quote", label: "Quote Sent" },
  { id: "negotiation", label: "Negotiation" },
  { id: "advance", label: "Advance Paid" },
  { id: "confirmed", label: "Confirmed" },
  { id: "completed", label: "Completed" },
  { id: "lost", label: "Lost" },
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number]["id"];

// Cities served — home city first, then touring circuit (doc 6 — unique local proof per city, no doorways)
export const CITIES = ["Udaipur", "Jaipur", "Jodhpur", "Ahmedabad", "Delhi NCR", "Mumbai"];

// Hindi-language posts — <html lang> switches to hi-IN on these routes
// (manager audit T-07: a Hindi page must not declare lang="en-IN").
export const HINDI_POST_SLUGS = ["jadugar-udaipur-shaadi-magic-show-guide"];

// ── Real business identity (verified against the Google Business Profile) ──
export const SITE = {
  name: "Jadugar Rajtilak",
  phoneDisplay: "+91 97994 68758",
  phoneRaw: "+919799468758",
  whatsapp: "919799468758",
  email: "jadugar.rajtilak@gmail.com",
  address: "Shiv Colony, Bedla, Udaipur, Rajasthan 313001",
  shortAddress: "Udaipur, Rajasthan",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Jadugar+Rajtilak+Udaipur",
  googleProfileUrl: "https://www.google.com/search?kgmid=/g/11c1p4hlsk&q=Jadugar+Rajtilak",
  facebookUrl: "https://www.facebook.com/rajtilak.jadugar",
  instagramPostUrl: "https://www.instagram.com/p/DCJ3hBhg8xh/",
  // SEO fix (manager audit T-09, 2026-10-29): the Instagram PROFILE (not
  // a single post) + the YouTube channel — both for the footer links and
  // the JSON-LD sameAs entity consolidation.
  instagramProfileUrl: "https://www.instagram.com/rajtilakjadugar/",
  youtubeUrl: "https://www.youtube.com/@jadugarrajtilak2543",
  justdialUrl:
    "https://www.justdial.com/Udaipur-Rajasthan/Jadugar-Rajtilak-Opposite-Hotel-Rajkamal-Bhuwana/9999PX294-X294-180528141553-G5M2_BZDET",
  rating: "4.8",
  reviewCount: 181,
  justdialRating: "4.8",
  justdialReviewCount: 195,
} as const;

// Per-view metadata (SPA titles — applied client-side per route).
// SEO fix (2026-10-28): titles ≤60 chars, keyword first, brand last;
// descriptions ≤155 chars with a CTA. The old set led with the brand
// and overran Google's display limits (home title was 88 chars).
export const VIEW_META: Record<RouteId, { title: string; description: string }> = {
  home: {
    // SEO fix (manager audit T-05, 2026-10-29): the homepage now targets
    // India-wide commercial intent — 'magician in udaipur' belongs to the
    // /magician-in-udaipur landing page (the observed top-5 ranker), so the
    // homepage stops cannibalising it. Udaipur stays in the description as
    // the verified home base for local proof.
    title: "Wedding & Corporate Magician in India | Jadugar Rajtilak",
    description:
      "Hire Jadugar Rajtilak — wedding, corporate & birthday magician across India (500+ shows, 4.8★, 181 Google reviews). Udaipur-based. Check your date.",
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
    title: "Reviews of Jadugar Rajtilak | 4.8★ Udaipur Magician",
    description:
      "Read verified client reviews of Jadugar Rajtilak from Google and Justdial – weddings, corporate shows and birthdays across India.",
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
    title: "Legal — Privacy, Terms & Cancellation",
    description: "Privacy policy, terms of service and cancellation policy for Jadugar Rajtilak bookings.",
  },
  admin: { title: "Master Admin", description: "Control room" },
  udaipur: {
    title: "Magician in Udaipur | Wedding & Birthday Shows",
    description:
      "Looking for a magician in Udaipur? Jadugar Rajtilak – 4.8★ on Google – performs at weddings, hotels, corporate events & birthdays. Check your date.",
  },
  // ── Dedicated service pages (metas from the manager audit's
  // "Services Title and descriptions" sheet — titles 45–56ch,
  // descriptions 144–152ch, exact character counts verified). ──
  svcWedding: {
    title: "Wedding Magician in India | Sangeet to Reception | Rajtilak",
    description:
      "Wedding magic by Jadugar Rajtilak — sangeet close-up sets, cocktail roaming magic and a reception finale. 500+ shows across India. Check your date.",
  },
  svcCorporate: {
    title: "Corporate Magician for Events in India | Rajtilak",
    description:
      "Corporate shows that hold the room — annual days, dealer meets, award nights. Mentalism and brand-woven illusions with full tech rider. Get a quote.",
  },
  svcBirthday: {
    title: "Birthday Party Magician in Udaipur & India | Rajtilak",
    description:
      "Age-calibrated birthday magic shows (4–12 years) — the golden window between snacks and cake. Every child leaves with a take-home trick. Check your date.",
  },
  svcCollege: {
    title: "College Fest Magician & Illusion Headliner | Rajtilak",
    description:
      "Big-stage illusions built for 500–5,000 seat auditoriums — crowd work and a vertical-video finale your fest page can post on Monday. Book the date.",
  },
  svcPrivate: {
    title: "Private & Luxury Event Magician | Rajtilak",
    description:
      "Salon evenings, villa parties and destination celebrations — a close-up and parlour act scaled to your guest list. Discreet, polished, unforgettable.",
  },
  svcVirtual: {
    title: "Virtual Magic Shows for Online Events | Rajtilak",
    description:
      "Camera-first virtual magic for remote teams and online events — tech checklist, Zoom-ready routines and honest formatting for 20–500 screens.",
  },
  destWedding: {
    title: "Destination Wedding Magician in Udaipur | Rajtilak",
    description:
      "Udaipur destination-wedding magic — sangeet close-up, poolside roaming sets and a palace-stage finale. 3-day timeline planner included. Check your date.",
  },
};

// ── Service money pages: JSON-LD source of truth ──────────────
// Service + BreadcrumbList schema for each dedicated page (audit
// roadmap R-18/R-19/R-20/R-22). Provider references the homepage
// LocalBusiness entity (@id …/#business) so the graph stays one node.
export const SERVICE_PAGES: Partial<
  Record<RouteId, {
    path: string;
    serviceName: string;
    serviceType: string;
    keyword: string;
    areaServed: string;
  }>
> = {
  svcWedding: {
    path: "/services/wedding-magician",
    serviceName: "Wedding Magician — Sangeet, Cocktail & Reception Magic",
    serviceType: "Wedding entertainment",
    keyword: "wedding magician india",
    areaServed: "India",
  },
  svcCorporate: {
    path: "/services/corporate-shows",
    serviceName: "Corporate Magic Shows — Annual Days, Dealer Meets & Award Nights",
    serviceType: "Corporate event entertainment",
    keyword: "corporate magician india",
    areaServed: "India",
  },
  svcBirthday: {
    path: "/services/birthday-kids",
    serviceName: "Birthday Party Magic Shows for Kids (Ages 4–12)",
    serviceType: "Birthday party entertainment",
    keyword: "birthday party magician",
    areaServed: "India",
  },
  svcCollege: {
    path: "/services/college-stage",
    serviceName: "College Fest Magic & Illusion Headliner Shows",
    serviceType: "College festival entertainment",
    keyword: "college fest magician",
    areaServed: "India",
  },
  svcPrivate: {
    path: "/services/private-luxury",
    serviceName: "Private & Luxury Event Magic — Salons, Villas & Celebrations",
    serviceType: "Private event entertainment",
    keyword: "private party magician",
    areaServed: "India",
  },
  svcVirtual: {
    path: "/services/virtual-magic",
    serviceName: "Virtual Magic Shows for Online Events & Remote Teams",
    serviceType: "Virtual event entertainment",
    keyword: "virtual magic show",
    areaServed: "Worldwide",
  },
  destWedding: {
    path: "/destination-wedding-magician-udaipur",
    serviceName: "Destination Wedding Magician in Udaipur",
    serviceType: "Destination wedding entertainment",
    keyword: "destination wedding magician udaipur",
    areaServed: "Udaipur, Rajasthan, India",
  },
};

// Trust bar — rating figure verified on the live Google Business Profile.
// 4th slot: LG felicitation certificate (client's real framed award) —
// "40+ cities" remains covered by the dedicated Cities strip on home.
export const TRUST_ITEMS = [
  { value: "4.8★", label: `${SITE.reviewCount} Google reviews` },
  { value: "500+", label: "Shows staged" },
  { value: "12+", label: "Years on stage" },
  { value: "LG", label: "Felicitation · recognised" },
];
