#!/bin/bash

# INBOLA Production Deployment Script
# Bu script loyihani to'liq production ga deploy qiladi

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

print_step() {
    echo -e "${BLUE}🔄 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Main deployment function
main() {
    print_header "🚀 INBOLA Production Deployment"
    
    echo -e "${CYAN}"
    cat << "EOF"
    ██╗███╗   ██╗██████╗  ██████╗ ██╗      █████╗ 
    ██║████╗  ██║██╔══██╗██╔═══██╗██║     ██╔══██╗
    ██║██╔██╗ ██║██████╔╝██║   ██║██║     ███████║
    ██║██║╚██╗██║██╔══██╗██║   ██║██║     ██╔══██║
    ██║██║ ╚████║██████╔╝╚██████╔╝███████╗██║  ██║
    ╚═╝╚═╝  ╚═══╝╚═════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝
    
    Kids Marketplace - Production Deployment
EOF
    echo -e "${NC}"
    
    # Step 1: Stop development services
    print_header "🛑 Development servicelarni to'xtatish"
    
    print_step "Development containerlarni to'xtatish..."
    docker-compose down || true
    
    print_step "Development processlarni to'xtatish..."
    pkill -f "npm run dev" || true
    pkill -f "npm run start:dev" || true
    
    print_success "Development servicelar to'xtatildi"
    
    # Step 2: Clean up
    print_header "🧹 Tozalash"
    
    print_step "Docker cache tozalash..."
    docker system prune -f
    
    print_step "Node modules tozalash..."
    rm -rf backend-main/node_modules/.cache || true
    rm -rf front-main/.next || true
    
    print_success "Tozalash tugallandi"
    
    # Step 3: Build applications
    print_header "🏗️ Ilovalarni build qilish"
    
    # Backend build
    print_step "Backend dependencies o'rnatish..."
    cd backend-main
    npm ci --only=production
    
    print_step "Prisma client generate..."
    npx prisma generate
    
    print_step "Backend build..."
    npm run build
    
    print_success "Backend build tugallandi"
    cd ..
    
    # Frontend build
    print_step "Frontend dependencies o'rnatish..."
    cd front-main
    npm ci --only=production
    
    print_step "Frontend build..."
    npm run build
    
    print_success "Frontend build tugallandi"
    cd ..
    
    # Step 4: Database setup
    print_header "🗄️ Database setup"
    
    print_step "Production database ishga tushirish..."
    docker-compose -f docker-compose.prod.yml up -d postgres redis
    
    print_step "Database tayyor bo'lishini kutish..."
    sleep 20
    
    print_step "Database migrations..."
    cd backend-main
    npx prisma migrate deploy
    
    print_step "Database optimizatsiyalari..."
    if [ -f "prisma/migrations/production_optimization.sql" ]; then
        npx prisma db execute --file prisma/migrations/production_optimization.sql
        print_success "Database optimizatsiyalari qo'llandi"
    fi
    
    print_step "Test ma'lumotlar qo'shish..."
    npx prisma db seed || print_warning "Seed script xatosi"
    
    print_success "Database setup tugallandi"
    cd ..
    
    # Step 5: Production deployment
    print_header "🐳 Production deployment"
    
    print_step "Production containerlar ishga tushirish..."
    docker-compose -f docker-compose.prod.yml up -d --build
    
    print_step "Servicelar ishga tushishini kutish..."
    sleep 30
    
    print_success "Production deployment tugallandi"
    
    # Step 6: Health checks
    print_header "🏥 Health checks"
    
    print_step "Backend health check..."
    for i in {1..10}; do
        if curl -f http://localhost:3001/health > /dev/null 2>&1; then
            print_success "Backend health check muvaffaqiyatli"
            break
        else
            print_step "Backend health check urinish $i/10..."
            sleep 5
        fi
        
        if [ $i -eq 10 ]; then
            print_error "Backend health check muvaffaqiyatsiz!"
            exit 1
        fi
    done
    
    print_step "Frontend health check..."
    for i in {1..10}; do
        if curl -f http://localhost:3000 > /dev/null 2>&1; then
            print_success "Frontend health check muvaffaqiyatli"
            break
        else
            print_step "Frontend health check urinish $i/10..."
            sleep 5
        fi
        
        if [ $i -eq 10 ]; then
            print_error "Frontend health check muvaffaqiyatsiz!"
            exit 1
        fi
    done
    
    # Step 7: API tests
    print_header "🧪 API testlari"
    
    print_step "Kategoriyalar seed qilish..."
    curl -X POST http://localhost:3001/api/v1/category/seed || print_warning "Category seed xatosi"
    
    print_step "Brendlar seed qilish..."
    curl -X POST http://localhost:3001/api/v1/brand/seed || print_warning "Brand seed xatosi"
    
    print_step "Valyutalar seed qilish..."
    curl -X POST http://localhost:3001/api/v1/currency/seed || print_warning "Currency seed xatosi"
    
    print_success "API testlari tugallandi"
    
    # Step 8: SSL setup (if certificates exist)
    print_header "🔒 SSL setup"
    
    if [ -d "ssl" ] && [ -f "ssl/inbola.uz.crt" ] && [ -f "ssl/inbola.uz.key" ]; then
        print_step "SSL sertifikatlar topildi"
        print_success "SSL konfiguratsiyasi tayyor"
    else
        print_warning "SSL sertifikatlar topilmadi"
        print_step "SSL sertifikatlarni olish uchun:"
        echo "  sudo certbot certonly --standalone -d inbola.uz -d www.inbola.uz"
        echo "  mkdir -p ssl"
        echo "  sudo cp /etc/letsencrypt/live/inbola.uz/fullchain.pem ssl/inbola.uz.crt"
        echo "  sudo cp /etc/letsencrypt/live/inbola.uz/privkey.pem ssl/inbola.uz.key"
    fi
    
    # Success message
    print_header "🎉 Deployment muvaffaqiyatli tugallandi!"
    
    echo -e "${GREEN}"
    echo "✅ INBOLA loyihasi muvaffaqiyatli production ga deploy qilindi!"
    echo ""
    echo "🌐 Production URLs:"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend API: http://localhost:3001"
    echo "   - Health Check: http://localhost:3001/health"
    echo ""
    echo "📊 Monitoring:"
    echo "   - Loglarni ko'rish: docker-compose -f docker-compose.prod.yml logs -f"
    echo "   - Servicelar holati: docker-compose -f docker-compose.prod.yml ps"
    echo ""
    echo "🔧 Management:"
    echo "   - Restart: docker-compose -f docker-compose.prod.yml restart"
    echo "   - Stop: docker-compose -f docker-compose.prod.yml down"
    echo "   - Update: git pull && ./deploy-production.sh"
    echo ""
    echo "🔒 SSL Setup (agar kerak bo'lsa):"
    echo "   - Sertifikat olish: sudo certbot certonly --standalone -d inbola.uz"
    echo "   - Nginx restart: docker-compose -f docker-compose.prod.yml restart nginx"
    echo ""
    echo "🚨 Emergency:"
    echo "   - Rollback: ./rollback.sh"
    echo "   - Logs: docker-compose -f docker-compose.prod.yml logs --tail=100"
    echo -e "${NC}"
    
    # Open browser
    print_step "Browser ochilmoqda..."
    if command -v xdg-open > /dev/null; then
        xdg-open http://localhost:3000 &
    elif command -v open > /dev/null; then
        open http://localhost:3000 &
    fi
}

# Run main function
main "$@"
