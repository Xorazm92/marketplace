
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class PreLaunchChecklist {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.checks = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
  }

  addError(message) {
    this.errors.push(message);
    this.log(message, 'error');
  }

  addWarning(message) {
    this.warnings.push(message);
    this.log(message, 'warning');
  }

  addCheck(message) {
    this.checks.push(message);
    this.log(message, 'success');
  }

  // Environment Variables Check
  checkEnvironmentVariables() {
    this.log('Checking environment variables...');
    
    const requiredEnvVars = [
      'DATABASE_URL',
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'SMTP_HOST',
      'SMTP_USER',
      'SMTP_PASS',
      'REDIS_URL'
    ];

    const missing = requiredEnvVars.filter(env => !process.env[env]);
    
    if (missing.length > 0) {
      this.addError(`Missing environment variables: ${missing.join(', ')}`);
    } else {
      this.addCheck('All required environment variables are set');
    }
  }

  // Database Connection Check
  async checkDatabaseConnection() {
    this.log('Checking database connection...');
    
    try {
      execSync('npx prisma db pull --force', { stdio: 'pipe' });
      this.addCheck('Database connection successful');
    } catch (error) {
      this.addError(`Database connection failed: ${error.message}`);
    }
  }

  // Redis Connection Check
  async checkRedisConnection() {
    this.log('Checking Redis connection...');
    
    try {
      const redis = require('redis');
      const client = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });
      
      await client.connect();
      await client.ping();
      await client.disconnect();
      
      this.addCheck('Redis connection successful');
    } catch (error) {
      this.addError(`Redis connection failed: ${error.message}`);
    }
  }

  // Migration Status Check
  checkMigrations() {
    this.log('Checking database migrations...');
    
    try {
      execSync('npx prisma migrate status', { stdio: 'pipe' });
      this.addCheck('Database migrations are up to date');
    } catch (error) {
      this.addError(`Migration check failed: ${error.message}`);
    }
  }

  // Build Check
  checkBuild() {
    this.log('Checking build process...');
    
    try {
      execSync('npm run build', { stdio: 'pipe' });
      this.addCheck('Build process completed successfully');
    } catch (error) {
      this.addError(`Build failed: ${error.message}`);
    }
  }

  // Test Check
  runTests() {
    this.log('Running tests...');
    
    try {
      execSync('npm run test:cov', { stdio: 'pipe' });
      this.addCheck('All tests passed');
    } catch (error) {
      this.addError(`Tests failed: ${error.message}`);
    }
  }

  // Security Check
  checkSecurity() {
    this.log('Running security audit...');
    
    try {
      execSync('npm audit --audit-level=high', { stdio: 'pipe' });
      this.addCheck('No high-severity security vulnerabilities found');
    } catch (error) {
      this.addWarning(`Security vulnerabilities detected: ${error.message}`);
    }
  }

  // Performance Check
  checkPerformance() {
    this.log('Checking performance configurations...');
    
    // Check if Redis cache is properly configured
    if (process.env.REDIS_URL) {
      this.addCheck('Redis cache configuration found');
    } else {
      this.addWarning('Redis cache not configured - performance may be impacted');
    }

    // Check if database pooling is configured
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl && (dbUrl.includes('pool') || dbUrl.includes('connection_limit'))) {
      this.addCheck('Database connection pooling configured');
    } else {
      this.addWarning('Database connection pooling not configured');
    }
  }

  // Health Endpoints Check
  async checkHealthEndpoints() {
    this.log('Starting server for health check...');
    
    try {
      // Start server in background
      const server = execSync('npm run start:prod &', { stdio: 'pipe' });
      
      // Wait for server to start
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Check health endpoint
      const response = await fetch('http://localhost:4000/health');
      if (response.ok) {
        this.addCheck('Health endpoint responding correctly');
      } else {
        this.addError('Health endpoint not responding');
      }
      
      // Stop server
      execSync('pkill -f "node dist/main"', { stdio: 'pipe' });
    } catch (error) {
      this.addError(`Health check failed: ${error.message}`);
    }
  }

  // Generate Report
  generateReport() {
    this.log('\n=== PRE-LAUNCH CHECKLIST REPORT ===');
    
    console.log(`\n✅ Successful Checks (${this.checks.length}):`);
    this.checks.forEach(check => console.log(`  - ${check}`));
    
    console.log(`\n⚠️  Warnings (${this.warnings.length}):`);
    this.warnings.forEach(warning => console.log(`  - ${warning}`));
    
    console.log(`\n❌ Errors (${this.errors.length}):`);
    this.errors.forEach(error => console.log(`  - ${error}`));
    
    const totalIssues = this.errors.length + this.warnings.length;
    
    if (this.errors.length === 0) {
      console.log('\n🎉 PRE-LAUNCH CHECKLIST PASSED! Ready for production deployment.');
      process.exit(0);
    } else {
      console.log('\n🚨 PRE-LAUNCH CHECKLIST FAILED! Please fix the errors before deploying.');
      process.exit(1);
    }
  }

  async run() {
    console.log('🚀 Starting Pre-Launch Checklist...\n');
    
    this.checkEnvironmentVariables();
    await this.checkDatabaseConnection();
    await this.checkRedisConnection();
    this.checkMigrations();
    this.checkBuild();
    this.runTests();
    this.checkSecurity();
    this.checkPerformance();
    await this.checkHealthEndpoints();
    
    this.generateReport();
  }
}

// Run checklist
const checklist = new PreLaunchChecklist();
checklist.run().catch(error => {
  console.error('Checklist failed:', error);
  process.exit(1);
});
