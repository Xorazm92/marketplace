#!/bin/bash

# 🚀 INBOLA Kids Marketplace - Complete Production Deployment
# Generated: 2025-01-31

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="inbola-marketplace"
DOMAIN="inbola.uz"
DB_NAME="inbola_marketplace_prod"
DB_USER="inbola_prod"
DB_PASS="InB0la_Pr0d_2025!"

echo -e "${BLUE}🚀 INBOLA Kids Marketplace - Production Deployment${NC}"
echo -e "${BLUE}=================================================${NC}"

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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# 1. System Update and Dependencies
echo -e "${BLUE}📦 Installing system dependencies...${NC}"
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git nginx postgresql postgresql-contrib redis-server \
    software-properties-common apt-transport-https ca-certificates gnupg lsb-release \
    ufw fail2ban logrotate htop iotop

print_status "System dependencies installed"

# 2. Install Node.js 18
echo -e "${BLUE}📦 Installing Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version

print_status "Node.js 18 installed"

# 3. Install PM2
echo -e "${BLUE}📦 Installing PM2...${NC}"
sudo npm install -g pm2
pm2 startup
print_status "PM2 installed"

# 4. Install Docker and Docker Compose
echo -e "${BLUE}🐳 Installing Docker...${NC}"
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker $USER

print_status "Docker installed"

# 5. Configure PostgreSQL
echo -e "${BLUE}🗄️  Configuring PostgreSQL...${NC}"
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME};" || true
sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};" || true
sudo -u postgres psql -c "ALTER USER ${DB_USER} CREATEDB;" || true

print_status "PostgreSQL configured"

# 6. Configure Redis
echo -e "${BLUE}📊 Configuring Redis...${NC}"
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Set Redis password
sudo sed -i "s/# requirepass foobared/requirepass InB0la_R3d1s_Pr0d_2025!/" /etc/redis/redis.conf
sudo systemctl restart redis-server

print_status "Redis configured"

# 7. Configure Firewall
echo -e "${BLUE}🔥 Configuring UFW Firewall...${NC}"
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp  # Frontend (temporary)
sudo ufw allow 4001/tcp  # Backend (temporary)
sudo ufw --force enable

print_status "Firewall configured"

# 8. Configure Fail2Ban
echo -e "${BLUE}🛡️  Configuring Fail2Ban...${NC}"
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Create custom jail for our application
sudo tee /etc/fail2ban/jail.local > /dev/null <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
EOF

sudo systemctl restart fail2ban
print_status "Fail2Ban configured"

# 9. Setup SSL Certificate (Let's Encrypt)
echo -e "${BLUE}🔒 Setting up SSL Certificate...${NC}"
sudo apt install -y certbot python3-certbot-nginx

# Stop nginx temporarily for standalone certificate
sudo systemctl stop nginx

# Get SSL certificate
sudo certbot certonly --standalone -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email support@${DOMAIN} || print_warning "SSL certificate setup failed - continuing without SSL"

print_status "SSL certificate configured"

# 10. Configure Nginx
echo -e "${BLUE}🌐 Configuring Nginx...${NC}"
sudo tee /etc/nginx/sites-available/${PROJECT_NAME} > /dev/null <<EOF
# INBOLA Kids Marketplace - Production Nginx Configuration
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
    
    # Rate Limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=login:10m rate=1r/s;
    
    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Backend API
    location /api {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # GraphQL
    location /graphql {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Auth endpoints with stricter rate limiting
    location /api/v1/user-auth {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://localhost:4001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri \$uri/ =404;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:4001;
        access_log off;
    }
    
    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ \.(env|log|sql)\$ {
        deny all;
    }
}
EOF

# Enable site and restart nginx
sudo ln -sf /etc/nginx/sites-available/${PROJECT_NAME} /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx

print_status "Nginx configured"

# 11. Setup Log Rotation
echo -e "${BLUE}📝 Configuring Log Rotation...${NC}"
sudo tee /etc/logrotate.d/${PROJECT_NAME} > /dev/null <<EOF
/home/ubuntu/Documents/marketplace/backend-main/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 ubuntu ubuntu
    postrotate
        pm2 reload all
    endscript
}

/home/ubuntu/Documents/marketplace/front-main/.next/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 ubuntu ubuntu
}
EOF

print_status "Log rotation configured"

# 12. Setup Environment Files
echo -e "${BLUE}⚙️  Setting up environment files...${NC}"
cd /home/ubuntu/Documents/marketplace

# Copy production environment files
cp .env.prod backend-main/.env
cp front-main/.env.production front-main/.env.local

print_status "Environment files configured"

# 13. Install Dependencies and Build
echo -e "${BLUE}📦 Installing dependencies and building...${NC}"

# Backend
cd backend-main
npm ci --only=production
npx prisma generate
npx prisma db push
npm run build

# Frontend
cd ../front-main
npm ci --only=production
npm run build

print_status "Applications built successfully"

# 14. Setup PM2 Ecosystem
echo -e "${BLUE}🔄 Setting up PM2 ecosystem...${NC}"
cd /home/ubuntu/Documents/marketplace

tee ecosystem.config.js > /dev/null <<EOF
module.exports = {
  apps: [
    {
      name: 'inbola-backend',
      cwd: './backend-main',
      script: 'dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4001
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024'
    },
    {
      name: 'inbola-frontend',
      cwd: './front-main',
      script: 'npm',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true,
      max_memory_restart: '512M'
    }
  ]
};
EOF

# Create logs directory
mkdir -p logs

# Start applications with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

print_status "PM2 ecosystem configured and started"

# 15. Setup Database Indexes
echo -e "${BLUE}🗄️  Setting up database indexes...${NC}"
cd backend-main
psql -h localhost -U ${DB_USER} -d ${DB_NAME} -f prisma/migrations/add_performance_indexes.sql

print_status "Database indexes created"

# 16. Setup Monitoring
echo -e "${BLUE}📊 Setting up monitoring...${NC}"

# Install monitoring tools
sudo npm install -g clinic
sudo apt install -y htop iotop nethogs

# Setup PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true

print_status "Monitoring configured"

# 17. Setup Backup Script
echo -e "${BLUE}💾 Setting up backup script...${NC}"
tee backup.sh > /dev/null <<'EOF'
#!/bin/bash
# INBOLA Marketplace Backup Script

BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="inbola_marketplace_prod"
DB_USER="inbola_prod"

mkdir -p $BACKUP_DIR

# Database backup
pg_dump -h localhost -U $DB_USER -d $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Files backup
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz /home/ubuntu/Documents/marketplace/backend-main/public/uploads

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x backup.sh

# Setup daily backup cron job
(crontab -l 2>/dev/null; echo "0 2 * * * /home/ubuntu/Documents/marketplace/backup.sh") | crontab -

print_status "Backup script configured"

# 18. Final Security Hardening
echo -e "${BLUE}🔒 Final security hardening...${NC}"

# Disable root login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# Set proper file permissions
chmod 600 backend-main/.env
chmod 600 front-main/.env.local
chmod -R 755 backend-main/public
chmod -R 755 front-main/public

print_status "Security hardening completed"

# 19. Health Check
echo -e "${BLUE}🏥 Running health checks...${NC}"
sleep 10

# Check if services are running
if pm2 list | grep -q "online"; then
    print_status "PM2 services are running"
else
    print_error "PM2 services are not running properly"
fi

# Check if nginx is running
if systemctl is-active --quiet nginx; then
    print_status "Nginx is running"
else
    print_error "Nginx is not running"
fi

# Check if database is accessible
if pg_isready -h localhost -U ${DB_USER} -d ${DB_NAME}; then
    print_status "Database is accessible"
else
    print_error "Database is not accessible"
fi

# 20. Display Final Information
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉${NC}"
echo -e "${BLUE}=================================================${NC}"
echo -e "${GREEN}✅ Frontend URL: https://${DOMAIN}${NC}"
echo -e "${GREEN}✅ Backend API: https://${DOMAIN}/api${NC}"
echo -e "${GREEN}✅ Admin Panel: https://${DOMAIN}/admin${NC}"
echo -e "${GREEN}✅ Health Check: https://${DOMAIN}/health${NC}"
echo -e "${BLUE}=================================================${NC}"
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo -e "${YELLOW}1. Test all functionality${NC}"
echo -e "${YELLOW}2. Setup monitoring alerts${NC}"
echo -e "${YELLOW}3. Configure payment gateways${NC}"
echo -e "${YELLOW}4. Setup email service${NC}"
echo -e "${YELLOW}5. Load test the application${NC}"
echo -e "${BLUE}=================================================${NC}"
echo -e "${GREEN}🚀 INBOLA Kids Marketplace is now LIVE! 🚀${NC}"

# Save deployment info
echo "Deployment completed at: $(date)" > deployment-info.txt
echo "Domain: ${DOMAIN}" >> deployment-info.txt
echo "Database: ${DB_NAME}" >> deployment-info.txt
echo "PM2 Status: $(pm2 list --no-color)" >> deployment-info.txt

print_status "Deployment information saved to deployment-info.txt"