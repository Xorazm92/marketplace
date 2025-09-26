import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCategories() {
  console.log('🌱 Seeding hierarchical categories...');

  // Main categories
  const mainCategories = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Kiyim-kechak',
      slug: 'kiyim-kechak',
      icon: 'fas fa-tshirt',
      color: '#FF6B6B',
      sort_order: 1
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'O\'yinchoqlar',
      slug: 'oyinchoqlar',
      icon: 'fas fa-gamepad',
      color: '#4ECDC4',
      sort_order: 2
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      name: 'Kitoblar',
      slug: 'kitoblar',
      icon: 'fas fa-book',
      color: '#45B7D1',
      sort_order: 3
    }
  ];

  // Create main categories
  for (const category of mainCategories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: category,
      create: category
    });
  }

  // Subcategories
  const subcategories = [
    {
      id: '550e8400-e29b-41d4-a716-446655440011',
      name: 'Ko\'ylaklar',
      slug: 'koylaklar',
      parent_id: '550e8400-e29b-41d4-a716-446655440001',
      icon: 'fas fa-female',
      color: '#FF8A80',
      sort_order: 1
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440021',
      name: 'Konstruktorlar',
      slug: 'konstruktorlar',
      parent_id: '550e8400-e29b-41d4-a716-446655440002',
      icon: 'fas fa-cubes',
      color: '#4FC3F7',
      sort_order: 1
    }
  ];

  for (const category of subcategories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: category,
      create: category
    });
  }

  console.log('✅ Categories seeded successfully!');
}

seedCategories()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
