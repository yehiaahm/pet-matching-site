@echo off
echo ========================================
echo        PetMat Full Debug Test
echo ========================================
echo.
echo 1. Starting Auth Server...
start "Auth Server" /D "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\server" node auth-server.js
timeout /t 3 /nobreak > nul

echo.
echo 2. Starting Frontend...
start "Frontend" /D "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)" npm run dev
timeout /t 5 /nobreak > nul

echo.
echo 3. Testing connection...
curl -X GET http://localhost:5000/api/v1/health
echo.

echo.
echo 4. Opening browser...
start http://localhost:5173

echo.
echo ========================================
echo Both servers should be running now!
echo Check the server console for detailed logs.
echo Try registering with: yehia.1952006@gmail.com / test123
echo ========================================
pause
