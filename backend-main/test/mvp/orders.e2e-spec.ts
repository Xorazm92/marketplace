import { createAddress, createTestApp, loginAdmin, loginUser, resetDatabase, seedCatalog, TestApp } from './harness';

describe('buyurtmalar (e2e)', () => {
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

  async function setup(stock = 5, price = 100000) {
    const { product, region } = await seedCatalog(t, { stock, price });
    const user = await loginUser(t);
    const addressId = await createAddress(t, user.access_token, region.id);
    const order = (body: object, token = user.access_token) =>
      t.http().post('/api/v1/orders').set('Authorization', `Bearer ${token}`).send(body);
    return { product, region, user, addressId, order };
  }

  it('narx bazadan, yetkazish serverda; mijoz narx yubora olmaydi', async () => {
    const { product, addressId, order } = await setup();
    await order({ items: [{ product_id: product.id, quantity: 2, unit_price: 1 }], address_id: addressId, payment_method: 'CASH' }).expect(400);
    const res = await order({ items: [{ product_id: product.id, quantity: 2 }], address_id: addressId, payment_method: 'CASH' }).expect(201);
    expect(res.body).toEqual(expect.objectContaining({ total_amount: 200000, shipping_amount: 15000, final_amount: 215000, status: 'PENDING' }));
    expect(res.body.items[0].unit_price).toBe(100000);
    expect((await t.prisma.inventory.findFirst())!.stock_quantity).toBe(3);
  });

  it('FREE_SHIPPING_FROM dan yuqori summada yetkazish bepul', async () => {
    const { product, addressId, order } = await setup(10, 300000);
    const res = await order({ items: [{ product_id: product.id, quantity: 2 }], address_id: addressId, payment_method: 'CASH' }).expect(201);
    expect(res.body.shipping_amount).toBe(0);
  });

  it('birovning manzili bilan buyurtma berib bo\'lmaydi', async () => {
    const { product, region, order } = await setup();
    const other = await loginUser(t, '+998907776655');
    const foreignAddress = await createAddress(t, other.access_token, region.id);
    await order({ items: [{ product_id: product.id, quantity: 1 }], address_id: foreignAddress, payment_method: 'CASH' }).expect(400);
  });

  it('boshqa foydalanuvchining buyurtmasi va manzili ko\'rinmaydi', async () => {
    const { product, addressId, order } = await setup();
    const created = await order({ items: [{ product_id: product.id, quantity: 1 }], address_id: addressId, payment_method: 'CASH' }).expect(201);
    const other = await loginUser(t, '+998907776655');
    const auth = { Authorization: `Bearer ${other.access_token}` };
    await t.http().get(`/api/v1/orders/${created.body.id}`).set(auth).expect(404);
    await t.http().post(`/api/v1/orders/${created.body.id}/cancel`).set(auth).expect(404);
    await t.http().patch(`/api/v1/addresses/${addressId}`).set(auth).send({ name: 'x' }).expect(404);
    await t.http().delete(`/api/v1/addresses/${addressId}`).set(auth).expect(404);
    await t.http().post(`/api/v1/payments/checkout/${created.body.id}`).set(auth).expect(404);
  });

  it('oxirgi donani parallel ikki buyurtma sotib ololmaydi', async () => {
    const { product, addressId, order } = await setup(1);
    const results = await Promise.all(
      [0, 1, 2].map(() => order({ items: [{ product_id: product.id, quantity: 1 }], address_id: addressId, payment_method: 'CASH' })),
    );
    expect(results.map((r) => r.status).sort()).toEqual([201, 400, 400]);
    expect((await t.prisma.inventory.findFirst())!.stock_quantity).toBe(0);
  });

  it('bekor qilish zaxirani qaytaradi, takroriy bekor qilish ikki marta qaytarmaydi', async () => {
    const { product, addressId, order, user } = await setup(5);
    const created = await order({ items: [{ product_id: product.id, quantity: 2 }], address_id: addressId, payment_method: 'CASH' }).expect(201);
    const auth = { Authorization: `Bearer ${user.access_token}` };
    await t.http().post(`/api/v1/orders/${created.body.id}/cancel`).set(auth).expect(201);
    await t.http().post(`/api/v1/orders/${created.body.id}/cancel`).set(auth).expect(400);
    expect((await t.prisma.inventory.findFirst())!.stock_quantity).toBe(5);
  });

  it('naqd buyurtma: admin o\'tishlari, "yetkazildi" to\'lovni yopadi', async () => {
    const { product, addressId, order } = await setup();
    const created = await order({ items: [{ product_id: product.id, quantity: 1 }], address_id: addressId, payment_method: 'CASH' }).expect(201);
    const admin = await loginAdmin(t);
    const move = (status: string) =>
      t.http().patch(`/api/v1/admin/orders/${created.body.id}/status`).set('Authorization', `Bearer ${admin}`).send({ status });
    await move('DELIVERED').expect(400);
    await move('CONFIRMED').expect(200);
    await move('SHIPPED').expect(200);
    const done = await move('DELIVERED').expect(200);
    expect(done.body).toEqual(expect.objectContaining({ status: 'DELIVERED', payment_status: 'PAID' }));
    expect(done.body.payments).toEqual([expect.objectContaining({ payment_method: 'CASH', status: 'PAID', amount: 115000 })]);
    await move('CANCELLED').expect(400);
  });

  it('parallel ikki "yetkazildi" naqd to\'lovni bir marta yozadi', async () => {
    const { product, addressId, order } = await setup();
    const created = await order({ items: [{ product_id: product.id, quantity: 1 }], address_id: addressId, payment_method: 'CASH' }).expect(201);
    const admin = await loginAdmin(t);
    const move = (status: string) =>
      t.http().patch(`/api/v1/admin/orders/${created.body.id}/status`).set('Authorization', `Bearer ${admin}`).send({ status });
    await move('CONFIRMED').expect(200);
    await move('SHIPPED').expect(200);
    const results = await Promise.all([move('DELIVERED'), move('DELIVERED'), move('DELIVERED')]);
    // Yutqazganlar: 409 (shartli yozuv o'tmadi) yoki 400 (yutgandan keyin o'qidi).
    expect(results.filter((r) => r.status === 200)).toHaveLength(1);
    expect(results.every((r) => [200, 400, 409].includes(r.status))).toBe(true);
    expect(await t.prisma.orderPayment.count({ where: { order_id: created.body.id } })).toBe(1);
    expect(await t.prisma.orderTracking.count({ where: { order_id: created.body.id, status: 'DELIVERED' } })).toBe(1);
  });

  it('admin tasdiqlashi va xaridor bekor qilishi bir vaqtda kelsa zaxira holatga mos qoladi', async () => {
    for (let round = 0; round < 5; round++) {
      await resetDatabase(t.prisma);
      t.sent.length = 0;
      const { product, addressId, order, user } = await setup(5);
      const created = await order({ items: [{ product_id: product.id, quantity: 2 }], address_id: addressId, payment_method: 'CASH' }).expect(201);
      const admin = await loginAdmin(t);
      await Promise.all([
        t.http().patch(`/api/v1/admin/orders/${created.body.id}/status`).set('Authorization', `Bearer ${admin}`).send({ status: 'CONFIRMED' }),
        t.http().post(`/api/v1/orders/${created.body.id}/cancel`).set('Authorization', `Bearer ${user.access_token}`),
      ]);
      const fresh = await t.prisma.order.findUniqueOrThrow({ where: { id: created.body.id } });
      const stock = (await t.prisma.inventory.findFirst())!.stock_quantity;
      // Bekor qilingan bo'lsa zaxira qaytgan, tasdiqlangan bo'lsa band — aralash holat yo'q.
      expect([fresh.status, stock]).toEqual(fresh.status === 'CANCELLED' ? ['CANCELLED', 5] : ['CONFIRMED', 3]);
    }
  });

  it('bir xil mahsulotlarni teskari tartibda parallel buyurtma qilish deadlock bermaydi', async () => {
    const { product, addressId, order } = await setup(100);
    const second = await t.prisma.product.create({
      data: { title: 'Kitob', slug: 'kitob', description: 'x', price: 20000, currency_id: product.currency_id, is_checked: 'APPROVED', inventory: { create: { stock_quantity: 100 } } },
    });
    const forward = [{ product_id: product.id, quantity: 1 }, { product_id: second.id, quantity: 1 }];
    const results = await Promise.all(
      Array.from({ length: 12 }, (_, i) => order({ items: i % 2 ? forward : [...forward].reverse(), address_id: addressId, payment_method: 'CASH' })),
    );
    expect(results.map((r) => r.status)).toEqual(Array(12).fill(201));
    const stocks = await t.prisma.inventory.findMany({ orderBy: { product_id: 'asc' } });
    expect(stocks.map((s) => s.stock_quantity)).toEqual([88, 88]);
  });

  it('onlayn to\'lanmagan buyurtmani admin tasdiqlay olmaydi', async () => {
    const { product, addressId, order } = await setup();
    const created = await order({ items: [{ product_id: product.id, quantity: 1 }], address_id: addressId, payment_method: 'PAYME' }).expect(201);
    const admin = await loginAdmin(t);
    await t.http().patch(`/api/v1/admin/orders/${created.body.id}/status`).set('Authorization', `Bearer ${admin}`).send({ status: 'CONFIRMED' }).expect(400);
  });

  it('o\'chirilgan to\'lov usuli bilan buyurtma berilmaydi', async () => {
    const { product, addressId, order } = await setup();
    await order({ items: [{ product_id: product.id, quantity: 1 }], address_id: addressId, payment_method: 'UZUM' }).expect(400);
  });

  it('24 soatda to\'lanmagan onlayn buyurtma bekor bo\'ladi va zaxira qaytadi', async () => {
    const { product, addressId, order } = await setup(5);
    const created = await order({ items: [{ product_id: product.id, quantity: 2 }], address_id: addressId, payment_method: 'CLICK' }).expect(201);
    await t.prisma.order.update({ where: { id: created.body.id }, data: { createdAt: new Date(Date.now() - 25 * 3600_000) } });
    const { OrderService } = await import('../../src/order/order.service');
    expect(await t.app.get(OrderService).expireUnpaidOrders()).toBe(1);
    expect((await t.prisma.order.findUnique({ where: { id: created.body.id } }))!.status).toBe('CANCELLED');
    expect((await t.prisma.inventory.findFirst())!.stock_quantity).toBe(5);
  });

  it('ochiq to\'lov tranzaksiyasi: Payme kutiladi, Click Prepare faqat yangi bo\'lsa kutiladi', async () => {
    const { product, addressId, order } = await setup(5);
    const place = async (payment_method: string) => {
      const res = await order({ items: [{ product_id: product.id, quantity: 1 }], address_id: addressId, payment_method }).expect(201);
      await t.prisma.order.update({ where: { id: res.body.id }, data: { createdAt: new Date(Date.now() - 25 * 3600_000) } });
      return res.body.id as number;
    };
    const payme = await place('PAYME');
    const clickFresh = await place('CLICK');
    const clickStale = await place('CLICK');
    const payment = { amount: 115000, status: 'PENDING' as const };
    await t.prisma.orderPayment.create({ data: { ...payment, order_id: payme, payment_method: 'PAYME', transaction_id: 'pm-open', provider_state: 1 } });
    await t.prisma.orderPayment.create({ data: { ...payment, order_id: clickFresh, payment_method: 'CLICK', transaction_id: '1', provider_state: 0 } });
    await t.prisma.orderPayment.create({
      data: { ...payment, order_id: clickStale, payment_method: 'CLICK', transaction_id: '2', provider_state: 0, createdAt: new Date(Date.now() - 2 * 3600_000) },
    });

    const { OrderService } = await import('../../src/order/order.service');
    expect(await t.app.get(OrderService).expireUnpaidOrders()).toBe(1);
    const status = async (id: number) => (await t.prisma.order.findUniqueOrThrow({ where: { id } })).status;
    expect([await status(payme), await status(clickFresh), await status(clickStale)]).toEqual(['PENDING', 'PENDING', 'CANCELLED']);
    expect((await t.prisma.inventory.findFirst())!.stock_quantity).toBe(3);
  });
});
