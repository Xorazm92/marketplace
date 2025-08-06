#!/bin/bash

# ===========================================
# 🚀 INBOLA Marketplace - Quick Start Script
# ===========================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 INBOLA Marketplace - Quick Start${NC}"
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

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js topilmadi! Iltimos Node.js o'rnating."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm topilmadi! Iltimos npm o'rnating."
    exit 1
fi

print_status "Node.js va npm mavjud"

echo -e "${BLUE}📦 Step 1: Dependencies o'rnatish${NC}"

# Install root dependencies
npm install
print_status "Root dependencies o'rnatildi"

# Install backend dependencies
cd backend-main && npm install && cd ..
print_status "Backend dependencies o'rnatildi"

# Install frontend dependencies
cd front-main && npm install && cd ..
print_status "Frontend dependencies o'rnatildi"

echo -e "${BLUE}⚙️ Step 2: Environment sozlash${NC}"

# Copy environment files if they don't exist
if [ ! -f "backend-main/.env" ]; then
    cp backend-main/.env.example backend-main/.env 2>/dev/null || echo "# Development Environment" > backend-main/.env
    print_warning "backend-main/.env yaratildi - iltimos sozlamalarni tekshiring"
fi

if [ ! -f "front-main/.env.local" ]; then
    echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > front-main/.env.local
    echo "NEXT_PUBLIC_BASE_URL=http://localhost:3000" >> front-main/.env.local
    print_status "front-main/.env.local yaratildi"
fi

echo -e "${BLUE}🗄️ Step 3: Database sozlash${NC}"

# Generate Prisma client and run migrations
cd backend-main
npx prisma generate
print_status "Prisma client generated"

npx prisma migrate dev --name init
print_status "Database migration bajarildi"

npm run seed
print_status "Test ma'lumotlar yuklandi"

cd ..

echo -e "${BLUE}🏗️ Step 4: Build qilish${NC}"

# Build backend
cd backend-main && npm run build && cd ..
print_status "Backend build tugadi"

# Build frontend
cd front-main && npm run build && cd ..
print_status "Frontend build tugadi"

echo -e "${BLUE}🚀 Step 5: PM2 bilan ishga tushirish${NC}"

# Install PM2 locally if not installed globally
if ! command -v pm2 &> /dev/null; then
    npm install pm2 --save-dev
    print_status "PM2 local o'rnatildi"
    PM2_CMD="npx pm2"
else
    PM2_CMD="pm2"
fi

# Create logs directory
mkdir -p logs

# Start with PM2
$PM2_CMD start ecosystem.config.js --env development
print_status "PM2 bilan ishga tushirildi"

echo -e "${BLUE}🏥 Step 6: Health check${NC}"

sleep 5

# Check backend
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    print_status "Backend ishlamoqda (http://localhost:3001)"
else
    print_warning "Backend ishlamayapti - logs ni tekshiring: $PM2_CMD logs"
fi

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_status "Frontend ishlamoqda (http://localhost:3000)"
else
    print_warning "Frontend ishlamayapti - logs ni tekshiring: $PM2_CMD logs"
fi

echo "=================================================="
echo -e "${GREEN}🎉 INBOLA MARKETPLACE TAYYOR!${NC}"
echo ""
echo -e "${BLUE}📋 Kirish ma'lumotlari:${NC}"
echo "• Frontend: http://localhost:3000"
echo "• Backend API: http://localhost:3001"
echo "• GraphQL: http://localhost:3001/graphql"
echo "• Health: http://localhost:3001/health"
echo ""
echo -e "${BLUE}👤 Test accounts:${NC}"
echo "• User: +998901234567 / parol: 123456"
echo "• Admin: +998909876543 / parol: 123456"
echo ""
echo -e "${BLUE}🔧 PM2 buyruqlari:${NC}"
echo "• Status: $PM2_CMD status"
echo "• Logs: $PM2_CMD logs"
echo "• Restart: $PM2_CMD restart all"
echo "• Stop: $PM2_CMD stop all"
echo ""
echo -e "${GREEN}✅ Loyiha muvaffaqiyatli ishga tushdi!${NC}"
echo "=================================================="
