import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
async function main() {
  const rows = await db.siteText.findMany({ where: { key: { startsWith: "home.hero." } }, select: { key: true, value: true } });
  if (rows.length === 0) {
    console.log('NO home.hero.* rows in DB — code defaults apply');
  } else {
    rows.forEach(r => console.log(r.key, '=', JSON.stringify(r.value)));
  }
}
main().finally(() => db.$disconnect());
