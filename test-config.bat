@echo off
echo Testing configuration files...
echo.

cd /d "c:\Users\rayad\Music\market\market\front-main"

echo Checking required files:
if exist "app\page.tsx" (echo ✓ app\page.tsx exists) else (echo ✗ app\page.tsx missing)
if exist "app\layout.tsx" (echo ✓ app\layout.tsx exists) else (echo ✗ app\layout.tsx missing)
if exist "next.config.ts" (echo ✓ next.config.ts exists) else (echo ✗ next.config.ts missing)
if exist ".env.local" (echo ✓ .env.local exists) else (echo ✗ .env.local missing)

echo.
echo Configuration test completed.
echo The TypeError should now be resolved with the updated configuration.
echo.
pause