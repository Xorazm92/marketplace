// Production Payment Provider Configuration
// Uzbekistan Marketplace - INBOLA

export const paymentProviders = {
  // CLICK Payment System
  click: {
    merchantId: process.env.CLICK_MERCHANT_ID || 'YOUR_CLICK_MERCHANT_ID',
    serviceId: process.env.CLICK_SERVICE_ID || 'YOUR_CLICK_SERVICE_ID',
    secretKey: process.env.CLICK_SECRET_KEY || 'YOUR_CLICK_SECRET_KEY',
    baseUrl: 'https://my.click.uz/services/pay',
    testMode: process.env.NODE_ENV === 'development',
    endpoints: {
      prepare: '/prepare',
      complete: '/complete',
      check: '/check',
      cancel: '/cancel',
      refund: '/refund'
    },
    3ds: {
      enabled: true,
      redirectUrl: 'https://inbola.uz/payment/3ds/click',
      returnUrl: 'https://inbola.uz/payment/return/click'
    },
    currencies: ['UZS', 'USD'],
    cardTypes: ['UzCard', 'Humo', 'Visa', 'Mastercard']
  },

  // PAYME Payment System
  payme: {
    merchantId: process.env.PAYME_MERCHANT_ID || 'YOUR_PAYME_MERCHANT_ID',
    login: process.env.PAYME_LOGIN || 'YOUR_PAYME_LOGIN',
    password: process.env.PAYME_PASSWORD || 'YOUR_PAYME_PASSWORD',
    baseUrl: 'https://checkout.paycom.uz/api',
    testMode: process.env.NODE_ENV === 'development',
    endpoints: {
      create: '/create',
      check: '/check',
      cancel: '/cancel',
      refund: '/refund',
      receipt: '/receipt'
    },
    3ds: {
      enabled: true,
      redirectUrl: 'https://inbola.uz/payment/3ds/payme',
      returnUrl: 'https://inbola.uz/payment/return/payme'
    },
    currencies: ['UZS'],
    cardTypes: ['UzCard', 'Humo', 'Visa', 'Mastercard']
  },

  // UZUM Payment Gateway
  uzum: {
    merchantId: process.env.UZUM_MERCHANT_ID || 'YOUR_UZUM_MERCHANT_ID',
    apiKey: process.env.UZUM_API_KEY || 'YOUR_UZUM_API_KEY',
    secretKey: process.env.UZUM_SECRET_KEY || 'YOUR_UZUM_SECRET_KEY',
    baseUrl: 'https://api.uzum.uz/payment',
    testMode: process.env.NODE_ENV === 'development',
    endpoints: {
      create: '/v1/payment/create',
      check: '/v1/payment/check',
      cancel: '/v1/payment/cancel',
      refund: '/v1/payment/refund'
    },
    3ds: {
      enabled: true,
      redirectUrl: 'https://inbola.uz/payment/3ds/uzum',
      returnUrl: 'https://inbola.uz/payment/return/uzum'
    },
    currencies: ['UZS', 'USD'],
    cardTypes: ['UzCard', 'Humo', 'Visa', 'Mastercard', 'UnionPay']
  }
};

// 3D-Secure Configuration
export const secure3D = {
  enabled: true,
  timeout: 300000, // 5 minutes
  maxAttempts: 3,
  redirectUrls: {
    success: 'https://inbola.uz/payment/success',
    failure: 'https://inbola.uz/payment/failure',
    cancel: 'https://inbola.uz/payment/cancel'
  },
  webhookUrls: {
    click: 'https://api.inbola.uz/webhooks/click',
    payme: 'https://api.inbola.uz/webhooks/payme',
    uzum: 'https://api.inbola.uz/webhooks/uzum'
  }
};

// Production Webhook Handlers
export const webhookConfig = {
  click: {
    secretKey: process.env.CLICK_WEBHOOK_SECRET,
    ipWhitelist: ['185.74.5.1', '185.74.5.2', '185.74.5.3'],
    endpoints: {
      prepare: '/webhooks/click/prepare',
      complete: '/webhooks/click/complete',
      check: '/webhooks/click/check'
    }
  },
  payme: {
    secretKey: process.env.PAYME_WEBHOOK_SECRET,
    endpoints: {
      create: '/webhooks/payme/create',
      check: '/webhooks/payme/check',
      cancel: '/webhooks/payme/cancel'
    }
  },
  uzum: {
    secretKey: process.env.UZUM_WEBHOOK_SECRET,
    endpoints: {
      status: '/webhooks/uzum/status',
      refund: '/webhooks/uzum/refund'
    }
  }
};

// Test Card Numbers (Uzbekistan)
export const testCards = {
  uzcard: {
    number: '8600499999999999',
    expiry: '12/25',
    cvv: '123',
    holder: 'TEST USER'
  },
  humo: {
    number: '9860009999999999',
    expiry: '12/25',
    cvv: '123',
    holder: 'TEST USER'
  },
  visa: {
    number: '4000000000000002',
    expiry: '12/25',
    cvv: '123',
    holder: 'TEST USER'
  },
  mastercard: {
    number: '5555555555554444',
    expiry: '12/25',
    cvv: '123',
    holder: 'TEST USER'
  }
};

// Production Environment Variables Template
export const envTemplate = `
# Payment Providers
CLICK_MERCHANT_ID=your_click_merchant_id
CLICK_SERVICE_ID=your_click_service_id
CLICK_SECRET_KEY=your_click_secret_key
CLICK_WEBHOOK_SECRET=your_click_webhook_secret

PAYME_MERCHANT_ID=your_payme_merchant_id
PAYME_LOGIN=your_payme_login
PAYME_PASSWORD=your_payme_password
PAYME_WEBHOOK_SECRET=your_payme_webhook_secret

UZUM_MERCHANT_ID=your_uzum_merchant_id
UZUM_API_KEY=your_uzum_api_key
UZUM_SECRET_KEY=your_uzum_secret_key
UZUM_WEBHOOK_SECRET=your_uzum_webhook_secret

# 3D-Secure
THREEDS_RETURN_URL=https://inbola.uz/payment/return
THREEDS_WEBHOOK_URL=https://api.inbola.uz/webhooks/3ds

# Uzbekistan Specific
UZ_TAX_RATE=15
UZ_CURRENCY=UZS
UZ_LOCALE=uz-UZ
`;

// Production SSL/TLS Configuration
export const sslConfig = {
  certificate: {
    domain: 'inbola.uz',
    subdomains: ['www.inbola.uz', 'api.inbola.uz', 'cdn.inbola.uz'],
    provider: 'Let's Encrypt',
    autoRenew: true,
    renewDays: 30
  },
  tls: {
    minVersion: 'TLSv1.2',
    maxVersion: 'TLSv1.3',
    ciphers: [
      'TLS_AES_256_GCM_SHA384',
      'TLS_CHACHA20_POLY1305_SHA256',
      'TLS_AES_128_GCM_SHA256'
    ]
  }
};
