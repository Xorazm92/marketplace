import { parse } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import { validationSchema } from './environment.config';

// Server ishga tushishidagi env tekshiruvi: secret'siz to'xtaydi, lekin
// `.env.example` nusxasidagi bo'sh ixtiyoriy kalitlar bilan ishga tushadi.

const secrets = { JWT_ACCESS_SECRET: 'a'.repeat(32), JWT_REFRESH_SECRET: 'r'.repeat(32), JWT_OTP_SECRET: 'o'.repeat(32) };
const example = () => ({ ...parse(readFileSync(join(__dirname, '../../.env.example'))), ...secrets });
const errors = (env: Record<string, string>) =>
  (validationSchema.validate(env, { abortEarly: false, allowUnknown: true }).error?.details ?? []).map((d) => d.message);

describe('env sxemasi', () => {
  it('.env.example (faqat secret to\'ldirilgan) bilan dev server ishga tushadi', () => {
    expect(errors(example())).toEqual([]);
  });

  it('secret yo\'q, bo\'sh yoki 32 belgidan qisqa bo\'lsa to\'xtaydi', () => {
    const { JWT_ACCESS_SECRET: _omit, ...withoutAccess } = example();
    expect(errors(withoutAccess)).toEqual(['"JWT_ACCESS_SECRET" is required']);
    expect(errors({ ...example(), JWT_REFRESH_SECRET: '' })).toHaveLength(1);
    expect(errors({ ...example(), JWT_OTP_SECRET: 'qisqa' })).toHaveLength(1);
  });

  it('prodda SMS sozlamalari majburiy (bo\'sh qiymat ham yetishmaydi)', () => {
    expect(errors({ ...example(), NODE_ENV: 'production' })).toEqual(['"ESKIZ_EMAIL" is required', '"ESKIZ_PASSWORD" is required']);
    expect(errors({ ...example(), NODE_ENV: 'production', ESKIZ_EMAIL: 'a@b.uz', ESKIZ_PASSWORD: 'p' })).toEqual([]);
  });

  it('provayder id berilsa secret majburiy; id bo\'sh bo\'lsa provayder o\'chiq', () => {
    expect(errors({ ...example(), PAYME_MERCHANT_ID: 'm' })).toEqual(['"PAYME_SECRET_KEY" is required']);
    expect(errors({ ...example(), CLICK_SERVICE_ID: '1' })).toEqual(['"CLICK_SECRET_KEY" is required']);
    expect(errors({ ...example(), PAYME_MERCHANT_ID: 'm', PAYME_SECRET_KEY: 'k' })).toEqual([]);
  });
});
