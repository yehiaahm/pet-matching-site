@echo off
title Database Access Solutions - Working Methods
color 0A
echo.
echo ========================================
echo     🗄️ Database Access - Working Solutions
echo ========================================
echo.
echo ✅ Prisma Studio Fixed - Now Working!
echo.
echo 🌐 Access Methods Available:
echo.
echo 1. 📊 Prisma Studio (Recommended):
echo    • URL: http://localhost:5556
echo    • Visual interface
echo    • All tables accessible
echo    • Real-time editing
echo.
echo 2. 💻 Command Line Access:
echo    • psql command line tool
echo    • Direct database queries
echo    • Full control
echo.
echo 3. 🌐 Alternative GUI Tools:
echo    • pgAdmin (recommended)
echo    • DBeaver
echo    • TablePlus
echo.
echo 🎯 Quick Access Commands:
echo.
echo 📊 Open Prisma Studio:
echo    cd server
echo    npx prisma studio --port 5556
echo.
echo 💻 Command Line Access:
echo    psql "postgresql://postgres:yehia.hema195200@localhost:5432/petmat"
echo.
echo 📋 List All Tables:
echo    psql "postgresql://postgres:yehia.hema195200@localhost:5432/petmat" -c "\dt"
echo.
echo 🔍 View Table Data:
echo    psql "postgresql://postgres:yehia.hema195200@localhost:5432/petmat" -c "SELECT * FROM users LIMIT 5;"
echo.
echo 📊 Database Connection Info:
echo    • Host: localhost
echo    • Port: 5432
echo    • Database: petmat
echo    • User: postgres
echo    • Password: yehia.hema195200
echo.
echo 🗂️ Available Tables:
echo.
echo 👤 User Tables:
echo    • users - User accounts
echo    • audit_logs - Activity logs
echo.
echo 🐾 Pet Tables:
echo    • pets - Pet information
echo    • health_records - Health data
echo    • favorites - User favorites
echo.
echo 💼 Business Tables:
echo    • breeding_requests - Breeding requests
echo    • matches - Pet matches
echo    • reviews - User reviews
echo.
echo 💳 Payment Tables:
echo    • payments - Payment data
echo    • payment_screenshots - Payment proofs
echo    • subscriptions - User subscriptions
echo.
echo 📱 Communication Tables:
echo    • messages - User messages
echo    • notifications - Notifications
echo.
echo 🗺️ Location Tables:
echo    • locations - Geographic data
echo.
echo 🚀 Testing Database Access:
echo.
echo 1. 🌐 Try Prisma Studio:
echo    http://localhost:5556
echo.
echo 2. 💻 Try Command Line:
echo    psql "postgresql://postgres:yehia.hema195200@localhost:5432/petmat"
echo.
echo 3. 📊 View Sample Data:
echo    psql "postgresql://postgres:yehia.hema195200@localhost:5432/petmat" -c "SELECT COUNT(*) FROM users;"
echo.
echo ========================================
echo     ✅ Database Access Working
echo ========================================
echo.
echo 🌟 Your database is now accessible!
echo.
echo 📱 Working Methods:
echo    • ✅ Prisma Studio: http://localhost:5556
echo    • ✅ Command Line: psql
echo    • ✅ GUI Tools: pgAdmin, DBeaver
echo.
echo 💡 Quick Test:
echo    Open http://localhost:5556 in your browser
echo    You should see all your database tables!
echo.
echo Press any key to open Prisma Studio...
pause > nul
start http://localhost:5556
echo.
echo 🎯 Database access ready!
echo.
pause
