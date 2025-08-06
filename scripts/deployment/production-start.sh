#!/bin/bash

# INBOLA Marketplace - Production Startup Script
# This script starts all services in production mode

set -e

echo "🚀 Starting INBOLA Marketplace in Production Mode..."
echo "=================================================="

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

# Check if required services are running
check_service() {
    local service_name=$1
    local port=$2
    
    if nc -z localhost $port 2>/dev/null; then
        print_status "$service_name is running on port $port"
        return 0
    else
        print_error "$service_name is not running on port $port"
        return 1
    fi
}

# Start database services
echo ""
print_info "Starting database services..."
docker-compose -f docker-compose.prod.yml up -d postgres redis

# Wait for services to be ready
echo ""
print_info "Waiting for services to be ready..."
sleep 10

# Check database connection
if check_service "PostgreSQL" 5432; then
    print_status "Database is ready"
else
    print_error "Database failed to start"
    exit 1
fi

if check_service "Redis" 6379; then
    print_status "Redis is ready"
else
    print_error "Redis failed to start"
    exit 1
fi

# Apply database migrations
echo ""
print_info "Applying database migrations..."
cd backend-main
npm run prisma:migrate:deploy
npm run seed
cd ..

# Start backend
echo ""
print_info "Starting backend service..."
cd backend-main
npm run build
nohup node dist/src/main.js > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../logs/backend.pid
cd ..

# Wait for backend to start
sleep 5

if check_service "Backend API" 3001; then
    print_status "Backend is running (PID: $BACKEND_PID)"
else
    print_error "Backend failed to start"
    exit 1
fi

# Start frontend
echo ""
print_info "Starting frontend service..."
cd front-main
npm run build
nohup npm run start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../logs/frontend.pid
cd ..

# Wait for frontend to start
sleep 5

if check_service "Frontend App" 3000; then
    print_status "Frontend is running (PID: $FRONTEND_PID)"
else
    print_error "Frontend failed to start"
    exit 1
fi

# Final health check
echo ""
print_info "Performing final health checks..."

# Check backend health
HEALTH_CHECK=$(curl -s http://localhost:3001/health | jq -r '.status' 2>/dev/null || echo "FAILED")
if [ "$HEALTH_CHECK" = "OK" ]; then
    print_status "Backend health check passed"
else
    print_error "Backend health check failed"
fi

# Check frontend
FRONTEND_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$FRONTEND_CHECK" = "200" ]; then
    print_status "Frontend health check passed"
else
    print_error "Frontend health check failed"
fi

echo ""
echo "🎉 INBOLA Marketplace is now running in production mode!"
echo "=================================================="
echo ""
print_info "Service URLs:"
echo "  🌐 Frontend:     http://localhost:3000"
echo "  🔧 Backend API:  http://localhost:3001"
echo "  📚 API Docs:     http://localhost:3001/api-docs"
echo "  🔍 GraphQL:      http://localhost:3001/graphql"
echo "  ❤️  Health:      http://localhost:3001/health"
echo ""
print_info "Process IDs:"
echo "  Backend PID:  $BACKEND_PID"
echo "  Frontend PID: $FRONTEND_PID"
echo ""
print_info "Log files:"
echo "  Backend:  logs/backend.log"
echo "  Frontend: logs/frontend.log"
echo ""
print_warning "To stop services, run: ./production-stop.sh"
echo ""
print_status "Production deployment completed successfully! 🚀"
