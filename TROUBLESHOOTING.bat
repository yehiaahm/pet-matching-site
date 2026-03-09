@echo off
title Troubleshooting - What's Not Working?
color 0C
echo.
echo ========================================
echo     🔧 Troubleshooting - What's Not Working?
echo ========================================
echo.
echo ❌ Something is not working - Let's diagnose the issue
echo.
echo ========================================
echo     🔍 Step 1: Check What's Running
echo ========================================
echo.
echo 🚀 Checking Backend Server...
curl -X GET http://localhost:5000/api/health 2>nul
if %errorlevel% equ 0 (
    echo ✅ Backend Server: RUNNING (http://localhost:5000)
) else (
    echo ❌ Backend Server: NOT RUNNING
    echo    • Try: cd pet-breeding-backend && npm run dev
)
echo.
echo 🌐 Checking Frontend Server...
curl -X GET http://localhost:5173 2>nul
if %errorlevel% equ 0 (
    echo ✅ Frontend Server: RUNNING (http://localhost:5173)
) else (
    echo ❌ Frontend Server: NOT RUNNING
    echo    • Try: npm run dev
)
echo.
echo 🗄️ Checking Database Connection...
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\pet-breeding-backend"
node test-db.js 2>nul
if %errorlevel% equ 0 (
    echo ✅ Database: CONNECTED
) else (
    echo ❌ Database: NOT CONNECTED
    echo    • Check PostgreSQL is running
    echo    • Check DATABASE_URL in .env
)
echo.
echo ========================================
echo     🔍 Step 2: Common Issues & Solutions
echo ========================================
echo.
echo 🚨 Issue 1: Backend Server Not Running
echo    Solution:
echo    cd "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\pet-breeding-backend"
echo    npm run dev
echo.
echo 🚨 Issue 2: Frontend Server Not Running
echo    Solution:
echo    cd "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)"
echo    npm run dev
echo.
echo 🚨 Issue 3: Database Connection Failed
echo    Solution:
echo    • Check PostgreSQL service is running
echo    • Verify DATABASE_URL in .env files
echo    • Create database: createdb pet_breeding_db
echo.
echo 🚨 Issue 4: Port Already in Use
echo    Solution:
echo    • Kill process on port 5000: taskkill /PID [PID] /F
echo    • Kill process on port 5173: taskkill /PID [PID] /F
echo    • Or use different ports
echo.
echo 🚨 Issue 5: Environment Variables Missing
echo    Solution:
echo    • Check .env files exist
echo    • Verify DATABASE_URL is correct
echo    • Check VITE_API_BASE in frontend .env
echo.
echo ========================================
echo     🔍 Step 3: Manual Testing
echo ========================================
echo.
echo 🧪 Test Backend API:
echo    curl -X GET http://localhost:5000/api/health
echo.
echo 🧪 Test Frontend:
echo    Open browser: http://localhost:5173
echo.
echo 🧪 Test Database:
echo    cd pet-breeding-backend
echo    node test-db.js
echo.
echo 🧪 Test Prisma:
echo    npx prisma studio
echo.
echo ========================================
echo     🔍 Step 4: Port Check
echo ========================================
echo.
echo 🔍 Checking what's running on ports...
echo.
echo Port 5000 (Backend):
netstat -an | findstr :5000
echo.
echo Port 5173 (Frontend):
netstat -an | findstr :5173
echo.
echo Port 5432 (PostgreSQL):
netstat -an | findstr :5432
echo.
echo ========================================
echo     🔍 Step 5: Log Files Check
echo ========================================
echo.
echo 📝 Check Backend Logs:
echo    • Look at the terminal where npm run dev is running
echo    • Check for error messages
echo    • Look for "Server running on port 5000"
echo.
echo 📝 Check Frontend Logs:
echo    • Open browser console (F12)
echo    • Look for network errors
echo    • Check for 404/500 errors
echo.
echo 📝 Check Database Logs:
echo    • PostgreSQL logs in data directory
echo    • Check for connection errors
echo.
echo ========================================
echo     🛠️ Quick Fix Commands
echo ========================================
echo.
echo 🔄 Reset Everything:
echo    1. Stop all servers (Ctrl+C in terminals)
echo    2. Kill processes on ports 5000 and 5173
echo    3. Start backend: cd pet-breeding-backend && npm run dev
echo    4. Start frontend: npm run dev
echo.
echo 🗄️ Reset Database:
echo    cd pet-breeding-backend
echo    npx prisma migrate reset --force
echo    npx prisma db seed
echo.
echo 🔄 Clear Cache:
echo    npm cache clean --force
echo    Delete node_modules and reinstall
echo.
echo ========================================
echo     🎯 Tell Me More
echo ========================================
echo.
echo Please tell me specifically what's not working:
echo.
echo 🔍 Is it:
echo    • Backend server not starting?
echo    • Frontend server not starting?
echo    • Database connection error?
echo    • Login not working?
echo    • API calls failing?
echo    • Something else?
echo.
echo 📝 Please describe:
echo    • What error message do you see?
echo    • What step are you trying to do?
echo    • What happens when you try?
echo.
echo This will help me give you the exact solution!
echo.
pause
