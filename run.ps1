# LensLocal - Windows Launch Script
# Starts the backend indexing engine and UI preview on localhost

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Starting LensLocal AI Search Engine" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$venvDir = Join-Path $PSScriptRoot ".venv"
$venvPython = Join-Path $venvDir "Scripts\python.exe"
if (-not (Test-Path $venvPython)) {
    $venvPython = Join-Path $venvDir "bin/python"
}

if (-not (Test-Path $venvPython)) {
    Write-Host "[!] Virtual environment not found. Running .\setup.ps1 first..." -ForegroundColor Yellow
    & (Join-Path $PSScriptRoot "setup.ps1")
}

Write-Host "[..] Launching LensLocal application on http://localhost:3000..." -ForegroundColor Green
Set-Location $PSScriptRoot
npm run dev
