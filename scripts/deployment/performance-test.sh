#!/bin/bash

# INBOLA Performance Testing Script
# Bu script load testing va performance testlarini o'tkazadi

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_step() {
    echo -e "${YELLOW}🔄 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Configuration
BASE_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"
RESULTS_DIR="performance-results"
DATE=$(date +%Y%m%d_%H%M%S)

print_header "🚀 INBOLA Performance Testing"

# Create results directory
mkdir -p "$RESULTS_DIR"

# Check prerequisites
check_prerequisites() {
    print_step "Prerequisites tekshiruvi..."
    
    # Check if curl is available
    if ! command -v curl &> /dev/null; then
        print_error "curl topilmadi!"
        exit 1
    fi
    
    # Check if ab (Apache Bench) is available
    if ! command -v ab &> /dev/null; then
        print_warning "Apache Bench (ab) topilmadi. O'rnatish: sudo apt install apache2-utils"
        AB_AVAILABLE=false
    else
        AB_AVAILABLE=true
        print_success "Apache Bench mavjud"
    fi
    
    # Check if wrk is available
    if ! command -v wrk &> /dev/null; then
        print_warning "wrk topilmadi. O'rnatish: sudo apt install wrk"
        WRK_AVAILABLE=false
    else
        WRK_AVAILABLE=true
        print_success "wrk mavjud"
    fi
    
    print_success "Prerequisites tekshirildi"
}

# Test API endpoints
test_api_endpoints() {
    print_step "API endpoints testlari..."
    
    ENDPOINTS=(
        "/health"
        "/api/v1/category"
        "/api/v1/brand"
        "/api/v1/product?page=1&limit=10"
    )
    
    for endpoint in "${ENDPOINTS[@]}"; do
        print_step "Testing: $endpoint"
        
        # Test response time
        RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' "$BASE_URL$endpoint")
        STATUS_CODE=$(curl -o /dev/null -s -w '%{http_code}' "$BASE_URL$endpoint")
        
        if [ "$STATUS_CODE" = "200" ]; then
            print_success "$endpoint - Status: $STATUS_CODE, Time: ${RESPONSE_TIME}s"
        else
            print_error "$endpoint - Status: $STATUS_CODE, Time: ${RESPONSE_TIME}s"
        fi
        
        echo "$endpoint,$STATUS_CODE,$RESPONSE_TIME" >> "$RESULTS_DIR/api_response_times_$DATE.csv"
    done
}

# Load testing with Apache Bench
load_test_ab() {
    if [ "$AB_AVAILABLE" = false ]; then
        print_warning "Apache Bench mavjud emas, load test o'tkazib yuborildi"
        return
    fi
    
    print_step "Apache Bench load testing..."
    
    # Test health endpoint with 1000 requests, 10 concurrent
    print_step "Health endpoint load test (1000 requests, 10 concurrent)..."
    ab -n 1000 -c 10 -g "$RESULTS_DIR/health_load_test_$DATE.tsv" "$BASE_URL/health" > "$RESULTS_DIR/health_load_test_$DATE.txt"
    
    # Test category endpoint
    print_step "Category endpoint load test (500 requests, 5 concurrent)..."
    ab -n 500 -c 5 -g "$RESULTS_DIR/category_load_test_$DATE.tsv" "$BASE_URL/api/v1/category" > "$RESULTS_DIR/category_load_test_$DATE.txt"
    
    # Test product endpoint
    print_step "Product endpoint load test (300 requests, 3 concurrent)..."
    ab -n 300 -c 3 -g "$RESULTS_DIR/product_load_test_$DATE.tsv" "$BASE_URL/api/v1/product?page=1&limit=10" > "$RESULTS_DIR/product_load_test_$DATE.txt"
    
    print_success "Apache Bench load testing tugallandi"
}

# Load testing with wrk
load_test_wrk() {
    if [ "$WRK_AVAILABLE" = false ]; then
        print_warning "wrk mavjud emas, load test o'tkazib yuborildi"
        return
    fi
    
    print_step "wrk load testing..."
    
    # Test health endpoint
    print_step "Health endpoint wrk test (30s, 10 threads, 100 connections)..."
    wrk -t10 -c100 -d30s --latency "$BASE_URL/health" > "$RESULTS_DIR/health_wrk_test_$DATE.txt"
    
    # Test category endpoint
    print_step "Category endpoint wrk test (30s, 5 threads, 50 connections)..."
    wrk -t5 -c50 -d30s --latency "$BASE_URL/api/v1/category" > "$RESULTS_DIR/category_wrk_test_$DATE.txt"
    
    print_success "wrk load testing tugallandi"
}

# Frontend performance test
test_frontend_performance() {
    print_step "Frontend performance testing..."
    
    # Test main page load time
    FRONTEND_RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' "$FRONTEND_URL")
    FRONTEND_STATUS=$(curl -o /dev/null -s -w '%{http_code}' "$FRONTEND_URL")
    
    if [ "$FRONTEND_STATUS" = "200" ]; then
        print_success "Frontend - Status: $FRONTEND_STATUS, Time: ${FRONTEND_RESPONSE_TIME}s"
    else
        print_error "Frontend - Status: $FRONTEND_STATUS, Time: ${FRONTEND_RESPONSE_TIME}s"
    fi
    
    echo "frontend,$FRONTEND_STATUS,$FRONTEND_RESPONSE_TIME" >> "$RESULTS_DIR/frontend_response_times_$DATE.csv"
}

# Database performance test
test_database_performance() {
    print_step "Database performance testing..."
    
    # Test database connection through API
    DB_TEST_TIME=$(curl -o /dev/null -s -w '%{time_total}' "$BASE_URL/api/v1/category")
    
    print_success "Database test (via API): ${DB_TEST_TIME}s"
    echo "database_via_api,$DB_TEST_TIME" >> "$RESULTS_DIR/database_performance_$DATE.csv"
}

# Memory and CPU monitoring
monitor_resources() {
    print_step "Resource monitoring boshlandi..."
    
    # Monitor for 60 seconds
    for i in {1..12}; do
        # Get memory usage
        MEMORY_USAGE=$(free | awk 'NR==2{printf "%.2f", $3*100/$2}')
        
        # Get CPU usage
        CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
        
        # Get disk usage
        DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
        
        echo "$(date),$MEMORY_USAGE,$CPU_USAGE,$DISK_USAGE" >> "$RESULTS_DIR/resource_monitoring_$DATE.csv"
        
        sleep 5
    done
    
    print_success "Resource monitoring tugallandi"
}

# Generate performance report
generate_report() {
    print_step "Performance hisobotini yaratish..."
    
    REPORT_FILE="$RESULTS_DIR/performance_report_$DATE.html"
    
    cat > "$REPORT_FILE" << EOF
<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>INBOLA Performance Test Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
        }
        .section {
            margin: 20px 0;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .metric {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 5px;
        }
        .good { color: #28a745; }
        .warning { color: #ffc107; }
        .error { color: #dc3545; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 INBOLA Performance Test Report</h1>
            <p>Test Date: $(date)</p>
        </div>
        
        <div class="section">
            <h2>📊 Test Summary</h2>
            <div class="metric">
                <span>Test Duration:</span>
                <span>~5 minutes</span>
            </div>
            <div class="metric">
                <span>Total Endpoints Tested:</span>
                <span>4</span>
            </div>
            <div class="metric">
                <span>Load Tests Performed:</span>
                <span>Yes</span>
            </div>
        </div>
        
        <div class="section">
            <h2>🎯 API Performance</h2>
            <p>Response times for key endpoints:</p>
            <table>
                <tr>
                    <th>Endpoint</th>
                    <th>Status</th>
                    <th>Response Time</th>
                    <th>Rating</th>
                </tr>
EOF

    # Add API results to report
    if [ -f "$RESULTS_DIR/api_response_times_$DATE.csv" ]; then
        while IFS=',' read -r endpoint status time; do
            rating="good"
            if (( $(echo "$time > 1.0" | bc -l) )); then
                rating="warning"
            fi
            if (( $(echo "$time > 2.0" | bc -l) )); then
                rating="error"
            fi
            
            echo "                <tr>" >> "$REPORT_FILE"
            echo "                    <td>$endpoint</td>" >> "$REPORT_FILE"
            echo "                    <td>$status</td>" >> "$REPORT_FILE"
            echo "                    <td>${time}s</td>" >> "$REPORT_FILE"
            echo "                    <td class=\"$rating\">$(echo $rating | tr '[:lower:]' '[:upper:]')</td>" >> "$REPORT_FILE"
            echo "                </tr>" >> "$REPORT_FILE"
        done < "$RESULTS_DIR/api_response_times_$DATE.csv"
    fi
    
    cat >> "$REPORT_FILE" << EOF
            </table>
        </div>
        
        <div class="section">
            <h2>📈 Load Test Results</h2>
            <p>Load test fayllari:</p>
            <ul>
EOF

    # List load test files
    for file in "$RESULTS_DIR"/*load_test_$DATE.txt; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            echo "                <li>$filename</li>" >> "$REPORT_FILE"
        fi
    done
    
    cat >> "$REPORT_FILE" << EOF
            </ul>
        </div>
        
        <div class="section">
            <h2>💡 Recommendations</h2>
            <ul>
                <li>API response time 1 soniyadan kam bo'lishi kerak</li>
                <li>Load test natijalarini tahlil qiling</li>
                <li>Database query optimizatsiyasini tekshiring</li>
                <li>Caching strategiyasini yaxshilang</li>
                <li>CDN ishlatishni ko'rib chiqing</li>
            </ul>
        </div>
        
        <div class="section">
            <h2>📁 Test Files</h2>
            <p>Barcha test natijalari <code>$RESULTS_DIR/</code> papkasida saqlanadi.</p>
        </div>
    </div>
</body>
</html>
EOF

    print_success "Performance hisoboti yaratildi: $REPORT_FILE"
}

# Main testing function
main() {
    print_step "Performance testing boshlandi..."
    
    check_prerequisites
    test_api_endpoints
    test_frontend_performance
    test_database_performance
    
    # Run load tests if tools are available
    load_test_ab
    load_test_wrk
    
    # Monitor resources
    monitor_resources &
    MONITOR_PID=$!
    
    # Wait a bit for monitoring
    sleep 10
    
    # Stop monitoring
    kill $MONITOR_PID 2>/dev/null || true
    
    generate_report
    
    print_header "🎉 Performance Testing tugallandi!"
    
    echo -e "${GREEN}"
    echo "✅ Performance testing muvaffaqiyatli tugallandi!"
    echo ""
    echo "📁 Natijalar:"
    echo "   - Hisobot: $RESULTS_DIR/performance_report_$DATE.html"
    echo "   - API response times: $RESULTS_DIR/api_response_times_$DATE.csv"
    echo "   - Resource monitoring: $RESULTS_DIR/resource_monitoring_$DATE.csv"
    echo ""
    echo "📊 Load test fayllari:"
    ls -la "$RESULTS_DIR"/*_$DATE.* 2>/dev/null || echo "   Load test fayllari topilmadi"
    echo ""
    echo "🔍 Hisobotni ko'rish:"
    echo "   xdg-open $RESULTS_DIR/performance_report_$DATE.html"
    echo -e "${NC}"
}

main "$@"
