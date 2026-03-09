@echo off
title PostgreSQL Installation Required - Solution Guide
color 0C
echo.
echo ========================================
echo     🚨 PostgreSQL Not Found - Solution Required
echo ========================================
echo.
echo ❌ Problem Identified:
echo    • PostgreSQL is not installed on your system
echo    • psql command not found
echo    • Port 5432 is not listening
echo    • Database connection cannot be established
echo.
echo 🔍 What this means:
echo    • Your database schema exists but PostgreSQL server is missing
echo    • Prisma Studio cannot connect because there's no database server
echo    • Your application cannot store or retrieve data
echo.
echo 🛠️ Solution: Install PostgreSQL
echo.
echo 📥 Option 1: PostgreSQL Official Installer (Recommended)
echo    • Download: https://www.postgresql.org/download/windows/
echo    • Choose version 15 or 16
echo    • During installation, set password: yehia.hema195200
echo    • Keep default port: 5432
echo    • Install pgAdmin 4 (included)
echo.
echo 📥 Option 2: PostgreSQL via Chocolatey
echo    • Install Chocolatey first
echo    • Run: choco install postgresql
echo    • Set password during installation
echo.
echo 📥 Option 3: PostgreSQL via Docker
echo    • Install Docker Desktop
echo    • Run: docker run --name postgres-db -e POSTGRES_PASSWORD=yehia.hema195200 -p 5432:5432 -d postgres:15
echo.
echo 📥 Option 4: Cloud PostgreSQL (Easiest)
echo    • ElephantSQL: https://www.elephantsql.com/
echo    • Supabase: https://supabase.com/
echo    • Railway: https://railway.app/
echo    • Get connection string and update .env file
echo.
echo ========================================
echo     🎯 Step-by-Step Installation Guide
echo ========================================
echo.
echo 📋 Step 1: Download PostgreSQL
echo    Go to: https://www.postgresql.org/download/windows/
echo    Click "Download the installer"
echo    Choose Windows x86-64
echo.
echo 📋 Step 2: Run Installer
echo    • Accept default settings
echo    • Set password: yehia.hema195200
echo    • Keep port: 5432
echo    • Install pgAdmin 4 (check the box)
echo.
echo 📋 Step 3: Verify Installation
echo    • Open Command Prompt
echo    • Run: psql --version
echo    • Should show PostgreSQL version
echo.
echo 📋 Step 4: Create Database
echo    • Open pgAdmin 4
echo    • Connect to PostgreSQL server
echo    • Create database named "petmat"
echo.
echo 📋 Step 5: Test Connection
echo    • Run: psql -U postgres -d petmat
echo    • Should connect successfully
echo.
echo 📋 Step 6: Run Prisma Commands
echo    cd server
echo    npm run prisma:generate
echo    npm run prisma:migrate
echo    npm run prisma:studio
echo.
echo ========================================
echo     🚀 Quick Alternative: Cloud Database
echo ========================================
echo.
echo 🌐 If you don't want to install PostgreSQL locally:
echo.
echo 1. 📱 Sign up for ElephantSQL (Free):
echo    • https://www.elephantsql.com/
echo    • Create new instance
echo    • Get connection string
echo.
echo 2. 📝 Update your .env file:
echo    DATABASE_URL="your-elephantsql-connection-string"
echo.
echo 3. 🔄 Update Prisma schema:
echo    Change provider from "postgresql" to "postgresql"
echo    (same, but use cloud connection)
echo.
echo 4. 🚀 Run migrations:
echo    npm run prisma:migrate
echo.
echo ========================================
echo     🎯 What to Do Now
echo ========================================
echo.
echo 🎯 Option A: Install PostgreSQL (Recommended for development)
echo    1. Download from: https://www.postgresql.org/download/windows/
echo    2. Install with password: yehia.hema195200
echo    3. Create database: petmat
echo    4. Run Prisma migrations
echo.
echo 🎯 Option B: Use Cloud Database (Easier, no installation)
echo    1. Sign up for ElephantSQL
echo    2. Get connection string
echo    3. Update .env file
echo    4. Run migrations
echo.
echo 💡 Recommendation:
echo    Install PostgreSQL locally for development.
echo    It's more reliable and gives you full control.
echo.
echo Press any key to open PostgreSQL download page...
pause > nul
start https://www.postgresql.org/download/windows/
echo.
echo 🌐 Opening PostgreSQL download page...
echo.
echo 📋 Remember to set password: yehia.hema195200 during installation!
echo.
pause
