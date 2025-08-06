#!/bin/bash

# ==========================================
# INBOLA Marketplace - SSL Setup Script
# ==========================================
# Let's Encrypt SSL certificate setup for inbola.uz

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔒 INBOLA Marketplace - SSL Setup${NC}"
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
    echo "sudo ./setup-ssl.sh deb ishga tushiring"
    exit 1
fi

# Domain configuration
DOMAIN="inbola.uz"
EMAIL="admin@inbola.uz"  # O'zgartirishingiz mumkin

echo -e "${BLUE}📋 SSL Sertifikat Sozlamalari:${NC}"
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo "Subdomains: www.$DOMAIN, api.$DOMAIN, admin.$DOMAIN"
echo ""

read -p "Davom etishni xohlaysizmi? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Bekor qilindi."
    exit 1
fi

echo -e "${BLUE}🔧 Step 1: Certbot o'rnatish${NC}"

# Install certbot
if ! command -v certbot &> /dev/null; then
    apt update
    apt install -y certbot python3-certbot-nginx
    print_status "Certbot o'rnatildi"
else
    print_status "Certbot allaqachon o'rnatilgan"
fi

echo -e "${BLUE}🌐 Step 2: Nginx konfiguratsiyasini nusxalash${NC}"

# Copy simple production nginx config
cp nginx-inbola-simple.conf /etc/nginx/sites-available/inbola.uz
ln -sf /etc/nginx/sites-available/inbola.uz /etc/nginx/sites-enabled/

# Remove default nginx config
rm -f /etc/nginx/sites-enabled/default

print_status "Nginx konfiguratsiyasi nusxalandi"

echo -e "${BLUE}🔍 Step 3: Nginx konfiguratsiyasini tekshirish${NC}"

# Test nginx configuration
if nginx -t; then
    print_status "Nginx konfiguratsiyasi to'g'ri"
else
    print_error "Nginx konfiguratsiyasida xatolik bor"
    exit 1
fi

echo -e "${BLUE}🔄 Step 4: Nginx ni qayta ishga tushirish${NC}"

# Restart nginx
systemctl restart nginx
systemctl enable nginx
print_status "Nginx qayta ishga tushirildi"

echo -e "${BLUE}📁 Step 5: Certbot papkasini yaratish${NC}"

# Create certbot directory
mkdir -p /var/www/certbot
chown -R www-data:www-data /var/www/certbot
print_status "Certbot papkasi yaratildi"

echo -e "${BLUE}🔒 Step 6: SSL sertifikat olish${NC}"

# Get SSL certificate
certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN \
    -d api.$DOMAIN \
    -d admin.$DOMAIN

if [ $? -eq 0 ]; then
    print_status "SSL sertifikat muvaffaqiyatli olindi"
else
    print_error "SSL sertifikat olishda xatolik"
    exit 1
fi

echo -e "${BLUE}🔄 Step 7: Nginx ni SSL bilan qayta ishga tushirish${NC}"

# Restart nginx with SSL
systemctl restart nginx

if [ $? -eq 0 ]; then
    print_status "Nginx SSL bilan ishga tushirildi"
else
    print_error "Nginx SSL bilan ishga tushmadi"
    exit 1
fi

echo -e "${BLUE}⏰ Step 8: Avtomatik yangilanish sozlash${NC}"

# Setup auto-renewal
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
print_status "SSL sertifikat avtomatik yangilanish sozlandi"

echo -e "${BLUE}🧪 Step 9: SSL sertifikatni tekshirish${NC}"

# Test SSL certificate
if curl -s https://$DOMAIN > /dev/null; then
    print_status "SSL sertifikat ishlayapti"
else
    print_warning "SSL sertifikatni tekshirishda muammo"
fi

echo "=================================================="
echo -e "${GREEN}🎉 SSL SERTIFIKAT MUVAFFAQIYATLI O'RNATILDI!${NC}"
echo ""
echo -e "${BLUE}📋 Natijalar:${NC}"
echo "• https://$DOMAIN - Asosiy sayt"
echo "• https://www.$DOMAIN - WWW versiya"
echo "• https://api.$DOMAIN - API backend"
echo "• https://admin.$DOMAIN - Admin panel"
echo ""
echo -e "${BLUE}🔧 Keyingi qadamlar:${NC}"
echo "1. DNS sozlamalarini tekshiring"
echo "2. Firewall da 443 portni oching"
echo "3. SSL sertifikatni test qiling"
echo ""
echo -e "${BLUE}🔍 Tekshirish buyruqlari:${NC}"
echo "• SSL test: curl -I https://$DOMAIN"
echo "• Nginx status: systemctl status nginx"
echo "• SSL sertifikat: certbot certificates"
echo ""
echo -e "${GREEN}✅ SSL sozlash tugallandi!${NC}"
echo "=================================================="
