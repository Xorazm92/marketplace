# 🚀 INBOLA Kids Marketplace - To'liq Setup Guide

## 📋 Muammolar va Yechimlar

### 1. Navbar Muammolari
**Muammo**: Navbar ko'rinmayotgan edi
**Yechim**: 
- `front-main/layout/Header/Navbar.module.scss` da `.header` uchun `display: block` qilindi
- Etsy.com uslubida qayta dizayn qilindi

### 2. Mahsulot Rasmlari Muammosi
**Muammo**: Mahsulot rasmlari ko'rinmayotgan edi
**Yechim**: 
- `front-main/components/home/product-card/index.tsx` da image URL tuzatildi
- `process.env.NEXT_PUBLIC_BASE_URL` qo'shildi

### 3. Kategoriya Filtrlash Muammosi
**Muammo**: Kategoriya sahifalarida barcha mahsulotlar ko'rinayotgan edi
**Yechim**: 
- `front-main/components/search/SearchResults.tsx` ga kategoriya filtri qo'shildi
- `toLowerCase()` xatoligi tuzatildi

### 4. Hero Slider Yaxshilanishi
**Muammo**: Slider da kam kategoriyalar bor edi
**Yechim**: 
- 3 tadan 8 tagacha slayd qo'shildi
- Local rasmlar ishlatildi

### 5. CategoryShowcase Olib Tashlash
**Muammo**: Ekranda ko'rsatilgan kategoriyalar qismi keraksiz edi
**Yechim**: 
- `front-main/app/home/index.tsx` dan `<CategoryShowcase />` olib tashlandi

## 🛠️ Backend Setup

### PostgreSQL Installation
```bash
# PostgreSQL o'rnatish
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# PostgreSQL ishga tushirish
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Database va user yaratish
sudo -u postgres psql -c "CREATE DATABASE inbola_marketplace;"
sudo -u postgres psql -c "CREATE USER inbola_user WITH PASSWORD 'secure_password_123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE inbola_marketplace TO inbola_user;"
```

### Backend Environment Setup
```bash
cd backend-main

# .env fayl yaratish
echo 'DATABASE_URL="postgresql://inbola_user:secure_password_123@localhost:5432/inbola_marketplace?schema=public"' > .env

# Dependencies o'rnatish
npm install

# Prisma setup
npx prisma generate
npx prisma db push

# Seed data
npm run seed
```

### Backend Server Ishga Tushirish
```bash
cd backend-main
npm run dev
```

## 🎨 Frontend Setup

### Environment Variables
```bash
cd front-main

# .env.local yaratish
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local
```

### Frontend Server Ishga Tushirish
```bash
cd front-main
npm run dev
```

## 🔧 API Configuration Tuzatishlar

### 1. Instance Configuration
**Fayl**: `front-main/endpoints/instance.ts`

**O'zgarishlar**:
```typescript
// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Axios instance
const instance: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`, // Backend versioning bilan moslashtirildi
  timeout: 30000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Token qo'shish
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('accessToken'); // access_token dan accessToken ga
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
}
```

### 2. Product Endpoints
**Fayl**: `front-main/endpoints/product.ts`

**O'zgarishlar**:
```typescript
// API URL tuzatish
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const res = await axios.post(`${API_URL}/api/v1/product/create`, formData, {
```

## 📊 Database Schema

### PostgreSQL Afzalliklari E-commerce uchun:
1. **ACID Transactions**: Xavfsiz to'lov boshqaruvi
2. **Complex Queries**: Murakkab qidiruv va filtrlash
3. **JSON Support**: Mahsulot ma'lumotlari uchun
4. **Full-text Search**: Mahsulot qidiruv uchun
5. **Scalability**: Katta hajmli ma'lumotlar uchun
6. **Cost-effective**: Bepul va ochiq kod

### Test Data
- **Users**: Test va Admin foydalanuvchilar
- **Categories**: 8 ta kategoriya
- **Products**: 5 ta test mahsulot
- **Currency**: UZS
- **Brand**: INBOLA

## 🔧 Backend Yaxshilanishlar

### 1. Product Service Yaxshilanishi
- ✅ `getAllProduct` metodiga frontend uchun qo'shimcha ma'lumotlar qo'shildi
- ✅ Rating, review_count, seller_name, discount_percentage qo'shildi
- ✅ Safety_certified, educational_value qo'shildi
- ✅ Images array formatiga o'zgartirildi

### 2. Security Yaxshilanishlari
- ✅ Rate Limiting qo'shildi (100 request/minute, 1000 request/hour)
- ✅ CORS sozlamalari yaxshilandi
- ✅ Production URLlar qo'shildi
- ✅ Additional headers qo'shildi

### 3. Error Handling
- ✅ Global Exception Filter yaxshilandi
- ✅ Prisma error handling qo'shildi
- ✅ Uzbek tilida xatolik xabarlari

### 4. API Versioning
- ✅ Backend `/api/v1` prefix bilan ishlaydi
- ✅ Frontend API URL lar tuzatildi

## 🎯 Production Deployment

### 1. Server Requirements
```bash
# Ubuntu 20.04+ kerak
# Node.js 18+ kerak
# PostgreSQL 14+ kerak
# Nginx kerak
```

### 2. Environment Variables
```bash
# Backend .env
DATABASE_URL="postgresql://username:password@localhost:5432/inbola_marketplace?schema=public"
ACCESS_TOKEN_KEY=your-super-secret-access-token-key-here
ACCESS_TOKEN_TIME=15m
REFRESH_TOKEN_KEY=your-super-secret-refresh-token-key-here
REFRESH_TOKEN_TIME=7d
PORT=4000
HOST=0.0.0.0
NODE_ENV=production

# Frontend .env.local
NEXT_PUBLIC_API_URL=https://your-domain.com
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### 3. Database Setup
```bash
# Production database
sudo -u postgres psql -c "CREATE DATABASE inbola_marketplace_prod;"
sudo -u postgres psql -c "CREATE USER inbola_prod_user WITH PASSWORD 'strong_password_here';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE inbola_marketplace_prod TO inbola_prod_user;"
```

### 4. PM2 Setup
```bash
# PM2 o'rnatish
npm install -g pm2

# Backend ishga tushirish
cd backend-main
pm2 start ecosystem.config.js

# Frontend build va ishga tushirish
cd front-main
npm run build
pm2 start ecosystem.config.js
```

### 5. Nginx Configuration
```nginx
# /etc/nginx/sites-available/inbola
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # GraphQL
    location /graphql {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔍 Testing

### 1. Backend Health Check
```bash
curl -s http://localhost:4000/health
```

### 2. API Documentation
```bash
# Swagger docs
http://localhost:4000/api-docs
```

### 3. Database Connection
```bash
# PostgreSQL connection test
psql -h localhost -U inbola_user -d inbola_marketplace
```

### 4. Frontend Test
```bash
# Frontend ishga tushganini tekshirish
curl -s http://localhost:3000
```

## 📝 Muhim Eslatmalar

### 1. Security
- JWT tokenlarni xavfsiz saqlang
- Database parollarini kuchli qiling
- HTTPS ishlatish majburiy
- CORS sozlamalarini to'g'ri qiling

### 2. Performance
- Redis caching qo'shish
- Image optimization
- Database indekslar
- CDN ishlatish

### 3. Monitoring
- PM2 monitoring
- Database monitoring
- Error logging
- Performance metrics

### 4. Backup
- Database backup
- File backup
- Code backup
- Configuration backup

## 🎉 Natija

✅ **Backend**: NestJS + PostgreSQL + Prisma
✅ **Frontend**: Next.js + TypeScript + SCSS
✅ **Database**: PostgreSQL production ready
✅ **API**: REST + GraphQL
✅ **Authentication**: JWT
✅ **File Upload**: Multer
✅ **Real-time**: WebSocket
✅ **Documentation**: Swagger
✅ **Deployment**: PM2 + Nginx

**INBOLA Kids Marketplace - Production Ready!** 🚀
