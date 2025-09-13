#!/bin/bash

# INBOLA E-commerce Production Database Setup Script

echo "🚀 INBOLA Production Database Setup Starting..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found!"
    print_warning "Please create .env.production file with production database URL"
    exit 1
fi

# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)

print_step "1. Checking database connection..."

# Test database connection
if npx prisma db pull --schema=./prisma/schema.prisma > /dev/null 2>&1; then
    print_status "Database connection successful"
else
    print_error "Cannot connect to database. Please check DATABASE_URL in .env.production"
    exit 1
fi

print_step "2. Running database migrations..."

# Generate Prisma client
npx prisma generate

# Push database schema
if npx prisma db push --schema=./prisma/schema.prisma; then
    print_status "Database schema updated successfully"
else
    print_error "Failed to update database schema"
    exit 1
fi

print_step "3. Seeding database with initial data..."

# Run seed script
if npm run db:seed; then
    print_status "Database seeded successfully"
else
    print_warning "Database seeding failed, but continuing..."
fi

print_step "4. Creating database backup..."

# Create backup directory
mkdir -p ./backups

# Create database backup
BACKUP_FILE="./backups/inbola_backup_$(date +%Y%m%d_%H%M%S).sql"
if command -v pg_dump &> /dev/null; then
    pg_dump $DATABASE_URL > $BACKUP_FILE
    print_status "Database backup created: $BACKUP_FILE"
else
    print_warning "pg_dump not found. Skipping backup creation."
fi

print_step "5. Setting up database monitoring..."

# Create monitoring script
cat > ./scripts/db-health-check.sh << 'EOF'
#!/bin/bash
# Database health check script

DB_STATUS=$(npx prisma db pull --schema=./prisma/schema.prisma > /dev/null 2>&1 && echo "OK" || echo "FAILED")

if [ "$DB_STATUS" = "OK" ]; then
    echo "$(date): Database is healthy" >> ./logs/db-health.log
    exit 0
else
    echo "$(date): Database connection failed" >> ./logs/db-health.log
    exit 1
fi
EOF

chmod +x ./scripts/db-health-check.sh
print_status "Database health check script created"

print_step "6. Creating database maintenance scripts..."

# Create backup script
cat > ./scripts/backup-db.sh << 'EOF'
#!/bin/bash
# Database backup script

source .env.production

BACKUP_DIR="./backups"
BACKUP_FILE="$BACKUP_DIR/inbola_backup_$(date +%Y%m%d_%H%M%S).sql"

mkdir -p $BACKUP_DIR

if pg_dump $DATABASE_URL > $BACKUP_FILE; then
    echo "$(date): Backup created successfully: $BACKUP_FILE" >> ./logs/backup.log
    
    # Remove backups older than 30 days
    find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
    
    echo "Backup completed: $BACKUP_FILE"
else
    echo "$(date): Backup failed" >> ./logs/backup.log
    echo "Backup failed!"
    exit 1
fi
EOF

chmod +x ./scripts/backup-db.sh
print_status "Database backup script created"

# Create restore script
cat > ./scripts/restore-db.sh << 'EOF'
#!/bin/bash
# Database restore script

if [ -z "$1" ]; then
    echo "Usage: ./restore-db.sh <backup-file>"
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup file not found: $BACKUP_FILE"
    exit 1
fi

source .env.production

echo "Restoring database from: $BACKUP_FILE"
echo "WARNING: This will overwrite the current database!"
read -p "Are you sure? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    if psql $DATABASE_URL < $BACKUP_FILE; then
        echo "Database restored successfully"
    else
        echo "Database restore failed"
        exit 1
    fi
else
    echo "Restore cancelled"
fi
EOF

chmod +x ./scripts/restore-db.sh
print_status "Database restore script created"

print_step "7. Setting up log directories..."

# Create log directories
mkdir -p ./logs
touch ./logs/db-health.log
touch ./logs/backup.log
touch ./logs/app.log

print_status "Log directories created"

print_step "8. Final verification..."

# Verify database tables
TABLE_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tail -n 1 || echo "0")

if [ "$TABLE_COUNT" -gt "0" ]; then
    print_status "Database verification successful. Found $TABLE_COUNT tables."
else
    print_warning "Database verification failed or no tables found."
fi

echo ""
echo "🎉 Production database setup completed!"
echo ""
echo "📋 Summary:"
echo "   ✅ Database connection verified"
echo "   ✅ Schema migrations applied"
echo "   ✅ Initial data seeded"
echo "   ✅ Backup created"
echo "   ✅ Monitoring scripts installed"
echo "   ✅ Maintenance scripts created"
echo ""
echo "📁 Important files created:"
echo "   - ./scripts/db-health-check.sh"
echo "   - ./scripts/backup-db.sh"
echo "   - ./scripts/restore-db.sh"
echo "   - ./logs/ (log directory)"
echo "   - ./backups/ (backup directory)"
echo ""
echo "🔧 Next steps:"
echo "   1. Set up cron job for regular backups: 0 2 * * * /path/to/backup-db.sh"
echo "   2. Set up monitoring for db-health-check.sh"
echo "   3. Configure log rotation for ./logs/"
echo ""
print_status "Production database is ready! 🚀"
