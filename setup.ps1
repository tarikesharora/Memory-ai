# LensLocal - Setup Script for Windows PowerShell
# Verifies Python 3.10+, sets up virtual environment, installs PyTorch/Transformers, safetensors, and npm dependencies

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   LensLocal - AI Photo & File Search" -ForegroundColor Cyan
Write-Host "   Environment Setup & Dependency Check" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Check Python
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    $pythonCmd = Get-Command py -ErrorAction SilentlyContinue
}

if (-not $pythonCmd) {
    Write-Error "Python 3.10+ was not found on PATH. Please install Python from https://www.python.org/downloads/ and check 'Add Python to PATH'."
    exit 1
}

$pyVer = & $pythonCmd.Source -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"
Write-Host "[OK] Detected Python version: $pyVer" -ForegroundColor Green

# 2. Check Node.js
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
    Write-Error "Node.js (v18+) is required for the React interface. Download from https://nodejs.org/"
    exit 1
}
$nodeVer = & $nodeCmd.Source -v
Write-Host "[OK] Detected Node.js version: $nodeVer" -ForegroundColor Green

# 3. Create or activate Python virtual environment
$venvDir = Join-Path $PSScriptRoot ".venv"
if (-not (Test-Path $venvDir)) {
    Write-Host "[..] Creating Python virtual environment in .venv..." -ForegroundColor Yellow
    & $pythonCmd.Source -m venv $venvDir
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to create virtual environment."
        exit 1
    }
}
Write-Host "[OK] Virtual environment ready at .venv" -ForegroundColor Green

$venvPip = Join-Path $venvDir "Scripts\pip.exe"
if (-not (Test-Path $venvPip)) {
    $venvPip = Join-Path $venvDir "bin/pip"
}

Write-Host "[..] Upgrading pip and installing Python requirements..." -ForegroundColor Yellow
& $venvPip install --upgrade pip
& $venvPip install -r (Join-Path $PSScriptRoot "requirements.txt")
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed installing Python dependencies. Check error output above."
    exit 1
}
Write-Host "[OK] Python dependencies installed successfully." -ForegroundColor Green

# 4. Install Node / npm frontend dependencies
Write-Host "[..] Installing Node.js frontend dependencies..." -ForegroundColor Yellow
Set-Location $PSScriptRoot
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "npm install failed."
    exit 1
}
Write-Host "[OK] Frontend packages installed." -ForegroundColor Green

Write-Host "==========================================" -ForegroundColor Green
Write-Host " Setup complete! Run .\run.ps1 to launch." -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
