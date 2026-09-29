# Sifat chegarasi — MVP

> "Production ready" — ta'rifsiz so'z. Bu yerda u o'lchanadigan qilib yozilgan.
> Har faza oxirida shu jadval yangilanadi. Reja: `docs/plan/MVP_ROADMAP.md`.

**Holat belgilari:** ✅ bajarilgan · ⚠️ qisman · ❌ yo'q · ❔ o'lchanmagan

Bazaviy holat — 2026-09-29 review. Oxirgi yangilanish — Faza 0…4 dan keyin (o'sha kun).

## 1. Xavfsizlik

| # | Chegara | Holat | Faza |
|---|---|---|---|
| S1 | To'lov holatini faqat imzolangan callback o'zgartiradi (C1, C6) | ✅ verify/webhooks dublikatlari va CARD mock olib tashlandi; `route-guards.spec.ts` | 0 |
| S2 | Payme callback Basic-auth tekshiradi (C2) | ✅ `timingSafeEqual`, fail-closed; `payment-security.spec.ts` | 0 |
| S3 | Narx/chegirma/yetkazish serverda hisoblanadi (C3, C8) | ✅ buyurtma va to'lov summasi bazadan; `order-pricing.spec.ts` | 0 |
| S4 | Katalog/admin yozuv endpoint'larida guard (C4, C7, C10) | ✅ statik skan: qolgan ochiq POST'lar — auth, callback va H2 nomzodlari | 0 |
| S5 | Secret'lar uchun fallback yo'q, env Joi bilan tekshiriladi (C5, C9) | ✅ secret'siz server ishga tushmaydi (qo'lda tekshirildi); prodda to'lov secret'lari majburiy | 0 |
| S6 | Bitta auth modul, bitta JWT env nomi (H1) | ✅ `identity/`: user OTP + admin parol; `kind` bo'yicha ajratilgan tokenlar; refresh rotatsiyasi (sha256) | 1 |
| S7 | IDOR: egalik servisda tekshiriladi (H2) | ✅ buyurtma, manzil, checkout — e2e `orders.e2e-spec.ts` | 1 |
| S8 | Prodda rate limit; OTP yuborish cheklangan (H7) | ⚠️ global 300/daq, auth 5/daq (IP); OTP: 60 s, 10/kun, 5 urinish. Xotirada — bitta jarayon uchun | 1 |
| S9 | `npm audit --omit=dev` = 0 high/critical | ⚠️ backend: **100 → 3** (0 critical), qolgani — S9a. Web: **0** (Next 16.3.6). CI critical'da yiqiladi | 0.5-2 |
| S9a | `deepmerge-ts <8` (`prisma` → `@prisma/config` 7.1.5 da qotirilgan) | ⚠️ **qabul qilingan**: faqat Prisma CLI konfiguratsiyasini birlashtirishda, runtime'da foydalanuvchi ma'lumoti yetmaydi. Tuzatish — Prisma 7 (major) | keyin |

## 2. Ma'lumot yaxlitligi

| # | Chegara | Holat | Faza |
|---|---|---|---|
| D1 | `OrderItem.unit_price` = `Product.price` (test bilan) | ✅ unit test (mock Prisma) | 0 |
| D2 | Parallel buyurtmada manfiy zaxira yo'q | ✅ haqiqiy Postgres: 3 parallel buyurtma, 1 dona → 1 ta o'tadi | 0-1 |
| D3 | Takroriy callback holatni ikki marta o'zgartirmaydi | ✅ Payme/Click e2e (takroriy Create/Perform/Cancel/Complete) | 1 |
| D4 | Sxema = migratsiyalar (drift yo'q), bitta sxema fayli | ✅ oldinga migratsiya (DROP'siz), `migrate diff --exit-code` = 0 | 1 |

## 3. Funksionallik

| # | Chegara | Holat | Faza |
|---|---|---|---|
| F1 | Login (telefon+OTP) → savat → checkout → to'lov → buyurtmalarim | ✅ Playwright brauzerda (naqd); onlayn to'lov — checkout URL'gacha | 2 |
| F2 | Payme, Click sandbox'da uchidan-uchiga | ⚠️ protokol e2e'da (imzo, summa, idempotentlik, taym-aut); haqiqiy sandbox kalitlari kerak. Uzum — ICEBOX | 4 |
| F3 | Naqd (yetkazganda) to'lov | ✅ backend: "yetkazildi" = to'landi (e2e) | 1-2 |
| F5 | Sharhlar: faqat yetkazilgan xarid, bittadan, egasi tahrirlaydi | ✅ backend e2e + Playwright | 5 |
| F4 | Admin: mahsulot, buyurtma holati, bo'limlar, xaridorlar, adminlar | ✅ `web/app/admin`; buyurtma o'tishlari Playwright'da, mahsulot/rasm/zaxira backend e2e'da | 2 |

## 4. Build va test

| # | Chegara | Holat | Faza |
|---|---|---|---|
| T1 | Backend build va `tsc` toza | ✅ istisnosiz — eski kod olib tashlangan | 0-5 |
| T2 | Frontend build, tip, lint | ✅ `web/`: tsc 0, eslint 0, build o'tadi | 2 |
| T3 | Har Critical tuzatishga regressiya testi | ✅ unit 24 (bazasiz) + e2e 37 (haqiqiy Postgres) | 0-5 |
| T4 | Playwright happy-path | ✅ 3/3: xaridor → naqd buyurtma → admin "yetkazildi" → sharh; mehmon yo'naltirilishi; 375px'da 9 sahifa gorizontal scroll'siz | 3-5 |
| T6 | Lint | ✅ backend (ESLint 9 flat) va web — 0 xato; CI'da | 5 |
| T5 | CI har PR'da (tsc + test + build) | ⚠️ `.github/workflows/ci.yml` yozildi (backend, web, brauzer e2e, hook, audit, drift); GitHub'da hali ishga tushmagan | 3 |

## 5. Deploy va kuzatuv

| # | Chegara | Holat | Faza |
|---|---|---|---|
| O1 | Bitta bootstrap, prodda helmet (H6) | ✅ `start`/`start:prod` → `dist/main`; `CORS_ORIGIN` env'dan | 0 |
| O2 | `docker-compose.prod.yml` + nginx + HTTPS | ⚠️ yozildi; image ichidagi qadamlar alohida sinalgan, `docker build` — yo'q (mashinada Docker yo'q) | 4 |
| O3 | `deploy.sh` (backup → build → migrate deploy → up → health) | ⚠️ yozildi, `bash -n` toza; VPS'da ishga tushirilmagan | 4 |
| O4 | Backup (DB + uploads), tiklash bir marta sinovdan o'tgan | ⚠️ `backup.sh`/`restore.sh` yozildi; tiklash sinovi staging'da qilinishi kerak | 4 |
| O5 | Xato kuzatuvi + `/health` bazani tekshiradi | ⚠️ `/health` haqiqiy `SELECT 1` (503), Docker healthcheck, log aylanishi; Sentry yo'q | 4 |

## 6. Kod tozaligi

| # | Chegara | Holat | Faza |
|---|---|---|---|
| C1 | Repoda ishlatilmaydigan kod yo'q | ✅ 1 000+ fayl olib tashlandi (`front-main`, eski backend modullari, generatsiya qilingan Prisma, ikkilik fayllar) — `docs/ICEBOX.md` | 5 |
| C2 | Bitta faol shox | ⚠️ mahalliy — ha; remote'dagi 5 eski shox egasi tasdig'ini kutmoqda | 5 |

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
6. Bazadagi eski jadvallarni (`schema.prisma` dagi ishlatilmaydigan modellar) olib tashlash qarori — `DROP TABLE`.
