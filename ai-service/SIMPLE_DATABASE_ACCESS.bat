@echo off
title Simple Database Access - Direct Methods
color 0A
echo.
echo ========================================
echo     🗄️ Simple Database Access - Direct Methods
echo ========================================
echo.
echo 🎯 Let's access your database directly!
echo.
echo 📊 Method 1: Command Line (Most Reliable)
echo.
echo 💻 Open Command Prompt and run:
echo    psql "postgresql://postgres:yehia.hema195200@localhost:5432/petmat"
echo.
echo 📋 Once connected, you can:
echo    • \dt - List all tables
echo    • \q - Quit
echo    • SELECT * FROM users; - View users
echo    • SELECT * FROM pets; - View pets
echo.
echo 🌐 Method 2: Web Browser Direct Access
echo.
echo 📱 Try these URLs one by one:
echo    • http://localhost:5555
echo    • http://localhost:5556
echo    • http://localhost:5557
echo.
echo 🔍 Method 3: Check if PostgreSQL is Running
echo.
echo 📊 Run this command:
echo    netstat -an | findstr :5432
echo.
echo If you see nothing, PostgreSQL is not running.
echo.
echo 🎯 Method 4: Install pgAdmin (Visual Tool)
echo.
echo 📥 Download and install pgAdmin from:
echo    https://www.pgadmin.org/download/
echo.
echo 📋 Connection details for pgAdmin:
echo    • Host: localhost
echo    • Port: 5432
echo    • Database: petmat
echo    • Username: postgres
echo    • Password: yehia.hema195200
echo.
echo ========================================
echo     🚀 Quick Start Commands
echo ========================================
echo.
echo 🧪 Test Database Connection:
echo    cd server
echo    node test-db.js
echo.
echo 📊 List Tables:
echo    psql "postgresql://postgres:yehia.hema195200@localhost:5432/petmat" -c "\dt"
echo.
echo 👥 View Users:
echo    psql "postgresql://postgres:yehia.hema195200@localhost:5432/petmat" -c "SELECT * FROM users LIMIT 5;"
echo.
echo 🐾 View Pets:
echo    psql "postgresql://postgres:yehia.hema195200@localhost:5432/petmat" -c "SELECT * FROM pets LIMIT 5;"
echo.
echo 💳 View Payments:
echo    psql "postgresql://postgres:yehia.hema195200@localhost:5432/petmat" -c "SELECT * FROM payments LIMIT 5;"
echo.
echo ========================================
echo     💡 What to Do Now
echo ========================================
echo.
echo 🎯 Step 1: Test with command line first
echo    Open Command Prompt
echo    Run: psql "postgresql://postgres:yehia.hema195200@localhost:5432/petmat"
echo.
echo 🎯 Step 2: If that works, try the browser URLs
echo    http://localhost:5555
echo    http://localhost:5556
echo    http://localhost:5557
echo.
echo 🎯 Step 3: If nothing works, install pgAdmin
echo    Download from: https://www.pgadmin.org/download/
echo.
echo 🎯 Step 4: Check PostgreSQL service
echo    Make sure PostgreSQL is running on port 5432
echo.
echo 💡 Important:
echo    • Command line access is most reliable
echo    • If psql works, database is fine
echo    • Prisma Studio issues are just UI problems
echo    • You can still access all data via command line
echo.
echo Press any key to open command line with database connection...
pause > nul
echo.
echo 🗄️ Opening database connection...
start cmd /k "cd /d 'd:\PetMat_Project\Pet Breeding Matchmaking Website (3)\server' && psql 'postgresql://postgres:yehia.hema195200@localhost:5432/petmat'"
echo.
echo 🌐 Opening browser URLs...
start http://localhost:5555
start http://localhost:5556
start http://localhost:5557
echo.
echo ✅ Database access methods launched!
echo.
echo 📱 Try the command line window first - it's most reliable!
echo.
pause
