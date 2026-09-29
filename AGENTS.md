# INBOLA — bolalar mahsulotlari marketplace'i

NestJS 11 + Prisma 6 + PostgreSQL (`backend-main/`) va Next.js 14 App Router
(`front-main/`). Birinchi reliz qamrovi va bosqichlari: `docs/plan/MVP_ROADMAP.md`.
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
  bilan tekshiriladi; UI hech qachon yagona to'siq emas.
- **Secret'lar uchun koddagi fallback yo'q.** Env yetishmasa server ishga tushmasligi kerak.

## Buyruqlar

```bash
# backend-main/
npm ci
npm run start:dev                    # :4000, prefiks /api
npx tsc --noEmit                     # tiplar
npm run test                         # jest
npm run test:e2e
npx prisma generate
npx prisma migrate dev --name <nom>  # faqat lokal
npx prisma migrate deploy            # server

# front-main/
npm ci
npm run dev                          # :5000
npm run build
npm run type-check

# ildiz
docker compose up -d postgres redis
bash .claude/hooks/guard-bash.test.sh .claude/hooks/guard-bash.sh   # qo'riqchi sinovi
```

## Tuzoqlar

Har biri 2026-09-29 review'ida kodda topilgan (`docs/plan/MVP_ROADMAP.md` §2).

- **Ildizdagi eski hisobotlar ishonchsiz.** `docs/archive/` dagi
  "PRODUCTION READY" hisobotlari kodga zid; holat uchun `docs/QUALITY_BAR.md` ga qarang.
- **Ikkita bootstrap bor:** `npm run start:dev` → `src/main.ts`, `npm start` →
  `src/simple-main.ts` (helmet/swagger yo'q). O'zgarish ikkalasiga ta'sir qiladimi — tekshiring
  (Faza 0 da bittaga birlashtiriladi).
- **JWT env nomlari ikki xil:** tokenlar `JWT_ACCESS_SECRET` bilan imzolanadi,
  `guards/*.guard.ts` esa `ACCESS_TOKEN_KEY` bilan tekshiradi — ishlashi `@nestjs/jwt`
  default secret'iga bog'liq (Faza 1 da birlashtiriladi).
- **Auth 6+ controllerga sochilgan** (`auth/`, `user-auth/`). `auth.controller` va
  `unified-auth.controller` ikkalasi `@Controller('auth')` — route to'qnashuvini tekshiring.
- **`prisma/schema_continuation.prisma` eskirgan nusxa** — manba faqat `schema.prisma`.
- **Frontend default backend porti `:3001`** (`front-main/next.config.js`), backend `:4000` da.
  `NEXT_PUBLIC_BACKEND_URL` ni o'rnating.
- **`dev.db`, `dump.rdb`, `.env.test` repoda** — yangilarini qo'shmang (qo'riqchi to'sadi).
- **`prisma migrate reset` / `db push --force-reset` ishlatilmaydi** — qo'riqchi to'sadi.

## Agent sozlamalari

`.claude/settings.json` ikki hook ulaydi:

- `guard-bash.sh` (PreToolUse) — yuqoridagi xavfli buyruqlarni to'sadi va sababini aytadi.
  Yangi qoida qo'shsangiz `guard-bash.test.sh` ga sinov ham qo'shing.
- `session-start.sh` (SessionStart) — shox, baza, portlar, `node_modules` holati.

`.claude/agents/full-project-reviewer.md` — to'liq read-only qayta audit uchun.
