@echo off
title Quick Server Start - Fix Everything
color 0B
echo.
echo ========================================
echo     🚀 Quick Server Start - Fix Everything
echo ========================================
echo.
echo 🔧 Starting everything from scratch...
echo.
echo ========================================
echo     🛑 Step 1: Stop All Running Processes
echo ========================================
echo.
echo 🛑 Killing processes on port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    taskkill /f /pid %%a 2>nul
)
echo.
echo 🛑 Killing processes on port 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /f /pid %%a 2>nul
)
echo.
echo ✅ Processes killed
echo.
echo ========================================
echo     🗄️ Step 2: Fix Database
echo ========================================
echo.
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\pet-breeding-backend"
echo.
echo 🗄️ Reset database...
npx prisma migrate reset --force
echo.
echo 🌱 Seed database...
npx prisma db seed
echo.
echo ✅ Database fixed
echo.
echo ========================================
echo     🚀 Step 3: Start Backend Server
echo ========================================
echo.
echo 🚀 Starting backend server...
start cmd /k "npm run dev"
echo.
echo ⏳ Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul
echo.
echo ✅ Backend server starting
echo.
echo ========================================
echo     🌐 Step 4: Start Frontend Server
echo ========================================
echo.
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)"
echo.
echo 🌐 Starting frontend server...
start cmd /k "npm run dev"
echo.
echo ⏳ Waiting 5 seconds for frontend to start...
timeout /t 5 /nobreak > nul
echo.
echo ✅ Frontend server starting
echo.
echo ========================================
echo     🧪 Step 5: Test Everything
echo ========================================
echo.
echo 🧪 Testing backend...
curl -X GET http://localhost:5000/api/health 2>nul
if %errorlevel% equ 0 (
    echo ✅ Backend: WORKING
) else (
    echo ❌ Backend: NOT WORKING
)
echo.
echo 🧪 Testing frontend...
curl -X GET http://localhost:5173 2>nul
if %errorlevel% equ 0 (
    echo ✅ Frontend: WORKING
) else (
    echo ❌ Frontend: NOT WORKING
)
echo.
echo 🧪 Testing database...
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\pet-breeding-backend"
node test-db.js 2>nul
if %errorlevel% equ 0 (
    echo ✅ Database: WORKING
) else (
    echo ❌ Database: NOT WORKING
)
echo.
echo ========================================
echo     🎯 Links Ready
echo ========================================
echo.
echo 🌐 Frontend: http://localhost:5173
echo 🔗 Backend: http://localhost:5000
echo 🗄️ Prisma Studio: http://localhost:5555
echo.
echo 🔑 Login: yehiaahmed195200@gmail.com / yehia.hema195200
echo.
echo ========================================
echo     🎉 All Done!
echo ========================================
echo.
echo ✅ Everything should be working now!
echo.
echo 🎯 Try opening: http://localhost:5173
echo.
echo 🔐 Login with: yehiaahmed195200@gmail.com / yehia.hema195200
echo.
echo 🎉 Your Pet Breeding platform is ready! 🐾💕
echo.
pause
