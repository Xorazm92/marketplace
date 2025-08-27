#!/bin/bash

echo "🧪 INBOLA API ENDPOINTS TEST"
echo "================================"

BASE_URL="http://localhost:3001"

# Test function
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    echo -n "Testing $description... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL$endpoint")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "%{http_code}" -o /dev/null -X POST -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
    fi
    
    if [ "$response" = "200" ] || [ "$response" = "201" ]; then
        echo "✅ OK ($response)"
    else
        echo "❌ FAIL ($response)"
    fi
}

echo ""
echo "🏥 HEALTH & BASIC ENDPOINTS"
echo "----------------------------"
test_endpoint "GET" "/health" "Health Check"

echo ""
echo "📦 PRODUCT ENDPOINTS"
echo "--------------------"
test_endpoint "GET" "/api/v1/product/all" "Get All Products"
test_endpoint "GET" "/api/v1/product/1" "Get Product by ID"
test_endpoint "GET" "/api/v1/product/search?q=bolalar" "Search Products"

echo ""
echo "📂 CATEGORY ENDPOINTS"
echo "---------------------"
test_endpoint "GET" "/api/v1/category" "Get All Categories"
test_endpoint "GET" "/api/v1/category/1" "Get Category by ID"

echo ""
echo "🏷️ BRAND ENDPOINTS"
echo "-------------------"
test_endpoint "GET" "/api/v1/brand" "Get All Brands"

echo ""
echo "💰 CURRENCY ENDPOINTS"
echo "---------------------"
test_endpoint "GET" "/api/v1/currency" "Get All Currencies"

echo ""
echo "🎨 COLOR ENDPOINTS"
echo "------------------"
test_endpoint "GET" "/api/v1/colors" "Get All Colors"

echo ""
echo "🌍 REGION ENDPOINTS"
echo "-------------------"
test_endpoint "GET" "/api/v1/region" "Get All Regions"
test_endpoint "GET" "/api/v1/district" "Get All Districts"

echo ""
echo "📧 NOTIFICATION ENDPOINTS"
echo "-------------------------"
test_endpoint "GET" "/api/v1/email" "Get All Emails"

echo ""
echo "⭐ REVIEW ENDPOINTS"
echo "-------------------"
test_endpoint "GET" "/api/v1/reviews/product/1" "Get Product Reviews"
test_endpoint "GET" "/api/v1/reviews/product/1/stats" "Get Review Stats"

echo ""
echo "📊 ADMIN ENDPOINTS"
echo "------------------"
test_endpoint "GET" "/api/v1/admin/dashboard" "Admin Dashboard"
test_endpoint "GET" "/api/v1/admin/users" "Admin Users"
test_endpoint "GET" "/api/v1/admin/products" "Admin Products"

echo ""
echo "🔐 AUTH ENDPOINTS"
echo "-----------------"
test_endpoint "GET" "/api/v1/phone-auth/check-phone?phone=%2B998901234567" "Check Phone"

echo ""
echo "📱 OTP ENDPOINTS"
echo "----------------"
# OTP endpoints need POST with data, skipping for now

echo ""
echo "🛒 CART ENDPOINTS (Need Auth)"
echo "-----------------------------"
# Cart endpoints need authentication, will show 401

echo ""
echo "📋 ORDER ENDPOINTS (Need Auth)"
echo "------------------------------"
# Order endpoints need authentication, will show 401

echo ""
echo "💳 PAYMENT ENDPOINTS"
echo "--------------------"
test_endpoint "GET" "/api/v1/payment-methods" "Get Payment Methods"

echo ""
echo "📁 STATIC FILES"
echo "---------------"
test_endpoint "GET" "/uploads/product1.svg" "Static File Serving"

echo ""
echo "🔧 GRAPHQL ENDPOINT"
echo "-------------------"
test_endpoint "GET" "/graphql" "GraphQL Playground"

echo ""
echo "📚 API DOCUMENTATION"
echo "--------------------"
test_endpoint "GET" "/api-docs" "Swagger Documentation"

echo ""
echo "✅ TEST COMPLETED!"
echo "=================="
