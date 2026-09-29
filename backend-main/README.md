# INBOLA API

NestJS 11, Prisma 6, PostgreSQL. Barcha endpoint'lar `/api/v1/...`, Swagger — `/api/docs` (dev).

| Modul | Vazifa |
|---|---|
| `identity/` | Xaridor: telefon + SMS kod; admin: telefon + parol; JWT (access 15 daq, refresh rotatsiya) |
| `catalog/` | Ochiq katalog va admin CRUD, rasm, zaxira |
| `order/` | Buyurtma (narx serverda), holat o'tishlari, to'lanmaganlarni avtomatik bekor qilish |
| `payments/` | Payme Merchant API, Click SHOP API, naqd |
| `account/`, `cart/`, `wishlist/`, `review/` | Manzillar, savat, sevimlilar, sharhlar (faqat xarid qilganlar) |
| `backoffice/` | Admin: umumiy holat, xaridorlar |
| `category/`, `brand/`, `region/`, `district/`, `health/` | Ma'lumotnomalar, `/health` |

```bash
cp .env.example .env              # har bir kalit izohi shu faylda
npm ci && npx prisma migrate deploy
SEED_DEMO=true npm run seed
ADMIN_PHONE=+998... ADMIN_PASSWORD='kamida-12-belgi' node create-admin.js
npm run start:dev

npm run lint && npm test
TEST_DATABASE_URL=postgresql://.../nomi_test npm run test:e2e
```

Qoidalar va tuzoqlar: `../AGENTS.md`.
