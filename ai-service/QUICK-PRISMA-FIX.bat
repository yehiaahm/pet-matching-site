@echo off
echo 🗄️ Starting Prisma Studio for PetMat Database...
echo.

REM Change to server directory
cd /d "D:\PetMat_Project\Pet Breeding Matchmaking Website (3)\server"

REM Set database URL
set DATABASE_URL=postgresql://postgres:yehia.hema195200@localhost:5432/petmat

REM Start Prisma Studio
echo 🚀 Launching Prisma Studio...
echo Database: petmat
echo User: postgres
echo Host: localhost:5432
echo.

npx prisma studio --url "postgresql://postgres:yehia.hema195200@localhost:5432/petmat"

echo.
echo ✅ Prisma Studio closed.
pause
