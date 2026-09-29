import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymeService } from './payme.service';
import { ClickService } from './click.service';
import { UzumService } from './uzum.service';
import { safeEqual } from './signature.util';

// Faza 0 regressiyalari: to'lov holatini faqat haqiqiy provider o'zgartira oladi,
// summa esa har doim buyurtmadan olinadi (docs/plan/MVP_ROADMAP.md, C1/C2/C5).

const PAYME_SECRET = 'payme-test-secret';
const paymeAuth = 'Basic ' + Buffer.from(`Paycom:${PAYME_SECRET}`).toString('base64');

function config(values: Record<string, string | undefined>) {
  return { get: (key: string) => values[key] } as unknown as ConfigService;
}

function prismaMock() {
  return {
    order: { findUnique: jest.fn(), update: jest.fn() },
    orderPayment: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
  };
}

const order = {
  id: 7,
  user_id: 1,
  order_number: 'ORD-7',
  payment_status: 'PENDING',
  total_amount: 100000,
  final_amount: 125000.5,
  payments: [],
  user: { email: null, phone_number: '+998900000000', first_name: 'A', last_name: 'B' },
};

describe('Payme merchant API', () => {
  let prisma: ReturnType<typeof prismaMock>;
  let payme: PaymeService;

  beforeEach(() => {
    prisma = prismaMock();
    payme = new PaymeService(config({ PAYME_SECRET_KEY: PAYME_SECRET }), prisma as any);
  });

  const perform = { id: 42, method: 'PerformTransaction', params: { id: 'tx-1' } };

  it('Authorization bo\'lmasa -32504 qaytaradi va bazaga tegmaydi', async () => {
    const res = await payme.handleCallback(perform as any);
    expect(res.error.code).toBe(-32504);
    expect(res.id).toBe(42);
    expect(prisma.orderPayment.findFirst).not.toHaveBeenCalled();
  });

  it('noto\'g\'ri parol bilan -32504', async () => {
    const wrong = 'Basic ' + Buffer.from('Paycom:guess').toString('base64');
    const res = await payme.handleCallback(perform as any, wrong);
    expect(res.error.code).toBe(-32504);
    expect(prisma.orderPayment.update).not.toHaveBeenCalled();
  });

  it('secret sozlanmagan bo\'lsa hech kimni o\'tkazmaydi', async () => {
    const unconfigured = new PaymeService(config({}), prisma as any);
    const guessed = 'Basic ' + Buffer.from('Paycom:undefined').toString('base64');
    const res = await unconfigured.handleCallback(perform as any, guessed);
    expect(res.error.code).toBe(-32504);
  });

  it('CreateTransaction buyurtmaning yakuniy summasidan farq qilsa rad etadi', async () => {
    prisma.orderPayment.findFirst.mockResolvedValue(null);
    prisma.order.findUnique.mockResolvedValue(order);
    const res = await payme.handleCallback(
      { id: 1, method: 'CreateTransaction', params: { id: 'tx-1', time: 1, amount: 100, account: { order_id: '7' } } } as any,
      paymeAuth,
    );
    expect(res.error.code).toBe(-31001);
    expect(prisma.orderPayment.create).not.toHaveBeenCalled();
  });

  it('CheckPerformTransaction yetkazish va chegirmani o\'z ichiga olgan final_amount bilan solishtiradi', async () => {
    prisma.order.findUnique.mockResolvedValue(order);
    const res = await payme.handleCallback(
      { id: 1, method: 'CheckPerformTransaction', params: { amount: 12500050, account: { order_id: '7' } } } as any,
      paymeAuth,
    );
    expect(res.result.allow).toBe(true);
  });
});

describe('to\'lov yaratish', () => {
  const cases: Array<[string, (prisma: any) => any]> = [
    ['Payme', (p) => new PaymeService(config({ PAYME_SECRET_KEY: PAYME_SECRET, FRONTEND_URL: 'http://x' }), p)],
    ['Click', (p) => new ClickService(config({ CLICK_SECRET_KEY: 's', CLICK_SERVICE_ID: '1', FRONTEND_URL: 'http://x' }), p)],
    ['Uzum', (p) => new UzumService(config({ UZUM_SECRET_KEY: 's', UZUM_API_KEY: 'k', FRONTEND_URL: 'http://x' }), p)],
  ];

  it.each(cases)('%s: birovning buyurtmasiga to\'lov ochib bo\'lmaydi', async (_name, make) => {
    const prisma = prismaMock();
    prisma.order.findUnique.mockResolvedValue({ ...order, user_id: 999 });
    await expect(make(prisma).createPayment({ order_id: 7, user_id: 1 })).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.orderPayment.create).not.toHaveBeenCalled();
  });

  it.each(cases.filter(([n]) => n !== 'Uzum'))('%s: summa mijozdan emas, order.final_amount dan olinadi', async (_name, make) => {
    const prisma = prismaMock();
    prisma.order.findUnique.mockResolvedValue(order);
    // Mijoz eski frontend orqali `amount: 1` yuborsa ham u e'tiborga olinmaydi.
    await make(prisma).createPayment({ order_id: 7, user_id: 1, amount: 1 } as any);
    expect(prisma.orderPayment.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ amount: 125000.5 }) }),
    );
  });
});

describe('Click va Uzum imzosi', () => {
  it('Click: secret sozlanmagan bo\'lsa callback rad etiladi', async () => {
    const prisma = prismaMock();
    const click = new ClickService(config({ CLICK_SERVICE_ID: '1' }), prisma as any);
    const res = await click.handleCallback({
      click_trans_id: 1, service_id: 1, merchant_trans_id: 'ORDER_7_1', amount: 1,
      action: 1, sign_time: 't', sign_string: 'anything',
    } as any);
    expect(res.error).toBe(-1);
    expect(prisma.orderPayment.findFirst).not.toHaveBeenCalled();
  });

  it('Uzum: secret sozlanmagan bo\'lsa callback rad etiladi', async () => {
    const prisma = prismaMock();
    const uzum = new UzumService(config({}), prisma as any);
    const res = await uzum.handleCallback({ transaction_id: 'tx', status: 'success', signature: 'x' } as any);
    expect(res.success).toBe(false);
    expect(prisma.orderPayment.findFirst).not.toHaveBeenCalled();
  });
});

describe('safeEqual', () => {
  it('faqat aynan teng satrlarni qabul qiladi', () => {
    expect(safeEqual('abc', 'abc')).toBe(true);
    expect(safeEqual('abc', 'abd')).toBe(false);
    expect(safeEqual('abc', 'abcd')).toBe(false);
    expect(safeEqual(undefined, 'abc')).toBe(false);
    expect(safeEqual(undefined, undefined)).toBe(false);
  });
});
