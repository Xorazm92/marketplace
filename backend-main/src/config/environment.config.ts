import * as Joi from 'joi';

const secret = Joi.string().min(32).required();
const inProduction = (schema: Joi.Schema) =>
  Joi.string().when('NODE_ENV', { is: 'production', then: schema, otherwise: Joi.optional() });

// Server shu sxemaga mos kelmasa ishga tushmaydi (Faza 0, C5): koddagi fallback
// secret'lar o'rniga — aniq xato matni bilan to'xtash.
export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(4000),
  DATABASE_URL: Joi.string().required(),

  JWT_ACCESS_SECRET: secret,
  JWT_REFRESH_SECRET: secret,
  JWT_OTP_SECRET: secret,
  JWT_ACCESS_EXPIRES: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES: Joi.string().default('30d'),

  FRONTEND_URL: Joi.string().uri().required(),
  CORS_ORIGIN: Joi.string().required(),

  // SMS (Eskiz): prodda OTP'siz hech kim kira olmaydi.
  ESKIZ_EMAIL: inProduction(Joi.string().required()),
  ESKIZ_PASSWORD: inProduction(Joi.string().required()),
  SMS_FROM: Joi.string().optional(),

  // To'lov: merchant/servis id berilgan provayderning secret'i majburiy.
  PAYME_MERCHANT_ID: Joi.string().optional(),
  PAYME_SECRET_KEY: Joi.string().when('PAYME_MERCHANT_ID', { is: Joi.exist(), then: Joi.required() }),
  PAYME_CHECKOUT_URL: Joi.string().uri().optional(),
  CLICK_SERVICE_ID: Joi.string().optional(),
  CLICK_MERCHANT_ID: Joi.string().optional(),
  CLICK_SECRET_KEY: Joi.string().when('CLICK_SERVICE_ID', { is: Joi.exist(), then: Joi.required() }),
  CASH_ON_DELIVERY_ENABLED: Joi.string().valid('true', 'false').default('true'),

  SHIPPING_FLAT_FEE: Joi.number().min(0).default(0),
  FREE_SHIPPING_FROM: Joi.number().min(0).default(0),
});
