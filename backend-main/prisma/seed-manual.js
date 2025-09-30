
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const currency = await prisma.currency.create({ data: { name: 'Uzbek Som', code: 'UZS', symbol: 'som' } });
  const brand = await prisma.brand.create({ data: { name: 'Lego', logo: 'lego.png' } });
  const category = await prisma.category.create({ data: { name: 'Oyinchoqlar', slug: 'oyinchoqlar' } });
  console.log('✅ Data seeded:', { currency: currency.id, brand: brand.id, category: category.id });
}

main().catch(console.error).finally(() => prisma.());

