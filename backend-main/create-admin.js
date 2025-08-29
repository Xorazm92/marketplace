const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Parolni hash qilish
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Admin yaratish
    const admin = await prisma.admin.create({
      data: {
        phone_number: '+998901070125',
        hashed_password: hashedPassword,
        first_name: 'Super',
        last_name: 'Admin',
        email: 'admin@inbola.uz',
        role: 'SUPER_ADMIN',
        is_active: true,
        is_creator: true,
      },
    });

    console.log('✅ Admin muvaffaqiyatli yaratildi:', admin);
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️ Admin allaqachon mavjud');
    } else {
      console.error('❌ Xato:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
