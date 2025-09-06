#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function testEndpoint(method, path, data = null, description = '') {
  try {
    console.log(`\n🔍 Testing ${method.toUpperCase()} ${path} - ${description}`);
    
    const config = {
      method: method.toLowerCase(),
      url: `${BASE_URL}${path}`,
      timeout: 5000,
    };
    
    if (data) {
      config.data = data;
      config.headers = { 'Content-Type': 'application/json' };
    }
    
    const response = await axios(config);
    console.log(`✅ SUCCESS: ${response.status} ${response.statusText}`);
    console.log(`📄 Response:`, JSON.stringify(response.data, null, 2));
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    if (error.response) {
      console.log(`❌ ERROR: ${error.response.status} ${error.response.statusText}`);
      console.log(`📄 Error Response:`, JSON.stringify(error.response.data, null, 2));
      return { success: false, error: error.response.data, status: error.response.status };
    } else {
      console.log(`❌ NETWORK ERROR:`, error.message);
      return { success: false, error: error.message };
    }
  }
}

async function runAuthTests() {
  console.log('🚀 Starting Authentication Debug Tests');
  console.log('=====================================');
  
  // Test basic health
  await testEndpoint('GET', '/health', null, 'Basic health check');
  
  // Test auth providers endpoint
  await testEndpoint('GET', '/api/auth/providers', null, 'Available auth providers');
  
  // Test Google OAuth endpoints
  console.log('\n🔵 GOOGLE OAUTH TESTS');
  console.log('=====================');
  await testEndpoint('GET', '/auth/google/test', null, 'Google auth test endpoint');
  await testEndpoint('GET', '/auth/google', null, 'Google OAuth initiation');
  
  // Test Telegram auth endpoints
  console.log('\n🔵 TELEGRAM AUTH TESTS');
  console.log('======================');
  await testEndpoint('GET', '/api/auth/telegram/bot-username', null, 'Telegram bot username');
  
  // Test sample Telegram login (will fail due to invalid data, but should show endpoint works)
  const sampleTelegramData = {
    id: 123456789,
    first_name: "Test",
    last_name: "User",
    username: "testuser",
    photo_url: "https://example.com/photo.jpg",
    auth_date: Math.floor(Date.now() / 1000),
    hash: "invalid_hash_for_testing"
  };
  
  await testEndpoint('POST', '/api/auth/telegram/login', sampleTelegramData, 'Telegram login test');
  
  // Test unified auth endpoints
  console.log('\n🔵 UNIFIED AUTH TESTS');
  console.log('=====================');
  
  // Test SMS login (will fail due to missing implementation, but should show endpoint works)
  const sampleSmsData = {
    phoneNumber: "+998901234567",
    code: "123456"
  };
  
  await testEndpoint('POST', '/api/auth/sms/login', sampleSmsData, 'SMS login test');
  
  console.log('\n✅ Authentication debug tests completed!');
  console.log('=====================================');
}

// Run the tests
runAuthTests().catch(console.error);
