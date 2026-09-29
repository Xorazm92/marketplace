# INBOLA — bolalar mahsulotlari do'koni

Ota-onalar bola yoshiga mos o'yinchoq, kitob va buyumlarni topib, Payme, Click yoki
yetkazganda naqd to'lov bilan buyurtma beradigan onlayn do'kon. Admin panelda mahsulot,
zaxira va buyurtmalar boshqariladi.

| Papka | Nima |
|---|---|
| `backend-main/` | API: NestJS 11, Prisma 6, PostgreSQL. `/api/v1/...` |
| `web/` | Do'kon va admin panel: Next.js 16, React 19, Tailwind 4 |
| `deploy/`, `scripts/`, `docker-compose.prod.yml` | VPS deploy, zaxira, tiklash |
| `docs/` | Reja, sifat chegarasi, deploy, ICEBOX |
| `front-main/` | Eski frontend — ishlatilmaydi (`docs/ICEBOX.md`) |

## Lokal ishga tushirish

Talab: Node 22+, PostgreSQL 16.

```bash
# Backend
cd backend-main
cp .env.example .env            # DATABASE_URL va secret'larni to'ldiring
npm ci
npx prisma migrate deploy
SEED_DEMO=true npm run seed     # hududlar, bo'limlar, demo mahsulotlar
ADMIN_PHONE=+998901234567 ADMIN_PASSWORD='kamida-12-belgi' node create-admin.js
npm run start:dev               # http://localhost:4000, Swagger: /api/docs

# Web (boshqa terminalda)
cd web
npm ci
API_URL=http://localhost:4000 npm run dev    # http://localhost:3000, admin: /admin
```

Dev rejimda SMS yuborilmaydi — kirish kodi backend log'ida `[DEV SMS]` qatorida chiqadi.

## Testlar

```bash
cd backend-main && npm test                                              # unit
cd backend-main && TEST_DATABASE_URL=postgresql://.../nomi_test npm run test:e2e   # haqiqiy Postgres
cd web && npm run build && npx playwright test                          # brauzerda to'liq oqim
```

E2E testlar bazani tozalaydi, shuning uchun faqat nomi `_test` bilan tugaydigan bazada ishlaydi.
CI: `.github/workflows/ci.yml`.

## Hujjatlar

- `docs/plan/MVP_ROADMAP.md` — review va bosqichlar
- `docs/QUALITY_BAR.md` — o'lchanadigan tayyorlik holati
- `docs/DEPLOYMENT.md` — prod deploy, to'lov kabinetlari, zaxira, rollback
- `docs/ICEBOX.md` — ulanmagan kod va sabablari
- `AGENTS.md` — kod yozish qoidalari va tuzoqlar
