@echo off
echo 🚀 Starting PetMate development servers...

REM Start backend
echo 🔧 Starting backend server...
cd ..\backend
start "Backend Server" cmd /k "npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo 🎨 Starting frontend server...
cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"

echo ✅ Development servers started!
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3001
echo.
echo Press any key to exit...
pause >nul
