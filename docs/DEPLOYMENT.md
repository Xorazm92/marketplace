# Deploy — VPS + Docker Compose

Bitta VPS'da: `postgres` + `backend` (NestJS) + `web` (Next.js) + `nginx` (TLS).
Fayllar: `docker-compose.prod.yml`, `deploy/nginx/default.conf.template`,
`scripts/deploy.sh`, `scripts/backup.sh`, `scripts/restore.sh`.

> **Tekshirilganlik holati (2026-11-27).** Lokal mashinada, `docker run` bilan (compose plagini
> u yerda yo'q edi) shu fayldagi stek takrorlandi: postgres + backend + web + nginx, o'z-o'zidan
> imzolangan sertifikat bilan.
>
> **Tekshirildi:** ikkala image build; toza bazaga `prisma migrate deploy`; `seed:prod`,
> `create-admin.js`; `nginx -t`; HTTPS orqali sahifalar, API, rasm yuklash/o'chirish (volume);
> http→https; xavfsizlik sarlavhalari; nginx so'rov chegaralari; backend konteyneri yangi IP bilan
> qayta yaratilganda nginx o'zi tiklanishi; baza to'xtab-yonganda backend qayta ishga
> tushirilmasdan tiklanishi; `backup.sh`/`restore.sh` ichidagi buyruqlar bilan zaxira → buzish →
> tiklash aylanasi (baza + rasmlar).
>
> **Tekshirilmadi:** `docker compose` buyrug'ining o'zi va shu sababli `docker-compose.prod.yml`,
> `deploy.sh`, `backup.sh`, `restore.sh` skriptlari (faqat ichidagi buyruqlar va `bash -n`);
> haqiqiy domen, Let's Encrypt, certbot yangilanishi; Payme/Click sandbox; haqiqiy SMS.
> Birinchi deploy staging'da qilinsin — `docs/RELEASE_CHECKLIST.md`.

## 1. Server tayyorlash (bir marta)

Talablar: Ubuntu 22.04/24.04, 2 GB RAM, 20 GB disk, domen A-yozuvi server IP'siga.

```bash
# Docker va compose plugin
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # qayta kiring

# Kod
sudo mkdir -p /opt/inbola && sudo chown $USER /opt/inbola
git clone <repo> /opt/inbola && cd /opt/inbola

# Maxfiy sozlamalar
cp .env.prod.example .env.prod && chmod 600 .env.prod
# .env.prod ni to'ldiring: har secret uchun `openssl rand -hex 32`
```

TLS sertifikat — nginx ishga tushishidan **oldin** (80-port bo'sh bo'lishi kerak):

```bash
sudo apt install -y certbot
sudo certbot certonly --standalone -d inbola.uz
sudo mkdir -p /var/www/certbot
# Avtomatik yangilash (nginx ishlab turganda webroot orqali):
echo '0 4 * * * certbot renew --webroot -w /var/www/certbot --quiet && docker compose -f /opt/inbola/docker-compose.prod.yml exec nginx nginx -s reload' | sudo crontab -
```

## 2. Birinchi deploy

```bash
cd /opt/inbola
bash scripts/deploy.sh                    # build → migratsiya → ishga tushirish → /health
C="docker compose -f docker-compose.prod.yml --env-file .env.prod"
$C run --rm backend npm run seed:prod     # hududlar, bo'limlar, UZS (idempotent)
$C run --rm -e ADMIN_PHONE=+998... -e ADMIN_PASSWORD='<12+ belgi>' backend node create-admin.js
```

Keyin `https://<domen>/admin` ga kiring va mahsulotlarni qo'shing.

## 3. To'lov provayderlari

Kabinetlarda ko'rsatiladigan manzillar:

| Provayder | Sozlama | Qiymat |
|---|---|---|
| Payme | Endpoint URL | `https://<domen>/api/v1/payments/payme` |
| Payme | Hisob maydoni | `order_id` |
| Click | Prepare URL | `https://<domen>/api/v1/payments/click/prepare` |
| Click | Complete URL | `https://<domen>/api/v1/payments/click/complete` |

- **Payme sandbox:** `PAYME_CHECKOUT_URL=https://checkout.test.paycom.uz` va test kaliti bilan
  merchant.test.paycom.uz dagi barcha testlarni o'tkazing; keyin prod kalit va URL.
- **Click:** test rejimini Click menejeri yoqadi; summa so'mda keladi.
- **Uzum:** ulanmagan (`docs/ICEBOX.md`).
- `.env.prod` da provayder id'si bo'sh bo'lsa, u checkout'da ko'rinmaydi. Naqd to'lov —
  `CASH_ON_DELIVERY_ENABLED`.
- To'lov tasdiqlanmasdan oldin bekor qilingan buyurtmaga kelgan to'lovni server rad etadi
  (Payme `-31008`, Click `-9`) — pulni provayder qaytaradi. Sandbox'da shu holatni ham sinang:
  to'lovni boshlab, tasdiqlashdan oldin buyurtmani bekor qiling.

## 4. Oddiy deploy

```bash
cd /opt/inbola && git pull && bash scripts/deploy.sh
```

`deploy.sh` har safar avval zaxira oladi. Migratsiya faqat oldinga yuradi
(`prisma migrate deploy`). `migrate dev`/`reset` prodda ishlatilmaydi.

## 5. Zaxira va tiklash

```bash
bash scripts/backup.sh     # backups/<vaqt>/db.dump + uploads.tar.gz, 14 kundan eskilari o'chadi
# Kunlik:
( crontab -l; echo '30 3 * * * cd /opt/inbola && bash scripts/backup.sh >> backups/backup.log 2>&1' ) | crontab -
```

- `pg_dump` yolg'iz o'zi yetarli emas: rasmlar `uploads` volume'da.
- Zaxirani serverdan tashqariga ham ko'chiring (masalan `rclone` bilan) — disk ishdan
  chiqsa, faqat mahalliy zaxira ham yo'qoladi.
- **Tiklash sinovi** (QUALITY_BAR B1): staging'da `bash scripts/restore.sh backups/<vaqt>`,
  keyin buyurtma va rasmlar ochilishini tekshiring. Bu sinov hali o'tkazilmagan.

## 6. Rollback

1. `git log` dan oldingi ishlagan commit'ni toping.
2. `git checkout <commit> && bash scripts/deploy.sh`.
3. Yangi versiya migratsiya qo'shgan bo'lsa: migratsiyalar oldinga mos (ustun qo'shish,
   `DROP` yo'q), eski kod yangi sxemada ishlaydi. Destruktiv migratsiya bo'lsa —
   `scripts/restore.sh` bilan deploy oldidagi zaxiraga qayting.

## 7. Kuzatuv

| Endpoint | Nima | Kim ishlatadi |
|---|---|---|
| `GET /health` | baza javob beradimi (`SELECT 1`); yo'q bo'lsa 503 | tashqi monitoring (nginx orqali ochiq), `deploy.sh`, Docker HEALTHCHECK |
| `GET /ready` | `/health` bilan bir xil | faqat ichki tarmoq (nginx tashqariga chiqarmaydi) |
| `GET /health/live` | jarayon tirikmi, bazaga tegmaydi | "qayta ishga tushirish kerakmi" savoli uchun |

- Stekda Redis yo'q: rate limit backend xotirasida, OTP byudjeti bazada.
- **Loglar:** prodda har satr — bitta JSON (`docker compose -f docker-compose.prod.yml logs -f backend`,
  20 MB × 5 aylanma). Hodisalar `message.event` bo'yicha qidiriladi:
  `order_created`, `order_paid`, `order_cancelled`, `payme`, `click`, `auth_login`, `admin_login`,
  `otp_limit`, `sms_failed`, `http_error`. Telefon niqoblangan (`+99890*****67`); parol, token, kod,
  to'lov kaliti va so'rov satri logga tushmaydi.
  Misol: `... logs backend | grep '"event":"payme"' | grep '"ok":false'`.
- **Xato kuzatuvi (Sentry va h.k.) ulanmagan.** Ulanish nuqtasi tayyor: `src/common/error-reporter.ts`
  (har 5xx shu yerdan o'tadi). SDK qo'shish — yangi bog'liqlik, egasining qarori.
- Tashqi monitoring (UptimeRobot va h.k.) har daqiqada `https://<domen>/health` ni tekshirsin.

## 8. Cheklovlar va chegaralar

- **So'rov chegaralari ikki qatlamda.** nginx (`deploy/nginx/default.conf.template`): bitta IP'dan
  API 20 so'rov/s (burst 60), sahifalar 10 so'rov/s (burst 40); statik fayllar va to'lov
  callback'lari cheklanmaydi. Backend: kirish/OTP 5/daq, qolgan himoyalangan yo'llar 300/daq (IP).
  Ochiq katalog backend'da cheklanmaydi — web server SSR so'rovlarini bitta IP'dan yuboradi.
- Backend chegarasi xotirada: bitta `backend` konteyner uchun to'g'ri. Bir nechta instansiyaga
  o'tilsa, umumiy saqlagich (Redis) kerak bo'ladi.
- **OTP byudjeti** (`OTP_IP_PHONES_PER_HOUR`, `OTP_GLOBAL_PER_HOUR`, `OTP_GLOBAL_PER_DAY`): umumiy chegara
  tugasa hech kim kira olmaydi va logga `otp_limit` (`global_hour`/`global_day`) yoziladi —
  `docs/RUNBOOK.md`.
- `TRUST_PROXY_HEADERS=true` web konteynerida faqat oldida nginx turgani uchun yoqilgan.
- To'lanmagan onlayn buyurtmalarni bekor qiluvchi taymer ham backend ichida — bir nechta
  instansiyada u har birida ishlaydi (idempotent, lekin ortiqcha).
- Katalogga qo'shilgan mahsulot do'kon sahifasida 60 soniyagacha kechikib ko'rinadi (Next keshi).
- Baza ulanishlari hovuzi: Prisma standarti (CPU × 2 + 1). O'zgartirish — `DATABASE_URL` ga
  `?connection_limit=N` (`backend-main/.env.example`).
