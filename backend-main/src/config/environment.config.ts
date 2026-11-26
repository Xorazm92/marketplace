import * as Joi from 'joi';

const secret = Joi.string().min(32).required();
// `.env` dagi bo'sh `KEY=` qatori "berilmagan" degani: Joi default holatda bo'sh satrni
// xato deb biladi va `.env.example` nusxasi bilan server umuman ishga tushmasdi.
// Majburiy qiymatlar (secret, DATABASE_URL) bu yerga kirmaydi — ular bo'sh bo'lsa xato.
const optional = () => Joi.string().empty('');
const inProduction = () => optional().when('NODE_ENV', { is: 'production', then: Joi.required() });

// Server shu sxemaga mos kelmasa ishga tushmaydi (Faza 0, C5): koddagi fallback
// secret'lar o'rniga — aniq xato matni bilan to'xtash.
export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(4000),
  DATABASE_URL: Joi.string().required(),

  JWT_ACCESS_SECRET: secret,
  JWT_REFRESH_SECRET: secret,
  JWT_OTP_SECRET: secret,
  JWT_ACCESS_EXPIRES: optional().default('15m'),
  JWT_REFRESH_EXPIRES: optional().default('30d'),

  FRONTEND_URL: Joi.string().uri().required(),
  CORS_ORIGIN: Joi.string().required(),

  // SMS (Eskiz): prodda OTP'siz hech kim kira olmaydi.
  ESKIZ_EMAIL: inProduction(),
  ESKIZ_PASSWORD: inProduction(),
  SMS_FROM: optional(),

  // To'lov: merchant/servis id berilgan provayderning secret'i majburiy.
  PAYME_MERCHANT_ID: optional(),
  PAYME_SECRET_KEY: optional().when('PAYME_MERCHANT_ID', { is: Joi.exist(), then: Joi.required() }),
  PAYME_CHECKOUT_URL: optional().uri(),
  CLICK_SERVICE_ID: optional(),
  CLICK_MERCHANT_ID: optional(),
  CLICK_SECRET_KEY: optional().when('CLICK_SERVICE_ID', { is: Joi.exist(), then: Joi.required() }),
  CASH_ON_DELIVERY_ENABLED: optional().valid('true', 'false').default('true'),

  SHIPPING_FLAT_FEE: Joi.number().empty('').min(0).default(0),
  FREE_SHIPPING_FROM: Joi.number().empty('').min(0).default(0),
});
