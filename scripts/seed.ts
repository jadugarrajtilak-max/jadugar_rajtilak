import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const pad = (n: number) => String(n).padStart(2, "0");
const dayOffset = (offset: number) => {
  const x = new Date();
  x.setDate(x.getDate() + offset);
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
};
const daysAgo = (days: number) => {
  const x = new Date();
  x.setDate(x.getDate() - days);
  x.setHours(10, 30, 0, 0);
  return x;
};

type SeedLead = {
  name: string;
  phone: string;
  email: string;
  eventType: string;
  eventDate: string;
  city: string;
  guests: number;
  budget: string;
  venueType: string;
  duration: string;
  notes: string;
  status: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  ago: number;
};

const LEADS: SeedLead[] = [
  { name: "Aarav Mehta", phone: "9820012345", email: "aarav.mehta@example.in", eventType: "wedding", eventDate: dayOffset(38), city: "Udaipur", guests: 420, budget: "₹1,00,000 – ₹2,50,000", venueType: "Outdoor / lawn", duration: "Full evening (2–3 hr)", notes: "Sangeet + reception both days. Needs coordination with the DJ.", status: "new", utmSource: "google-organic", utmMedium: "organic", utmCampaign: null, ago: 0 },
  { name: "Priya Sharma", phone: "9811122334", email: "priya.s@example.in", eventType: "corporate", eventDate: dayOffset(21), city: "Mumbai", guests: 350, budget: "₹50,000 – ₹1,00,000", venueType: "Auditorium", duration: "60 minutes", notes: "Annual day opener. Brand routine around product launch.", status: "contacted", utmSource: "linkedin", utmMedium: "referral", utmCampaign: "annual-day", ago: 1 },
  { name: "Rohan Kulkarni", phone: "9762233445", email: "rohan.k@example.in", eventType: "birthday", eventDate: dayOffset(9), city: "Pune", guests: 40, budget: "Under ₹25,000", venueType: "Residence / salon", duration: "45 minutes", notes: "Daughter turns 7. Loves colour magic.", status: "quote", utmSource: "instagram", utmMedium: "social", utmCampaign: "reels-boost", ago: 2 },
  { name: "Sneha Reddy", phone: "9948877665", email: "sneha.reddy@example.in", eventType: "college", eventDate: dayOffset(30), city: "Hyderabad", guests: 1800, budget: "Above ₹2,50,000", venueType: "Raised stage", duration: "90 minutes", notes: "Fest headline night. Needs large-visibility illusions.", status: "negotiation", utmSource: "google-organic", utmMedium: "organic", utmCampaign: null, ago: 3 },
  { name: "Vikram Singh", phone: "9871234567", email: "vikram.singh@example.in", eventType: "wedding", eventDate: dayOffset(14), city: "Jaipur", guests: 600, budget: "₹1,00,000 – ₹2,50,000", venueType: "Indoor hall", duration: "Full evening (2–3 hr)", notes: "Reception finale. Family-friendly set requested.", status: "advance", utmSource: "wedding-portal", utmMedium: "referral", utmCampaign: null, ago: 5 },
  { name: "Ananya Iyer", phone: "9900112233", email: "ananya.iyer@example.in", eventType: "private", eventDate: dayOffset(7), city: "Bengaluru", guests: 60, budget: "₹50,000 – ₹1,00,000", venueType: "Residence / salon", duration: "90 minutes", notes: "Anniversary soiree. Discreet arrival requested.", status: "confirmed", utmSource: "whatsapp", utmMedium: "chat", utmCampaign: null, ago: 7 },
  { name: "Karan Malhotra", phone: "9812345678", email: "karan.m@example.in", eventType: "corporate", eventDate: dayOffset(-12), city: "Delhi", guests: 250, budget: "₹50,000 – ₹1,00,000", venueType: "Indoor hall", duration: "60 minutes", notes: "Dealer meet. GST invoice required.", status: "completed", utmSource: "google-organic", utmMedium: "organic", utmCampaign: null, ago: 20 },
  { name: "Meera Joshi", phone: "9822334455", email: "meera.j@example.in", eventType: "virtual", eventDate: dayOffset(-5), city: "Remote", guests: 120, budget: "Under ₹25,000", venueType: "Residence / salon", duration: "30 minutes", notes: "Remote team celebration, Zoom webinar format.", status: "completed", utmSource: "direct", utmMedium: null, utmCampaign: null, ago: 12 },
  { name: "Aditya Rao", phone: "9966554433", email: "aditya.rao@example.in", eventType: "birthday", eventDate: dayOffset(5), city: "Ahmedabad", guests: 30, budget: "Under ₹25,000", venueType: "Residence / salon", duration: "45 minutes", notes: "Twin boys turning 6 — two birthday stars!", status: "new", utmSource: "instagram", utmMedium: "social", utmCampaign: "stories", ago: 1 },
  { name: "Divya Nair", phone: "9845566778", email: "divya.nair@example.in", eventType: "wedding", eventDate: dayOffset(45), city: "Kochi", guests: 300, budget: "₹25,000 – ₹50,000", venueType: "Outdoor / lawn", duration: "60 minutes", notes: "Destination wedding, checking travel quote.", status: "contacted", utmSource: "google-organic", utmMedium: "organic", utmCampaign: null, ago: 4 },
  { name: "Farhan Khan", phone: "9890011223", email: "farhan.k@example.in", eventType: "college", eventDate: dayOffset(18), city: "Lucknow", guests: 900, budget: "₹50,000 – ₹1,00,000", venueType: "Auditorium", duration: "60 minutes", notes: "Freshers' welcome. Budget under committee review.", status: "quote", utmSource: "meta-ads", utmMedium: "cpc", utmCampaign: "college-fest", ago: 6 },
  { name: "Ritu Agarwal", phone: "9873456789", email: "ritu.a@example.in", eventType: "corporate", eventDate: dayOffset(11), city: "Gurugram", guests: 150, budget: "₹25,000 – ₹50,000", venueType: "Indoor hall", duration: "45 minutes", notes: "Town hall closer act.", status: "lost", utmSource: "direct", utmMedium: null, utmCampaign: null, ago: 9 },
  { name: "Nikhil Verma", phone: "9812765432", email: "nikhil.v@example.in", eventType: "private", eventDate: dayOffset(26), city: "Mumbai", guests: 80, budget: "₹1,00,000 – ₹2,50,000", venueType: "Residence / salon", duration: "90 minutes", notes: "Yacht evening — salon format.", status: "new", utmSource: "referral", utmMedium: "word-of-mouth", utmCampaign: null, ago: 2 },
  { name: "Isha Kapoor", phone: "9899887766", email: "isha.kapoor@example.in", eventType: "wedding", eventDate: dayOffset(60), city: "Jodhpur", guests: 500, budget: "Above ₹2,50,000", venueType: "Outdoor / lawn", duration: "Full evening (2–3 hr)", notes: "Palace wedding, full Grand production interest.", status: "negotiation", utmSource: "wedding-portal", utmMedium: "referral", utmCampaign: null, ago: 8 },
];

const AVAILABILITY: { date: string; status: string; note: string }[] = [
  { date: dayOffset(7), status: "booked", note: "Anniversary soiree (confirmed)" },
  { date: dayOffset(14), status: "booked", note: "Jaipur reception (advance paid)" },
  { date: dayOffset(3), status: "blocked", note: "Travel day" },
  { date: dayOffset(10), status: "blocked", note: "Rest day" },
  { date: dayOffset(21), status: "open", note: "" },
];

async function main() {
  await db.lead.deleteMany();
  await db.availabilityDay.deleteMany();

  for (const l of LEADS) {
    const { ago, ...rest } = l;
    await db.lead.create({
      data: {
        ...rest,
        consent: true,
        landingPage: "/#/booking",
        referrer: "https://www.google.com/",
        createdAt: daysAgo(ago),
        updatedAt: daysAgo(ago),
      },
    });
  }

  for (const a of AVAILABILITY) {
    await db.availabilityDay.create({
      data: { date: a.date, status: a.status, note: a.note || null },
    });
  }

  console.log(`Seeded ${LEADS.length} leads and ${AVAILABILITY.length} availability overrides.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
