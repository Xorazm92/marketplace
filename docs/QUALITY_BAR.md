# Sifat chegarasi — MVP

> "Production ready" — ta'rifsiz so'z. Bu yerda u o'lchanadigan qilib yozilgan.
> Har faza oxirida shu jadval yangilanadi. Reja: `docs/plan/MVP_ROADMAP.md`.

**Holat belgilari:** ✅ bajarilgan · ⚠️ qisman · ❌ yo'q · ❔ o'lchanmagan

Bazaviy holat — 2026-09-29 review.

## 1. Xavfsizlik

| # | Chegara | Holat | Faza |
|---|---|---|---|
| S1 | To'lov holatini faqat imzolangan callback o'zgartiradi (C1) | ❌ `payment/*/verify` guardsiz | 0 |
| S2 | Payme callback Basic-auth tekshiradi (C2) | ❌ `ACCESS_DENIED` e'lon qilingan, ishlatilmagan | 0 |
| S3 | Narx/chegirma/yetkazish serverda hisoblanadi (C3) | ❌ `unit_price` DTO'da | 0 |
| S4 | Har yozuv endpoint'ida guard (C4) | ❌ `category`, `color` ochiq | 0 |
| S5 | Secret'lar uchun fallback yo'q, env Joi bilan tekshiriladi (C5) | ❌ `'your-access-secret'` | 0 |
| S6 | Bitta auth modul, bitta JWT env nomi (H1) | ❌ 6+ controller, 2 env nomi | 1 |
| S7 | IDOR: egalik servisda tekshiriladi (H2) | ❌ | 1 |
| S8 | Prodda rate limit; OTP yuborish cheklangan (H7) | ❌ 1000/daq, OTP cheklanmagan | 1 |
| S9 | `npm audit --omit=dev` = 0 high/critical | ❔ | 0 |

## 2. Ma'lumot yaxlitligi

| # | Chegara | Holat | Faza |
|---|---|---|---|
| D1 | `OrderItem.unit_price` = `Product.price` (test bilan) | ❌ | 0 |
| D2 | Parallel buyurtmada manfiy zaxira yo'q | ❌ zaxira tekshirilmaydi | 0 |
| D3 | Takroriy callback holatni ikki marta o'zgartirmaydi | ❔ | 1 |
| D4 | Sxema = migratsiyalar (drift yo'q), bitta sxema fayli | ❌ 50 model / 2 migratsiya, `schema_continuation.prisma` | 1 |

## 3. Funksionallik

| # | Chegara | Holat | Faza |
|---|---|---|---|
| F1 | Login (telefon+OTP) → savat → checkout → to'lov → buyurtmalarim | ❌ login/checkout/orders sahifalari yo'q yoki o'chirilgan | 2 |
| F2 | Payme, Click, Uzum sandbox'da uchidan-uchiga | ❌ | 4 |
| F3 | Naqd (yetkazganda) to'lov | ❌ | 1-2 |
| F4 | Admin: mahsulot, buyurtma holati, kategoriya/brend | ⚠️ sahifalar bor, backend bilan tekshirilmagan | 2 |

## 4. Build va test

| # | Chegara | Holat | Faza |
|---|---|---|---|
| T1 | Backend `tsc --noEmit` toza | ❔ node_modules yo'q | 0 |
| T2 | Frontend `npm run build` o'tadi | ❌ `next-auth` package.json da yo'q | 2 |
| T3 | Har Critical tuzatishga regressiya testi | ❌ | 0 |
| T4 | Playwright happy-path | ❌ | 3 |
| T5 | CI har PR'da (tsc + test + build) | ❌ `.github/` yo'q | 3 |

## 5. Deploy va kuzatuv

| # | Chegara | Holat | Faza |
|---|---|---|---|
| O1 | Bitta bootstrap, prodda helmet (H6) | ❌ `start:prod` → `simple-main` | 0 |
| O2 | `docker-compose.prod.yml` + nginx + HTTPS | ❌ | 4 |
| O3 | `deploy.sh` (backup → migrate deploy → build → preflight → reload) | ❌ | 4 |
| O4 | Backup (DB + uploads), tiklash bir marta sinovdan o'tgan | ❌ | 4 |
| O5 | Sentry + `/health` DB/Redis ni tekshiradi | ❌ | 4 |

## 6. Agent infratuzilmasi

| # | Chegara | Holat | Faza |
|---|---|---|---|
| A1 | `AGENTS.md`, `CLAUDE.md` | ✅ | −1 |
| A2 | `guard-bash.sh` + sinov (16/16) | ✅ | −1 |
| A3 | `session-start.sh` | ✅ | −1 |
| A4 | Ishonchsiz hisobotlar arxivda | ✅ `docs/archive/` | −1 |
