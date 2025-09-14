# 🚀 Marketplace Deployment Script for Windows
# This script sets up and runs the marketplace application on Windows

Write-Host "🚀 Starting Marketplace Deployment for Windows..." -ForegroundColor Green

# 🚀 1. Check prerequisites
Write-Host "`n=== Checking Prerequisites ===" -ForegroundColor Yellow

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm -v
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed" -ForegroundColor Red
    exit 1
}

# Check if Docker is available (optional)
try {
    $dockerVersion = docker -v
    Write-Host "✅ Docker version: $dockerVersion" -ForegroundColor Green
    $dockerAvailable = $true
} catch {
    Write-Host "⚠️  Docker is not available. You'll need to set up PostgreSQL and Redis manually." -ForegroundColor Yellow
    $dockerAvailable = $false
}

# 🚀 2. Setup Backend
Write-Host "`n=== Setting up Backend ===" -ForegroundColor Yellow
Set-Location "backend-main"

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Cyan
npm install

# Check if database is configured
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found in backend-main directory" -ForegroundColor Red
    Write-Host "Please ensure the .env file exists with proper database configuration" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Environment file found" -ForegroundColor Green

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Cyan
npm run db:generate

# Build the backend
Write-Host "🔨 Building backend..." -ForegroundColor Cyan
npm run build

# Start backend in development mode (background process)
Write-Host "🚀 Starting backend server on port 4000..." -ForegroundColor Cyan
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run start:dev"

# Wait a moment for backend to start
Start-Sleep -Seconds 5

# Go back to root directory
Set-Location ".."

# 🚀 3. Setup Frontend
Write-Host "`n=== Setting up Frontend ===" -ForegroundColor Yellow
Set-Location "front-main"

# Install frontend dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Cyan
npm install

# Build the frontend
Write-Host "🔨 Building frontend..." -ForegroundColor Cyan
npm run build

# Start frontend (background process)
Write-Host "🚀 Starting frontend server on port 3000..." -ForegroundColor Cyan
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run start"

# Wait a moment for frontend to start
Start-Sleep -Seconds 5

# Go back to root directory
Set-Location ".."

# 🚀 4. Health Checks
Write-Host "`n=== Running Health Checks ===" -ForegroundColor Yellow

# Wait for services to fully start
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Test backend API health
Write-Host "🔍 Testing backend API health..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/health" -Method Get -TimeoutSec 10
    Write-Host "✅ Backend API is responding" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend API health check failed. It might still be starting up." -ForegroundColor Yellow
}

# Test frontend
Write-Host "🔍 Testing frontend..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Get -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend is responding" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Frontend health check failed. It might still be starting up." -ForegroundColor Yellow
}

# 🚀 5. Final Instructions
Write-Host "`n=== Deployment Complete ===" -ForegroundColor Green
Write-Host "🎉 Marketplace application is starting up!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Frontend URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend API: http://localhost:4000" -ForegroundColor Cyan
Write-Host "📚 API Documentation: http://localhost:4000/api" -ForegroundColor Cyan
Write-Host "🎯 GraphQL Playground: http://localhost:4000/graphql" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Note: Services are starting in background processes." -ForegroundColor Yellow
Write-Host "   Close the PowerShell windows to stop the services." -ForegroundColor Yellow
Write-Host ""

# Optional: Open browser
$openBrowser = Read-Host "Would you like to open the application in your browser? (y/N)"
if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
    Start-Process "http://localhost:3000"
}

Write-Host "✅ Deployment script completed!" -ForegroundColor Green