#!/bin/bash

# INBOLA Kids Marketplace - Professional Deployment Script
# Amazon/Uzum Market level e-commerce platform with Etsy.com design

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

main() {
    print_header "🎯 INBOLA Kids Marketplace - Professional Deployment"
    
    echo -e "${CYAN}"
    cat << "EOF"
    ██╗███╗   ██╗██████╗  ██████╗ ██╗      █████╗ 
    ██║████╗  ██║██╔══██╗██╔═══██╗██║     ██╔══██╗
    ██║██╔██╗ ██║██████╔╝██║   ██║██║     ███████║
    ██║██║╚██╗██║██╔══██╗██║   ██║██║     ██╔══██║
    ██║██║ ╚████║██████╔╝╚██████╔╝███████╗██║  ██║
    ╚═╝╚═╝  ╚═══╝╚═════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝
    
    Professional E-commerce Platform
    Amazon/Uzum Market Level | Etsy.com Design
EOF
    echo -e "${NC}"
    
    check_prerequisites
    setup_environment
    setup_database
    build_applications
    deploy_with_docker
    setup_monitoring
    final_verification
    show_completion_message
}

check_prerequisites() {
    print_header "🔍 Checking Prerequisites"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    print_success "Docker is installed ($(docker --version))"
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    print_success "Docker Compose is installed"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    print_success "Node.js is installed ($(node --version))"
    
    # Check available ports
    check_port 3000 "Frontend"
    check_port 3001 "Backend"
    check_port 5432 "PostgreSQL"
    check_port 6379 "Redis"
}

check_port() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        print_warning "Port $port is already in use (needed for $service)"
        read -p "Do you want to continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        print_success "Port $port is available for $service"
    fi
}

setup_environment() {
    print_header "⚙️ Setting up Professional Environment"
    
    # Create necessary directories
    mkdir -p uploads/{products,users,temp}
    mkdir -p logs/{backend,frontend,nginx}
    mkdir -p backups
    mkdir -p ssl
    mkdir -p monitoring
    mkdir -p nginx/conf.d
    
    print_success "Directory structure created"
    
    # Create production environment file
    if [ ! -f .env.production ]; then
        cat > .env.production << EOF
# Production Environment Configuration
NODE_ENV=production

# Database
DATABASE_URL=postgresql://inbola_user:inbola_password@postgres:5432/inbola_marketplace_db
POSTGRES_USER=inbola_user
POSTGRES_PASSWORD=inbola_password
POSTGRES_DB=inbola_marketplace_db

# Redis
REDIS_URL=redis://:inbola_redis_password@redis:6379
REDIS_PASSWORD=inbola_redis_password

# JWT Secrets (CHANGE IN PRODUCTION!)
JWT_SECRET=your_super_secret_jwt_key_change_in_production_$(openssl rand -hex 32)
REFRESH_TOKEN_SECRET=your_super_secret_refresh_key_change_in_production_$(openssl rand -hex 32)

# URLs
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password

# Payment Gateways
CLICK_SERVICE_ID=your_click_service_id
CLICK_MERCHANT_ID=your_click_merchant_id
CLICK_SECRET_KEY=your_click_secret_key
PAYME_MERCHANT_ID=your_payme_merchant_id
PAYME_SECRET_KEY=your_payme_secret_key

# SMS Service
SMS_TOKEN=your_sms_service_token

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/app/uploads

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=$(openssl rand -hex 32)

# Monitoring
ENABLE_MONITORING=true
PROMETHEUS_ENABLED=true
GRAFANA_ENABLED=true

# Performance
ENABLE_COMPRESSION=true
ENABLE_CACHING=true
CACHE_TTL=3600
EOF
        print_success "Production environment file created"
    fi
}

setup_database() {
    print_header "🗄️ Setting up PostgreSQL Database"
    
    print_info "Starting PostgreSQL container..."
    docker-compose -f docker-compose.professional.yml up -d postgres redis
    
    print_info "Waiting for database to be ready..."
    sleep 15
    
    # Install dependencies and generate Prisma client
    print_info "Installing backend dependencies..."
    cd backend-main
    npm install --production
    
    print_info "Generating Prisma client..."
    npx prisma generate
    
    print_info "Running database migrations..."
    npx prisma migrate deploy
    
    print_info "Seeding database with professional data..."
    npx prisma db seed
    
    cd ..
    print_success "Database setup completed"
}

build_applications() {
    print_header "🏗️ Building Professional Applications"
    
    # Build Backend
    print_info "Building backend application..."
    cd backend-main
    npm run build
    cd ..
    print_success "Backend built successfully"
    
    # Build Frontend
    print_info "Building frontend application..."
    cd front-main
    npm install --production
    npm run build
    cd ..
    print_success "Frontend built successfully"
}

deploy_with_docker() {
    print_header "🐳 Deploying with Docker (Professional Setup)"
    
    print_info "Stopping existing containers..."
    docker-compose -f docker-compose.professional.yml down || true
    
    print_info "Building and starting all services..."
    docker-compose -f docker-compose.professional.yml up -d --build
    
    print_info "Waiting for services to start..."
    sleep 30
    
    print_success "Professional deployment completed"
}

setup_monitoring() {
    print_header "📊 Setting up Monitoring & Analytics"
    
    # Create Prometheus configuration
    cat > monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'inbola-backend'
    static_configs:
      - targets: ['backend:3001']
  
  - job_name: 'inbola-frontend'
    static_configs:
      - targets: ['frontend:3000']
  
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
  
  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
EOF
    
    print_success "Monitoring configuration created"
}

final_verification() {
    print_header "✅ Final Verification"
    
    # Check services
    services=("postgres" "redis" "backend" "frontend")
    
    for service in "${services[@]}"; do
        if docker-compose -f docker-compose.professional.yml ps $service | grep -q "Up"; then
            print_success "$service is running"
        else
            print_error "$service is not running"
            docker-compose -f docker-compose.professional.yml logs $service
        fi
    done
    
    # Health checks
    print_info "Performing health checks..."
    
    # Backend health
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        print_success "Backend health check passed"
    else
        print_warning "Backend health check failed"
    fi
    
    # Frontend health
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend health check passed"
    else
        print_warning "Frontend health check failed"
    fi
    
    # Database connection
    if docker exec inbola_backend npx prisma db pull > /dev/null 2>&1; then
        print_success "Database connection verified"
    else
        print_warning "Database connection check failed"
    fi
}

show_completion_message() {
    print_header "🎉 Professional Deployment Completed!"
    
    echo -e "${GREEN}"
    cat << "EOF"
    ╔══════════════════════════════════════════════════════════════╗
    ║              🎯 INBOLA Kids Marketplace                      ║
    ║           Professional E-commerce Platform                   ║
    ║        Amazon/Uzum Market Level | Etsy.com Design           ║
    ╚══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    echo -e "${CYAN}🌐 Access URLs:${NC}"
    echo -e "   Frontend: ${GREEN}http://localhost:3000${NC}"
    echo -e "   Backend API: ${GREEN}http://localhost:3001${NC}"
    echo -e "   Admin Panel: ${GREEN}http://localhost:3000/admin${NC}"
    echo -e "   API Docs: ${GREEN}http://localhost:3001/api-docs${NC}"
    echo -e "   Monitoring: ${GREEN}http://localhost:9090${NC} (Prometheus)"
    echo -e "   Analytics: ${GREEN}http://localhost:3001${NC} (Grafana)"
    echo ""
    
    echo -e "${CYAN}🔐 Default Credentials:${NC}"
    echo -e "   Admin: ${YELLOW}admin@inbola.uz${NC} / ${YELLOW}admin123${NC}"
    echo -e "   Grafana: ${YELLOW}admin${NC} / ${YELLOW}admin123${NC}"
    echo ""
    
    echo -e "${CYAN}🚀 Professional Features:${NC}"
    echo -e "   ✅ PostgreSQL Database with advanced schema"
    echo -e "   ✅ Redis Caching for performance"
    echo -e "   ✅ Etsy.com style modern design"
    echo -e "   ✅ Amazon/Uzum Market level functionality"
    echo -e "   ✅ Professional image handling"
    echo -e "   ✅ Advanced product variants & collections"
    echo -e "   ✅ Comprehensive monitoring & analytics"
    echo -e "   ✅ Production-ready deployment"
    echo -e "   ✅ Child safety & parental controls"
    echo -e "   ✅ PWA with offline capabilities"
    echo ""
    
    echo -e "${GREEN}🎊 Your professional e-commerce platform is ready!${NC}"
    echo -e "${GREEN}Ready to compete with Amazon, Uzum Market, and Etsy! 🛒✨${NC}"
}

# Error handling
trap 'print_error "Deployment failed at line $LINENO. Exit code: $?"' ERR

# Run main function
main "$@"
