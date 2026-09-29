# Bazaviy o'lchov — 2026-09-29

Faza 0 boshlanishidagi holat, Faza 0 tuzatishlaridan OLDIN. Node v24.16.0, npm 11.13.0.
Har qator — haqiqatan ishga tushirilgan buyruq natijasi.

## Backend (`backend-main/`)

| Buyruq | Natija |
|---|---|
| `npm ci` | ✅ 1636 paket |
| `npx prisma generate` | ✅ |
| `npx tsc --noEmit` | ❌ 300 xato — **hammasi test fayllari va `prisma/seed.ts` da**; `src/` dagi ishlab chiqarish kodida 0 |
| `npm run build` | ❌ 6 xato, hammasi `prisma/seed.ts` da. `tsconfig.json` da `include` yo'q, shuning uchun `nest build` seed'ni ham kompilyatsiya qiladi |
| `npx jest --config jest.config.json` | ❌ 8/8 suite, 14/14 test yiqildi |

**`prisma/seed.ts` joriy sxemaga mos emas:** `Admin.password` (sxemada
`hashed_password`), `Product.stock_quantity` (sxemada yo'q), `Region.name`
unique emas. Ya'ni README'dagi `npm run seed` ishlamaydi.

**Jest yiqilishlari:**
- `cart`, `wishlist` resolver/service — scaffold "should be defined", DI provayderlari berilmagan.
- `child-safety.service.spec.ts` — 10 ta mantiqiy assertion yiqiladi (MVP'dan tashqari modul).
- `src/test/unit/payment/enhanced-payment-services.spec.ts` — import yo'llari noto'g'ri (`../../../src/...`).
- `src/testing/*.test.ts` — `import * as request from 'supertest'` (chaqirib bo'lmaydi).
- `src/test/**/*.e2e-spec.ts` — 300 tip xatosining asosiy qismi; jest `testMatch` ularni ushlamaydi, ya'ni ular hech qachon ishlamagan.

## Frontend (`front-main/`)

| Buyruq | Natija |
|---|---|
| `npm ci` | ✅ 702 paket |
| `npx tsc --noEmit` | ❌ 505 xato; eng ko'pi `utils/i18n.ts` (86), `EnhancedProductGallery.tsx` (80), `multilingual-pages.ts` (79), `EnhancedCheckoutFlow.tsx` (57) |
| `npm run build` | ❌ kutiladi (`typescript.ignoreBuildErrors: false`) — Faza 2 da o'lchanadi |

**H3 aniqlandi:** `next-auth` `package.json` da yo'q, lekin `@next-auth/prisma-adapter`
(devDependency) orqali tranzitiv o'rnatiladi. Dev'da tasodifan ishlaydi,
`npm ci --omit=dev` da buziladi.

## Baza

Lokal Postgres (:5432) parol talab qiladi; marketplace uchun `.env` yo'q.
Mashinada mehnat-ai bazasi ham bor — **Faza 0 testlari bazasiz** (Prisma mock) yozildi.

## Faza 0 dan keyin (o'sha kun)

| Buyruq | Oldin | Keyin |
|---|---|---|
| `npm run build` (backend) | ❌ 6 xato | ✅ (`tsconfig.build.json` `prisma/`, `scripts/` ni chiqaradi) |
| `npx tsc --noEmit -p tsconfig.build.json` | — | ✅ 0 xato |
| `npx jest --config jest.config.json` | 14/14 yiqildi | 44 o'tdi, 14 yiqildi (o'sha eski 14 — tegilmagan) |
| secret'larsiz `node dist/main` | fallback bilan ishga tushardi | `Config validation error: "JWT_ACCESS_SECRET" is required ...` |
| `NODE_ENV=production`, to'lov secret'larisiz | fallback bilan ishga tushardi | `"PAYME_SECRET_KEY" is required ...` |
| `npm audit --omit=dev` backend | — | 100 ta: 2 critical (`handlebars`, `liquidjs` — `@nestjs-modules/mailer` zanjiri), 66 high |
| `npm audit --omit=dev` frontend | — | 17 ta: 1 critical (`next@14.2.17`, tuzatish `next@16.3.6` — major), 13 high |

Audit tuzatishlari Faza 0 ga kiritilmadi: NestJS/Next/Prisma major yangilanishlari
alohida `deps/security-upgrade` shoxida, to'liq regressiya bilan qilinadi.
