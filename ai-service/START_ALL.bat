@echo off
REM ============================================
REM   Pet Matchmaking Website - Startup Script
REM ============================================
REM This script starts both Backend and Frontend

cls
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║     Pet Matchmaking - Complete Startup Script          ║
echo ║         (Backend + Frontend Together)                 ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Change to project directory
cd /d "%~dp0"

REM Check if node_modules exist
if not exist "node_modules" (
    echo ⏳ Installing dependencies...
    call npm install
    echo.
)

REM Check if server node_modules exist
if not exist "server\node_modules" (
    echo ⏳ Installing server dependencies...
    cd server
    call npm install
    cd ..
    echo.
)

REM Start Backend and Frontend
echo 🚀 Starting Backend Server...
echo 🚀 Starting Frontend Development Server...
echo 🚀 Starting AI Matching Service...
echo.
echo ════════════════════════════════════════════════════════
echo.
echo ✅ Backend will run on:  http://localhost:5000
echo ✅ Frontend will run on: http://localhost:5173 or 5175
echo.
echo Open http://localhost:5175 in your browser
echo.
echo Press Ctrl+C in each window to stop servers
echo.
echo ════════════════════════════════════════════════════════
echo.

REM Start Backend and Frontend in separate windows
start "Backend Server" cmd /k "cd server && npm start"
start "Frontend Server" cmd /k "npm run dev"
start "AI Service" cmd /k "cd ai-service && if not exist .venv (python -m venv .venv) && call .venv\\Scripts\\activate && pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port 8001"

echo ✨ Both servers started! Waiting...
timeout /t 3 /nobreak
