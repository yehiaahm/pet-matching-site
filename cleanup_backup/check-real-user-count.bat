@echo off
echo ========================================
echo        PetMat User Count Checker
echo ========================================
echo.
echo This script will check the actual user count in your database
echo.

echo 1. Checking if .env file exists...
if not exist "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\server\.env" (
    echo ❌ .env file not found!
    echo Please create .env file from .env.example first
    echo.
    echo Copying .env.example to .env...
    copy "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\server\.env.example" "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\server\.env"
    echo ✅ .env file created!
    echo.
    echo Please edit the .env file with your database credentials
    echo Then run this script again.
    pause
    exit
)

echo ✅ .env file found
echo.

echo 2. Checking database connection and user count...
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\server"
node check-user-count.js

echo.
echo ========================================
echo If you see user count above, that's your answer!
echo If you see connection errors, database is not connected.
echo ========================================
pause
