@echo off
echo ========================================
echo        PostgreSQL Setup Guide for PetMat
echo ========================================
echo.

echo This guide will help you set up PostgreSQL database for PetMat
echo.

echo 1. Checking if PostgreSQL is installed...
pg_config --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL is installed
    pg_config --version
) else (
    echo ❌ PostgreSQL is not installed
    echo.
    echo Please install PostgreSQL first:
    echo 1. Download from: https://www.postgresql.org/download/windows/
    echo 2. Or use Docker: docker run postgres:15
    echo.
    pause
    exit
)

echo.
echo 2. Checking if PostgreSQL service is running...
sc query postgres >nul 2>&1
if %errorlevel% equ 1060 (
    echo ✅ PostgreSQL service is running
) else (
    echo ❌ PostgreSQL service is not running
    echo.
    echo Starting PostgreSQL service...
    net start postgresql-x64-15
    timeout /t 5 /nobreak > nul
)

echo.
echo 3. Creating database...
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\server"

echo Creating .env file with PostgreSQL settings...
(
echo # Server Configuration
echo NODE_ENV=development
echo PORT=5000
echo HOST=localhost
echo.
echo # Database Configuration  
echo DATABASE_URL="postgresql://postgres:password@localhost:5432/petmat_db?schema=public"
echo.
echo # JWT Configuration
echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
echo JWT_EXPIRES_IN=7d
echo JWT_REFRESH_SECRET=your-super-secret-refresh-token-key
echo JWT_REFRESH_EXPIRES_IN=30d
echo.
echo # CORS Configuration
echo CORS_ORIGIN=http://localhost:5173,http://localhost:3000
echo CORS_CREDENTIALS=true
echo.
echo # API Configuration
echo API_VERSION=v1
echo API_PREFIX=/api
) > .env

echo ✅ .env file created with PostgreSQL configuration
echo.

echo 4. Next steps...
echo.
echo 📋 After this setup:
echo 1. Open pgAdmin (http://localhost:5050) or use psql command line
echo 2. Create database: CREATE DATABASE petmat_db;
echo 3. Run: npx prisma migrate dev
echo 4. Run: npx prisma generate
echo 5. Start server: npm start
echo.

echo ========================================
echo Setup completed! Check above for any errors.
echo ========================================
pause
