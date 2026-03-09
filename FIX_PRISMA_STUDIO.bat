@echo off
title Fix Prisma Studio - Database Access Solution
color 0C
echo.
echo ========================================
echo     🔧 Fixing Prisma Studio Access
echo ========================================
echo.
echo ❌ Problem: Prisma Studio not opening properly
echo.
echo 🔍 Possible Causes:
echo    • Port 5555 might be in use
echo    • Browser not opening automatically
echo    • Database connection issues
echo    • Prisma Studio process not starting
echo.
echo 🛠️ Solutions to Try:
echo.
echo 1. 🔄 Check if port is in use:
echo    netstat -ano | findstr :5555
echo.
echo 2. 🌐 Manually open Prisma Studio:
echo    npx prisma studio --port 5556
echo.
echo 3. 🔍 Check database connection:
echo    npx prisma db pull
echo.
echo 4. 📊 Alternative access methods:
echo    • Use pgAdmin for PostgreSQL
echo    • Use DBeaver database tool
echo    • Use command line psql
echo.
echo 🎯 Quick Fix Steps:
echo.
echo Step 1: Kill any existing Prisma Studio processes
echo    taskkill /F /IM prisma.exe
echo.
echo Step 2: Try different port
echo    npx prisma studio --port 5556
echo.
echo Step 3: Open manually in browser
echo    http://localhost:5556
echo.
echo Step 4: If still not working, try database CLI
echo    psql "postgresql://postgres:yehia.hema195200@localhost:5432/petmat"
echo.
echo 📋 Alternative Database Access Methods:
echo.
echo 🔧 Command Line Access:
echo    psql "postgresql://postgres:yehia.hema195200@localhost:5432/petmat"
echo.
echo 🌐 GUI Tools:
echo    • pgAdmin (free PostgreSQL tool)
echo    • DBeaver (universal database tool)
echo    • TablePlus (modern database GUI)
echo.
echo 📊 Web-based Tools:
echo    • Adminer (web-based database admin)
echo    • phpMyAdmin (if PHP is available)
echo.
echo 🚀 Let's try these fixes now...
echo.
echo Press any key to attempt fixes...
pause > nul
echo.
echo 🔍 Step 1: Checking for existing processes...
taskkill /F /IM prisma.exe 2>nul
echo.
echo 🔍 Step 2: Trying Prisma Studio on different port...
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\server"
npx prisma studio --port 5556 --browser none
echo.
echo 🌐 Step 3: Opening browser manually...
start http://localhost:5556
echo.
echo 📊 Step 4: Testing database connection...
npx prisma db pull --schema prisma/schema.prisma
echo.
echo ✅ Fix attempts completed!
echo.
echo 🎯 Try accessing:
echo    • http://localhost:5555 (original)
echo    • http://localhost:5556 (alternative)
echo.
echo 💡 If still not working:
echo    1. Install pgAdmin from: https://www.pgadmin.org/
echo    2. Connect with: postgres:yehia.hema195200@localhost:5432/petmat
echo    3. Database name: petmat
echo.
echo Press any key to continue...
pause > nul
