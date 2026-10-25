// Upsert the Google AdSense publisher ID into SiteText so it is
// readable/editable from Master Admin → Settings and rendered site-wide
// as <meta name="google-adsense-account">. Safe to re-run (idempotent).
//
// Usage:
//   Local dev : DATABASE_URL="file:..." node scripts/seed-adsense.cjs
//   Production: DATABASE_URL="postgres..." DIRECT_DATABASE_URL="postgres..." \
//               node scripts/seed-adsense.cjs
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

const ADSENSE_KEY = "seo.adsense.accountId";
const ADSENSE_VALUE = "ca-pub-8152770887372804";

async function main() {
  const existing = await db.siteText.findUnique({ where: { key: ADSENSE_KEY } });
  if (existing && existing.value === ADSENSE_VALUE) {
    console.log("already set:", ADSENSE_KEY, "=", existing.value);
    return;
  }
  const row = await db.siteText.upsert({
    where: { key: ADSENSE_KEY },
    create: { key: ADSENSE_KEY, value: ADSENSE_VALUE },
    update: { value: ADSENSE_VALUE },
  });
  console.log("upserted:", row.key, "=", row.value, "(updatedAt " + row.updatedAt.toISOString() + ")");
}

main()
  .catch((e) => {
    console.error("seed failed:", e.message);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
