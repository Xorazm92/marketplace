import { Logger } from '@nestjs/common';
import { CLICK_SERVICE, createAddress, createTestApp, loginAdmin, loginUser, PAYME_KEY, paymeAuth, resetDatabase, seedCatalog, TestApp } from './harness';

describe('prod tayyorgarligi (e2e)', () => {
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
    t.sms.fail = false;
  });

  describe("bo'limlar ro'yxati", () => {
    it("GET /category mahsulotlarni yuklamaydi va sort_order bo'yicha tartiblangan", async () => {
      const { product } = await seedCatalog(t);
      const second = await t.prisma.category.create({ data: { name: 'Kitoblar', slug: 'kitoblar', sort_order: 2 } });
      const first = await t.prisma.category.create({ data: { name: 'Oyinchoqlar', slug: 'oyinchoqlar', sort_order: 1 } });
      await t.prisma.category.create({ data: { name: 'Yashirin', slug: 'yashirin', sort_order: 0, is_active: false } });
      await t.prisma.product.createMany({
        data: Array.from({ length: 40 }, (_, i) => ({ title: `M${i}`, slug: `m-${i}`, description: 'x', price: 1000, currency_id: product.currency_id, category_id: first.id, is_checked: 'APPROVED' as const })),
      });

      const res = await t.http().get('/api/v1/category').expect(200);
      expect(res.body.map((c: { id: number }) => c.id)).toEqual([first.id, second.id]);
      // Bosh sahifa va katalog har ochilganda shu ro'yxatni so'raydi: unga butun katalog ilashmasin.
      expect(res.body[0]).not.toHaveProperty('products');
      expect(JSON.stringify(res.body).length).toBeLessThan(1000);
    });

    it("GET /category/:id faqat sotuvdagi mahsulotlarni, cheklangan sonda qaytaradi", async () => {
      const { product } = await seedCatalog(t);
      const category = await t.prisma.category.create({ data: { name: 'Oyinchoqlar', slug: 'oyinchoqlar' } });
      const base = { description: 'x', price: 1000, currency_id: product.currency_id, category_id: category.id };
      await t.prisma.product.createMany({
        data: [
          ...Array.from({ length: 40 }, (_, i) => ({ ...base, title: `M${i}`, slug: `m-${i}`, is_checked: 'APPROVED' as const })),
          { ...base, title: 'Tasdiqlanmagan', slug: 'pending', is_checked: 'PENDING' as const },
          { ...base, title: 'Ochirilgan', slug: 'deleted', is_checked: 'APPROVED' as const, is_deleted: true },
        ],
      });
      for (const path of [`/api/v1/category/${category.id}`, '/api/v1/category/slug/oyinchoqlar']) {
        const res = await t.http().get(path).expect(200);
        expect(res.body.products).toHaveLength(24);
        expect(res.body.products.map((p: { title: string }) => p.title)).not.toEqual(expect.arrayContaining(['Tasdiqlanmagan', 'Ochirilgan']));
      }
      await t.http().get('/api/v1/category/999999').expect(404);
    });
  });

  describe('SMS provayderi ishlamasa', () => {
    it("kod yozuvi qolmaydi: xaridor kutmasdan qayta urina oladi va urinish chegaraga kirmaydi", async () => {
      const send = () => t.http().post('/api/v1/auth/otp/send').send({ phone_number: '+998901112233' });
      t.sms.fail = true;
      await send().expect(503);
      await send().expect(503);
      expect(await t.prisma.otpVerification.count()).toBe(0);

      t.sms.fail = false;
      await send().expect(200);
      expect(t.sent).toHaveLength(1);
      // Muvaffaqiyatli yuborilgandan keyin odatdagi 1 daqiqalik kutish ishlaydi.
      await send().expect(429);
    });

    it('yuborilmagan yangi kod avvalgi (yetib borgan) kodni bekor qilmaydi', async () => {
      const phone = '+998901112233';
      await t.http().post('/api/v1/auth/otp/send').send({ phone_number: phone }).expect(200);
      const code = t.sent[0].message.match(/\d{6}/)![0];
      await t.prisma.otpVerification.updateMany({ data: { createdAt: new Date(Date.now() - 2 * 60_000) } });
      t.sms.fail = true;
      await t.http().post('/api/v1/auth/otp/send').send({ phone_number: phone }).expect(503);
      await t.http().post('/api/v1/auth/otp/verify').send({ phone_number: phone, code }).expect(200);
    });
  });

  describe('holat endpointlari', () => {
    it('/health/live jarayonni, /ready va /health bazani tekshiradi', async () => {
      expect((await t.http().get('/health/live').expect(200)).body).toEqual(expect.objectContaining({ status: 'ok' }));
      expect((await t.http().get('/ready').expect(200)).body).toEqual(expect.objectContaining({ status: 'ok', database: 'up' }));
      expect((await t.http().get('/health').expect(200)).body).toEqual(expect.objectContaining({ status: 'ok', database: 'up' }));

      const down = jest.spyOn(t.prisma, '$queryRaw').mockRejectedValue(new Error('connection refused'));
      try {
        // Baza yo'q: trafik qabul qilinmasin (503), lekin jarayon tirik — qayta ishga tushirish shart emas.
        const ready = await t.http().get('/ready').expect(503);
        expect(JSON.stringify(ready.body)).not.toContain('connection refused');
        await t.http().get('/health').expect(503);
        await t.http().get('/health/live').expect(200);
      } finally {
        down.mockRestore();
      }
    });
  });

  describe('hodisalar logi', () => {
    it("to'lov, kirish va buyurtma hodisalari yoziladi — secret, parol, kod va to'liq raqamsiz", async () => {
      const lines: string[] = [];
      const spies = (['log', 'warn', 'error'] as const).map((level) =>
        jest.spyOn(Logger.prototype, level).mockImplementation((...args: unknown[]) => void lines.push(JSON.stringify(args))),
      );
      const event = (name: string, extra = '') => lines.filter((line) => line.includes(`"event":"${name}"`) && line.includes(extra));
      try {
        const { product, region } = await seedCatalog(t);
        const admin = await loginAdmin(t);
        expect(admin).toBeTruthy();
        await t.http().post('/api/v1/admin/auth/login').send({ phone_number: '+998909990000', password: 'xato-parol-12345' }).expect(401);
        expect(event('admin_login', '"ok":true')).toHaveLength(1);
        expect(event('admin_login', '"ok":false')).toHaveLength(1);

        const user = await loginUser(t, '+998901112233');
        expect(event('auth_login', `"user_id":${user.user.id}`)).toHaveLength(1);

        const addressId = await createAddress(t, user.access_token, region.id);
        const order = await t.http()
          .post('/api/v1/orders')
          .set('Authorization', `Bearer ${user.access_token}`)
          .send({ items: [{ product_id: product.id, quantity: 1 }], address_id: addressId, payment_method: 'PAYME' })
          .expect(201);
        expect(event('order_created', `"order_id":${order.body.id}`)).toHaveLength(1);

        const rpc = (method: string, params: object, auth = paymeAuth) =>
          t.http().post('/api/v1/payments/payme').set('Authorization', auth).send({ jsonrpc: '2.0', id: 1, method, params });
        await rpc('PerformTransaction', { id: 'x' }, 'Basic c29tZS1ndWVzc2VkLWtleQ==');
        expect(event('payme', '-32504')).toHaveLength(1);
        const account = { order_id: String(order.body.id) };
        await rpc('CreateTransaction', { id: 'pm-log', time: Date.now(), amount: 11500000, account });
        await rpc('PerformTransaction', { id: 'pm-log' });
        expect(event('payme', '"method":"PerformTransaction"').filter((line) => line.includes('pm-log'))).toHaveLength(1);
        expect(event('order_paid', `"order_id":${order.body.id}`)).toHaveLength(1);

        await t.http().post('/api/v1/payments/click/prepare').type('form').send({ click_trans_id: 9, service_id: CLICK_SERVICE, merchant_trans_id: '1', amount: '1', action: 0, error: 0, sign_time: 't', sign_string: 'soxta-imzo-qiymati' });
        expect(event('click', '"error":-1')).toHaveLength(1);

        const everything = lines.join('\n');
        for (const secret of [PAYME_KEY, paymeAuth, 'c29tZS1ndWVzc2VkLWtleQ', 'xato-parol-12345', 'admin-password-123', 'soxta-imzo-qiymati', '901112233', '909990000', user.access_token, t.sent[0].message.match(/\d{6}/)![0]]) {
          expect(everything).not.toContain(secret);
        }
      } finally {
        spies.forEach((spy) => spy.mockRestore());
      }
    });
  });
});
