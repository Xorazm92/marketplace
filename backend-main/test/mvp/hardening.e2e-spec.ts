import { Logger } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';
import { createAddress, createTestApp, loginAdmin, loginUser, resetDatabase, seedCatalog, TestApp } from './harness';

// Kichik PNG (1x1): rasm yuklash testlari uchun.
const PNG = Buffer.from('89504e470d0a1a0a0000000d4948445200000001000000010806000000', 'hex');

describe('mustahkamlash (e2e)', () => {
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

  describe('OTP yuborish chegaralari (SMS balansini yoqishga qarshi)', () => {
    const send = (phone: string, ip: string) => t.http().post('/api/v1/auth/otp/send').set('X-Forwarded-For', ip).send({ phone_number: phone });

    async function withLimits<T>(limits: Record<string, number>, run: () => Promise<T>): Promise<T> {
      const { OtpService } = await import('../../src/identity/otp.service');
      const otp = t.app.get(OtpService) as unknown as { limits: Record<string, number> };
      const original = otp.limits;
      otp.limits = { ...original, ...limits };
      try {
        return await run();
      } finally {
        otp.limits = original;
      }
    }

    it('bitta IP soatiga cheklangan sondagi TURLI raqamlarga yubora oladi; boshqa IP ta\'sirlanmaydi', async () => {
      await withLimits({ ipPhonesPerHour: 2 }, async () => {
        await send('+998901110001', '10.0.0.1').expect(200);
        await send('+998901110002', '10.0.0.1').expect(200);
        await send('+998901110003', '10.0.0.1').expect(429);
        await send('+998901110004', '10.0.0.1').expect(429);
        // Rad etilgan so'rov SMS yubormaydi va bazaga kod yozmaydi.
        expect(t.sent.map((s) => s.phone)).toEqual(['+998901110001', '+998901110002']);
        expect(await t.prisma.otpVerification.count()).toBe(2);
        // Boshqa IP (boshqa xaridor) ishlayveradi.
        await send('+998901110003', '10.0.0.2').expect(200);
        // O'sha IP o'zining avvalgi raqamiga qayta so'ray oladi (kutish vaqti o'tgach).
        await t.prisma.otpVerification.updateMany({ where: { phone_number: '+998901110001' }, data: { createdAt: new Date(Date.now() - 2 * 60_000) } });
        await send('+998901110001', '10.0.0.1').expect(200);
      });
    });

    it('umumiy soatlik va kunlik chegara: barcha IP va raqamlar bo\'yicha', async () => {
      await withLimits({ globalPerHour: 3 }, async () => {
        for (const n of [1, 2, 3]) await send(`+99890222000${n}`, `10.1.0.${n}`).expect(200);
        const blocked = await send('+998902220004', '10.1.0.4').expect(429);
        expect(blocked.body.message).not.toMatch(/\d{6}/);
        expect(t.sent).toHaveLength(3);
      });
      await withLimits({ globalPerDay: 3 }, async () => {
        // Soatdan eski, lekin bir kun ichidagi yuborishlar kunlik chegaraga kiradi.
        await t.prisma.otpVerification.updateMany({ data: { createdAt: new Date(Date.now() - 3 * 3600_000) } });
        await send('+998902220005', '10.1.0.5').expect(429);
        expect(t.sent).toHaveLength(3);
      });
    });

    it('chegara ishlaganda anomaliya logi yoziladi — to\'liq raqam, IP va kodsiz', async () => {
      const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
      try {
        await withLimits({ ipPhonesPerHour: 1 }, async () => {
          await send('+998903330001', '10.2.0.1').expect(200);
          await send('+998903330002', '10.2.0.1').expect(429);
        });
        const logged = warn.mock.calls.map((call) => JSON.stringify(call));
        const anomaly = logged.find((line) => line.includes('otp_limit'));
        expect(anomaly).toBeDefined();
        expect(anomaly).toContain('ip_phones');
        expect(anomaly).not.toContain('903330002');
        expect(anomaly).not.toContain('10.2.0.1');
        expect(anomaly).not.toMatch(new RegExp(t.sent[0].message.match(/\d{6}/)![0]));
      } finally {
        warn.mockRestore();
      }
    });

    it('IP bazada ochiq saqlanmaydi', async () => {
      await send('+998904440001', '10.3.0.7').expect(200);
      const row = await t.prisma.otpVerification.findFirstOrThrow();
      expect(JSON.stringify(row)).not.toContain('10.3.0.7');
      expect((row as unknown as { ip_hash: string }).ip_hash).toMatch(/^[0-9a-f]{32,}$/);
    });
  });

  describe('bloklangan xaridor', () => {
    it('access tokeni darhol ishlamay qoladi (muddatini kutmasdan)', async () => {
      const { product, region } = await seedCatalog(t);
      const user = await loginUser(t);
      const auth = { Authorization: `Bearer ${user.access_token}` };
      const addressId = await createAddress(t, user.access_token, region.id);
      await t.http().get('/api/v1/orders').set(auth).expect(200);

      const admin = await loginAdmin(t);
      await t.http().patch(`/api/v1/admin/users/${user.user.id}/active`).set('Authorization', `Bearer ${admin}`).send({ is_active: false }).expect(200);

      await t.http().get('/api/v1/orders').set(auth).expect(401);
      await t.http().get('/api/v1/auth/me').set(auth).expect(401);
      await t.http().post('/api/v1/cart/add').set(auth).send({ product_id: product.id, quantity: 1 }).expect(401);
      await t.http().post('/api/v1/orders').set(auth).send({ items: [{ product_id: product.id, quantity: 1 }], address_id: addressId, payment_method: 'CASH' }).expect(401);
      expect(await t.prisma.order.count()).toBe(0);
      // Ochiq sahifalar bloklangan token bilan ham mehmon sifatida ochiladi.
      await t.http().get('/api/v1/products').set(auth).expect(200);

      await t.http().patch(`/api/v1/admin/users/${user.user.id}/active`).set('Authorization', `Bearer ${admin}`).send({ is_active: true }).expect(200);
      await t.http().get('/api/v1/orders').set(auth).expect(200);
    });

    it('o\'chirilgan hisob tokeni ham ishlamaydi', async () => {
      const user = await loginUser(t);
      await t.prisma.user.delete({ where: { id: user.user.id } });
      await t.http().get('/api/v1/auth/me').set('Authorization', `Bearer ${user.access_token}`).expect(401);
    });
  });

  describe('admin rollari (docs/PERMISSIONS.md)', () => {
    type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR';
    type Method = 'get' | 'post' | 'patch' | 'put' | 'delete';

    it('har endpoint har rol uchun matritsadagi natijani beradi', async () => {
      const { product, region } = await seedCatalog(t);
      const user = await loginUser(t);
      const addressId = await createAddress(t, user.access_token, region.id);
      const order = await t.http()
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${user.access_token}`)
        .send({ items: [{ product_id: product.id, quantity: 1 }], address_id: addressId, payment_method: 'CASH' })
        .expect(201);
      const tokens: Record<Role, string> = {
        SUPER_ADMIN: await loginAdmin(t, 'SUPER_ADMIN', '+998909990001'),
        ADMIN: await loginAdmin(t, 'ADMIN', '+998909990002'),
        MODERATOR: await loginAdmin(t, 'MODERATOR', '+998909990003'),
      };

      // [metod, yo'l, tana, ruxsat berilgan rollar]. Ruxsat = 403 EMAS (2xx/4xx validatsiya bo'lishi mumkin);
      // taqiq = aynan 403. Tana ataylab yaroqsiz: ruxsat berilgan rol ham bazani o'zgartirmaydi.
      const S: Role[] = ['SUPER_ADMIN'];
      const A: Role[] = ['SUPER_ADMIN', 'ADMIN'];
      const M: Role[] = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'];
      const matrix: Array<[Method, string, object | undefined, Role[]]> = [
        ['get', '/admin/auth/me', undefined, M],
        ['get', '/admin/dashboard', undefined, A],
        ['get', '/admin/users', undefined, A],
        ['patch', '/admin/users/999999/active', {}, A],
        ['get', '/admin/orders', undefined, A],
        ['get', `/admin/orders/${order.body.id}`, undefined, A],
        ['patch', `/admin/orders/${order.body.id}/status`, {}, A],
        ['get', '/admin/products', undefined, M],
        ['get', `/admin/products/${product.id}`, undefined, M],
        ['post', '/admin/products', {}, A],
        ['patch', `/admin/products/${product.id}`, { title: 'x' }, M],
        ['delete', '/admin/products/999999', undefined, A],
        ['put', `/admin/products/${product.id}/stock`, {}, A],
        ['post', `/admin/products/${product.id}/images`, undefined, M],
        ['delete', `/admin/products/${product.id}/images/999999`, undefined, M],
        ['post', '/category', {}, A],
        ['patch', '/category/999999', { slug: 123 }, A],
        ['delete', '/category/abc', undefined, A],
        ['post', '/category/seed', undefined, A],
        ['post', '/brand', {}, A],
        ['put', '/brand/abc', {}, A],
        ['delete', '/brand/abc', undefined, A],
        ['post', '/region', {}, A],
        ['put', '/region/abc', {}, A],
        ['delete', '/region/abc', undefined, A],
        ['post', '/district', {}, A],
        ['put', '/district/abc', {}, A],
        ['delete', '/district/abc', undefined, A],
        ['get', '/admin/admins', undefined, S],
        ['post', '/admin/admins', {}, S],
        ['patch', '/admin/admins/999999/active', {}, S],
      ];

      const before = await t.prisma.category.count();
      for (const [method, path, body, allowed] of matrix) {
        for (const role of ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'] as Role[]) {
          // /category/seed ruxsat berilgan rol uchun haqiqatan yozadi — uni faqat taqiq uchun tekshiramiz.
          if (path === '/category/seed' && allowed.includes(role)) continue;
          const res = await t.http()[method](`/api/v1${path}`).set('Authorization', `Bearer ${tokens[role]}`).send(body);
          const forbidden = res.status === 403;
          expect([method, path, role, forbidden ? 'taqiq' : 'ruxsat']).toEqual([method, path, role, allowed.includes(role) ? 'ruxsat' : 'taqiq']);
          expect(res.status).not.toBe(401);
          expect(res.status).toBeLessThan(500);
        }
      }
      expect(await t.prisma.category.count()).toBe(before);
    });

    it('moderator kontentni tahrirlaydi, lekin narxni o\'zgartira olmaydi', async () => {
      const { product } = await seedCatalog(t, { price: 100000 });
      const moderator = await loginAdmin(t, 'MODERATOR');
      const patch = (body: object) => t.http().patch(`/api/v1/admin/products/${product.id}`).set('Authorization', `Bearer ${moderator}`).send(body);
      await patch({ description: 'Yangi tavsif', is_active: false }).expect(200);
      await patch({ price: 1 }).expect(403);
      await patch({ description: 'x', original_price: 500000 }).expect(403);
      const fresh = await t.prisma.product.findUniqueOrThrow({ where: { id: product.id } });
      expect([Number(fresh.price), fresh.original_price, fresh.description, fresh.is_active]).toEqual([100000, null, 'Yangi tavsif', false]);
    });
  });

  describe('zaxirani admin tahrirlashi', () => {
    it('admin ko\'rgan qiymat shu orada o\'zgargan bo\'lsa yozilmaydi (409)', async () => {
      const { product, region } = await seedCatalog(t, { stock: 5 });
      const admin = await loginAdmin(t);
      const user = await loginUser(t);
      const addressId = await createAddress(t, user.access_token, region.id);
      const setStock = (body: object) => t.http().put(`/api/v1/admin/products/${product.id}/stock`).set('Authorization', `Bearer ${admin}`).send(body);

      // Admin sahifani ochdi (5 dona), shu orada bitta sotildi.
      await t.http().post('/api/v1/orders').set('Authorization', `Bearer ${user.access_token}`).send({ items: [{ product_id: product.id, quantity: 1 }], address_id: addressId, payment_method: 'CASH' }).expect(201);
      const stale = await setStock({ stock_quantity: 10, expected_quantity: 5 }).expect(409);
      expect(stale.body.message).toContain('4');
      expect((await t.prisma.inventory.findFirstOrThrow()).stock_quantity).toBe(4);

      const fresh = await setStock({ stock_quantity: 10, expected_quantity: 4 }).expect(200);
      expect(fresh.body.stock_quantity).toBe(10);
      // Kutilgan qiymatsiz (eski shakl) so'rov qabul qilinmaydi.
      await setStock({ stock_quantity: 99 }).expect(400);
      expect((await t.prisma.inventory.findFirstOrThrow()).stock_quantity).toBe(10);
    });

    it('buyurtma va admin tahriri bir vaqtda kelsa sotilgan dona yo\'qolmaydi', async () => {
      for (let round = 0; round < 5; round++) {
        await resetDatabase(t.prisma);
        t.sent.length = 0;
        const { product, region } = await seedCatalog(t, { stock: 5 });
        const admin = await loginAdmin(t);
        const user = await loginUser(t);
        const addressId = await createAddress(t, user.access_token, region.id);
        const [edit, order] = await Promise.all([
          t.http().put(`/api/v1/admin/products/${product.id}/stock`).set('Authorization', `Bearer ${admin}`).send({ stock_quantity: 10, expected_quantity: 5 }),
          t.http().post('/api/v1/orders').set('Authorization', `Bearer ${user.access_token}`).send({ items: [{ product_id: product.id, quantity: 1 }], address_id: addressId, payment_method: 'CASH' }),
        ]);
        expect(order.status).toBe(201);
        const stock = (await t.prisma.inventory.findFirstOrThrow()).stock_quantity;
        // Admin birinchi: 5→10, keyin sotildi = 9. Buyurtma birinchi: 4, admin rad etildi.
        expect([edit.status, stock]).toEqual(edit.status === 200 ? [200, 9] : [409, 4]);
      }
    });
  });

  describe('parametr va maydon validatsiyasi', () => {
    it('raqam bo\'lmagan id 400 qaytaradi, 500 emas', async () => {
      const admin = await loginAdmin(t);
      for (const path of ['/category/abc', '/brand/abc', '/region/abc', '/district/abc']) {
        const res = await t.http().get(`/api/v1${path}`);
        expect([path, res.status]).toEqual([path, 400]);
      }
      await t.http().patch('/api/v1/category/abc').set('Authorization', `Bearer ${admin}`).send({ name: 'x' }).expect(400);
      await t.http().delete('/api/v1/category/1.5').set('Authorization', `Bearer ${admin}`).expect(400);
    });

    it('ixtiyoriy maydon null bilan bo\'shatiladi; majburiy maydonga null — 400', async () => {
      const admin = await loginAdmin(t);
      const auth = { Authorization: `Bearer ${admin}` };
      const created = await t.http()
        .post('/api/v1/admin/products')
        .set(auth)
        .send({ title: 'Konstruktor', description: 'Tavsif', price: 120000, original_price: 150000, material: 'Plastik', sku: 'K-1', max_order_quantity: 3 })
        .expect(201);
      const patch = (body: object) => t.http().patch(`/api/v1/admin/products/${created.body.id}`).set(auth).send(body);

      const cleared = await patch({ original_price: null, material: null, sku: null, max_order_quantity: null }).expect(200);
      expect(cleared.body).toEqual(expect.objectContaining({ original_price: null, discount_percentage: 0, material: null, sku: null, max_order_quantity: null }));

      for (const body of [{ title: null }, { description: null }, { price: null }, { min_order_quantity: null }, { is_active: null }]) {
        const res = await patch(body);
        expect([JSON.stringify(body), res.status]).toEqual([JSON.stringify(body), 400]);
      }
      const fresh = await t.http().get(`/api/v1/admin/products/${created.body.id}`).set(auth).expect(200);
      expect(fresh.body).toEqual(expect.objectContaining({ title: 'Konstruktor', price: 120000, min_order_quantity: 1, is_active: true }));
    });
  });

  describe('rasm fayllari', () => {
    it('o\'chirilgan rasm fayli diskdan ham o\'chadi', async () => {
      const admin = await loginAdmin(t);
      const { product } = await seedCatalog(t);
      const auth = { Authorization: `Bearer ${admin}` };
      const uploaded = await t.http()
        .post(`/api/v1/admin/products/${product.id}/images`)
        .set(auth)
        .attach('images', PNG, { filename: 'a.png', contentType: 'image/png' })
        .attach('images', PNG, { filename: 'b.png', contentType: 'image/png' })
        .expect(201);
      const [first, second] = uploaded.body.images as Array<{ id: number; url: string }>;
      const onDisk = (url: string) => join(process.cwd(), 'public', url);
      expect([existsSync(onDisk(first.url)), existsSync(onDisk(second.url))]).toEqual([true, true]);

      await t.http().delete(`/api/v1/admin/products/${product.id}/images/${first.id}`).set(auth).expect(200);
      expect([existsSync(onDisk(first.url)), existsSync(onDisk(second.url))]).toEqual([false, true]);

      // Boshqa mahsulotning rasmi bu yo'l bilan o'chmaydi.
      await t.http().delete(`/api/v1/admin/products/999999/images/${second.id}`).set(auth).expect(404);
      expect(existsSync(onDisk(second.url))).toBe(true);
      await t.http().delete(`/api/v1/admin/products/${product.id}/images/${second.id}`).set(auth).expect(200);
      expect(existsSync(onDisk(second.url))).toBe(false);
    });
  });
});
