@echo off
echo Starting auth server...
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\server"
start cmd /k "node auth-server.js"
timeout /t 3 /nobreak > nul
echo Testing server...
curl -X GET http://localhost:5000/api/v1/health
echo.
echo Testing registration...
curl -X POST http://localhost:5000/api/v1/auth/register -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"Test123456!\",\"firstName\":\"Test\",\"lastName\":\"User\"}"
pause
