#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';
const TEST_PHONE = '+998901234567';

async function testOTPFlow() {
  console.log('🧪 Testing OTP Flow...\n');

  try {
    // Step 1: Send OTP for registration
    console.log('📤 Step 1: Sending OTP for registration...');
    const sendResponse = await axios.post(`${BASE_URL}/phone-auth/send-otp`, {
      phone_number: TEST_PHONE,
      purpose: 'registration'
    });
    
    console.log('✅ OTP Send Response:', sendResponse.data);
    console.log(`⏰ Expires in: ${sendResponse.data.expires_in} seconds (${sendResponse.data.expires_in / 60} minutes)`);
    console.log(`🔄 Can resend after: ${sendResponse.data.can_resend_after} seconds\n`);

    // In development mode, we need to manually enter the OTP from console logs
    console.log('📋 Check the backend console logs for the OTP code in development mode.');
    console.log('🔍 Look for: "DEV MODE - OTP CODE" in the server logs\n');

    // Step 2: Simulate OTP verification (you'll need to replace 'XXXXXX' with actual OTP from logs)
    const otpCode = process.argv[2] || '123456'; // Default test code or from command line
    
    if (otpCode === '123456') {
      console.log('⚠️  Using default test OTP: 123456');
      console.log('💡 To test with real OTP, run: node test-otp-flow.js YOUR_OTP_CODE\n');
    }

    console.log('📤 Step 2: Verifying OTP...');
    const verifyResponse = await axios.post(`${BASE_URL}/phone-auth/verify-otp`, {
      phone_number: TEST_PHONE,
      otp_code: otpCode,
      purpose: 'registration'
    });
    
    console.log('✅ OTP Verify Response:', verifyResponse.data);

    // Step 3: Complete registration
    console.log('\n📤 Step 3: Completing registration...');
    const registerResponse = await axios.post(`${BASE_URL}/phone-auth/register`, {
      phone_number: TEST_PHONE,
      otp_code: otpCode,
      first_name: 'Test',
      last_name: 'User',
      birth_date: '1990-01-01'
    });
    
    console.log('✅ Registration Response:', registerResponse.data);
    console.log('\n🎉 OTP Flow Test Completed Successfully!');

  } catch (error) {
    console.error('❌ Test Failed:', error.response?.data || error.message);
    
    if (error.response?.status === 400 && error.response?.data?.message?.includes('OTP topilmadi')) {
      console.log('\n💡 This error is expected if using default OTP. Check server logs for real OTP code.');
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running on port 3001');
      console.log('   Run: cd backend-main && npm run start:dev');
    }
  }
}

// Run the test
testOTPFlow();
