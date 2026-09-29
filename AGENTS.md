# INBOLA — bolalar mahsulotlari marketplace'i

NestJS 11 + Prisma 6 + PostgreSQL (`backend-main/`) va Next.js 16 App Router
(`web/`). Olib tashlangan eski kod va uni qaytarish: `docs/ICEBOX.md`.
Deploy: `docs/DEPLOYMENT.md`. Birinchi reliz qamrovi va bosqichlari: `docs/plan/MVP_ROADMAP.md`.
O'lchanadigan tayyorlik mezonlari: `docs/QUALITY_BAR.md`.

## Uy qoidalari

- **Interfeys tili — o'zbek (lotin).** Kod, buyruq va texnik atamalar o'z holicha.
- **Izoh NEGA ni yozadi, NIMA ni emas.** Kod ifodalay olmaydigan cheklovni yozing.
- **Narx, chegirma, yetkazish summasi faqat serverda hisoblanadi.** Mijoz
  faqat `product_id` va `quantity` yuboradi; narx `Product.price` dan olinadi.
- **To'lov holati faqat imzosi tekshirilgan provider callback'idan o'zgaradi.**
  Payme — Basic auth, Click/Uzum — imzo, taqqoslash `timingSafeEqual` bilan.
  Mijoz yoki URL parametri to'lovni "PAID" qila olmaydi.
- **Buyurtma + zaxira + to'lov yozuvlari bitta `$transaction` da.** Callback
  takror kelsa holat ikkinchi marta o'zgarmaydi (idempotent).
- **Har yozuv endpoint'ida guard bor.** Egalik servisda `where: { id, user_id }`
  bilan tekshiriladi; UI hech qachon yagona to'siq emas. Foydalanuvchi — `UserGuard`,
  admin — `AdminGuard` (+ `SuperAdminGuard`); token turlari bir-birining o'rnida o'tmaydi.
- **Secret'lar uchun koddagi fallback yo'q.** Env yetishmasa server ishga tushmasligi kerak.

## Buyruqlar

```bash
# backend-main/
npm ci
npm run start:dev                    # :4000, API /api/v1/..., Swagger /api/docs
npx tsc --noEmit -p tsconfig.build.json
npm run lint && npm test             # lint + unit (bazasiz)
TEST_DATABASE_URL=postgresql://USER@HOST:PORT/NOMI_test npm run test:e2e   # haqiqiy Postgres
npx prisma migrate dev --name <nom>  # faqat lokal, yangi migratsiya
npx prisma migrate deploy            # server
npm run seed                         # hududlar, toifalar, UZS (SEED_DEMO=true — demo mahsulotlar)
ADMIN_PHONE=+998... ADMIN_PASSWORD=... node create-admin.js   # birinchi super admin

# web/
npm ci
API_URL=http://localhost:4000 npm run dev   # :3000
npm run typecheck && npm run lint && npm run build
npx playwright test                  # backend va web build qilingan bo'lsin; PW_CHANNEL=chrome — tizim Chrome'i bilan

# ildiz
bash .claude/hooks/guard-bash.test.sh .claude/hooks/guard-bash.sh
```

## Modullar (MVP)

`identity/` (auth, OTP, SMS, token) · `catalog/` (mahsulotlar) · `order/` · `payments/`
(Payme, Click) · `account/` (manzillar) · `backoffice/` (admin dashboard, userlar) ·
`cart/` · `wishlist/` · `category/` · `brand/` · `region/` · `district/` · `review/` · `health/`.
Eski modullar olib tashlangan (`docs/ICEBOX.md`); ularni git'dan qaytarishdan oldin
o'sha ro'yxatdagi xavfsizlik sabablarini o'qing.

## Tuzoqlar

Har biri 2026-09-29 review'ida kodda topilgan (`docs/plan/MVP_ROADMAP.md` §2).

- **Migratsiyalar faqat oldinga.** Destruktiv migratsiya (`DROP`) faqat egasining
  aniq tasdig'i bilan yoziladi va izohida sababi turadi.
- **E2E testlar bazani TRUNCATE qiladi.** `test/mvp/harness.ts` faqat nomi `_test`
  bilan tugaydigan bazada ishlaydi. Bu tekshiruvni olib tashlamang.
- **Click summasi so'mda, Payme summasi tiyinda.** `payments/order-payment-state.ts`
  dagi `tiyin()` dan foydalaning; eski kod Click'ni `* 100` bilan solishtirardi.
- **To'lov callback'lari takror keladi.** Holat o'zgarishi shartli `updateMany`
  (`where: { provider_state: 1 }`) bilan yoziladi — oddiy `update` ikki marta ishlaydi.
- **`OrderService.cancel()` zaxirani qaytaradi** va takroriy chaqiruvda hech narsa qilmaydi.
  Buyurtmani bekor qilishning boshqa yo'lini yozmang.
- **Eski `.env` kalitlari** (`ACCESS_TOKEN_KEY`, `SESSION_SECRET`, `UZUM_*`) endi o'qilmaydi.
- **`prisma migrate reset` / `db push --force-reset` ishlatilmaydi** — qo'riqchi to'sadi.
- **`.env*`, `*.db`, `dump.rdb` repoga qo'shilmaydi** — qo'riqchi to'sadi.
- **Next.js 16 — o'rgatilgan versiya emas.** `web/node_modules/next/dist/docs/` dagi
  qo'llanmani o'qing: `params`/`searchParams` Promise, `middleware` → `proxy`.
- **`next.config` rewrites build'ga qotib qoladi.** Shu sababli API `web/lib/proxy.ts`
  (route handler) orqali uzatiladi va `API_URL` ishga tushishda o'qiladi.
- **O'zbekcha apostrof:** interfeysda `oʻ`/`gʻ` (U+02BB) va tutuq `ʼ` (U+02BC).
  ASCII `'` JSX matnida lint xatosi beradi.
- **Narx va sana `web/lib/format.ts` orqali** — `Intl` server va brauzerda har xil chizadi.

## Agent sozlamalari

`.claude/settings.json` ikki hook ulaydi:

- `guard-bash.sh` (PreToolUse) — yuqoridagi xavfli buyruqlarni to'sadi va sababini aytadi.
  Yangi qoida qo'shsangiz `guard-bash.test.sh` ga sinov ham qo'shing.
- `session-start.sh` (SessionStart) — shox, baza, portlar, `node_modules` holati.

`.claude/agents/full-project-reviewer.md` — to'liq read-only qayta audit uchun.
