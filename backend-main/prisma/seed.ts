import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Seeding database...');

    // Test user yaratish
    const hashedPassword = await bcrypt.hash('123456', 10);

    // Avval user borligini tekshirish
    const existingUser = await prisma.user.findUnique({
      where: { phone_number: '+998901234567' }
    });

    let testUser;
    if (!existingUser) {
      testUser = await prisma.user.create({
        data: {
          phone_number: '+998901234567',
          first_name: 'Test',
          last_name: 'User',
          password: hashedPassword,
          balance: 1000000, // 1 million so'm
          is_active: true,
          is_verified: true,
        }
      });

      console.log('✅ Test user created:', testUser.phone_number);
    } else {
      testUser = existingUser;
      console.log('✅ Test user already exists');
    }

    // Admin yaratish (Admin table'da)
    const existingAdmin = await prisma.admin.findUnique({
      where: { phone_number: '+998901070125' }
    });

    if (!existingAdmin) {
      const admin = await prisma.admin.create({
        data: {
          first_name: 'Super',
          last_name: 'Admin',
          phone_number: '+998901070125',
          email: 'admin@inbola.uz',
          role: 'SUPER_ADMIN',
          hashed_password: hashedPassword,
          is_active: true,
          is_creator: true,
          activation_link: null,
        }
      });

      console.log('✅ Super Admin created:', admin.phone_number);
    } else {
      console.log('✅ Super Admin already exists');
    }

    // Admin user yaratish (User table'da ham)
    const existingAdminUser = await prisma.user.findUnique({
      where: { phone_number: '+998909876543' }
    });

    if (!existingAdminUser) {
      const adminUser = await prisma.user.create({
        data: {
          phone_number: '+998909876543',
          first_name: 'Admin',
          last_name: 'User',
          password: hashedPassword,
          balance: 0,
          is_active: true,
          is_verified: true,
        }
      });

      console.log('✅ Admin user created:', adminUser.phone_number);
    } else {
      console.log('✅ Admin user already exists');
    }

    // Currency yaratish
    const currency = await prisma.currency.upsert({
      where: { code: 'UZS' },
      update: {},
      create: {
        code: 'UZS',
        name: 'Uzbek Som',
        symbol: "so'm",
      },
    });

    console.log('✅ Currency created:', currency.code);

    // Brand yaratish
    const brand = await prisma.brand.upsert({
      where: { name: 'INBOLA' },
      update: {},
      create: {
        name: 'INBOLA',
        logo: 'inbola-logo.png',
      },
    });

    console.log('✅ Brand created:', brand.name);

    // Category yaratish
    const categories = [
      { name: 'Kiyim-kechak', slug: 'clothing' },
      { name: "O'yinchoqlar", slug: 'toys' },
      { name: 'Kitoblar', slug: 'books' },
      { name: 'Sport anjomlar', slug: 'sports' },
      { name: 'Maktab buyumlari', slug: 'school' },
      { name: 'Chaqaloq buyumlari', slug: 'baby' },
      { name: 'Elektronika', slug: 'electronics' },
      { name: "Sog'liq", slug: 'health' },
    ];

    for (const cat of categories) {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      });
    }

    console.log('✅ Categories created');

    // Ranglar yaratish
    const colors = [
      { name: 'Ko\'k', hex: '#0066cc' },
      { name: 'Qizil', hex: '#cc0000' },
      { name: 'Yashil', hex: '#00cc00' },
      { name: 'Sariq', hex: '#ffcc00' },
      { name: 'Qora', hex: '#000000' },
      { name: 'Oq', hex: '#ffffff' },
      { name: 'Kulrang', hex: '#808080' },
      { name: 'Pushti', hex: '#ffc0cb' },
      { name: 'Binafsha', hex: '#800080' },
      { name: 'To\'q sariq', hex: '#ff8c00' },
      { name: 'Moviy', hex: '#0000ff' },
      { name: 'Qizg\'ish', hex: '#ff4500' },
      { name: 'Oltin', hex: '#ffd700' },
      { name: 'Kumush', hex: '#c0c0c0' },
      { name: 'Bronza', hex: '#cd7f32' }
    ];

    for (const colorData of colors) {
      await prisma.color.upsert({
        where: { name: colorData.name },
        update: { hex: colorData.hex },
        create: colorData,
      });
    }

    console.log('✅ Colors created');

    // Age Groups yaratish
    const ageGroups = [
      { name: 'Chaqaloqlar', min_age: 0, max_age: 1, description: '0-1 yosh', icon: '👶', color: '#FFE4E1' },
      { name: 'Kichik bolalar', min_age: 1, max_age: 3, description: '1-3 yosh', icon: '🧒', color: '#E6F3FF' },
      { name: 'Maktabgacha', min_age: 3, max_age: 6, description: '3-6 yosh', icon: '👦', color: '#E8F5E8' },
      { name: 'Maktab yoshi', min_age: 6, max_age: 12, description: '6-12 yosh', icon: '🧑', color: '#FFF0E6' },
      { name: 'O\'smirlar', min_age: 12, max_age: 18, description: '12+ yosh', icon: '👨', color: '#F0E6FF' }
    ];

    for (const ageGroup of ageGroups) {
      const existing = await prisma.ageGroup.findFirst({
        where: { name: ageGroup.name }
      });
      
      if (!existing) {
        await prisma.ageGroup.create({
          data: ageGroup,
        });
      } else {
        await prisma.ageGroup.update({
          where: { id: existing.id },
          data: ageGroup,
        });
      }
    }

    console.log('✅ Age Groups created');

    // Educational Categories yaratish
    const educationalCategories = [
      { name: 'Matematik fikrlash', description: 'Hisob-kitob va mantiq rivojlantirish', icon: '🔢', color: '#E3F2FD' },
      { name: 'Til rivojlantirish', description: 'Nutq va yozuv ko\'nikmalari', icon: '📚', color: '#F3E5F5' },
      { name: 'Ijodkorlik', description: 'Tasavvur va ijodiy qobiliyatlar', icon: '🎨', color: '#E8F5E8' },
      { name: 'Motor ko\'nikmalar', description: 'Kichik va katta motor harakatlari', icon: '🤸', color: '#FFF3E0' },
      { name: 'Ijtimoiy ko\'nikmalar', description: 'Muloqot va hamkorlik', icon: '👥', color: '#FCE4EC' },
      { name: 'Fan va tadqiqot', description: 'Ilmiy fikrlash va kashfiyot', icon: '🔬', color: '#E0F2F1' },
      { name: 'Musiqa va san\'at', description: 'Estetik tarbiya va badiiy ta\'lim', icon: '🎵', color: '#FFF8E1' },
      { name: 'Texnologiya', description: 'Raqamli savodxonlik va dasturlash', icon: '💻', color: '#E1F5FE' }
    ];

    for (const category of educationalCategories) {
      const existing = await prisma.educationalCategory.findFirst({
        where: { name: category.name }
      });
      
      if (!existing) {
        await prisma.educationalCategory.create({
          data: category,
        });
      }
    }

    console.log('✅ Educational Categories created');

    // Event Types yaratish
    const eventTypes = [
      { name: 'Tug\'ilgan kun', description: 'Tug\'ilgan kun bayramlari uchun', icon: '🎂', color: '#FFE4E1' },
      { name: 'Yangi yil', description: 'Yangi yil bayramlari uchun', icon: '🎄', color: '#E8F5E8' },
      { name: 'Maktabga tayyorgarlik', description: 'Maktab boshlash uchun', icon: '🎒', color: '#E6F3FF' },
      { name: 'Yoz ta\'tillari', description: 'Yoz faoliyatlari uchun', icon: '☀️', color: '#FFF8E1' },
      { name: 'Sport tadbirlari', description: 'Sport va jismoniy faoliyat', icon: '⚽', color: '#E0F2F1' },
      { name: 'Madaniy tadbirlar', description: 'San\'at va madaniyat', icon: '🎭', color: '#F3E5F5' },
      { name: 'Ta\'lim seminarlari', description: 'O\'quv va rivojlanish', icon: '📖', color: '#FFF3E0' }
    ];

    for (const eventType of eventTypes) {
      const existing = await prisma.eventType.findFirst({
        where: { name: eventType.name }
      });
      
      if (!existing) {
        await prisma.eventType.create({
          data: eventType,
        });
      }
    }

    console.log('✅ Event Types created');

    // Test mahsulotlar yaratish
    const testProducts = [
      {
        title: "Kichkintoylar uchun o'yinchoq mashina",
        description: "Xavfsiz va rangli o'yinchoq mashina. 3+ yosh uchun mos.",
        price: 85000,
        category_slug: 'toys',
        brand_name: 'INBOLA',
        images: ['/uploads/toy1.svg', '/uploads/toy2.svg'],
        // Mavjud ranglardan foydalanamiz (yuqorida yaratildi)
        colors: ["Ko'k", 'Qizil']
      },
      {
        title: "Bolalar uchun rangli konstruktor",
        description: "Tasavvur va motorika rivoji uchun 120 ta detalga ega konstruktor.",
        price: 149000,
        category_slug: 'toys',
        brand_name: 'INBOLA',
        images: ['/uploads/constructor1.svg', '/uploads/constructor2.svg'],
        colors: ['Yashil', 'Sariq']
      }
    ];

    for (const productData of testProducts) {
      const category = await prisma.category.findUnique({
        where: { slug: productData.category_slug }
      });

      if (category) {
        const productSlug = productData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        // Check if product already exists
        const existingProduct = await prisma.product.findUnique({
          where: { slug: productSlug }
        });

        if (existingProduct) {
          console.log(`✅ Product already exists: ${productData.title}`);
          continue;
        }

        const product = await prisma.product.create({
          data: {
            title: productData.title,
            description: productData.description,
            price: productData.price,
            category_id: category.id,
            brand_id: brand.id,
            currency_id: currency.id,
            user_id: testUser.id,
            is_checked: 'APPROVED',
            negotiable: false,
            condition: "new",
            phone_number: '+998901234567',
            slug: productSlug,
            product_image: {
              create: productData.images.map((img) => ({
                url: img.startsWith('/uploads') ? img : `/uploads/${img}`
              }))
            }
          }
        });

        // Ranglarni qo'shish
        if (productData.colors && productData.colors.length > 0) {
          for (const colorName of productData.colors) {
            const color = await prisma.color.findUnique({
              where: { name: colorName }
            });
            
            if (color) {
              await prisma.productColor.create({
                data: {
                  product_id: product.id,
                  color_id: color.id
                }
              });
            }
          }
        }

        console.log(`✅ Product created: ${product.title}`);
      }
    }

    console.log('🎉 Seeding completed successfully!');
    console.log('📱 Test user: +998901234567 / password: 123456');
    console.log('👨‍💼 Admin user: +998909876543 / password: 123456');
    console.log('🔑 Super Admin: +998901070125 / password: 123456');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
