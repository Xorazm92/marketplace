import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.admin.upsert({
    where: { email: 'admin@inbola.uz' },
    update: {},
    create: {
      email: 'admin@inbola.uz',
      first_name: 'Admin',
      last_name: 'User',
      phone_number: '+998901234567',
      password: hashedPassword,
      is_super_admin: true,
      is_active: true,
    },
  });

  console.log('✅ Admin created:', admin.email);

  // 2. Create Regions
  const regions = [
    { name: 'Toshkent shahri' },
    { name: 'Toshkent viloyati' },
    { name: 'Samarqand viloyati' },
    { name: 'Buxoro viloyati' },
    { name: 'Andijon viloyati' },
  ];

  for (const region of regions) {
    await prisma.region.upsert({
      where: { name: region.name },
      update: {},
      create: region,
    });
  }

  console.log('✅ Regions created');

  // 3. Create Categories
  const categories = [
    {
      name: 'Oyinchoqlar',
      slug: 'toys',
      description: 'Bolalar uchun turli xil oyinchoqlar',
      is_active: true,
    },
    {
      name: 'Kiyim-kechak',
      slug: 'clothing',
      description: 'Bolalar kiyimlari',
      is_active: true,
    },
    {
      name: 'Kitoblar',
      slug: 'books',
      description: 'Bolalar uchun kitoblar',
      is_active: true,
    },
    {
      name: 'Sport',
      slug: 'sports',
      description: 'Sport anjomlari',
      is_active: true,
    },
    {
      name: 'Maktab buyumlari',
      slug: 'school',
      description: 'Maktab uchun kerakli buyumlar',
      is_active: true,
    },
    {
      name: 'Chaqaloq buyumlari',
      slug: 'baby',
      description: 'Chaqaloqlar uchun buyumlar',
      is_active: true,
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log('✅ Categories created');

  // 4. Create Brands
  const brands = [
    {
      name: 'Fisher-Price',
      logo: '/uploads/brands/fisher-price.jpg',
    },
    {
      name: 'LEGO',
      logo: '/uploads/brands/lego.jpg',
    },
    {
      name: 'Barbie',
      logo: '/uploads/brands/barbie.jpg',
    },
    {
      name: 'Hot Wheels',
      logo: '/uploads/brands/hot-wheels.jpg',
    },
    {
      name: 'Disney',
      logo: '/uploads/brands/disney.jpg',
    },
  ];

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { name: brand.name },
      update: {},
      create: brand,
    });
  }

  console.log('✅ Brands created');

  // 5. Create Colors
  const colors = [
    { name: 'Qizil', hex_code: '#FF0000' },
    { name: 'Yashil', hex_code: '#00FF00' },
    { name: 'Moviy', hex_code: '#0000FF' },
    { name: 'Sariq', hex_code: '#FFFF00' },
    { name: 'Qora', hex_code: '#000000' },
    { name: 'Oq', hex_code: '#FFFFFF' },
    { name: 'Pushti', hex_code: '#FFC0CB' },
    { name: 'Binafsha', hex_code: '#800080' },
  ];

  for (const color of colors) {
    await prisma.color.upsert({
      where: { name: color.name },
      update: {},
      create: color,
    });
  }

  console.log('✅ Colors created');

  // 6. Create Test User
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      phone_number: '+998901111111',
      password: await bcrypt.hash('password123', 10),
      is_active: true,
      is_verified: true,
    },
  });

  console.log('✅ Test user created:', testUser.email);

  // 7. Create Sample Products
  const toyCategory = await prisma.category.findUnique({ where: { slug: 'toys' } });
  const legoBrand = await prisma.brand.findUnique({ where: { name: 'LEGO' } });

  if (toyCategory && legoBrand) {
    const sampleProduct = await prisma.product.upsert({
      where: { title: 'LEGO Classic Creative Bricks' },
      update: {
        title: 'LEGO Classic Creative Bricks',
        description: 'Ijodkorlik uchun LEGO konstruktor to\'plami',
        price: 250000,
        stock_quantity: 50,
        sku: 'LEGO-001',
        is_active: true,
        status: 'APPROVED',
        phone_number: testUser.phone_number,
        category_id: toyCategory.id,
        brand_id: legoBrand.id,
        user_id: testUser.id,
      },
      create: {
        title: 'LEGO Classic Creative Bricks',
        description: 'Ijodkorlik uchun LEGO konstruktor to\'plami',
        price: 250000,
        stock_quantity: 50,
        sku: 'LEGO-001',
        is_active: true,
        status: 'APPROVED',
        phone_number: testUser.phone_number,
        category_id: toyCategory.id,
        brand_id: legoBrand.id,
        user_id: testUser.id,
      },
    });

    console.log('✅ Sample product created:', sampleProduct.name);
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });