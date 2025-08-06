#!/bin/bash

# ===========================================
# 🧪 INBOLA.UZ MARKETPLACE TEST SCRIPT
# ===========================================
# Comprehensive testing script for INBOLA marketplace
# Author: INBOLA Development Team
# Version: 1.0.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PORT=3001
FRONTEND_PORT=3000
API_URL="http://localhost:${BACKEND_PORT}"
FRONTEND_URL="http://localhost:${FRONTEND_PORT}"

echo -e "${BLUE}🧪 Starting comprehensive tests for INBOLA Marketplace${NC}"
echo "=================================================="

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "${BLUE}Testing: ${test_name}${NC}"
    
    if eval "$test_command"; then
        print_status "$test_name"
        ((TESTS_PASSED++))
    else
        print_error "$test_name"
        ((TESTS_FAILED++))
    fi
    echo ""
}

# 1. Build Tests
echo -e "${BLUE}📦 Build Tests${NC}"
echo "===================="

run_test "Backend Build" "cd backend-main && npm run build > /dev/null 2>&1"
run_test "Frontend Build" "cd front-main && npm run build > /dev/null 2>&1"

# 2. Code Quality Tests
echo -e "${BLUE}🔍 Code Quality Tests${NC}"
echo "===================="

run_test "Backend Linting" "cd backend-main && npm run lint > /dev/null 2>&1"
run_test "Frontend Linting" "cd front-main && npm run lint > /dev/null 2>&1"
run_test "Backend Type Check" "cd backend-main && npx tsc --noEmit > /dev/null 2>&1"
run_test "Frontend Type Check" "cd front-main && npm run type-check > /dev/null 2>&1"

# 3. Security Tests
echo -e "${BLUE}🛡️ Security Tests${NC}"
echo "===================="

run_test "Backend Security Audit" "cd backend-main && npm audit --audit-level=high > /dev/null 2>&1"
run_test "Frontend Security Audit" "cd front-main && npm audit --audit-level=high > /dev/null 2>&1"

# 4. Environment Configuration Tests
echo -e "${BLUE}⚙️ Environment Configuration Tests${NC}"
echo "===================="

run_test "Production Environment File Exists" "[ -f '.env.prod' ]"
run_test "Backend Environment File Exists" "[ -f 'backend-main/.env' ]"
run_test "Database URL Configuration" "grep -q 'DATABASE_URL' .env.prod"
run_test "JWT Configuration" "grep -q 'ACCESS_TOKEN_KEY' .env.prod"
run_test "CORS Configuration" "grep -q 'CORS_ORIGIN' .env.prod"
run_test "Domain Configuration" "grep -q 'inbola.uz' .env.prod"

# 5. Database Tests
echo -e "${BLUE}🗄️ Database Tests${NC}"
echo "===================="

run_test "Prisma Schema Validation" "cd backend-main && npx prisma validate > /dev/null 2>&1"
run_test "Prisma Client Generation" "cd backend-main && npx prisma generate > /dev/null 2>&1"

# 6. File Structure Tests
echo -e "${BLUE}📁 File Structure Tests${NC}"
echo "===================="

run_test "Backend Source Directory" "[ -d 'backend-main/src' ]"
run_test "Frontend Pages Directory" "[ -d 'front-main/pages' ]"
run_test "Frontend Components Directory" "[ -d 'front-main/components' ]"
run_test "Backend Prisma Directory" "[ -d 'backend-main/prisma' ]"
run_test "SSL Directory" "[ -d 'ssl' ]"
run_test "Deployment Script" "[ -f 'deploy-inbola.sh' ] && [ -x 'deploy-inbola.sh' ]"

# 7. Configuration Files Tests
echo -e "${BLUE}📋 Configuration Files Tests${NC}"
echo "===================="

run_test "Backend Package.json" "[ -f 'backend-main/package.json' ]"
run_test "Frontend Package.json" "[ -f 'front-main/package.json' ]"
run_test "Docker Compose Production" "[ -f 'docker-compose.prod.yml' ]"
run_test "Nginx Configuration" "[ -f 'nginx.conf' ]"
run_test "Backend Dockerfile" "[ -f 'backend-main/Dockerfile' ]"
run_test "Frontend Dockerfile" "[ -f 'front-main/Dockerfile' ]"

# 8. Dependencies Tests
echo -e "${BLUE}📦 Dependencies Tests${NC}"
echo "===================="

run_test "Backend Node Modules" "[ -d 'backend-main/node_modules' ]"
run_test "Frontend Node Modules" "[ -d 'front-main/node_modules' ]"
run_test "Backend Dependencies Check" "cd backend-main && npm ls --depth=0 > /dev/null 2>&1"
run_test "Frontend Dependencies Check" "cd front-main && npm ls --depth=0 > /dev/null 2>&1"

# 9. Production Readiness Tests
echo -e "${BLUE}🚀 Production Readiness Tests${NC}"
echo "===================="

run_test "Backend Dist Directory" "[ -d 'backend-main/dist' ]"
run_test "Frontend Build Directory" "[ -d 'front-main/.next' ]"
run_test "Environment Variables Set" "grep -q 'NODE_ENV=production' .env.prod"
run_test "SSL Directory Created" "[ -d 'ssl' ]"

# 10. Clean Up Tests
echo -e "${BLUE}🧹 Clean Up Tests${NC}"
echo "===================="

run_test "No Log Files in Root" "! find . -maxdepth 1 -name '*.log' | grep -q ."
run_test "No Backup Files" "! find . -name '*.bak' | grep -q ."
run_test "No Temporary Files" "! find . -name '*.tmp' | grep -q ."
run_test "No Dump Files" "! find . -name 'dump.rdb' | grep -q ."

# Test Summary
echo "=================================================="
echo -e "${BLUE}📊 Test Summary${NC}"
echo "=================================================="
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"
echo -e "${GREEN}Passed: ${TESTS_PASSED}${NC}"
echo -e "${RED}Failed: ${TESTS_FAILED}${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Your INBOLA Marketplace is ready for deployment!${NC}"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "1. Run the deployment script: ./deploy-inbola.sh"
    echo "2. Configure your DNS settings for inbola.uz and api.inbola.uz"
    echo "3. Obtain and install SSL certificates"
    echo "4. Configure nginx with the provided configuration"
    echo "5. Start the production services"
    echo ""
    exit 0
else
    echo ""
    echo -e "${RED}❌ Some tests failed. Please fix the issues before deployment.${NC}"
    echo ""
    exit 1
fi
