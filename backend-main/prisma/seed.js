const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Currency
  const currency = await prisma.currency.create({
    data: {
      name: 'Uzbek Som',
      code: 'UZS',
      symbol: "so'm"
    }
  });

  // Categories
  const categories = [
    { name: 'Oyinchoqlar', slug: 'oyinchoqlar', description: 'Bolalar uchun oyinchoqlar' },
    { name: 'Kiyim-kechak', slug: 'kiyim-kechak', description: 'Bolalar kiyimlari' },
    { name: 'Kitoblar', slug: 'kitoblar', description: 'Bolalar kitoblari' },
    { name: 'Sport', slug: 'sport', description: 'Sport anjomlari' },
    { name: 'Maktab', slug: 'maktab', description: 'Maklab mahsulotlari' },
    { name: 'Chaqaloq', slug: 'chaqaloq', description: 'Chaqaloq mahsulotlari' }
  ];

  for (const cat of categories) {
    await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug
      }
    });
  }

  // Brands
  const brands = [
    { name: 'Lego', logo: 'lego-logo.png' },
    { name: 'Barbie', logo: 'barbie-logo.png' },
    { name: 'Hot Wheels', logo: 'hotwheels-logo.png' },
    { name: 'Nerf', logo: 'nerf-logo.png' },
    { name: 'Fisher-Price', logo: 'fisher-price-logo.png' }
  ];

  for (const brand of brands) {
    await prisma.brand.create({
      data: brand
    });
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
