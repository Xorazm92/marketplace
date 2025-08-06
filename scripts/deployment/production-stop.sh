#!/bin/bash

# INBOLA Marketplace - Production Stop Script
# This script stops all production services safely

set -e

echo "🛑 Stopping INBOLA Marketplace Production Services..."
echo "===================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Create logs directory if it doesn't exist
mkdir -p logs

# Function to stop process by PID file
stop_service() {
    local service_name=$1
    local pid_file=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            print_info "Stopping $service_name (PID: $pid)..."
            kill -TERM $pid
            
            # Wait for graceful shutdown
            local count=0
            while ps -p $pid > /dev/null 2>&1 && [ $count -lt 30 ]; do
                sleep 1
                count=$((count + 1))
            done
            
            # Force kill if still running
            if ps -p $pid > /dev/null 2>&1; then
                print_warning "Force killing $service_name..."
                kill -KILL $pid
            fi
            
            print_status "$service_name stopped"
        else
            print_warning "$service_name was not running"
        fi
        rm -f "$pid_file"
    else
        print_warning "No PID file found for $service_name"
    fi
}

# Stop frontend
print_info "Stopping frontend service..."
stop_service "Frontend" "logs/frontend.pid"

# Stop backend
print_info "Stopping backend service..."
stop_service "Backend" "logs/backend.pid"

# Stop any remaining Node.js processes related to the project
print_info "Cleaning up any remaining processes..."
pkill -f "node.*dist/src/main.js" 2>/dev/null || true
pkill -f "next start" 2>/dev/null || true

# Stop Docker services
print_info "Stopping Docker services..."
docker-compose -f docker-compose.prod.yml down

# Verify services are stopped
echo ""
print_info "Verifying services are stopped..."

# Check if ports are free
check_port_free() {
    local port=$1
    local service=$2
    
    if ! nc -z localhost $port 2>/dev/null; then
        print_status "$service port $port is now free"
    else
        print_warning "$service is still running on port $port"
    fi
}

check_port_free 3000 "Frontend"
check_port_free 3001 "Backend"
check_port_free 5432 "PostgreSQL"
check_port_free 6379 "Redis"

echo ""
print_status "All INBOLA Marketplace services have been stopped!"
echo ""
print_info "Log files are preserved in the logs/ directory"
print_info "To restart services, run: ./production-start.sh"
echo ""
print_status "Production services shutdown completed! 🛑"
