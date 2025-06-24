# "inbola.uz" Marketplace Loyihasi

Bu `inbola.uz` onlayn savdo maydonchasi uchun to'liq (full-stack) veb-dastur. Loyiha zamonaviy texnologiyalar yordamida qurilgan bo'lib, foydalanuvchilar uchun qulay interfeys va sotuvchilar uchun keng imkoniyatlarni taqdim etadi.

## 🚀 Asosiy Imkoniyatlar (Features)

*   **Mahsulotlar Katalogi:** Mahsulotlarni kategoriya bo'yicha ko'rish, qidirish va saralash.
*   **Foydalanuvchi Autentifikatsiyasi:** Replit OAuth orqali xavfsiz ro'yxatdan o'tish va tizimga kirish.
*   **Sotuvchi Paneli (Seller Dashboard):** Sotuvchilar o'z mahsulotlarini qo'shishi, tahrirlashi va boshqarishi mumkin.
*   **Foydalanuvchi Paneli (User Dashboard):** Foydalanuvchilar o'z buyurtmalarini va shaxsiy ma'lumotlarini ko'rishi mumkin.
*   **Savatcha (Shopping Cart):** Mahsulotlarni savatchaga qo'shish va buyurtma berish jarayoni.
*   **Ko'p tillik (Multi-language):** Sayt interfeysini turli tillarga o'girish imkoniyati.

## 🛠️ Texnologiyalar Steki (Tech Stack)

*   **Frontend:**
    *   [React](https://reactjs.org/) - Foydalanuvchi interfeysini yaratish uchun kutubxona.
    *   [Vite](https://vitejs.dev/) - Loyihani yig'ish va ishga tushirish uchun tezkor vosita.
    *   [TypeScript](https://www.typescriptlang.org/) - JavaScript'ga turlar (types) qo'shuvchi til.
    *   [Tailwind CSS](https://tailwindcss.com/) - Dizayn uchun CSS freymvork.
    *   [shadcn/ui](https://ui.shadcn.com/) - Tayyor, moslashuvchan UI komponentlar to'plami.
    *   [React Query](https://tanstack.com/query/v4) - Server holatini boshqarish uchun.
    *   [wouter](https://github.com/molefrog/wouter) - Minimalistik marshrutlash (routing) kutubxonasi.
*   **Backend:**
    *   [Node.js](https://nodejs.org/) - Server uchun JavaScript ishga tushirish muhiti.
    *   [Express.js](https://expressjs.com/) - Backend uchun veb-freymvork.
    *   [Passport.js](https://www.passportjs.org/) - Autentifikatsiya uchun vosita.
*   **Ma'lumotlar Bazasi (Database):**
    *   [PostgreSQL](https://www.postgresql.org/) - Relyatsion ma'lumotlar bazasi.
    *   [Drizzle ORM](https://orm.drizzle.team/) - TypeScript uchun mo'ljallangan ORM (Object-Relational Mapper).

## 📂 Loyiha Tuzilishi (Project Structure)

```
/
├── attached_assets/      # Rasm va boshqa media fayllar
├── client/               # Frontend kodi (React, Vite)
│   ├── src/
│   │   ├── components/   # Qayta ishlatiladigan UI komponentlar
│   │   ├── context/      # Global holat (Context API)
│   │   ├── hooks/        # Maxsus hook'lar
│   │   ├── lib/          # Yordamchi funksiyalar
│   │   ├── pages/        # Sayt sahifalari
│   │   └── App.tsx       # Asosiy ilova komponenti
├── dist/                 # Loyihaning yig'ilgan (build) versiyasi
├── server/               # Backend kodi (Express.js)
│   ├── db/               # Ma'lumotlar bazasi sxemalari (Drizzle)
│   ├── index.ts          # Asosiy server fayli
│   └── vite.ts           # Serverdagi Vite sozlamalari
├── shared/               # Frontend va backend uchun umumiy kod
├── .env                  # Muhit o'zgaruvchilari (lokal)
├── package.json          # Loyiha bog'liqliklari va skriptlari
└── README.md             # Loyiha haqida ma'lumot
```

## ⚙️ O'rnatish va Ishga Tushirish (Installation and Setup)

Loyihani lokal kompyuteringizda ishga tushirish uchun quyidagi amallarni bajaring:

### 1. Talablar (Prerequisites)

*   [Node.js](https://nodejs.org/en/download/) (v18 yoki undan yuqori)
*   [npm](https://www.npmjs.com/get-npm) yoki [yarn](https://classic.yarnpkg.com/en/docs/install/)
*   [PostgreSQL](https://www.postgresql.org/download/) ma'lumotlar bazasi o'rnatilgan va ishlab turgan bo'lishi kerak.

### 2. O'rnatish (Installation)

1.  **Loyihani yuklab oling (klonlang):**
    ```bash
    git clone <repository_url>
    cd marketplace
    ```

2.  **Bog'liqliklarni o'rnating:**
    ```bash
    npm install
    ```

### 3. Muhitni Sozlash (Environment Setup)

1.  `.env` nomli yangi fayl yarating va unga quyidagi tarkibni joylashtiring:

2.  `.env` faylini o'zingizning ma'lumotlaringiz bilan to'ldiring:
    ```env
    # PostgreSQL ma'lumotlar bazasiga ulanish manzili
    # Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
    DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/marketplace_db"

    # Sessiyalarni shifrlash uchun maxfiy kalit
    SESSION_SECRET="bu_yerga_ixtiyoriy_maxfiy_suz_yozing"

    # Replit Autentifikatsiyasi uchun (agar ishlatilsa)
    REPLIT_DOMAINS=""
    REPL_ID=""
    ISSUER_URL=""
    ```

### 4. Ma'lumotlar Bazasini Sozlash (Database Setup)

1.  PostgreSQL'da `marketplace_db` nomli yangi ma'lumotlar bazasini yarating.

2.  Ma'lumotlar bazasi sxemasini (jadvallarni) Drizzle yordamida yuklang:
    ```bash
    npm run db:push
    ```
    Bu buyruq `server/db/schema.ts` faylidagi sxemalar asosida bazada jadvallar yaratadi.

### 5. Loyihani Ishga Tushirish (Running the Application)

Loyihani development (ishlab chiqish) rejimida ishga tushirish uchun:
```bash
npm run dev
```
Bu buyruq bir vaqtning o'zida ham backend serverini, ham frontend qismini ishga tushiradi. Dastur odatda [http://localhost:5003](http://localhost:5003) manzilida ochiladi (port raqami o'zgarishi mumkin).

## 📜 Mavjud Skriptlar (Available Scripts)

`package.json` faylida quyidagi skriptlar mavjud:

*   `npm run dev`: Loyihani ishlab chiqish rejimida ishga tushiradi.
*   `npm run build`: Loyihaning frontend qismini `dist/` papkasiga yig'adi.
*   `npm run start`: Loyihaning yig'ilgan versiyasini ishga tushiradi.
*   `npm run db:push`: Ma'lumotlar bazasi sxemasini yangilaydi.
*   `npm run db:studio`: Drizzle Studio'ni ochadi (ma'lumotlar bazasini veb-interfeys orqali ko'rish uchun).
