# INBOLA — bolalar mahsulotlari marketplace'i

NestJS 11 + Prisma 6 + PostgreSQL (`backend-main/`) va Next.js 16 App Router
(`web/`). Olib tashlangan eski kod va uni qaytarish: `docs/ICEBOX.md`.
Deploy: `docs/DEPLOYMENT.md`, reliz: `docs/RELEASE_CHECKLIST.md`, nosozliklar: `docs/RUNBOOK.md`. Birinchi reliz qamrovi va bosqichlari: `docs/plan/MVP_ROADMAP.md`.
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
  `AdminGuard` MODERATOR'ni standart holatda rad etadi — unga ochiq endpoint `@AllowModerator()`
  bilan belgilanadi va `docs/PERMISSIONS.md` + `hardening.e2e-spec.ts` ga qo'shiladi.
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
# CI'dagi barcha qadamlar (PR oldidan; ikkala baza nomi `_test` bilan tugashi shart):
TEST_DATABASE_URL=... E2E_DATABASE_URL=... bash scripts/verify-all.sh [--docker]
node scripts/load-smoke.mjs <url> [--c 20] [--d 10]   # qisqa yuk sinovi, faqat o'z muhitingizga
```

## Modullar (MVP)

`identity/` (auth, OTP, SMS, token) · `catalog/` (mahsulotlar) · `order/` · `payments/`
(Payme, Click) · `account/` (manzillar) · `backoffice/` (admin dashboard, userlar) ·
`cart/` · `wishlist/` · `category/` · `brand/` · `region/` · `district/` · `review/` · `health/`
(`/health`, `/ready` — baza bilan; `/health/live` — faqat jarayon).
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
  Buyurtmani bekor qilishning boshqa yo'lini yozmang. To'langan (`PAID`) buyurtmani u bekor
  qilmaydi va `false` qaytaradi — natijani tekshiring; avval pul provayder orqali qaytariladi.
- **`markOrderPaid()` `false` qaytarsa tranzaksiyani orqaga qaytaring.** U faqat `PENDING` va
  to'lanmagan buyurtmani to'langan qiladi; `false` — buyurtma shu orada bekor qilingan. To'lov
  qatori `PAID` bo'lib qolmasin va provayderga xato qayting (Payme `-31008`, Click `-9`).
- **Buyurtma holati "o'qib, keyin yoz" bilan o'zgartirilmaydi.** Faqat shartli `updateMany`
  (`where: { id, status: <o'qilgan holat> }`) va `count` tekshiruvi: xaridor, admin va callback
  bir vaqtda kelganda zaxirasi qaytarilgan buyurtma "tasdiqlangan" bo'lib qolgan edi (2026-11-27).
- **Zaxira mutlaq son bilan shartsiz yozilmaydi.** Admin `expected_quantity` (o'zi ko'rgan qiymat)
  yuboradi; shu orada buyurtma tushgan bo'lsa 409. Buyurtma yo'lida — faqat shartli `decrement`.
- **Mijoz yuborgan `X-Forwarded-For` ga ishonilmaydi.** `web/lib/proxy.ts` uni faqat
  `TRUST_PROXY_HEADERS=true` (oldida nginx) bo'lganda uzatadi; aks holda kirish/OTP chegaralari
  har so'rovda boshqa "IP" yuborib aylanib o'tilardi.
- **OTP yuborishda uch chegara** (`identity/otp.service.ts`): raqam, IP'dan turli raqamlar, umumiy
  byudjet. Logga to'liq raqam, IP va kod tushmaydi (`common/security/mask.ts`).
- **Ochiq katalog endpoint'lari `@SkipThrottle()`.** Web server SSR so'rovlarini bitta IP'dan yuboradi:
  backend'dagi IP chegarasi 300 so'rov/daq dan keyin mahsulot sahifalarini hammaga 500 qilardi.
  Tashqi mijozlar nginx `limit_req` bilan cheklanadi. Yangi ochiq o'qish endpoint'i SSR'da
  ishlatilsa — shu dekorator kerak.
- **nginx `proxy_pass` o'zgaruvchi orqali** (`set $backend ...` + `resolver 127.0.0.11`): nom
  to'g'ridan-to'g'ri yozilsa, deploy'da konteyner IP'si o'zgarganda nginx 502 qaytarardi.
- **Loglar tuzilmali va shaxsiy ma'lumotsiz.** Hodisa — `logger.log({ event: '...', ... })` obyekti;
  telefon `maskPhone()` bilan, so'rov satri/token/parol/kod hech qachon. Prodda har satr JSON.
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
