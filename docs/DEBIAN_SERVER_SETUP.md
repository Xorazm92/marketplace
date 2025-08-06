# 🖥️ DEBIAN NOUTBUK SERVER - To'liq Professional Setup

## 📋 Sizning Vaziyatingiz
- 💻 Debian noutbuk (doimiy server)
- 🏠 Mahalliy tarmoq (router orqali)
- 🌐 inbola.uz domain
- 🔄 24/7 ishlaydigan server

## 🚀 1. DEBIAN SERVER TAYYORLASH

### A) Asosiy Dasturlarni O'rnatish
```bash
# Sistema yangilash
sudo apt update && sudo apt upgrade -y

# Zaruriy dasturlar
sudo apt install -y curl wget git nginx postgresql postgresql-contrib redis-server nodejs npm certbot python3-certbot-nginx ufw htop

# PM2 (process manager)
sudo npm install -g pm2

# Node.js 18 (agar eski versiya bo'lsa)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### B) Firewall Sozlash
```bash
# UFW yoqish
sudo ufw enable

# Portlarni ochish
sudo ufw allow ssh
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 3000/tcp # Frontend (vaqtinchalik)
sudo ufw allow 3001/tcp # Backend (vaqtinchalik)

# Holat tekshirish
sudo ufw status
```

### C) PostgreSQL Sozlash
```bash
# PostgreSQL ishga tushirish
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Database yaratish
sudo -u postgres psql
CREATE USER inbola_user WITH PASSWORD 'InBoLa_Pr0d_DB_P@ssw0rd_2024_Secure!';
CREATE DATABASE inbola_db OWNER inbola_user;
GRANT ALL PRIVILEGES ON DATABASE inbola_db TO inbola_user;
\q
```

### D) Redis Sozlash
```bash
# Redis ishga tushirish
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Redis parol o'rnatish
sudo nano /etc/redis/redis.conf
# Quyidagi qatorni toping va o'zgartiring:
# requirepass InBoLa_R3d1s_Pr0d_P@ssw0rd_2024_S3cur3!

sudo systemctl restart redis-server
```

## 🌐 2. NGINX SOZLASH (1 Domain Variant)

### A) Nginx Konfiguratsiya Fayli
```bash
sudo nano /etc/nginx/sites-available/inbola.uz
```

```nginx
# /etc/nginx/sites-available/inbola.uz
server {
    listen 80;
    server_name inbola.uz www.inbola.uz;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # GraphQL
    location /graphql {
        proxy_pass http://localhost:3001/graphql;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Let's Encrypt challenge
    location ~ /.well-known/acme-challenge/ {
        allow all;
        root /var/www/html;
    }
}
```

### B) Nginx Faollashtirish
```bash
# Konfiguratsiyani faollashtirish
sudo ln -s /etc/nginx/sites-available/inbola.uz /etc/nginx/sites-enabled/

# Default saytni o'chirish
sudo rm /etc/nginx/sites-enabled/default

# Nginx test qilish
sudo nginx -t

# Nginx qayta ishga tushirish
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 🔒 3. SSL SERTIFIKAT (Let's Encrypt)

### A) Router Port Forwarding
**MUHIM**: Routeringizda quyidagi portlarni forward qiling:
```
External Port 80 → Internal IP:80 (sizning noutbuk IP)
External Port 443 → Internal IP:443 (sizning noutbuk IP)
```

### B) DNS Sozlash
Domain provideringizda:
```
Type: A
Name: @
Value: [Sizning Public IP]

Type: A  
Name: www
Value: [Sizning Public IP]
```

### C) SSL Sertifikat Olish
```bash
# Let's Encrypt SSL
sudo certbot --nginx -d inbola.uz -d www.inbola.uz

# Avtomatik yangilanish
sudo crontab -e
# Quyidagi qatorni qo'shing:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🚀 4. LOYIHANI PRODUCTION GA TAYYORLASH

### A) PostgreSQL ga O'tish
```bash
cd /home/ubuntu/Documents/marketplace

# Production environment
cp .env.prod .env
cp .env.prod backend-main/.env

# Prisma schema PostgreSQL ga o'zgartirish
cd backend-main
# schema.prisma da provider = "postgresql" bo'lishi kerak

# Prisma client generate
npx prisma generate

# Migration
npx prisma migrate deploy

# Seed (agar kerak bo'lsa)
npm run seed
```

### B) Frontend Environment Sozlash
```bash
cd front-main

# .env.local yaratish
echo "NEXT_PUBLIC_API_URL=https://inbola.uz/api" > .env.local
echo "NEXT_PUBLIC_BASE_URL=https://inbola.uz" >> .env.local

# Production build
npm run build
```

### C) Backend Environment Sozlash
```bash
cd backend-main

# .env faylini yangilash
nano .env
```

```bash
# Production Environment
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://inbola_user:InBoLa_Pr0d_DB_P@ssw0rd_2024_Secure!@localhost:5432/inbola_db"
REDIS_URL="redis://:InBoLa_R3d1s_Pr0d_P@ssw0rd_2024_S3cur3!@localhost:6379"

# JWT Secrets (O'ZGARTIRING!)
ACCESS_TOKEN_KEY="your_super_secure_64_char_access_token_key_for_production_2024"
REFRESH_TOKEN_KEY="your_super_secure_64_char_refresh_token_key_for_production_2024"

# URLs
FRONTEND_URL="https://inbola.uz"
CORS_ORIGINS="https://inbola.uz,https://www.inbola.uz"

# Payment (haqiqiy ma'lumotlar)
CLICK_SERVICE_ID="your_real_click_service_id"
CLICK_MERCHANT_ID="your_real_click_merchant_id"
CLICK_SECRET_KEY="your_real_click_secret_key"

PAYME_MERCHANT_ID="your_real_payme_merchant_id"
PAYME_SECRET_KEY="your_real_payme_secret_key"

# SMS Service
SMS_TOKEN="your_real_sms_token"

# Email
SMTP_USER="noreply@inbola.uz"
SMTP_PASS="your_email_app_password"
```

## 🔄 5. PM2 BILAN DOIMIY ISHLATISH

### A) PM2 Konfiguratsiya
```bash
cd /home/ubuntu/Documents/marketplace

# ecosystem.config.js yaratish
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'inbola-backend',
      cwd: './backend-main',
      script: 'npm',
      args: 'run start:prod',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'inbola-frontend',
      cwd: './front-main',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    }
  ]
};
```

### B) PM2 Ishga Tushirish
```bash
# Log papkasini yaratish
mkdir -p logs

# PM2 bilan ishga tushirish
pm2 start ecosystem.config.js

# PM2 ni sistem bilan birga ishga tushirish
pm2 startup
pm2 save

# Monitoring
pm2 monit
```

## 🔍 6. MONITORING VA BACKUP

### A) Monitoring Skripti
```bash
# monitoring.sh yaratish
nano monitoring.sh
```

```bash
#!/bin/bash
# System monitoring
echo "=== $(date) ===" >> /var/log/inbola-monitor.log
echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')" >> /var/log/inbola-monitor.log
echo "RAM: $(free -m | awk 'NR==2{printf "%.2f%%", $3*100/$2 }')" >> /var/log/inbola-monitor.log
echo "Disk: $(df -h | awk '$NF=="/"{printf "%s", $5}')" >> /var/log/inbola-monitor.log
pm2 status >> /var/log/inbola-monitor.log
echo "==================" >> /var/log/inbola-monitor.log
```

```bash
chmod +x monitoring.sh

# Crontab ga qo'shish (har 10 daqiqada)
crontab -e
*/10 * * * * /home/ubuntu/Documents/marketplace/monitoring.sh
```

### B) Backup Skripti
```bash
# backup.sh yaratish
nano backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"

mkdir -p $BACKUP_DIR

# Database backup
pg_dump -U inbola_user -h localhost inbola_db > $BACKUP_DIR/db_backup_$DATE.sql

# Files backup
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz backend-main/uploads/

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE" >> /var/log/inbola-backup.log
```

```bash
chmod +x backup.sh

# Har kuni soat 2:00 da backup
crontab -e
0 2 * * * /home/ubuntu/Documents/marketplace/backup.sh
```

## ✅ 7. FINAL CHECKLIST

- [ ] PostgreSQL o'rnatildi va sozlandi
- [ ] Redis o'rnatildi va sozlandi  
- [ ] Nginx sozlandi
- [ ] Router port forwarding sozlandi
- [ ] DNS sozlandi
- [ ] SSL sertifikat olindi
- [ ] Loyiha PostgreSQL ga o'tkazildi
- [ ] PM2 bilan doimiy ishlatish sozlandi
- [ ] Monitoring va backup sozlandi

## 🎉 NATIJA

Sizning Debian noutbukingiz professional server bo'ldi:
- 🌐 https://inbola.uz - To'liq ishlaydigan marketplace
- 🔒 SSL sertifikat bilan xavfsiz
- 🔄 24/7 avtomatik ishlaydigan
- 📊 Monitoring va backup bilan
- 💰 Hech qanday oylik to'lov yo'q!

**Domain**: Faqat 1 ta `inbola.uz` yetarli (frontend + backend birgalikda)
