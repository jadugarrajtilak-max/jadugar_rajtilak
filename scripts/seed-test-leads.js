// Seed a few realistic test leads into jr_local_test for CRM verification
const { Client } = require("pg");

const D = "postgresql://neondb_owner:npg_jW9iZx7wGAQp@ep-super-pine-b43ybe3r.c-6.us-east-2.aws.neon.tech/jr_local_test?sslmode=require";

function daysFromNow(n) {
  const d = new Date(Date.now() + n * 86400000);
  return d.toISOString().slice(0, 10);
}

const leads = [
  ["Aarav Sharma", "9876543210", "aarav.sharma@example.com", "wedding", daysFromNow(45), "Udaipur", 400, "₹75k – ₹1.5L", "new", "instagram", "reel-campaign"],
  ["Priya Mehta", "9812345678", "priya.mehta@example.com", "birthday", daysFromNow(9), "Jaipur", 80, "₹25k – ₹50k", "contacted", "google", null],
  ["Vikram Singh Rathore", "9900112233", "vikram@example.com", "corporate", daysFromNow(21), "Delhi NCR", 600, "above ₹1.5L", "quote", "direct", null],
  ["Neha Gupta", "9765432109", "neha.g@example.com", "college", daysFromNow(60), "Jodhpur", 1200, "₹75k – ₹1.5L", "negotiation", "instagram", "fest-2026"],
  ["Rohan Joshi", "9870011223", "rohan.j@example.com", "private", daysFromNow(3), "Udaipur", 50, "₹25k – ₹50k", "advance", "whatsapp", null],
  ["Kavita Bhatia", "9845067812", "kavita.b@example.com", "wedding", daysFromNow(120), "Mumbai", 500, "above ₹1.5L", "confirmed", "referral", null],
  ["Suresh Agarwal", "9988776655", "suresh.a@example.com", "corporate", daysFromNow(-15), "Ahmedabad", 300, "₹75k – ₹1.5L", "completed", "direct", null],
  ["Anita Verma", "9700998877", "anita.v@example.com", "birthday", daysFromNow(30), "Jaipur", 60, "below ₹25k", "lost", "google", null],
];

(async () => {
  const c = new Client({ connectionString: D });
  await c.connect();
  for (const l of leads) {
    await c.query(
      `INSERT INTO "Lead" (id, name, phone, email, "eventType", "eventDate", city, guests, budget, "venueType", duration, notes, consent, status, "utmSource", "utmMedium", "utmCampaign", "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1,$2,$3,$4,$5,$6,$7,$8,'indoor','45-60 min',$9,true,$10,$11,$12,$13, now() - ($14 || ' days')::interval, now())`,
      [l[0], l[1], l[2], l[3], l[4], l[5], l[6], l[7], `Please keep the finale a surprise for my daughter.`, l[8], l[9], l[10], l[11], Math.floor(Math.random() * 20)]
    );
  }
  const { rows } = await c.query('SELECT COUNT(*)::int AS n FROM "Lead"');
  console.log("test leads inserted:", rows[0].n);
  await c.end();
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
