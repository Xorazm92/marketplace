# Reliz ro'yxati

Har relizda yuqoridan pastga. Belgilar: **[T]** — shu qadam 2026-11-27 da lokal stekda
sinab ko'rilgan; **[S]** — faqat staging/VPS'da sinaladi, hali sinalmagan.
Tafsilotlar: `docs/DEPLOYMENT.md`; nosozliklar: `docs/RUNBOOK.md`.

`C` — qisqartma: `docker compose -f docker-compose.prod.yml --env-file .env.prod`.

## 0. Birinchi relizdan oldin (bir marta)

- [ ] **[S]** VPS: Docker + `docker compose` plagini (`docker compose version` ishlaydi), 2 GB RAM, 20 GB disk.
- [ ] **[S]** DNS A-yozuvi, Let's Encrypt sertifikati, certbot yangilanish cron'i (`DEPLOYMENT.md` §1).
- [ ] `.env.prod` to'ldirilgan (`chmod 600`), repoda yo'q. Har secret — `openssl rand -hex 32`:
      `POSTGRES_PASSWORD`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_OTP_SECRET`.
- [ ] `ESKIZ_EMAIL`/`ESKIZ_PASSWORD` — busiz prod backend ishga tushmaydi **[T]**. SMS shabloni
      (`INBOLA: tasdiqlash kodi ...`) Eskiz'da tasdiqlangan **[S]**.
- [ ] To'lov: ishlatiladigan provayderning id + kaliti. Bo'sh qoldirilgan provayder checkout'da
      ko'rinmaydi **[T]**. Kabinetlardagi callback manzillari — `DEPLOYMENT.md` §3 **[S]**.
- [ ] Yetkazish narxi qoidasi belgilangan: `SHIPPING_FLAT_FEE`, `FREE_SHIPPING_FROM` (hozir 0).
- [ ] OTP byudjeti kutilgan oqimga mos: `OTP_GLOBAL_PER_HOUR`, `OTP_GLOBAL_PER_DAY`, `OTP_IP_PHONES_PER_HOUR`.
- [ ] Tashqi monitoring `https://<domen>/health` ga ulangan.
- [ ] Zaxira cron'i va serverdan tashqariga nusxa (`DEPLOYMENT.md` §5).
- [ ] Eski remote shoxlarda ochiq qolgan DB/Redis parollari va JWT kalitlari yangisiga almashtirilgan.

## 1. Reliz oldidan (har safar)

- [ ] `main` da kerakli PR'lar qo'shilgan; ishchi daraxt toza.
- [ ] **[T]** To'liq tekshiruv toza (GitHub Actions ishlamaguncha yagona dalil):

  ```bash
  TEST_DATABASE_URL=postgresql://.../nomi_test E2E_DATABASE_URL=postgresql://.../nomi_pw_test \
    bash scripts/verify-all.sh --docker
  ```

- [ ] `npm audit --omit=dev`: critical = 0 (skript tekshiradi). Yangi high'lar ko'rib chiqilgan.
- [ ] Yangi migratsiyalar o'qib chiqilgan (2-bo'lim qoidalari).
- [ ] `.env.prod` ga yangi majburiy kalit kerakmi — `backend-main/.env.example` bilan solishtirilgan.
- [ ] Staging'da shu commit deploy qilingan va 4-bo'limdagi tutun sinovi o'tgan **[S]**.

## 2. Migratsiya tartibi

- Faqat oldinga: `prisma migrate deploy`. `migrate dev`, `reset`, `db push` prodda ishlatilmaydi.
- Migratsiya **qo'shuvchi** bo'lsin (ustun, jadval, indeks qo'shish): shunda eski kod yangi sxemada
  ishlaydi va rollback uchun faqat kodni qaytarish yetadi. Shu paytgacha yozilgan oxirgi ikki
  migratsiya (`otp_send_limits`, `fk_and_listing_indexes`) shunday.
- Ustun/jadvalni o'chirish yoki qayta nomlash — ikki relizda: avval kod eski ustunsiz ishlaydigan
  bo'ladi, keyingi relizda ustun o'chiriladi. Egasining aniq tasdig'i va deploy oldi zaxira shart.
- Katta jadvalga indeks: `CREATE INDEX` yozuvni bloklaydi. Jadval kattalashganda migratsiyada
  `CREATE INDEX CONCURRENTLY` (tranzaksiyadan tashqari) ishlatilsin.
- `deploy.sh` tartibi: zaxira → build → `migrate deploy` → yangi konteynerlar → `/health`.
  Migratsiya eski kod ishlab turganda qo'llanadi — shuning uchun u eski kod bilan mos bo'lishi shart.

## 3. Deploy

```bash
cd /opt/inbola && git fetch && git checkout <reliz-commit>
bash scripts/deploy.sh          # zaxira → build → migratsiya → up → /health   [S]
```

Birinchi deploy'da qo'shimcha (`DEPLOYMENT.md` §2): `seed:prod` **[T]**, `create-admin.js` **[T]**.

`deploy.sh` yiqilsa: ekrandagi oxirgi qadamni yozib oling, `$C logs --tail=100 backend`, so'ng 5-bo'lim.

## 4. Deploy'dan keyingi tutun sinovi (5 daqiqa)

```bash
D=https://<domen>
curl -fsS $D/health                                   # {"status":"ok","database":"up",...}
curl -s -o /dev/null -w '%{http_code}\n' $D/          # 200
curl -s -o /dev/null -w '%{http_code}\n' $D/catalog   # 200
curl -s -o /dev/null -w '%{http_code}\n' $D/api/v1/products    # 200
curl -s -o /dev/null -w '%{http_code}\n' $D/api/docs           # 404 (Swagger prodda o'chiq)
curl -sI $D/ | grep -i -E 'strict-transport|content-security|x-frame'   # uchala sarlavha bor
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' http://<domen>/   # 301 https://...
curl -s -X POST -H 'content-type: application/json' \
  -d '{"id":1,"method":"CheckTransaction","params":{"id":"x"}}' $D/api/v1/payments/payme
#   → "code":-32504 (kalitsiz so'rov rad etiladi)
$C ps                                                 # backend, web: healthy
$C logs --since 10m backend | grep -c '"level":"error"'   # 0
```

Brauzerda (haqiqiy telefon bilan):

- [ ] SMS kod bilan kirish (kod keladi) **[S]**.
- [ ] Mahsulot → savat → naqd buyurtma → "Buyurtmalarim"da ko'rinadi.
- [ ] Onlayn to'lov: kichik summali haqiqiy to'lov → buyurtma "To'langan" bo'ladi **[S]**.
- [ ] Admin: kirish, buyurtma holatini o'zgartirish, mahsulotga rasm yuklash.
- [ ] Sinov buyurtmalari admin panelidan bekor qilingan.

## 5. Orqaga qaytarish (rollback)

1. Qaror mezoni: `/health` 2 daqiqadan ortiq 503, kirish yoki buyurtma berish ishlamaydi,
   to'lovlar rad etilyapti, `"level":"error"` oqimi.
2. Kodni qaytarish: `git checkout <oldingi-reliz-commit> && bash scripts/deploy.sh`.
   Qo'shuvchi migratsiyalar joyida qoladi — eski kod ular bilan ishlaydi.
3. Faqat ma'lumot buzilgan bo'lsa (yoki buzuvchi migratsiya bo'lgan bo'lsa): deploy oldi zaxiraga
   qaytish — `bash scripts/restore.sh backups/<vaqt>`. **Diqqat:** zaxiradan keyin tushgan
   buyurtma va to'lovlar yo'qoladi; avval ularni `pg_dump` bilan alohida saqlang va provayder
   kabinetidagi to'lovlar bilan solishtiring.
4. Rollbackdan keyin 4-bo'lim qayta bajariladi.

## 6. Birinchi 24 soat

Har 1–2 soatda (`L` = `$C logs --since 2h backend`):

| Nima | Buyruq | Me'yor |
|---|---|---|
| Server xatolari | `L \| grep -c '"level":"error"'` | 0 |
| Rad etilgan to'lov so'rovlari | `L \| grep '"event":"payme"\\\|"event":"click"' \| grep -v '"ok":true\\\|"error":0'` | faqat tushunarli holatlar (bekor qilingan buyurtma: `-31008`, `-9`) |
| To'langan buyurtmalar | `L \| grep -c '"event":"order_paid"'` | provayder kabinetidagi son bilan teng |
| SMS | `L \| grep -c '"event":"sms_failed"'` | 0 |
| OTP chegaralari | `L \| grep '"event":"otp_limit"'` | `global_*` bo'lmasin; `ip_phones` ko'p bo'lsa — hujum yoki NAT |
| Kirish urinishlari | `L \| grep '"event":"admin_login"' \| grep -c '"ok":false'` | bir nechta; yuzlab bo'lsa — parol tanlash |
| nginx 429/5xx | `$C logs --since 2h nginx \| grep -c ' 429 '` (va `' 50[0-9] '`) | 5xx = 0; 429 ko'p bo'lsa chegaralarni ko'ring |
| Disk | `df -h /`, `docker system df` | < 80% |
| Zaxira | `ls -la backups/ \| tail -3` | bugungi papka bor, `db.dump` bo'sh emas |

- [ ] 24 soat ichida kamida bitta haqiqiy onlayn to'lov va bitta naqd buyurtma oxirigacha kuzatilgan.
- [ ] To'lanmagan onlayn buyurtmalar 24 soatdan keyin o'zi bekor bo'lgani tekshirilgan (`order_cancelled`).
