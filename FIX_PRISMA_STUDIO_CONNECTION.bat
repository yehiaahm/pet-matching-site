@echo off
title Fix Prisma Studio Connection Issues
color 0C
echo.
echo ========================================
echo     🔧 Fixing Prisma Studio Connection Issues
echo ========================================
echo.
echo ❌ Problem: Prisma Studio shows "Connection Refused"
echo.
echo 🔍 Possible Causes:
echo    • Prisma Studio process not starting properly
echo    • Port conflicts
echo    • Database connection issues
echo    • Browser blocking localhost
echo.
echo 🛠️ Let's Fix This Step by Step:
echo.
echo 1️⃣ Test Database Connection First
echo.
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\server"
echo.
echo 📊 Testing database connection...
node test-connection.js
echo.
echo 2️⃣ Kill All Prisma Processes
echo.
echo 🔄 Stopping all Prisma Studio processes...
taskkill /F /IM prisma.exe 2>nul
taskkill /F /IM node.exe 2>nul
echo.
echo 3️⃣ Start Prisma Studio Manually
echo.
echo 🌐 Starting Prisma Studio on port 5556...
start "Prisma Studio" cmd /k "cd /d 'd:\PetMat_Project\Pet Breeding Matchmaking Website (3)\server' && npx prisma studio --port 5556"
echo.
echo 4️⃣ Wait and Open Browser
echo.
echo ⏳ Waiting for Prisma Studio to start...
timeout /t 5 /nobreak > nul
echo.
echo 🌐 Opening browser...
start http://localhost:5556
echo.
echo 5️⃣ Alternative Access Methods
echo.
echo 💻 If Prisma Studio still doesn't work, use command line:
echo    psql -U postgres -d petmat
echo.
echo 📊 List tables: \dt
echo 📋 View data: SELECT * FROM users LIMIT 5;
echo 🚪 Exit: \q
echo.
echo 🌐 Alternative GUI Tools:
echo    • pgAdmin (installed with PostgreSQL)
echo    • DBeaver (free database tool)
echo    • TablePlus (modern database GUI)
echo.
echo ========================================
echo     🎯 Quick Solutions
echo ========================================
echo.
echo 🎯 Solution 1: Use pgAdmin (Already Installed)
echo    1. Open pgAdmin 4
echo    2. Connect to PostgreSQL server
echo    3. Browse your petmat database
echo.
echo 🎯 Solution 2: Use Command Line (Most Reliable)
echo    1. Open Command Prompt
echo    2. Run: psql -U postgres -d petmat
echo    3. Use \dt to see tables
echo.
echo 🎯 Solution 3: Try Different Prisma Studio Port
echo    1. Kill existing processes
echo    2. Run: npx prisma studio --port 5557
echo    3. Open: http://localhost:5557
echo.
echo 🎯 Solution 4: Check Windows Firewall
echo    1. Windows Defender Security Center
echo    2. Firewall & network protection
echo    3. Allow an app through firewall
echo    4. Add Node.js and PostgreSQL
echo.
echo ========================================
echo     🚀 Let's Try the Fix Now
echo ========================================
echo.
echo 🔧 Applying fixes...
echo.
echo Press any key to continue...
pause > nul
echo.
echo 📊 Step 1: Testing database connection...
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\server"
node test-connection.js
echo.
echo 🔄 Step 2: Killing processes...
taskkill /F /IM prisma.exe 2>nul
taskkill /F /IM node.exe 2>nul
echo.
echo 🌐 Step 3: Starting Prisma Studio...
start "Prisma Studio" cmd /k "cd /d 'd:\PetMat_Project\Pet Breeding Matchmaking Website (3)\server' && npx prisma studio --port 5556"
echo.
echo ⏳ Step 4: Waiting for startup...
timeout /t 5 /nobreak > nul
echo.
echo 🌐 Step 5: Opening browser...
start http://localhost:5556
echo.
echo ✅ Fix attempt completed!
echo.
echo 🎯 Try accessing: http://localhost:5556
echo.
echo 💡 If still not working:
echo    1. Use pgAdmin for visual access
echo    2. Use command line: psql -U postgres -d petmat
echo    3. Your database is working, only Prisma Studio has issues
echo.
echo Press any key to open pgAdmin alternative...
pause > nul
echo.
echo 🌐 Opening pgAdmin...
start pgAdmin4
echo.
echo 🎯 pgAdmin should provide reliable database access!
echo.
pause
