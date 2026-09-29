# Olib tashlangan kod

2026-09-29 da MVP'ga kirmaydigan va o'rniga yangisi yozilgan barcha eski kod
repozitoriydan olib tashlandi. U git tarixida qoladi: oxirgi to'liq holat —
commit `70cc221` (`git show 70cc221:<yo'l>` yoki `git checkout 70cc221 -- <yo'l>`).

| Olib tashlangan | O'rniga | Sabab |
|---|---|---|
| `front-main/` (Next 14) | `web/` (Next 16) | Critical CVE, 505 tip xatosi, eski API, karta ma'lumotini yig'uvchi komponent |
| `backend-main/src/auth`, `user-auth`, `otp`, `admin` | `identity/`, `backoffice/` | 6 parallel auth; ochiq admin ro'yxati; OTP prodda boshqa kod yuborardi |
| `payment`, `payment_method` | `payments/` | Soxta karta to'lovi, ochiq verify, Click summasi noto'g'ri |
| `product`, `inventory` | `catalog/` | Telefon-bozor shablonidan qolgan filtrlar |
| `address`, `user`, `phone_number`, `email` | `account/`, `/auth/me` | IDOR (DTO'dagi `user_id`, ochiq `GET /:id`) |
| `uploads` controller | `app.setup.ts` statik | `..%2F` path traversal (ulanmagan edi) |
| GraphQL (resolver'lar, `schema.gql`) | REST | Dublikat |
| `chat`, `notification`, `mail`, `child-safety`, `seller`, `telegram`, `microservices`, `color(s)`, `model`, `currency` controller | — | MVP qamrovidan tashqari |
| `generated/prisma`, `dev.db`, `dump.rdb`, `.env.test`, eski skriptlar | `node_modules/@prisma/client`, `test/mvp` | Generatsiya/ikkilik fayllar repoda turmaydi |
| `setup.ps1`, `.replit`, eski `docker-compose.yml`, soxta hisobotlar | `docker-compose.yml` (faqat Postgres), `docs/` | Eski tuzilmaga qaratilgan, standart parollar |

## Bazadagi eski jadvallar

32 ta ishlatilmaydigan jadval (chat, sotuvchi, ota-ona nazorati, kupon, tavsiyalar,
eski auth/OTP/to'lov) migratsiya `20260929220000_drop_unused_legacy_tables` bilan
olib tashlandi — egasi tasdiqlagan, prod baza hali yo'q edi.

## Qaytarish shartlari

| Funksiya | Nima kerak |
|---|---|
| Uzum to'lovi | Rasmiy merchant API hujjati va sandbox kalitlari → `payments/uzum.service.ts` + e2e |
| Google/Telegram kirish | `identity/` ga yangi strategiya (eski `auth/` qaytarilmaydi) |
| Email bildirishnoma | Mailer'siz nodemailer (eski mailer zanjirida critical zaifliklar) |
