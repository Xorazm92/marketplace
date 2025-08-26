import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users
    { duration: '5m', target: 10 }, // Stay at 10 users
    { duration: '2m', target: 20 }, // Ramp up to 20 users
    { duration: '5m', target: 20 }, // Stay at 20 users
    { duration: '2m', target: 50 }, // Ramp up to 50 users
    { duration: '5m', target: 50 }, // Stay at 50 users
    { duration: '2m', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.05'],    // Error rate should be below 5%
    errors: ['rate<0.1'],              // Custom error rate should be below 10%
  },
};

// Base URL
const BASE_URL = 'https://inbola.uz';
const API_URL = `${BASE_URL}/api/v1`;

// Test data
const testUser = {
  phone_number: '+998901234567',
  first_name: 'Load',
  last_name: 'Test',
  role: 'PARENT'
};

let authToken = '';

export function setup() {
  console.log('🚀 Starting INBOLA Kids Marketplace Load Test');
  
  // Health check
  const healthResponse = http.get(`${BASE_URL}/health`);
  check(healthResponse, {
    'Health check status is 200': (r) => r.status === 200,
    'Health check response time < 1s': (r) => r.timings.duration < 1000,
  });

  return { authToken: '' };
}

export default function (data) {
  // Test scenarios with different weights
  const scenarios = [
    { name: 'browse_products', weight: 40, func: browseProducts },
    { name: 'search_products', weight: 20, func: searchProducts },
    { name: 'view_categories', weight: 15, func: viewCategories },
    { name: 'user_authentication', weight: 10, func: userAuthentication },
    { name: 'shopping_cart', weight: 10, func: shoppingCart },
    { name: 'health_check', weight: 5, func: healthCheck },
  ];

  // Select scenario based on weight
  const random = Math.random() * 100;
  let cumulativeWeight = 0;
  let selectedScenario = scenarios[0];

  for (const scenario of scenarios) {
    cumulativeWeight += scenario.weight;
    if (random <= cumulativeWeight) {
      selectedScenario = scenario;
      break;
    }
  }

  // Execute selected scenario
  selectedScenario.func();
  
  // Random sleep between 1-3 seconds
  sleep(Math.random() * 2 + 1);
}

// Scenario: Browse Products
function browseProducts() {
  const response = http.get(`${API_URL}/product?page=1&limit=20`);
  
  const success = check(response, {
    'Browse products status is 200': (r) => r.status === 200,
    'Browse products response time < 2s': (r) => r.timings.duration < 2000,
    'Browse products has data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data && Array.isArray(body.data);
      } catch {
        return false;
      }
    },
  });

  if (!success) {
    errorRate.add(1);
  }

  // Browse specific product
  if (response.status === 200) {
    try {
      const body = JSON.parse(response.body);
      if (body.data && body.data.length > 0) {
        const productId = body.data[0].id;
        const productResponse = http.get(`${API_URL}/product/${productId}`);
        
        check(productResponse, {
          'Product detail status is 200': (r) => r.status === 200,
          'Product detail response time < 1s': (r) => r.timings.duration < 1000,
        });
      }
    } catch (e) {
      errorRate.add(1);
    }
  }
}

// Scenario: Search Products
function searchProducts() {
  const searchTerms = ['toy', 'book', 'game', 'educational', 'sport'];
  const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
  
  const response = http.get(`${API_URL}/product?search=${searchTerm}&page=1&limit=10`);
  
  const success = check(response, {
    'Search products status is 200': (r) => r.status === 200,
    'Search products response time < 2s': (r) => r.timings.duration < 2000,
    'Search products has results': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data !== undefined;
      } catch {
        return false;
      }
    },
  });

  if (!success) {
    errorRate.add(1);
  }
}

// Scenario: View Categories
function viewCategories() {
  const response = http.get(`${API_URL}/category`);
  
  const success = check(response, {
    'Categories status is 200': (r) => r.status === 200,
    'Categories response time < 1s': (r) => r.timings.duration < 1000,
    'Categories has data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body) && body.length > 0;
      } catch {
        return false;
      }
    },
  });

  if (!success) {
    errorRate.add(1);
  }

  // Browse products by category
  if (response.status === 200) {
    try {
      const categories = JSON.parse(response.body);
      if (categories.length > 0) {
        const categoryId = categories[0].id;
        const categoryProductsResponse = http.get(`${API_URL}/product?category_id=${categoryId}&page=1&limit=10`);
        
        check(categoryProductsResponse, {
          'Category products status is 200': (r) => r.status === 200,
          'Category products response time < 2s': (r) => r.timings.duration < 2000,
        });
      }
    } catch (e) {
      errorRate.add(1);
    }
  }
}

// Scenario: User Authentication
function userAuthentication() {
  // Send OTP
  const otpResponse = http.post(`${API_URL}/user-auth/send-otp`, JSON.stringify({
    phone_number: testUser.phone_number,
    type: 'login'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  const success = check(otpResponse, {
    'Send OTP status is 201 or 400': (r) => r.status === 201 || r.status === 400,
    'Send OTP response time < 3s': (r) => r.timings.duration < 3000,
  });

  if (!success) {
    errorRate.add(1);
  }

  // Simulate OTP verification (mock)
  if (otpResponse.status === 201) {
    const loginResponse = http.post(`${API_URL}/user-auth/phone-login`, JSON.stringify({
      phone_number: testUser.phone_number,
      otp: '123456' // Mock OTP for testing
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

    check(loginResponse, {
      'Login response time < 2s': (r) => r.timings.duration < 2000,
    });
  }
}

// Scenario: Shopping Cart (requires authentication)
function shoppingCart() {
  // First get products
  const productsResponse = http.get(`${API_URL}/product?page=1&limit=5`);
  
  if (productsResponse.status === 200) {
    try {
      const body = JSON.parse(productsResponse.body);
      if (body.data && body.data.length > 0) {
        const productId = body.data[0].id;
        
        // Try to add to cart (will fail without auth, but we test the endpoint)
        const cartResponse = http.post(`${API_URL}/cart/add`, JSON.stringify({
          product_id: productId,
          quantity: 1
        }), {
          headers: { 'Content-Type': 'application/json' },
        });

        check(cartResponse, {
          'Cart add response time < 1s': (r) => r.timings.duration < 1000,
          'Cart add status is 401 or 201': (r) => r.status === 401 || r.status === 201,
        });
      }
    } catch (e) {
      errorRate.add(1);
    }
  }
}

// Scenario: Health Check
function healthCheck() {
  const response = http.get(`${BASE_URL}/health`);
  
  const success = check(response, {
    'Health check status is 200': (r) => r.status === 200,
    'Health check response time < 500ms': (r) => r.timings.duration < 500,
    'Health check has status OK': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.status === 'OK';
      } catch {
        return false;
      }
    },
  });

  if (!success) {
    errorRate.add(1);
  }
}

export function teardown(data) {
  console.log('🏁 Load test completed');
  
  // Final health check
  const finalHealthResponse = http.get(`${BASE_URL}/health`);
  check(finalHealthResponse, {
    'Final health check status is 200': (r) => r.status === 200,
  });
}