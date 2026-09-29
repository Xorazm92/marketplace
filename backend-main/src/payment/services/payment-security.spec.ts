import { ConfigService } from '@nestjs/config';
import { PaymeService } from '../../payments/payme.service';
import { ClickService } from '../../payments/click.service';
import { safeEqual } from '../../common/security/safe-equal';

// Tez (bazasiz) regressiya: callback'lar autentifikatsiyasiz bazaga tegmaydi.
// To'liq protokol oqimi: test/mvp/payments.e2e-spec.ts.

const config = (values: Record<string, string>) => ({ get: (key: string) => values[key] }) as unknown as ConfigService;
const prisma: any = { order: { findUnique: jest.fn() }, orderPayment: { findUnique: jest.fn(), upsert: jest.fn(), findFirst: jest.fn() } };

beforeEach(() => jest.clearAllMocks());

describe('Payme autentifikatsiyasi', () => {
  const perform = { id: 42, method: 'PerformTransaction', params: { id: 'tx' } };

  it.each([
    ['sarlavhasiz', undefined],
    ["noto'g'ri parol", 'Basic ' + Buffer.from('Paycom:guess').toString('base64')],
  ])('%s → -32504', async (_name, auth) => {
    const payme = new PaymeService(prisma, {} as any, config({ PAYME_SECRET_KEY: 'k' }));
    const res: any = await payme.handle(perform, auth);
    expect(res.error.code).toBe(-32504);
    expect(res.id).toBe(42);
    expect(prisma.orderPayment.findUnique).not.toHaveBeenCalled();
  });

  it('kalit sozlanmagan bo\'lsa hech kimni o\'tkazmaydi', async () => {
    const payme = new PaymeService(prisma, {} as any, config({}));
    const res: any = await payme.handle(perform, 'Basic ' + Buffer.from('Paycom:undefined').toString('base64'));
    expect(res.error.code).toBe(-32504);
  });
});

describe('Click imzosi', () => {
  it('secret sozlanmagan bo\'lsa Prepare rad etiladi', async () => {
    const click = new ClickService(prisma, config({ CLICK_SERVICE_ID: '1' }));
    const res: any = await click.prepare({ click_trans_id: 1, service_id: 1, merchant_trans_id: '1', amount: 1, action: 0, error: 0, sign_time: 't', sign_string: 'x' });
    expect(res.error).toBe(-1);
    expect(prisma.order.findUnique).not.toHaveBeenCalled();
  });
});

describe('safeEqual', () => {
  it('faqat aynan teng satrlarni qabul qiladi', () => {
    expect(safeEqual('abc', 'abc')).toBe(true);
    expect(safeEqual('abc', 'abd')).toBe(false);
    expect(safeEqual('abc', 'abcd')).toBe(false);
    expect(safeEqual(undefined, 'abc')).toBe(false);
  });
});
