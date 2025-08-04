
#!/bin/bash

# INBOLA Production Deployment Script
set -e

echo "🚀 Starting INBOLA Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the backend-main directory."
    exit 1
fi

print_step "1. Installing dependencies..."
npm ci --only=production

print_step "2. Generating Prisma client..."
npx prisma generate

print_step "3. Running database migrations..."
npx prisma migrate deploy

print_step "4. Building application..."
npm run build

print_step "5. Running database optimizations..."
if [ -f "prisma/migrations/production_optimization.sql" ]; then
    npx prisma db execute --file prisma/migrations/production_optimization.sql
    print_success "Database optimizations applied"
else
    print_warning "Database optimization file not found, skipping..."
fi

print_step "6. Running pre-launch checklist..."
node scripts/pre-launch-checklist.js

if [ $? -ne 0 ]; then
    print_error "Pre-launch checklist failed! Deployment aborted."
    exit 1
fi

print_step "6. Setting up PM2..."
npm install -g pm2
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30

print_step "7. Starting application with PM2..."
if pm2 list | grep -q "inbola-backend"; then
    print_status "Restarting existing PM2 process..."
    pm2 restart ecosystem.config.js --env production
else
    print_status "Starting new PM2 process..."
    pm2 start ecosystem.config.js --env production
fi

print_step "8. Setting up monitoring..."
node scripts/monitoring-setup.js

print_step "9. Running health checks..."
sleep 10

# Health check
if curl -f http://0.0.0.0:4000/health > /dev/null 2>&1; then
    print_status "✅ Backend health check passed"
else
    print_error "❌ Backend health check failed"
    exit 1
fi

print_step "10. Saving PM2 configuration..."
pm2 save
pm2 startup

echo ""
echo "🎉 INBOLA Production Deployment Completed Successfully!"
echo ""
echo "📋 Deployment Summary:"
echo "   ✅ Dependencies installed"
echo "   ✅ Database migrations applied"
echo "   ✅ Application built"
echo "   ✅ Pre-launch checklist passed"
echo "   ✅ PM2 process started"
echo "   ✅ Monitoring configured"
echo "   ✅ Health checks passed"
echo ""
echo "🔧 Useful PM2 Commands:"
echo "   pm2 status          - View process status"
echo "   pm2 logs            - View logs"
echo "   pm2 restart all     - Restart all processes"
echo "   pm2 stop all        - Stop all processes"
echo ""
echo "🌐 Application URLs:"
echo "   Backend API: http://your-domain.com:4000/api"
echo "   Health Check: http://your-domain.com:4000/health"
echo ""
print_status "Deployment completed successfully! 🚀"
