@echo off
echo 🚀 Setting up PetMate project...

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd ..\frontend
call npm install

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd ..\backend
call npm install

REM Setup database
echo 🗄️ Setting up database...
call npx prisma generate
call npx prisma db push

REM Seed database (optional)
set /p seed="Do you want to seed the database? (y/n): "
if /i "%seed%"=="y" (
    call npx prisma db seed
)

echo ✅ Setup complete!
echo Run 'scripts\dev.bat' to start development servers.
pause
