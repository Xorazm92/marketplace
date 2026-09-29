// Birinchi super admin'ni yaratadi. Admin ro'yxatdan o'tkazish API'si faqat
// super admin uchun ochiq, shuning uchun boshlang'ich hisob shu skript bilan ochiladi.
//
//   ADMIN_PHONE=+998... ADMIN_PASSWORD=... node create-admin.js
//
// Parol kodda turmaydi: oldin bu yerda '123456' yozilgan edi va skript ishga
// tushgan har qanday muhitda ma'lum parolli super admin paydo bo'lardi.
require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  const phone = process.env.ADMIN_PHONE;
  const password = process.env.ADMIN_PASSWORD;

  if (!phone || !password || password.length < 12) {
    console.error('❌ ADMIN_PHONE va kamida 12 belgili ADMIN_PASSWORD berilishi shart.');
    process.exitCode = 1;
    return;
  }

  try {
    const admin = await prisma.admin.create({
      data: {
        phone_number: phone,
        hashed_password: await bcrypt.hash(password, 10),
        first_name: process.env.ADMIN_FIRST_NAME || 'Super',
        last_name: process.env.ADMIN_LAST_NAME || 'Admin',
        email: process.env.ADMIN_EMAIL || null,
        role: 'SUPER_ADMIN',
        is_active: true,
        is_creator: true,
      },
    });

    console.log('✅ Super admin yaratildi:', { id: admin.id, phone_number: admin.phone_number });
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️ Bu telefon raqamli admin allaqachon mavjud');
    } else {
      console.error('❌ Xato:', error);
    }
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
