# Runbook — nosozlikda nima qilish

`C` = `docker compose -f docker-compose.prod.yml --env-file .env.prod` (serverda, `/opt/inbola`).
`L` = `$C logs --since 1h backend`. Loglar JSON; hodisa nomi `"event":"..."` (`DEPLOYMENT.md` §7).

Belgilar: **[T]** — bu xatti-harakat 2026-11-27 da lokal stekda yoki testda kuzatilgan;
**[S]** — haqiqiy muhitda hali sinalmagan.

> Umumiy qoida: pul va buyurtma holati **qo'lda bazada o'zgartirilmaydi**. Holatni faqat provayder
> callback'i va admin paneli o'zgartiradi. Baza bilan ishlash — faqat o'qish (`SELECT`); o'zgartirish
> kerakdek tuyulsa, avval zaxira oling va egasidan tasdiq so'rang.

## 1. To'lov tiqilib qoldi

**Belgi:** xaridor "pul yechildi, buyurtma to'lanmagan" deydi yoki buyurtma `PENDING`da qolgan.

1. Buyurtmani toping (raqami `INB-...` yoki id):
   ```bash
   $C exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c \
     "select o.id, o.status, o.payment_status, o.payment_method, o.final_amount, o.\"createdAt\",
             p.transaction_id, p.status as tx_status, p.provider_state, p.cancel_reason
      from \"order\" o left join order_payment p on p.order_id = o.id where o.order_number = 'INB-...';"
   ```
2. Shu buyurtma bo'yicha provayder so'rovlari: `L | grep '"order_id":"<id>"'` (Payme, Click).
3. Natijaga qarab:

| Ko'rinish | Ma'nosi | Harakat |
|---|---|---|
| `order_payment` qatori yo'q, logda so'rov yo'q | provayder bizga yetib kelmagan | kabinetdagi callback manzilini, `/health`ni, nginx logini tekshiring. Payme o'zi qayta yuboradi **[S]** |
| Payme `provider_state = 1`, uzoq vaqt | xaridor to'lovni yakunlamagan | kutish: Payme 12 soatda bekor qiladi; shungacha buyurtma muddati o'tmaydi **[T]** |
| logda `"code":-31008`, buyurtma `CANCELLED` | to'lov bekor qilingan buyurtmaga kelgan — biz rad etdik **[T]** | pulni **provayder** qaytaradi. Kabinetda tranzaksiya bekor bo'lganini tekshiring; xaridorga yangi buyurtma berishni ayting |
| Click `"error":-9` | xuddi shu, Click uchun **[T]** | xuddi shu |
| logda `"code":-32504` yoki `"error":-1` | kalit/imzo mos emas | `.env.prod` dagi kalit kabinetdagi bilan bir xilmi; o'zgartirilgan bo'lsa `$C up -d backend` |
| logda `"code":-31001` yoki `"error":-2` | summa mos emas | buyurtma summasi (`final_amount`) va provayder yuborgan summani solishtiring; Click — so'mda, Payme — tiyinda |
| `payment_status = PAID`, lekin xaridor ko'rmayapti | sahifa eskirgan | buyurtma sahifasi bir daqiqa o'zi yangilanadi; qayta ochish yetadi **[T]** |

4. To'langan buyurtmani bekor qilish kerak bo'lsa: avval pulni provayder kabinetidan qaytaring —
   Payme `CancelTransaction` yuboradi va buyurtma o'zi bekor bo'ladi, zaxira qaytadi **[T]**.
   Yo'lga chiqqan (`SHIPPED`/`DELIVERED`) buyurtmada bu rad etiladi (`-31007`) **[T]**.

## 2. Baza ishlamayapti yoki disk to'ldi

**Belgi:** `/health` → 503; API → 500 "Ma'lumotlar bazasida xatolik"; sahifalar keshdan ochilishi mumkin.

1. `$C ps` — `postgres` holati; `$C logs --tail=50 postgres`.
2. `df -h /` va `docker system df` — disk.
3. Baza to'xtagan bo'lsa: `$C up -d postgres`. Backend'ni qayta ishga tushirish **shart emas** —
   u baza qaytgach 2–3 soniyada o'zi tiklanadi **[T]**. `/health/live` bu vaqtda 200 qaytaradi
   (jarayon tirik) — konteynerni o'ldirmang.
4. Disk to'lgan bo'lsa (bo'shatish tartibi, xavfsizdan boshlab):
   - eski image'lar: `docker image prune -f`;
   - eski zaxiralar: `backups/` (standart 14 kun saqlanadi; avval tashqi nusxa borligini tekshiring);
   - konteyner loglari allaqachon cheklangan (20 MB × 5).
   `pgdata` va `uploads` volume'lariga tegmang.
5. Ulanishlar tugagan bo'lsa (`too many clients`): `DATABASE_URL` dagi `connection_limit` va
   Postgres `max_connections` ni solishtiring (`DEPLOYMENT.md` §8).
6. Baza buzilgan bo'lsa — 5-bo'lim (tiklash).

## 3. Redis

Stekda Redis **yo'q** — bu nosozlik bo'lishi mumkin emas. So'rov chegaralari backend xotirasida
(konteyner qayta ishga tushsa hisoblagichlar nolga tushadi — bu xavfsiz), OTP byudjeti bazada.
Redis faqat bir nechta backend instansiyasiga o'tilganda kerak bo'ladi; o'shanda bu bo'lim yoziladi.

## 4. SMS kelmayapti (hech kim kira olmaydi)

**Belgi:** kirishda "SMS yuborib bo'lmadi" (503) yoki kod kelmaydi. Adminlar parol bilan kiradi —
admin paneli ishlayveradi.

1. `L | grep '"event":"sms_failed"'` — `status` maydoni:
   - `401` — Eskiz login/paroli noto'g'ri yoki o'zgargan → `.env.prod`, `$C up -d backend`;
   - `network` — Eskiz'ga yetib bo'lmayapti → serverdan `curl -I https://notify.eskiz.uz`;
   - `4xx`/`5xx` — Eskiz tomoni: balans, shablon tasdiqlanmagan, xizmat nosoz → Eskiz kabineti.
2. `sms_failed` yo'q, lekin kod kelmayapti → Eskiz qabul qilgan, operator yetkazmagan:
   Eskiz kabinetida xabar holati **[S]**.
3. `L | grep '"event":"otp_limit"'`:
   - `global_hour` / `global_day` — umumiy byudjet tugagan, **hamma** bloklangan. Haqiqiy oqim
     bo'lsa: `.env.prod` da `OTP_GLOBAL_PER_HOUR`/`OTP_GLOBAL_PER_DAY` ni oshirib `$C up -d backend`.
     Hujum bo'lsa (ko'p `ip_phones`, notanish raqamlar): chegarani oshirmang — nginx'da manba
     IP'larni to'sing va captcha qarorini qabul qiling;
   - `ip_phones` — bitta IP'dan ko'p turli raqam: hujum yoki bitta NAT ortidagi ko'p xaridor.
     Ikkinchisi bo'lsa `OTP_IP_PHONES_PER_HOUR` ni oshiring.
4. Yuborilmagan SMS xaridorning urinishini "yemaydi": kutmasdan qayta so'rashi mumkin **[T]**.

## 5. Zaxiradan tiklash

**Qachon:** baza buzilgan, buzuvchi migratsiya, ma'lumot xato o'chirilgan. Bu — oxirgi chora:
zaxiradan keyingi buyurtma va to'lovlar yo'qoladi.

1. Hozirgi holatni saqlab qo'ying (keyin solishtirish uchun): `bash scripts/backup.sh`.
2. Kerakli zaxirani tanlang: `ls backups/` — ichida `db.dump` va `uploads.tar.gz`.
3. `bash scripts/restore.sh backups/<vaqt>` — `tiklash` deb yozib tasdiqlaysiz. Skript backend va
   web'ni to'xtatadi, bazani `pg_restore --clean` bilan, rasmlarni arxivdan tiklaydi, qayta yoqadi.
   Ichidagi buyruqlar bilan aylana sinalgan: nom, mahsulotlar soni, rasm qatori va fayli
   aynan zaxiradagi holatga qaytdi **[T]**; skriptning o'zi (`docker compose` bilan) — **[S]**.
4. Tekshirish: `curl $D/health`; admin panelda oxirgi buyurtmalar; biror mahsulot rasmi ochiladi.
5. Yo'qolgan oraliq uchun provayder kabinetidagi to'lovlarni 1-qadamdagi nusxa bilan solishtiring
   va xaridorlar bilan bog'laning.

## 6. Sayt 502 / ochilmayapti

1. `$C ps` — qaysi konteyner ishlamayapti; `$C logs --tail=50 <xizmat>`.
2. Backend qayta-qayta o'chyapti va logda `Config validation error` → `.env.prod` da majburiy
   kalit yo'q yoki bo'sh (xato matni kalit nomini aytadi) **[T]**.
3. Deploy'dan keyin qisqa 502 — backend ishga tushguncha (bir necha soniya) me'yor. nginx
   konteyner manzillarini o'zi qayta topadi **[T]**; baribir tiklanmasa: `$C exec nginx nginx -s reload`.
4. Sertifikat muddati o'tgan → `certbot renew`, so'ng `$C exec nginx nginx -s reload` **[S]**.
5. Hammasi ishlayapti, lekin ko'p 429 → nginx chegaralari (`deploy/nginx/default.conf.template`):
   bitta IP ortida ko'p xaridor bo'lsa `rate`/`burst` ni oshirib nginx'ni qayta yarating.

## 7. Admin kira olmayapti / shubhali kirishlar

- Parol unutilgan: boshqa `SUPER_ADMIN` yangi admin yaratadi (`/admin/admins`). Yagona super admin
  bo'lsa: `$C run --rm -e ADMIN_PHONE=+998... -e ADMIN_PASSWORD='<12+ belgi>' backend node create-admin.js`
  (yangi raqam bilan) **[T]**.
- `L | grep '"event":"admin_login"' | grep '"ok":false'` ko'p bo'lsa — parol tanlash. Kirish IP
  bo'yicha 5/daq bilan cheklangan; manba IP'ni nginx'da to'sing, admin parollarini almashtiring.
- Xodim ishdan ketdi: admin panelda hisobni o'chiring — tokeni shu zahoti ishlamay qoladi **[T]**.
- Xaridorni bloklash ham darhol kuchga kiradi **[T]**.
