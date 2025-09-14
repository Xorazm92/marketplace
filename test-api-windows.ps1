# API Testing Script for Windows
# This script tests the marketplace API endpoints

Write-Host "🧪 Testing Marketplace API Endpoints..." -ForegroundColor Green

$baseUrl = "http://localhost:4000"
$frontendUrl = "http://localhost:3000"

# Function to test an endpoint
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null,
        [string]$Description
    )
    
    Write-Host "`n🔍 Testing: $Description" -ForegroundColor Cyan
    Write-Host "   URL: $Url" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            TimeoutSec = 10
        }
        
        if ($Headers.Count -gt 0) {
            $params.Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "   ✅ SUCCESS - Status: OK" -ForegroundColor Green
        return $true
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode) {
            Write-Host "   ❌ FAILED - Status: $statusCode" -ForegroundColor Red
        } else {
            Write-Host "   ❌ FAILED - Connection Error" -ForegroundColor Red
        }
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to test with JSON body
function Test-JsonEndpoint {
    param(
        [string]$Url,
        [string]$Method,
        [hashtable]$JsonBody,
        [string]$Description
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    $body = $JsonBody | ConvertTo-Json
    Test-Endpoint -Url $Url -Method $Method -Headers $headers -Body $body -Description $Description
}

Write-Host "`n=== Basic Health Checks ===" -ForegroundColor Yellow

# Test if backend is responding
Test-Endpoint -Url "$baseUrl/health" -Description "Backend Health Check"

# Test if frontend is responding
Test-Endpoint -Url $frontendUrl -Description "Frontend Health Check"

Write-Host "`n=== API Endpoint Tests ===" -ForegroundColor Yellow

# Test API documentation
Test-Endpoint -Url "$baseUrl/api" -Description "API Documentation"

# Test GraphQL endpoint
Test-Endpoint -Url "$baseUrl/graphql" -Method "POST" -Headers @{"Content-Type" = "application/json"} -Body '{"query": "{ __schema { types { name } } }"}' -Description "GraphQL Schema Query"

Write-Host "`n=== Authentication Tests ===" -ForegroundColor Yellow

# Test user signup
$signupData = @{
    email = "test@example.com"
    password = "123456"
    name = "Test User"
}
Test-JsonEndpoint -Url "$baseUrl/auth/signup" -Method "POST" -JsonBody $signupData -Description "User Signup"

# Test user login
$loginData = @{
    email = "test@example.com"
    password = "123456"
}
Test-JsonEndpoint -Url "$baseUrl/auth/login" -Method "POST" -JsonBody $loginData -Description "User Login"

Write-Host "`n=== Product Tests ===" -ForegroundColor Yellow

# Test get products
Test-Endpoint -Url "$baseUrl/products" -Description "Get Products List"

# Test get categories
Test-Endpoint -Url "$baseUrl/categories" -Description "Get Categories"

# Test get brands
Test-Endpoint -Url "$baseUrl/brands" -Description "Get Brands"

Write-Host "`n=== Other Endpoints ===" -ForegroundColor Yellow

# Test regions
Test-Endpoint -Url "$baseUrl/regions" -Description "Get Regions"

# Test districts (might need region ID)
Test-Endpoint -Url "$baseUrl/districts" -Description "Get Districts"

Write-Host "`n=== Test Summary ===" -ForegroundColor Green
Write-Host "API testing completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Frontend: $frontendUrl" -ForegroundColor Cyan
Write-Host "🔧 Backend API: $baseUrl" -ForegroundColor Cyan
Write-Host "📚 API Documentation: $baseUrl/api" -ForegroundColor Cyan
Write-Host "🎯 GraphQL Playground: $baseUrl/graphql" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Tip: If some tests failed, make sure both backend and frontend are fully started." -ForegroundColor Yellow