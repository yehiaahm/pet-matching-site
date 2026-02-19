@echo off
echo ========================================
echo        PetMat AI System Launcher
echo ========================================
echo.

echo 🤖 Starting PetMat AI Control System...
echo.

echo 1. Checking dependencies...
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)"

echo 2. Installing required packages...
call npm install react-router-dom @types/react-router-dom

echo 3. Starting AI Dashboard...
echo.

echo 🚀 PetMat AI System is starting...
echo 📍 Access URL: http://localhost:5173/ai-dashboard
echo 🎯 Features: AI Diagnostics, Auto-Repair, Monitoring
echo.

start cmd /k "npm run dev"

echo.
echo ========================================
echo PetMat AI System is ready!
echo ========================================
echo.
echo 🤖 AI Features Available:
echo    • Automatic Issue Detection
echo    • Real-time System Monitoring  
echo    • Auto-Repair Capabilities
echo    • AI-Powered Diagnostics
echo    • Security Scanning
echo    • Performance Optimization
echo.
echo 🌐 Open your browser and go to:
echo    http://localhost:5173/ai-dashboard
echo.
pause
