# ICEBOX — MVP'dan tashqarida qolgan kod

Bu modullar `backend-main/src/` da **turibdi, lekin `app.module.ts` ga ulanmagan** —
ya'ni hech bir route orqali chaqirilmaydi. Ular o'chirilmadi: qaror egasi bilan
kelishilgunicha git tarixi va kod joyida qoladi (2026-09-29).

Ulashdan oldin har biri 2026-09-29 review'idagi xavfsizlik topilmalariga qarshi
qayta ko'rib chiqilishi shart — ular o'sha holatda muzlatilgan.

| Modul / fayl | Nega ulanmagan | Qaytarish sharti |
|---|---|---|
| `auth/`, `user-auth/`, `otp/`, `admin/admin-phone-auth.service.ts` | 6+ parallel auth implementatsiyasi; o'rniga `identity/` (telefon+OTP, admin parol) | Google/Telegram login kerak bo'lsa — `identity/` ga yangi strategiya sifatida |
| `admin/` (controller, service, RBAC) | O'rniga `backoffice/`, `identity/` (admin auth), `catalog/` (admin mahsulot), `order/` (admin buyurtma) | — |
| `payment/`, `payment_method/` | O'rniga `payments/` (Payme, Click protokol bo'yicha). Eski Click summani tiyinda solishtirardi | — |
| Uzum to'lovi | Merchant API hujjati va test kalitlari yo'q; taxmin qilingan protokol pul oqimiga qo'yilmaydi | Uzum hujjati + sandbox kalitlari → `payments/uzum.service.ts` + e2e |
| `product/`, `inventory/` | O'rniga `catalog/` (telefon-bozor shablonidagi filtrlar va debug log'lar bilan edi) | — |
| `address/`, `user/`, `phone_number/`, `email/` | IDOR (DTO'dagi `user_id`, ochiq `GET /:id`); o'rniga `account/addresses.ts`, `/auth/me` | — |
| `uploads/` controller | `..%2F` bilan path traversal (hech qachon ulanmagan edi); statik fayllar `app.setup.ts` da | — |
| GraphQL (`*.resolver.ts`, `schema.gql`) | REST bilan dublikat; build'dan istisno (`tsconfig.build.json`) | Mobil ilova GraphQL talab qilsa |
| `chat/`, `notification/`, `mail/` | MVP'da real-time chat va email yo'q; mailer zanjirida critical zaifliklar | Email bildirishnoma kerak bo'lsa — mailer'siz nodemailer |
| `child-safety/`, `seller/`, `telegram/`, `microservices/`, `color(s)/`, `model/`, `currency/` controller | Ota-ona nazorati, ko'p sotuvchili bozor, Telegram bot — MVP qamrovidan tashqari | Mahsulot qarori |
| `common/services/*` (winston, sentry, monitoring) | Hech qayerda ishlatilmaydi | Faza 4 monitoring bilan birga ko'rib chiqiladi |
| **`front-main/` (butun eski frontend)** | O'rniga `web/` (Next 16). Eskisi: Next 14 critical CVE, 505 tip xatosi, 3 holat menejeri, eski API manzillari, karta ma'lumotini yig'uvchi komponent | Qaytarilmaydi; o'chirish taklif qilinadi |
| Eski `docker-compose.yml`, `setup.ps1`, `test-api-windows.ps1`, `.replit` | Dev uchun pgAdmin/redis-commander standart parollar bilan; Replit/Windows sozlamalari eski tuzilmaga qaratilgan | Prod: `docker-compose.prod.yml` |

**Paketlar olib tashlangan.** Faza 0.5 da uzilgan kodgina ishlatgan 45 paket
(`@nestjs-modules/mailer`, `@nestjs/apollo`, `twilio`, `passport*`, `sharp`, ...)
`package.json` dan chiqarildi va bu papkalar `tsconfig*.json` da istisno qilingan.
Modulni qayta ulashda kerakli paketni qaytadan qo'shing.

**O'chirish qarori egasida.** Uzilgan kod xavfsizlik skanerlari va `tsc` uchun shovqin
beradi; o'chirish taklif qilinadi, lekin bajarilmagan.
