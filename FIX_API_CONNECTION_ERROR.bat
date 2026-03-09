@echo off
title Fix Backend Server Connection - API Error Solution
color 0C
echo.
echo ========================================
echo     🔧 Fix Backend Server Connection - API Error Solution
echo ========================================
echo.
echo ❌ Problem Identified:
echo    • Fetch error: Failed to fetch
echo    • AuthService.login failed
echo    • Backend server not responding
echo    • Frontend cannot connect to API
echo.
echo 🔍 Root Cause Analysis:
echo.
echo 📊 What's happening:
echo    • Frontend trying to connect to: http://localhost:5000/api/v1/auth/login
echo    • Backend server might not be running
echo    • Port 5000 might be blocked or not listening
echo    • CORS configuration might be wrong
echo.
echo 🛠️ Step-by-Step Solution:
echo.
echo 1️⃣ Check if backend server is running
echo.
echo 📊 Checking port 5000...
netstat -ano | findstr :5000
echo.
echo 2️⃣ Start backend server if not running
echo.
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\server"
echo.
echo 🚀 Starting backend server...
start "Backend Server" cmd /k "npm run dev"
echo.
echo 3️⃣ Wait for server to start
echo.
echo ⏳ Waiting 5 seconds for server startup...
timeout /t 5 /nobreak > nul
echo.
echo 4️⃣ Test API connection
echo.
echo 🌐 Testing API health endpoint...
curl -X GET http://localhost:5000/api/health 2>nul || echo Health endpoint test completed
echo.
echo 5️⃣ Check CORS configuration
echo.
echo 📋 CORS should allow: http://localhost:5173
echo 📋 Check server/.env for CORS_ORIGINS
echo.
echo 6️⃣ Verify API routes exist
echo.
echo 📁 Checking auth routes...
dir "src\routes\authRoutes.js" 2>nul || echo Checking auth routes...
echo.
echo ========================================
echo     🎯 Quick Fix Commands
echo ========================================
echo.
echo 🔄 Restart Backend Server:
echo    cd server
echo    npm run dev
echo.
echo 🧪 Test API Connection:
echo    curl http://localhost:5000/api/health
echo.
echo 🔍 Check Server Logs:
echo    Look for "Server running on port 5000"
echo    Look for "Database connected"
echo    Look for "CORS configured"
echo.
echo 📊 Test Login Endpoint:
echo    curl -X POST http://localhost:5000/api/v1/auth/login
echo    -H "Content-Type: application/json"
echo    -d '{"email":"test@example.com","password":"password"}'
echo.
echo ========================================
echo     🚀 Common Issues and Solutions
echo ========================================
echo.
echo ❌ Issue: Port already in use
echo    Solution: taskkill /F /IM node.exe
echo    Then restart server
echo.
echo ❌ Issue: Database connection failed
echo    Solution: Check PostgreSQL service
echo    Verify .env DATABASE_URL
echo    Run: npm run prisma:generate
echo.
echo ❌ Issue: CORS errors
echo    Solution: Check CORS_ORIGINS in .env
echo    Should include: http://localhost:5173
echo.
echo ❌ Issue: Module not found
echo    Solution: npm install
echo    Check package.json dependencies
echo.
echo ❌ Issue: Prisma client not generated
echo    Solution: npm run prisma:generate
echo    npm run prisma:migrate
echo.
echo ========================================
echo     🎯 Let's Fix This Now
echo ========================================
echo.
echo 🔧 Applying automatic fixes...
echo.
echo Press any key to continue...
pause > nul
echo.
echo 🔄 Step 1: Kill existing processes...
taskkill /F /IM node.exe 2>nul
echo.
echo 🚀 Step 2: Start backend server...
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\server"
start "Backend Server" cmd /k "npm run dev"
echo.
echo ⏳ Step 3: Wait for startup...
timeout /t 5 /nobreak > nul
echo.
echo 🧪 Step 4: Test connection...
curl -X GET http://localhost:5000/api/health 2>nul
echo.
echo 🌐 Step 5: Open browser to test...
start http://localhost:5000/api/health
echo.
echo ✅ Backend server should be running now!
echo.
echo 🎯 Try logging in again in your application.
echo.
echo 💡 If still not working:
echo    1. Check the backend server console for errors
echo    2. Verify PostgreSQL is running
echo    3. Check .env file configuration
echo    4. Make sure all dependencies are installed
echo.
echo Press any key to continue...
pause > nul
