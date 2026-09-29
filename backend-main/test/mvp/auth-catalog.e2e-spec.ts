import { createTestApp, loginAdmin, loginUser, resetDatabase, seedCatalog, TestApp } from './harness';

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
