import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import request from 'supertest';
import { CategoryController } from '../category/category.controller';
import { CategoryService } from '../category/category.service';
import { ColorController } from '../color/color.controller';
import { ColorsService } from '../colors/colors.service';
import { PaymentController } from '../payment/payment.controller';
import { PaymentService } from '../payment/payment.service';
import { ClickService } from '../payment/services/click.service';
import { PaymeService } from '../payment/services/payme.service';
import { UzumService } from '../payment/services/uzum.service';
import { AdminController } from '../admin/admin.controller';
import { AdminService } from '../admin/admin.service';
import { AdminPhoneAuthService } from '../admin/admin-phone-auth.service';
import { RBACService } from '../auth/rbac/rbac.service';
import { PrismaService } from '../prisma/prisma.service';

// Faza 0 regressiyalari HTTP darajasida: haqiqiy guard'lar, haqiqiy JWT imzosi.
// Servislar mock — baza kerak emas.

const SECRET = 'route-guards-test-secret-at-least-32-chars';

describe('route guard\'lari', () => {
  let app: INestApplication;
  let jwt: JwtService;
  const categoryService = { remove: jest.fn(), create: jest.fn(), seedCategories: jest.fn(), findAll: jest.fn().mockResolvedValue([]) };
  const colorsService = { remove: jest.fn(), create: jest.fn() };
  const paymentService = { processPayment: jest.fn() };
  const adminPhoneAuthService = { adminPhoneSignUp: jest.fn() };
  const prisma = { orderPayment: { findFirst: jest.fn(), update: jest.fn() }, order: { update: jest.fn() } };

  beforeAll(async () => {
    process.env.ACCESS_TOKEN_KEY = SECRET;
    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: SECRET })],
      controllers: [CategoryController, ColorController, PaymentController, AdminController],
      providers: [
        { provide: CategoryService, useValue: categoryService },
        { provide: ColorsService, useValue: colorsService },
        { provide: PaymentService, useValue: paymentService },
        { provide: ClickService, useValue: {} },
        { provide: UzumService, useValue: {} },
        {
          provide: PaymeService,
          useFactory: () => new PaymeService({ get: (k: string) => (k === 'PAYME_SECRET_KEY' ? 'payme-secret' : undefined) } as ConfigService, prisma as unknown as PrismaService),
        },
        { provide: AdminService, useValue: {} },
        { provide: AdminPhoneAuthService, useValue: adminPhoneAuthService },
        { provide: RBACService, useValue: {} },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    jwt = moduleRef.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => jest.clearAllMocks());

  const userToken = () => jwt.sign({ id: 1, phone_number: '+998900000000' }, { secret: SECRET });
  const adminToken = (role = 'ADMIN') => jwt.sign({ sub: 2, role, type: 'admin' }, { secret: SECRET });

  describe('C1: to\'lov holatini qo\'lda o\'zgartiruvchi endpoint\'lar yo\'q', () => {
    it.each(['click', 'payme', 'uzum'])('GET /payment/%s/verify → 404', async (provider) => {
      await request(app.getHttpServer())
        .get(`/payment/${provider}/verify?payment_id=x&status=2`)
        .expect(404);
      expect(prisma.orderPayment.update).not.toHaveBeenCalled();
    });

    it.each(['click', 'payme', 'uzum'])('POST /payment/webhooks/%s dublikati yo\'q → 404', async (provider) => {
      await request(app.getHttpServer()).post(`/payment/webhooks/${provider}`).send({}).expect(404);
    });

    it('process/:orderId joriy foydalanuvchini servisga uzatadi', async () => {
      paymentService.processPayment.mockResolvedValue({ ok: true });
      await request(app.getHttpServer())
        .post('/payment/process/7')
        .set('Authorization', `Bearer ${userToken()}`)
        .send({ method: 'CASH_ON_DELIVERY' })
        .expect(201);
      expect(paymentService.processPayment).toHaveBeenCalledWith(7, 1, { method: 'CASH_ON_DELIVERY' });
    });
  });

  describe('C2: Payme callback', () => {
    it('Authorization\'siz PerformTransaction → -32504, HTTP 200', async () => {
      const res = await request(app.getHttpServer())
        .post('/payment/payme/callback')
        .send({ id: 5, method: 'PerformTransaction', params: { id: 'tx' } })
        .expect(200);
      expect(res.body).toEqual({ error: { code: -32504, message: 'Access denied' }, id: 5 });
      expect(prisma.orderPayment.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('C4: katalog ma\'lumotnomalariga yozish faqat admin uchun', () => {
    const writes: Array<[string, string, string]> = [
      ['post', '/category', 'create'],
      ['post', '/category/seed', 'seedCategories'],
      ['delete', '/category/1', 'remove'],
      ['post', '/color', 'create'],
      ['delete', '/color/1', 'remove'],
    ];

    it.each(writes)('%s %s tokensiz → 401', async (method, url) => {
      await (request(app.getHttpServer()) as any)[method](url).send({}).expect(401);
    });

    it.each(writes)('%s %s oddiy user tokeni bilan → 401', async (method, url) => {
      await (request(app.getHttpServer()) as any)[method](url)
        .set('Authorization', `Bearer ${userToken()}`)
        .send({})
        .expect(401);
      expect(categoryService.remove).not.toHaveBeenCalled();
      expect(colorsService.remove).not.toHaveBeenCalled();
    });

    it('admin tokeni bilan DELETE /category/1 o\'tadi', async () => {
      categoryService.remove.mockResolvedValue({ id: 1 });
      await request(app.getHttpServer())
        .delete('/category/1')
        .set('Authorization', `Bearer ${adminToken()}`)
        .expect(200);
      expect(categoryService.remove).toHaveBeenCalledWith(1);
    });

    it('o\'qish ochiq qoladi: GET /category', async () => {
      await request(app.getHttpServer()).get('/category').expect(200);
    });
  });

  describe('admin ro\'yxatdan o\'tkazish faqat super admin uchun', () => {
    const body = { phone_number: '+998900000001', first_name: 'X', last_name: 'Y', role: 'SUPER_ADMIN' };

    it('tokensiz → 401', async () => {
      await request(app.getHttpServer()).post('/admin/auth/phone-signup').send(body).expect(401);
      expect(adminPhoneAuthService.adminPhoneSignUp).not.toHaveBeenCalled();
    });

    it('oddiy ADMIN → 403', async () => {
      await request(app.getHttpServer())
        .post('/admin/auth/phone-signup')
        .set('Authorization', `Bearer ${adminToken('ADMIN')}`)
        .send(body)
        .expect(403);
      expect(adminPhoneAuthService.adminPhoneSignUp).not.toHaveBeenCalled();
    });
  });
});
