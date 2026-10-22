// Seed the Neon production database with ONLY real operational data.
// Per client request: NO fake/demo leads in production — the Leads CRM
// starts empty and fills only through the live booking form.
// Availability rows are the calendar's operational defaults.
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const pad = (n: number) => String(n).padStart(2, "0");
const dayOffset = (offset: number) => {
  const x = new Date();
  x.setDate(x.getDate() + offset);
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
};

// A few sensible blocked/open days to make the booking calendar useful
// from day one. These are operational entries, not demo leads.
const AVAILABILITY: { date: string; status: string; note: string }[] = [
  { date: dayOffset(3), status: "blocked", note: "Travel day" },
  { date: dayOffset(10), status: "blocked", note: "Rest day" },
];

async function main() {
  const leadCount = await db.lead.count();
  if (leadCount > 0) {
    console.log(`Leads table already has ${leadCount} rows — leaving untouched.`);
  } else {
    console.log("Leads table empty — production starts with zero (real leads only, via live form).");
  }

  for (const a of AVAILABILITY) {
    await db.availabilityDay.upsert({
      where: { date: a.date },
      update: {},
      create: { date: a.date, status: a.status, note: a.note },
    });
  }
  console.log(`Availability seeded: ${AVAILABILITY.length} operational overrides.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
