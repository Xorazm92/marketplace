import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderPayment } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OrderService } from '../order/order.service';
import { safeEqual } from '../common/security/safe-equal';
import { markOrderPaid, tiyin } from './order-payment-state';

// Payme Merchant API (JSON-RPC 2.0): https://developer.help.paycom.uz
// Payme bizni chaqiradi; har javob HTTP 200 va so'rov `id` si bilan qaytadi.

const TIMEOUT_MS = 12 * 3600_000; // Payme: 12 soatda bajarilmagan tranzaksiya bekor bo'ladi
const REASON_TIMEOUT = 4;

const E = {
  AUTH: -32504,
  BAD_REQUEST: -32600,
  METHOD: -32601,
  AMOUNT: -31001,
  NOT_FOUND: -31003,
  CANNOT_CANCEL: -31007,
  CANNOT_PERFORM: -31008,
  ORDER: -31050,
};

class PaymeError extends Error {
  constructor(
    readonly code: number,
    readonly uz: string,
    readonly data?: string,
  ) {
    super(uz);
  }
}

// Payme xabarni uch tilda kutadi.
const MESSAGES: Record<number, { ru: string; en: string }> = {
  [E.AUTH]: { ru: 'Недостаточно привилегий', en: 'Insufficient privileges' },
  [E.BAD_REQUEST]: { ru: 'Неверный запрос', en: 'Invalid request' },
  [E.METHOD]: { ru: 'Метод не найден', en: 'Method not found' },
  [E.AMOUNT]: { ru: 'Неверная сумма', en: 'Invalid amount' },
  [E.NOT_FOUND]: { ru: 'Транзакция не найдена', en: 'Transaction not found' },
  [E.CANNOT_CANCEL]: { ru: 'Невозможно отменить транзакцию', en: 'Cannot cancel transaction' },
  [E.CANNOT_PERFORM]: { ru: 'Невозможно выполнить операцию', en: 'Cannot perform operation' },
  [E.ORDER]: { ru: 'Заказ не найден или недоступен', en: 'Order not found or unavailable' },
};

@Injectable()
export class PaymeService {
  private readonly logger = new Logger(PaymeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly orders: OrderService,
    private readonly config: ConfigService,
  ) {}

  get isEnabled(): boolean {
    return !!(this.config.get('PAYME_MERCHANT_ID') && this.config.get('PAYME_SECRET_KEY'));
  }

  checkoutUrl(orderId: number, amount: unknown, returnUrl: string): string {
    const base = this.config.get<string>('PAYME_CHECKOUT_URL') || 'https://checkout.paycom.uz';
    const params = `m=${this.config.get('PAYME_MERCHANT_ID')};ac.order_id=${orderId};a=${tiyin(amount as any)};c=${returnUrl}`;
    return `${base}/${Buffer.from(params).toString('base64')}`;
  }

  async handle(body: any, authorization?: string): Promise<object> {
    const id = body?.id ?? null;
    try {
      // Busiz har kim PerformTransaction yuborib buyurtmani to'langan qila olardi.
      if (!this.isAuthorized(authorization)) throw new PaymeError(E.AUTH, "Ruxsat yo'q");
      if (!body || typeof body.method !== 'string' || typeof body.params !== 'object' || body.params === null) {
        throw new PaymeError(E.BAD_REQUEST, "So'rov noto'g'ri");
      }
      const result = await this.dispatch(body.method, body.params);
      return { jsonrpc: '2.0', id, result };
    } catch (error) {
      if (error instanceof PaymeError) {
        return {
          jsonrpc: '2.0',
          id,
          error: { code: error.code, message: { uz: error.uz, ...MESSAGES[error.code] }, ...(error.data ? { data: error.data } : {}) },
        };
      }
      this.logger.error('Payme callback xatosi', error as Error);
      return { jsonrpc: '2.0', id, error: { code: E.CANNOT_PERFORM, message: { uz: 'Ichki xato', ...MESSAGES[E.CANNOT_PERFORM] } } };
    }
  }

  private isAuthorized(authorization?: string): boolean {
    const key = this.config.get<string>('PAYME_SECRET_KEY');
    if (!key) return false;
    return safeEqual(authorization, 'Basic ' + Buffer.from(`Paycom:${key}`).toString('base64'));
  }

  private dispatch(method: string, params: any) {
    switch (method) {
      case 'CheckPerformTransaction':
        return this.checkPerform(params);
      case 'CreateTransaction':
        return this.create(params);
      case 'PerformTransaction':
        return this.perform(params);
      case 'CancelTransaction':
        return this.cancel(params);
      case 'CheckTransaction':
        return this.check(params);
      case 'GetStatement':
        return this.statement(params);
      default:
        // ChangePassword ham shu yerga tushadi: kalit env'da, u qo'lda almashtiriladi.
        throw new PaymeError(E.METHOD, 'Metod topilmadi');
    }
  }

  private async payableOrder(params: any) {
    const orderId = Number(params?.account?.order_id);
    if (!Number.isInteger(orderId)) throw new PaymeError(E.ORDER, 'Buyurtma topilmadi', 'order_id');
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.payment_method !== 'PAYME' || order.status !== 'PENDING' || order.payment_status === 'PAID') {
      throw new PaymeError(E.ORDER, "Buyurtma to'lov uchun mavjud emas", 'order_id');
    }
    if (params.amount !== tiyin(order.final_amount)) throw new PaymeError(E.AMOUNT, "Summa noto'g'ri");
    return order;
  }

  private async checkPerform(params: any) {
    await this.payableOrder(params);
    return { allow: true };
  }

  private async create(params: any) {
    const existing = await this.findTx(params.id);
    if (existing) {
      if (existing.provider_state !== 1) throw new PaymeError(E.CANNOT_PERFORM, "Tranzaksiya faol emas");
      if (this.isExpired(existing)) {
        await this.cancelTx(existing, REASON_TIMEOUT);
        throw new PaymeError(E.CANNOT_PERFORM, 'Tranzaksiya muddati tugagan');
      }
      return { create_time: existing.createdAt.getTime(), transaction: String(existing.id), state: 1 };
    }

    const order = await this.payableOrder(params);
    // Bitta buyurtmaga bir vaqtda faqat bitta ochiq tranzaksiya.
    const busy = await this.prisma.orderPayment.findFirst({ where: { order_id: order.id, payment_method: 'PAYME', provider_state: 1 } });
    if (busy) throw new PaymeError(E.ORDER, "Buyurtma bo'yicha boshqa to'lov kutilmoqda", 'order_id');

    const row = await this.prisma.orderPayment.create({
      data: {
        order_id: order.id,
        payment_method: 'PAYME',
        transaction_id: String(params.id),
        amount: params.amount / 100,
        status: 'PENDING',
        provider_state: 1,
        provider_time: BigInt(params.time ?? Date.now()),
      },
    });
    return { create_time: row.createdAt.getTime(), transaction: String(row.id), state: 1 };
  }

  private async perform(params: any) {
    const tx = await this.requireTx(params.id);
    if (tx.provider_state === 2) {
      return { transaction: String(tx.id), perform_time: tx.performed_at!.getTime(), state: 2 };
    }
    if (tx.provider_state !== 1) throw new PaymeError(E.CANNOT_PERFORM, 'Tranzaksiya bekor qilingan');
    if (this.isExpired(tx)) {
      await this.cancelTx(tx, REASON_TIMEOUT);
      throw new PaymeError(E.CANNOT_PERFORM, 'Tranzaksiya muddati tugagan');
    }

    const performedAt = new Date();
    await this.prisma.$transaction(async (db) => {
      // Shartli: parallel ikki PerformTransaction ikkalasi ham "bajarildi" yozmasin.
      const { count } = await db.orderPayment.updateMany({
        where: { id: tx.id, provider_state: 1 },
        data: { provider_state: 2, status: 'PAID', performed_at: performedAt },
      });
      if (count === 1) await markOrderPaid(db, tx.order_id, 'Payme');
    });
    const fresh = await this.requireTx(params.id);
    return { transaction: String(fresh.id), perform_time: fresh.performed_at!.getTime(), state: 2 };
  }

  private async cancel(params: any) {
    const tx = await this.requireTx(params.id);
    if (tx.provider_state === 1) {
      await this.cancelTx(tx, Number(params.reason) || null);
    } else if (tx.provider_state === 2) {
      const order = await this.prisma.order.findUnique({ where: { id: tx.order_id } });
      // Yetkazilgan tovar uchun pulni Payme'dan qaytarib bo'lmaydi — qaytarish alohida jarayon.
      if (order && ['SHIPPED', 'DELIVERED'].includes(order.status)) {
        throw new PaymeError(E.CANNOT_CANCEL, 'Buyurtma yetkazilgan, bekor qilib bo\'lmaydi');
      }
      await this.prisma.$transaction(async (db) => {
        const { count } = await db.orderPayment.updateMany({
          where: { id: tx.id, provider_state: 2 },
          data: { provider_state: -2, status: 'REFUNDED', cancelled_at: new Date(), cancel_reason: Number(params.reason) || null },
        });
        if (count === 0) return;
        await db.order.update({ where: { id: tx.order_id }, data: { payment_status: 'REFUNDED' } });
        await this.orders.cancel(db, tx.order_id, "Payme orqali pul qaytarildi");
      });
    }
    const fresh = await this.requireTx(params.id);
    return { transaction: String(fresh.id), cancel_time: fresh.cancelled_at!.getTime(), state: fresh.provider_state };
  }

  private async check(params: any) {
    const tx = await this.requireTx(params.id);
    return {
      create_time: tx.createdAt.getTime(),
      perform_time: tx.performed_at?.getTime() ?? 0,
      cancel_time: tx.cancelled_at?.getTime() ?? 0,
      transaction: String(tx.id),
      state: tx.provider_state,
      reason: tx.cancel_reason,
    };
  }

  private async statement(params: any) {
    const rows = await this.prisma.orderPayment.findMany({
      where: { payment_method: 'PAYME', provider_time: { gte: BigInt(params.from ?? 0), lte: BigInt(params.to ?? 0) } },
      orderBy: { provider_time: 'asc' },
    });
    return {
      transactions: rows.map((tx) => ({
        id: tx.transaction_id,
        time: Number(tx.provider_time),
        amount: tiyin(tx.amount),
        account: { order_id: String(tx.order_id) },
        create_time: tx.createdAt.getTime(),
        perform_time: tx.performed_at?.getTime() ?? 0,
        cancel_time: tx.cancelled_at?.getTime() ?? 0,
        transaction: String(tx.id),
        state: tx.provider_state,
        reason: tx.cancel_reason,
      })),
    };
  }

  // Buyurtma bekor qilinmaydi: xaridor to'lov oynasini yopgan bo'lishi mumkin va
  // qayta to'lay oladi. To'lanmay qolgan buyurtmani expireUnpaidOrders bekor qiladi.
  private async cancelTx(tx: OrderPayment, reason: number | null) {
    await this.prisma.orderPayment.updateMany({
      where: { id: tx.id, provider_state: 1 },
      data: { provider_state: -1, status: 'CANCELLED', cancelled_at: new Date(), cancel_reason: reason },
    });
  }

  private isExpired(tx: OrderPayment): boolean {
    return Date.now() - Number(tx.provider_time ?? tx.createdAt.getTime()) > TIMEOUT_MS;
  }

  private findTx(id: unknown) {
    if (typeof id !== 'string' || !id) return null;
    return this.prisma.orderPayment.findUnique({ where: { payment_method_transaction_id: { payment_method: 'PAYME', transaction_id: id } } });
  }

  private async requireTx(id: unknown): Promise<OrderPayment> {
    const tx = await this.findTx(id);
    if (!tx) throw new PaymeError(E.NOT_FOUND, 'Tranzaksiya topilmadi');
    return tx;
  }
}
