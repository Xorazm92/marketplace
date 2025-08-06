# 🌐 INBOLA External Services Configuration

Bu fayl production uchun tashqi xizmatlarni sozlash bo'yicha qo'llanma.

## 📱 SMS Service (Eskiz.uz)

### 1. Eskiz.uz Account Setup
```bash
# 1. https://eskiz.uz saytiga kiring
# 2. Ro'yxatdan o'ting
# 3. API tokenni oling
```

### 2. Environment Variables
```bash
# .env.prod faylida
ESKIZ_EMAIL=your_production_eskiz_email@example.com
ESKIZ_PASSWORD=your_production_eskiz_password
SMS_TOKEN=your_production_sms_token_here
SMS_PROVIDER_URL=https://notify.eskiz.uz/api
```

### 3. Test SMS
```bash
# Backend da test qilish
curl -X POST http://localhost:3001/api/v1/phone-auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+998901234567"}'
```

## 📧 Email Service (Gmail SMTP)

### 1. Gmail App Password Setup
```bash
# 1. Gmail account ga kiring
# 2. 2-Step Verification yoqing
# 3. App Password yarating
# 4. Password ni .env.prod ga qo'shing
```

### 2. Environment Variables
```bash
# .env.prod faylida
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info@inbola.uz
SMTP_PASS=your_production_app_password_here
EMAIL_FROM=INBOLA <noreply@inbola.uz>
```

### 3. Alternative Email Providers
```bash
# SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key

# Mailgun
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@mg.inbola.uz
SMTP_PASS=your_mailgun_password
```

## 💳 Payment Gateways

### 1. Payme Integration

#### Account Setup
```bash
# 1. https://payme.uz ga kiring
# 2. Merchant account yarating
# 3. API credentials oling
```

#### Environment Variables
```bash
# .env.prod faylida
PAYME_MERCHANT_ID=your_production_payme_merchant_id
PAYME_SECRET_KEY=your_production_payme_secret_key
PAYME_ENDPOINT=https://checkout.paycom.uz
```

#### Test Transaction
```bash
# Test to'lov
curl -X POST http://localhost:3001/api/v1/payment/payme/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "order_id": "test_order_123"
  }'
```

### 2. Click Integration

#### Account Setup
```bash
# 1. https://click.uz ga kiring
# 2. Merchant account yarating
# 3. API credentials oling
```

#### Environment Variables
```bash
# .env.prod faylida
CLICK_MERCHANT_ID=your_production_click_merchant_id
CLICK_SECRET_KEY=your_production_click_secret_key
CLICK_ENDPOINT=https://api.click.uz
```

### 3. Uzcard Integration

#### Account Setup
```bash
# 1. Uzcard bilan aloqaga chiqing
# 2. Merchant agreement imzolang
# 3. API credentials oling
```

#### Environment Variables
```bash
# .env.prod faylida
UZCARD_MERCHANT_ID=your_production_uzcard_merchant_id
UZCARD_SECRET_KEY=your_production_uzcard_secret_key
```

## 🗺️ Google Maps API

### 1. Google Cloud Console Setup
```bash
# 1. https://console.cloud.google.com ga kiring
# 2. Yangi project yarating
# 3. Maps JavaScript API yoqing
# 4. API key yarating
# 5. Restrictions qo'ying (domain, IP)
```

### 2. Environment Variables
```bash
# .env.prod faylida
GOOGLE_MAPS_API_KEY=your_production_google_maps_api_key

# Frontend .env.production faylida
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_production_google_maps_api_key
```

## 🔔 Push Notifications (Firebase)

### 1. Firebase Project Setup
```bash
# 1. https://console.firebase.google.com ga kiring
# 2. Yangi project yarating
# 3. Cloud Messaging yoqing
# 4. Service account key yarating
```

### 2. Environment Variables
```bash
# .env.prod faylida
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# Frontend .env.production faylida
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 📊 Analytics Services

### 1. Google Analytics
```bash
# Frontend .env.production faylida
NEXT_PUBLIC_GA_TRACKING_ID=GA-XXXXXXXXX-X
```

### 2. Yandex Metrica
```bash
# Frontend .env.production faylida
NEXT_PUBLIC_YANDEX_METRICA_ID=XXXXXXXX
```

## 🛡️ Security Services

### 1. Sentry (Error Tracking)
```bash
# .env.prod faylida
SENTRY_DSN=https://your_sentry_dsn@sentry.io/project_id
```

### 2. reCAPTCHA
```bash
# Frontend .env.production faylida
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key

# Backend .env.prod faylida
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
```

## 🚚 Delivery Services

### 1. Local Delivery API
```bash
# .env.prod faylida
DELIVERY_API_KEY=your_delivery_api_key
DELIVERY_ENDPOINT=https://api.delivery-service.uz
```

## ✅ Services Test Script

Barcha xizmatlarni test qilish uchun script yarating:

```bash
#!/bin/bash
# test-services.sh

echo "🧪 Testing External Services..."

# Test SMS
echo "📱 Testing SMS..."
curl -s -X POST http://localhost:3001/api/v1/test/sms

# Test Email
echo "📧 Testing Email..."
curl -s -X POST http://localhost:3001/api/v1/test/email

# Test Payment Gateways
echo "💳 Testing Payments..."
curl -s -X POST http://localhost:3001/api/v1/test/payments

echo "✅ Service tests completed!"
```

## 🔧 Configuration Checklist

- [ ] SMS provider (Eskiz.uz) configured
- [ ] Email service (Gmail/SendGrid) configured
- [ ] Payme payment gateway configured
- [ ] Click payment gateway configured
- [ ] Uzcard payment gateway configured
- [ ] Google Maps API configured
- [ ] Firebase push notifications configured
- [ ] Google Analytics configured
- [ ] Sentry error tracking configured
- [ ] All API keys secured in environment variables
- [ ] All services tested in production environment

## 🚨 Security Notes

1. **Never commit API keys to git**
2. **Use environment variables for all secrets**
3. **Restrict API keys by domain/IP when possible**
4. **Regularly rotate API keys**
5. **Monitor API usage and costs**
6. **Set up alerts for unusual activity**

## 📞 Support Contacts

- **Eskiz.uz**: support@eskiz.uz
- **Payme**: support@payme.uz
- **Click**: support@click.uz
- **Google Cloud**: cloud.google.com/support
- **Firebase**: firebase.google.com/support
