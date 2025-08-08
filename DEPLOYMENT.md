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
### 🤖 **CI/CD Pipeline**

The project uses GitHub Actions to automate testing, building, and deployment:

- **`.github/workflows/ci.yml`** – Runs unit tests and builds the project on every push and pull request.
- **`.github/workflows/ci-cd.yml`** – Executes comprehensive backend and frontend test suites, security scans, optional load testing, and deploys to staging or production environments based on the branch.

You can view the status of the workflows in the **Actions** tab of the repository. Successful runs will automatically trigger deployments to the configured environments.

---

### 🚀 **Quick Start with Docker Compose**

To quickly spin up the entire application stack, run:

```bash
docker-compose up -d
```

This will start the PostgreSQL, Redis, backend, and frontend services in detached mode. You can then access the application at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- GraphQL: http://localhost:3001/graphql

To stop the services, run:

```bash
docker-compose down
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

### 🌐 **12. Nginx va SSL Sozlash (Production)**

```bash
# Nginx o'rnatish
sudo apt install nginx

# Development uchun
sudo cp nginx-inbola-development.conf /etc/nginx/sites-available/inbola
sudo ln -s /etc/nginx/sites-available/inbola /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

# Production uchun SSL bilan
sudo chmod +x setup-ssl.sh
sudo ./setup-ssl.sh
```

### 🔒 **13. SSL Sertifikat (Let's Encrypt)**

```bash
# Avtomatik SSL setup
sudo ./setup-ssl.sh

# Manual SSL setup
sudo certbot --nginx -d inbola.uz -d www.inbola.uz -d api.inbola.uz
```

### 🔧 **14. Nginx Konfiguratsiya Fayllar**

- **Development:** `nginx-inbola-development.conf`
- **Production:** `nginx-inbola-production.conf`
- **SSL Setup:** `setup-ssl.sh`

### 🌍 **15. Domain Sozlamalari**

DNS A record lar:
```
inbola.uz       A    YOUR_SERVER_IP
www.inbola.uz   A    YOUR_SERVER_IP
api.inbola.uz   A    YOUR_SERVER_IP
admin.inbola.uz A    YOUR_SERVER_IP
```

### 🔥 **16. Firewall Sozlamalari**

```bash
# UFW firewall
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

---

## ✅ **Muvaffaqiyatli Deployment!**

Loyiha tayyor va ishlamoqda! 🎉

### 🌐 **Production URLs:**
- **Main Site:** https://inbola.uz
- **API:** https://api.inbola.uz
- **Admin:** https://admin.inbola.uz
- **GraphQL:** https://api.inbola.uz/graphql
