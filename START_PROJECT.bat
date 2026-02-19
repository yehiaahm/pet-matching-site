@echo off
echo ========================================
echo   PetMate Project Startup Script
echo ========================================
echo.

echo [1/3] Checking Node.js installation...
node --version
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js is installed
echo.

echo [2/3] Starting Backend Server (Port 5000)...
start "PetMate Backend" cmd /k "cd server && npm start"
timeout /t 3 /nobreak > nul
echo ✓ Backend server starting...
echo.

echo [3/3] Starting Frontend (Port 5173)...
start "PetMate Frontend" cmd /k "npm run dev"
timeout /t 2 /nobreak > nul
echo ✓ Frontend server starting...
echo.

echo ========================================
echo   Project Started Successfully!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo To stop servers: Close the terminal windows
echo or press Ctrl+C in each window
echo.
pause
