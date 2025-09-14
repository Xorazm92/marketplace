@echo off
echo 🚀 Starting Marketplace Application...

REM Check if Node.js is installed
node -v >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is available

REM Setup Backend
echo.
echo === Setting up Backend ===
cd backend-main
echo 📦 Installing backend dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

echo 🔧 Generating Prisma client...
call npm run db:generate
if errorlevel 1 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)

echo 🔨 Building backend...
call npm run build
if errorlevel 1 (
    echo ❌ Failed to build backend
    pause
    exit /b 1
)

echo 🚀 Starting backend server...
start "Backend Server" cmd /k "npm run start:dev"

REM Wait for backend to start
timeout /t 5 /nobreak >nul

cd ..

REM Setup Frontend
echo.
echo === Setting up Frontend ===
cd front-main
echo 📦 Installing frontend dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

echo 🔨 Building frontend...
call npm run build
if errorlevel 1 (
    echo ❌ Failed to build frontend
    pause
    exit /b 1
)

echo 🚀 Starting frontend server...
start "Frontend Server" cmd /k "npm run start"

cd ..

echo.
echo ✅ Deployment completed!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:4000
echo 📚 API Docs: http://localhost:4000/api
echo 🎯 GraphQL: http://localhost:4000/graphql
echo.
echo ⚠️  Both servers are running in separate windows.
echo    Close those windows to stop the servers.

REM Ask if user wants to open browser
set /p "openBrowser=Open application in browser? (y/N): "
if /i "%openBrowser%"=="y" (
    start http://localhost:3000
)

echo.
echo Press any key to exit...
pause >nul