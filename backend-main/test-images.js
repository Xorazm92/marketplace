const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addImagesToAllProducts() {
  try {
    // Barcha APPROVED product'larni olish
    const products = await prisma.product.findMany({
      where: { is_checked: 'APPROVED' },
      include: { product_image: true }
    });

    console.log(`📦 Found ${products.length} approved products`);

    const availableImages = [
      '/uploads/1igjbf1dmmm.jpg',
      '/uploads/8bzpbd3u54v.jpg',
      '/uploads/fvagmp9b9f.png',
      '/uploads/ifvf2c6yclp.jpg',
      '/uploads/lnptiigmb4.jpg',
      '/uploads/s1l0elm866o.jpg',
      '/uploads/wtu09bqgqwq.jpg'
    ];

    for (const product of products) {
      // Agar product'da rasmlar yo'q bo'lsa
      if (product.product_image.length === 0) {
        console.log(`📸 Adding images to product ${product.id}: ${product.title}`);

        // Har bir product uchun 2-3 ta random rasm
        const imageCount = Math.floor(Math.random() * 2) + 2; // 2 yoki 3 ta
        const selectedImages = availableImages
          .sort(() => 0.5 - Math.random())
          .slice(0, imageCount);

        for (const imageUrl of selectedImages) {
          await prisma.productImage.create({
            data: {
              product_id: product.id,
              url: imageUrl
            }
          });
        }

        console.log(`✅ Added ${imageCount} images to product ${product.id}`);
      } else {
        console.log(`⏭️ Product ${product.id} already has ${product.product_image.length} images`);
      }
    }

    console.log('🎉 All products processed!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addImagesToAllProducts();
