# INBOLA — CLAUDE.md

Loyiha qoidalari, buyruqlar va tuzoqlar: `AGENTS.md`. Bu fayl ish tartibini belgilaydi.

## Ustuvorliklar

1. To'g'rilik
2. Pul va buyurtma ma'lumotlarining yaxlitligi
3. Xavfsizlik
4. Minimal o'zgarish
5. Saqlab turish qulayligi
6. Tezlik

## Qamrov intizomi

So'rov qamrovni belgilaydi. Yo'l-yo'lakay topilgan bog'liq bo'lmagan xato,
texnik qarz yoki tozalash imkoniyati avtomatik tuzatilmaydi — follow-up sifatida
yoziladi. Istisno: so'ralgan ish usiz to'g'ri ishlamasa, minimal qism tuzatiladi
va sababi aytiladi.

## Ma'lumotlar bazasi xavfsizligi

Baza bilan bog'liq kodni o'zgartirishdan oldin: `schema.prisma` dagi model,
munosabat, indeks va migratsiyalarni ko'ring. Egasining aniq tasdig'isiz:
DROP/TRUNCATE, keng DELETE, destruktiv migratsiya, prod'ga ommaviy UPDATE yo'q.
Testni o'tkazish uchun prod ma'lumoti o'zgartirilmaydi. Yozadigan testdan oldin
`DATABASE_URL` test bazasiga qarashini tekshiring.

## Pul oqimi

Yuqori xavfli: buyurtma summasi, chegirma/kupon, zaxira, to'lov callback'lari, refund.
O'zgartirishdan oldin: mavjud formulani tushuning, chekka holatlarni tekshiring,
atomik bo'lishi kerak bo'lgan amallarni `$transaction` ga oling, maqsadli test yozing.
Callback qayta ishlaganda takroriy yozuv yaratmasligi shart.

## Autentifikatsiya va avtorizatsiya

Mavjud guard'lar chetlab o'tilmaydi. Himoyalangan funksiyada: kerakli rolni
aniqlang, egalikni serverda tekshiring. Secret, token va shaxsiy ma'lumot
log, xato matni, URL yoki API javobiga chiqmaydi.

## API

O'zgartirishdan oldin chaqiruvchilarni (`web/` da grep), validatsiyani,
guard'ni va javob shaklini ko'ring. Mavjud iste'molchini jimgina buzmang.

## Yakuniy javob

Qisqa va faktlarga asoslangan: **O'zgardi** · **Fayllar** · **Tekshiruv**
(haqiqatan ishga tushirilgan buyruqlar) · **Qolgan ishlar**.
Ishga tushirilmagan testni "o'tdi" demang.
