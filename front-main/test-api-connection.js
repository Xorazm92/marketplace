
const axios = require('axios');

const API_BASE = 'http://0.0.0.0:3001';

async function testApiConnection() {
  console.log('🧪 Testing API Connection...\n');

  // Test 1: Health Check
  try {
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get(`${API_BASE}/health`, { timeout: 5000 });
    console.log('✅ Health Check Success:', healthResponse.data);
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
  }

  // Test 2: Products Endpoint
  try {
    console.log('\n2️⃣ Testing Products Endpoint...');
    const productsResponse = await axios.get(`${API_BASE}/api/v1/product/all`, { timeout: 5000 });
    console.log('✅ Products Endpoint Success. Total products:', productsResponse.data?.pagination?.total || 0);
  } catch (error) {
    console.log('❌ Products Endpoint Failed:', error.message);
  }

  // Test 3: Categories Endpoint
  try {
    console.log('\n3️⃣ Testing Categories Endpoint...');
    const categoriesResponse = await axios.get(`${API_BASE}/api/v1/category`, { timeout: 5000 });
    console.log('✅ Categories Endpoint Success. Total categories:', categoriesResponse.data?.length || 0);
  } catch (error) {
    console.log('❌ Categories Endpoint Failed:', error.message);
  }

  // Test 4: Brands Endpoint
  try {
    console.log('\n4️⃣ Testing Brands Endpoint...');
    const brandsResponse = await axios.get(`${API_BASE}/api/v1/brand`, { timeout: 5000 });
    console.log('✅ Brands Endpoint Success. Total brands:', brandsResponse.data?.length || 0);
  } catch (error) {
    console.log('❌ Brands Endpoint Failed:', error.message);
  }

  console.log('\n🎯 API Connection Test Completed!');
}

testApiConnection().catch(console.error);
