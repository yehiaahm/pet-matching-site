@echo off
title PostgreSQL Database Setup for PetMat
color 0A

echo.
echo  ╔════════════════════════════════════════════════════════════════╗
echo  ║                    🐘 PostgreSQL Setup for PetMat                    ║
echo  ╚════════════════════════════════════════════════════════════════════╝
echo.

echo 📋 Checking PostgreSQL installation...
pg_config --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL is installed
    for /f "tokens=*" %%a in ('pg_config --version') do echo    %%a
) else (
    echo ❌ PostgreSQL is NOT installed
    echo.
    echo 📥 Please install PostgreSQL first:
    echo    1. Download: https://www.postgresql.org/download/windows/
    echo    2. Chocolatey: choco install postgresql
    echo    3. Docker: docker run postgres:15
    echo.
    pause
    exit
)

echo.
echo 🔄 Checking PostgreSQL service...
sc query postgres >nul 2>&1
if %errorlevel% equ 1060 (
    echo ✅ PostgreSQL service is RUNNING
) else (
    echo ⚠️  PostgreSQL service is NOT running
    echo    Starting PostgreSQL service...
    net start postgresql-x64-15 >nul 2>&1
    timeout /t 3 /nobreak > nul
    sc query postgres >nul 2>&1
    if !errorlevel! equ 1060 (
        echo ❌ Failed to start PostgreSQL service
        echo    Please start it manually via services.msc
    )
)

echo.
echo 🗄️  Creating PetMat database...
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\server"

echo 📝 Creating .env file...
(
echo # PetMat Server Configuration
echo NODE_ENV=development
echo PORT=5000
echo HOST=localhost
echo.
echo # PostgreSQL Database
echo DATABASE_URL="postgresql://postgres:password@localhost:5432/petmat_db?schema=public"
echo.
echo # JWT Configuration
echo JWT_SECRET=petmat-jwt-secret-key-2024
echo JWT_EXPIRES_IN=7d
echo JWT_REFRESH_SECRET=petmat-refresh-secret-key-2024
echo JWT_REFRESH_EXPIRES_IN=30d
echo.
echo # CORS Configuration
echo CORS_ORIGIN=http://localhost:5173,http://localhost:3000
echo CORS_CREDENTIALS=true
echo.
echo # API Configuration
echo API_VERSION=v1
echo API_PREFIX=/api
echo.
echo # File Upload
echo MAX_FILE_SIZE=5242880
echo UPLOAD_PATH=./uploads
) > .env

echo ✅ .env file created with PostgreSQL settings

echo.
echo 🗄️  Creating database...
psql -U postgres -c "CREATE DATABASE petmat_db;" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Database 'petmat_db' created successfully
) else (
    echo ⚠️  Database might already exist or connection failed
)

echo.
echo 🔧 Running Prisma setup...
echo 📦 Installing Prisma dependencies...
call npm install @prisma/client >nul 2>&1

echo 🔄 Generating Prisma client...
call npx prisma generate >nul 2>&1

echo 🗄️  Running database migrations...
call npx prisma migrate dev --name init >nul 2>&1

echo.
echo 🧪 Testing database connection...
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.\$connect();
    console.log('');
    console.log('🎉 SUCCESS: Database connected successfully!');
    
    const userCount = await prisma.users.count();
    console.log('👥 Current users in database:', userCount);
    
    const petCount = await prisma.pets.count();
    console.log('🐕 Current pets in database:', petCount);
    
    console.log('');
    console.log('🚀 PetMat is ready with PostgreSQL database!');
    
  } catch (error) {
    console.error('❌ FAILED: Database connection error:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Check if PostgreSQL is running');
    console.log('   2. Verify database name: petmat_db');
    console.log('   3. Check connection string in .env');
    console.log('   4. Try: psql -U postgres -d petmat_db');
  } finally {
    await prisma.\$disconnect();
  }
}

testConnection();
"

echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo  ║                        🎯 SETUP COMPLETED!                         ║
echo  ╚════════════════════════════════════════════════════════════════════════╝
echo.
echo 📋 Next Steps:
echo    1. Start main server: cd server && npm start
echo    2. Open Prisma Studio: npx prisma studio
echo    3. Open PetMat: http://localhost:5173
echo    4. Check database: http://localhost:5050 (pgAdmin)
echo.
echo 🎉 PetMat is now ready with PostgreSQL database!
echo.
pause
