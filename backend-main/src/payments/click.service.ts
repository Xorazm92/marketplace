import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { safeEqual } from '../common/security/safe-equal';
import { markOrderPaid } from './order-payment-state';

// Click SHOP API: Click bizga Prepare (action=0), keyin Complete (action=1) yuboradi.
// Summa SO'MDA keladi (tiyinda emas) — eski kod `* 100` bilan solishtirardi va
// haqiqiy Click bilan to'lov hech qachon o'tmasdi.

const E = {
  OK: 0,
  SIGN: -1,
  AMOUNT: -2,
  ACTION: -3,
  ALREADY_PAID: -4,
  ORDER_NOT_FOUND: -5,
  TX_NOT_FOUND: -6,
  UPDATE_FAILED: -7,
  BAD_REQUEST: -8,
  CANCELLED: -9,
};

const NOTES: Record<number, string> = {
  [E.OK]: 'Success',
  [E.SIGN]: 'SIGN CHECK FAILED!',
  [E.AMOUNT]: 'Incorrect parameter amount',
  [E.ACTION]: 'Action not found',
  [E.ALREADY_PAID]: 'Already paid',
  [E.ORDER_NOT_FOUND]: 'Order does not exist',
  [E.TX_NOT_FOUND]: 'Transaction does not exist',
  [E.UPDATE_FAILED]: 'Failed to update order',
  [E.BAD_REQUEST]: 'Error in request from click',
  [E.CANCELLED]: 'Transaction cancelled',
};

export interface ClickRequest {
  click_trans_id: string | number;
  service_id: string | number;
  click_paydoc_id?: string | number;
  merchant_trans_id: string;
  merchant_prepare_id?: string | number;
  amount: string | number;
  action: string | number;
  error: string | number;
  error_note?: string;
  sign_time: string;
  sign_string: string;
}

@Injectable()
export class ClickService {
  private readonly logger = new Logger(ClickService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  get isEnabled(): boolean {
    return !!(this.config.get('CLICK_SERVICE_ID') && this.config.get('CLICK_MERCHANT_ID') && this.config.get('CLICK_SECRET_KEY'));
  }

  checkoutUrl(orderId: number, amount: unknown, returnUrl: string): string {
    const params = new URLSearchParams({
      service_id: String(this.config.get('CLICK_SERVICE_ID')),
      merchant_id: String(this.config.get('CLICK_MERCHANT_ID')),
      amount: Number(amount).toFixed(2),
      transaction_param: String(orderId),
      return_url: returnUrl,
    });
    return `https://my.click.uz/services/pay?${params}`;
  }

  async prepare(req: ClickRequest) {
    const reply = (error: number, extra: object = {}) => this.reply(req, error, extra);
    try {
      if (!this.isSigned(req, false)) return reply(E.SIGN);
      if (String(req.service_id) !== String(this.config.get('CLICK_SERVICE_ID'))) return reply(E.BAD_REQUEST);
      if (Number(req.action) !== 0) return reply(E.ACTION);

      const order = await this.prisma.order.findUnique({ where: { id: Number(req.merchant_trans_id) || 0 } });
      if (!order || order.payment_method !== 'CLICK') return reply(E.ORDER_NOT_FOUND);
      if (order.payment_status === 'PAID') return reply(E.ALREADY_PAID);
      if (order.status === 'CANCELLED') return reply(E.CANCELLED);
      if (!sameAmount(req.amount, order.final_amount)) return reply(E.AMOUNT);

      // Click Prepare'ni qayta yuborsa ham bitta qator: (CLICK, click_trans_id) unikal.
      const row = await this.prisma.orderPayment.upsert({
        where: { payment_method_transaction_id: { payment_method: 'CLICK', transaction_id: String(req.click_trans_id) } },
        create: {
          order_id: order.id,
          payment_method: 'CLICK',
          transaction_id: String(req.click_trans_id),
          amount: Number(req.amount),
          status: 'PENDING',
          provider_state: 0,
          gateway_response: { click_paydoc_id: String(req.click_paydoc_id ?? '') },
        },
        update: {},
      });
      return reply(E.OK, { merchant_prepare_id: row.id });
    } catch (error) {
      this.logger.error('Click prepare xatosi', error as Error);
      return reply(E.UPDATE_FAILED);
    }
  }

  async complete(req: ClickRequest) {
    const reply = (error: number, extra: object = {}) => this.reply(req, error, extra);
    try {
      if (!this.isSigned(req, true)) return reply(E.SIGN);
      if (String(req.service_id) !== String(this.config.get('CLICK_SERVICE_ID'))) return reply(E.BAD_REQUEST);
      if (Number(req.action) !== 1) return reply(E.ACTION);

      const row = await this.prisma.orderPayment.findFirst({
        where: { id: Number(req.merchant_prepare_id) || 0, payment_method: 'CLICK', transaction_id: String(req.click_trans_id) },
        include: { order: true },
      });
      if (!row || String(row.order_id) !== String(req.merchant_trans_id)) return reply(E.TX_NOT_FOUND);
      if (row.provider_state === 1) return reply(E.ALREADY_PAID, { merchant_confirm_id: row.id });
      if (row.provider_state === -1) return reply(E.CANCELLED);

      // Click o'z tomonida to'lov o'tmaganini bildirdi: tranzaksiya yopiladi,
      // buyurtma esa ochiq qoladi — xaridor qayta urinishi mumkin.
      if (Number(req.error) < 0) {
        await this.prisma.orderPayment.update({
          where: { id: row.id },
          data: { provider_state: -1, status: 'CANCELLED', cancelled_at: new Date() },
        });
        return reply(E.CANCELLED);
      }
      if (!sameAmount(req.amount, row.order.final_amount)) return reply(E.AMOUNT);
      if (row.order.payment_status === 'PAID') return reply(E.ALREADY_PAID);
      if (row.order.status === 'CANCELLED') return reply(E.CANCELLED);

      await this.prisma.$transaction(async (db) => {
        const { count } = await db.orderPayment.updateMany({
          where: { id: row.id, provider_state: 0 },
          data: { provider_state: 1, status: 'PAID', performed_at: new Date() },
        });
        if (count === 1) await markOrderPaid(db, row.order_id, 'Click');
      });
      return reply(E.OK, { merchant_confirm_id: row.id });
    } catch (error) {
      this.logger.error('Click complete xatosi', error as Error);
      return reply(E.UPDATE_FAILED);
    }
  }

  // md5(click_trans_id + service_id + SECRET + merchant_trans_id [+ merchant_prepare_id] + amount + action + sign_time)
  private isSigned(req: ClickRequest, withPrepareId: boolean): boolean {
    const secret = this.config.get<string>('CLICK_SECRET_KEY');
    if (!secret || !req?.sign_string) return false;
    const raw =
      `${req.click_trans_id}${req.service_id}${secret}${req.merchant_trans_id}` +
      `${withPrepareId ? req.merchant_prepare_id : ''}${req.amount}${req.action}${req.sign_time}`;
    return safeEqual(createHash('md5').update(raw).digest('hex'), String(req.sign_string));
  }

  private reply(req: ClickRequest, error: number, extra: object) {
    return {
      click_trans_id: req?.click_trans_id,
      merchant_trans_id: req?.merchant_trans_id,
      ...extra,
      error,
      error_note: NOTES[error],
    };
  }
}

function sameAmount(clickAmount: unknown, orderAmount: unknown): boolean {
  return Math.abs(Number(clickAmount) - Number(orderAmount)) < 0.01;
}
