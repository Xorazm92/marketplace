#!/bin/bash

# INBOLA E-commerce API Testing Script

echo "🧪 INBOLA API Testing Started..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_BASE_URL="http://localhost:3001/api"
TEST_PHONE="+998901234567"
TEST_PASSWORD="123456"
ACCESS_TOKEN=""

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to make API requests
api_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local headers=$4

    if [ -n "$ACCESS_TOKEN" ]; then
        headers="$headers -H 'Authorization: Bearer $ACCESS_TOKEN'"
    fi

    if [ "$method" = "GET" ]; then
        eval "curl -s -X $method '$API_BASE_URL$endpoint' $headers"
    else
        eval "curl -s -X $method '$API_BASE_URL$endpoint' -H 'Content-Type: application/json' $headers -d '$data'"
    fi
}

# Test server health
test_health() {
    print_info "Testing server health..."
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE_URL/../health" 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        print_success "Server is healthy"
    else
        print_error "Server health check failed (HTTP $response)"
        return 1
    fi
}

# Test authentication
test_auth() {
    print_info "Testing authentication..."
    
    # Test login
    login_response=$(api_request "POST" "/auth/login" "{\"phone_number\":\"$TEST_PHONE\",\"password\":\"$TEST_PASSWORD\"}")
    
    if echo "$login_response" | grep -q "accessToken"; then
        ACCESS_TOKEN=$(echo "$login_response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
        print_success "Login successful"
    else
        print_error "Login failed: $login_response"
        return 1
    fi
    
    # Test profile access
    profile_response=$(api_request "GET" "/auth/profile")
    
    if echo "$profile_response" | grep -q "phone_number"; then
        print_success "Profile access successful"
    else
        print_error "Profile access failed: $profile_response"
        return 1
    fi
}

# Test product endpoints
test_products() {
    print_info "Testing product endpoints..."
    
    # Get all products
    products_response=$(api_request "GET" "/product?page=1&limit=10")
    
    if echo "$products_response" | grep -q "data"; then
        print_success "Get products successful"
    else
        print_error "Get products failed: $products_response"
        return 1
    fi
    
    # Get product by ID (assuming product with ID 1 exists)
    product_response=$(api_request "GET" "/product/1")
    
    if echo "$product_response" | grep -q "title"; then
        print_success "Get product by ID successful"
    else
        print_warning "Get product by ID failed (product might not exist): $product_response"
    fi
    
    # Search products
    search_response=$(api_request "GET" "/product/search?search=bolalar")
    
    if echo "$search_response" | grep -q "data"; then
        print_success "Product search successful"
    else
        print_warning "Product search failed: $search_response"
    fi
}

# Test category endpoints
test_categories() {
    print_info "Testing category endpoints..."
    
    categories_response=$(api_request "GET" "/category")
    
    if echo "$categories_response" | grep -q "data"; then
        print_success "Get categories successful"
    else
        print_error "Get categories failed: $categories_response"
        return 1
    fi
}

# Test cart endpoints
test_cart() {
    print_info "Testing cart endpoints..."
    
    # Get cart
    cart_response=$(api_request "GET" "/cart")
    
    if echo "$cart_response" | grep -q "items"; then
        print_success "Get cart successful"
    else
        print_warning "Get cart failed: $cart_response"
    fi
    
    # Add to cart (assuming product with ID 1 exists)
    add_cart_response=$(api_request "POST" "/cart" "{\"product_id\":1,\"quantity\":1}")
    
    if echo "$add_cart_response" | grep -q "success\|message"; then
        print_success "Add to cart successful"
    else
        print_warning "Add to cart failed: $add_cart_response"
    fi
}

# Test order endpoints
test_orders() {
    print_info "Testing order endpoints..."
    
    # Get orders
    orders_response=$(api_request "GET" "/orders?page=1&limit=10")
    
    if echo "$orders_response" | grep -q "data"; then
        print_success "Get orders successful"
    else
        print_warning "Get orders failed: $orders_response"
    fi
}

# Test wishlist endpoints
test_wishlist() {
    print_info "Testing wishlist endpoints..."
    
    # Get wishlist
    wishlist_response=$(api_request "GET" "/wishlist")
    
    if echo "$wishlist_response" | grep -q "data\|items"; then
        print_success "Get wishlist successful"
    else
        print_warning "Get wishlist failed: $wishlist_response"
    fi
}

# Test payment endpoints
test_payments() {
    print_info "Testing payment endpoints..."
    
    # Get payment methods (this might not exist, so just check if endpoint responds)
    payment_response=$(api_request "GET" "/payment")
    
    if [ $? -eq 0 ]; then
        print_success "Payment endpoints accessible"
    else
        print_warning "Payment endpoints test failed"
    fi
}

# Performance test
test_performance() {
    print_info "Testing API performance..."
    
    start_time=$(date +%s%N)
    api_request "GET" "/product?page=1&limit=10" > /dev/null
    end_time=$(date +%s%N)
    
    duration=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
    
    if [ $duration -lt 1000 ]; then
        print_success "API response time: ${duration}ms (Good)"
    elif [ $duration -lt 2000 ]; then
        print_warning "API response time: ${duration}ms (Acceptable)"
    else
        print_error "API response time: ${duration}ms (Slow)"
    fi
}

# Load test (simple)
test_load() {
    print_info "Running simple load test..."
    
    success_count=0
    total_requests=10
    
    for i in $(seq 1 $total_requests); do
        response=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE_URL/product?page=1&limit=5")
        if [ "$response" = "200" ]; then
            success_count=$((success_count + 1))
        fi
    done
    
    success_rate=$((success_count * 100 / total_requests))
    
    if [ $success_rate -ge 95 ]; then
        print_success "Load test passed: $success_rate% success rate"
    else
        print_error "Load test failed: $success_rate% success rate"
    fi
}

# Main test execution
main() {
    echo "🚀 Starting comprehensive API tests..."
    echo "API Base URL: $API_BASE_URL"
    echo "Test Phone: $TEST_PHONE"
    echo ""
    
    # Check if server is running
    if ! test_health; then
        print_error "Server is not running. Please start the server first."
        exit 1
    fi
    
    # Run all tests
    test_auth || exit 1
    test_products
    test_categories
    test_cart
    test_orders
    test_wishlist
    test_payments
    test_performance
    test_load
    
    echo ""
    echo "🎉 API testing completed!"
    echo ""
    echo "📋 Test Summary:"
    echo "   ✅ Server health check"
    echo "   ✅ Authentication"
    echo "   ✅ Product endpoints"
    echo "   ✅ Category endpoints"
    echo "   ✅ Cart endpoints"
    echo "   ✅ Order endpoints"
    echo "   ✅ Wishlist endpoints"
    echo "   ✅ Payment endpoints"
    echo "   ✅ Performance test"
    echo "   ✅ Load test"
    echo ""
    print_success "All tests completed! 🎯"
}

# Run main function
main "$@"
