
# 🎯 INBOLA Kids Marketplace

> **Bolalar va ularning ota-onalari uchun xavfsiz, ta'limiy va zamonaviy elektron tijorat platformasi**

[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2015-blue?style=for-the-badge)](https://nextjs.org/)
[![Backend](https://img.shields.io/badge/Backend-NestJS-red?style=for-the-badge)](https://nestjs.com/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-blue?style=for-the-badge)](https://postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge)](https://typescriptlang.org/)
[![Clean Code](https://img.shields.io/badge/Code%20Quality-Clean%20Code-green?style=for-the-badge)](https://clean-code-developer.com/)

## 📋 Loyiha Haqida

INBOLA Kids Marketplace - bu 3-12 yosh oralig'idagi bolalar uchun maxsus ishlab chiqilgan e-commerce platforma. Platform bolalar xavfsizligi, ta'lim va o'yin elementlarini o'zida mujassamlashtirgan.

### ✨ Asosiy Xususiyatlar

- 🛡️ **Xavfsizlik birinchi o'rinda**: Barcha mahsulotlar bolalar xavfsizligi bo'yicha tekshirilgan
- 🎨 **Bolalar uchun qulay dizayn**: Yorqin ranglar va oddiy navigatsiya
- 📚 **Ta'limiy mahsulotlar**: Kitoblar, o'yinchoqlar va ta'lim materiallarl
- 👨‍👩‍👧‍👦 **Ota-ona nazorati**: Kattalar uchun maxsus nazorat paneli
- 🔒 **JWT autentifikatsiya**: Xavfsiz login tizimi
- 📱 **PWA qo'llab-quvvatlash**: Mobil qurilmalarda app kabi ishlaydi

## 🏗️ Texnik Arxitektura

### Backend (NestJS)
```
📁 backend-main/
├── 🔧 src/
│   ├── 🛡️ auth/           # JWT autentifikatsiya
│   ├── 📦 product/        # Mahsulot boshqaruvi
│   ├── 👤 user/           # Foydalanuvchi boshqaruvi
│   ├── 🛒 order/          # Buyurtma tizimi
│   ├── 💳 payment/        # To'lov integratsiyasi
│   ├── 🛡️ child-safety/   # Bolalar xavfsizligi
│   ├── 📧 mail/           # Email xizmati
│   ├── 💬 chat/           # Real-time chat
│   └── 🏛️ admin/          # Admin panel
├── 🗄️ prisma/            # Database schema
├── 📜 scripts/           # Production scripts
└── 🧪 test/              # Test fayllar
```

### Frontend (Next.js)
```
📁 front-main/
├── 📄 pages/             # Next.js sahifalar
├── 🧩 components/        # Qayta ishlatiladigan komponentlar
├── 🎨 styles/           # SCSS stillar
├── 🔗 endpoints/        # API endpoints
├── 🏪 store/            # Redux store
├── 🎣 hooks/            # Custom hooks
├── 🏗️ layout/           # Layout komponentlar
└── 📱 app/              # App komponentlar
```

## 🚀 Ishga Tushirish

### 1. Tez Boshlash
```bash
# Run tugmasini bosing yoki
# "Start Development Environment" workflow ishlatiladi
```

### 2. Backend Alohida Ishga Tushirish
```bash
cd backend-main
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```
**Backend manzil**: http://0.0.0.0:4000

### 3. Frontend Alohida Ishga Tushirish
```bash
cd front-main
npm install
npm run dev
```
**Frontend manzil**: http://0.0.0.0:3000

### 4. Ikkalasini Parallel Ishga Tushirish
```bash
# "Full Development Stack" workflow ishlatiladi
```

## 🔗 Muhim Manzillar

| Xizmat | URL | Tavsif |
|--------|-----|--------|
| 🎨 Frontend | http://0.0.0.0:3000 | Asosiy web interfeys |
| 🔧 Backend API | http://0.0.0.0:4000/api | REST API |
| 📚 API Docs | http://0.0.0.0:4000/api-docs | Swagger dokumentatsiya |
| 💚 Health Check | http://0.0.0.0:4000/health | Server holati |
| 🔗 GraphQL | http://0.0.0.0:4000/graphql | GraphQL endpoint |

## 🛠️ Mavjud Workflows

| Workflow | Tavsif | Ishlatilishi |
|----------|--------|-------------|
| **Start Development Environment** | Barcha setup | Run tugmasi |
| **Backend Development** | Faqat backend | Backend ishlab chiqish |
| **Frontend Development** | Faqat frontend | Frontend ishlab chiqish |
| **Full Development Stack** | Ikkalasi parallel | To'liq development |
| **Setup Database** | Database operatsiyalari | DB sozlash |
| **Run Tests** | Barcha testlar | Sifat nazorati |
| **Production Deploy** | Production deploy | Ishlab chiqarish |

## 🧪 Testlash

### Backend Testlar
```bash
cd backend-main
npm run test              # Unit testlar
npm run test:e2e          # Integration testlar
npm run test:cov          # Coverage hisobot
```

### Frontend Testlar
```bash
cd front-main
npm run test              # Jest testlar
npm run build             # Build test
```

### Load Testing
```bash
# "Load Testing" workflow ishlatiladi
k6 run backend-main/scripts/load-test.js
```

## 🚀 Production Deploy

### Replit Deployments orqali:
1. **Deploy** tugmasini bosing
2. **Autoscale Deployment** tanlang
3. Machine power va max instances sozlang
4. Deploy tugmasini bosing

### Manual Deploy:
```bash
# "Production Deploy" workflow ishlatiladi
cd backend-main
chmod +x scripts/production-deploy.sh
./scripts/production-deploy.sh
```

## 🔒 Xavfsizlik Xususiyatlari

- ✅ **Input validation**: Barcha kiritilgan ma'lumotlar tekshiriladi
- ✅ **JWT tokens**: Access va refresh tokenlar
- ✅ **RBAC**: Rol asosidagi kirish nazorati
- ✅ **Rate limiting**: So'rovlar cheklash
- ✅ **CORS**: Cross-origin so'rovlar nazorati
- ✅ **File upload security**: Xavfsiz fayl yuklash
- ✅ **Child safety filters**: Bolalar uchun kontent filtri

## 📱 Progressive Web App (PWA)

- 📱 **Mobil qulay**: App kabi tajriba
- 🔄 **Offline qo'llab-quvvatlash**: Internet yo'qligida ishlaydi
- 🔔 **Push notifications**: Buyurtma yangilanishlari
- ⚡ **Fast loading**: Tez yuklash
- 💾 **Caching**: Ma'lumotlarni keshlash

## 🌍 Tillar

- **🇺🇿 Uzbek**: Asosiy til
- **🇺🇸 English**: Qo'shimcha qo'llab-quvvatlash
- **🇷🇺 Russian**: Rejalashtirilgan

## 📊 Monitoring va Analytics

### Production Monitoring
```bash
# "Setup Monitoring" workflow ishlatiladi
node backend-main/scripts/monitoring-setup.js
pm2 monit
```

### Health Checks
```bash
# "Health Check" workflow ishlatiladi
curl http://0.0.0.0:4000/health
curl http://0.0.0.0:3000
```

## 🤝 Development Guidelines

### Clean Code Qoidalari
- ✅ **Tushunarli nomenklatura**: O'zbekcha/inglizcha aralash
- ✅ **Kichik funksiyalar**: Har biri bitta vazifa
- ✅ **DRY principle**: Takrorlanuvchi kod yo'q
- ✅ **SOLID principles**: OOP tamoyillari
- ✅ **TypeScript**: Strict type checking
- ✅ **ESLint va Prettier**: Kod formatlash

### Git Workflow
```bash
# Feature branch yaratish
git checkout -b feature/new-functionality

# Commit qilish
git commit -m "feat: yangi funksiyani qo'shish"

# Pull request yaratish
git push origin feature/new-functionality
```

## 🔧 Environment Variables

### Backend (.env)
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
REDIS_URL="redis://localhost:6379"
SMTP_HOST="smtp.gmail.com"
PORT=4000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://0.0.0.0:4000
NEXT_PUBLIC_FRONTEND_URL=http://0.0.0.0:3000
NEXT_PUBLIC_APP_NAME="INBOLA Kids Marketplace"
```

## 📞 Qo'llab-quvvatlash

- 📧 **Email**: support@inbola.uz
- 💬 **Chat**: Real-time chat tizimi orqali
- 📱 **Telegram**: @inbola_support
- 🌐 **Website**: https://inbola.uz

## 📄 Litsenziya

Bu loyiha **MIT** litsenziyasi ostida tarqatiladi. Ko'proq ma'lumot uchun [LICENSE](LICENSE) faylini ko'ring.

---

> **💡 Eslatma**: Ushbu loyiha bolalar xavfsizligi va ta'limi uchun ishlab chiqilgan. Barcha kod clean code printsiplari va best practices asosida yozilgan.
