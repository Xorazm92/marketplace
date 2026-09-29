# Sifat chegarasi — MVP

> "Production ready" — ta'rifsiz so'z. Bu yerda u o'lchanadigan qilib yozilgan.
> Har faza oxirida shu jadval yangilanadi. Reja: `docs/plan/MVP_ROADMAP.md`.

**Holat belgilari:** ✅ bajarilgan · ⚠️ qisman · ❌ yo'q · ❔ o'lchanmagan

Bazaviy holat — 2026-09-29 review.

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
| S9 | `npm audit --omit=dev` = 0 high/critical | ❌ backend 66 high + 2 critical (handlebars, liquidjs — mailer zanjiri); frontend 13 high + 1 critical (`next` 14 → 16 kerak). Alohida `deps/security-upgrade` PR | 0→1 |

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
| F1 | Login (telefon+OTP) → savat → checkout → to'lov → buyurtmalarim | ❌ login/checkout/orders sahifalari yo'q yoki o'chirilgan | 2 |
| F2 | Payme, Click sandbox'da uchidan-uchiga | ⚠️ protokol e2e'da (imzo, summa, idempotentlik, taym-aut); haqiqiy sandbox kalitlari kerak. Uzum — ICEBOX | 4 |
| F3 | Naqd (yetkazganda) to'lov | ✅ backend: "yetkazildi" = to'landi (e2e) | 1-2 |
| F4 | Admin: mahsulot, buyurtma holati, kategoriya/brend | ⚠️ sahifalar bor, backend bilan tekshirilmagan | 2 |

## 4. Build va test

| # | Chegara | Holat | Faza |
|---|---|---|---|
| T1 | Backend build va `tsc -p tsconfig.build.json` toza | ✅ (test fayllaridagi 300 xato — Faza 3) | 0 |
| T2 | Frontend `npm run build` o'tadi | ❌ `tsc` 505 xato; `next-auth` e'lon qilinmagan | 2 |
| T3 | Har Critical tuzatishga regressiya testi | ✅ unit 24 (bazasiz) + e2e 33 (haqiqiy Postgres) | 0-1 |
| T4 | Playwright happy-path | ❌ | 3 |
| T5 | CI har PR'da (tsc + test + build) | ❌ `.github/` yo'q | 3 |

## 5. Deploy va kuzatuv

| # | Chegara | Holat | Faza |
|---|---|---|---|
| O1 | Bitta bootstrap, prodda helmet (H6) | ✅ `start`/`start:prod` → `dist/main`; `CORS_ORIGIN` env'dan | 0 |
| O2 | `docker-compose.prod.yml` + nginx + HTTPS | ❌ | 4 |
| O3 | `deploy.sh` (backup → migrate deploy → build → preflight → reload) | ❌ | 4 |
| O4 | Backup (DB + uploads), tiklash bir marta sinovdan o'tgan | ❌ | 4 |
| O5 | Sentry + `/health` bazani tekshiradi | ⚠️ `/health` haqiqiy `SELECT 1` (503 agar yo'q); Sentry yo'q | 4 |

## 6. Agent infratuzilmasi

| # | Chegara | Holat | Faza |
|---|---|---|---|
| A1 | `AGENTS.md`, `CLAUDE.md` | ✅ | −1 |
| A2 | `guard-bash.sh` + sinov (16/16) | ✅ | −1 |
| A3 | `session-start.sh` | ✅ | −1 |
| A4 | Ishonchsiz hisobotlar arxivda | ✅ `docs/archive/` | −1 |
