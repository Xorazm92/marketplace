#!/bin/bash

# INBOLA SSL Certificate Setup Script
# Bu script SSL sertifikatlarni o'rnatadi

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

# Domain configuration
DOMAIN="inbola.uz"
WWW_DOMAIN="www.inbola.uz"
EMAIL="admin@inbola.uz"

print_header "🔒 SSL Certificate Setup for INBOLA"

echo "Bu script quyidagi domenlar uchun SSL sertifikat o'rnatadi:"
echo "- $DOMAIN"
echo "- $WWW_DOMAIN"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Bu script sudo bilan ishlatilishi kerak!"
    echo "Ishlatish: sudo ./setup-ssl.sh"
    exit 1
fi

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    print_step "Certbot o'rnatilmoqda..."
    apt update
    apt install -y certbot
    print_success "Certbot o'rnatildi"
else
    print_success "Certbot mavjud"
fi

# Stop nginx if running
if systemctl is-active --quiet nginx; then
    print_step "Nginx to'xtatilmoqda..."
    systemctl stop nginx
    print_success "Nginx to'xtatildi"
fi

# Stop any process using port 80
print_step "80-portni tozalash..."
fuser -k 80/tcp || true

# Option 1: Let's Encrypt (Recommended for production)
setup_letsencrypt() {
    print_header "🌐 Let's Encrypt SSL sertifikat olish"
    
    print_step "Let's Encrypt sertifikat so'ralmoqda..."
    certbot certonly \
        --standalone \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        -d $DOMAIN \
        -d $WWW_DOMAIN
    
    if [ $? -eq 0 ]; then
        print_success "Let's Encrypt sertifikat muvaffaqiyatli olindi!"
        
        # Copy certificates to ssl directory
        print_step "Sertifikatlar nusxalanmoqda..."
        cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl/inbola.uz.crt
        cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl/inbola.uz.key
        
        # Set proper permissions
        chmod 644 ssl/inbola.uz.crt
        chmod 600 ssl/inbola.uz.key
        
        print_success "Sertifikatlar ssl/ papkasiga nusxalandi"
        
        # Setup auto-renewal
        print_step "Avtomatik yangilanish sozlanmoqda..."
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
        print_success "Avtomatik yangilanish sozlandi"
        
        return 0
    else
        print_error "Let's Encrypt sertifikat olishda xatolik!"
        return 1
    fi
}

# Option 2: Self-signed certificate (for testing)
setup_selfsigned() {
    print_header "🔐 Self-signed SSL sertifikat yaratish"
    
    print_warning "Bu faqat test uchun! Production da Let's Encrypt ishlatilsin!"
    
    print_step "Self-signed sertifikat yaratilmoqda..."
    
    # Create private key
    openssl genrsa -out ssl/inbola.uz.key 2048
    
    # Create certificate signing request
    openssl req -new -key ssl/inbola.uz.key -out ssl/inbola.uz.csr -subj "/C=UZ/ST=Tashkent/L=Tashkent/O=INBOLA/CN=$DOMAIN"
    
    # Create self-signed certificate
    openssl x509 -req -days 365 -in ssl/inbola.uz.csr -signkey ssl/inbola.uz.key -out ssl/inbola.uz.crt
    
    # Set proper permissions
    chmod 644 ssl/inbola.uz.crt
    chmod 600 ssl/inbola.uz.key
    
    # Clean up
    rm ssl/inbola.uz.csr
    
    print_success "Self-signed sertifikat yaratildi"
    print_warning "Brauzerda 'Not Secure' ogohlantirishini ko'rasiz"
}

# Main menu
echo "SSL sertifikat turini tanlang:"
echo "1) Let's Encrypt (Tavsiya etiladi - production uchun)"
echo "2) Self-signed (Faqat test uchun)"
echo "3) Bekor qilish"
echo ""
read -p "Tanlovingizni kiriting (1-3): " choice

case $choice in
    1)
        if setup_letsencrypt; then
            print_success "Let's Encrypt sertifikat muvaffaqiyatli o'rnatildi!"
        else
            print_error "Let's Encrypt sertifikat o'rnatishda xatolik!"
            print_step "Self-signed sertifikat yaratilsinmi? (y/n)"
            read -p "Javob: " fallback
            if [[ $fallback =~ ^[Yy]$ ]]; then
                setup_selfsigned
            fi
        fi
        ;;
    2)
        setup_selfsigned
        ;;
    3)
        print_step "SSL setup bekor qilindi"
        exit 0
        ;;
    *)
        print_error "Noto'g'ri tanlov!"
        exit 1
        ;;
esac

# Verify certificates
print_header "🔍 Sertifikat tekshiruvi"

if [ -f "ssl/inbola.uz.crt" ] && [ -f "ssl/inbola.uz.key" ]; then
    print_success "SSL sertifikat fayllari mavjud"
    
    # Check certificate details
    print_step "Sertifikat ma'lumotlari:"
    openssl x509 -in ssl/inbola.uz.crt -text -noout | grep -E "(Subject:|Issuer:|Not Before:|Not After:)"
    
    # Test certificate
    print_step "Sertifikat test qilinmoqda..."
    if openssl x509 -in ssl/inbola.uz.crt -noout; then
        print_success "Sertifikat to'g'ri formatda"
    else
        print_error "Sertifikat formati noto'g'ri!"
    fi
    
    # Test private key
    if openssl rsa -in ssl/inbola.uz.key -check -noout; then
        print_success "Private key to'g'ri formatda"
    else
        print_error "Private key formati noto'g'ri!"
    fi
    
else
    print_error "SSL sertifikat fayllari topilmadi!"
    exit 1
fi

print_header "🎉 SSL Setup tugallandi!"

echo -e "${GREEN}"
echo "✅ SSL sertifikatlar muvaffaqiyatli o'rnatildi!"
echo ""
echo "📁 Sertifikat fayllari:"
echo "   - ssl/inbola.uz.crt (Certificate)"
echo "   - ssl/inbola.uz.key (Private Key)"
echo ""
echo "🔄 Keyingi qadamlar:"
echo "   1. Nginx konfiguratsiyasini tekshiring"
echo "   2. Docker containers ni qayta ishga tushiring"
echo "   3. HTTPS orqali saytni tekshiring"
echo ""
echo "🌐 Test qilish:"
echo "   - https://$DOMAIN"
echo "   - https://$WWW_DOMAIN"
echo -e "${NC}"

# Restart nginx if it was running
if systemctl is-enabled --quiet nginx; then
    print_step "Nginx qayta ishga tushirilmoqda..."
    systemctl start nginx
    print_success "Nginx ishga tushdi"
fi
