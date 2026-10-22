// Verify + cleanup the QA dispatch subscription record
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

(async () => {
  const found = await db.contactMessage.findMany({
    where: { email: "qa-dispatch@test.local" },
  });
  console.log("QA records found:", found.length);
  for (const m of found) {
    console.log("  ->", { id: m.id, name: m.name, message: m.message.slice(0, 80) });
  }
  if (process.argv[2] === "--clean") {
    const del = await db.contactMessage.deleteMany({
      where: { email: "qa-dispatch@test.local" },
    });
    console.log("deleted:", del.count);
  }
  await db.$disconnect();
})().catch((e) => {
  console.error("ERROR", e.message);
  process.exit(1);
});
