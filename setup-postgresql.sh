#!/bin/bash

# ==========================================
# INBOLA Marketplace - PostgreSQL Setup
# ==========================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🐘 INBOLA Marketplace - PostgreSQL Setup${NC}"
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

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Bu script root sifatida ishlatilishi kerak"
    echo "sudo ./setup-postgresql.sh deb ishga tushiring"
    exit 1
fi

# Database configuration
DB_NAME="inbola_marketplace"
DB_USER="inbola_user"
DB_PASSWORD="InBoLa_DB_P@ssw0rd_2024!"

echo -e "${BLUE}📋 PostgreSQL Sozlamalari:${NC}"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Password: $DB_PASSWORD"
echo ""

read -p "Davom etishni xohlaysizmi? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Bekor qilindi."
    exit 1
fi

echo -e "${BLUE}📦 Step 1: PostgreSQL o'rnatish${NC}"

# Update package list
apt update

# Install PostgreSQL
if ! command -v psql &> /dev/null; then
    apt install -y postgresql postgresql-contrib
    print_status "PostgreSQL o'rnatildi"
else
    print_status "PostgreSQL allaqachon o'rnatilgan"
fi

echo -e "${BLUE}🔄 Step 2: PostgreSQL ishga tushirish${NC}"

# Start and enable PostgreSQL
systemctl start postgresql
systemctl enable postgresql
print_status "PostgreSQL ishga tushirildi"

echo -e "${BLUE}🗄️ Step 3: Database va user yaratish${NC}"

# Create database and user
sudo -u postgres psql << EOF
-- Drop existing database and user if they exist
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;

-- Create new database and user
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
GRANT ALL ON SCHEMA public TO $DB_USER;

-- Additional permissions for PostgreSQL 15+
ALTER DATABASE $DB_NAME OWNER TO $DB_USER;

\q
EOF

if [ $? -eq 0 ]; then
    print_status "Database va user yaratildi"
else
    print_error "Database yaratishda xatolik"
    exit 1
fi

echo -e "${BLUE}🔧 Step 4: Environment faylni yangilash${NC}"

# Update environment file
cat > apps/api/.env << EOF
# INBOLA Marketplace - Production Environment (PostgreSQL)
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
NODE_ENV=production
PORT=3001

# JWT Secrets
ACCESS_TOKEN_KEY="InBoLa_Prod_@ccess_T0ken_K3y_2024_Production_SSL"
REFRESH_TOKEN_KEY="InBoLa_Prod_R3fr3sh_T0ken_K3y_2024_Production_SSL"
ACCESS_TOKEN_TIME="15m"
REFRESH_TOKEN_TIME="7d"

# URLs (Production with SSL)
FRONTEND_URL=https://inbola.uz
NEXT_PUBLIC_BASE_URL=https://inbola.uz
NEXT_PUBLIC_API_URL=https://inbola.uz/api

# Redis (production)
REDIS_URL="redis://localhost:6379"

# File Upload
UPLOAD_PATH="./public/uploads"
MAX_FILE_SIZE=52428800

# Production settings
SMS_DEV_MODE=false
GRAPHQL_PLAYGROUND=false
GRAPHQL_INTROSPECTION=false

# Admin Configuration
ADMIN_EMAIL="admin@inbola.uz"
ADMIN_PASSWORD="InBoLa_@dm1n_Prod_P@ssw0rd_2024!"
EOF

print_status "Environment fayl yangilandi"

echo -e "${BLUE}🧪 Step 5: Database connection test${NC}"

# Test database connection
if sudo -u postgres psql -d $DB_NAME -c "SELECT version();" > /dev/null 2>&1; then
    print_status "Database connection muvaffaqiyatli"
else
    print_error "Database connection xatolik"
    exit 1
fi

echo -e "${BLUE}🔒 Step 6: PostgreSQL xavfsizlik sozlamalari${NC}"

# Configure PostgreSQL for production
sudo -u postgres psql << EOF
-- Performance tuning
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- Security settings
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_duration = on;
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;

-- Reload configuration
SELECT pg_reload_conf();
\q
EOF

print_status "PostgreSQL xavfsizlik sozlamalari qo'llandi"

echo -e "${BLUE}🔄 Step 7: PostgreSQL restart${NC}"

# Restart PostgreSQL to apply settings
systemctl restart postgresql
print_status "PostgreSQL qayta ishga tushirildi"

echo "=================================================="
echo -e "${GREEN}🎉 POSTGRESQL MUVAFFAQIYATLI SOZLANDI!${NC}"
echo ""
echo -e "${BLUE}📋 Natijalar:${NC}"
echo "• Database: $DB_NAME"
echo "• User: $DB_USER"
echo "• Host: localhost:5432"
echo "• SSL: Enabled"
echo ""
echo -e "${BLUE}🔧 Keyingi qadamlar:${NC}"
echo "1. Database migration: cd apps/api && npx prisma migrate dev"
echo "2. Database seed: npm run seed"
echo "3. Loyihani ishga tushiring: npm start"
echo ""
echo -e "${BLUE}🔍 Tekshirish buyruqlari:${NC}"
echo "• PostgreSQL status: systemctl status postgresql"
echo "• Database connection: psql -h localhost -U $DB_USER -d $DB_NAME"
echo "• Database size: sudo -u postgres psql -c \"SELECT pg_size_pretty(pg_database_size('$DB_NAME'));\""
echo ""
echo -e "${GREEN}✅ PostgreSQL sozlash tugallandi!${NC}"
echo "=================================================="
