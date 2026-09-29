# INBOLA Marketplace — to'liq review va MVP'gacha yakunlash rejasi

> **Holat:** Faza −1…4 kod darajasida bajarildi (2026-09-29). O'lchangan holat va
> ishga tushirishdan oldin qolgan ishlar: `docs/QUALITY_BAR.md` (§8).
> Faza 0 da topilgan qo'shimcha muammolar pastda (C6–C10); Faza 1–2 da frontend
> qayta qurildi (`web/`), eski `front-main/` ICEBOX'da.
> **Metodologiya:** `mehnat-ai/.claude/agents/full-project-reviewer.md` fazalari +
> `mehnat-ai/docs/QUALITY_BAR.md` uslubidagi o'lchanadigan mezonlar.
> **Qaror qilingan qamrov:** Asosiy savdo MVP · to'lov: Payme + Click + Uzum + naqd · deploy: VPS + Docker/pm2.

---

## 0. Context — nega bu reja

Ildizdagi `COMPREHENSIVE_AUDIT_REPORT.md` loyihani "✅ PRODUCTION READY, Security 9.8/10"
deydi. Kod buni tasdiqlamaydi: autentifikatsiyasiz har kim buyurtmani `PAID` qila oladi,
narxni mijoz o'zi yuboradi, frontend build'i yetishmayotgan paket tufayli yiqiladi.
Git tarixi Replit assistant "checkpoint"laridan iborat (merge-conflict tuzatishlari,
path tuzatishlari) — reja yo'q, test/CI yo'q.

Maqsad: soxta hisobotlar o'rniga dalilga asoslangan holatni belgilash va loyihani
**katalog → savat → checkout → to'lov → buyurtmalarim + admin** oqimi ishonchli ishlaydigan
birinchi relizgacha yetkazish.

**Tekshirilmagan (Not verified):** `node_modules` ikkala ilovada ham o'rnatilmagan —
build, `tsc`, testlar ishga tushirilmadi. Faza 0 ning birinchi qadami shu bazaviy o'lchov.

---

## 1. Review xulosasi

| Soha | Ball | Asosiy sabab |
|---|--:|---|
| Mahsulot aniqligi | 5 | "Bolalar marketplace" g'oyasi aniq, lekin README 10+ xususiyat va'da qiladi, asosiy xarid oqimi yopilmagan |
| Arxitektura | 3 | 6 ta parallel auth implementatsiyasi, `color`/`colors` dublikat, REST + GraphQL yarim-yarim, 2 ta bootstrap (`main.ts` / `simple-main.ts`) |
| Xavfsizlik | **1** | 4 ta Critical: to'lovni soxtalashtirish, narxni soxtalashtirish, ochiq admin CRUD, ma'lum JWT fallback secret |
| Backend | 3 | Validatsiya bor (ValidationPipe), lekin biznes invariantlari (narx, zaxira, to'lov holati) serverda emas |
| Frontend | 3 | Build yiqiladi (`next-auth` yo'q), buyurtma/muvaffaqiyat sahifalari o'chirilgan, API porti noto'g'ri |
| Ma'lumotlar bazasi | 4 | 50 model, lekin 2 migratsiya; `schema_continuation.prisma` dublikat; SQLite `dev.db` repoda |
| Test | 1 | 18 test fayl bor, ishga tushirilishi tasdiqlanmagan; CI yo'q |
| DevOps | 2 | docker-compose faqat DB'lar uchun; deploy skripti, backup, monitoring yo'q |
| Hujjatlar | 2 | 4 ta hisobot haqiqatga zid ("production ready") |
| **Prod tayyorligi** | **1** | Critical xavfsizlik teshiklari yopilmaguncha relizga chiqarib bo'lmaydi |

**Kuchli tomonlar:** NestJS modul tuzilishi tanish; Prisma sxemasi boy (Order/OrderItem/
OrderPayment/Inventory/Coupon allaqachon bor); Click imzo tekshiruvi yozilgan;
cart/wishlist class-level `UserGuard` bilan himoyalangan; order yaratish `$transaction` ichida.

---

## 2. Topilmalar (muhimlik bo'yicha)

### Critical

**[C1] To'lovni autentifikatsiyasiz "PAID" qilish**
- Joy: `backend-main/src/payment/payment.controller.ts:215` (click), `:285` (payme), `:364` (uzum); `payment/services/payme.service.ts:142`
- Dalil: `GET /payment/payme/verify?payment_id=X&status=...` guardsiz; `verifyPayment` holatni to'g'ridan-to'g'ri yozadi va `order.status = CONFIRMED` qiladi.
- Ta'sir: har kim pulsiz buyurtmani to'langan qiladi.
- Yechim: uchala `*/verify` endpoint'ini olib tashlash (yoki `AdminGuard` + audit). To'lov holati FAQAT imzolangan provider callback'idan o'zgaradi.

**[C2] Payme callback'da Basic-auth tekshiruvi yo'q**
- Joy: `payment.controller.ts:266-284`, `payme.service.ts:187` (`ACCESS_DENIED: -32504` e'lon qilingan, ishlatilmagan)
- Yechim: `Authorization: Basic base64("Paycom:" + PAYME_SECRET_KEY)` ni `timingSafeEqual` bilan tekshiruvchi guard; aks holda `-32504`. Payme JSON-RPC metodlari (CheckPerformTransaction, CreateTransaction, PerformTransaction, CancelTransaction, CheckTransaction, GetStatement) idempotent bo'lishi.

**[C3] Narx, chegirma va yetkazish summasini mijoz belgilaydi**
- Joy: `order/order.service.ts:40` (`item.unit_price * item.quantity`), `order/dto/create-order.dto.ts:20,64,74`
- Yechim: DTO dan `unit_price`, `discount_amount`, `tax_amount`, `shipping_amount` olib tashlanadi; narx `product.price` (Decimal) dan, chegirma `Coupon` dan, yetkazish server qoidasidan hisoblanadi. Zaxira (`Inventory`) tekshiruvi va kamaytirish shu `$transaction` ichida.

**[C4] Ochiq admin CRUD**
- Joy: `category/category.controller.ts:12,30,42,48` (create, **seed**, update, delete), `color/color.controller.ts:13,31,37` — guard umuman yo'q.
- Yechim: yozuv metodlariga `AdminGuard`; `POST category/seed` prod'da o'chiriladi.

**[C5] Ma'lum JWT fallback secret'lar**
- Joy: `auth/unified-auth.service.ts:39` (`'your-access-secret'`), `main.ts:38`, `auth/auth.module.ts:26`, `auth/user-auth.service.ts:293-319`
- Ta'sir: env o'rnatilmasa, har kim istalgan user tokenini soxtalashtiradi.
- Yechim: fallback'lar olib tashlanadi; `ConfigModule` da Joi validatsiya (`joi` allaqachon dependency) — secret yo'q/qisqa bo'lsa server ishga tushmaydi.

### Faza 0 davomida topilgan qo'shimcha Critical'lar (2026-09-29)

- **[C6] Soxta karta to'lovi:** `POST /payment/process/:orderId` `method: "CARD"` + istalgan karta ma'lumoti bilan `Math.random() > 0.1` — 90% holatda buyurtma `PAID`; egalik tekshirilmasdi. → CARD tarmog'i olib tashlandi, egalik tekshiriladi.
- **[C7] Ochiq admin ro'yxati:** `POST /admin/auth/phone-signup` ochiq edi, `role` DTO'dan, `is_active: true` — har kim o'zini SUPER_ADMIN qila olardi. → `AdminGuard + SuperAdminGuard`. `SuperAdminGuard` o'zi ham buzuq edi (`is_creator` payload'da yo'q → hammani rad etardi) — rol bo'yicha tuzatildi.
- **[C8] To'lov summasi va egaligi mijozdan:** `*/create` `amount` ni mijozdan olardi va buyurtma egasini tekshirmasdi; Click callback shu summani solishtirgani uchun 1 so'm to'lab buyurtmani yopish mumkin edi. → summa `order.final_amount`, egalik tekshiriladi.
- **[C9] To'lov secret fallback'lari:** `'test_secret'` (Click/Payme), `'test_uzum_secret'` — env bo'lmasa ma'lum kalit bilan imzo yasash mumkin edi. → olib tashlandi, secret yo'q bo'lsa imzo rad etiladi; prodda Joi talab qiladi.
- **[C10] Ochiq katalog yozuvi:** `product/create` (guard "vaqtincha" izohda), `brand/seed`, `currency/seed`, `payment-methods` POST. → `AdminGuard`.
- **`.env` yuklanish tartibi:** `JwtModule.register({ secret: process.env... })` import paytida baholanadi, `.env` esa faqat `utils/otp-crypto/crypto.ts` tasodifan import qilinganda yuklanardi — fallback secret'lar amalda ishlatilgan bo'lishi mumkin. → `main.ts` ning birinchi qatori `import 'dotenv/config'`.
- **O'lik route:** `@Post('payme/callback') @Post('payme')` — ikkinchisi hech qachon ishlamagan (test topdi).

### High

- **[H1] Auth hayvonot bog'i:** `auth/` da 6 controller (`auth`, `unified-auth` — ikkalasi `@Controller('auth')`, `phone-auth`, `sms-auth`, `user-auth`, `telegram-auth`, `google-auth`) + alohida `user-auth/` moduli. Tokenlar `JWT_ACCESS_SECRET` bilan imzolanadi, guard'lar `ACCESS_TOKEN_KEY` bilan tekshiradi (`guards/user.guard.ts:31`, `guards/admin.guard.ts:37`) — ishlashi `@nestjs/jwt` default'iga tasodifan bog'liq. → Bitta `AuthModule`: telefon+OTP (asosiy), Google (ixtiyoriy); bitta env nomi.
- **[H2] Buzilgan endpoint:** `payment.controller.ts:405` — `UserSelfGuard` `UserGuard` siz, `req.user` undefined → 500; guard `params.id` ni tekshiradi, route `:userId`. IDOR xavfi ham shu naqshda.
- **[H3] `next-auth` e'lon qilinmagan:** `app/api/auth/[...nextauth]/route.ts` import qiladi; paket faqat devDependency `@next-auth/prisma-adapter` orqali tranzitiv o'rnatiladi — `npm ci --omit=dev` da buziladi. Frontend `tsc` da 505 xato (`docs/audit/BASELINE_2026-09.md`).
- **[H4] Frontend noto'g'ri backendga ulanadi:** `front-main/next.config.js:8` default `:3001`, backend `:4000` da tinglaydi.
- **[H5] Xarid oqimi yopilmagan:** `app/_orders.disabled/`, `app/payment/_success.disabled/` o'chirilgan; `components/checkout/EnhancedCheckoutFlow.tsx` hech qayerda ishlatilmaydi; foydalanuvchi login/ro'yxat sahifasi yo'q (faqat `admin/login`).
- **[H6] Prod boshqa bootstrap ishlatadi:** `npm start` → `dist/simple-main` (helmet, swagger, kengaytirilgan CORS yo'q); dev → `main.ts`. Prodda xavfsizlik sarlavhalari yo'q.
- **[H7] Rate limit prodda ham amalda yo'q:** `app.module.ts` 1000 so'rov/daqiqa; OTP yuborish (`otp.controller.ts:22`) cheklanmagan → SMS balansini yoqish.

### Medium

- **[M1]** `prisma/schema_continuation.prisma` — `schema.prisma` dagi modellarning eski nusxasi; 50 model uchun 2 migratsiya → sxema/baza drift ehtimoli katta.
- **[M2]** Repoda: `dev.db`, `prisma/dev.db` (SQLite, Postgres loyihasida), `dump.rdb`, `generated/prisma/*`, `.env.test`.
- **[M3]** Dublikat modullar: `color/` va `colors/`; `guards/` va `auth/guards/` va `common/guards/`; `admin-or-owner.guard.ts` 0 bayt; frontend `hooks/useApi.ts`, `useNotificationSocket.ts`, `NotificationContext.tsx` 0 bayt.
- **[M4]** Frontendda 3 ta holat menejeri (Redux Toolkit + redux-persist, Zustand, React Query) + Apollo; 2 ta UI kutubxona (Mantine, Radix) + 2 ta toast (react-hot-toast, react-toastify).
- **[M5]** Tokenlar `localStorage` da (`endpoints/instance.ts:36-37,103`) — XSS bo'lsa o'g'irlanadi. MVP uchun qabul qilinadi, lekin CSP bilan.
- **[M6]** Ildizdagi 4 hisobot (`COMPREHENSIVE_AUDIT_REPORT.md`, `DIAGNOSTIC_REPORT.md`, `QA_TEST_REPORT.md`, `front-main/README_FINAL.md`) haqiqatga zid; `next.config.backup.ts`, `next.config.ts.bak`, `tsconfig.bak`, `fix-nextjs.sh` — ahlat.

### Low
- `Unauthorizard1 user` kabi xato matnlari; `console.log(error)` guard'larda; Windows-only `setup.ps1`.

---

## 3. Yo'l xaritasi

Har faza oxirida `docs/QUALITY_BAR.md` jadvali yangilanadi. Har faza — alohida shox + PR.

### Faza −1 · Agent infratuzilmasi (mehnat-ai'dan ko'chirish) — ½ kun
- `AGENTS.md` (ildiz): stack, buyruqlar, **tuzoqlar** (har biri — shu reviewdagi aniq topilma: "narx serverda hisoblanadi", "to'lov holati faqat callback'dan", "`prisma migrate dev` faqat lokalda, prodga `migrate deploy`").
- `CLAUDE.md`: mehnat-ai'dagi Mission / Scope Discipline / Database Safety / Financial Data Integrity / AuthZ bo'limlarini marketplace'ga moslab (1C, multi-tenant bo'limlari tushiriladi).
- `.claude/hooks/guard-bash.sh` + `guard-bash.test.sh` + `session-start.sh` — mehnat-ai'dan olib, qoidalarni moslash (prisma reset, prod DB'ga seed, `.env` chop etish). `.claude/settings.json` hook ulanishi.
- `.claude/agents/full-project-reviewer.md` — aynan nusxa (keyingi qayta-auditlar uchun).
- `docs/QUALITY_BAR.md` — quyidagi §4 mezonlari bilan.
- Soxta hisobotlar `docs/archive/` ga ko'chiriladi, ustiga "tasdiqlanmagan, 2026-09-29 review'ga zid" belgisi.

### Faza 0 · Bazaviy o'lchov + Critical tuzatishlar — 2-3 kun
1. `npm ci` ikkala ilovada; `npx tsc --noEmit`, `npm run build`, `npm test` natijalarini `docs/audit/BASELINE_2026-09.md` ga yozish (nima yiqildi — ro'yxat).
2. **C1** verify endpoint'larini olib tashlash; **C2** Payme Basic-auth guard; Click/Uzum callback imzolarini `timingSafeEqual` ga o'tkazish.
3. **C3** narxni serverda hisoblash + zaxira tekshiruvi/kamaytirish `$transaction` ichida; mavjud `Inventory`/`InventoryMovement` modellaridan foydalanish.
4. **C4** category/color yozuv metodlariga `AdminGuard`.
5. **C5** JWT fallback'larni olib tashlash + `ConfigModule.forRoot({ validationSchema: Joi... })`.
6. **H6** bitta bootstrap: `main.ts` qoladi, `simple-main.ts` va `test-server.ts` o'chadi; `start:prod` → `dist/main`.
7. Har tuzatish uchun e2e test (supertest): "verify endpoint 404", "callback noto'g'ri auth → -32504", "mijoz `unit_price: 1` yuborsa ham DB narxi yoziladi", "user tokeni bilan `DELETE /category/1` → 401/403".

### Faza 0.5 · Bog'liqliklar xavfsizligi — 1-2 kun (alohida PR)
- `npm audit --omit=dev`: backend 2 critical + 66 high, frontend 1 critical + 13 high (`docs/audit/BASELINE_2026-09.md`).
- Backend: `@nestjs-modules/mailer` (handlebars/liquidjs/mjml zanjiri) — MVP'da email kerak bo'lmasa modul uziladi, aks holda yangilanadi; NestJS/express/multer/axios minor-patch.
- Frontend: `next` 14.2.17 → 16.x major — Faza 2 frontend ishlari bilan birga (App Router, `next.config.js` o'zgaradi).
- Qabul: 0 critical; qolgan high'lar asoslangan istisno bilan `QUALITY_BAR.md` S9 da.

### Faza 1 · Backend konsolidatsiya — 4-5 kun
- **H1** Auth birlashtirish: telefon + OTP (asosiy) + Google; bitta `JwtAuthGuard` + `RolesGuard` (`user`/`admin`/`super_admin`); `ACCESS_TOKEN_KEY` → `JWT_ACCESS_SECRET`. Refresh token rotatsiyasi `hashed_refresh_token` orqali (sxemada bor). Qolgan auth controllerlari o'chiriladi; frontend chaqiradigan route'lar avval `grep` bilan xaritalanadi.
- **H2** IDOR audit: har `:id`/`:userId` endpoint egalikni `req.user.sub` bilan tekshiradi; `UserSelfGuard` o'rniga servisda `where: { id, user_id }`. Aniq nomzodlar: `POST /phone-number`, `POST /email`, `POST /email/byUser/:id` (DTO'dagi istalgan `user_id` ga yozadi), `GET /payment/history/:userId`.
- Payme holat mashinasi: `PerformTransaction` `CANCELLED` to'lovni ham bajaradi; Click callback `findFirst({ order_id, CLICK })` eski to'lov qatorini olishi mumkin; `processPayment` provayder servisi bilan birga ikkinchi `OrderPayment` qatorini yaratadi.
- `prisma/seed.ts` joriy sxemaga moslanadi (`hashed_password`, `Inventory`).
- **H7** Throttler prodda: global 100/daqiqa, OTP send 3/10 daqiqa/telefon (Redis storage).
- Buyurtma holat mashinasi: `PENDING → CONFIRMED → SHIPPED → DELIVERED`, `CANCELLED` (zaxira qaytariladi); naqd to'lov uchun `payment_method = CASH`, admin "yetkazildi+to'landi" deb yopadi.
- To'lov idempotentligi: `OrderPayment.transaction_id` `@unique`; callback qayta kelganda ikkinchi marta `PAID` yozmaydi; summa `order.final_amount` bilan solishtiriladi.
- **M1/M3** `schema_continuation.prisma`, `color/` (yoki `colors/`), bo'sh fayllar o'chiriladi. Prod bazasi yo'q ekan, migratsiyalar bitta toza `init` ga squash qilinadi (prod'dan OLDIN — keyin bu mumkin emas).
- MVP'dan tashqari modullar (`chat`, `child-safety`, `seller`, `microservices`, `telegram` bot, GraphQL resolverlari) `app.module.ts` dan uziladi (kod o'chirilmaydi, `ICEBOX.md` ga yoziladi).

### Faza 2 · Frontend: xarid oqimini yopish — 5-7 kun
- **H3/H4** `next-auth` route'ini olib tashlash (backend JWT ishlatiladi) yoki paketni qo'shish — tavsiya: olib tashlash, bitta auth manbai. `NEXT_PUBLIC_API_URL` bitta joyda, default `:4000`.
- Sahifalar: `/login` (telefon+OTP), `/cart` → `/checkout` (manzil: Region/District/Address; to'lov usuli: Payme/Click/Uzum/naqd) → provider redirect → `/payment/success` (holatni backenddan so'raydi, URL parametriga ishonmaydi) → `/orders`, `/orders/[id]`.
- `EnhancedCheckoutFlow` ni ulash yoki o'rniga oddiy 3-bosqichli forma.
- Admin: mahsulot CRUD + rasm yuklash, buyurtmalar ro'yxati va holat o'zgartirish, kategoriya/brend.
- Har sahifada loading / error / empty holatlari; mobil (375px) tekshiruvi.
- **M4** Holat: React Query (server holati) + Zustand (savat/UI); Redux, redux-persist, Apollo olib tashlanadi. Bitta toast kutubxonasi.
- Ahlat fayllar (`*.bak`, `next.config.backup.ts`, `fix-nextjs.sh`, `_*.disabled`) o'chiriladi.
- `components/Payment/MultiCurrencyPaymentGateway.tsx` karta raqami/CVV yig'adi — backend endi CARD'ni qabul qilmaydi; komponent olib tashlanadi (karta ma'lumoti serverimizga tushmasligi kerak).
- `endpoints/color.ts` `PUT` yuboradi, backend `PATCH` kutadi; `endpoints/payment.ts` `amount` yuboradi (backend e'tiborsiz qoldiradi) — tozalanadi.
- `Dockerfile` healthcheck `:3001` ga qaraydi (backend `:4000`).

### Faza 3 · Test + CI — 2-3 kun (Faza 0-2 bilan parallel o'sadi)
- Backend e2e (supertest + alohida test Postgres, `TEST_DATABASE_URL` tekshiruvi — prod URL bo'lsa test to'xtaydi): auth, order narx, zaxira poygasi (2 parallel buyurtma, 1 dona zaxira), 3 provider callback (to'g'ri/noto'g'ri imzo, takroriy callback), IDOR.
- Frontend: Playwright bitta "happy path" — login → savat → checkout (naqd) → buyurtmalarim.
- `.github/workflows/ci.yml`: install → `tsc` → lint → unit → e2e (Postgres service) → ikkala build.

### Faza 4 · Deploy (VPS + Docker/pm2) — 2-3 kun
- `docker-compose.prod.yml`: postgres, redis, backend, frontend (`output: 'standalone'` allaqachon yoqilgan); pgAdmin/redis-commander prod'dan chiqariladi, DB porti tashqariga ochilmaydi.
- nginx + Let's Encrypt; `/api` → backend, qolgani → frontend; to'lov callback URL'lari HTTPS.
- `scripts/deploy.sh` (mehnat-ai naqshi): backup → `prisma migrate deploy` → build → health preflight → reload; rollback bo'limi.
- `scripts/backup.sh`: `pg_dump` + `public/uploads` arxivi (rasmlar diskda — dump yetarli emas), kunlik cron, 1 marta tiklash sinovi.
- Sentry (`@sentry/node` allaqachon bor) backend + frontend; winston JSON log; `/health` DB+Redis ni tekshiradi (`@nestjs/terminus` bor).
- Provider sandbox'larida (Payme test kassa, Click/Uzum test) uchidan-uchiga sinov, keyin prod kalitlar.

**Taxminiy jami:** ~3-4 hafta bir dasturchi uchun.

---

## 4. Definition of Done (MVP)

| # | Mezon | O'lchov |
|---|---|---|
| F1 | Xarid oqimi | Playwright happy-path CI'da yashil (naqd) + qo'lda 3 provider sandbox'da to'lov |
| S1 | Critical topilmalar | C1-C5 yopilgan, har biriga regressiya testi |
| S2 | `npm audit --omit=dev` | 0 high/critical (yoki asoslangan istisno) |
| S3 | Secret'lar | Koddagi fallback 0; env yo'q bo'lsa server ishga tushmaydi |
| D1 | Narx yaxlitligi | `OrderItem.unit_price` har doim `Product.price` ga teng (test) |
| D2 | Zaxira | Parallel buyurtma testida manfiy zaxira yo'q |
| D3 | To'lov idempotentligi | Takroriy callback holatni ikki marta o'zgartirmaydi (test) |
| T1 | CI | Har PR'da tsc + test + build |
| O1 | Kuzatuv | Sentry'ga xato tushadi; `/health` DB/Redis holatini qaytaradi |
| B1 | Backup | Tiklash bir marta sinovdan o'tgan (DB + uploads) |
| U1 | UX | Har sahifada loading/error/empty; 375px da gorizontal scroll yo'q |
| Doc | Hujjat | README haqiqiy buyruqlar bilan; soxta hisobotlar arxivda |

---

## 5. Tekshirish (verification)

- Faza 0 dan keyin: `cd backend-main && npx tsc --noEmit && npm run test:e2e`; qo'lda
  `curl -s "http://localhost:4000/api/payment/payme/verify?payment_id=x&status=2"` → 404;
  `curl -s -X POST localhost:4000/api/payment/payme -d '{...}'` Authorization'siz → `error.code = -32504`;
  user tokeni bilan `curl -X DELETE localhost:4000/api/category/1` → 401/403.
- Faza 2 dan keyin: `cd front-main && npm run build && npx playwright test`; brauzerda to'liq oqim.
- Faza 4 dan keyin: staging VPS'da `deploy.sh`, sandbox to'lov, backup→tiklash sinovi.

## 6. Keyingi bosqich (ICEBOX, MVP'dan keyin)
Seller portal · ota-ona nazorati / bolalar xavfsizligi · chat · GraphQL · tavsiyalar · sovg'a o'rash · Telegram login.
