import { createAddress, createTestApp, loginAdmin, loginUser, resetDatabase, seedCatalog, TestApp } from './harness';

describe('auth va katalog (e2e)', () => {
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

  describe('OTP kirish', () => {
    it('yangi raqam bilan hisob ochadi, kod bazada ochiq saqlanmaydi', async () => {
      const session = await loginUser(t, '+998901234567');
      expect(session.user).toEqual(expect.objectContaining({ phone_number: '+998901234567', first_name: 'Test' }));
      expect(session.user).not.toHaveProperty('hashed_refresh_token');
      const code = t.sent[0].message.match(/(\d{6})/)![1];
      const rows = await t.prisma.otpVerification.findMany();
      expect(rows.every((row) => row.otp_code !== code)).toBe(true);
    });

    it('raqamni har xil yozilishini bitta hisobga keltiradi', async () => {
      const a = await loginUser(t, '901234567');
      await t.http().post('/api/v1/auth/otp/send').send({ phone_number: '+998 90 123-45-67' }).expect(429); // 60s kutish
      expect(a.user.id).toBe(1);
    });

    it("5 ta noto'g'ri urinishdan keyin to'g'ri kod ham qabul qilinmaydi", async () => {
      await t.http().post('/api/v1/auth/otp/send').send({ phone_number: '+998901112233' }).expect(200);
      const code = t.sent[0].message.match(/(\d{6})/)![1];
      const wrong = code === '000000' ? '111111' : '000000';
      for (let i = 0; i < 5; i++) {
        await t.http().post('/api/v1/auth/otp/verify').send({ phone_number: '+998901112233', code: wrong }).expect(400);
      }
      await t.http().post('/api/v1/auth/otp/verify').send({ phone_number: '+998901112233', code }).expect(400);
    });

    it('kod ikki marta ishlatilmaydi', async () => {
      await t.http().post('/api/v1/auth/otp/send').send({ phone_number: '+998901112233' }).expect(200);
      const code = t.sent[0].message.match(/(\d{6})/)![1];
      await t.http().post('/api/v1/auth/otp/verify').send({ phone_number: '+998901112233', code }).expect(200);
      await t.http().post('/api/v1/auth/otp/verify').send({ phone_number: '+998901112233', code }).expect(400);
    });

    it('refresh rotatsiyasi: eski refresh token qayta ishlamaydi', async () => {
      const session = await loginUser(t);
      const next = await t.http().post('/api/v1/auth/refresh').send({ refresh_token: session.refresh_token }).expect(200);
      expect(next.body.refresh_token).not.toBe(session.refresh_token);
      await t.http().post('/api/v1/auth/refresh').send({ refresh_token: session.refresh_token }).expect(401);
      await t.http().get('/api/v1/auth/me').set('Authorization', `Bearer ${next.body.access_token}`).expect(200);
    });

    it('bloklangan foydalanuvchi refresh qila olmaydi', async () => {
      const session = await loginUser(t);
      const admin = await loginAdmin(t);
      await t.http().patch(`/api/v1/admin/users/${session.user.id}/active`).set('Authorization', `Bearer ${admin}`).send({ is_active: false }).expect(200);
      await t.http().post('/api/v1/auth/refresh').send({ refresh_token: session.refresh_token }).expect(401);
    });
  });

  describe('token turlari aralashmaydi', () => {
    it('user tokeni admin route\'ga, admin tokeni user route\'ga o\'tmaydi', async () => {
      const user = await loginUser(t);
      const admin = await loginAdmin(t);
      await t.http().get('/api/v1/admin/dashboard').set('Authorization', `Bearer ${user.access_token}`).expect(401);
      await t.http().get('/api/v1/orders').set('Authorization', `Bearer ${admin}`).expect(401);
      await t.http().get('/api/v1/admin/dashboard').set('Authorization', `Bearer ${admin}`).expect(200);
    });

    it('admin yozuv endpoint\'lari tokensiz va xaridor tokeni bilan 401 qaytaradi, bazaga tegmaydi', async () => {
      const { product, region } = await seedCatalog(t);
      const user = await loginUser(t);
      const addressId = await createAddress(t, user.access_token, region.id);
      const order = await t.http()
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${user.access_token}`)
        .send({ items: [{ product_id: product.id, quantity: 1 }], address_id: addressId, payment_method: 'CASH' })
        .expect(201);
      const before = JSON.stringify(await snapshot());

      const writes: Array<[method: 'post' | 'patch' | 'put' | 'delete', path: string, body?: object]> = [
        ['post', '/admin/products', { title: 'Soxta', description: 'x', price: 1 }],
        ['patch', `/admin/products/${product.id}`, { price: 1 }],
        ['delete', `/admin/products/${product.id}`],
        ['put', `/admin/products/${product.id}/stock`, { stock_quantity: 999 }],
        ['post', `/admin/products/${product.id}/images`],
        ['delete', `/admin/products/${product.id}/images/1`],
        ['patch', `/admin/orders/${order.body.id}/status`, { status: 'DELIVERED' }],
        ['patch', `/admin/users/${user.user.id}/active`, { is_active: false }],
        ['post', '/admin/admins', { phone_number: '+998909990009', password: 'long-password-123', first_name: 'X', last_name: 'Y', role: 'ADMIN' }],
        ['patch', '/admin/admins/1/active', { is_active: false }],
        ['post', '/category', { name: 'Soxta', slug: 'soxta' }],
        ['patch', '/category/1', { name: 'Soxta' }],
        ['delete', '/category/1'],
        ['post', '/category/seed'],
        ['post', '/brand', { name: 'Soxta', logo: 'x' }],
        ['post', '/brand/seed'],
        ['put', '/brand/1', { name: 'Soxta' }],
        ['delete', '/brand/1'],
        ['post', '/region', { name: 'Soxta' }],
        ['put', `/region/${region.id}`, { name: 'Soxta' }],
        ['delete', `/region/${region.id}`],
        ['post', '/district', { name: 'Soxta', region_id: region.id }],
        ['put', '/district/1', { name: 'Soxta' }],
        ['delete', '/district/1'],
      ];
      for (const [method, path, body] of writes) {
        for (const auth of [undefined, `Bearer ${user.access_token}`]) {
          const req = t.http()[method](`/api/v1${path}`);
          if (auth) req.set('Authorization', auth);
          const res = await req.send(body);
          expect([method, path, auth ? 'user' : 'anon', res.status]).toEqual([method, path, auth ? 'user' : 'anon', 401]);
        }
      }
      // Admin o'qish endpoint'lari ham yopiq: xaridorlar ro'yxati va buyurtmalar — shaxsiy ma'lumot.
      for (const path of ['/admin/orders', `/admin/orders/${order.body.id}`, '/admin/users', '/admin/products', '/admin/admins', '/admin/auth/me']) {
        await t.http().get(`/api/v1${path}`).set('Authorization', `Bearer ${user.access_token}`).expect(401);
      }
      expect(JSON.stringify(await snapshot())).toBe(before);

      async function snapshot() {
        return {
          products: await t.prisma.product.findMany({ select: { id: true, price: true, is_deleted: true, is_active: true }, orderBy: { id: 'asc' } }),
          stock: await t.prisma.inventory.findMany({ select: { stock_quantity: true } }),
          orders: await t.prisma.order.findMany({ select: { status: true, payment_status: true } }),
          users: await t.prisma.user.findMany({ select: { is_active: true } }),
          counts: [await t.prisma.admin.count(), await t.prisma.category.count(), await t.prisma.brand.count(), await t.prisma.region.count(), await t.prisma.district.count()],
        };
      }
    });

    it("o'chirilgan admin tokeni darhol ishlamay qoladi", async () => {
      const admin = await loginAdmin(t);
      await t.prisma.admin.updateMany({ data: { is_active: false } });
      await t.http().get('/api/v1/admin/dashboard').set('Authorization', `Bearer ${admin}`).expect(401);
    });

    it('admin qo\'shish faqat SUPER_ADMIN uchun va SUPER_ADMIN yaratib bo\'lmaydi', async () => {
      const plain = await loginAdmin(t, 'ADMIN', '+998909990001');
      const body = { phone_number: '+998909990002', password: 'long-password-123', first_name: 'X', last_name: 'Y', role: 'ADMIN' };
      await t.http().post('/api/v1/admin/admins').set('Authorization', `Bearer ${plain}`).send(body).expect(403);
      const root = await loginAdmin(t, 'SUPER_ADMIN', '+998909990003');
      await t.http().post('/api/v1/admin/admins').set('Authorization', `Bearer ${root}`).send({ ...body, role: 'SUPER_ADMIN' }).expect(400);
      await t.http().post('/api/v1/admin/admins').set('Authorization', `Bearer ${root}`).send(body).expect(201);
    });

    it("noto'g'ri parol va yo'q admin bir xil javob oladi", async () => {
      await loginAdmin(t);
      const a = await t.http().post('/api/v1/admin/auth/login').send({ phone_number: '+998909990000', password: 'wrong' }).expect(401);
      const b = await t.http().post('/api/v1/admin/auth/login').send({ phone_number: '+998900000000', password: 'wrong' }).expect(401);
      expect(a.body.message).toBe(b.body.message);
    });
  });

  describe('katalog', () => {
    it('admin yaratgan mahsulot zaxira bilan ochiq ro\'yxatga chiqadi', async () => {
      const admin = await loginAdmin(t);
      const created = await t.http()
        .post('/api/v1/admin/products')
        .set('Authorization', `Bearer ${admin}`)
        .send({ title: 'Konstruktor', description: 'Tavsif', price: 120000, original_price: 150000 })
        .expect(201);
      expect(created.body.discount_percentage).toBe(20);
      expect(created.body.in_stock).toBe(false);

      await t.http().put(`/api/v1/admin/products/${created.body.id}/stock`).set('Authorization', `Bearer ${admin}`).send({ stock_quantity: 3 }).expect(200);
      const list = await t.http().get('/api/v1/products').expect(200);
      expect(list.body.items).toHaveLength(1);
      expect(list.body.items[0]).toEqual(expect.objectContaining({ title: 'Konstruktor', price: 120000, in_stock: true }));
      expect(list.body.items[0]).not.toHaveProperty('stock_quantity');
    });

    it('nofaol va o\'chirilgan mahsulot ko\'rinmaydi va savatga tushmaydi', async () => {
      const { product } = await seedCatalog(t);
      const user = await loginUser(t);
      await t.prisma.product.update({ where: { id: product.id }, data: { is_active: false } });
      await t.http().get('/api/v1/products').expect(200).expect((res) => expect(res.body.items).toHaveLength(0));
      await t.http().get(`/api/v1/products/${product.id}`).expect(404);
      await t.http().post('/api/v1/cart/add').set('Authorization', `Bearer ${user.access_token}`).send({ product_id: product.id, quantity: 1 }).expect(404);
    });

    it('GET /cart rasmlar va jami son/summa bilan qaytadi (savat sahifasi shunga tayanadi)', async () => {
      const { product } = await seedCatalog(t, { price: 65000 });
      const user = await loginUser(t);
      const auth = { Authorization: `Bearer ${user.access_token}` };
      await t.http().post('/api/v1/cart/add').set(auth).send({ product_id: product.id, quantity: 2 }).expect(201);
      const cart = await t.http().get('/api/v1/cart').set(auth).expect(200);
      expect(cart.body).toEqual(expect.objectContaining({ total_items: 2, total_amount: 130000 }));
      expect(cart.body.items[0].product.product_image).toEqual([]);
      // Chegarasiz miqdor int32 dan oshib 500 berardi.
      await t.http().post('/api/v1/cart/add').set(auth).send({ product_id: product.id, quantity: 3_000_000_000 }).expect(400);
      await t.http().put('/api/v1/cart/update').set(auth).send({ cart_item_id: cart.body.items[0].id, quantity: 1000 }).expect(400);
    });

    it('noma\'lum baza xatosi 500, 400 emas', async () => {
      const { GlobalExceptionFilter } = await import('../../src/common/filters/global-exception.filter');
      const { Prisma } = await import('@prisma/client');
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const host: any = { switchToHttp: () => ({ getResponse: () => res, getRequest: () => ({ url: '/x', method: 'GET', get: () => '' }) }) };
      new GlobalExceptionFilter().catch(new Prisma.PrismaClientKnownRequestError('table missing', { code: 'P2021', clientVersion: 'x' }), host);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('rasm yuklash faqat rasm fayllarini qabul qiladi', async () => {
      const admin = await loginAdmin(t);
      const { product } = await seedCatalog(t);
      await t.http()
        .post(`/api/v1/admin/products/${product.id}/images`)
        .set('Authorization', `Bearer ${admin}`)
        .attach('images', Buffer.from('<script>alert(1)</script>'), { filename: 'x.html', contentType: 'text/html' })
        .expect(400);
      const png = Buffer.from('89504e470d0a1a0a0000000d4948445200000001000000010806000000', 'hex');
      const res = await t.http()
        .post(`/api/v1/admin/products/${product.id}/images`)
        .set('Authorization', `Bearer ${admin}`)
        .attach('images', png, { filename: 'evil.html', contentType: 'image/png' })
        .expect(201);
      // Kengaytma foydalanuvchi nomidan emas, MIME turidan.
      expect(res.body.images[0].url).toMatch(/^\/uploads\/[0-9a-f-]{36}\.png$/);
    });

    it('filtr va narx bo\'yicha saralash', async () => {
      const { product } = await seedCatalog(t, { price: 50000 });
      await t.prisma.product.create({
        data: { title: 'Kitob', slug: 'kitob', description: 'x', price: 20000, currency_id: product.currency_id, is_checked: 'APPROVED', recommended_age_min: 36 },
      });
      const cheap = await t.http().get('/api/v1/products?sort=price_asc&max_price=30000').expect(200);
      expect(cheap.body.items.map((p: any) => p.title)).toEqual(['Kitob']);
      const toddler = await t.http().get('/api/v1/products?age_months=12').expect(200);
      expect(toddler.body.items.map((p: any) => p.title)).toEqual(['Kubiklar']);
    });
  });
});
