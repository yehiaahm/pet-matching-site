#!/usr/bin/env pwsh
# ============================================
#   Pet Matchmaking Website - Startup Script
# ============================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Pet Matchmaking - Complete Startup Script          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Change to script directory
Set-Location $PSScriptRoot

# Check if node_modules exist
if (-not (Test-Path "node_modules")) {
    Write-Host "⏳ Installing root dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Check if server node_modules exist
if (-not (Test-Path "server\node_modules")) {
    Write-Host "⏳ Installing server dependencies..." -ForegroundColor Yellow
    Push-Location server
    npm install
    Pop-Location
    Write-Host ""
}

Write-Host "🚀 Starting Backend Server..." -ForegroundColor Green
Write-Host "🚀 Starting Frontend Development Server..." -ForegroundColor Green
Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Backend will run on:  http://localhost:5000" -ForegroundColor Green
Write-Host "✅ Frontend will run on: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Open http://localhost:5173 in your browser" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow
Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\server'; npm start"

# Wait a bit for backend to start
Start-Sleep -Seconds 2

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev"

Write-Host "✨ Both servers started! Check the new terminal windows." -ForegroundColor Green
