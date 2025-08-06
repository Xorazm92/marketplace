# 🚀 INBOLA Marketplace - Server Deployment Guide

## 📋 Serverda Ishga Tushirish Qo'llanmasi

### 🔧 **1. Serverda Clone Qilish**

```bash
# Repository ni clone qiling
git clone https://github.com/Xorazm92/marketplace.git
cd marketplace
```

### ⚙️ **2. Environment Sozlash**

```bash
# Backend environment
cp backend-main/.env.example backend-main/.env
# Kerakli qiymatlarni o'zgartiring

# Frontend environment  
cp front-main/.env.local.example front-main/.env.local
# Kerakli qiymatlarni o'zgartiring
```

### 📦 **3. Dependencies O'rnatish**

```bash
# Root dependencies
npm install

# Backend dependencies
cd backend-main && npm install && cd ..

# Frontend dependencies
cd front-main && npm install && cd ..
```

### 🗄️ **4. Database Sozlash**

```bash
# PostgreSQL database yaratish (agar kerak bo'lsa)
# Yoki SQLite uchun:
cd backend-main
npx prisma generate
npx prisma migrate dev --name init
npm run seed
cd ..
```

### 🏗️ **5. Build Qilish**

```bash
# Backend build
cd backend-main && npm run build && cd ..

# Frontend build
cd front-main && npm run build && cd ..
```

### 🚀 **6. PM2 bilan Ishga Tushirish**

```bash
# PM2 o'rnatish (agar yo'q bo'lsa)
npm install -g pm2

# Loyihani ishga tushirish
pm2 start ecosystem.config.js --env production

# PM2 status ko'rish
pm2 status

# PM2 logs ko'rish
pm2 logs
```

### 🌐 **7. Kirish URL lari**

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **GraphQL:** http://localhost:3001/graphql
- **Health Check:** http://localhost:3001/health

### 👤 **8. Test Accounts**

- **User:** +998901234567 / parol: 123456
- **Admin:** +998909876543 / parol: 123456

### 🔧 **9. PM2 Buyruqlari**

```bash
# Status ko'rish
pm2 status

# Restart qilish
pm2 restart all

# Stop qilish
pm2 stop all

# Logs ko'rish
pm2 logs

# Monitoring
pm2 monit
```

### 🛠️ **10. Troubleshooting**

```bash
# Agar xatolik bo'lsa, logs ni tekshiring
pm2 logs

# Database muammosi bo'lsa
cd backend-main
npx prisma migrate reset
npm run seed

# Port band bo'lsa
sudo lsof -i :3000
sudo lsof -i :3001
```

### 📝 **11. Production Sozlamalar**

1. **Environment fayllarni to'g'ri sozlang**
2. **Database parollarini o'zgartiring**
3. **JWT secret keylarni yangilang**
4. **CORS sozlamalarini tekshiring**
5. **SSL sertifikat o'rnating (agar kerak bo'lsa)**

---

## ✅ **Muvaffaqiyatli Deployment!**

Loyiha tayyor va ishlamoqda! 🎉
