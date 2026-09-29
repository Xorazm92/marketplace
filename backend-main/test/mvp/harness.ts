import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { execSync } from 'child_process';
import { createHash, randomBytes } from 'crypto';
import request from 'supertest';
import * as bcrypt from 'bcrypt';

// E2E testlar haqiqiy Postgres'ga yozadi va har suite oldidan jadvallarni tozalaydi.
// Shuning uchun faqat nomi `_test` bilan tugaydigan bazada ishlaydi — boshqa
// ulanish satri berilsa, hech narsa yozilmasdan to'xtaydi.
export function testDatabaseUrl(): string {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error('TEST_DATABASE_URL berilmagan (masalan postgresql://user@127.0.0.1:5544/inbola_mkt_test)');
  const dbName = new URL(url).pathname.replace('/', '');
  if (!dbName.endsWith('_test')) throw new Error(`Xavfsizlik: test bazasi nomi "_test" bilan tugashi kerak, berilgan: "${dbName}"`);
  return url;
}

export const PAYME_KEY = 'payme-test-key';
export const CLICK_SECRET = 'click-test-secret';
export const CLICK_SERVICE = '1001';

function configureEnv() {
  const url = testDatabaseUrl();
  const rnd = () => randomBytes(24).toString('hex');
  Object.assign(process.env, {
    NODE_ENV: 'test',
    DATABASE_URL: url,
    JWT_ACCESS_SECRET: rnd(),
    JWT_REFRESH_SECRET: rnd(),
    JWT_OTP_SECRET: rnd(),
    FRONTEND_URL: 'http://localhost:5000',
    CORS_ORIGIN: 'http://localhost:5000',
    PAYME_MERCHANT_ID: 'merchant-test',
    PAYME_SECRET_KEY: PAYME_KEY,
    CLICK_SERVICE_ID: CLICK_SERVICE,
    CLICK_MERCHANT_ID: '2002',
    CLICK_SECRET_KEY: CLICK_SECRET,
    SHIPPING_FLAT_FEE: '15000',
    FREE_SHIPPING_FROM: '500000',
  });
  delete process.env.ESKIZ_EMAIL;
  delete process.env.ESKIZ_PASSWORD;
}

let migrated = false;

export async function createTestApp() {
  configureEnv();
  if (!migrated) {
    execSync('npx prisma migrate deploy', { env: process.env, stdio: 'ignore' });
    migrated = true;
  }
  // Env'dan keyin import: modullar secret'larni yuklanish paytida o'qiydi.
  const { AppModule } = await import('../../src/app.module');
  const { configureApp } = await import('../../src/app.setup');
  const { PrismaService } = await import('../../src/prisma/prisma.service');
  const { SmsService } = await import('../../src/identity/sms.service');

  const sent: Array<{ phone: string; message: string }> = [];
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(SmsService)
    .useValue({ isConfigured: true, send: async (phone: string, message: string) => void sent.push({ phone, message }) })
    .compile();

  const app: INestApplication = moduleRef.createNestApplication({ logger: false });
  configureApp(app);
  await app.init();
  const prisma = moduleRef.get(PrismaService);
  return { app, prisma, sent, http: () => request(app.getHttpServer()) };
}

export type TestApp = Awaited<ReturnType<typeof createTestApp>>;

// FK tartibiga qaramasdan hammasini bir buyruqda tozalash.
export async function resetDatabase(prisma: any) {
  const tables: Array<{ tablename: string }> = await prisma.$queryRawUnsafe(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`,
  );
  await prisma.$executeRawUnsafe(`TRUNCATE ${tables.map((t) => `"${t.tablename}"`).join(', ')} RESTART IDENTITY CASCADE`);
}

export async function loginUser(t: TestApp, phone = '+998901112233') {
  await t.http().post('/api/v1/auth/otp/send').send({ phone_number: phone }).expect(200);
  // SMS normallashtirilgan raqamga ketadi (+998...), shuning uchun oxirgisi olinadi.
  const code = t.sent[t.sent.length - 1].message.match(/(\d{6})/)![1];
  const res = await t.http().post('/api/v1/auth/otp/verify').send({ phone_number: phone, code, first_name: 'Test' }).expect(200);
  return res.body as { access_token: string; refresh_token: string; user: { id: number } };
}

export async function loginAdmin(t: TestApp, role: 'SUPER_ADMIN' | 'ADMIN' = 'SUPER_ADMIN', phone = '+998909990000') {
  await t.prisma.admin.create({
    data: { phone_number: phone, first_name: 'A', last_name: 'B', role, is_active: true, hashed_password: await bcrypt.hash('admin-password-123', 4) },
  });
  const res = await t.http().post('/api/v1/admin/auth/login').send({ phone_number: phone, password: 'admin-password-123' }).expect(200);
  return res.body.access_token as string;
}

export async function seedCatalog(t: TestApp, { price = 100000, stock = 5 } = {}) {
  const currency = await t.prisma.currency.create({ data: { code: 'UZS', name: 'Som', symbol: "so'm" } });
  const region = await t.prisma.region.create({ data: { name: 'Toshkent shahri' } });
  const product = await t.prisma.product.create({
    data: {
      title: 'Kubiklar',
      slug: 'kubiklar',
      description: 'Test',
      price,
      currency_id: currency.id,
      is_checked: 'APPROVED',
      inventory: { create: { stock_quantity: stock } },
    },
  });
  return { product, region };
}

export async function createAddress(t: TestApp, token: string, regionId: number) {
  const res = await t.http().post('/api/v1/addresses').set('Authorization', `Bearer ${token}`).send({ name: 'Uy', region_id: regionId, address: 'Chilonzor 1' }).expect(201);
  return res.body.id as number;
}

export function clickSign(p: Record<string, string | number>, withPrepare: boolean) {
  const raw = `${p.click_trans_id}${p.service_id}${CLICK_SECRET}${p.merchant_trans_id}${withPrepare ? p.merchant_prepare_id : ''}${p.amount}${p.action}${p.sign_time}`;
  return createHash('md5').update(raw).digest('hex');
}

export const paymeAuth = 'Basic ' + Buffer.from(`Paycom:${PAYME_KEY}`).toString('base64');
