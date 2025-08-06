#!/bin/bash

# ===========================================
# 🚀 INBOLA.UZ MARKETPLACE DEPLOYMENT SCRIPT
# ===========================================
# Professional deployment script for inbola.uz domain
# Author: INBOLA Development Team
# Version: 1.0.0

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="INBOLA Marketplace"
DOMAIN="inbola.uz"
API_DOMAIN="api.inbola.uz"
BACKEND_PORT=3001
FRONTEND_PORT=3000

echo -e "${BLUE}🚀 Starting deployment for ${PROJECT_NAME} to ${DOMAIN}${NC}"
echo "=================================================="

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
   print_warning "Running as root. Please run as regular user with sudo when needed."
fi

# 1. Environment Setup
echo -e "${BLUE}📋 Step 1: Environment Setup${NC}"
if [ -f ".env.prod" ]; then
    cp .env.prod .env
    print_status "Production environment file copied"
else
    print_error "Production environment file (.env.prod) not found!"
    exit 1
fi

# 2. Backend Setup
echo -e "${BLUE}🔧 Step 2: Backend Setup${NC}"
cd backend-main

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install --production
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Build backend
echo "Building backend..."
npm run build

print_status "Backend setup completed"
cd ..

# 3. Frontend Setup
echo -e "${BLUE}🌐 Step 3: Frontend Setup${NC}"
cd front-main

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Build frontend
echo "Building frontend for production..."
npm run build

print_status "Frontend setup completed"
cd ..

# 4. Database Setup
echo -e "${BLUE}🗄️ Step 4: Database Setup${NC}"
cd backend-main

# Check if PostgreSQL is running
if ! pgrep -x "postgres" > /dev/null; then
    print_warning "PostgreSQL is not running. Please start PostgreSQL service."
    print_warning "Run: sudo systemctl start postgresql"
fi

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Seed database if needed
if [ -f "prisma/seed.ts" ]; then
    echo "Seeding database..."
    npm run seed
fi

print_status "Database setup completed"
cd ..

# 5. SSL/TLS Setup (if certificates exist)
echo -e "${BLUE}🔒 Step 5: SSL/TLS Setup${NC}"
if [ -d "ssl" ]; then
    if [ -f "ssl/${DOMAIN}.crt" ] && [ -f "ssl/${DOMAIN}.key" ]; then
        print_status "SSL certificates found for ${DOMAIN}"
    else
        print_warning "SSL certificates not found. HTTPS will not be available."
        print_warning "Please obtain SSL certificates for ${DOMAIN} and ${API_DOMAIN}"
    fi
else
    print_warning "SSL directory not found. Creating SSL directory..."
    mkdir -p ssl
    print_warning "Please obtain SSL certificates and place them in the ssl/ directory"
fi

# 6. Nginx Configuration
echo -e "${BLUE}🌐 Step 6: Nginx Configuration${NC}"
if command -v nginx &> /dev/null; then
    if [ -f "nginx.conf" ]; then
        print_status "Nginx configuration file found"
        print_warning "Please copy nginx.conf to /etc/nginx/sites-available/${DOMAIN}"
        print_warning "Then run: sudo ln -s /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/"
        print_warning "And reload nginx: sudo systemctl reload nginx"
    else
        print_warning "Nginx configuration file not found"
    fi
else
    print_warning "Nginx is not installed. Please install nginx for production deployment."
fi

# 7. PM2 Process Management
echo -e "${BLUE}⚙️ Step 7: Process Management Setup${NC}"
if command -v pm2 &> /dev/null; then
    # Stop existing processes
    pm2 delete inbola-backend 2>/dev/null || true
    pm2 delete inbola-frontend 2>/dev/null || true
    
    # Start backend
    cd backend-main
    pm2 start npm --name "inbola-backend" -- run start:prod
    cd ..
    
    # Start frontend
    cd front-main
    pm2 start npm --name "inbola-frontend" -- start
    cd ..
    
    # Save PM2 configuration
    pm2 save
    pm2 startup
    
    print_status "PM2 processes started and configured"
else
    print_warning "PM2 is not installed. Installing PM2..."
    npm install -g pm2
fi

# 8. Health Check
echo -e "${BLUE}🏥 Step 8: Health Check${NC}"
sleep 5

# Check backend health
if curl -f http://localhost:${BACKEND_PORT}/health > /dev/null 2>&1; then
    print_status "Backend is running and healthy"
else
    print_error "Backend health check failed"
fi

# Check frontend
if curl -f http://localhost:${FRONTEND_PORT} > /dev/null 2>&1; then
    print_status "Frontend is running and accessible"
else
    print_error "Frontend health check failed"
fi

# 9. Final Status
echo -e "${BLUE}📊 Step 9: Deployment Summary${NC}"
echo "=================================================="
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!${NC}"
echo ""
echo "📋 Service Status:"
echo "  • Backend API: http://localhost:${BACKEND_PORT}"
echo "  • Frontend: http://localhost:${FRONTEND_PORT}"
echo "  • Domain: ${DOMAIN}"
echo "  • API Domain: ${API_DOMAIN}"
echo ""
echo "🔧 Next Steps:"
echo "  1. Configure your DNS to point ${DOMAIN} to this server"
echo "  2. Configure your DNS to point ${API_DOMAIN} to this server"
echo "  3. Obtain SSL certificates for both domains"
echo "  4. Configure nginx with the provided configuration"
echo "  5. Test the application thoroughly"
echo ""
echo "📝 Useful Commands:"
echo "  • View logs: pm2 logs"
echo "  • Restart services: pm2 restart all"
echo "  • Stop services: pm2 stop all"
echo "  • Monitor: pm2 monit"
echo ""
echo -e "${GREEN}✅ Your INBOLA Marketplace is ready for production!${NC}"
echo "=================================================="
