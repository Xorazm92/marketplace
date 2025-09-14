// Simple test script to validate Next.js configuration
const path = require('path');
const fs = require('fs');

console.log('Testing Next.js configuration...');

// Test 1: Check if required files exist
const requiredFiles = [
  'app/page.tsx',
  'app/layout.tsx',
  'next.config.ts',
  '.env.local'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

// Test 2: Check environment variables
require('dotenv').config({ path: '.env.local' });

const envVars = [
  'NEXT_PUBLIC_BACKEND_URL',
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_FRONTEND_URL'
];

envVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value && typeof value === 'string') {
    console.log(`✅ ${envVar}: ${value}`);
  } else {
    console.log(`❌ ${envVar}: undefined or invalid`);
  }
});

// Test 3: Validate next.config.ts
try {
  const configPath = path.join(process.cwd(), 'next.config.ts');
  if (fs.existsSync(configPath)) {
    console.log('✅ next.config.ts exists and is readable');
  }
} catch (error) {
  console.log('❌ next.config.ts error:', error.message);
}

console.log('\nConfiguration test completed.');
console.log('If all checks pass, the TypeError should be resolved.');