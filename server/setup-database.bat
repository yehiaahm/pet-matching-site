@echo off
echo ========================================
echo  PetMat Database Setup
echo ========================================
echo.

REM Check if PostgreSQL is installed
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] PostgreSQL is not installed!
    echo.
    echo Please install PostgreSQL first:
    echo 1. Download from: https://www.postgresql.org/download/windows/
    echo 2. Install and remember your password
    echo 3. Run this script again
    echo.
    pause
    exit /b 1
)

echo [OK] PostgreSQL is installed
echo.

REM Check if database exists
echo Checking if database exists...
psql -U postgres -lqt | findstr pet_matchmaking >nul 2>&1
if %errorlevel% neq 0 (
    echo Creating database 'pet_matchmaking'...
    psql -U postgres -c "CREATE DATABASE pet_matchmaking;"
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create database. Check your PostgreSQL password.
        pause
        exit /b 1
    )
    echo [OK] Database created successfully
) else (
    echo [OK] Database already exists
)
echo.

REM Generate Prisma Client
echo Generating Prisma Client...
call npm run prisma:generate
if %errorlevel% neq 0 (
    echo [ERROR] Failed to generate Prisma Client
    pause
    exit /b 1
)
echo.

REM Run migrations
echo Running database migrations...
call npm run prisma:push
if %errorlevel% neq 0 (
    echo [ERROR] Failed to run migrations
    pause
    exit /b 1
)
echo.

REM Seed database
echo Seeding database with initial data...
call npm run prisma:seed
if %errorlevel% neq 0 (
    echo [WARNING] Seeding failed or not configured
)
echo.

echo ========================================
echo  Database Setup Complete!
echo ========================================
echo.
echo Your database is ready at:
echo postgresql://postgres:postgres@localhost:5432/pet_matchmaking
echo.
echo You can now start the server with: npm start
echo.
pause
