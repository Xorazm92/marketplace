# 🚀 INBOLA Production Deployment Checklist

## ✅ Production Readiness Assessment

### 🔒 Security Requirements
- [ ] **Environment Variables**: Barcha sensitive ma'lumotlar .env faylida
- [ ] **JWT Secrets**: Kuchli va unique JWT secret keylar
- [ ] **Database Credentials**: Xavfsiz database parollar
- [ ] **CORS Configuration**: Faqat kerakli domainlar uchun ochiq
- [ ] **Rate Limiting**: API endpoints uchun rate limiting
- [ ] **Input Validation**: Barcha input validationlar mavjud
- [ ] **SQL Injection Protection**: Prisma ORM ishlatilgan
- [ ] **XSS Protection**: Frontend da sanitization
- [ ] **HTTPS**: SSL sertifikatlar o'rnatilgan
- [ ] **Security Headers**: Nginx da security headerlar

### 🗄️ Database & Performance
- [ ] **Database Indexes**: Muhim fieldlar uchun indexlar
- [ ] **Connection Pooling**: Database connection pool sozlangan
- [ ] **Redis Caching**: Caching strategiyasi amalga oshirilgan
- [ ] **File Upload Limits**: Fayl yuklash cheklovlari
- [ ] **Image Optimization**: Rasm optimizatsiyasi
- [ ] **Database Backup**: Avtomatik backup strategiyasi
- [ ] **Migration Scripts**: Barcha migrationlar test qilingan

### 📊 Monitoring & Logging
- [ ] **Application Logs**: Structured logging
- [ ] **Error Tracking**: Error monitoring setup
- [ ] **Performance Monitoring**: APM tools
- [ ] **Health Checks**: Health endpoint mavjud
- [ ] **Uptime Monitoring**: External monitoring
- [ ] **Database Monitoring**: DB performance tracking

### 🧪 Testing & Quality
- [ ] **Unit Tests**: Backend unit testlar
- [ ] **Integration Tests**: API integration testlar
- [ ] **E2E Tests**: Frontend E2E testlar
- [ ] **Load Testing**: Performance load testlar
- [ ] **Security Testing**: Security vulnerability scan
- [ ] **Code Coverage**: Minimum 80% coverage

### 🚀 Deployment & Infrastructure
- [ ] **Docker Configuration**: Production-ready Dockerfiles
- [ ] **CI/CD Pipeline**: Automated deployment
- [ ] **Environment Separation**: Dev/Staging/Prod environments
- [ ] **Rollback Strategy**: Quick rollback capability
- [ ] **Zero Downtime**: Blue-green deployment
- [ ] **Resource Limits**: Container resource limits
- [ ] **Auto-scaling**: Horizontal scaling setup

## 🔧 Critical Production Fixes Needed

### 1. Environment Variables (.env.prod)
```bash
# Database
DATABASE_URL="postgresql://username:password@host:5432/database"
POSTGRES_PASSWORD="strong_password_here"

# Redis
REDIS_URL="redis://:password@host:6379"
REDIS_PASSWORD="strong_redis_password"

# JWT Secrets (Generate new ones!)
ACCESS_TOKEN_KEY="your_super_secret_jwt_key_here"
REFRESH_TOKEN_KEY="your_super_secret_refresh_key_here"

# SMS Provider
SMS_TOKEN="your_sms_provider_token"
SMS_PROVIDER_URL="https://api.sms-provider.com"

# Frontend
FRONTEND_URL="https://inbola.uz"
NEXT_PUBLIC_API_URL="https://inbola.uz/api"
NEXT_PUBLIC_BASE_URL="https://inbola.uz"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# File Upload
MAX_FILE_SIZE="10485760" # 10MB
UPLOAD_PATH="/app/public/uploads"

# Monitoring
SENTRY_DSN="your_sentry_dsn"
LOG_LEVEL="info"
```

### 2. SSL Sertifikatlar
```bash
# SSL sertifikatlarni olish (Let's Encrypt)
sudo certbot certonly --standalone -d inbola.uz -d www.inbola.uz

# Yoki manual sertifikat
mkdir -p ssl
# inbola.uz.crt va inbola.uz.key fayllarini ssl/ papkasiga joylashtiring
```

### 3. Database Optimizatsiya
```sql
-- Muhim indexlar qo'shish
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_otp_phone ON otp_codes(phone_number);
CREATE INDEX idx_otp_created ON otp_codes(created_at);
```

### 4. Production Environment Setup
```bash
# 1. Server tayyorlash
sudo apt update && sudo apt upgrade -y
sudo apt install docker.io docker-compose nginx certbot -y

# 2. Docker setup
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER

# 3. Loyihani clone qilish
git clone https://github.com/yourusername/inbola-marketplace.git
cd inbola-marketplace

# 4. Environment setup
cp .env.example .env.prod
# .env.prod faylini to'ldiring

# 5. SSL sertifikatlar
sudo certbot certonly --standalone -d inbola.uz

# 6. Deploy
chmod +x final-deployment.sh
./final-deployment.sh
```

## ⚠️ Critical Security Issues to Fix

### 1. SMS Provider Configuration
```typescript
// backend-main/src/services/sms.service.ts
// Haqiqiy SMS provider bilan almashtiring
export class SmsService {
  async sendSms(phone: string, message: string) {
    if (process.env.NODE_ENV === 'production') {
      // Haqiqiy SMS API
      const response = await fetch(process.env.SMS_PROVIDER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SMS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, message })
      });
      return response.json();
    } else {
      // Development mode
      console.log(`SMS to ${phone}: ${message}`);
    }
  }
}
```

### 2. Rate Limiting Enhancement
```typescript
// backend-main/src/main.ts
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

### 3. Input Validation Enhancement
```typescript
// Barcha DTO larda validation qo'shish
import { IsString, IsEmail, IsPhoneNumber, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(2, 50)
  first_name: string;

  @IsPhoneNumber('UZ')
  phone_number: string;

  @IsEmail()
  email: string;
}
```

## 📋 Pre-Launch Checklist

### Final Steps Before Going Live:
1. [ ] Barcha testlar o'tkazildi va muvaffaqiyatli
2. [ ] Production environment variables to'ldirildi
3. [ ] SSL sertifikatlar o'rnatildi
4. [ ] Database backup strategiyasi sozlandi
5. [ ] Monitoring va alerting sozlandi
6. [ ] Load testing o'tkazildi
7. [ ] Security scan o'tkazildi
8. [ ] Documentation yangilandi
9. [ ] Team bilan deployment plan muhokama qilindi
10. [ ] Rollback plan tayyor

### Post-Launch Monitoring:
- [ ] Application logs monitoring
- [ ] Database performance monitoring
- [ ] API response time monitoring
- [ ] Error rate monitoring
- [ ] User activity monitoring
- [ ] Server resource monitoring

## 🚨 Emergency Contacts & Procedures

### Rollback Procedure:
```bash
# Tezkor rollback
docker-compose -f docker-compose.prod.yml down
git checkout previous-stable-tag
./final-deployment.sh
```

### Emergency Contacts:
- DevOps Engineer: [contact]
- Database Admin: [contact]
- Security Team: [contact]
- Product Owner: [contact]

---

**Eslatma**: Bu checklist loyihani production ga chiqarishdan oldin to'liq bajarilishi kerak!
