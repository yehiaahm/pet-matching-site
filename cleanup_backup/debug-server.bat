@echo off
echo ========================================
echo        PetMat Auth Server Debug
echo ========================================
echo.
echo Starting server with full error display...
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\server"
echo Current directory: %CD%
echo.
echo Running: node auth-server.js
echo.
node auth-server.js
echo.
echo ========================================
echo Server stopped. Check above for errors.
echo ========================================
pause
