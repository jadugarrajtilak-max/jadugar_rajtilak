// Local-dev seed: realistic leads, blog posts (published + drafts),
// backlink pipeline, agent runs — so every admin panel + page can be
// visually verified against the sqlite dev DB.
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

function daysFromNow(n) {
  return new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
}

async function main() {
  // wipe dev data
  await db.lead.deleteMany();
  await db.blogPost.deleteMany();
  await db.backlinkTask.deleteMany();
  await db.agentRun.deleteMany();
  await db.contactMessage.deleteMany();
  await db.availabilityDay.deleteMany();

  // ── leads across the pipeline ──
  const leads = [
    ["Aarav Sharma", "9829012345", "aarav.sharma@gmail.com", "wedding", daysFromNow(21), "Udaipur", 350, "₹75k–1L", "negotiation", "google", "Sangeet night slot after 9pm, wants couple-specific routine."],
    ["Priya Mehta", "9876543210", "priya.mehta@outlook.com", "birthday", daysFromNow(9), "Jaipur", 60, "₹25k–50k", "new", "instagram", "Daughter's 7th birthday — unicorn theme, 45 kids."],
    ["Rohan Kapoor", "9911223344", "rohan.kapoor@company.com", "corporate", daysFromNow(34), "Gurugram", 800, "₹1L–2L", "advance", "linkedin", "Annual day, needs GST invoice + brand-scripted act."],
    ["Sneha Rathore", "9414098765", "sneha.r@example.com", "wedding", daysFromNow(48), "Jodhpur", 500, "₹1L–2L", "quote", "direct", "Destination wedding at a heritage venue."],
    ["Vikram Singh", "9213456789", "vikram@college.edu", "college", daysFromNow(15), "Kota", 1200, "₹50k–75k", "contacted", "google", "College fest headline slot, 2000-seat auditorium."],
    ["Ananya Iyer", "9000000001", "ananya.iyer@gmail.com", "private", daysFromNow(27), "Mumbai", 40, "₹1L–2L", "confirmed", "referral", "Salon evening for 30 guests, close-up only."],
    ["Kabir Joshi", "9000000002", "kabir.j@gmail.com", "birthday", daysFromNow(3), "Udaipur", 80, "₹25k–50k", "confirmed", "justdial", "60th birthday — family roast-style mentalism wanted."],
    ["Meera Chauhan", "9000000003", "meera.c@gmail.com", "virtual", daysFromNow(6), "Bengaluru", 90, "₹25k–50k", "completed", "blog", "Remote team engagement on Zoom."],
    ["Dev Malhotra", "9000000004", "dev.m@gmail.com", "corporate", daysFromNow(60), "Pune", 300, "₹75k–1L", "lost", "google", "Went with a cheaper local option."],
    ["Ishani Bhatt", "9000000005", "ishani.b@gmail.com", "wedding", daysFromNow(75), "Ahmedabad", 400, "₹75k–1L", "new", "instagram", "Mehendi + sangeet both days, roaming magic."],
  ];
  for (const [name, phone, email, eventType, eventDate, city, guests, budget, status, utmSource, notes] of leads) {
    await db.lead.create({
      data: { name, phone, email, eventType, eventDate, city, guests, budget, status, utmSource, notes, consent: true },
    });
  }

  // ── blog posts: a few published + 3 drafts awaiting review ──
  const mkPost = (slug, title, status, category, createdDaysAgo) => ({
    slug,
    title,
    metaTitle: title.slice(0, 65),
    metaDescription: title.slice(0, 150),
    keywords: "magician, udaipur, booking",
    excerpt: "A practical guide from 500+ shows of stage experience.",
    category,
    featuredImage: "/images/hero-portrait-v2.jpg",
    featuredImageAlt: "Jadugar Rajtilak on stage",
    intro: "Every booking question answered straight from the stage.",
    sections: [
      { h: "What works", paras: ["Close-up magic moves between guest groups.", "A stage act anchors the evening."] },
      { h: "What it costs", paras: ["Written quote in 24 hours — no invented numbers."] },
    ],
    closing: "Check your date on the booking page.",
    readingTime: "6 min read",
    status,
    featured: false,
    publishedAt: new Date(Date.now() - createdDaysAgo * 86400000),
    createdAt: new Date(Date.now() - createdDaysAgo * 86400000),
  });
  await db.blogPost.create({ data: mkPost("magician-in-udaipur-guide", "Magician in Udaipur: The Complete 2026 Booking Guide", "published", "Guides", 40) });
  await db.blogPost.create({ data: mkPost("wedding-magic-sangeet", "10 Close-Up Magic Moments That Stop a Sangeet Crowd", "published", "Weddings", 30) });
  await db.blogPost.create({ data: mkPost("corporate-magic-annual-day", "Corporate Annual Day Magic Show: The 45-Minute Format", "published", "Corporate", 20) });
  await db.blogPost.create({ data: mkPost("draft-udaipur-winter-weddings", "Winter Wedding Season 2026-27: Entertainment Trends from Udaipur", "draft", "Weddings", 2) });
  await db.blogPost.create({ data: mkPost("draft-kids-birthday-magic", "Kids Birthday Magic: Age-by-Age What Works (4-14 years)", "draft", "Guides", 1) });
  await db.blogPost.create({ data: mkPost("draft-mentalist-explained", "Mentalism Explained: What a Mentalist Actually Does On Stage", "draft", "Guides", 0) });

  // ── backlink pipeline mirroring the live one ──
  const bl = [
    ["Justdial", "Directory (exists)", "Update photos, services, link; reply to reviews", 89, "W1", "drafted", '{"to":"listings@justdial.com","subject":"Update Jadugar Rajtilak listing","body":"Namaste, I would like to refresh our listing photos and services."}'],
    ["Venuelook", "Marketplace (exists)", "Refresh portfolio + get 5 client reviews", 35, "W1", "drafted", '{"to":"partners@venuelook.com","subject":"Portfolio refresh request","body":"Hello, requesting a portfolio refresh for our artist profile."}'],
    ["'Top 10 magicians India' listicles", "Listicle outreach ×3", "Contact authors with credentials pack", 40, "W11", "drafted", '{"to":"author@example.com","subject":"2nd-place IBM magician for your list","body":"Hi, your Top 10 magicians list could include an IBM 2021 2nd-place winner."}'],
    ["Sulekha", "Directory (new)", "Full profile with photos + pricing + website link", 86, "W2", "planned", ""],
    ["IndiaMART", "Directory (new)", "Business profile under event services", 89, "W2", "planned", ""],
    ["TradeIndia", "Directory (new)", "Verified supplier profile", 78, "W3", "planned", ""],
    ["YellowPages India", "Directory (new)", "Local business listing with link", 70, "W3", "planned", ""],
    ["StarClinch", "Event marketplace (new)", "Artist profile", 52, "W4", "planned", ""],
    ["WedMeGood", "Wedding marketplace (new)", "Vendor profile under entertainment", 57, "W4", "planned", ""],
    ["Hire4Event", "Event marketplace (new)", "Artist page with video + pricing", 44, "W5", "planned", ""],
    ["EventJini", "Event platform (new)", "Performer listing", 40, "W5", "planned", ""],
    ["AliveExperiences", "Booking agency (new)", "Verified artist listing", 30, "W6", "planned", ""],
    ["GetReal.buzz", "Artist platform (new)", "Performer profile", 35, "W6", "planned", ""],
    ["Guest posts (wedding/event blogs)", "Outreach ×5", "Personalized pitches", 30, "W5-8", "planned", ""],
    ["Local press (Bhaskar/Patrika Udaipur)", "Press ×1", "Press note: IBM international honour", 80, "W7", "planned", ""],
  ];
  for (const [source, type, action, estDa, week, status, outreach] of bl) {
    await db.backlinkTask.create({ data: { source, type, action, estDa, week, status, outreach, notes: "" } });
  }

  // ── agent runs — mixed history incl. the old blog "error" state ──
  const now = Date.now();
  const runs = [
    ["seo", "success", "scheduler", "SEO audit: 31 passed, 0 failed, 2 warnings across 33 checks.", 1],
    ["bugfix", "success", "scheduler", "Health scan: 14 passed, 0 failed. Site healthy — no action needed.", 1],
    ["blog", "success", "scheduler", "Draft ready: \"Winter Wedding Season 2026-27\" — saved for approval.", 2],
    ["rank", "success", "manual", "Backlink pipeline: 15 tracked sources · 0 live · 3 drafted · 12 planned.", 4],
    ["blog", "error", "scheduler", "LLM not reachable from this runtime — set ZAI_BASE_URL + ZAI_API_KEY.", 3],
  ];
  for (const [agentId, status, trigger, summary, daysAgo] of runs) {
    await db.agentRun.create({
      data: {
        agentId, status, trigger, summary,
        startedAt: new Date(now - daysAgo * 86400000),
        finishedAt: new Date(now - daysAgo * 86400000 + 120000),
        output: JSON.stringify({ findings: [], details: null }),
      },
    });
  }

  // ── contact messages + availability ──
  await db.contactMessage.create({ data: { name: "Nikhil Verma", email: "nikhil.v@gmail.com", message: "Do you perform in Delhi in December? 200 guests, corporate dinner." } });
  await db.contactMessage.create({ data: { name: "Ritika Jain", email: "ritika.j@gmail.com", message: "Looking for a magician for my daughter's 10th birthday in Udaipur." } });
  await db.availabilityDay.createMany({
    data: [
      { date: daysFromNow(9), status: "booked" },
      { date: daysFromNow(15), status: "blocked", note: "Travel day — Jaipur" },
      { date: daysFromNow(21), status: "open" },
      { date: daysFromNow(34), status: "booked" },
    ],
  });

  const counts = {
    leads: await db.lead.count(),
    posts: await db.blogPost.count(),
    drafts: await db.blogPost.count({ where: { status: "draft" } }),
    backlinks: await db.backlinkTask.count(),
    runs: await db.agentRun.count(),
    messages: await db.contactMessage.count(),
  };
  console.log("Seed complete:", JSON.stringify(counts));
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
