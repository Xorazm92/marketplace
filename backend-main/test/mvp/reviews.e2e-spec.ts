import { createAddress, createTestApp, loginAdmin, loginUser, resetDatabase, seedCatalog, TestApp } from './harness';

describe('sharhlar (e2e)', () => {
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

  it('faqat yetkazilgan xarid uchun, bitta marta; ochiq ro\'yxatda telefon chiqmaydi', async () => {
    const { product, region } = await seedCatalog(t);
    const buyer = await loginUser(t, '+998901112233');
    const auth = { Authorization: `Bearer ${buyer.access_token}` };
    const body = { product_id: product.id, rating: 5, comment: 'Zo\'r' };

    await t.http().post('/api/v1/reviews').set(auth).send(body).expect(400);

    const addressId = await createAddress(t, buyer.access_token, region.id);
    const order = await t.http().post('/api/v1/orders').set(auth).send({ items: [{ product_id: product.id, quantity: 1 }], address_id: addressId, payment_method: 'CASH' }).expect(201);
    // Hali yetkazilmagan buyurtma yetmaydi.
    await t.http().post('/api/v1/reviews').set(auth).send(body).expect(400);

    const admin = await loginAdmin(t);
    for (const status of ['CONFIRMED', 'SHIPPED', 'DELIVERED']) {
      await t.http().patch(`/api/v1/admin/orders/${order.body.id}/status`).set('Authorization', `Bearer ${admin}`).send({ status }).expect(200);
    }

    const created = await t.http().post('/api/v1/reviews').set(auth).send(body).expect(201);
    expect(created.body).toEqual(expect.objectContaining({ rating: 5, is_verified: true }));
    await t.http().post('/api/v1/reviews').set(auth).send(body).expect(409);

    const list = await t.http().get(`/api/v1/reviews/product/${product.id}`).expect(200);
    expect(list.body.items).toHaveLength(1);
    expect(list.body.items[0].user).toEqual({ first_name: 'Test' });
    expect(JSON.stringify(list.body)).not.toContain('+998');

    const stats = await t.http().get(`/api/v1/reviews/product/${product.id}/stats`).expect(200);
    expect(stats.body).toEqual({ average: 5, count: 1, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 } });

    // Boshqa foydalanuvchi o'zgartira ham, o'chira ham olmaydi.
    const other = await loginUser(t, '+998907776655');
    const otherAuth = { Authorization: `Bearer ${other.access_token}` };
    await t.http().patch(`/api/v1/reviews/${created.body.id}`).set(otherAuth).send({ rating: 1 }).expect(404);
    await t.http().delete(`/api/v1/reviews/${created.body.id}`).set(otherAuth).expect(404);

    await t.http().patch(`/api/v1/reviews/${created.body.id}`).set(auth).send({ rating: 4 }).expect(200);
    await t.http().delete(`/api/v1/reviews/${created.body.id}`).set(auth).expect(200);
  });

  it('soxta "foydali"/"shikoyat" endpoint\'lari yo\'q', async () => {
    const user = await loginUser(t);
    await t.http().post('/api/v1/reviews/1/helpful').set('Authorization', `Bearer ${user.access_token}`).expect(404);
    await t.http().post('/api/v1/reviews/1/report').set('Authorization', `Bearer ${user.access_token}`).expect(404);
  });
});
