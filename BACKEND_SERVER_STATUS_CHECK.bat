@echo off
title Backend Server Status Check and Fix
color 0B
echo.
echo ========================================
echo     🔍 Backend Server Status Check and Fix
echo ========================================
echo.
echo 🎯 Let's check if the backend server is running properly
echo.
echo 📊 Current Configuration:
echo    • Port: 5000
echo    • Environment: development
echo    • Database: PostgreSQL (petmat)
echo    • CORS: http://localhost:5173,http://localhost:3000
echo.
echo 🔍 Step 1: Check if server is running on port 5000
echo.
netstat -ano | findstr :5000
echo.
echo If you see nothing above, server is not running.
echo.
echo 🔍 Step 2: Start server manually and check for errors
echo.
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\server"
echo.
echo 🚀 Starting server with error logging...
node src/app.js
echo.
echo If server starts successfully, you should see:
echo    • "Server running on port 5000"
echo    • "Database connected successfully"
echo    • "CORS configured for origins"
echo.
echo 🔍 Step 3: Test API endpoints
echo.
echo 🌐 Testing health endpoint:
curl -X GET http://localhost:5000/api/health
echo.
echo 🌐 Testing auth endpoint:
curl -X POST http://localhost:5000/api/v1/auth/login
echo    -H "Content-Type: application/json"
echo    -d '{"email":"test@example.com","password":"password"}'
echo.
echo 🔍 Step 4: Check for common issues
echo.
echo 📋 Database Connection:
echo    • PostgreSQL running on port 5432?
echo    • Database "petmat" exists?
echo    • Connection string correct?
echo.
echo 📋 Dependencies:
echo    • All npm packages installed?
echo    • Prisma client generated?
echo.
echo 📋 Environment:
echo    • .env file exists?
echo    • PORT set to 5000?
echo    • CORS_ORIGINS includes frontend?
echo.
echo ========================================
echo     🎯 Manual Server Start
echo ========================================
echo.
echo If automatic start doesn't work, try these steps:
echo.
echo 1. Open Command Prompt as Administrator
echo 2. Navigate to server directory:
echo    cd "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\server"
echo.
echo 3. Install dependencies if needed:
echo    npm install
echo.
echo 4. Generate Prisma client:
echo    npm run prisma:generate
echo.
echo 5. Start server:
echo    npm run dev
echo.
echo 6. Look for these success messages:
echo    • Server running on port 5000
echo    • Database connected
echo    • CORS configured
echo.
echo ========================================
echo     🚀 Let's Start Server Now
echo ========================================
echo.
echo 🔧 Starting server with detailed logging...
echo.
echo Press any key to start server...
pause > nul
echo.
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\server"
echo.
echo 📊 Installing dependencies (if needed)...
npm install
echo.
echo 🗄️ Generating Prisma client...
npm run prisma:generate
echo.
echo 🚀 Starting server...
npm run dev
echo.
echo 🌐 Server should start now. Check for success messages!
echo.
echo 🎯 After server starts, test login in your application.
echo.
pause
