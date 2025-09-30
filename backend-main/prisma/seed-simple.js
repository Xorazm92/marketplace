
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.currency.create({ data: { name: 'Uzbek Som', code: 'UZS', symbol: 'som' } });
  await prisma.brand.create({ data: { name: 'Lego', logo: 'lego.png' } });
  await prisma.category.create({ data: { name: 'Oyinchoqlar', slug: 'oyinchoqlar' } });
  console.log('✅ Data seeded');
}

main().catch(console.error).finally(() => prisma.());

