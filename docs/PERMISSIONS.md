# Admin rollari va ruxsatlar

Manba — kod: `backend-main/src/guards/admin.guard.ts` va `@AllowModerator()` dekoratori.
Har qator `backend-main/test/mvp/hardening.e2e-spec.ts` da har uchala rol uchun tekshiriladi;
jadval o'zgarsa, test ham o'zgarishi shart.

**Qoida:** `MODERATOR` uchun standart holat — **taqiq**. Yangi admin endpoint'i moderatorga faqat
`@AllowModerator()` bilan aniq ochiladi. Rol tokendan emas, har so'rovda bazadan o'qiladi.

| Amal | Endpoint | SUPER_ADMIN | ADMIN | MODERATOR |
|---|---|:-:|:-:|:-:|
| O'z profili, chiqish | `GET /admin/auth/me`, `POST /admin/auth/logout` | ✅ | ✅ | ✅ |
| Umumiy holat (tushum) | `GET /admin/dashboard` | ✅ | ✅ | ❌ |
| Xaridorlar ro'yxati, bloklash | `GET /admin/users`, `PATCH /admin/users/:id/active` | ✅ | ✅ | ❌ |
| Buyurtmalar (ko'rish, holat) | `GET /admin/orders`, `GET /admin/orders/:id`, `PATCH /admin/orders/:id/status` | ✅ | ✅ | ❌ |
| Mahsulotlarni ko'rish | `GET /admin/products`, `GET /admin/products/:id` | ✅ | ✅ | ✅ |
| Mahsulot kontentini tahrirlash | `PATCH /admin/products/:id` (narxdan tashqari) | ✅ | ✅ | ✅ |
| Narxni o'zgartirish | `PATCH /admin/products/:id` — `price`, `original_price` | ✅ | ✅ | ❌ |
| Rasm qo'shish / o'chirish | `POST`/`DELETE /admin/products/:id/images` | ✅ | ✅ | ✅ |
| Mahsulot yaratish / o'chirish | `POST /admin/products`, `DELETE /admin/products/:id` | ✅ | ✅ | ❌ |
| Zaxira | `PUT /admin/products/:id/stock` | ✅ | ✅ | ❌ |
| Bo'lim, brend, viloyat, tuman | `POST`/`PATCH`/`PUT`/`DELETE` `/category`, `/brand`, `/region`, `/district` | ✅ | ✅ | ❌ |
| Adminlarni boshqarish | `/admin/admins` | ✅ | ❌ | ❌ |

Asos: moderator — kontent xodimi. Pul (narx, buyurtma holati, tushum), zaxira va shaxsiy
ma'lumot (xaridor telefoni, manzili) unga yopiq. `SUPER_ADMIN` faqat `create-admin.js` bilan yaratiladi.

> Bu taqsimot 2026-11-27 da eng kam huquq tamoyili bo'yicha tanlangan va egasi tomonidan hali
> tasdiqlanmagan. Moderatorga boshqa huquq kerak bo'lsa — jadval, dekorator va test birga o'zgaradi.
