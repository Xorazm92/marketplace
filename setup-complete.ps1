# 🚀 Complete Marketplace Setup Script for Windows
# This script sets up databases and runs the marketplace application

param(
    [switch]$UseDocker,
    [switch]$SkipDependencies,
    [switch]$Development
)

Write-Host "🚀 Complete Marketplace Setup for Windows..." -ForegroundColor Green

# 🚀 1. Check prerequisites
Write-Host "`n=== Checking Prerequisites ===" -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm -v
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed" -ForegroundColor Red
    exit 1
}

# Check Docker if requested
if ($UseDocker) {
    try {
        $dockerVersion = docker -v
        Write-Host "✅ Docker version: $dockerVersion" -ForegroundColor Green
        
        $dockerComposeVersion = docker-compose -v
        Write-Host "✅ Docker Compose version: $dockerComposeVersion" -ForegroundColor Green
        $dockerAvailable = $true
    } catch {
        Write-Host "❌ Docker is not available but --UseDocker was specified" -ForegroundColor Red
        Write-Host "Please install Docker Desktop for Windows" -ForegroundColor Red
        exit 1
    }
}

# 🚀 2. Setup Databases
Write-Host "`n=== Setting up Databases ===" -ForegroundColor Yellow

if ($UseDocker) {
    Write-Host "🐳 Setting up databases with Docker..." -ForegroundColor Cyan
    
    # Check if docker-compose.yml exists
    if (-not (Test-Path "docker-compose.yml")) {
        Write-Host "❌ docker-compose.yml not found" -ForegroundColor Red
        exit 1
    }
    
    # Start databases
    Write-Host "Starting PostgreSQL and Redis..." -ForegroundColor Cyan
    docker-compose up -d postgres redis
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Databases started successfully" -ForegroundColor Green
        
        # Wait for databases to be ready
        Write-Host "⏳ Waiting for databases to be ready..." -ForegroundColor Cyan
        Start-Sleep -Seconds 10
        
        # Check database health
        $dbHealth = docker-compose ps --filter "status=running" --services | Select-String -Pattern "postgres|redis"
        if ($dbHealth) {
            Write-Host "✅ Databases are running and healthy" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Databases might still be starting up" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Failed to start databases with Docker" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⚠️  Docker not used. Please ensure PostgreSQL and Redis are running manually." -ForegroundColor Yellow
    Write-Host "   See DATABASE_SETUP_WINDOWS.md for manual setup instructions." -ForegroundColor Yellow
    
    # Test database connections
    Write-Host "🔍 Testing database connections..." -ForegroundColor Cyan
    
    # Test PostgreSQL
    try {
        $env:PGPASSWORD = "inbola_password"
        $pgResult = psql -h localhost -U inbola_user -d inbola_db -c "SELECT 1;" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ PostgreSQL connection successful" -ForegroundColor Green
        } else {
            Write-Host "❌ PostgreSQL connection failed" -ForegroundColor Red
        }
    } catch {
        Write-Host "⚠️  Could not test PostgreSQL (psql not found)" -ForegroundColor Yellow
    }
    
    # Test Redis
    try {
        $redisResult = redis-cli -h localhost -p 6379 -a inbola_redis_password ping 2>&1
        if ($redisResult -eq "PONG") {
            Write-Host "✅ Redis connection successful" -ForegroundColor Green
        } else {
            Write-Host "❌ Redis connection failed" -ForegroundColor Red
        }
    } catch {
        Write-Host "⚠️  Could not test Redis (redis-cli not found)" -ForegroundColor Yellow
    }
}

# 🚀 3. Setup Backend
Write-Host "`n=== Setting up Backend ===" -ForegroundColor Yellow
Set-Location "backend-main"

if (-not $SkipDependencies) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
        exit 1
    }
}

# Check environment file
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found in backend-main directory" -ForegroundColor Red
    Write-Host "Please ensure the .env file exists with proper database configuration" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Environment file found" -ForegroundColor Green

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Cyan
npm run db:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}

# Run database migrations
Write-Host "🔄 Running database migrations..." -ForegroundColor Cyan
npm run db:migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Database migration failed. This might be normal if migrations were already applied." -ForegroundColor Yellow
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

# Wait for backend to start
Start-Sleep -Seconds 8

Set-Location ".."

# 🚀 4. Setup Frontend
Write-Host "`n=== Setting up Frontend ===" -ForegroundColor Yellow
Set-Location "front-main"

if (-not $SkipDependencies) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
        exit 1
    }
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

# 🚀 5. Health Checks
Write-Host "`n=== Running Health Checks ===" -ForegroundColor Yellow

Write-Host "⏳ Waiting for services to fully start..." -ForegroundColor Cyan
Start-Sleep -Seconds 15

# Test backend
Write-Host "🔍 Testing backend API..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/health" -Method Get -TimeoutSec 15
    Write-Host "✅ Backend API is responding" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend API health check failed. It might still be starting up." -ForegroundColor Yellow
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Test frontend
Write-Host "🔍 Testing frontend..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Get -TimeoutSec 15
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend is responding" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Frontend health check failed. It might still be starting up." -ForegroundColor Yellow
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# 🚀 6. Final Instructions
Write-Host "`n=== Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Marketplace application is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Application URLs:" -ForegroundColor Cyan
Write-Host "   📱 Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   🔧 Backend API: http://localhost:4000" -ForegroundColor White
Write-Host "   📚 API Documentation: http://localhost:4000/api" -ForegroundColor White
Write-Host "   🎯 GraphQL Playground: http://localhost:4000/graphql" -ForegroundColor White

if ($UseDocker) {
    Write-Host ""
    Write-Host "🗄️  Database Management:" -ForegroundColor Cyan
    Write-Host "   🐘 pgAdmin: http://localhost:8080 (admin@inbola.com / admin123)" -ForegroundColor White
    Write-Host "   🔴 Redis Commander: http://localhost:8081 (admin / admin123)" -ForegroundColor White
}

Write-Host ""
Write-Host "⚠️  Important Notes:" -ForegroundColor Yellow
Write-Host "   • Services are running in separate PowerShell windows" -ForegroundColor White
Write-Host "   • Close those windows to stop the services" -ForegroundColor White
if ($UseDocker) {
    Write-Host "   • Stop databases: docker-compose down" -ForegroundColor White
}

Write-Host ""
Write-Host "🧪 Next Steps:" -ForegroundColor Cyan
Write-Host "   • Run API tests: .\test-api-windows.ps1" -ForegroundColor White
Write-Host "   • Open application in browser" -ForegroundColor White

# Ask if user wants to open browser
$openBrowser = Read-Host "`nWould you like to open the application in your browser? (y/N)"
if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
    Start-Process "http://localhost:3000"
}

Write-Host "`n✅ Setup completed successfully!" -ForegroundColor Green