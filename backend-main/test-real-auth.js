#!/usr/bin/env node

const crypto = require('crypto');
const http = require('http');

// Generate a valid Telegram auth hash for testing
function generateTelegramHash(data, botToken) {
  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const dataCheckString = Object.keys(data)
    .filter(key => key !== 'hash')
    .sort()
    .map(key => `${key}=${data[key]}`)
    .join('\n');
  
  return crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
}

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testRealAuthentication() {
  console.log('🔐 Testing Real Authentication Logic\n');

  // Test Telegram authentication with valid hash
  const botToken = process.env.TELEGRAM_BOT_TOKEN || 'dummy_token_for_testing';
  const telegramData = {
    id: 123456789,
    first_name: 'Test',
    last_name: 'User',
    username: 'testuser',
    photo_url: 'https://example.com/photo.jpg',
    auth_date: Math.floor(Date.now() / 1000),
  };

  // Generate valid hash
  telegramData.hash = generateTelegramHash(telegramData, botToken);

  console.log('Testing Telegram Authentication with real logic...');
  try {
    const result = await makeRequest('POST', '/api/auth/telegram/login', telegramData);
    
    if (result.status === 200) {
      console.log('✅ Telegram Auth SUCCESS');
      console.log(`   Token: ${result.data.token ? 'GENERATED' : 'MISSING'}`);
      console.log(`   User: ${result.data.user ? JSON.stringify(result.data.user, null, 2) : 'MISSING'}`);
    } else {
      console.log(`❌ Telegram Auth FAILED (${result.status})`);
      console.log(`   Error: ${result.data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`❌ Telegram Auth ERROR: ${error.message}`);
  }

  console.log('\n🌐 Testing Google OAuth URLs...');
  
  // Test Google OAuth login URL
  try {
    const result = await makeRequest('GET', '/api/auth/google/login');
    if (result.status === 302 || result.status === 200) {
      console.log('✅ Google OAuth login endpoint accessible');
    } else {
      console.log(`❌ Google OAuth login failed (${result.status})`);
    }
  } catch (error) {
    console.log(`❌ Google OAuth ERROR: ${error.message}`);
  }

  console.log('\n🎯 Real Authentication Testing Complete!');
}

// Run the tests
testRealAuthentication().catch(console.error);
