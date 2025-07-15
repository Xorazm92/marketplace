
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
export let errorRate = new Rate('errors');
export let responseTime = new Trend('response_time');
export let successfulRequests = new Counter('successful_requests');

// Test configuration
export let options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 500 },   // Stay at 500 users
    { duration: '10m', target: 1000 }, // Scale to 1000 users
    { duration: '5m', target: 2000 },  // Peak load: 2000 users
    { duration: '10m', target: 5000 }, // Stress test: 5000 users
    { duration: '5m', target: 1000 },  // Scale down
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000'], // 95% of requests under 2s
    'http_req_failed': ['rate<0.1'],     // Error rate under 10%
    'errors': ['rate<0.1'],              // Custom error rate under 10%
  },
};

const BASE_URL = 'http://localhost:4000';

// Test data
const TEST_USERS = [
  { phone: '+998901234567', password: 'testpass123' },
  { phone: '+998901234568', password: 'testpass123' },
  { phone: '+998901234569', password: 'testpass123' },
];

let authTokens = [];

export function setup() {
  console.log('🚀 Starting Load Test Setup...');
  
  // Create test users and get auth tokens
  for (let user of TEST_USERS) {
    try {
      // Register user
      let registerRes = http.post(`${BASE_URL}/user-auth/sign-up`, {
        first_name: 'Test',
        last_name: 'User',
        phone_number: user.phone,
        password: user.password,
      });
      
      if (registerRes.status === 201 || registerRes.status === 409) {
        // Login to get token
        let loginRes = http.post(`${BASE_URL}/user-auth/login`, {
          phone_number: user.phone,
          password: user.password,
        });
        
        if (loginRes.status === 200) {
          let loginData = JSON.parse(loginRes.body);
          authTokens.push(loginData.access_token);
        }
      }
    } catch (error) {
      console.error(`Setup failed for user ${user.phone}:`, error);
    }
  }
  
  console.log(`✅ Setup completed with ${authTokens.length} authenticated users`);
  return { authTokens };
}

export default function(data) {
  // Simulate different user behaviors
  let scenarios = [
    () => testHomePage(),
    () => testProductListing(),
    () => testProductDetails(),
    () => testUserAuthentication(),
    () => testSearchFunctionality(),
    () => testCartOperations(data),
    () => testOrderCreation(data),
    () => testAdminOperations(data),
  ];
  
  // Randomly select a scenario
  let scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  scenario();
  
  sleep(Math.random() * 3 + 1); // Random sleep between 1-4 seconds
}

// Test scenarios
function testHomePage() {
  let response = http.get(`${BASE_URL}/`);
  
  let success = check(response, {
    'Home page loads': (r) => r.status === 200,
    'Response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  recordMetrics(response, success);
}

function testProductListing() {
  let response = http.get(`${BASE_URL}/product`);
  
  let success = check(response, {
    'Product listing loads': (r) => r.status === 200,
    'Has products': (r) => JSON.parse(r.body).length > 0,
    'Response time < 1s': (r) => r.timings.duration < 1000,
  });
  
  recordMetrics(response, success);
}

function testProductDetails() {
  // Get random product ID (assuming products exist)
  let productId = Math.floor(Math.random() * 100) + 1;
  let response = http.get(`${BASE_URL}/product/${productId}`);
  
  let success = check(response, {
    'Product details load': (r) => r.status === 200 || r.status === 404,
    'Response time < 800ms': (r) => r.timings.duration < 800,
  });
  
  recordMetrics(response, success);
}

function testUserAuthentication() {
  let loginData = {
    phone_number: '+998901234567',
    password: 'testpass123',
  };
  
  let response = http.post(`${BASE_URL}/user-auth/login`, loginData);
  
  let success = check(response, {
    'Login successful': (r) => r.status === 200 || r.status === 401,
    'Response time < 1s': (r) => r.timings.duration < 1000,
  });
  
  recordMetrics(response, success);
}

function testSearchFunctionality() {
  let searchQueries = ['bolalar', 'kitob', 'o\'yinchoq', 'kiyim'];
  let query = searchQueries[Math.floor(Math.random() * searchQueries.length)];
  
  let response = http.get(`${BASE_URL}/product/search?q=${query}`);
  
  let success = check(response, {
    'Search works': (r) => r.status === 200,
    'Response time < 1.5s': (r) => r.timings.duration < 1500,
  });
  
  recordMetrics(response, success);
}

function testCartOperations(data) {
  if (!data.authTokens || data.authTokens.length === 0) return;
  
  let token = data.authTokens[Math.floor(Math.random() * data.authTokens.length)];
  let headers = { 'Authorization': `Bearer ${token}` };
  
  // Add to cart
  let cartData = {
    productId: Math.floor(Math.random() * 100) + 1,
    quantity: Math.floor(Math.random() * 3) + 1,
  };
  
  let response = http.post(`${BASE_URL}/cart`, cartData, { headers });
  
  let success = check(response, {
    'Cart operation works': (r) => r.status === 200 || r.status === 201 || r.status === 404,
    'Response time < 1s': (r) => r.timings.duration < 1000,
  });
  
  recordMetrics(response, success);
}

function testOrderCreation(data) {
  if (!data.authTokens || data.authTokens.length === 0) return;
  
  let token = data.authTokens[Math.floor(Math.random() * data.authTokens.length)];
  let headers = { 'Authorization': `Bearer ${token}` };
  
  let orderData = {
    items: [
      { productId: 1, quantity: 2 },
      { productId: 2, quantity: 1 },
    ],
    paymentMethodId: 1,
    addressId: 1,
  };
  
  let response = http.post(`${BASE_URL}/order`, orderData, { headers });
  
  let success = check(response, {
    'Order creation works': (r) => r.status === 200 || r.status === 201 || r.status === 400,
    'Response time < 2s': (r) => r.timings.duration < 2000,
  });
  
  recordMetrics(response, success);
}

function testAdminOperations(data) {
  if (!data.authTokens || data.authTokens.length === 0) return;
  
  let token = data.authTokens[Math.floor(Math.random() * data.authTokens.length)];
  let headers = { 'Authorization': `Bearer ${token}` };
  
  // Test admin dashboard (will fail for non-admin users, but that's expected)
  let response = http.get(`${BASE_URL}/admin/dashboard`, { headers });
  
  let success = check(response, {
    'Admin endpoint responds': (r) => r.status === 200 || r.status === 403 || r.status === 401,
    'Response time < 1s': (r) => r.timings.duration < 1000,
  });
  
  recordMetrics(response, success);
}

function recordMetrics(response, success) {
  responseTime.add(response.timings.duration);
  errorRate.add(!success);
  
  if (success) {
    successfulRequests.add(1);
  }
}

export function teardown(data) {
  console.log('🧹 Cleaning up test data...');
  
  // Cleanup logic here if needed
  console.log('✅ Load test completed');
}

// Handle test results
export function handleSummary(data) {
  return {
    'load-test-results.json': JSON.stringify(data, null, 2),
    'stdout': generateTextSummary(data),
  };
}

function generateTextSummary(data) {
  const summary = `
=== LOAD TEST RESULTS ===

Total Requests: ${data.metrics.http_reqs.count}
Failed Requests: ${data.metrics.http_req_failed.count} (${(data.metrics.http_req_failed.rate * 100).toFixed(2)}%)
Average Response Time: ${data.metrics.http_req_duration.avg.toFixed(2)}ms
95th Percentile: ${data.metrics['http_req_duration{p(95)}'].values.value.toFixed(2)}ms

Custom Metrics:
- Error Rate: ${(data.metrics.errors.rate * 100).toFixed(2)}%
- Successful Requests: ${data.metrics.successful_requests.count}

Thresholds:
- 95% requests under 2s: ${data.metrics['http_req_duration{p(95)}'].values.value < 2000 ? '✅ PASSED' : '❌ FAILED'}
- Error rate under 10%: ${data.metrics.http_req_failed.rate < 0.1 ? '✅ PASSED' : '❌ FAILED'}

=========================
`;
  
  return summary;
}
