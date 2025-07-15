#!/bin/bash

# INBOLA Production Deployment Script
# Bu script loyihani production serverga deploy qiladi

set -e

echo "🚀 INBOLA Production Deployment boshlandi..."

# Environment variables check
if [ ! -f ".env.prod" ]; then
    echo "❌ .env.prod fayli topilmadi!"
    echo "Iltimos .env.prod faylini yarating va kerakli o'zgaruvchilarni kiriting."
    exit 1
fi

# Load environment variables
source .env.prod

echo "📋 Environment variables yuklandi"

# Backup current database (if exists)
echo "💾 Database backup yaratilmoqda..."
if docker ps | grep -q inbola_postgres; then
    docker exec inbola_postgres pg_dump -U inbola_user inbola_db > "backup_$(date +%Y%m%d_%H%M%S).sql"
    echo "✅ Database backup yaratildi"
fi

# Stop existing containers
echo "🛑 Mavjud containerlarni to'xtatish..."
docker-compose -f docker-compose.prod.yml down

# Pull latest images
echo "📥 Docker images yangilanmoqda..."
docker-compose -f docker-compose.prod.yml pull

# Build new images
echo "🔨 Yangi images build qilinmoqda..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Start services
echo "🚀 Servicelar ishga tushirilmoqda..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "⏳ Servicelarning tayyor bo'lishini kutish..."
sleep 30

# Run database migrations
echo "🗄️ Database migrations ishga tushirilmoqda..."
docker exec inbola_backend npx prisma migrate deploy

# Generate Prisma client
echo "🔧 Prisma client generate qilinmoqda..."
docker exec inbola_backend npx prisma generate

# Seed database (if needed)
if [ "$SEED_DATABASE" = "true" ]; then
    echo "🌱 Database seed qilinmoqda..."
    docker exec inbola_backend npm run seed
fi

# Health check
echo "🏥 Health check..."
sleep 10

# Check backend health
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend ishlamoqda"
else
    echo "❌ Backend ishlamayapti!"
    docker-compose -f docker-compose.prod.yml logs backend
    exit 1
fi

# Check frontend health
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend ishlamoqda"
else
    echo "❌ Frontend ishlamayapti!"
    docker-compose -f docker-compose.prod.yml logs frontend
    exit 1
fi

# Clean up old images
echo "🧹 Eski Docker images tozalanmoqda..."
docker image prune -f

echo "🎉 INBOLA muvaffaqiyatli deploy qilindi!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3001"
echo "📊 Logs ko'rish: docker-compose -f docker-compose.prod.yml logs -f"

# Show running containers
echo "📋 Ishlaydigan containerlar:"
docker-compose -f docker-compose.prod.yml ps
