#!/bin/bash

# INBOLA Production Rollback Script
# Bu script production deployment ni oldingi holatga qaytaradi

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

# Get available backups
get_backups() {
    print_header "📋 Mavjud backuplar"
    
    if [ ! -d "backups" ]; then
        print_error "Backup papkasi topilmadi!"
        exit 1
    fi
    
    BACKUPS=($(ls -1 backups/ | sort -r))
    
    if [ ${#BACKUPS[@]} -eq 0 ]; then
        print_error "Hech qanday backup topilmadi!"
        exit 1
    fi
    
    echo "Mavjud backuplar:"
    for i in "${!BACKUPS[@]}"; do
        echo "  $((i+1)). ${BACKUPS[$i]}"
    done
    echo ""
}

# Select backup
select_backup() {
    # Check if last backup file exists
    if [ -f ".last_backup" ]; then
        LAST_BACKUP=$(cat .last_backup)
        BACKUP_NAME=$(basename "$LAST_BACKUP")
        
        echo -e "${YELLOW}Oxirgi backup: $BACKUP_NAME${NC}"
        read -p "Oxirgi backupni ishlatishni xohlaysizmi? (Y/n): " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Nn]$ ]]; then
            manual_backup_selection
        else
            SELECTED_BACKUP="$LAST_BACKUP"
            print_success "Oxirgi backup tanlandi: $BACKUP_NAME"
        fi
    else
        manual_backup_selection
    fi
}

# Manual backup selection
manual_backup_selection() {
    get_backups
    
    while true; do
        read -p "Backup raqamini kiriting (1-${#BACKUPS[@]}): " backup_num
        
        if [[ "$backup_num" =~ ^[0-9]+$ ]] && [ "$backup_num" -ge 1 ] && [ "$backup_num" -le ${#BACKUPS[@]} ]; then
            SELECTED_BACKUP="backups/${BACKUPS[$((backup_num-1))]}"
            print_success "Backup tanlandi: ${BACKUPS[$((backup_num-1))]}"
            break
        else
            print_error "Noto'g'ri raqam. Iltimos, 1 dan ${#BACKUPS[@]} gacha raqam kiriting."
        fi
    done
}

# Stop current services
stop_services() {
    print_header "🛑 Joriy servicelarni to'xtatish"
    
    print_step "Docker containers to'xtatilmoqda..."
    docker-compose -f docker-compose.prod.yml down || true
    print_success "Docker containers to'xtatildi"
}

# Restore database
restore_database() {
    print_header "🗄️ Database qayta tiklash"
    
    DB_BACKUP="$SELECTED_BACKUP/database_backup.sql"
    
    if [ ! -f "$DB_BACKUP" ]; then
        print_warning "Database backup topilmadi: $DB_BACKUP"
        return
    fi
    
    # Start only database
    print_step "Database ishga tushirilmoqda..."
    docker-compose -f docker-compose.prod.yml up -d postgres
    
    # Wait for database
    print_step "Database tayyor bo'lishini kutish..."
    sleep 15
    
    # Drop and recreate database
    print_step "Database qayta yaratilmoqda..."
    docker exec inbola_postgres psql -U inbola_user -c "DROP DATABASE IF EXISTS inbola_db;"
    docker exec inbola_postgres psql -U inbola_user -c "CREATE DATABASE inbola_db;"
    
    # Restore from backup
    print_step "Database backup dan tiklanmoqda..."
    docker exec -i inbola_postgres psql -U inbola_user -d inbola_db < "$DB_BACKUP"
    
    print_success "Database muvaffaqiyatli tiklandi"
}

# Restore uploads
restore_uploads() {
    print_header "📁 Upload fayllarni tiklash"
    
    UPLOADS_BACKUP="$SELECTED_BACKUP/uploads_backup"
    
    if [ ! -d "$UPLOADS_BACKUP" ]; then
        print_warning "Upload backup topilmadi: $UPLOADS_BACKUP"
        return
    fi
    
    # Remove current uploads
    if [ -d "backend-main/public/uploads" ]; then
        print_step "Joriy upload fayllar o'chirilmoqda..."
        rm -rf backend-main/public/uploads
    fi
    
    # Restore from backup
    print_step "Upload fayllar tiklanmoqda..."
    cp -r "$UPLOADS_BACKUP" backend-main/public/uploads
    
    print_success "Upload fayllar muvaffaqiyatli tiklandi"
}

# Restart services
restart_services() {
    print_header "🚀 Servicelarni qayta ishga tushirish"
    
    print_step "Barcha servicelar ishga tushirilmoqda..."
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for services
    print_step "Servicelar ishga tushishini kutish..."
    sleep 30
    
    print_success "Servicelar muvaffaqiyatli ishga tushdi"
}

# Health checks
health_checks() {
    print_header "🏥 Health checks"
    
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
            return 1
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
            return 1
        fi
    done
}

# Main rollback function
main() {
    print_header "🔄 INBOLA Production Rollback"
    
    echo -e "${CYAN}"
    cat << "EOF"
    ██████╗  ██████╗ ██╗     ██╗     ██████╗  █████╗  ██████╗██╗  ██╗
    ██╔══██╗██╔═══██╗██║     ██║     ██╔══██╗██╔══██╗██╔════╝██║ ██╔╝
    ██████╔╝██║   ██║██║     ██║     ██████╔╝███████║██║     █████╔╝ 
    ██╔══██╗██║   ██║██║     ██║     ██╔══██╗██╔══██║██║     ██╔═██╗ 
    ██║  ██║╚██████╔╝███████╗███████╗██████╔╝██║  ██║╚██████╗██║  ██╗
    ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚══════╝╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
    
    Production Rollback - Oldingi holatga qaytarish
EOF
    echo -e "${NC}"
    
    # Warning
    echo -e "${RED}⚠️  DIQQAT: Bu amal joriy production ma'lumotlarini o'chiradi!${NC}"
    echo -e "${RED}⚠️  Rollback qilishdan oldin joriy holatni backup qilish tavsiya etiladi.${NC}"
    echo ""
    
    # Confirmation
    read -p "Rollback ni davom ettirishni xohlaysizmi? (y/N): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_step "Rollback bekor qilindi"
        exit 0
    fi
    
    # Create emergency backup before rollback
    print_step "Rollback oldidan emergency backup yaratilmoqda..."
    EMERGENCY_BACKUP="backups/emergency_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$EMERGENCY_BACKUP"
    
    if docker ps | grep -q inbola_postgres; then
        docker exec inbola_postgres pg_dump -U inbola_user inbola_db > "$EMERGENCY_BACKUP/database_backup.sql" || true
    fi
    
    if [ -d "backend-main/public/uploads" ]; then
        cp -r backend-main/public/uploads "$EMERGENCY_BACKUP/uploads_backup" || true
    fi
    
    print_success "Emergency backup yaratildi: $EMERGENCY_BACKUP"
    
    # Select backup to restore
    select_backup
    
    # Perform rollback
    stop_services
    restore_database
    restore_uploads
    restart_services
    
    # Check if rollback was successful
    if health_checks; then
        print_header "🎉 Rollback muvaffaqiyatli tugallandi!"
        
        echo -e "${GREEN}"
        echo "✅ INBOLA loyihasi muvaffaqiyatli rollback qilindi!"
        echo ""
        echo "📊 Tiklangan backup: $(basename "$SELECTED_BACKUP")"
        echo "🚨 Emergency backup: $(basename "$EMERGENCY_BACKUP")"
        echo ""
        echo "🌐 Frontend: http://localhost:3000"
        echo "🔧 Backend API: http://localhost:3001"
        echo "💚 Health Check: http://localhost:3001/health"
        echo ""
        echo "📊 Monitoring:"
        echo "   - Loglarni ko'rish: docker-compose -f docker-compose.prod.yml logs -f"
        echo "   - Servicelar holati: docker-compose -f docker-compose.prod.yml ps"
        echo -e "${NC}"
    else
        print_error "Rollback muvaffaqiyatsiz! Emergency backup dan qayta tiklash kerak bo'lishi mumkin."
        echo -e "${RED}Emergency backup manzili: $EMERGENCY_BACKUP${NC}"
        exit 1
    fi
}

# Run main function
main "$@"
