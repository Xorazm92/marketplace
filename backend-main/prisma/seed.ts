import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Seeding database...');

    // Test user yaratish
    const hashedPassword = await bcrypt.hash('123456', 10);

    // Avval phone number borligini tekshirish
    const existingPhone = await prisma.phoneNumber.findUnique({
      where: { phone_number: '+998901234567' }
    });

    let testUser;
    if (!existingPhone) {
      testUser = await prisma.user.create({
        data: {
          first_name: 'Test',
          last_name: 'User',
          password: hashedPassword,
          balance: 1000000, // 1 million so'm
          phone_number: {
            create: {
              phone_number: '+998901234567',
              is_main: true,
            }
          }
        },
        include: {
          phone_number: true
        }
      });

      console.log('✅ Test user created:', testUser.phone_number[0]?.phone_number);
    } else {
      // Mavjud user'ni olish
      testUser = await prisma.user.findFirst({
        include: { phone_number: true }
      });
      console.log('✅ Test user already exists');
    }

    // Admin user yaratish
    const existingAdminPhone = await prisma.phoneNumber.findUnique({
      where: { phone_number: '+998909876543' }
    });

    if (!existingAdminPhone) {
      const adminUser = await prisma.user.create({
        data: {
          first_name: 'Admin',
          last_name: 'User',
          password: hashedPassword,
          balance: 0,
          phone_number: {
            create: {
              phone_number: '+998909876543',
              is_main: true,
            }
          }
        },
        include: {
          phone_number: true
        }
      });

      console.log('✅ Admin user created:', adminUser.phone_number[0]?.phone_number);
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

    // Test mahsulotlar yaratish
    const testProducts = [
      {
        title: "Bolalar uchun rangli ko'ylak",
        description: "Yumshoq va qulay bolalar ko'ylagi. 100% paxta materialdan tayyorlangan.",
        price: 150000,
        category_slug: 'clothing',
        brand_name: 'INBOLA',
        images: ['/uploads/product1.svg', '/uploads/product1_2.svg']
      },
      {
        title: "Kichkintoylar uchun o'yinchoq mashina",
        description: "Xavfsiz va rangli o'yinchoq mashina. 3+ yosh uchun mos.",
        price: 85000,
        category_slug: 'toys',
        brand_name: 'INBOLA',
        images: ['/uploads/toy1.svg', '/uploads/toy1_2.svg']
      },
      {
        title: "Bolalar uchun hikoyalar kitobi",
        description: "O'zbek tilida yozilgan qiziqarli hikoyalar to'plami.",
        price: 45000,
        category_slug: 'books',
        brand_name: 'INBOLA',
        images: ['/uploads/book1.svg']
      },
      {
        title: "Bolalar futbol to'pi",
        description: "Yumshoq va xavfsiz futbol to'pi. Ichki va tashqi o'yinlar uchun.",
        price: 120000,
        category_slug: 'sports',
        brand_name: 'INBOLA',
        images: ['/uploads/ball1.svg']
      },
      {
        title: "Maktab sumkasi",
        description: "Chiroyli va bardoshli maktab sumkasi. Ko'p cho'ntakli.",
        price: 180000,
        category_slug: 'school',
        brand_name: 'INBOLA',
        images: ['/uploads/bag1.svg', '/uploads/bag1_2.svg'],
        colors: ['Qora', 'Ko\'k', 'Qizil']
      },
      {
        title: "Bolalar uchun rangli qalam to'plami",
        description: "Yuqori sifatli rangli qalamlar. 24 ta turli rangda. Bolalar uchun xavfsiz.",
        price: 45000,
        category_slug: 'school',
        brand_name: 'INBOLA',
        images: ['/uploads/pencils1.svg', '/uploads/pencils2.svg'],
        colors: ['Ko\'k', 'Qizil', 'Yashil', 'Sariq', 'Binafsha', 'To\'q sariq']
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
                url: `/uploads/${img}`
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
