#!/bin/bash

# Inbola Marketplace - Project Startup Script
# This script will start the entire marketplace project

set -e

echo "🚀 Starting Inbola Marketplace Project..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from template..."
    cp env.example .env
    print_success ".env file created from template"
fi

# Stop any existing containers
print_status "Stopping any existing containers..."
docker-compose -f docker-compose.dev.yml down --remove-orphans 2>/dev/null || true

# Build and start the development environment
print_status "Building and starting development environment..."
docker-compose -f docker-compose.dev.yml up --build -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Check if services are running
print_status "Checking service status..."

# Check PostgreSQL
if docker-compose -f docker-compose.dev.yml exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    print_success "PostgreSQL is ready"
else
    print_warning "PostgreSQL is still starting up..."
fi

# Check Redis
if docker-compose -f docker-compose.dev.yml exec -T redis redis-cli --raw incr ping > /dev/null 2>&1; then
    print_success "Redis is ready"
else
    print_warning "Redis is still starting up..."
fi

# Wait a bit more for backend to be ready
print_status "Waiting for backend to be ready..."
sleep 15

# Check backend health
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    print_success "Backend API is ready"
else
    print_warning "Backend API is still starting up..."
fi

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_success "Frontend is ready"
else
    print_warning "Frontend is still starting up..."
fi

# Show service URLs
echo ""
print_success "🎉 Inbola Marketplace is starting up!"
echo ""
echo "📱 Service URLs:"
echo "   Frontend:     http://localhost:3000"
echo "   Backend API:  http://localhost:3001"
echo "   GraphQL:      http://localhost:3001/graphql"
echo "   Health Check: http://localhost:3001/health"
echo ""
echo "🗄️  Database:"
echo "   PostgreSQL:   localhost:5432"
echo "   Redis:        localhost:6379"
echo ""
echo "📊 Monitoring:"
echo "   To view logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "   To stop:      docker-compose -f docker-compose.dev.yml down"
echo ""

# Show container status
print_status "Container Status:"
docker-compose -f docker-compose.dev.yml ps

echo ""
print_success "Setup complete! The marketplace should be accessible at http://localhost:3000"
