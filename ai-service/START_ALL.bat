@echo off
setlocal EnableDelayedExpansion

title Pet Breeding Platform - Start All Services
color 0B

echo.
echo ========================================
echo     Pet Breeding Platform - Start All
echo ========================================
echo.

set "ROOT=%~dp0.."
for %%I in ("%ROOT%") do set "ROOT=%%~fI"

set "BACKEND_DIR=!ROOT!\server"
if not exist "!BACKEND_DIR!\package.json" (
    set "BACKEND_DIR=!ROOT!\pet-breeding-backend"
)

if not exist "!BACKEND_DIR!\package.json" (
    echo [ERROR] Backend folder not found.
    echo Expected one of:
    echo   - !ROOT!\server
    echo   - !ROOT!\pet-breeding-backend
    echo.
    pause
    exit /b 1
)

if not exist "!ROOT!\package.json" (
    echo [ERROR] Frontend package.json not found at:
    echo   !ROOT!
    echo.
    pause
    exit /b 1
)

echo Root: %ROOT%
echo Backend: %BACKEND_DIR%
echo.

echo ========================================
echo     Step 1: Free occupied ports
echo ========================================
echo.
call :killPort 5000 "Backend"
call :killPort 5173 "Frontend"
call :killPort 5555 "Prisma Studio"
call :killPort 3000 "AI Services"
echo.

echo ========================================
echo     Step 2: Start backend
echo ========================================
echo.
call :ensurePortFree 5000 "Backend API"
if errorlevel 1 (
    echo [ERROR] Backend port 5000 is still busy. Backend was not started.
    echo Close any app using port 5000, then run START_ALL again.
    echo.
    pause
    exit /b 1
)
start "Backend API" cmd /k "cd /d ""%ROOT%"" && npm run backend"
timeout /t 6 /nobreak >nul

echo ========================================
echo     Step 3: Start frontend
echo ========================================
echo.
start "Frontend" cmd /k "cd /d ""%ROOT%"" && npm run dev"
timeout /t 6 /nobreak >nul

echo ========================================
echo     Step 4: Start Prisma Studio
echo ========================================
echo.
start "Prisma Studio" cmd /k "cd /d ""%BACKEND_DIR%"" && npx prisma studio --port 5555"
timeout /t 3 /nobreak >nul

echo ========================================
echo     Step 5: Optional AI service
echo ========================================
echo.
if exist "!ROOT!\ai-service\package.json" (
    start "AI Services" cmd /k "cd /d ""!ROOT!\ai-service"" && npm run dev"
    echo AI service started from ai-service.
) else if exist "!ROOT!\ai-services\package.json" (
    start "AI Services" cmd /k "cd /d ""!ROOT!\ai-services"" && npm run dev"
    echo AI service started from ai-services.
) else (
    echo AI service package.json not found, skipping AI startup.
)
echo.

echo ========================================
echo     Quick health checks
echo ========================================
echo.
call :checkUrl "Backend" "http://localhost:5000/api/health"
call :checkUrl "Frontend" "http://localhost:5173"
echo.
echo ========================================
echo Services launched.
echo Frontend: http://localhost:5173
echo Backend : http://localhost:5000
echo Prisma  : http://localhost:5555
echo ========================================
echo.
pause
exit /b 0

:killPort
set "PORT=%~1"
set "NAME=%~2"
echo Releasing port %PORT% ^(%NAME%^)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%PORT% ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>nul
)
goto :eof

:ensurePortFree
set "PORT=%~1"
set "NAME=%~2"
echo Verifying port %PORT% for %NAME%...
set "TRIES=0"

:ensurePortFreeLoop
set /a TRIES+=1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%PORT% ^| findstr LISTENING') do (
    echo Stopping PID %%a on port %PORT%...
    taskkill /f /pid %%a >nul 2>nul
)

timeout /t 1 /nobreak >nul
netstat -aon | findstr :%PORT% | findstr LISTENING >nul
if %errorlevel% neq 0 (
    echo Port %PORT% is ready.
    exit /b 0
)

if %TRIES% geq 3 (
    echo Port %PORT% is still busy.
    exit /b 1
)

goto :ensurePortFreeLoop

:checkUrl
set "SERVICE=%~1"
set "URL=%~2"
powershell -NoProfile -Command "try { Invoke-WebRequest -Uri '%URL%' -UseBasicParsing | Out-Null; exit 0 } catch { exit 1 }" >nul 2>nul
if %errorlevel% equ 0 (
    echo %SERVICE%: WORKING
) else (
    echo %SERVICE%: NOT READY YET
)
goto :eof
