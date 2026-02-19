@echo off
echo Restoring modern appearance...
cd "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\src\app"
copy App_modern.tsx App.tsx
cd "..\styles"
rename modern-3d.css.bak modern-3d.css 2>nul
rename modern-button.css.bak modern-button.css 2>nul
echo Website appearance has been restored to modern style.
echo To switch back to old appearance, run: switch_to_old.bat
pause
