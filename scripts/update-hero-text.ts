import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

// Reference-style hero copy (jadugarshivkumar.com style) for Raj Tilak
const updates: Record<string, string> = {
  "home.hero.eyebrow": "India's Most Popular",
  "home.hero.h1a": "JADUGAR",
  "home.hero.h1b": "RAJ TILAK",
  "home.hero.sub": "Now In Your City",
  "home.hero.ctaPrimary": "Book Your Show Now",
};

async function main() {
  for (const [key, value] of Object.entries(updates)) {
    const row = await db.siteText.update({
      where: { key },
      data: { value },
      select: { key: true, value: true },
    }).catch(async (e) => {
      console.log("update miss:", key, e.message?.slice(0, 60));
      return null;
    });
    if (row) console.log("updated:", row.key, "=", row.value);
  }
  // verify
  const rows = await db.siteText.findMany({ where: { key: { startsWith: "home.hero." } }, select: { key: true, value: true } });
  console.log("--- FINAL ---");
  rows.forEach(r => console.log(r.key, "=", JSON.stringify(r.value.slice(0, 60))));
}
main().finally(() => db.$disconnect());
