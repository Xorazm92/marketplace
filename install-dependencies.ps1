# Direct installation script
Write-Host "Installing backend dependencies..." -ForegroundColor Green

# Set the backend directory
$backendPath = "C:\Users\rayad\Music\market\market\backend-main"
$frontendPath = "C:\Users\rayad\Music\market\market\front-main"

# Check if directories exist
if (-not (Test-Path $backendPath)) {
    Write-Host "Backend directory not found: $backendPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendPath)) {
    Write-Host "Frontend directory not found: $frontendPath" -ForegroundColor Red
    exit 1
}

# Install backend dependencies
Write-Host "Installing backend dependencies in: $backendPath" -ForegroundColor Cyan
Set-Location $backendPath
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}

# Install frontend dependencies
Write-Host "`nInstalling frontend dependencies in: $frontendPath" -ForegroundColor Cyan
Set-Location $frontendPath
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ All dependencies installed successfully!" -ForegroundColor Green
Write-Host "You can now start the servers manually or run the deployment script." -ForegroundColor White