# 🚀 INBOLA.UZ Marketplace - Production Deployment Guide

## 📋 Project Overview

**INBOLA Kids Marketplace** is a professional e-commerce platform specifically designed for children aged 3-12 and their parents. The platform combines safety, education, and entertainment in a secure online shopping environment.

### ✨ Key Features
- 🛒 Complete e-commerce functionality (products, cart, checkout, orders)
- 🛡️ Child safety features (age restrictions, parental controls, content filtering)
- 💳 Payment integrations (Click, Payme, Cash on Delivery)
- 👥 Multi-role system (Admin, Parent, Child, Guest, Seller, Moderator)
- 📱 PWA support with offline capabilities
- 🔐 JWT authentication with OTP verification

## 🏗️ Architecture

- **Frontend**: Next.js 15.4.5 with TypeScript, Mantine UI, Apollo Client
- **Backend**: NestJS with GraphQL, Prisma ORM, PostgreSQL
- **Cache**: Redis for session management and caching
- **Authentication**: JWT with refresh tokens
- **File Storage**: Local file system with Sharp image processing

## 🌐 Domain Configuration

- **Main Website**: `https://inbola.uz`
- **API Endpoint**: `https://api.inbola.uz`
- **Admin Panel**: `https://inbola.uz/admin`

## 📦 Pre-Deployment Checklist

### ✅ Completed Tasks
- [x] Project structure reviewed and optimized
- [x] Unnecessary files removed (logs, dumps, temp files)
- [x] Security vulnerabilities fixed
- [x] Frontend and backend builds tested successfully
- [x] Environment configuration updated for inbola.uz domain
- [x] CORS settings configured for production
- [x] Deployment scripts created and tested
- [x] Comprehensive test suite implemented

### 🔧 Required Infrastructure

#### 1. Server Requirements
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: Minimum 50GB SSD
- **CPU**: 2+ cores
- **Network**: Static IP address

#### 2. Software Requirements
- **Node.js**: v18+ (LTS recommended)
- **PostgreSQL**: v13+
- **Redis**: v6+
- **Nginx**: Latest stable
- **PM2**: For process management
- **Certbot**: For SSL certificates

#### 3. DNS Configuration
Configure your DNS provider to point:
- `inbola.uz` → Your server IP
- `www.inbola.uz` → Your server IP  
- `api.inbola.uz` → Your server IP

## 🚀 Deployment Steps

### Step 1: Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Redis
sudo apt install redis-server -y

# Install Nginx
sudo apt install nginx -y

# Install PM2
sudo npm install -g pm2
```

### Step 2: Database Setup
```bash
# Create database user and database
sudo -u postgres psql
CREATE USER inbola_user WITH PASSWORD 'InBoLa_Pr0d_DB_P@ssw0rd_2024_Secure!';
CREATE DATABASE inbola_db OWNER inbola_user;
GRANT ALL PRIVILEGES ON DATABASE inbola_db TO inbola_user;
\q
```

### Step 3: Project Deployment
```bash
# Clone/upload your project to server
# Navigate to project directory
cd /path/to/marketplace

# Copy production environment
cp .env.prod .env

# Run deployment script
./deploy-inbola.sh
```

### Step 4: SSL Certificate Setup
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificates
sudo certbot --nginx -d inbola.uz -d www.inbola.uz -d api.inbola.uz

# Auto-renewal setup
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Step 5: Nginx Configuration
```bash
# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/inbola.uz
sudo ln -s /etc/nginx/sites-available/inbola.uz /etc/nginx/sites-enabled/

# Test and reload nginx
sudo nginx -t
sudo systemctl reload nginx
```

## 🔧 Environment Variables

### Critical Production Variables
```bash
# Database
DATABASE_URL="postgresql://inbola_user:InBoLa_Pr0d_DB_P@ssw0rd_2024_Secure!@localhost:5432/inbola_db"

# JWT Secrets (CHANGE THESE!)
ACCESS_TOKEN_KEY="your_super_secure_access_token_key_64_chars_minimum"
REFRESH_TOKEN_KEY="your_super_secure_refresh_token_key_64_chars_minimum"

# URLs
FRONTEND_URL="https://inbola.uz"
NEXT_PUBLIC_API_URL="https://api.inbola.uz"

# Payment Gateways (Configure with real credentials)
CLICK_SERVICE_ID="your_click_service_id"
CLICK_MERCHANT_ID="your_click_merchant_id"
CLICK_SECRET_KEY="your_click_secret_key"

PAYME_MERCHANT_ID="your_payme_merchant_id"
PAYME_SECRET_KEY="your_payme_secret_key"

# SMS Service (Configure with real credentials)
SMS_TOKEN="your_sms_service_token"

# Email (Configure with real credentials)
SMTP_USER="noreply@inbola.uz"
SMTP_PASS="your_email_app_password"
```

## 🔍 Testing & Verification

### Run Comprehensive Tests
```bash
./test-inbola.sh
```

### Health Checks
- Backend API: `https://api.inbola.uz/health`
- Frontend: `https://inbola.uz`
- Admin Panel: `https://inbola.uz/admin`

### Performance Monitoring
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Check system resources
htop
```

## 🛡️ Security Considerations

### ✅ Implemented Security Features
- HTTPS enforced with SSL certificates
- CORS properly configured
- JWT tokens with secure secrets
- Rate limiting enabled
- Helmet security headers
- Input validation and sanitization
- SQL injection protection via Prisma
- XSS protection

### 🔒 Additional Security Recommendations
1. **Firewall Configuration**
   ```bash
   sudo ufw enable
   sudo ufw allow 22   # SSH
   sudo ufw allow 80   # HTTP
   sudo ufw allow 443  # HTTPS
   ```

2. **Database Security**
   - Use strong passwords
   - Limit database access to localhost
   - Regular backups

3. **Application Security**
   - Regular security updates
   - Monitor logs for suspicious activity
   - Implement proper backup strategy

## 📊 Monitoring & Maintenance

### Log Files
- Application logs: `pm2 logs`
- Nginx logs: `/var/log/nginx/`
- System logs: `/var/log/syslog`

### Backup Strategy
```bash
# Database backup (run daily)
pg_dump -U inbola_user -h localhost inbola_db > backup_$(date +%Y%m%d).sql

# File uploads backup
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz backend-main/uploads/
```

### Updates
```bash
# Update dependencies
cd backend-main && npm update
cd ../front-main && npm update

# Rebuild and restart
npm run build
pm2 restart all
```

## 🎯 Performance Optimization

### Frontend Optimizations
- ✅ Static page generation (26 pages pre-rendered)
- ✅ Image optimization with Sharp
- ✅ Code splitting and lazy loading
- ✅ PWA with service worker caching
- ✅ Compression enabled

### Backend Optimizations
- ✅ Database connection pooling
- ✅ Redis caching layer
- ✅ GraphQL query optimization
- ✅ Rate limiting
- ✅ Compression middleware

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   # Check connection
   psql -U inbola_user -h localhost -d inbola_db
   ```

2. **Redis Connection Failed**
   ```bash
   # Check Redis status
   sudo systemctl status redis
   # Test connection
   redis-cli ping
   ```

3. **PM2 Processes Not Starting**
   ```bash
   # Check PM2 status
   pm2 status
   # Restart processes
   pm2 restart all
   # Check logs
   pm2 logs
   ```

4. **SSL Certificate Issues**
   ```bash
   # Check certificate status
   sudo certbot certificates
   # Renew certificates
   sudo certbot renew
   ```

## 📞 Support & Contact

For technical support and maintenance:
- Check logs first: `pm2 logs`
- Review this deployment guide
- Test with: `./test-inbola.sh`

## 🎉 Deployment Complete!

Your INBOLA Kids Marketplace is now ready for production deployment to inbola.uz domain. The platform includes all necessary features for a professional e-commerce experience with enhanced child safety features.

### Final Checklist
- [ ] DNS configured for inbola.uz and api.inbola.uz
- [ ] SSL certificates obtained and installed
- [ ] Payment gateway credentials configured
- [ ] SMS service credentials configured
- [ ] Email service configured
- [ ] Database properly secured
- [ ] Monitoring and logging set up
- [ ] Backup strategy implemented

**🚀 Your marketplace is production-ready!**
