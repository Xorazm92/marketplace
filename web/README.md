# INBOLA web

Xaridor do'koni va admin panel. Next.js 16 (App Router), React 19, Tailwind CSS 4.
Backend: `../backend-main` (NestJS, `/api/v1`).

```bash
npm ci
API_URL=http://localhost:4000 npm run dev     # :3000
npm run build && API_URL=http://localhost:4000 npx next start -p 5000
npm run typecheck && npm run lint
npm run test:e2e    # Playwright: backend + web'ni o'zi ko'taradi (backend oldin build qilingan bo'lsin)
PW_CHANNEL=chrome npm run test:e2e   # Playwright brauzerini yuklab bo'lmasa, tizim Chrome'i bilan
```

- `API_URL` — backend manzili, **ishga tushish paytida** o'qiladi (`lib/proxy.ts`).
  Brauzer `/api/*` va `/uploads/*` ga murojaat qiladi; prodda ularni nginx to'g'ridan-to'g'ri
  backend'ga yuboradi, Next proxy — dev va nginx'siz holat uchun.
- Sahifalar: `/`, `/catalog`, `/p/[slug]`, `/login`, `/cart`, `/checkout`, `/orders`, `/orders/[id]`, `/profile`;
  admin: `/admin/*` (alohida sessiya, `inbola.admin`).
- `E2E_DATABASE_URL` nomi `_test` bilan tugashi shart — Playwright uni har safar tozalaydi.
