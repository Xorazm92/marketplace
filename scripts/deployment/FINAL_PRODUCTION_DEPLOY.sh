#!/bin/bash

# ===========================================
# 🚀 INBOLA MARKETPLACE - FINAL PRODUCTION DEPLOYMENT
# ===========================================
# To'liq tayyor, PostgreSQL bilan, barcha kamchiliklar bartaraf etilgan
# Author: INBOLA Development Team
# Version: 2.0.0 - Production Ready

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Configuration
PROJECT_NAME="INBOLA Marketplace"
DOMAIN="inbola.uz"
BACKEND_PORT=3001
FRONTEND_PORT=3000

echo -e "${PURPLE}🚀 ${PROJECT_NAME} - FINAL PRODUCTION DEPLOYMENT${NC}"
echo -e "${PURPLE}=================================================${NC}"

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running as regular user
if [[ $EUID -eq 0 ]]; then
   print_error "Bu skriptni root user sifatida ishlatmang!"
   exit 1
fi

echo -e "${BLUE}🔍 Step 1: Pre-deployment Checks${NC}"

# Check if required files exist
required_files=(".env.prod" "backend-main/package.json" "front-main/package.json" "nginx-inbola.conf" "ecosystem.config.js")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Required file missing: $file"
        exit 1
    fi
done
print_status "Barcha kerakli fayllar mavjud"

echo -e "${BLUE}📦 Step 2: System Requirements Installation${NC}"

# Update system
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
    build-essential \
    software-properties-common

print_status "Barcha dasturlar o'rnatildi"

# Install PM2
sudo npm install -g pm2
print_status "PM2 o'rnatildi"

echo -e "${BLUE}🔥 Step 3: Security & Firewall${NC}"

# Configure firewall
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
print_status "Firewall sozlandi"

echo -e "${BLUE}🗄️ Step 4: PostgreSQL Configuration${NC}"

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql -c "DROP DATABASE IF EXISTS inbola_db;" || true
sudo -u postgres psql -c "DROP USER IF EXISTS inbola_user;" || true

sudo -u postgres psql << EOF
CREATE USER inbola_user WITH PASSWORD 'InBoLa_Pr0d_DB_P@ssw0rd_2024_Secure!';
CREATE DATABASE inbola_db OWNER inbola_user;
GRANT ALL PRIVILEGES ON DATABASE inbola_db TO inbola_user;
ALTER USER inbola_user CREATEDB;
\q
EOF

print_status "PostgreSQL database va user yaratildi"

# Optimize PostgreSQL for production
sudo tee -a /etc/postgresql/*/main/postgresql.conf << EOF

# INBOLA Production Optimizations
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
EOF

sudo systemctl restart postgresql
print_status "PostgreSQL production uchun optimallashtirildi"

echo -e "${BLUE}🔴 Step 5: Redis Configuration${NC}"

# Configure Redis for production
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Set Redis password and optimize
sudo tee /etc/redis/redis.conf << EOF
bind 127.0.0.1
port 6379
requirepass InBoLa_R3d1s_Pr0d_P@ssw0rd_2024_S3cur3!
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /var/lib/redis
EOF

sudo systemctl restart redis-server
print_status "Redis production uchun sozlandi"

echo -e "${BLUE}🌐 Step 6: Nginx Configuration${NC}"

# Copy and configure nginx
sudo cp nginx-inbola.conf /etc/nginx/sites-available/inbola.uz

# Enable site and disable default
sudo ln -sf /etc/nginx/sites-available/inbola.uz /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Optimize nginx for production
sudo tee /etc/nginx/nginx.conf << EOF
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Logging
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;

    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOF

# Test and start nginx
sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx
print_status "Nginx production uchun sozlandi"

echo -e "${BLUE}📦 Step 7: Project Dependencies${NC}"

# Copy production environment
cp .env.prod .env
cp .env.prod backend-main/.env

# Backend dependencies
cd backend-main
npm ci --only=production
print_status "Backend dependencies o'rnatildi"

# Generate Prisma client for PostgreSQL
npx prisma generate
print_status "Prisma client generated"

# Run database migrations
npx prisma migrate deploy
print_status "Database migrations bajarildi"

# Seed database if seed file exists
if [ -f "prisma/seed.ts" ] || [ -f "prisma/seed.js" ]; then
    npm run seed || print_warning "Seed script mavjud emas yoki xatolik"
fi

cd ..

# Frontend dependencies and build
cd front-main

# Create optimized production environment
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://${DOMAIN}/api
NEXT_PUBLIC_BASE_URL=https://${DOMAIN}
NODE_ENV=production
EOF

npm ci
print_status "Frontend dependencies o'rnatildi"

# Build frontend for production
npm run build
print_status "Frontend production build tugadi"

cd ..

echo -e "${BLUE}🏗️ Step 8: Backend Production Build${NC}"

cd backend-main
npm run build
print_status "Backend production build tugadi"
cd ..

echo -e "${BLUE}🚀 Step 9: PM2 Production Setup${NC}"

# Update ecosystem config for production
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'inbola-backend',
      cwd: './backend-main',
      script: 'npm',
      args: 'run start:prod',
      env_production: {
        NODE_ENV: 'production',
        PORT: ${BACKEND_PORT}
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'inbola-frontend',
      cwd: './front-main',
      script: 'npm',
      args: 'start',
      env_production: {
        NODE_ENV: 'production',
        PORT: ${FRONTEND_PORT}
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
EOF

# Create logs directory
mkdir -p logs

# Start applications with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup systemd
print_status "PM2 production setup tugadi"

echo -e "${BLUE}🏥 Step 10: Health Checks & Verification${NC}"

sleep 15

# Health checks
backend_health=false
frontend_health=false

# Check backend health
for i in {1..5}; do
    if curl -f http://localhost:${BACKEND_PORT}/health > /dev/null 2>&1; then
        backend_health=true
        break
    fi
    sleep 3
done

# Check frontend health
for i in {1..5}; do
    if curl -f http://localhost:${FRONTEND_PORT} > /dev/null 2>&1; then
        frontend_health=true
        break
    fi
    sleep 3
done

if [ "$backend_health" = true ]; then
    print_status "Backend ishlamoqda (Port: ${BACKEND_PORT})"
else
    print_error "Backend ishlamayapti!"
    pm2 logs inbola-backend --lines 20
fi

if [ "$frontend_health" = true ]; then
    print_status "Frontend ishlamoqda (Port: ${FRONTEND_PORT})"
else
    print_error "Frontend ishlamayapti!"
    pm2 logs inbola-frontend --lines 20
fi

echo -e "${BLUE}📊 Step 11: System Monitoring Setup${NC}"

# Create monitoring script
cat > monitoring.sh << 'EOF'
#!/bin/bash
LOG_FILE="/var/log/inbola-monitor.log"
echo "=== $(date) ===" >> $LOG_FILE
echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')" >> $LOG_FILE
echo "RAM: $(free -m | awk 'NR==2{printf "%.2f%%", $3*100/$2 }')" >> $LOG_FILE
echo "Disk: $(df -h | awk '$NF=="/"{printf "%s", $5}')" >> $LOG_FILE
pm2 jlist >> $LOG_FILE
echo "==================" >> $LOG_FILE
EOF

chmod +x monitoring.sh

# Add to crontab
(crontab -l 2>/dev/null; echo "*/10 * * * * $(pwd)/monitoring.sh") | crontab -
print_status "Monitoring sozlandi"

echo -e "${BLUE}💾 Step 12: Backup Setup${NC}"

# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$HOME/inbola-backups"
mkdir -p $BACKUP_DIR

# Database backup
PGPASSWORD='InBoLa_Pr0d_DB_P@ssw0rd_2024_Secure!' pg_dump -U inbola_user -h localhost inbola_db > $BACKUP_DIR/db_backup_$DATE.sql

# Files backup
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz backend-main/uploads/ || true

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE" >> /var/log/inbola-backup.log
EOF

chmod +x backup.sh

# Add daily backup to crontab
(crontab -l 2>/dev/null; echo "0 2 * * * $(pwd)/backup.sh") | crontab -
print_status "Backup sozlandi"

echo -e "${PURPLE}=================================================${NC}"
echo -e "${GREEN}🎉 INBOLA MARKETPLACE PRODUCTION DEPLOYMENT TUGADI!${NC}"
echo -e "${PURPLE}=================================================${NC}"
echo ""
echo -e "${BLUE}📋 KEYINGI QADAMLAR:${NC}"
echo -e "${YELLOW}1. DNS Configuration:${NC}"
echo "   • ${DOMAIN} → $(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_SERVER_IP')"
echo "   • www.${DOMAIN} → $(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_SERVER_IP')"
echo ""
echo -e "${YELLOW}2. Router Port Forwarding:${NC}"
echo "   • Port 80 (HTTP) → Server IP:80"
echo "   • Port 443 (HTTPS) → Server IP:443"
echo ""
echo -e "${YELLOW}3. SSL Certificate:${NC}"
echo "   sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo ""
echo -e "${BLUE}📊 MONITORING COMMANDS:${NC}"
echo "   • PM2 Status: pm2 status"
echo "   • PM2 Logs: pm2 logs"
echo "   • PM2 Monitor: pm2 monit"
echo "   • System Monitor: ./monitoring.sh"
echo ""
echo -e "${BLUE}🔧 SERVICE URLS:${NC}"
echo "   • Frontend: http://localhost:${FRONTEND_PORT}"
echo "   • Backend: http://localhost:${BACKEND_PORT}"
echo "   • Health: http://localhost:${BACKEND_PORT}/health"
echo "   • API Docs: http://localhost:${BACKEND_PORT}/api-docs"
echo "   • GraphQL: http://localhost:${BACKEND_PORT}/graphql"
echo ""
echo -e "${GREEN}✅ LOYIHANGIZ TO'LIQ PRODUCTION-READY!${NC}"
echo -e "${PURPLE}=================================================${NC}"
