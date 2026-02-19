@echo off
title PetMat AI System - How to Access
color 0A
echo.
echo ========================================
echo     🤖 PetMat AI System - How to Access
echo ========================================
echo.
echo 📍 STEP 1: Start the Development Server
echo.
echo The development server should be running on port 5173
echo If not running, start it with:
echo    cd "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)"
echo    npm run dev
echo.
echo 📍 STEP 2: Access the AI Dashboard
echo.
echo Open your web browser and go to:
echo    http://localhost:5173/ai-dashboard
echo.
echo 📍 STEP 3: Alternative Access Methods
echo.
echo If the above doesn't work, try:
echo    http://localhost:5173/#/ai-dashboard
echo    http://127.0.0.1:5173/ai-dashboard
echo.
echo 📍 STEP 4: Check if Server is Running
echo.
echo To check if the server is running:
echo    1. Open Command Prompt
echo    2. Type: netstat -an | findstr :5173
echo    3. You should see something like: TCP 0.0.0.0:5173
echo.
echo 📍 STEP 5: Troubleshooting
echo.
echo If you can't access the AI dashboard:
echo.
echo 🔧 Problem: Server not running
echo    Solution: Run "npm run dev" in the project folder
echo.
echo 🔧 Problem: Port already in use
echo    Solution: Kill existing processes:
echo        taskkill /F /IM node.exe
echo        Then run "npm run dev" again
echo.
echo 🔧 Problem: Browser cache
echo    Solution: Clear browser cache or use incognito mode
echo.
echo 📍 STEP 6: Quick Start Commands
echo.
echo Open Command Prompt and run:
echo.
echo    cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)"
echo    npm run dev
echo.
echo Then open browser and go to:
echo    http://localhost:5173/ai-dashboard
echo.
echo ========================================
echo     🎯 PetMat AI Dashboard Features
echo ========================================
echo.
echo 🤖 AI Assistants: View and control AI helpers
echo 🔍 Issues: Monitor and fix system problems  
echo ⚡ Commands: Execute smart AI commands
echo ⚙️  Settings: Configure AI behavior
echo.
echo ========================================
echo.
echo Press any key to open the AI Dashboard in browser...
pause > nul
start http://localhost:5173/ai-dashboard
echo.
echo ✅ Attempting to open AI Dashboard...
echo If it doesn't open, manually go to: http://localhost:5173/ai-dashboard
echo.
pause
