# Sifat chegarasi — MVP

> "Production ready" — ta'rifsiz so'z. Bu yerda u o'lchanadigan qilib yozilgan.
> Har faza oxirida shu jadval yangilanadi. Reja: `docs/plan/MVP_ROADMAP.md`.

**Holat belgilari:** ✅ bajarilgan · ⚠️ qisman · ❌ yo'q · ❔ o'lchanmagan

Bazaviy holat — 2026-09-29 review. Oxirgi yangilanish — 2026-11-27 (qayta audit + prod
tayyorgarligi). Quyidagi "✅" lar o'sha kuni lokal mashinada `scripts/verify-all.sh` va konteyner
stekida ishga tushirilgan tekshiruvlar bilan tasdiqlangan: backend unit 37, e2e 71 (3 marta
ketma-ket), Playwright 12, drift 0. Topilib yopilgan nuqsonlar — §9. Tekshirilmaganlar — §8.

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
| S12 | Brauzer xavfsizlik sarlavhalari | ✅ web: CSP (`default-src 'self'`, `frame-ancestors 'none'`…), `X-Frame-Options`, `Permissions-Policy`; nginx: HSTS (bitta sarlavha); API: helmet. Playwright: 6 sahifada CSP buzilishi 0. Cookie ishlatilmaydi (token `localStorage`da — M5, CSP bilan cheklangan) | 8 |
| S13 | Loglarda shaxsiy va maxfiy ma'lumot yo'q | ✅ so'rov satri, token, parol, OTP kodi, to'lov kaliti, to'liq telefon logga tushmaydi — `readiness.e2e-spec.ts`, `global-exception.filter.spec.ts`, `sms.service.spec.ts` | 8 |
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
| D8 | Asosiy so'rovlar indeksdan foydalanadi | ✅ 100 ming buyurtma / 20 ming mahsulotli sintetik bazada `EXPLAIN ANALYZE`: buyurtma qatorlari 68 → 0,9 ms, katalog ro'yxati 18 → 0,1 ms, sharh huquqi 24 → 0,3 ms. Matnli qidiruv (`ILIKE`) hamon to'liq skan (44 ms) — katalog o'sganda trigram indeks kerak | 8 |
| D9 | Migratsiyalar toza bazadan o'tadi | ✅ bo'sh bazaga `migrate deploy` (6 ta), drift 0; konteyner ichida ham | 8 |
| D7 | Admin zaxira tahriri parallel buyurtmani yo'qotmaydi | ✅ shartli yozuv (`expected_quantity`), 409; e2e poyga 5 marta | 7 |
| D6 | Admin holat o'zgartirishi poygada buzilmaydi | ✅ e2e: 3 parallel "yetkazildi" → 1 ta naqd to'lov; tasdiqlash ↔ xaridor bekor qilishi; teskari tartibli buyurtmalar deadlock'siz | 6 |
| D4 | Sxema = migratsiyalar (drift yo'q), bitta sxema fayli | ✅ oldinga migratsiya (DROP'siz), `migrate diff --exit-code` = 0 | 1 |

## 3. Funksionallik

| # | Chegara | Holat | Faza |
|---|---|---|---|
| F1 | Login (telefon+OTP) → savat → checkout → to'lov → buyurtmalarim | ✅ Playwright brauzerda (naqd); onlayn to'lov — provayder manziliga yo'naltirishgacha (summa serverdan), haqiqiy to'lov — F2 | 2 |
| F2 | Payme, Click sandbox'da uchidan-uchiga | ⚠️ protokolning biz tomondagi yarmi to'liq qamralgan: e2e (imzo/auth, summa, idempotentlik, takroriy va kechikkan callback, bekor qilish poygalari) + Playwright'da brauzer oqimi (checkout → provayder → callback → holat o'zi yangilanadi; to'lov boshlanib bekor qilingan buyurtma). Provayder o'rnida test — **haqiqiy sandbox sinalmagan**. Uzum — ICEBOX | 4-8 |
| F3 | Naqd (yetkazganda) to'lov | ✅ backend: "yetkazildi" = to'landi (e2e) | 1-2 |
| F5 | Sharhlar: faqat yetkazilgan xarid, bittadan, egasi tahrirlaydi | ✅ backend e2e + Playwright | 5 |
| F4 | Admin: mahsulot, buyurtma holati, bo'limlar, xaridorlar, adminlar | ✅ `web/app/admin`; buyurtma o'tishlari Playwright'da, mahsulot/rasm/zaxira backend e2e'da | 2 |

## 4. Build va test

| # | Chegara | Holat | Faza |
|---|---|---|---|
| T1 | Backend build va `tsc` toza | ✅ istisnosiz — eski kod olib tashlangan | 0-5 |
| T2 | Frontend build, tip, lint | ✅ `web/`: tsc 0, eslint 0, build o'tadi | 2 |
| T3 | Har Critical tuzatishga regressiya testi | ✅ unit 37 (bazasiz) + e2e 71 (haqiqiy Postgres, 3 marta ketma-ket barqaror); har yangi test tuzatishdan oldingi kodda yiqilishi tekshirilgan | 0-8 |
| T4 | Playwright: kritik oqimlar | ✅ 12/12: naqd buyurtma → admin → sharh; onlayn to'lov (to'lov tasdig'i, bekor qilish, havola xatosi); admin formasi va zaxira; moderator; CSP/sarlavhalar; robots/404; proxy IP; SSR chegarasi; 375px | 3-8 |
| T6 | Lint | ✅ backend (ESLint 9 flat) va web — 0 xato; CI'da | 5 |
| T5 | CI har PR'da | ❌ GitHub'da **hech bir job ishga tushmagan**: hisob billing sababli bloklangan. O'rniga `scripts/verify-all.sh --docker` (CI qadamlari bilan bir xil) — lokal toza. `ci.yml` YAML sifatida yaroqli, GitHub'da sinalmagan | 3-9 |

## 5. Deploy va kuzatuv

| # | Chegara | Holat | Faza |
|---|---|---|---|
| O1 | Bitta bootstrap, prodda helmet (H6) | ✅ `start`/`start:prod` → `dist/main`; `CORS_ORIGIN` env'dan | 0 |
| O2 | Konteyner steki + nginx + HTTPS | ⚠️ stek lokalda `docker run` bilan ko'tarildi (postgres, backend, web, nginx; o'z-o'zidan imzolangan TLS): `nginx -t`, marshrutlar, sarlavhalar, chegaralar, konteyner IP'si o'zgarganda o'zi tiklanish, baza uzilib-tiklanishi. **`docker compose` buyrug'i va `docker-compose.prod.yml` ning o'zi sinalmagan** (mashinada plagin yo'q). Image: backend 804 MB, web 425 MB, ikkalasi non-root | 4-8 |
| O3 | `deploy.sh` (backup → build → migrate deploy → up → health) | ⚠️ `bash -n` toza, qadamlari alohida bajarilgan; skriptning o'zi (compose bilan) VPS'da ishga tushirilmagan | 4 |
| O4 | Zaxira (baza + rasmlar) va tiklash | ⚠️ `backup.sh`/`restore.sh` ichidagi buyruqlar bilan lokal stekda zaxira → buzish → tiklash aylanasi o'tdi (baza va rasm fayllari aynan qaytdi). Skriptlarning o'zi va staging'dagi sinov — yo'q | 4-8 |
| O5 | Kuzatuv | ⚠️ `/health`, `/ready` (baza), `/health/live`; prodda JSON log, hodisalar (`order_paid`, `payme`, `click`, `admin_login`, `otp_limit`…); SIGTERM'da toza to'xtash (205 ms). Xato kuzatuvi (Sentry) ulanmagan — ulanish nuqtasi bor (`common/error-reporter.ts`) | 4-8 |
| O6 | Yuk ostida xatti-harakat | ⚠️ qisqa sinov (20 parallel, 20 ming mahsulot): mahsulot 454 so'rov/s (p95 62 ms), ro'yxat 262/s (p95 110 ms), qidiruv 71/s (p95 371 ms). Topilib tuzatildi: SSR'ning umumiy IP chegarasi (§9 R15), `GET /category` (R16). Uzoq muddatli yoki haqiqiy tarmoqdagi sinov o'tkazilmagan | 8 |

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
8. Moderator huquqlari (`docs/PERMISSIONS.md`), OTP byudjeti va nginx chegaralari raqamlarini tasdiqlash.
9. Serverga `docker compose` plagini bilan `docker-compose.prod.yml`, `deploy.sh`, `backup.sh`,
   `restore.sh` ni staging'da ishga tushirish — lokalda faqat ichidagi buyruqlar sinalgan.
10. Xato kuzatuvi (Sentry yoki boshqa) SDK'sini qo'shish qarori.

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
| R10 | P2 | OTP faqat IP+raqam bo'yicha cheklangan (SMS balansini yoqish) | IP'dan turli raqamlar chegarasi + umumiy byudjet + `otp_limit` logi | `hardening.e2e-spec.ts` |
| R11 | P3 | Bloklangan xaridor tokeni 15 daqiqa ishlardi; MODERATOR = ADMIN | `UserGuard` holatni tekshiradi; `@AllowModerator()` | `hardening.e2e-spec.ts` (31 endpoint × 3 rol) |
| R12 | P3 | Next proxy mijozning `X-Forwarded-For` iga ishonardi (8 urinish, 0 ta 429) | `TRUST_PROXY_HEADERS` | Playwright |
| R13 | P3 | Admin zaxirasi parallel buyurtmani bosib ketardi; `GET /category/abc` → 500; maydonni bo'shatib bo'lmasdi; rasm fayli diskda qolardi | shartli yozuv (409); `ParseIntPipe`; `null`; `unlink` | e2e + Playwright |
| R14 | P1 | Deploy'da backend konteyneri yangi IP olsa nginx 502 qaytarardi (qayta yuklanmaguncha) | `resolver` + o'zgaruvchi orqali `proxy_pass` | lokal stek: eski konfiguratsiya 502, yangisi 4 s da 200 |
| R15 | P1 | Web server SSR so'rovlari backend'da bitta IP chegarasiga (300/daq) tushardi: undan keyin mahsulot sahifalari hammaga 500 (1917 so'rovdan 1617 tasi) | ochiq katalog `@SkipThrottle()`, chegara nginx'da (`limit_req`) | Playwright (4 endpoint × 320 so'rov), lokal stek |
| R16 | P2 | `GET /category` har so'rovda butun katalogni yuklardi (20 ming mahsulotda p50 ≈ 1,9 s) | ro'yxat mahsulotlarsiz; tafsilot 24 ta bilan cheklangan | `readiness.e2e-spec.ts` |
| R17 | P2 | SMS ketmasa ham kod yozuvi qolardi: xaridor 1 daqiqa kutardi, yetib borgan eski kodi bekor bo'lardi | yozuv o'chiriladi; eski kod SMS ketgandan keyingina bekor bo'ladi | `readiness.e2e-spec.ts` |
| R18 | P2 | Loglarda so'rov satri (qidiruvdagi telefon) va SMS xatosida to'liq raqam; FK ustunlarida indeks yo'q | yo'l so'rov satrisiz, `maskPhone`; 8 ta indeks | unit; `EXPLAIN ANALYZE` |

