#!/bin/bash

# INBOLA Database Backup Script
# Bu script database ni backup qiladi

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_step() {
    echo -e "${YELLOW}🔄 $1${NC}"
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

# Configuration
DB_NAME="inbola_db"
DB_USER="inbola_user"
DB_HOST="localhost"
DB_PORT="5432"
BACKUP_DIR="backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/inbola_backup_$DATE.sql"
COMPRESSED_FILE="$BACKUP_DIR/inbola_backup_$DATE.sql.gz"

# Load environment variables if .env.prod exists
if [ -f ".env.prod" ]; then
    export $(cat .env.prod | grep -v '^#' | xargs)
    print_success "Environment variables loaded from .env.prod"
fi

print_header "💾 INBOLA Database Backup"

# Create backup directory
mkdir -p "$BACKUP_DIR"
print_success "Backup directory created: $BACKUP_DIR"

# Function to backup database
backup_database() {
    print_step "Database backup boshlandi..."
    
    # Check if database is accessible
    if ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME; then
        print_error "Database ga ulanib bo'lmadi!"
        exit 1
    fi
    
    print_success "Database ga ulanish muvaffaqiyatli"
    
    # Create backup
    print_step "Backup yaratilmoqda: $BACKUP_FILE"
    
    if pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > "$BACKUP_FILE"; then
        print_success "Database backup yaratildi"
        
        # Get backup file size
        BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        print_success "Backup hajmi: $BACKUP_SIZE"
        
        # Compress backup
        print_step "Backup siqilmoqda..."
        if gzip "$BACKUP_FILE"; then
            print_success "Backup siqildi: $COMPRESSED_FILE"
            
            # Get compressed file size
            COMPRESSED_SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)
            print_success "Siqilgan hajmi: $COMPRESSED_SIZE"
        else
            print_warning "Backup siqishda xatolik, lekin asl fayl saqlandi"
        fi
        
    else
        print_error "Database backup yaratishda xatolik!"
        exit 1
    fi
}

# Function to backup uploads
backup_uploads() {
    print_step "Upload fayllar backup qilinmoqda..."
    
    UPLOADS_DIR="backend-main/public/uploads"
    UPLOADS_BACKUP="$BACKUP_DIR/uploads_backup_$DATE.tar.gz"
    
    if [ -d "$UPLOADS_DIR" ]; then
        if tar -czf "$UPLOADS_BACKUP" -C "backend-main/public" uploads; then
            UPLOADS_SIZE=$(du -h "$UPLOADS_BACKUP" | cut -f1)
            print_success "Upload fayllar backup qilindi: $UPLOADS_SIZE"
        else
            print_warning "Upload fayllar backup qilishda xatolik"
        fi
    else
        print_warning "Upload papkasi topilmadi: $UPLOADS_DIR"
    fi
}

# Function to cleanup old backups
cleanup_old_backups() {
    print_step "Eski backuplar tozalanmoqda..."
    
    # Keep only last 7 days of backups
    find "$BACKUP_DIR" -name "inbola_backup_*.sql.gz" -mtime +7 -delete
    find "$BACKUP_DIR" -name "uploads_backup_*.tar.gz" -mtime +7 -delete
    
    print_success "Eski backuplar tozalandi (7 kundan eski)"
}

# Function to verify backup
verify_backup() {
    print_step "Backup tekshirilmoqda..."
    
    if [ -f "$COMPRESSED_FILE" ]; then
        # Test if gzip file is valid
        if gzip -t "$COMPRESSED_FILE"; then
            print_success "Backup fayli to'g'ri formatda"
            
            # Test if SQL content is valid
            if zcat "$COMPRESSED_FILE" | head -n 10 | grep -q "PostgreSQL database dump"; then
                print_success "Backup mazmuni to'g'ri"
            else
                print_warning "Backup mazmuni shubhali"
            fi
        else
            print_error "Backup fayli buzilgan!"
            exit 1
        fi
    else
        print_error "Backup fayli topilmadi!"
        exit 1
    fi
}

# Function to create backup info file
create_backup_info() {
    INFO_FILE="$BACKUP_DIR/backup_info_$DATE.txt"
    
    cat > "$INFO_FILE" << EOF
INBOLA Database Backup Information
==================================

Backup Date: $(date)
Database: $DB_NAME
Host: $DB_HOST:$DB_PORT
User: $DB_USER

Files:
- Database: $COMPRESSED_FILE
- Uploads: $BACKUP_DIR/uploads_backup_$DATE.tar.gz
- Info: $INFO_FILE

Backup Sizes:
- Database: $(du -h "$COMPRESSED_FILE" 2>/dev/null | cut -f1 || echo "N/A")
- Uploads: $(du -h "$BACKUP_DIR/uploads_backup_$DATE.tar.gz" 2>/dev/null | cut -f1 || echo "N/A")

Restore Commands:
- Database: gunzip -c $COMPRESSED_FILE | psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME
- Uploads: tar -xzf $BACKUP_DIR/uploads_backup_$DATE.tar.gz -C backend-main/public/

Notes:
- Backup created automatically
- Keep this file for restore reference
- Contact admin for restore assistance
EOF

    print_success "Backup ma'lumotlari saqlandi: $INFO_FILE"
}

# Main backup process
main() {
    print_step "Backup jarayoni boshlandi..."
    
    # Check prerequisites
    if ! command -v pg_dump &> /dev/null; then
        print_error "pg_dump topilmadi! PostgreSQL client o'rnatilgan emasligini tekshiring."
        exit 1
    fi
    
    if ! command -v gzip &> /dev/null; then
        print_error "gzip topilmadi!"
        exit 1
    fi
    
    # Run backup steps
    backup_database
    backup_uploads
    verify_backup
    create_backup_info
    cleanup_old_backups
    
    print_header "🎉 Backup muvaffaqiyatli tugallandi!"
    
    echo -e "${GREEN}"
    echo "✅ Database backup yaratildi!"
    echo ""
    echo "📁 Backup fayllari:"
    echo "   - Database: $COMPRESSED_FILE"
    echo "   - Uploads: $BACKUP_DIR/uploads_backup_$DATE.tar.gz"
    echo "   - Info: $BACKUP_DIR/backup_info_$DATE.txt"
    echo ""
    echo "📊 Backup statistikasi:"
    ls -lh "$BACKUP_DIR"/*"$DATE"* 2>/dev/null || echo "   Fayllar topilmadi"
    echo ""
    echo "🔄 Restore qilish uchun:"
    echo "   gunzip -c $COMPRESSED_FILE | psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
    echo -e "${NC}"
}

# Check if running in Docker
if [ -f "/.dockerenv" ]; then
    print_warning "Docker container ichida ishlamoqda"
    DB_HOST="postgres"
fi

# Run main function
main "$@"
