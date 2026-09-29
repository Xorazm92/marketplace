import { CLICK_SERVICE, clickSign, createAddress, createTestApp, loginUser, paymeAuth, resetDatabase, seedCatalog, TestApp } from './harness';

describe("to'lovlar (e2e)", () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });
  afterAll(async () => {
    await t.app.close();
  });
  beforeEach(async () => {
    await resetDatabase(t.prisma);
    t.sent.length = 0;
  });

  async function placeOrder(method: 'PAYME' | 'CLICK', stock = 5) {
    const { product, region } = await seedCatalog(t, { stock, price: 100000 });
    const user = await loginUser(t);
    const addressId = await createAddress(t, user.access_token, region.id);
    const res = await t.http()
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${user.access_token}`)
      .send({ items: [{ product_id: product.id, quantity: 1 }], address_id: addressId, payment_method: method })
      .expect(201);
    return { order: res.body, user }; // final_amount = 100000 + 15000
  }

  describe('Payme', () => {
    const rpc = (method: string, params: object, auth = paymeAuth) =>
      t.http().post('/api/v1/payments/payme').set('Authorization', auth).send({ jsonrpc: '2.0', id: 7, method, params });

    it('Authorization\'siz -32504, bazaga tegmaydi', async () => {
      const res = await t.http().post('/api/v1/payments/payme').send({ id: 1, method: 'PerformTransaction', params: { id: 'x' } }).expect(200);
      expect(res.body.error.code).toBe(-32504);
      expect(res.body.id).toBe(1);
    });

    it("to'liq oqim: Check → Create → Perform, takroriy chaqiruvlar idempotent", async () => {
      const { order, user } = await placeOrder('PAYME');
      const account = { order_id: String(order.id) };

      expect((await rpc('CheckPerformTransaction', { amount: 100, account })).body.error.code).toBe(-31001);
      expect((await rpc('CheckPerformTransaction', { amount: 11500000, account: { order_id: '999' } })).body.error.code).toBe(-31050);
      expect((await rpc('CheckPerformTransaction', { amount: 11500000, account })).body.result).toEqual({ allow: true });

      const create = await rpc('CreateTransaction', { id: 'pm-1', time: Date.now(), amount: 11500000, account });
      expect(create.body.result.state).toBe(1);
      const again = await rpc('CreateTransaction', { id: 'pm-1', time: Date.now(), amount: 11500000, account });
      expect(again.body.result.transaction).toBe(create.body.result.transaction);
      // Bitta buyurtmaga ikkinchi ochiq tranzaksiya yo'q.
      expect((await rpc('CreateTransaction', { id: 'pm-2', time: Date.now(), amount: 11500000, account })).body.error.code).toBe(-31050);

      const perform = await rpc('PerformTransaction', { id: 'pm-1' });
      expect(perform.body.result.state).toBe(2);
      const performAgain = await rpc('PerformTransaction', { id: 'pm-1' });
      expect(performAgain.body.result.perform_time).toBe(perform.body.result.perform_time);

      const mine = await t.http().get(`/api/v1/orders/${order.id}`).set('Authorization', `Bearer ${user.access_token}`).expect(200);
      expect(mine.body).toEqual(expect.objectContaining({ status: 'CONFIRMED', payment_status: 'PAID' }));
      expect(await t.prisma.orderPayment.count()).toBe(1);

      const check = await rpc('CheckTransaction', { id: 'pm-1' });
      expect(check.body.result).toEqual(expect.objectContaining({ state: 2, reason: null }));
      const statement = await rpc('GetStatement', { from: 0, to: Date.now() + 1000 });
      expect(statement.body.result.transactions).toHaveLength(1);
    });

    it('bajarilgandan keyin bekor qilish: pul qaytadi, zaxira tiklanadi', async () => {
      const { order } = await placeOrder('PAYME', 5);
      const account = { order_id: String(order.id) };
      await rpc('CreateTransaction', { id: 'pm-1', time: Date.now(), amount: 11500000, account });
      await rpc('PerformTransaction', { id: 'pm-1' });
      const cancel = await rpc('CancelTransaction', { id: 'pm-1', reason: 5 });
      expect(cancel.body.result.state).toBe(-2);
      const fresh = await t.prisma.order.findUniqueOrThrow({ where: { id: order.id } });
      expect(fresh).toEqual(expect.objectContaining({ status: 'CANCELLED', payment_status: 'REFUNDED' }));
      expect((await t.prisma.inventory.findFirst())!.stock_quantity).toBe(5);
      // Takroriy bekor qilish zaxirani yana qo'shmaydi.
      await rpc('CancelTransaction', { id: 'pm-1', reason: 5 });
      expect((await t.prisma.inventory.findFirst())!.stock_quantity).toBe(5);
    });

    it('yetkazilgan buyurtmada pul qaytarish rad etiladi (-31007)', async () => {
      const { order } = await placeOrder('PAYME');
      const account = { order_id: String(order.id) };
      await rpc('CreateTransaction', { id: 'pm-1', time: Date.now(), amount: 11500000, account });
      await rpc('PerformTransaction', { id: 'pm-1' });
      await t.prisma.order.update({ where: { id: order.id }, data: { status: 'DELIVERED' } });
      expect((await rpc('CancelTransaction', { id: 'pm-1', reason: 5 })).body.error.code).toBe(-31007);
    });

    it('12 soatdan eski tranzaksiya bajarilmaydi, buyurtma qayta to\'lash uchun ochiq qoladi', async () => {
      const { order } = await placeOrder('PAYME');
      const account = { order_id: String(order.id) };
      await rpc('CreateTransaction', { id: 'pm-old', time: Date.now() - 13 * 3600_000, amount: 11500000, account });
      expect((await rpc('PerformTransaction', { id: 'pm-old' })).body.error.code).toBe(-31008);
      expect((await rpc('CheckTransaction', { id: 'pm-old' })).body.result).toEqual(expect.objectContaining({ state: -1, reason: 4 }));
      expect((await rpc('CreateTransaction', { id: 'pm-new', time: Date.now(), amount: 11500000, account })).body.result.state).toBe(1);
    });

    it('checkout URL summani buyurtmadan oladi', async () => {
      const { order, user } = await placeOrder('PAYME');
      const res = await t.http().post(`/api/v1/payments/checkout/${order.id}`).set('Authorization', `Bearer ${user.access_token}`).expect(200);
      const decoded = Buffer.from(res.body.payment_url.split('/').pop(), 'base64').toString();
      expect(decoded).toContain(`ac.order_id=${order.id};a=11500000;`);
    });
  });

  describe('Click', () => {
    const base = (orderId: number, extra: Record<string, string | number> = {}) => ({
      click_trans_id: 555,
      service_id: CLICK_SERVICE,
      click_paydoc_id: 1,
      merchant_trans_id: String(orderId),
      amount: '115000.00',
      action: 0,
      error: 0,
      error_note: 'Success',
      sign_time: '2026-09-29 12:00:00',
      ...extra,
    });
    const prepare = (p: Record<string, any>) => t.http().post('/api/v1/payments/click/prepare').type('form').send({ ...p, sign_string: clickSign(p, false) });
    const complete = (p: Record<string, any>) => t.http().post('/api/v1/payments/click/complete').type('form').send({ ...p, sign_string: clickSign(p, true) });

    it('Prepare → Complete (form-urlencoded), takroriy Complete -4', async () => {
      const { order } = await placeOrder('CLICK');
      const prep = await prepare(base(order.id)).expect(200);
      expect(prep.body).toEqual(expect.objectContaining({ error: 0, merchant_prepare_id: expect.any(Number) }));

      const done = await complete(base(order.id, { action: 1, merchant_prepare_id: prep.body.merchant_prepare_id })).expect(200);
      expect(done.body).toEqual(expect.objectContaining({ error: 0, merchant_confirm_id: prep.body.merchant_prepare_id }));
      expect((await t.prisma.order.findUniqueOrThrow({ where: { id: order.id } })).payment_status).toBe('PAID');

      const dup = await complete(base(order.id, { action: 1, merchant_prepare_id: prep.body.merchant_prepare_id })).expect(200);
      expect(dup.body.error).toBe(-4);
    });

    it("noto'g'ri imzo -1, noto'g'ri summa -2 (summa so'mda, tiyinda emas)", async () => {
      const { order } = await placeOrder('CLICK');
      const bad = await t.http().post('/api/v1/payments/click/prepare').type('form').send({ ...base(order.id), sign_string: 'x' }).expect(200);
      expect(bad.body.error).toBe(-1);
      expect((await prepare(base(order.id, { amount: '11500000' }))).body.error).toBe(-2);
      expect(await t.prisma.orderPayment.count()).toBe(0);
    });

    it('Click xato bilan yakunlasa tranzaksiya yopiladi, buyurtma ochiq qoladi', async () => {
      const { order } = await placeOrder('CLICK');
      const prep = await prepare(base(order.id));
      const failed = await complete(base(order.id, { action: 1, error: -5017, merchant_prepare_id: prep.body.merchant_prepare_id }));
      expect(failed.body.error).toBe(-9);
      const fresh = await t.prisma.order.findUniqueOrThrow({ where: { id: order.id } });
      expect(fresh).toEqual(expect.objectContaining({ status: 'PENDING', payment_status: 'PENDING' }));
    });
  });
});
