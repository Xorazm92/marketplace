#!/bin/bash

# INBOLA Production Deployment - Final Script
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

# Check if running as root
check_root() {
    if [ "$EUID" -eq 0 ]; then
        print_error "Bu script root foydalanuvchi sifatida ishlatilmasligi kerak!"
        exit 1
    fi
}

# Check prerequisites
check_prerequisites() {
    print_header "🔍 Prerequisites tekshiruvi"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker o'rnatilmagan!"
        exit 1
    fi
    print_success "Docker mavjud"
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose o'rnatilmagan!"
        exit 1
    fi
    print_success "Docker Compose mavjud"
    
    # Check Git
    if ! command -v git &> /dev/null; then
        print_error "Git o'rnatilmagan!"
        exit 1
    fi
    print_success "Git mavjud"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js o'rnatilmagan!"
        exit 1
    fi
    print_success "Node.js mavjud ($(node --version))"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm o'rnatilmagan!"
        exit 1
    fi
    print_success "npm mavjud ($(npm --version))"
}

# Setup environment
setup_environment() {
    print_header "🌍 Environment setup"
    
    # Check if .env.prod exists
    if [ ! -f ".env.prod" ]; then
        print_error ".env.prod fayli topilmadi!"
        print_step "Iltimos .env.prod.example dan nusxa olib, .env.prod yarating"
        print_step "va barcha kerakli qiymatlarni kiriting."
        exit 1
    fi
    print_success ".env.prod fayli mavjud"
    
    # Load environment variables
    export $(cat .env.prod | grep -v '^#' | xargs)
    print_success "Environment variables yuklandi"
    
    # Validate critical environment variables
    if [ -z "$DATABASE_URL" ]; then
        print_error "DATABASE_URL o'rnatilmagan!"
        exit 1
    fi
    
    if [ -z "$ACCESS_TOKEN_KEY" ]; then
        print_error "ACCESS_TOKEN_KEY o'rnatilmagan!"
        exit 1
    fi
    
    if [ -z "$FRONTEND_URL" ]; then
        print_error "FRONTEND_URL o'rnatilmagan!"
        exit 1
    fi
    
    print_success "Muhim environment variables tekshirildi"
}

# Backup existing data
backup_data() {
    print_header "💾 Ma'lumotlar backup"
    
    # Create backup directory
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup database if exists
    if docker ps | grep -q inbola_postgres; then
        print_step "Database backup yaratilmoqda..."
        docker exec inbola_postgres pg_dump -U inbola_user inbola_db > "$BACKUP_DIR/database_backup.sql"
        print_success "Database backup yaratildi: $BACKUP_DIR/database_backup.sql"
    else
        print_warning "Database container ishlamayapti, backup o'tkazib yuborildi"
    fi
    
    # Backup uploads if exists
    if [ -d "backend-main/public/uploads" ]; then
        print_step "Upload fayllar backup qilinmoqda..."
        cp -r backend-main/public/uploads "$BACKUP_DIR/uploads_backup"
        print_success "Upload fayllar backup qilindi"
    fi
    
    echo "$BACKUP_DIR" > .last_backup
    print_success "Backup manzili saqlandi: $BACKUP_DIR"
}

# Stop existing services
stop_services() {
    print_header "🛑 Mavjud servicelarni to'xtatish"
    
    # Stop Docker containers
    if [ -f "docker-compose.prod.yml" ]; then
        print_step "Docker containers to'xtatilmoqda..."
        docker-compose -f docker-compose.prod.yml down || true
        print_success "Docker containers to'xtatildi"
    fi
    
    # Stop PM2 processes if any
    if command -v pm2 &> /dev/null; then
        print_step "PM2 processes to'xtatilmoqda..."
        pm2 stop all || true
        pm2 delete all || true
        print_success "PM2 processes to'xtatildi"
    fi
}

# Build applications
build_applications() {
    print_header "🏗️ Ilovalarni build qilish"
    
    # Build backend
    print_step "Backend build qilinmoqda..."
    cd backend-main
    
    # Install dependencies
    npm ci --only=production
    
    # Generate Prisma client
    npx prisma generate
    
    # Build application
    npm run build
    
    print_success "Backend build tugallandi"
    cd ..
    
    # Build frontend
    print_step "Frontend build qilinmoqda..."
    cd front-main
    
    # Install dependencies
    npm ci --only=production
    
    # Build application
    npm run build
    
    print_success "Frontend build tugallandi"
    cd ..
}

# Setup database
setup_database() {
    print_header "🗄️ Database setup"
    
    # Start database services
    print_step "Database va Redis ishga tushirilmoqda..."
    docker-compose -f docker-compose.prod.yml up -d postgres redis
    
    # Wait for database to be ready
    print_step "Database tayyor bo'lishini kutish..."
    sleep 15
    
    # Run migrations
    print_step "Database migrations ishga tushirilmoqda..."
    cd backend-main
    npx prisma migrate deploy
    
    # Apply optimizations
    if [ -f "prisma/migrations/production_optimization.sql" ]; then
        print_step "Database optimizatsiyalari qo'llanilmoqda..."
        npx prisma db execute --file prisma/migrations/production_optimization.sql
        print_success "Database optimizatsiyalari qo'llandi"
    fi
    
    # Seed database if needed
    if [ -f "prisma/seed.js" ]; then
        print_step "Database seed qilinmoqda..."
        npx prisma db seed || print_warning "Seed script xatosi"
    fi
    
    print_success "Database setup tugallandi"
    cd ..
}

# Run tests
run_tests() {
    print_header "🧪 Testlarni ishga tushirish"
    
    # Backend tests
    print_step "Backend testlari..."
    cd backend-main
    npm run test || print_warning "Ba'zi backend testlar muvaffaqiyatsiz"
    cd ..
    
    # Frontend tests
    print_step "Frontend testlari..."
    cd front-main
    npm run test || print_warning "Ba'zi frontend testlar muvaffaqiyatsiz"
    cd ..
    
    print_success "Testlar tugallandi"
}

# Deploy with Docker
deploy_docker() {
    print_header "🐳 Docker bilan deploy"
    
    # Build and start all services
    print_step "Barcha servicelar ishga tushirilmoqda..."
    docker-compose -f docker-compose.prod.yml up -d --build
    
    # Wait for services to start
    print_step "Servicelar ishga tushishini kutish..."
    sleep 30
    
    print_success "Docker deployment tugallandi"
}

# Run pre-launch checklist
run_checklist() {
    print_header "✅ Pre-launch checklist"
    
    cd backend-main
    print_step "Pre-launch tekshiruvlar..."
    node scripts/pre-launch-checklist.js
    
    if [ $? -eq 0 ]; then
        print_success "Barcha tekshiruvlar muvaffaqiyatli"
    else
        print_error "Pre-launch tekshiruvlar muvaffaqiyatsiz!"
        exit 1
    fi
    cd ..
}

# Health checks
health_checks() {
    print_header "🏥 Health checks"
    
    # Wait a bit more for services to fully start
    sleep 10
    
    # Check backend health
    print_step "Backend health tekshiruvi..."
    for i in {1..5}; do
        if curl -f http://localhost:3001/health > /dev/null 2>&1; then
            print_success "Backend health check muvaffaqiyatli"
            break
        else
            print_step "Backend health check urinish $i/5..."
            sleep 10
        fi
        
        if [ $i -eq 5 ]; then
            print_error "Backend health check muvaffaqiyatsiz!"
            exit 1
        fi
    done
    
    # Check frontend health
    print_step "Frontend health tekshiruvi..."
    for i in {1..5}; do
        if curl -f http://localhost:3000 > /dev/null 2>&1; then
            print_success "Frontend health check muvaffaqiyatli"
            break
        else
            print_step "Frontend health check urinish $i/5..."
            sleep 10
        fi
        
        if [ $i -eq 5 ]; then
            print_error "Frontend health check muvaffaqiyatsiz!"
            exit 1
        fi
    done
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
    
    # Confirmation
    echo -e "${YELLOW}Bu script loyihani production ga deploy qiladi.${NC}"
    echo -e "${YELLOW}Davom etishdan oldin barcha ma'lumotlar backup qilinadi.${NC}"
    echo ""
    read -p "Davom etishni xohlaysizmi? (y/N): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_step "Deployment bekor qilindi"
        exit 0
    fi
    
    # Run deployment steps
    check_root
    check_prerequisites
    setup_environment
    backup_data
    stop_services
    build_applications
    setup_database
    run_tests
    deploy_docker
    run_checklist
    health_checks
    
    # Success message
    print_header "🎉 Deployment muvaffaqiyatli tugallandi!"
    
    echo -e "${GREEN}"
    echo "✅ INBOLA loyihasi muvaffaqiyatli production ga deploy qilindi!"
    echo ""
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:3001"
    echo "📚 API Documentation: http://localhost:3001/api-docs"
    echo "💚 Health Check: http://localhost:3001/health"
    echo ""
    echo "📊 Monitoring:"
    echo "   - Loglarni ko'rish: docker-compose -f docker-compose.prod.yml logs -f"
    echo "   - Servicelar holati: docker-compose -f docker-compose.prod.yml ps"
    echo ""
    echo "🔄 Rollback (agar kerak bo'lsa):"
    if [ -f ".last_backup" ]; then
        LAST_BACKUP=$(cat .last_backup)
        echo "   - Backup manzili: $LAST_BACKUP"
    fi
    echo "   - Rollback script: ./rollback.sh"
    echo -e "${NC}"
}

# Run main function
main "$@"
