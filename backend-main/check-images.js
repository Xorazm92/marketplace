const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkImages() {
  try {
    const images = await prisma.productImage.findMany({
      include: {
        product: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    console.log(`📸 Database'da ${images.length} ta image bor:`);
    images.forEach(img => {
      console.log(`- ID: ${img.id}, URL: ${img.url}, Product: ${img.product.title}`);
    });

    if (images.length === 0) {
      console.log('❌ Database da image lar yoq!');
    }
  } catch (error) {
    console.error('❌ Xato:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImages();
