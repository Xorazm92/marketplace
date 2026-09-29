// Ma'lumotnomalarni to'ldiradi. Idempotent: qayta ishga tushirish nusxa yaratmaydi.
//   npm run seed                 — hududlar, toifalar, valyuta
//   SEED_DEMO=true npm run seed  — qo'shimcha demo mahsulotlar (faqat dev/staging)
//
// Admin bu yerda yaratilmaydi: ilgari seed ma'lum parolli admin qo'shardi.
// Birinchi super admin: create-admin.js.
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const REGIONS: Record<string, string[]> = {
  'Toshkent shahri': [
    'Bektemir', 'Chilonzor', 'Mirobod', "Mirzo Ulug'bek", 'Olmazor', 'Sergeli',
    'Shayxontohur', 'Uchtepa', 'Yakkasaroy', 'Yangihayot', 'Yashnobod', 'Yunusobod',
  ],
  'Toshkent viloyati': [],
  'Andijon viloyati': [],
  'Buxoro viloyati': [],
  "Farg'ona viloyati": [],
  'Jizzax viloyati': [],
  'Xorazm viloyati': [],
  'Namangan viloyati': [],
  'Navoiy viloyati': [],
  'Qashqadaryo viloyati': [],
  "Qoraqalpog'iston Respublikasi": [],
  'Samarqand viloyati': [],
  'Sirdaryo viloyati': [],
  'Surxondaryo viloyati': [],
};

const CATEGORIES = [
  { slug: 'oyinchoqlar', name: "O'yinchoqlar", description: "Har yoshdagi bolalar uchun o'yinchoqlar" },
  { slug: 'talimiy', name: "Ta'limiy o'yinlar", description: "Mantiq, hisob va til o'rgatuvchi o'yinlar" },
  { slug: 'konstruktorlar', name: 'Konstruktorlar', description: "Yig'iladigan to'plamlar" },
  { slug: 'kitoblar', name: 'Kitoblar', description: 'Bolalar adabiyoti va rasmli kitoblar' },
  { slug: 'kiyim', name: 'Kiyim-kechak', description: 'Chaqaloq va bolalar kiyimlari' },
  { slug: 'chaqaloqlar', name: 'Chaqaloqlar uchun', description: 'Parvarish va gigiyena mahsulotlari' },
  { slug: 'sport', name: "Sport va faol o'yin", description: "Velosiped, to'p va tashqi o'yinlar" },
  { slug: 'ijodkorlik', name: 'Ijodkorlik', description: "Rasm, plastilin va qo'l mehnati" },
];

const DEMO_PRODUCTS = [
  { title: "Yog'och kubiklar to'plami (30 dona)", category: 'oyinchoqlar', price: 89000, original: 110000, stock: 25, age: [12, 48] },
  { title: 'Magnitli harflar va raqamlar', category: 'talimiy', price: 65000, stock: 40, age: [36, 84] },
  { title: 'Konstruktor "Shahar" 250 detal', category: 'konstruktorlar', price: 245000, original: 290000, stock: 8, age: [60, 144] },
  { title: 'Rasmli ertaklar kitobi', category: 'kitoblar', price: 45000, stock: 60, age: [24, 96] },
  { title: 'Chaqaloq kombinezoni (paxta)', category: 'kiyim', price: 120000, stock: 15, age: [0, 12] },
  { title: 'Plastilin 12 rang', category: 'ijodkorlik', price: 28000, stock: 100, age: [36, 120] },
];

async function main() {
  for (const [regionName, districts] of Object.entries(REGIONS)) {
    const region =
      (await prisma.region.findFirst({ where: { name: regionName } })) ??
      (await prisma.region.create({ data: { name: regionName } }));
    for (const districtName of districts) {
      const exists = await prisma.district.findFirst({ where: { name: districtName, region_id: region.id } });
      if (!exists) await prisma.district.create({ data: { name: districtName, region_id: region.id } });
    }
  }

  for (const [index, category] of CATEGORIES.entries()) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: { ...category, sort_order: index },
    });
  }

  const currency = await prisma.currency.upsert({
    where: { code: 'UZS' },
    update: {},
    create: { code: 'UZS', name: "O'zbek so'mi", symbol: "so'm" },
  });

  if (process.env.SEED_DEMO === 'true') {
    if (process.env.NODE_ENV === 'production') throw new Error('Demo mahsulotlar prodga qo\'shilmaydi');
    for (const [index, demo] of DEMO_PRODUCTS.entries()) {
      const slug = `demo-${index + 1}`;
      if (await prisma.product.findUnique({ where: { slug } })) continue;
      const category = await prisma.category.findUniqueOrThrow({ where: { slug: demo.category } });
      await prisma.product.create({
        data: {
          title: demo.title,
          slug,
          description: `${demo.title}. Demo mahsulot — faqat sinov uchun.`,
          short_description: demo.title,
          price: demo.price,
          original_price: demo.original,
          discount_percentage: demo.original ? Math.round((1 - demo.price / demo.original) * 100) : 0,
          currency_id: currency.id,
          category_id: category.id,
          is_checked: 'APPROVED',
          recommended_age_min: demo.age[0],
          recommended_age_max: demo.age[1],
          inventory: { create: { stock_quantity: demo.stock, is_in_stock: demo.stock > 0 } },
        },
      });
    }
  }

  console.log('Seed tayyor');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
