const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function approveProduct(productId) {
  try {
    const product = await prisma.product.update({
      where: { id: productId },
      data: { 
        is_checked: 'APPROVED',
        is_active: true 
      }
    });

    console.log(`✅ Product ${productId} approved:`, product.title);
    return product;
  } catch (error) {
    console.error('❌ Xato:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Barcha product'larni approve qilish
async function approveAllProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { is_checked: 'PENDING' }
    });

    console.log(`📦 ${products.length} ta PENDING product topildi`);

    for (const product of products) {
      await approveProduct(product.id);
    }

    console.log('✅ Barcha product\'lar approve qilindi!');
  } catch (error) {
    console.error('❌ Xato:', error);
  }
}

approveAllProducts();
