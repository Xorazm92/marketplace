#!/usr/bin/env node

const http = require('http');

const API_BASE = 'http://localhost:4000';

// Test monitoring endpoints
async function testMonitoringEndpoints() {
  console.log('🔍 Testing INBOLA Monitoring System...\n');

  const tests = [
    {
      name: 'Health Check',
      url: `${API_BASE}/health`,
      expected: 200
    },
    {
      name: 'API Documentation',
      url: `${API_BASE}/api-docs`,
      expected: 200
    },
    {
      name: 'Categories API',
      url: `${API_BASE}/api/v1/categories`,
      expected: 200
    },
    {
      name: 'Products API',
      url: `${API_BASE}/api/v1/products`,
      expected: 200
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await makeRequest(test.url);
      
      if (result.statusCode === test.expected) {
        console.log(`✅ ${test.name}: PASSED (${result.statusCode})`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: FAILED (${result.statusCode})`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Test Results:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 All monitoring endpoints are working correctly!');
    console.log('\n🚀 Ready to start monitoring stack:');
    console.log('   cd monitoring');
    console.log('   docker-compose -f docker-compose.monitoring.yml up -d');
    console.log('\n📊 Access dashboards:');
    console.log('   Grafana: http://localhost:3001 (admin/inbola2024)');
    console.log('   Prometheus: http://localhost:9090');
    console.log('   Kibana: http://localhost:5601');
  }
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve({
          statusCode: response.statusCode,
          data: data
        });
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.setTimeout(5000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Run tests
testMonitoringEndpoints().catch(console.error);
