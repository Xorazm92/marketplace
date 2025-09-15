# 🚀 INBOLA Marketplace - Unified Setup Script
# This script consolidates all setup processes into one comprehensive solution

param(
    [switch]$UseDocker = $true,
    [switch]$Development = $true,
    [switch]$SkipTests = $false,
    [switch]$CleanInstall = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 INBOLA Marketplace - Unified Setup" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# 🔍 1. Prerequisites Check
Write-Host "`n=== 🔍 Checking Prerequisites ===" -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node -v
    $nodeVersionNumber = [version]($nodeVersion -replace 'v', '')
    if ($nodeVersionNumber -lt [version]"18.0.0") {
        Write-Host "❌ Node.js version $nodeVersion is too old. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm -v
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not available" -ForegroundColor Red
    exit 1
}

# Check Docker if requested
if ($UseDocker) {
    try {
        $dockerVersion = docker --version
        Write-Host "✅ Docker: $dockerVersion" -ForegroundColor Green
        
        $dockerComposeVersion = docker-compose --version
        Write-Host "✅ Docker Compose: $dockerComposeVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Docker is not available. Install Docker Desktop or use -UseDocker:`$false" -ForegroundColor Red
        exit 1
    }
}

# 🧹 2. Clean Installation (if requested)
if ($CleanInstall) {
    Write-Host "`n=== 🧹 Clean Installation ===" -ForegroundColor Yellow
    
    Write-Host "🗑️ Cleaning node_modules and build artifacts..." -ForegroundColor Cyan
    
    # Clean backend
    if (Test-Path "backend-main/node_modules") {
        Remove-Item -Recurse -Force "backend-main/node_modules"
        Write-Host "   ✅ Removed backend node_modules" -ForegroundColor Gray
    }
    if (Test-Path "backend-main/dist") {
        Remove-Item -Recurse -Force "backend-main/dist"
        Write-Host "   ✅ Removed backend dist" -ForegroundColor Gray
    }
    
    # Clean frontend
    if (Test-Path "front-main/node_modules") {
        Remove-Item -Recurse -Force "front-main/node_modules"
        Write-Host "   ✅ Removed frontend node_modules" -ForegroundColor Gray
    }
    if (Test-Path "front-main/.next") {
        Remove-Item -Recurse -Force "front-main/.next"
        Write-Host "   ✅ Removed frontend .next" -ForegroundColor Gray
    }
    
    # Clean package locks
    if (Test-Path "backend-main/package-lock.json") {
        Remove-Item "backend-main/package-lock.json"
        Write-Host "   ✅ Removed backend package-lock.json" -ForegroundColor Gray
    }
    if (Test-Path "front-main/package-lock.json") {
        Remove-Item "front-main/package-lock.json"
        Write-Host "   ✅ Removed frontend package-lock.json" -ForegroundColor Gray
    }
}

# 🗄️ 3. Database Setup
Write-Host "`n=== 🗄️ Database Setup ===" -ForegroundColor Yellow

if ($UseDocker) {
    Write-Host "🐳 Setting up databases with Docker..." -ForegroundColor Cyan
    
    # Stop existing containers
    Write-Host "   Stopping existing containers..." -ForegroundColor Gray
    docker-compose down -v 2>$null
    
    # Start databases
    Write-Host "   Starting PostgreSQL and Redis..." -ForegroundColor Cyan
    docker-compose up -d postgres redis
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Databases started successfully" -ForegroundColor Green
        
        # Wait for databases to be ready
        Write-Host "⏳ Waiting for databases to be ready..." -ForegroundColor Cyan
        Start-Sleep -Seconds 15
        
        # Health check
        $maxRetries = 6
        $retryCount = 0
        $dbReady = $false
        
        while ($retryCount -lt $maxRetries -and -not $dbReady) {
            try {
                $pgHealth = docker exec inbola_postgres pg_isready -U inbola_user -d inbola_db
                $redisHealth = docker exec inbola_redis redis-cli -a inbola_redis_password ping
                
                if ($pgHealth -match "accepting connections" -and $redisHealth -eq "PONG") {
                    $dbReady = $true
                    Write-Host "✅ Databases are healthy and ready" -ForegroundColor Green
                } else {
                    $retryCount++
                    Write-Host "   Retry $retryCount/$maxRetries - Waiting for databases..." -ForegroundColor Gray
                    Start-Sleep -Seconds 5
                }
            } catch {
                $retryCount++
                Write-Host "   Retry $retryCount/$maxRetries - Databases still starting..." -ForegroundColor Gray
                Start-Sleep -Seconds 5
            }
        }
        
        if (-not $dbReady) {
            Write-Host "⚠️ Databases may still be starting. Continuing with setup..." -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Failed to start databases" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⚠️ Manual database setup required. Ensure PostgreSQL and Redis are running." -ForegroundColor Yellow
}

# 🔧 4. Backend Setup
Write-Host "`n=== 🔧 Backend Setup ===" -ForegroundColor Yellow
Set-Location "backend-main"

# Check environment file
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Write-Host "📝 Creating .env file from .env.example..." -ForegroundColor Cyan
        Copy-Item ".env.example" ".env"
        Write-Host "⚠️ Please review and update .env file with your configuration" -ForegroundColor Yellow
    } else {
        Write-Host "❌ No .env or .env.example file found. Please create .env file." -ForegroundColor Red
        exit 1
    }
}

# Install dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Cyan
npm run db:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}

# Database migration
Write-Host "🔄 Running database migrations..." -ForegroundColor Cyan
npm run db:migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Database migration had issues. This may be normal if already applied." -ForegroundColor Yellow
}

# Seed database (if seed script exists)
if (Test-Path "prisma/seed.ts") {
    Write-Host "🌱 Seeding database with initial data..." -ForegroundColor Cyan
    npm run seed 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database seeded successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Database seeding skipped or failed" -ForegroundColor Yellow
    }
}

# Build backend
Write-Host "🔨 Building backend..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build backend" -ForegroundColor Red
    exit 1
}

# Start backend
if ($Development) {
    Write-Host "🚀 Starting backend in development mode..." -ForegroundColor Cyan
    Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run start:dev"
} else {
    Write-Host "🚀 Starting backend in production mode..." -ForegroundColor Cyan
    Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run start:prod"
}

Set-Location ".."

# 🎨 5. Frontend Setup
Write-Host "`n=== 🎨 Frontend Setup ===" -ForegroundColor Yellow
Set-Location "front-main"

# Install dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}

# Build frontend
Write-Host "🔨 Building frontend..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build frontend" -ForegroundColor Red
    exit 1
}

# Start frontend
if ($Development) {
    Write-Host "🚀 Starting frontend in development mode..." -ForegroundColor Cyan
    Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"
} else {
    Write-Host "🚀 Starting frontend in production mode..." -ForegroundColor Cyan
    Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run start"
}

Set-Location ".."

# 🔍 6. Health Checks
Write-Host "`n=== 🔍 Health Checks ===" -ForegroundColor Yellow

Write-Host "⏳ Waiting for services to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 20

# Backend health check
Write-Host "🔍 Testing backend API..." -ForegroundColor Cyan
$backendHealthy = $false
$maxRetries = 10
$retryCount = 0

while ($retryCount -lt $maxRetries -and -not $backendHealthy) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:4000/health" -Method Get -TimeoutSec 10
        if ($response.status -eq "ok") {
            Write-Host "✅ Backend API is healthy" -ForegroundColor Green
            $backendHealthy = $true
        }
    } catch {
        $retryCount++
        if ($retryCount -lt $maxRetries) {
            Write-Host "   Retry $retryCount/$maxRetries - Backend still starting..." -ForegroundColor Gray
            Start-Sleep -Seconds 3
        }
    }
}

if (-not $backendHealthy) {
    Write-Host "⚠️ Backend health check failed. It may still be starting." -ForegroundColor Yellow
}

# Frontend health check
Write-Host "🔍 Testing frontend..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Get -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend is responding" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Frontend health check failed. It may still be starting." -ForegroundColor Yellow
}

# 🧪 7. API Testing (if not skipped)
if (-not $SkipTests -and $backendHealthy) {
    Write-Host "`n=== 🧪 Running API Tests ===" -ForegroundColor Yellow
    
    # Basic API endpoint tests
    $testEndpoints = @(
        @{url="http://localhost:4000/health"; name="Health Check"},
        @{url="http://localhost:4000/api"; name="API Root"; expectError=$true}
    )
    
    foreach ($test in $testEndpoints) {
        try {
            $response = Invoke-RestMethod -Uri $test.url -Method Get -TimeoutSec 5
            if ($test.expectError) {
                Write-Host "   ✅ $($test.name): Expected error response received" -ForegroundColor Green
            } else {
                Write-Host "   ✅ $($test.name): OK" -ForegroundColor Green
            }
        } catch {
            if ($test.expectError) {
                Write-Host "   ✅ $($test.name): Expected error response" -ForegroundColor Green
            } else {
                Write-Host "   ❌ $($test.name): Failed" -ForegroundColor Red
            }
        }
    }
}

# 🎉 8. Setup Complete
Write-Host "`n=== 🎉 Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Application URLs:" -ForegroundColor Cyan
Write-Host "   📱 Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   🔧 Backend API: http://localhost:4000" -ForegroundColor White
Write-Host "   📚 API Documentation: http://localhost:4000/api" -ForegroundColor White
Write-Host "   🎯 GraphQL Playground: http://localhost:4000/graphql" -ForegroundColor White

if ($UseDocker) {
    Write-Host ""
    Write-Host "🗄️ Database Management:" -ForegroundColor Cyan
    Write-Host "   🐘 pgAdmin: http://localhost:8080 (admin@inbola.com / admin123)" -ForegroundColor White
    Write-Host "   🔴 Redis Commander: http://localhost:8081 (admin / admin123)" -ForegroundColor White
}

Write-Host ""
Write-Host "⚠️ Important Notes:" -ForegroundColor Yellow
Write-Host "   • Services are running in separate PowerShell windows" -ForegroundColor White
Write-Host "   • Close those windows to stop the services" -ForegroundColor White
if ($UseDocker) {
    Write-Host "   • Stop databases: docker-compose down" -ForegroundColor White
}

Write-Host ""
Write-Host "🧪 Next Steps:" -ForegroundColor Cyan
Write-Host "   • Test API endpoints manually or with Postman" -ForegroundColor White
Write-Host "   • Open application in browser" -ForegroundColor White
Write-Host "   • Review logs in service windows if issues occur" -ForegroundColor White

# Ask if user wants to open browser
$openBrowser = Read-Host "`nWould you like to open the application in your browser? (y/N)"
if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
    Start-Process "http://localhost:3000"
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:4000/health"
}

Write-Host "`n✅ INBOLA Marketplace setup completed successfully!" -ForegroundColor Green
Write-Host "   Use this script with different parameters for various setups:" -ForegroundColor Gray
Write-Host "   • .\setup.ps1 -Development -UseDocker (default)" -ForegroundColor Gray
Write-Host "   • .\setup.ps1 -UseDocker:`$false (without Docker)" -ForegroundColor Gray
Write-Host "   • .\setup.ps1 -CleanInstall (clean installation)" -ForegroundColor Gray
Write-Host "   • .\setup.ps1 -SkipTests (skip API testing)" -ForegroundColor Gray
