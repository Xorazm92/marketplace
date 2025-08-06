#!/bin/bash

# ===========================================
# 🖥️ DEBIAN SERVER - INBOLA MARKETPLACE SETUP
# ===========================================
# Server kompyuteringizda ishga tushirish uchun
# Author: INBOLA Development Team
# Version: 1.0.0

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🖥️ INBOLA Marketplace - Server Setup${NC}"
echo "=================================================="

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as regular user
if [[ $EUID -eq 0 ]]; then
   print_error "Bu skriptni root user sifatida ishlatmang! Regular user bilan ishga tushiring."
   exit 1
fi

echo -e "${BLUE}📦 Step 1: Sistema yangilash va dasturlar o'rnatish${NC}"

# System update
sudo apt update && sudo apt upgrade -y
print_status "Sistema yangilandi"

# Install required packages
sudo apt install -y \
    curl \
    wget \
    git \
    nginx \
    postgresql \
    postgresql-contrib \
    redis-server \
    nodejs \
    npm \
    certbot \
    python3-certbot-nginx \
    ufw \
    htop \
    build-essential

print_status "Barcha dasturlar o'rnatildi"

# Install PM2
sudo npm install -g pm2
print_status "PM2 o'rnatildi"

echo -e "${BLUE}🔥 Step 2: Firewall sozlash${NC}"

# Configure firewall
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

print_status "Firewall sozlandi"

echo -e "${BLUE}🗄️ Step 3: PostgreSQL sozlash${NC}"

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE USER inbola_user WITH PASSWORD 'InBoLa_Pr0d_DB_P@ssw0rd_2024_Secure!';
CREATE DATABASE inbola_db OWNER inbola_user;
GRANT ALL PRIVILEGES ON DATABASE inbola_db TO inbola_user;
\q
EOF

print_status "PostgreSQL sozlandi"

echo -e "${BLUE}🔴 Step 4: Redis sozlash${NC}"

# Configure Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Set Redis password
sudo sed -i 's/# requirepass foobared/requirepass InBoLa_R3d1s_Pr0d_P@ssw0rd_2024_S3cur3!/' /etc/redis/redis.conf
sudo systemctl restart redis-server

print_status "Redis sozlandi"

echo -e "${BLUE}🌐 Step 5: Nginx sozlash${NC}"

# Copy nginx configuration
sudo cp nginx-inbola.conf /etc/nginx/sites-available/inbola.uz

# Enable site
sudo ln -sf /etc/nginx/sites-available/inbola.uz /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Start nginx
sudo systemctl start nginx
sudo systemctl enable nginx

print_status "Nginx sozlandi"

echo -e "${BLUE}📦 Step 6: Loyiha dependencies o'rnatish${NC}"

# Backend dependencies
cd backend-main
npm install --production
print_status "Backend dependencies o'rnatildi"

# Frontend dependencies  
cd ../front-main
npm install
print_status "Frontend dependencies o'rnatildi"

cd ..

echo -e "${BLUE}🔄 Step 7: PostgreSQL ga o'tish${NC}"

# Update Prisma schema to PostgreSQL
sed -i 's/provider = "sqlite"/provider = "postgresql"/' backend-main/prisma/schema.prisma

# Copy production environment
cp .env.prod backend-main/.env

# Generate Prisma client
cd backend-main
npx prisma generate

# Run migrations
npx prisma migrate deploy

print_status "PostgreSQL ga muvaffaqiyatli o'tildi"

cd ..

echo -e "${BLUE}🏗️ Step 8: Production build${NC}"

# Build backend
cd backend-main
npm run build
print_status "Backend build tugadi"

# Build frontend
cd ../front-main

# Create production environment for frontend
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://inbola.uz/api
NEXT_PUBLIC_BASE_URL=https://inbola.uz
EOF

npm run build
print_status "Frontend build tugadi"

cd ..

echo -e "${BLUE}🚀 Step 9: PM2 bilan ishga tushirish${NC}"

# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
print_warning "PM2 startup buyrug'ini ishga tushiring (yuqorida ko'rsatilgan buyruq)"

print_status "PM2 bilan ishga tushirildi"

echo -e "${BLUE}🏥 Step 10: Health check${NC}"

sleep 10

# Check services
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    print_status "Backend ishlamoqda"
else
    print_error "Backend ishlamayapti"
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_status "Frontend ishlamoqda"
else
    print_error "Frontend ishlamayapti"
fi

echo "=================================================="
echo -e "${GREEN}🎉 SERVER SETUP TUGADI!${NC}"
echo ""
echo -e "${BLUE}📋 Keyingi qadamlar:${NC}"
echo "1. DNS: inbola.uz ni bu server IP ga yo'naltiring"
echo "2. Router: Port 80 va 443 ni forward qiling"
echo "3. SSL: sudo certbot --nginx -d inbola.uz -d www.inbola.uz"
echo "4. Test: http://inbola.uz"
echo ""
echo -e "${BLUE}📊 Monitoring:${NC}"
echo "• PM2 status: pm2 status"
echo "• PM2 logs: pm2 logs"
echo "• PM2 monit: pm2 monit"
echo ""
echo -e "${GREEN}✅ Sizning INBOLA Marketplace tayyor!${NC}"
echo "=================================================="
