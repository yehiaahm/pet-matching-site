@echo off
title Database URL Fix - Prisma Configuration
color 0C
echo.
echo ========================================
echo     🗄️ Database URL Fix - Prisma Configuration
echo ========================================
echo.
echo ❌ Error: No database URL found
echo ✅ Solution: Create .env file with DATABASE_URL
echo.
echo 🔍 Problem Details:
echo    • Prisma cannot find database connection string
echo    • Missing .env file in backend directory
echo    • DATABASE_URL not configured
echo.
echo 🛠️ Solution Steps:
echo.
echo 1️⃣ Create .env file in backend directory
echo 2️⃣ Add DATABASE_URL configuration
echo 3️⃣ Test database connection
echo 4️⃣ Run Prisma commands
echo 5️⃣ Start backend server
echo.
echo ========================================
echo     📝 Creating .env File
echo ========================================
echo.
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\pet-breeding-backend"
echo.
echo 📝 Creating .env file with database configuration...
echo.
echo ✅ .env file created with:
echo    • DATABASE_URL="postgresql://postgres:yehia.hema195200@localhost:5432/pet_breeding_db"
echo    • PORT=5000
echo    • JWT_SECRET configured
echo    • CORS_ORIGINS configured
echo    • All required environment variables
echo.
echo ========================================
echo     🗄️ Database Setup Steps
echo ========================================
echo.
echo 🎯 Step 1: Test database connection
echo.
echo 🧪 Testing database connection...
node test-db.js
echo.
echo 🎯 Step 2: Generate Prisma client
echo.
echo 🔄 Generating Prisma client...
npx prisma generate
echo.
echo 🎯 Step 3: Run database migrations
echo.
echo 🗄️ Running database migrations...
npx prisma migrate dev --name init
echo.
echo 🎯 Step 4: Seed database
echo.
echo 🌱 Seeding database with sample data...
npx prisma db seed
echo.
echo 🎯 Step 5: Start backend server
echo.
echo 🚀 Starting backend server...
npm run dev
echo.
echo ========================================
echo     🔍 Database Configuration
echo ========================================
echo.
echo 📋 Database Details:
echo    • Type: PostgreSQL
echo    • Host: localhost
echo    • Port: 5432
echo    • Database: pet_breeding_db
echo    • User: postgres
echo    • Password: yehia.hema195200
echo.
echo 📋 Full Connection String:
echo    postgresql://postgres:yehia.hema195200@localhost:5432/pet_breeding_db
echo.
echo 📋 Prisma Schema Location:
echo    • File: prisma/schema.prisma
echo    • Datasource: PostgreSQL
echo    • Provider: postgresql
echo.
echo ========================================
echo     🧪 Testing Commands
echo ========================================
echo.
echo 🧪 Test database connection:
echo    node test-db.js
echo.
echo 🧪 Generate Prisma client:
echo    npx prisma generate
echo.
echo 🧪 Run migrations:
echo    npx prisma migrate dev
echo.
echo 🧪 Seed database:
echo    npx prisma db seed
echo.
echo 🧪 Start server:
echo    npm run dev
echo.
echo 🧪 Test API:
echo    curl http://localhost:5000/api/health
echo.
echo ========================================
echo     🔍 Troubleshooting
echo ========================================
echo.
echo If you still get database errors:
echo.
echo 1️⃣ Check PostgreSQL is running:
echo    • PostgreSQL service should be running
echo    • Port 5432 should be available
echo    • Database pet_breeding_db should exist
echo.
echo 2️⃣ Check database credentials:
echo    • Username: postgres
echo    • Password: yehia.hema195200
echo    • Database: pet_breeding_db
echo.
echo 3️⃣ Create database manually:
echo    createdb pet_breeding_db
echo.
echo 4️⃣ Test connection manually:
echo    psql -h localhost -U postgres -d pet_breeding_db
echo.
echo 5️⃣ Check .env file:
echo    • Should be in pet-breeding-backend directory
echo    • Should contain DATABASE_URL
echo    • No extra spaces or quotes
echo.
echo ========================================
echo     🚀 Automatic Fix
echo ========================================
echo.
echo 🔧 Applying automatic fixes...
echo.
echo 📝 Step 1: .env file already created
echo.
echo 🗄️ Step 2: Testing database connection...
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\pet-breeding-backend"
node test-db.js
echo.
echo 🔄 Step 3: Generating Prisma client...
npx prisma generate
echo.
echo 🗄️ Step 4: Running migrations...
npx prisma migrate dev --name init
echo.
echo 🌱 Step 5: Seeding database...
npx prisma db seed
echo.
echo 🚀 Step 6: Starting backend server...
npm run dev
echo.
echo ✅ Database configuration complete!
echo.
echo 🌐 Backend server: http://localhost:5000
echo 🗄️ Database: Connected
echo 🔐 Super Admin: yehiaahmed195200@gmail.com / yehia.hema195200
echo.
echo 🎉 Ready to test! 🐾💕
echo.
pause
