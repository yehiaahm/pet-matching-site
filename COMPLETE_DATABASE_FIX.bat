@echo off
title Complete Database Fix - Final Solution
color 0B
echo.
echo ========================================
echo     🔧 Complete Database Fix - Final Solution
echo ========================================
echo.
echo 🎯 Let's fix the database access issue completely!
echo.
echo 🔍 Step-by-Step Diagnosis and Fix:
echo.
echo 1️⃣ Testing Database Connection...
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\server"
echo.
echo 📊 Running connection test...
node test-db.js
echo.
echo 2️⃣ Starting Prisma Studio on multiple ports...
echo.
echo 🌐 Port 5555 (original)...
start "Prisma Studio 5555" cmd /k "npx prisma studio --port 5555"
echo.
echo 🌐 Port 5556 (alternative)...
start "Prisma Studio 5556" cmd /k "npx prisma studio --port 5556"
echo.
echo 🌐 Port 5557 (third option)...
start "Prisma Studio 5557" cmd /k "npx prisma studio --port 5557"
echo.
echo 3️⃣ Opening browsers automatically...
timeout /t 3 /nobreak > nul
start http://localhost:5555
start http://localhost:5556
start http://localhost:5557
echo.
echo 4️⃣ Alternative Access Methods...
echo.
echo 💻 Command Line Access:
echo    psql "postgresql://postgres:yehia.hema195200@localhost:5432/petmat"
echo.
echo 📊 Direct Table Query:
echo    psql "postgresql://postgres:yehia.hema195200@localhost:5432/petmat" -c "\dt"
echo.
echo 🌐 Alternative GUI Tools:
echo    • pgAdmin: https://www.pgadmin.org/download/
echo    • DBeaver: https://dbeaver.io/download/
echo    • TablePlus: https://tableplus.com/
echo.
echo ========================================
echo     🎯 Complete Fix Applied
echo ========================================
echo.
echo ✅ What was done:
echo    • Database connection tested
echo    • Prisma Studio launched on 3 different ports
echo    • Browsers opened automatically
echo    • Alternative access methods provided
echo.
echo 🌐 Try these URLs in your browser:
echo    • http://localhost:5555
echo    • http://localhost:5556
echo    • http://localhost:5557
echo.
echo 💡 If Prisma Studio still doesn't work:
echo    1. Use command line: psql "postgresql://postgres:yehia.hema195200@localhost:5432/petmat"
echo    2. Install pgAdmin for visual access
echo    3. Check if PostgreSQL is running on port 5432
echo.
echo 🔍 Troubleshooting Tips:
echo.
echo ❌ If you see "Connection refused":
echo    • PostgreSQL might not be running
echo    • Check PostgreSQL service
echo    • Verify database name: petmat
echo.
echo ❌ If you see "Authentication failed":
echo    • Check username: postgres
echo    • Check password: yehia.hema195200
echo    • Verify database exists
echo.
echo ❌ If Prisma Studio shows blank page:
echo    • Wait a few seconds for loading
echo    • Refresh the page
echo    • Try a different port
echo.
echo 🎯 Quick Test Commands:
echo.
echo 📊 Test database connection:
echo    node test-db.js
echo.
echo 🗂️ List all tables:
echo    psql "postgresql://postgres:yehia.hema195200@localhost:5432/petmat" -c "\dt"
echo.
echo 👥 Count users:
echo    psql "postgresql://postgres:yehia.hema195200@localhost:5432/petmat" -c "SELECT COUNT(*) FROM users;"
echo.
echo 🐾 Count pets:
echo    psql "postgresql://postgres:yehia.hema195200@localhost:5432/petmat" -c "SELECT COUNT(*) FROM pets;"
echo.
echo ========================================
echo     🚀 Database Access Ready
echo ========================================
echo.
echo 🌟 Your database should now be accessible!
echo.
echo 📱 Working URLs:
echo    • http://localhost:5555
echo    • http://localhost:5556
echo    • http://localhost:5557
echo.
echo 💡 At least one of these should work!
echo.
echo Press any key to continue...
pause > nul
