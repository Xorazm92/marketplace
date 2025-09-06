#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function listAllRoutes() {
  console.log('🔍 Checking all available routes...\n');
  
  const testRoutes = [
    // Health and basic endpoints
    { method: 'GET', path: '/health', desc: 'Health check' },
    { method: 'GET', path: '/', desc: 'Root endpoint' },
    { method: 'GET', path: '/api', desc: 'API info' },
    
    // Auth endpoints with different prefixes
    { method: 'GET', path: '/api/auth/providers', desc: 'Auth providers (with api prefix)' },
    { method: 'GET', path: '/auth/providers', desc: 'Auth providers (without api prefix)' },
    
    // Google OAuth endpoints
    { method: 'GET', path: '/auth/google/test', desc: 'Google test (excluded from prefix)' },
    { method: 'GET', path: '/api/auth/google/test', desc: 'Google test (with api prefix)' },
    
    // Telegram endpoints
    { method: 'GET', path: '/api/auth/telegram/bot-username', desc: 'Telegram bot username (with api prefix)' },
    { method: 'GET', path: '/auth/telegram/bot-username', desc: 'Telegram bot username (without api prefix)' },
    
    // GraphQL
    { method: 'GET', path: '/graphql', desc: 'GraphQL playground' },
    
    // API docs
    { method: 'GET', path: '/api-docs', desc: 'Swagger documentation' },
  ];
  
  for (const route of testRoutes) {
    try {
      const response = await axios({
        method: route.method.toLowerCase(),
        url: `${BASE_URL}${route.path}`,
        timeout: 3000,
        validateStatus: () => true // Accept all status codes
      });
      
      const status = response.status;
      const statusText = status < 400 ? '✅' : status === 404 ? '❌' : '⚠️';
      console.log(`${statusText} ${route.method} ${route.path} → ${status} (${route.desc})`);
      
    } catch (error) {
      console.log(`💥 ${route.method} ${route.path} → ERROR: ${error.message} (${route.desc})`);
    }
  }
}

listAllRoutes().catch(console.error);
