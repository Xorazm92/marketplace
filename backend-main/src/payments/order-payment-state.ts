import { Prisma } from '@prisma/client';

type Tx = Prisma.TransactionClient;

// Provayderdan pul tushganda buyurtma holati. Faqat hali ochiq (PENDING) va
// to'lanmagan buyurtma to'langan bo'ladi: shart va yozuv bitta SQL'da, shuning uchun
// xaridor/admin bekor qilgan (zaxirasi qaytarilgan) buyurtma to'lov bilan "tirilmaydi"
// va takroriy chaqiruv ikkinchi marta yozmaydi.
//
// `false` qaytsa chaqiruvchi o'z tranzaksiyasini bekor qilishi SHART (to'lov qatori
// PAID bo'lib qolmasin) va provayderga xato qaytarishi kerak — pulni provayder qaytaradi.
export async function markOrderPaid(tx: Tx, orderId: number, method: string): Promise<boolean> {
  const { count } = await tx.order.updateMany({
    where: { id: orderId, status: 'PENDING', payment_status: { not: 'PAID' } },
    data: { payment_status: 'PAID', paid_at: new Date(), status: 'CONFIRMED' },
  });
  if (count === 0) return false;
  await tx.orderTracking.create({ data: { order_id: orderId, status: 'CONFIRMED', description: `${method} orqali to'landi` } });
  return true;
}

export function tiyin(amount: Prisma.Decimal | number | string): number {
  // Suzuvchi nuqta xatosi (0.1 * 100) summani tiyinda 1 ga surmasligi uchun.
  return Math.round(Number(amount) * 100);
}
