@echo off
echo ====================================
echo   PetMat - Starting All Servers
echo ====================================
echo.

REM Kill any existing processes on ports 5000 and 5174
echo [1/3] Cleaning up old processes...
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :5000') DO taskkill /F /PID %%P 2>nul
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :5174') DO taskkill /F /PID %%P 2>nul
timeout /t 2 >nul

REM Start Backend Server
echo.
echo [2/3] Starting Backend Server (Port 5000)...
cd /d "%~dp0server"
start "PetMat Backend" cmd /k "npm run dev"
timeout /t 5 >nul

REM Start Frontend Server
echo.
echo [3/3] Starting Frontend Server (Port 5174)...
cd /d "%~dp0"
start "PetMat Frontend" cmd /k "npm run dev"
timeout /t 3 >nul

echo.
echo ====================================
echo   ✅ All Servers Started!
echo ====================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5174
echo.
echo Press any key to open the website...
pause >nul

start http://localhost:5174

echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause
