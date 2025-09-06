#!/usr/bin/env node

const axios = require('axios');

// Test API connection from frontend perspective
async function testApiConnection() {
  const API_BASE_URL = 'http://localhost:4000';
  
  console.log('🔍 Testing API connection from frontend perspective...\n');
  
  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data.status);
    
    // Test 2: Product API with versioning
    console.log('\n2. Testing product API (versioned)...');
    const productsResponse = await axios.get(`${API_BASE_URL}/api/v1/product/all`);
    console.log('✅ Products API:', `${productsResponse.data.length} products found`);
    
    // Test 3: Sample product data
    if (productsResponse.data.length > 0) {
      const firstProduct = productsResponse.data[0];
      console.log('📦 Sample product:', {
        id: firstProduct.id,
        title: firstProduct.title,
        price: firstProduct.price,
        status: firstProduct.is_checked
      });
    }
    
    console.log('\n🎉 All API tests passed! Frontend should now connect successfully.');
    
  } catch (error) {
    console.error('❌ API connection failed:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url
    });
  }
}

testApiConnection();
