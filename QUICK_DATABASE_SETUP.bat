@echo off
title Quick Database Setup - Fix app_users Error
color 0B
echo.
echo ========================================
echo     🗄️ Quick Database Setup - Fix app_users Error
echo ========================================
echo.
echo ❌ Error: The table `public.app_users` does not exist
echo ✅ Solution: Setup database with correct schema
echo.
echo 🚀 Running quick database setup...
echo.
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\pet-breeding-backend"
echo.
echo 📝 Step 1: Create .env file if missing...
if not exist .env (
    copy .env.example .env
    echo ✅ .env file created
)
echo.
echo 🔄 Step 2: Generate Prisma client...
call npm run db:generate
echo.
echo 🗄️ Step 3: Run database migrations...
call npm run db:migrate
echo.
echo 🌱 Step 4: Seed database with sample data...
call npm run db:seed
echo.
echo 🧪 Step 5: Test database connection...
call node test-db.js
echo.
echo 🚀 Step 6: Start backend server...
start cmd /k "npm run dev"
echo.
echo ✅ Database setup complete!
echo.
echo 🌐 Backend server starting on: http://localhost:5000
echo 📊 Check for "Database connected successfully" message
echo.
echo 🎯 Test authentication with:
echo    Email: admin@petbreeding.com
echo    Password: admin123
echo.
echo 🌐 Test frontend at: http://localhost:5173
echo.
echo Press any key to continue...
pause > nul
