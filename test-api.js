#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:4001/api/v1';
const FRONTEND_URL = 'http://localhost:3000';

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to log test results
function logTest(name, success, message = '') {
  const status = success ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${name}${message ? ': ' + message : ''}`);
  
  results.tests.push({ name, success, message });
  if (success) results.passed++;
  else results.failed++;
}

// Helper function to make API requests
async function apiRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) config.data = data;
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

// Test Health Check
async function testHealthCheck() {
  console.log('\n🏥 Testing Health Check...');
  
  try {
    const response = await axios.get('http://localhost:4001/health');
    logTest('Health Check', response.status === 200, `Status: ${response.data.status}`);
  } catch (error) {
    logTest('Health Check', false, error.message);
  }
}

// Test Categories API
async function testCategoriesAPI() {
  console.log('\n📂 Testing Categories API...');
  
  // Get all categories
  const getResult = await apiRequest('GET', '/category');
  logTest('Get Categories', getResult.success, `Found ${getResult.data?.length || 0} categories`);
  
  // Create a category
  const createData = {
    name: 'Test Category',
    description: 'Test category description',
    slug: 'test-category-' + Date.now()
  };
  
  const createResult = await apiRequest('POST', '/category', createData);
  logTest('Create Category', createResult.success, createResult.error?.message || 'Category created');
  
  if (createResult.success && createResult.data?.id) {
    const categoryId = createResult.data.id;
    
    // Get category by ID
    const getByIdResult = await apiRequest('GET', `/category/${categoryId}`);
    logTest('Get Category by ID', getByIdResult.success);
    
    // Update category
    const updateData = { name: 'Updated Test Category' };
    const updateResult = await apiRequest('PATCH', `/category/${categoryId}`, updateData);
    logTest('Update Category', updateResult.success);
    
    // Delete category
    const deleteResult = await apiRequest('DELETE', `/category/${categoryId}`);
    logTest('Delete Category', deleteResult.success);
  }
}

// Test Brands API
async function testBrandsAPI() {
  console.log('\n🏷️ Testing Brands API...');
  
  // Get all brands
  const getResult = await apiRequest('GET', '/brand');
  logTest('Get Brands', getResult.success);
  
  // Create a brand
  const createData = {
    name: 'Test Brand ' + Date.now(),
    description: 'Test brand description'
  };
  
  const createResult = await apiRequest('POST', '/brand', createData);
  logTest('Create Brand', createResult.success, createResult.error?.message || 'Brand created');
}

// Test Products API
async function testProductsAPI() {
  console.log('\n📦 Testing Products API...');
  
  // Get all products
  const getResult = await apiRequest('GET', '/product');
  logTest('Get Products', getResult.success);
  
  // Search products
  const searchResult = await apiRequest('GET', '/product/search?q=test');
  logTest('Search Products', searchResult.success);
  
  // Get pending products
  const pendingResult = await apiRequest('GET', '/product/pending');
  logTest('Get Pending Products', pendingResult.success);
}

// Test User Authentication
async function testUserAuth() {
  console.log('\n🔐 Testing User Authentication...');
  
  const testUser = {
    first_name: 'Test',
    last_name: 'User',
    email: `test${Date.now()}@example.com`,
    password: 'Test123!@#',
    phone_number: '+998901234567'
  };
  
  // Register user
  const registerResult = await apiRequest('POST', '/user-auth/sign-up', testUser);
  logTest('User Registration', registerResult.success, registerResult.error?.message || 'User registered');
  
  // Login user
  const loginData = {
    email: testUser.email,
    password: testUser.password
  };
  
  const loginResult = await apiRequest('POST', '/user-auth/login', loginData);
  logTest('User Login', loginResult.success, loginResult.error?.message || 'User logged in');
  
  if (loginResult.success && loginResult.data?.access_token) {
    const token = loginResult.data.access_token;
    
    // Test protected route
    const protectedResult = await apiRequest('GET', '/user', null, {
      'Authorization': `Bearer ${token}`
    });
    logTest('Protected Route Access', protectedResult.success);
    
    // Logout
    const logoutResult = await apiRequest('POST', '/user-auth/sign-out', null, {
      'Authorization': `Bearer ${token}`
    });
    logTest('User Logout', logoutResult.success);
  }
}

// Test Cart API
async function testCartAPI() {
  console.log('\n🛒 Testing Cart API...');
  
  // Note: Cart requires authentication, so this is a basic test
  const getResult = await apiRequest('GET', '/cart');
  logTest('Get Cart (Unauthorized)', !getResult.success && getResult.status === 401, 'Expected 401 Unauthorized');
}

// Test Frontend Connectivity
async function testFrontend() {
  console.log('\n🌐 Testing Frontend...');
  
  try {
    const response = await axios.get(FRONTEND_URL);
    logTest('Frontend Accessibility', response.status === 200, 'Frontend is accessible');
  } catch (error) {
    logTest('Frontend Accessibility', false, error.message);
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting INBOLA Marketplace API Tests...\n');
  
  await testHealthCheck();
  await testCategoriesAPI();
  await testBrandsAPI();
  await testProductsAPI();
  await testUserAuth();
  await testCartAPI();
  await testFrontend();
  
  // Print summary
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  if (results.failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.tests.filter(t => !t.success).forEach(test => {
      console.log(`  - ${test.name}: ${test.message}`);
    });
  }
  
  console.log('\n🎉 Testing completed!');
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});
