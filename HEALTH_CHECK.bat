@echo off
echo ========================================
echo   PetMate Health Check Script
echo ========================================
echo.

echo [1/4] Checking if Backend is running...
curl -s http://localhost:5000/api/v1/health > nul 2>&1
if errorlevel 1 (
    echo ❌ Backend is NOT running on port 5000
    echo.
    echo FIX: Run this command in a new terminal:
    echo   cd server
    echo   npm start
    echo.
) else (
    echo ✓ Backend is running on port 5000
)
echo.

echo [2/4] Checking if Frontend is running...
curl -s http://localhost:5173 > nul 2>&1
if errorlevel 1 (
    echo ❌ Frontend is NOT running on port 5173
    echo.
    echo FIX: Run this command:
    echo   npm run dev
    echo.
) else (
    echo ✓ Frontend is running on port 5173
)
echo.

echo [3/4] Checking Node.js version...
node --version
echo ✓ Node.js detected
echo.

echo [4/4] Checking for common issues...
if not exist "node_modules" (
    echo ❌ node_modules folder not found
    echo FIX: Run: npm install
    echo.
) else (
    echo ✓ Dependencies installed
)

if not exist "server\node_modules" (
    echo ❌ server\node_modules folder not found
    echo FIX: Run: cd server && npm install
    echo.
) else (
    echo ✓ Backend dependencies installed
)
echo.

echo ========================================
echo   Health Check Complete!
echo ========================================
echo.
echo If both servers are running:
echo - Frontend: http://localhost:5173
echo - Backend:  http://localhost:5000
echo.
echo If servers are NOT running:
echo - Run START_PROJECT.bat to start both
echo.
pause
