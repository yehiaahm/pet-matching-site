@echo off
echo Testing PetMat Auth Server...
echo.

echo 1. Testing health endpoint...
curl -X GET http://localhost:5000/api/v1/health
echo.

echo.
echo 2. Testing registration with valid data...
curl -X POST http://localhost:5000/api/v1/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"firstName\":\"Yehia\",\"lastName\":\"Test\",\"email\":\"yehia.test@example.com\",\"password\":\"test123\"}"
echo.

echo.
echo 3. Testing registration with your email...
curl -X POST http://localhost:5000/api/v1/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"firstName\":\"Yehia\",\"lastName\":\"User\",\"email\":\"yehia.1952006@gmail.com\",\"password\":\"test123\"}"
echo.

echo.
echo If you see success responses above, try registering in the browser!
pause
