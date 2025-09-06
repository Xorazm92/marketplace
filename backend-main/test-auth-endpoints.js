#!/usr/bin/env node

const http = require('http');

const BASE_URL = 'http://localhost:4000';

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

async function testAuthEndpoints() {
  console.log('🧪 Testing Authentication Endpoints\n');

  const tests = [
    {
      name: 'GET /api/auth/providers',
      method: 'GET',
      path: '/api/auth/providers',
    },
    {
      name: 'GET /api/auth/telegram/bot-username',
      method: 'GET',
      path: '/api/auth/telegram/bot-username',
    },
    {
      name: 'GET /api/auth/google/test',
      method: 'GET',
      path: '/api/auth/google/test',
    },
    {
      name: 'POST /api/auth/telegram/login',
      method: 'POST',
      path: '/api/auth/telegram/login',
      data: {
        id: 123456789,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        photo_url: 'https://example.com/photo.jpg',
        auth_date: Math.floor(Date.now() / 1000),
        hash: 'test_hash_123'
      },
    },
    {
      name: 'POST /api/auth/sms/login',
      method: 'POST',
      path: '/api/auth/sms/login',
      data: {
        phoneNumber: '+998901234567',
        code: '123456'
      },
    },
  ];

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      const result = await makeRequest(test.method, test.path, test.data);
      
      if (result.status === 200) {
        console.log(`✅ SUCCESS (${result.status})`);
        if (typeof result.data === 'object') {
          console.log(`   Response: ${JSON.stringify(result.data, null, 2).substring(0, 200)}...`);
        }
      } else {
        console.log(`❌ FAILED (${result.status})`);
        console.log(`   Response: ${JSON.stringify(result.data, null, 2)}`);
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
    }
    console.log('');
  }

  console.log('🎯 Authentication Endpoint Testing Complete!');
}

// Run the tests
testAuthEndpoints().catch(console.error);
