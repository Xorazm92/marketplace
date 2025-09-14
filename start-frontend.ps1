# Start Frontend Development Server
Write-Host "Starting Frontend Development Server..." -ForegroundColor Green

Set-Location "c:\Users\rayad\Music\market\market\front-main"

# Check if node_modules exists, install if not
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the development server
Write-Host "Starting Next.js development server..." -ForegroundColor Green
npm run dev