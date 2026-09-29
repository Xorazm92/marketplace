# Deploy — VPS + Docker Compose

Bitta VPS'da: `postgres` + `backend` (NestJS) + `web` (Next.js) + `nginx` (TLS).
Fayllar: `docker-compose.prod.yml`, `deploy/nginx/default.conf.template`,
`scripts/deploy.sh`, `scripts/backup.sh`, `scripts/restore.sh`.

> **Tekshirilganlik holati (2026-09-29):** Docker image'lar bu yerda build qilinmagan
> (ish mashinasida Docker yo'q). Image ichidagi har bir qadam alohida sinovdan o'tgan:
> backend build + `node dist/main`, JS seed, `next` standalone `server.js` + statik fayllar
> + API proxy, `prisma migrate deploy`. Birinchi deploy staging'da qilinsin.

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

- `GET https://<domen>/health` → `{"status":"ok","database":"up"}`; baza yo'q bo'lsa 503.
  Tashqi monitoring (UptimeRobot va h.k.) har daqiqada shuni tekshirsin.
- Loglar: `docker compose -f docker-compose.prod.yml logs -f backend` (20 MB × 5 aylanma).
- Xatolarni markazlashgan yig'ish (Sentry) hali ulanmagan — `docs/QUALITY_BAR.md` O5.

## 8. Cheklovlar

- Rate limit backend xotirasida: bitta `backend` konteyner uchun to'g'ri. Bir nechta
  instansiyaga o'tilsa, Redis storage kerak.
- To'lanmagan onlayn buyurtmalarni bekor qiluvchi taymer ham backend ichida — bir nechta
  instansiyada u har birida ishlaydi (idempotent, lekin ortiqcha).
