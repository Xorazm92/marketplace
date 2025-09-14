@echo off
echo Starting Marketplace Application...
echo.

REM Check if we're in the right directory
if not exist "backend-main" (
    echo Error: Please run this script from the marketplace root directory
    pause
    exit /b 1
)

echo === Installing Backend Dependencies ===
cd backend-main
call npm install
if errorlevel 1 (
    echo Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo === Building Backend ===
call npm run build
if errorlevel 1 (
    echo Backend build failed, but continuing with dev mode...
)

echo.
echo === Starting Backend Server ===
start "Backend Server" cmd /k "npm run start:dev"
echo Backend starting on http://localhost:4000

timeout /t 5 /nobreak >nul

cd ..

echo.
echo === Installing Frontend Dependencies ===
cd front-main
call npm install
if errorlevel 1 (
    echo Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo === Building Frontend ===
call npm run build
if errorlevel 1 (
    echo Frontend build failed, but continuing with dev mode...
)

echo.
echo === Starting Frontend Server ===
start "Frontend Server" cmd /k "npm run dev"
echo Frontend starting on http://localhost:3000

cd ..

echo.
echo ====================================
echo   MARKETPLACE APPLICATION STARTED
echo ====================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:4000
echo API Docs: http://localhost:4000/api
echo GraphQL:  http://localhost:4000/graphql
echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.

REM Wait a bit then test the connections
echo Waiting for servers to start...
timeout /t 10 /nobreak >nul

echo Testing connections...
curl -s http://localhost:4000/health >nul 2>&1 && echo Backend: OK || echo Backend: Starting...
curl -s http://localhost:3000 >nul 2>&1 && echo Frontend: OK || echo Frontend: Starting...

echo.
set /p "openBrowser=Open in browser? (y/N): "
if /i "%openBrowser%"=="y" start http://localhost:3000

echo.
echo Press any key to exit...
pause >nul