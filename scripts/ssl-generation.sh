#!/bin/bash
# SSL Certificate Generation Script for INBOLA Marketplace
# Production SSL Setup with Let's Encrypt

set -e

echo "🚀 Starting SSL certificate generation for INBOLA marketplace..."

# Configuration
DOMAIN="inbola.uz"
SUBDOMAINS=("www.inbola.uz" "api.inbola.uz" "admin.inbola.uz" "cdn.inbola.uz")
EMAIL="admin@inbola.uz"
NGINX_CONFIG_PATH="/etc/nginx/sites-available/inbola"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root (use sudo)"
   exit 1
fi

# Install required packages
print_status "Installing required packages..."
apt update
apt install -y certbot python3-certbot-nginx nginx

# Create Nginx configuration
print_status "Creating Nginx configuration..."
cat > $NGINX_CONFIG_PATH << 'EOF'
# INBOLA Marketplace Nginx Configuration
server {
    listen 80;
    server_name inbola.uz www.inbola.uz api.inbola.uz admin.inbola.uz cdn.inbola.uz;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name inbola.uz www.inbola.uz;

    ssl_certificate /etc/letsencrypt/live/inbola.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/inbola.uz/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(self)" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /static/ {
        alias /var/www/inbola/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Uploads
    location /uploads/ {
        alias /var/www/inbola/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

server {
    listen 443 ssl http2;
    server_name api.inbola.uz;

    ssl_certificate /etc/letsencrypt/live/api.inbola.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.inbola.uz/privkey.pem;

    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name admin.inbola.uz;

    ssl_certificate /etc/letsencrypt/live/admin.inbola.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.inbola.uz/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site
ln -sf $NGINX_CONFIG_PATH /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Generate SSL certificates
print_status "Generating SSL certificates with Let's Encrypt..."
certbot --nginx \
    -d $DOMAIN \
    -d www.$DOMAIN \
    -d api.$DOMAIN \
    -d admin.$DOMAIN \
    -d cdn.$DOMAIN \
    --email $EMAIL \
    --agree-tos \
    --non-interactive \
    --staging=false

# Setup auto-renewal
print_status "Setting up auto-renewal..."
(crontab -l 2>/dev/null; echo "0 0 * * * /usr/bin/certbot renew --quiet --nginx") | crontab -

# Test SSL configuration
print_status "Testing SSL configuration..."
openssl x509 -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem -text -noout

# Restart nginx
systemctl restart nginx

# Test SSL with SSL Labs
print_status "Testing SSL with SSL Labs..."
echo "Visit: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"

print_status "✅ SSL certificates successfully installed!"
print_status "🔒 Your domains are now secured with TLS 1.3"
print_status "📅 Auto-renewal is configured for 30 days before expiry"
print_status "🌐 All subdomains are covered: $DOMAIN, www.$DOMAIN, api.$DOMAIN, admin.$DOMAIN, cdn.$DOMAIN"
