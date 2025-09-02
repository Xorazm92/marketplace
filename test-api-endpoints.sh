#!/bin/bash

# INBOLA Marketplace API Testing Script
# This script tests all major API endpoints with curl commands

BASE_URL="http://localhost:3001"
API_URL="$BASE_URL/api"
GRAPHQL_URL="$BASE_URL/graphql"

echo "🧪 INBOLA Marketplace API Testing"
echo "=================================="
echo "Base URL: $BASE_URL"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local description=$3
    local data=$4
    local headers=$5
    
    echo -e "${BLUE}Testing:${NC} $description"
    echo -e "${YELLOW}$method${NC} $url"
    
    if [ -n "$data" ]; then
        if [ -n "$headers" ]; then
            response=$(curl -s -w "\n%{http_code}" -X $method "$url" -H "Content-Type: application/json" $headers -d "$data")
        else
            response=$(curl -s -w "\n%{http_code}" -X $method "$url" -H "Content-Type: application/json" -d "$data")
        fi
    else
        if [ -n "$headers" ]; then
            response=$(curl -s -w "\n%{http_code}" -X $method "$url" $headers)
        else
            response=$(curl -s -w "\n%{http_code}" -X $method "$url")
        fi
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 400 ]; then
        echo -e "${GREEN}✅ Success${NC} (HTTP $http_code)"
    else
        echo -e "${RED}❌ Failed${NC} (HTTP $http_code)"
    fi
    
    echo "Response: $body"
    echo ""
}

# Test Health Check
echo "=== 🏥 Health Checks ==="
test_endpoint "GET" "$BASE_URL/health" "Health Check"
test_endpoint "GET" "$BASE_URL/" "Root Endpoint"

# Test API Documentation
echo "=== 📚 API Documentation ==="
test_endpoint "GET" "$BASE_URL/api-docs" "Swagger Documentation"

# Test Authentication Endpoints
echo "=== 🔐 Authentication ==="

# Admin Authentication
test_endpoint "POST" "$API_URL/auth/admin/sign-in" "Admin Login" '{
    "email": "admin@inbola.uz",
    "password": "admin123"
}'

# User Authentication (requires OTP verification first)
test_endpoint "POST" "$API_URL/auth/user/login" "User Login" '{
    "phone_number": "+998901234567",
    "password": "user123"
}'

# Test Product Endpoints
echo "=== 📦 Products ==="
test_endpoint "GET" "$API_URL/products" "Get All Products"
test_endpoint "GET" "$API_URL/products/1" "Get Product by ID"
test_endpoint "GET" "$API_URL/products/search?q=toy" "Search Products"

# Test Category Endpoints
echo "=== 📂 Categories ==="
test_endpoint "GET" "$API_URL/categories" "Get All Categories"
test_endpoint "GET" "$API_URL/categories/1" "Get Category by ID"

# Test Brand Endpoints
echo "=== 🏷️ Brands ==="
test_endpoint "GET" "$API_URL/brands" "Get All Brands"
test_endpoint "GET" "$API_URL/brands/1" "Get Brand by ID"

# Test User Endpoints (requires authentication)
echo "=== 👤 Users ==="
test_endpoint "GET" "$API_URL/users/profile" "Get User Profile" "" "-H 'Authorization: Bearer YOUR_TOKEN_HERE'"

# Test Cart Endpoints (requires authentication)
echo "=== 🛒 Cart ==="
test_endpoint "GET" "$API_URL/cart" "Get User Cart" "" "-H 'Authorization: Bearer YOUR_TOKEN_HERE'"

# Test Order Endpoints (requires authentication)
echo "=== 📋 Orders ==="
test_endpoint "GET" "$API_URL/orders" "Get User Orders" "" "-H 'Authorization: Bearer YOUR_TOKEN_HERE'"

# Test GraphQL Endpoint
echo "=== 🔗 GraphQL ==="
test_endpoint "POST" "$GRAPHQL_URL" "GraphQL Query - Get Products" '{
    "query": "query { products { id title price } }"
}'

# Test OTP Endpoints
echo "=== 📱 OTP ==="
test_endpoint "POST" "$API_URL/otp/send" "Send OTP" '{
    "phone_number": "+998901234567",
    "purpose": "registration"
}'

# Test Admin Endpoints (requires admin authentication)
echo "=== 🛡️ Admin ==="
test_endpoint "GET" "$API_URL/admin/products/pending" "Get Pending Products" "" "-H 'Authorization: Bearer YOUR_ADMIN_TOKEN_HERE'"
test_endpoint "GET" "$API_URL/admin/users" "Get All Users" "" "-H 'Authorization: Bearer YOUR_ADMIN_TOKEN_HERE'"

# Test File Upload
echo "=== 📁 File Upload ==="
test_endpoint "POST" "$API_URL/upload" "Upload File" "" "-F 'file=@/path/to/test/image.jpg'"

# Test Payment Endpoints
echo "=== 💳 Payments ==="
test_endpoint "GET" "$API_URL/payment-methods" "Get Payment Methods"

# Test Region/District Endpoints
echo "=== 🌍 Locations ==="
test_endpoint "GET" "$API_URL/regions" "Get All Regions"
test_endpoint "GET" "$API_URL/districts" "Get All Districts"

echo "=== 📊 Test Summary ==="
echo "All endpoint tests completed!"
echo "Check the results above for any failed endpoints."
echo ""
echo "📝 Notes:"
echo "- Some endpoints require authentication tokens"
echo "- Replace YOUR_TOKEN_HERE with actual JWT tokens"
echo "- Ensure the server is running on $BASE_URL"
echo "- Check server logs for detailed error information"
