# Sifat chegarasi — MVP

> "Production ready" — ta'rifsiz so'z. Bu yerda u o'lchanadigan qilib yozilgan.
> Har faza oxirida shu jadval yangilanadi. Reja: `docs/plan/MVP_ROADMAP.md`.

**Holat belgilari:** ✅ bajarilgan · ⚠️ qisman · ❌ yo'q · ❔ o'lchanmagan

Bazaviy holat — 2026-09-29 review. Oxirgi yangilanish — 2026-11-27 qayta audit: quyidagi
"✅" lar o'sha kuni lokal mashinada qayta ishga tushirilgan buyruqlar bilan tasdiqlangan
(backend unit 28, e2e 50, Playwright 4, drift 0). Topilgan va yopilgan nuqsonlar — §9.

## 1. Xavfsizlik

| # | Chegara | Holat | Faza |
|---|---|---|---|
| S1 | To'lov holatini faqat imzolangan callback o'zgartiradi (C1, C6) | ✅ verify/webhooks dublikatlari va CARD mock olib tashlandi; `route-guards.spec.ts` | 0 |
| S2 | Payme callback Basic-auth tekshiradi (C2) | ✅ `timingSafeEqual`, fail-closed; `payment-security.spec.ts` | 0 |
| S3 | Narx/chegirma/yetkazish serverda hisoblanadi (C3, C8) | ✅ buyurtma va to'lov summasi bazadan; `order-pricing.spec.ts` | 0 |
| S4 | Katalog/admin yozuv endpoint'larida guard (C4, C7, C10) | ✅ statik skan: qolgan ochiq POST'lar — auth, callback va H2 nomzodlari | 0 |
| S5 | Secret'lar uchun fallback yo'q, env Joi bilan tekshiriladi (C5, C9) | ✅ secret'siz server ishga tushmaydi; `.env.example` nusxasi (bo'sh ixtiyoriy kalitlar) bilan ishga tushadi — `environment.config.spec.ts` + haqiqiy `node dist/main` | 0 |
| S6 | Bitta auth modul, bitta JWT env nomi (H1) | ✅ `identity/`: user OTP + admin parol; `kind` bo'yicha ajratilgan tokenlar; refresh rotatsiyasi (sha256) | 1 |
| S7 | IDOR: egalik servisda tekshiriladi (H2) | ✅ buyurtma, manzil, checkout — e2e `orders.e2e-spec.ts` | 1 |
| S10 | Bloklangan xaridor darhol to'xtatiladi; admin rollari ajratilgan | ✅ `UserGuard` holatni har so'rovda tekshiradi; MODERATOR standart holatda taqiq — 31 endpoint × 3 rol (`hardening.e2e-spec.ts`, `docs/PERMISSIONS.md`) | 7 |
| S11 | Mijoz yuborgan `X-Forwarded-For` cheklovlarni aylanib o'tmaydi | ✅ Next proxy uni faqat `TRUST_PROXY_HEADERS=true` da uzatadi; Playwright: 8 urinishdan ≥3 tasi 429 (ilgari 0) | 7 |
| S8 | Prodda rate limit; OTP yuborish cheklangan (H7) | ⚠️ global 300/daq, auth 5/daq (IP) — xotirada, bitta jarayon uchun. OTP: 60 s, 10/kun/raqam, 5 urinish + IP'dan soatiga 10 turli raqam + umumiy byudjet 300/soat, 2000/kun (bazada, env bilan sozlanadi); anomaliya logi `otp_limit`. Captcha yo'q — qaror kerak (§8) | 1-7 |
| S9 | `npm audit --omit=dev` = 0 high/critical | ⚠️ 2026-11-27: backend **4 high, 0 critical** — hammasi S9a zanjiri (`npm audit fix`, faqat lockfile: 10 → 4). Web: **0** — Next 16.3.6 da critical advisory'lar (RCE, kesh zaharlash) chiqqani uchun **16.4.6** ga ko'tarildi. Advisory'lar vaqt o'tishi bilan paydo bo'ladi: reliz oldidan qayta ishga tushiring | 0.5-6 |
| S9a | `deepmerge-ts <8`, `effect <=3.22` (`prisma` → `@prisma/config` zanjiri) | ⚠️ **qabul qilingan**: faqat Prisma CLI konfiguratsiyasini birlashtirishda, runtime'da foydalanuvchi ma'lumoti yetmaydi. Tuzatish — Prisma 7 (major) | keyin |

## 2. Ma'lumot yaxlitligi

| # | Chegara | Holat | Faza |
|---|---|---|---|
| D1 | `OrderItem.unit_price` = `Product.price` (test bilan) | ✅ unit test (mock Prisma) | 0 |
| D2 | Parallel buyurtmada manfiy zaxira yo'q | ✅ haqiqiy Postgres: 3 parallel buyurtma, 1 dona → 1 ta o'tadi | 0-1 |
| D3 | Takroriy callback holatni ikki marta o'zgartirmaydi | ✅ Payme/Click e2e (takroriy Create/Perform/Cancel/Complete) | 1 |
| D5 | Bekor qilingan buyurtma to'langan bo'lib qolmaydi; to'langan buyurtma bekor bo'lmaydi | ✅ `markOrderPaid`/`cancel()` shartli yozuv; e2e: Create→bekor→Perform = -31008, Click = -9, parallel poyga 5 marta | 6 |
| D7 | Admin zaxira tahriri parallel buyurtmani yo'qotmaydi | ✅ shartli yozuv (`expected_quantity`), 409; e2e poyga 5 marta | 7 |
| D6 | Admin holat o'zgartirishi poygada buzilmaydi | ✅ e2e: 3 parallel "yetkazildi" → 1 ta naqd to'lov; tasdiqlash ↔ xaridor bekor qilishi; teskari tartibli buyurtmalar deadlock'siz | 6 |
| D4 | Sxema = migratsiyalar (drift yo'q), bitta sxema fayli | ✅ oldinga migratsiya (DROP'siz), `migrate diff --exit-code` = 0 | 1 |

## 3. Funksionallik

| # | Chegara | Holat | Faza |
|---|---|---|---|
| F1 | Login (telefon+OTP) → savat → checkout → to'lov → buyurtmalarim | ✅ Playwright brauzerda (naqd); onlayn to'lov — provayder manziliga yo'naltirishgacha (summa serverdan), haqiqiy to'lov — F2 | 2 |
| F2 | Payme, Click sandbox'da uchidan-uchiga | ⚠️ protokol e2e'da (imzo, summa, idempotentlik, taym-aut); haqiqiy sandbox kalitlari kerak. Uzum — ICEBOX | 4 |
| F3 | Naqd (yetkazganda) to'lov | ✅ backend: "yetkazildi" = to'landi (e2e) | 1-2 |
| F5 | Sharhlar: faqat yetkazilgan xarid, bittadan, egasi tahrirlaydi | ✅ backend e2e + Playwright | 5 |
| F4 | Admin: mahsulot, buyurtma holati, bo'limlar, xaridorlar, adminlar | ✅ `web/app/admin`; buyurtma o'tishlari Playwright'da, mahsulot/rasm/zaxira backend e2e'da | 2 |

## 4. Build va test

| # | Chegara | Holat | Faza |
|---|---|---|---|
| T1 | Backend build va `tsc` toza | ✅ istisnosiz — eski kod olib tashlangan | 0-5 |
| T2 | Frontend build, tip, lint | ✅ `web/`: tsc 0, eslint 0, build o'tadi | 2 |
| T3 | Har Critical tuzatishga regressiya testi | ✅ unit 28 (bazasiz) + e2e 50 (haqiqiy Postgres); yangi poyga testlari eski kodda yiqilishi tekshirilgan (9 ta) | 0-6 |
| T4 | Playwright happy-path | ✅ 4/4: xaridor → naqd buyurtma → admin "yetkazildi" → sharh; onlayn to'lov (havola xatosi → bitta buyurtma, summa serverdan); mehmon yo'naltirilishi; 375px'da 9 sahifa gorizontal scroll'siz | 3-6 |
| T6 | Lint | ✅ backend (ESLint 9 flat) va web — 0 xato; CI'da | 5 |
| T5 | CI har PR'da (tsc + test + build) | ❌ `.github/workflows/ci.yml` bor, lekin GitHub'da **hech bir job ishga tushmagan**: hisob billing sababli bloklangan (`gh run view`, 2026-11-27). Workflow qadamlari lokal bajarilgan, GitHub'da tasdiqlanmagan | 3 |

## 5. Deploy va kuzatuv

| # | Chegara | Holat | Faza |
|---|---|---|---|
| O1 | Bitta bootstrap, prodda helmet (H6) | ✅ `start`/`start:prod` → `dist/main`; `CORS_ORIGIN` env'dan | 0 |
| O2 | `docker-compose.prod.yml` + nginx + HTTPS | ⚠️ 2026-11-27: ikkala image toza git nusxasidan `docker build` bo'ldi; backend image prod rejimda test bazaga ulanib `/health` = ok, secret'siz ishga tushmaydi; web image `/login` = 200. `docker compose` to'liq steki, nginx va TLS — sinalmagan (domen/VPS kerak) | 4 |
| O3 | `deploy.sh` (backup → build → migrate deploy → up → health) | ⚠️ yozildi, `bash -n` toza; VPS'da ishga tushirilmagan | 4 |
| O4 | Backup (DB + uploads), tiklash bir marta sinovdan o'tgan | ⚠️ `backup.sh`/`restore.sh` yozildi; tiklash sinovi staging'da qilinishi kerak | 4 |
| O5 | Xato kuzatuvi + `/health` bazani tekshiradi | ⚠️ `/health` haqiqiy `SELECT 1` (503), Docker healthcheck, log aylanishi; Sentry yo'q | 4 |

## 6. Kod tozaligi

| # | Chegara | Holat | Faza |
|---|---|---|---|
| C1 | Repoda ishlatilmaydigan kod yo'q | ✅ 1 000+ fayl olib tashlandi (`front-main`, eski backend modullari, generatsiya qilingan Prisma, ikkilik fayllar) — `docs/ICEBOX.md` | 5 |
| C3 | Sxemada ishlatilmaydigan jadval yo'q | ✅ 32 jadval DROP (tasdiqlangan), 22 model qoldi, drift 0 | 5 |
| C2 | Bitta faol shox | ✅ mahalliy va GitHub'da faqat `main`; 5 ta eski remote shox o'chirildi (tasdiqlangan). Ularda commit qilingan DB/Redis parollari va eski JWT kalitlari almashtirilishi kerak | 5 |

## 7. Agent infratuzilmasi

| # | Chegara | Holat | Faza |
|---|---|---|---|
| A1 | `AGENTS.md`, `CLAUDE.md` | ✅ | −1 |
| A2 | `guard-bash.sh` + sinov (16/16) | ✅ | −1 |
| A3 | `session-start.sh` | ✅ | −1 |
| A4 | Ishonchsiz hisobotlar arxivda | ✅ `docs/archive/` | −1 |

## 8. Ishga tushirishdan oldin qolgan ishlar

Kod bilan emas, muhit va qaror bilan bog'liq — shu sababli bu yerda bajarilmagan:

1. Payme va Click **sandbox kalitlari** bilan uchidan-uchiga to'lov (F2).
2. Eskiz hisobida **SMS shabloni** tasdiqlanishi (matn: `INBOLA: tasdiqlash kodi ...`).
3. VPS'da `docker compose build` va birinchi `deploy.sh` (O2, O3); staging'da **tiklash sinovi** (O4).
4. Yetkazish narxi qoidasi (`SHIPPING_FLAT_FEE`, `FREE_SHIPPING_FROM`) — hozir 0.
5. Uzum: hujjat va kalitlar (ICEBOX).
6. GitHub hisobidagi **billing blokini** yechish — busiz CI (T5) ishlamaydi.
7. **Captcha qarori.** OTP yuborishga IP va umumiy byudjet chegaralari qo'shildi, lekin ko'p IP'li
   hujumda umumiy byudjet tugab, haqiqiy xaridorlar ham kira olmay qoladi. Buni faqat captcha
   (Cloudflare Turnstile yoki hCaptcha) hal qiladi — variantlar yakuniy hisobotda.
8. Moderator huquqlari (`docs/PERMISSIONS.md`) va OTP byudjeti raqamlarini tasdiqlash.

## 9. 2026-11-27 qayta auditda topilib, yopilgan nuqsonlar

Har biri regressiya testi bilan; poyga testlari eski kodda yiqilishi tekshirilgan.

| # | Daraja | Nuqson | Tuzatish | Test |
|---|---|---|---|---|
| R1 | P0 | Payme `CreateTransaction` dan keyin bekor qilingan (zaxirasi qaytgan) buyurtma `PerformTransaction` bilan `PAID` bo'lardi; Click'da shu holat poygada | `markOrderPaid` — bitta shartli yozuv (`PENDING` va to'lanmagan), `false` da tranzaksiya orqaga qaytadi | `payments.e2e-spec.ts` |
| R2 | P0 | To'lov callback'i bilan bir vaqtda kelgan bekor qilish to'langan buyurtmani bekor qilardi | `OrderService.cancel()` `PAID` ni bekor qilmaydi, natija tekshiriladi | `payments.e2e-spec.ts` |
| R3 | P0 | Admin holat o'zgartirishi o'qib-keyin-yozardi: bekor qilingan buyurtma `CONFIRMED` bo'lib qolardi, parallel "yetkazildi" ikki naqd to'lov yozardi | shartli `updateMany` + 409 | `orders.e2e-spec.ts` |
| R4 | P1 | Checkout: to'lov havolasi olinmasa, tugma qayta bosilganda ikkinchi buyurtma ochilardi | buyurtma yaratilgach har doim buyurtma sahifasiga o'tiladi | Playwright |
| R5 | P1 | `web/Dockerfile` yo'q `public/` ni ko'chirardi; `.env.example` nusxasi bilan server ishga tushmasdi (bo'sh `KEY=` Joi xatosi) | `mkdir -p public`; ixtiyoriy kalitlarda bo'sh qiymat = berilmagan | `docker build`, `environment.config.spec.ts` |
| R6 | P2 | Click'da Prepare qilingan, lekin yakunlanmagan buyurtma abadiy `PENDING` (zaxira band) qolardi | bir soatdan eski Prepare kutilmaydi | `orders.e2e-spec.ts` |
| R7 | P2 | Teskari tartibdagi parallel buyurtmalar deadlock (500) berardi | zaxira qatorlari `product_id` tartibida qulflanadi | `orders.e2e-spec.ts` |
| R8 | P2 | `/login?next=/\\host` kirishdan keyin tashqi saytga yo'naltirishi mumkin edi; `create-admin.js` raqamni normallashtirmasdi (admin kira olmasdi); savat miqdori chegarasiz (500) | origin tekshiruvi; `+998…` ko'rinishi; `Max(999)` | Playwright; `auth-catalog.e2e-spec.ts` (savat); `create-admin.js` test bazada qo'lda |
| R9 | P0 | `next@16.3.6` uchun critical advisory'lar (autentifikatsiyasiz RCE, kesh zaharlash, proxy javoblarining aralashishi) | `next` va `eslint-config-next` 16.4.6; web `npm audit` = 0 | typecheck, lint, build, Playwright 4/4 |
