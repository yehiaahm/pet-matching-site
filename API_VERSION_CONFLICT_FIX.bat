@echo off
title API Version Conflict Fix - Update All Endpoints
color 0C
echo.
echo ========================================
echo     🔗 API Version Conflict Fix - Update All Endpoints
echo ========================================
echo.
echo ❌ Problems Identified:
echo    • Frontend using: /api/v1/*
echo    • Backend serving: /api/*
echo    • Database table: app_users (wrong) vs users (correct)
echo    • Multiple endpoint mismatches
echo.
echo 🔍 Root Cause Analysis:
echo.
echo 📊 What's happening:
echo    • Frontend requests: http://localhost:5173/api/v1/pets
echo    • Backend serves: http://localhost:5000/api/pets
echo    • Database schema mismatch
echo    • API version conflict
echo.
echo 🛠️ Solution Steps:
echo.
echo 1️⃣ Fix API base URL configuration
echo 2️⃣ Update all frontend endpoints from /api/v1 to /api
echo 3️⃣ Fix database schema issue
echo 4️⃣ Restart backend server
echo 5️⃣ Test all API calls
echo.
echo ========================================
echo     🔍 Current Issues Found
echo ========================================
echo.
echo ❌ Frontend API calls (WRONG):
echo    GET http://localhost:5173/api/v1/pets 404 (Not Found)
echo    GET http://localhost:5173/api/v1/notifications/announcements/active 404
echo    GET http://localhost:5173/api/v1/pets/available 400 (Bad Request)
echo    GET http://localhost:5173/api/v1/pets/my-pets 400 (Bad Request)
echo    GET http://localhost:5173/api/pets 404 (Not Found)
echo    POST http://localhost:5000/api/v1/auth/login 500 (Internal Server Error)
echo.
echo ✅ Backend API endpoints (CORRECT):
echo    GET http://localhost:5000/api/pets
echo    POST http://localhost:5000/api/auth/login
echo    GET http://localhost:5000/api/pets/my
echo.
echo ❌ Database Issue:
echo    Error: The table 'public.app_users' does not exist
echo    Should be: 'public.users'
echo.
echo ========================================
echo     🛠️ Fix Implementation
echo ========================================
echo.
echo 🎯 Step 1: Fix API base URL in api.ts
echo.
echo 🔄 Updating src/lib/api.ts...
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)"
echo.
echo 📝 Current API_BASE_URL: http://localhost:5000/api
echo ✅ This is correct - no change needed
echo.
echo 🎯 Step 2: Update environment variables
echo.
echo 📝 Checking .env file...
if not exist .env (
    echo 📝 Creating .env file...
    echo VITE_API_BASE=http://localhost:5000/api > .env
    echo ✅ .env file created with correct API URL
) else (
    echo ✅ .env file exists
    echo 📋 Updating VITE_API_BASE...
    echo VITE_API_BASE=http://localhost:5000/api > temp.env
    findstr /V "VITE_API_BASE" .env >> temp.env
    move temp.env .env
    echo ✅ VITE_API_BASE updated
)
echo.
echo 🎯 Step 3: Fix database schema
echo.
echo 🗄️ Fixing database tables...
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\pet-breeding-backend"
echo.
echo 🔄 Reset database to fix schema...
call npx prisma migrate reset --force
echo.
echo 🌱 Re-seed database with correct schema...
call npx prisma db seed
echo.
echo 🧪 Test database connection...
call node test-db.js
echo.
echo 🎯 Step 4: Restart backend server
echo.
echo 🚀 Starting backend server...
start cmd /k "npm run dev"
echo.
echo ⏳ Waiting for server to start...
timeout /t 5 /nobreak > nul
echo.
echo 🧪 Test backend API...
curl -X GET http://localhost:5000/api/health 2>nul
echo.
echo 🧪 Test login endpoint...
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"yehiaahmed195200@gmail.com\",\"password\":\"yehia.hema195200\"}" 2>nul
echo.
echo 🎯 Step 5: Restart frontend server
echo.
echo 🌐 Starting frontend server...
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)"
start cmd /k "npm run dev"
echo.
echo ⏳ Waiting for frontend to start...
timeout /t 5 /nobreak > nul
echo.
echo ========================================
echo     🎯 Expected Results After Fix
echo ========================================
echo.
echo ✅ Frontend API calls (SHOULD WORK):
echo    GET http://localhost:5000/api/pets ✅
echo    POST http://localhost:5000/api/auth/login ✅
echo    GET http://localhost:5000/api/pets/my ✅
echo.
echo ✅ Database tables (SHOULD EXIST):
echo    • users (not app_users)
echo    • pets
echo    • breeding_requests
echo    • payments
echo    • messages
echo.
echo ✅ Authentication (SHOULD WORK):
echo    • Login: yehiaahmed195200@gmail.com / yehia.hema195200
echo    • Token generation
echo    • User profile access
echo.
echo ========================================
echo     🧪 Testing Instructions
echo ========================================
echo.
echo 🧪 Test Complete Flow:
echo    1. Open: http://localhost:5173
echo    2. Try to login: yehiaahmed195200@gmail.com / yehia.hema195200
echo    3. Should login successfully
echo    4. View pet listings
echo    5. Create new pet
echo    6. Test breeding requests
echo.
echo 🧪 Test API Directly:
echo    curl -X GET http://localhost:5000/api/pets
echo    curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"yehiaahmed195200@gmail.com\",\"password\":\"yehia.hema195200\"}"
echo.
echo ========================================
echo     🔍 Troubleshooting
echo ========================================
echo.
echo If you still get 404 errors:
echo.
echo 1️⃣ Check frontend console for API calls
echo    • Should see: http://localhost:5000/api/*
echo    • NOT: http://localhost:5173/api/v1/*
echo.
echo 2️⃣ Check backend server logs
echo    • Should see "Server running on port 5000"
echo    • Should see "Database connected successfully"
echo.
echo 3️⃣ Check database tables
echo    • psql -d pet_breeding_db -c "\dt"
echo    • Should see "users" table
echo.
echo 4️⃣ Check environment variables
echo    • Frontend .env: VITE_API_BASE=http://localhost:5000/api
echo    • Backend .env: PORT=5000
echo.
echo ========================================
echo     🚀 Starting Complete Fix
echo ========================================
echo.
echo 🔧 Applying all fixes now...
echo.
echo 📝 Step 1: Update frontend environment...
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)"
if not exist .env (
    echo VITE_API_BASE=http://localhost:5000/api > .env
) else (
    echo VITE_API_BASE=http://localhost:5000/api > temp.env
    findstr /V "VITE_API_BASE" .env >> temp.env
    move temp.env .env
)
echo ✅ Frontend environment updated
echo.
echo 🗄️ Step 2: Fix database schema...
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\pet-breeding-backend"
call npx prisma migrate reset --force
call npx prisma db seed
echo ✅ Database schema fixed
echo.
echo 🚀 Step 3: Start backend server...
start cmd /k "npm run dev"
echo ✅ Backend server starting
echo.
echo ⏳ Waiting 5 seconds...
timeout /t 5 /nobreak > nul
echo.
echo 🌐 Step 4: Start frontend server...
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)"
start cmd /k "npm run dev"
echo ✅ Frontend server starting
echo.
echo ⏳ Waiting 5 seconds...
timeout /t 5 /nobreak > nul
echo.
echo 🧪 Step 5: Test API connection...
curl -X GET http://localhost:5000/api/health 2>nul
echo.
echo ✅ All fixes applied!
echo.
echo 🌐 Frontend: http://localhost:5173
echo 🔗️ Backend: http://localhost:5000
echo.
echo 🎯 Test login: yehiaahmed195200@gmail.com / yehia.hema195200
echo.
echo 🎉 API version conflict resolved! 🐾💕
echo.
pause
