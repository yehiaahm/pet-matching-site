@echo off
echo Switching to old appearance...
cd "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\src\app"
copy App.tsx App_current.tsx
copy App_old.tsx App.tsx
cd "..\styles"
rename modern-3d.css.disabled modern-3d.css.bak 2>nul
rename modern-button.css.disabled modern-button.css.bak 2>nul
echo Website appearance has been switched to old style.
echo To restore modern appearance, run: restore_modern.bat
pause
