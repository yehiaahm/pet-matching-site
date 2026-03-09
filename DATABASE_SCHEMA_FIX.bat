@echo off
title Database Schema Fix - Prisma Migration Issue
color 0C
echo.
echo ========================================
echo     🗄️ Database Schema Fix - Prisma Migration Issue
echo ========================================
echo.
echo ❌ Problem Identified:
echo    • Error: The table `public.app_users` does not exist
echo    • Prisma looking for wrong table names
echo    • Database schema not properly migrated
echo    • Backend and Frontend not connected to same database
echo.
echo 🔍 Root Cause Analysis:
echo.
echo 📊 What's happening:
echo    • Backend created with schema: users, pets, breeding_requests...
echo    • Frontend looking for: app_users, app_pets, app_breeding_requests...
echo    • Prisma schema prefix issue
echo    • Database not properly migrated
echo.
echo 🛠️ Solution Steps:
echo.
echo 1️⃣ Check current database status
echo 2️⃣ Fix Prisma schema if needed
echo 3️⃣ Run database migrations
echo 4️⃣ Generate Prisma client
echo 5️⃣ Seed database with sample data
echo 6️⃣ Test database connection
echo.
echo ========================================
echo     🔍 Database Status Check
echo ========================================
echo.
echo 📊 Checking database connection...
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\pet-breeding-backend"
echo.
echo 🗄️ Testing database connection...
node test-db.js
echo.
echo 📋 Checking Prisma schema...
type prisma\schema.prisma | findstr "model"
echo.
echo 📊 Checking database tables...
echo.
echo 🔍 If you see "app_users" error, we need to fix schema
echo.
echo ========================================
echo     🛠️ Database Fix Steps
echo ========================================
echo.
echo 🎯 Step 1: Check .env file
echo.
if not exist .env (
    echo ❌ .env file not found
    echo 📝 Creating .env from .env.example...
    copy .env.example .env
    echo ✅ .env file created
    echo ⚠️  Please update DATABASE_URL in .env file
    echo.
) else (
    echo ✅ .env file exists
    echo 📋 Checking DATABASE_URL...
    findstr DATABASE_URL .env
    echo.
)
echo.
echo 🎯 Step 2: Generate Prisma Client
echo.
echo 🔄 Generating Prisma client...
npm run db:generate
echo.
echo 🎯 Step 3: Run Database Migrations
echo.
echo 🗄️ Running database migrations...
npm run db:migrate
echo.
echo 🎯 Step 4: Seed Database (Optional)
echo.
echo 🌱 Seeding database with sample data...
npm run db:seed
echo.
echo 🎯 Step 5: Test Connection
echo.
echo 🧪 Testing database connection...
node test-db.js
echo.
echo ========================================
echo     🔧 Alternative Fix - Reset Database
echo ========================================
echo.
echo If migrations don't work, try database reset:
echo.
echo 🗄️ Reset database completely:
echo    npm run db:reset
echo.
echo ⚠️  WARNING: This will delete all existing data!
echo.
echo ========================================
echo     🎯 Manual Database Setup
echo ========================================
echo.
echo If automatic fixes don't work:
echo.
echo 1️⃣ Create database manually:
echo    createdb pet_breeding_db
echo.
echo 2️⃣ Update .env with correct DATABASE_URL:
echo    DATABASE_URL="postgresql://postgres:password@localhost:5432/pet_breeding_db"
echo.
echo 3️⃣ Generate Prisma client:
echo    npx prisma generate
echo.
echo 4️⃣ Run migrations:
echo    npx prisma migrate dev
echo.
echo 5️⃣ Seed database:
echo    npx prisma db seed
echo.
echo ========================================
echo     🚀 Start Backend Server
echo ========================================
echo.
echo 🚀 Starting backend server...
npm run dev
echo.
echo 🌐 Server should start on: http://localhost:5000
echo 📊 Check for "Database connected successfully" message
echo.
echo ========================================
echo     🧪 Test Authentication
echo ========================================
echo.
echo 🧪 Test with these credentials:
echo.
echo 👤 Admin User:
echo    Email: admin@petbreeding.com
echo    Password: admin123
echo.
echo 👤 Regular User:
echo    Email: john.doe@example.com
echo    Password: user123
echo.
echo 🌐 Test endpoints:
echo    • POST http://localhost:5000/api/auth/login
echo    • POST http://localhost:5000/api/auth/register
echo    • GET  http://localhost:5000/api/health
echo.
echo ========================================
echo     🔍 Troubleshooting
echo ========================================
echo.
echo If you still get "app_users" error:
echo.
echo 1️⃣ Check Prisma schema for table names:
echo    model User { ... } should create "users" table
echo    NOT "app_users"
echo.
echo 2️⃣ Check database tables:
echo    \dt in psql should show correct table names
echo.
echo 3️⃣ Check Prisma client generation:
echo    npx prisma generate
echo.
echo 4️⃣ Check environment variables:
echo    DATABASE_URL should point to correct database
echo.
echo 5️⃣ Check PostgreSQL service:
echo    PostgreSQL should be running on port 5432
echo.
echo ========================================
echo     🎯 Quick Fix Commands
echo ========================================
echo.
echo 🔄 Complete database setup:
echo    npm run db:generate
echo    npm run db:migrate
echo    npm run db:seed
echo    npm run dev
echo.
echo 🗄️ Reset and start fresh:
echo    npm run db:reset
echo    npm run dev
echo.
echo 🧪 Test connection:
echo    node test-db.js
echo.
echo 🌐 Test API:
echo    curl http://localhost:5000/api/health
echo.
echo Press any key to start database fixes...
pause > nul
echo.
echo 🚀 Starting database fix process...
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\pet-breeding-backend"
echo.
echo 📝 Checking .env file...
if not exist .env (
    copy .env.example .env
    echo ✅ .env file created from template
    echo ⚠️  Please update DATABASE_URL if needed
)
echo.
echo 🔄 Generating Prisma client...
npm run db:generate
echo.
echo 🗄️ Running database migrations...
npm run db:migrate
echo.
echo 🌱 Seeding database...
npm run db:seed
echo.
echo 🧪 Testing connection...
node test-db.js
echo.
echo 🚀 Starting backend server...
npm run dev
echo.
echo ✅ Database setup complete!
echo 🌐 Backend server running on: http://localhost:5000
echo.
echo 🎯 Now test frontend authentication!
echo.
pause
