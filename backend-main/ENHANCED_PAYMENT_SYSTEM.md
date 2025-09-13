# 💳 Enhanced Payment System Documentation

The INBOLA Kids Marketplace now features a comprehensive, production-ready payment system supporting multiple Uzbekistan payment gateways and international payment methods.

## 🎯 Supported Payment Methods

### 🇺🇿 Local Payment Gateways
- **Click** - Uzbekistan's leading payment system
- **Payme** - Popular mobile payment solution
- **Uzum** - Modern digital payment platform

### 🌍 International Payment Methods
- **Card Payments** - Visa, MasterCard, etc.
- **Stripe** - International payment processing
- **Cash on Delivery** - Traditional payment method

## 🚀 Quick Start

### 1. Environment Configuration

Copy the example environment file and configure your payment credentials:

```bash
cp .env.example .env
```

Update the following sections in your `.env` file:

```env
# Click Configuration
CLICK_MERCHANT_ID=\"your-merchant-id\"
CLICK_SECRET_KEY=\"your-secret-key\"
CLICK_SERVICE_ID=\"your-service-id\"

# Payme Configuration
PAYME_MERCHANT_ID=\"your-merchant-id\"
PAYME_SECRET_KEY=\"your-secret-key\"

# Uzum Configuration
UZUM_MERCHANT_ID=\"your-merchant-id\"
UZUM_SECRET_KEY=\"your-secret-key\"
UZUM_API_KEY=\"your-api-key\"
```

### 2. Database Setup

The payment system uses the existing database schema with the `OrderPayment` table for transaction tracking.

### 3. API Usage

#### Process Payment

```typescript
// POST /api/payment/process/:orderId
const paymentData = {
  method: 'CLICK', // 'CLICK' | 'PAYME' | 'UZUM' | 'CARD' | 'CASH_ON_DELIVERY'
  returnUrl: 'https://yourapp.com/payment/success',
  cancelUrl: 'https://yourapp.com/payment/cancel',
  description: 'Payment for order #123'
};

const response = await fetch(`/api/payment/process/${orderId}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(paymentData)
});
```

## 📋 API Endpoints

### Payment Processing

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment/process/:orderId` | Process payment for order |
| GET | `/api/payment/status/:orderId` | Get payment status |
| POST | `/api/payment/refund/:paymentId` | Process refund (Admin only) |

### Click Payment Gateway

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment/click/create` | Create Click payment |
| POST | `/api/payment/click/callback` | Handle Click webhook |
| GET | `/api/payment/click/verify` | Verify Click payment |
| POST | `/api/payment/click/refund` | Process Click refund |

### Payme Payment Gateway

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment/payme/create` | Create Payme payment |
| POST | `/api/payment/payme/callback` | Handle Payme JSON-RPC |
| GET | `/api/payment/payme/verify` | Verify Payme payment |
| GET | `/api/payment/payme/status/:paymentId` | Check payment status |
| POST | `/api/payment/payme/refund` | Process Payme refund |

### Uzum Payment Gateway

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment/uzum/create` | Create Uzum payment |
| POST | `/api/payment/uzum/callback` | Handle Uzum webhook |
| GET | `/api/payment/uzum/verify` | Verify Uzum payment |
| GET | `/api/payment/uzum/status/:paymentId` | Check payment status |
| POST | `/api/payment/uzum/refund` | Process Uzum refund |

### Webhook Endpoints (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment/webhooks/click` | Click webhook handler |
| POST | `/api/payment/webhooks/payme` | Payme webhook handler |
| POST | `/api/payment/webhooks/uzum` | Uzum webhook handler |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payment/admin/statistics` | Get payment statistics |
| GET | `/api/payment/history/:userId` | Get user payment history |

## 🔧 Payment Gateway Integration

### Click Integration

```typescript
// Create Click Payment
const clickPayment = {
  order_id: 123,
  amount: 100000, // in UZS
  return_url: 'https://yourapp.com/success',
  description: 'Order payment'
};

// Click uses MD5 signature verification
// Signature = MD5(service_id + merchant_id + amount + transaction_param + secret_key)
```

**Click Callback Flow:**
1. **Prepare (action=0)** - Validate payment possibility
2. **Complete (action=1)** - Process actual payment

### Payme Integration

```typescript
// Create Payme Payment
const paymePayment = {
  order_id: 123,
  amount: 100000, // converted to tiyin (x100)
  return_url: 'https://yourapp.com/success',
  description: 'Order payment'
};

// Payme uses Base64 encoded payment URL
```

**Payme JSON-RPC Methods:**
- `CheckPerformTransaction` - Validate transaction
- `CreateTransaction` - Create transaction
- `PerformTransaction` - Complete payment
- `CancelTransaction` - Cancel/refund
- `CheckTransaction` - Get transaction status
- `GetStatement` - Get transaction list

### Uzum Integration

```typescript
// Create Uzum Payment
const uzumPayment = {
  order_id: 123,
  amount: 100000, // in UZS (converted to tiyin internally)
  return_url: 'https://yourapp.com/success',
  cancel_url: 'https://yourapp.com/cancel',
  description: 'Order payment'
};

// Uzum uses SHA256 signature verification
```

## 🔒 Security Features

### Signature Verification
- **Click**: MD5 hash verification
- **Payme**: Built-in JSON-RPC security
- **Uzum**: SHA256 signature verification

### Input Validation
- Amount validation (positive numbers only)
- Order existence verification
- Duplicate payment prevention
- Payment status validation

### Error Handling
- Comprehensive error responses
- Graceful failure handling
- Transaction rollback on errors
- Detailed logging for debugging

## 📊 Payment Status Flow

```
[PENDING] → [PAID] → [COMPLETED]
    ↓         ↓
[FAILED]  [REFUNDED]
    ↓         ↓
[CANCELLED] [PARTIALLY_REFUNDED]
```

### Status Meanings
- **PENDING**: Payment initiated, awaiting completion
- **PAID**: Payment successful, funds received
- **FAILED**: Payment failed or rejected
- **CANCELLED**: Payment cancelled by user/system
- **REFUNDED**: Full refund processed
- **PARTIALLY_REFUNDED**: Partial refund processed

## 🧪 Testing

### Unit Tests

```bash
# Run payment service unit tests
npm run test src/test/unit/payment

# Run specific payment gateway tests
npm run test -- --testNamePattern=\"ClickService\"
npm run test -- --testNamePattern=\"PaymeService\"
npm run test -- --testNamePattern=\"UzumService\"
```

### Integration Tests

```bash
# Run payment integration tests
npm run test:e2e src/test/integration/enhanced-payment-integration.e2e-spec.ts

# Run all payment tests
npm run test:payment
```

### Test Data

```typescript
// Test Card Numbers
const testCards = {
  visa: '4111111111111111',
  mastercard: '5555555555554444',
  declined: '4000000000000002'
};

// Test Amounts (UZS)
const testAmounts = {
  small: 10000,    // 100 UZS
  medium: 100000,  // 1,000 UZS
  large: 1000000   // 10,000 UZS
};
```

## 🚨 Error Codes

### Click Error Codes
| Code | Description |
|------|-------------|
| 0 | Success |
| -1 | Invalid signature |
| -2 | Invalid service ID |
| -3 | Invalid transaction ID |
| -4 | Payment not found |
| -5 | Unknown action |

### Payme Error Codes
| Code | Description |
|------|-------------|
| -32300 | Transport error |
| -32400 | Bad request |
| -32504 | Access denied |
| -31001 | Invalid amount |
| -31003 | Transaction not found |
| -31050 | Order not found |

### Uzum Error Codes
| Code | Description |
|------|-------------|
| 0 | Success |
| -1 | Payment failed |
| -2 | Invalid signature |
| -3 | Invalid merchant |
| -4 | Order not found |

## 📱 Frontend Integration

### React/Next.js Example

```typescript
import { useState } from 'react';

interface PaymentData {
  method: 'CLICK' | 'PAYME' | 'UZUM' | 'CARD';
  returnUrl?: string;
  cancelUrl?: string;
  description?: string;
  cardDetails?: {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    cardHolderName: string;
  };
}

const PaymentComponent = ({ orderId }: { orderId: number }) => {
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const processPayment = async (paymentData: PaymentData) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/payment/process/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();
      
      if (result.paymentUrl) {
        // Redirect to payment gateway
        window.location.href = result.paymentUrl;
      } else if (result.status === 'PAID') {
        // Payment completed immediately (card payments)
        window.location.href = '/payment/success';
      }
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=\"payment-methods\">
      <button 
        onClick={() => processPayment({ method: 'CLICK' })}
        disabled={loading}
      >
        Pay with Click
      </button>
      
      <button 
        onClick={() => processPayment({ method: 'PAYME' })}
        disabled={loading}
      >
        Pay with Payme
      </button>
      
      <button 
        onClick={() => processPayment({ method: 'UZUM' })}
        disabled={loading}
      >
        Pay with Uzum
      </button>
    </div>
  );
};
```

## 🔧 Configuration

### Production Deployment

1. **Environment Variables**
   ```bash
   NODE_ENV=production
   ENABLE_PAYMENT_MOCKS=false
   ```

2. **Webhook URLs**
   ```bash
   # Make sure these are accessible from the internet
   CLICK_WEBHOOK_URL=\"https://yourdomain.com/api/payment/webhooks/click\"
   PAYME_WEBHOOK_URL=\"https://yourdomain.com/api/payment/webhooks/payme\"
   UZUM_WEBHOOK_URL=\"https://yourdomain.com/api/payment/webhooks/uzum\"
   ```

3. **SSL Certificate**
   - All payment gateways require HTTPS
   - Ensure valid SSL certificate

### Development Setup

1. **Local Testing with ngrok**
   ```bash
   # Install ngrok
   npm install -g ngrok
   
   # Expose local server
   ngrok http 4000
   
   # Update webhook URLs in .env
   CLICK_WEBHOOK_URL=\"https://abc123.ngrok.io/api/payment/webhooks/click\"
   ```

2. **Mock Responses**
   ```bash
   # Enable mock responses for development
   ENABLE_PAYMENT_MOCKS=true
   NODE_ENV=development
   ```

## 📈 Monitoring & Analytics

### Payment Statistics

```typescript
// Get payment statistics
const stats = await fetch('/api/payment/admin/statistics?dateFrom=2023-01-01&dateTo=2023-12-31', {
  headers: { 'Authorization': `Bearer ${adminToken}` }
});

const data = await stats.json();
/*
{
  totalPayments: 1500,
  totalAmount: 15000000,
  paymentsByMethod: [
    { payment_method: 'CLICK', _count: { payment_method: 800 }, _sum: { amount: 8000000 } },
    { payment_method: 'PAYME', _count: { payment_method: 500 }, _sum: { amount: 5000000 } },
    { payment_method: 'UZUM', _count: { payment_method: 200 }, _sum: { amount: 2000000 } }
  ],
  paymentsByStatus: [
    { status: 'PAID', _count: { status: 1200 }, _sum: { amount: 12000000 } },
    { status: 'FAILED', _count: { status: 200 }, _sum: { amount: 2000000 } },
    { status: 'REFUNDED', _count: { status: 100 }, _sum: { amount: 1000000 } }
  ]
}
*/
```

### Logging

The payment system includes comprehensive logging:

- Payment creation and processing
- Webhook handling
- Error tracking
- Performance metrics

## 🛠️ Troubleshooting

### Common Issues

1. **Payment Creation Fails**
   ```
   Check:
   - Order exists and is not already paid
   - Amount is positive
   - Merchant credentials are correct
   ```

2. **Webhook Not Received**
   ```
   Check:
   - Webhook URL is accessible from internet
   - HTTPS is properly configured
   - Firewall allows incoming connections
   ```

3. **Signature Verification Fails**
   ```
   Check:
   - Secret keys are correct
   - Signature algorithm matches gateway requirements
   - Request data is not modified in transit
   ```

### Debug Mode

```bash
# Enable debug logging
DEBUG=payment:*
npm run start:dev

# Or set log level
LOG_LEVEL=debug
```

## 📚 Additional Resources

- [Click Developer Documentation](https://docs.click.uz)
- [Payme Developer Portal](https://developer.payme.uz)
- [Uzum Bank API Documentation](https://developer.uzumbank.uz)
- [Stripe API Reference](https://stripe.com/docs/api)

## 🤝 Contributing

When contributing to the payment system:

1. **Test thoroughly** - Payment systems require extensive testing
2. **Follow security best practices** - Never log sensitive data
3. **Update documentation** - Keep API docs current
4. **Add unit tests** - Maintain high test coverage

## 📄 License

This payment system is part of the INBOLA Kids Marketplace and follows the same MIT license terms.

---

**🔒 Security Notice**: Never commit real payment credentials to version control. Always use environment variables and secure secret management.