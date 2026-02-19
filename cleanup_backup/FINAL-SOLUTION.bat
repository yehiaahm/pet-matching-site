@echo off
echo ========================================
echo        PetMat FINAL SOLUTION
echo ========================================
echo.
echo 1. Killing any existing servers...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak > nul

echo.
echo 2. Starting SIMPLE Auth Server...
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)"
start "Simple Auth Server" cmd /k "node simple-auth-server.js"
timeout /t 3 /nobreak > nul

echo.
echo 3. Starting Frontend...
start "Frontend" cmd /k "npm run dev"
timeout /t 5 /nobreak > nul

echo.
echo 4. Testing simple server...
curl -X GET http://localhost:5000/api/v1/health
echo.

echo.
echo 5. Testing registration...
curl -X POST http://localhost:5000/api/v1/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"firstName\":\"Yehia\",\"lastName\":\"Test\",\"email\":\"yehia.1952006@gmail.com\",\"password\":\"test123\"}"
echo.

echo.
echo 6. Opening browser...
start http://localhost:5173

echo.
echo ========================================
echo READY! Try registering now.
echo Email: yehia.1952006@gmail.com
echo Password: test123
echo ========================================
pause
