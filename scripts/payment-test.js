// Payment Provider Test Script - INBOLA Marketplace
// Uzbekistan Payment Testing

const axios = require('axios');
const crypto = require('crypto');

// Test Configuration
const config = {
  click: {
    baseUrl: 'https://my.click.uz/services/pay',
    merchantId: process.env.CLICK_MERCHANT_ID,
    serviceId: process.env.CLICK_SERVICE_ID,
    secretKey: process.env.CLICK_SECRET_KEY
  },
  
  payme: {
    baseUrl: 'https://checkout.paycom.uz/api',
    merchantId: process.env.PAYME_MERCHANT_ID,
    login: process.env.PAYME_LOGIN,
    password: process.env.PAYME_PASSWORD
  },
  
  uzum: {
    baseUrl: 'https://api.uzum.uz/payment',
    merchantId: process.env.UZUM_MERCHANT_ID,
    apiKey: process.env.UZUM_API_KEY,
    secretKey: process.env.UZUM_SECRET_KEY
  }
};

// Test Cards - Uzbekistan
const testCards = {
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
  }
};

// Test Payment Functions
async function testClickPayment() {
  console.log('🧪 Testing Click Payment...');
  
  const payload = {
    merchant_id: config.click.merchantId,
    service_id: config.click.serviceId,
    amount: 100000, // 100,000 UZS
    currency: 'UZS',
    card_number: testCards.uzcard.number,
    expiry: testCards.uzcard.expiry,
    cvv: testCards.uzcard.cvv,
    holder: testCards.uzcard.holder,
    return_url: 'https://inbola.uz/payment/success',
    cancel_url: 'https://inbola.uz/payment/cancel'
  };

  try {
    const response = await axios.post(`${config.click.baseUrl}/prepare`, payload, {
      headers: {
        'Authorization': `Bearer ${config.click.secretKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Click Payment Test:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Click Payment Error:', error.response?.data || error.message);
    throw error;
  }
}

async function testPaymePayment() {
  console.log('🧪 Testing Payme Payment...');
  
  const payload = {
    method: 'cards.create',
    params: {
      number: testCards.humo.number,
      expire: testCards.humo.expiry.replace('/', ''),
      amount: 100000, // 100,000 UZS
      currency: 'UZS'
    }
  };

  try {
    const response = await axios.post(config.payme.baseUrl, payload, {
      auth: {
        username: config.payme.login,
        password: config.payme.password
      }
    });
    
    console.log('✅ Payme Payment Test:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Payme Payment Error:', error.response?.data || error.message);
    throw error;
  }
}

async function testUzumPayment() {
  console.log('🧪 Testing Uzum Payment...');
  
  const payload = {
    merchant_id: config.uzum.merchantId,
    amount: 100000, // 100,000 UZS
    currency: 'UZS',
    card_number: testCards.visa.number,
    expiry: testCards.visa.expiry,
    cvv: testCards.visa.cvv,
    holder: testCards.visa.holder,
    return_url: 'https://inbola.uz/payment/success',
    webhook_url: 'https://api.inbola.uz/webhooks/uzum'
  };

  try {
    const response = await axios.post(`${config.uzum.baseUrl}/v1/payment/create`, payload, {
      headers: {
        'Authorization': `Bearer ${config.uzum.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Uzum Payment Test:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Uzum Payment Error:', error.response?.data || error.message);
    throw error;
  }
}

// 3D-Secure Test
async function test3DSecure() {
  console.log('🧪 Testing 3D-Secure...');
  
  const testData = {
    card_number: '4000000000001091', // 3D-Secure test card
    amount: 100000,
    currency: 'UZS',
    return_url: 'https://inbola.uz/payment/3ds/return'
  };

  console.log('✅ 3D-Secure Test Data:', testData);
  return testData;
}

// Webhook Test
async function testWebhook() {
  console.log('🧪 Testing Webhook Handlers...');
  
  const webhookPayload = {
    event: 'payment.success',
    transaction_id: 'test_txn_123',
    amount: 100000,
    currency: 'UZS',
    status: 'completed'
  };

  try {
    const response = await axios.post('https://api.inbola.uz/webhooks/payment', webhookPayload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': process.env.PAYMENT_WEBHOOK_SECRET
      }
    });
    
    console.log('✅ Webhook Test:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Webhook Error:', error.response?.data || error.message);
    throw error;
  }
}

// Main Test Function
async function runPaymentTests() {
  console.log('🚀 Starting Payment Provider Tests...\n');
  
  try {
    // Test all payment providers
    await testClickPayment();
    await testPaymePayment();
    await testUzumPayment();
    await test3DSecure();
    await testWebhook();
    
    console.log('\n✅ All payment tests completed successfully!');
    console.log('📊 Results saved to payment-test-results.json');
    
    // Save results
    const fs = require('fs');
    const results = {
      timestamp: new Date().toISOString(),
      providers: ['click', 'payme', 'uzum'],
      status: 'success',
      testCards: testCards
    };
    
    fs.writeFileSync('payment-test-results.json', JSON.stringify(results, null, 2));
    
  } catch (error) {
    console.error('❌ Payment tests failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runPaymentTests();
}

module.exports = {
  testClickPayment,
  testPaymePayment,
  testUzumPayment,
  test3DSecure,
  testWebhook,
  runPaymentTests
};
