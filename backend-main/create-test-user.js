const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Parolni hash qilish
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Test user yaratish
    const user = await prisma.user.create({
      data: {
        phone_number: '+998901234567',
        password: hashedPassword,
        first_name: 'Test',
        last_name: 'User',
        is_active: true,
        is_verified: true,
      },
    });

    console.log('✅ Test user muvaffaqiyatli yaratildi:', user);
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️ Test user allaqachon mavjud');
    } else {
      console.error('❌ Xato:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
