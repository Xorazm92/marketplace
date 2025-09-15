# 🚀 INBOLA Kids Marketplace

Bolalar uchun xavfsiz va ta'limiy marketplace platformasi.

## 📋 Loyiha Haqida

INBOLA - bu bolalar uchun maxsus ishlab chiqilgan e-commerce platforma bo'lib, ota-onalar o'z farzandlari uchun xavfsiz va sifatli mahsulotlarni sotib olishlari mumkin.

### 🎯 Asosiy Xususiyatlar

- **Bolalar xavfsizligi** - Barcha mahsulotlar yosh guruhlariga qarab tekshiriladi
- **Ta'limiy kategoriyalar** - STEM, san'at, til o'rganish va boshqalar
- **Ota-ona nazorati** - Xarajatlar chegarasi va kategoriya bloklash
- **Ko'p tilli qo'llab-quvvatlash** - O'zbek va ingliz tillari
- **Xavfsizlik sertifikatlari** - CE, CPSIA, ASTM F963 va boshqalar
- **Sovg'a o'rash xizmati** - Turli yoshlar uchun maxsus dizaynlar

## 🏗️ Texnologiya Stack

### Backend (NestJS)
- **Framework:** NestJS v11.0.1 with TypeScript
- **Database:** PostgreSQL with Prisma ORM v6.8.2
- **Authentication:** JWT with Passport, Google OAuth2
- **Payment:** Custom payment services (Payme, Click)
- **Caching:** Redis with cache-manager
- **API:** REST + GraphQL with Apollo Server

### Frontend (Next.js)
- **Framework:** Next.js 14.2.17 with TypeScript
- **UI Library:** Mantine v8.2.2, Radix UI components
- **State Management:** Redux Toolkit, Zustand
- **Styling:** Tailwind CSS

## 🚀 O'rnatish va Ishga Tushirish

### Tezkor Boshlash

```powershell
# Loyihani klonlash
git clone <repository-url>
cd marketplace

# Yagona setup skripti bilan o'rnatish
.\setup.ps1
```

### Manual O'rnatish

1. **Talablar:**
   - Node.js 18+
   - Docker Desktop (tavsiya etiladi)
   - PostgreSQL va Redis (Docker ishlatmasangiz)

2. **Ma'lumotlar bazasi:**
   ```powershell
   # Docker bilan
   docker-compose up -d postgres redis
   ```

3. **Backend:**
   ```powershell
   cd backend-main
   npm install
   npm run db:generate
   npm run db:migrate
   npm run seed
   npm run build
   npm run start:dev
   ```

4. **Frontend:**
   ```powershell
   cd front-main
   npm install
   npm run build
   npm run dev
   ```

## 🔧 Setup Skripti Parametrlari

```powershell
# Development rejimi (default)
.\setup.ps1 -Development -UseDocker

# Docker ishlatmasdan
.\setup.ps1 -UseDocker:$false

# Tozalash bilan o'rnatish
.\setup.ps1 -CleanInstall

# Testlarni o'tkazib yuborish
.\setup.ps1 -SkipTests
```

## 🌐 URL Manzillar

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **API Documentation:** http://localhost:4000/api
- **GraphQL Playground:** http://localhost:4000/graphql
- **Health Check:** http://localhost:4000/health

### Ma'lumotlar Bazasi Boshqaruvi (Docker bilan)
- **pgAdmin:** http://localhost:8080 (admin@inbola.com / admin123)
- **Redis Commander:** http://localhost:8081 (admin / admin123)

## 👥 Test Foydalanuvchilar

Setup skripti quyidagi test foydalanuvchilarni yaratadi:

```
📱 Test User: +998901234567 / password: 123456
👨‍💼 Admin User: +998909876543 / password: 123456
🔑 Super Admin: +998901070125 / password: 123456
```

## 📁 Loyiha Strukturasi

```
marketplace/
├── backend-main/          # NestJS backend
│   ├── src/              # Source code
│   ├── prisma/           # Database schema va migrations
│   └── package.json      # Dependencies
├── front-main/           # Next.js frontend
│   ├── app/              # App router pages
│   ├── components/       # React components
│   └── package.json      # Dependencies
├── docker-compose.yml    # Database services
├── setup.ps1            # Yagona setup skripti
└── README.md            # Bu fayl
```

## 🧪 Testing

```powershell
# Backend testlar
cd backend-main
npm run test

# Frontend testlar
cd front-main
npm run test

# API endpoint testlar
.\test-api-windows.ps1
```

## 🔒 Xavfsizlik

- JWT token authentication
- Role-based access control
- Input validation
- Rate limiting
- CORS protection
- SQL injection protection

## 📊 Monitoring

- Health check endpoint: `/health`
- Winston logging
- Error tracking
- Performance monitoring

## 🚀 Production Deployment

1. Environment variables ni sozlash
2. SSL sertifikatlarini o'rnatish
3. Database backup strategiyasini sozlash
4. Monitoring va logging ni sozlash
5. Load balancer sozlash

## 🤝 Hissa Qo'shish

1. Fork qiling
2. Feature branch yarating
3. O'zgarishlarni commit qiling
4. Pull request yuboring

## 📝 License

Bu loyiha MIT litsenziyasi ostida tarqatiladi.

## 📞 Yordam

Savollar yoki muammolar uchun:
- GitHub Issues
- Email: support@inbola.uz
- Telegram: @inbola_support

---

**INBOLA Team** - Bolalar uchun xavfsiz va ta'limiy shopping tajribasi! 🎯👶
