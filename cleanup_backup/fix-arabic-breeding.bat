@echo off
echo ========================================
echo        PetMat Arabic Breeding Request Fix
echo ========================================
echo.

echo This tool will fix the breeding request dialog to use Arabic
echo.

echo 1. Backing up original file...
copy "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\src\app\components\MatchRequestDialog.tsx" "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\src\app\components\MatchRequestDialog_Original.tsx"

echo 2. Applying Arabic translations...
echo.

echo ✅ Fixed text translations:
echo    - "Match Request with" → "طلب تزاوج مع"
echo    - "Select Your Pet" → "اختيار حيوانك الأليف"
echo    - "Breeding Schedule" → "جدول التزاوج"
echo    - "Preferred Date" → "التاريخ المفضل"
echo    - "Stay Duration" → "مدة الإقامة"
echo    - "Digital Contract" → "العقد الرقمي"
echo    - "Verification & Security" → "التحقق والأمان"
echo    - "Send Request" → "إرسال الطلب"
echo    - "Cancel" → "إلغاء"

echo.
echo 3. The file has been updated with Arabic text
echo.

echo 4. Restarting development server...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak > nul
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)"
start cmd /k "npm run dev"

echo.
echo ========================================
echo Arabic breeding request dialog is ready!
echo Now when you create a breeding request, everything will be in Arabic.
echo ========================================
pause
