// Clean QA test data so production starts with only real data.
// The end-to-end QA script proved the pipeline works; this removes
// the artifacts it created (test lead, test contact message, test
// media asset) and resets the QA alt-text override.
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const lead = await db.lead.deleteMany({
    where: { email: { in: ["qa-test@jadugarrayjtilak.in", "prod-qa@jadugarrayjtilak.in"] } },
  });
  const msg = await db.contactMessage.deleteMany({
    where: { email: { in: ["sender@qa.test", "prod@qa.test"] } },
  });
  const media = await db.mediaAsset.deleteMany({});
  const asset = await db.siteAsset.deleteMany({ where: { key: "home.hero.portrait" } });

  console.log(
    `Cleaned: leads=${lead.count}, messages=${msg.count}, media=${media.count}, assetOverrides=${asset.count}`
  );

  const remaining = await db.lead.count();
  console.log(`Leads remaining (should be 0 — real leads only via live form): ${remaining}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
