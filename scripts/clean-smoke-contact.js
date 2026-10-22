// Clean the local smoke-test contact message from Neon (keep production clean)
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

(async () => {
  const del = await db.contactMessage.deleteMany({
    where: { email: "qa@test.local" },
  });
  console.log("deleted qa@test.local rows:", del.count);
  const total = await db.contactMessage.count();
  console.log("remaining contact messages:", total);
  await db.$disconnect();
})().catch((e) => {
  console.error("ERROR", e.message);
  process.exit(1);
});
