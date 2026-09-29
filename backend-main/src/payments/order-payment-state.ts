import { Prisma } from '@prisma/client';

type Tx = Prisma.TransactionClient;

// Provayderdan pul tushganda buyurtma holati. Takror chaqirilsa ikkinchi marta yozmaydi.
export async function markOrderPaid(tx: Tx, orderId: number, method: string): Promise<void> {
  const { count } = await tx.order.updateMany({
    where: { id: orderId, payment_status: { not: 'PAID' } },
    data: { payment_status: 'PAID', paid_at: new Date() },
  });
  if (count === 0) return;
  await tx.order.updateMany({ where: { id: orderId, status: 'PENDING' }, data: { status: 'CONFIRMED' } });
  await tx.orderTracking.create({ data: { order_id: orderId, status: 'CONFIRMED', description: `${method} orqali to'landi` } });
}

export function tiyin(amount: Prisma.Decimal | number | string): number {
  // Suzuvchi nuqta xatosi (0.1 * 100) summani tiyinda 1 ga surmasligi uchun.
  return Math.round(Number(amount) * 100);
}
