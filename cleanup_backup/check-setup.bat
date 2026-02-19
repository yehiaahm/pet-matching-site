@echo off
echo ==========================================
echo 🔍 فحص إعدادات الموقع
echo ==========================================
echo.

REM الألوان
set GREEN=[32m
set RED=[31m
set YELLOW=[33m
set NC=[0m

echo 1. فحص ملفات الإعدادات...
echo.

REM فحص .env الرئيسي
if exist ".env" (
    echo %GREEN%✅ .env موجود%NC%
    findstr /C:"VITE_API_BASE" .env >nul
    if %errorlevel% equ 0 (
        echo    VITE_API_BASE: تم العثور عليه
    ) else (
        echo %RED%   ❌ VITE_API_BASE غير موجود%NC%
    )
) else (
    echo %RED%❌ .env غير موجود%NC%
)

echo.

REM فحص server/.env
if exist "server\.env" (
    echo %GREEN%✅ server\.env موجود%NC%
    findstr /C:"DATABASE_URL" server\.env >nul
    if %errorlevel% equ 0 (
        echo    DATABASE_URL: تم العثور عليه
    )
    findstr /C:"PORT" server\.env >nul
    if %errorlevel% equ 0 (
        echo    PORT: تم العثور عليه
    )
) else (
    echo %RED%❌ server\.env غير موجود%NC%
)

echo.
echo ==========================================
echo 2. فحص الملفات الأساسية...
echo ==========================================
echo.

REM فحص src/lib/api.ts
if exist "src\lib\api.ts" (
    echo %GREEN%✅ src\lib\api.ts موجود (نظام API موحد)%NC%
) else (
    echo %RED%❌ src\lib\api.ts غير موجود%NC%
)

REM فحص server/config/prisma.js
if exist "server\config\prisma.js" (
    echo %GREEN%✅ server\config\prisma.js موجود%NC%
) else (
    echo %RED%❌ server\config\prisma.js غير موجود%NC%
)

REM فحص server/prisma/schema.prisma
if exist "server\prisma\schema.prisma" (
    echo %GREEN%✅ server\prisma\schema.prisma موجود%NC%
) else (
    echo %RED%❌ server\prisma\schema.prisma غير موجود%NC%
)

echo.
echo ==========================================
echo 3. فحص المكتبات...
echo ==========================================
echo.

REM فحص node_modules الرئيسية
if exist "node_modules" (
    echo %GREEN%✅ node_modules موجودة (Frontend)%NC%
) else (
    echo %YELLOW%⚠️  node_modules غير موجودة - نفذ: npm install%NC%
)

REM فحص node_modules في server
if exist "server\node_modules" (
    echo %GREEN%✅ server\node_modules موجودة (Backend)%NC%
) else (
    echo %YELLOW%⚠️  server\node_modules غير موجودة - نفذ: cd server ^&^& npm install%NC%
)

echo.
echo ==========================================
echo 4. فحص سكريبتات التشغيل...
echo ==========================================
echo.

if exist "test-full-integration.bat" (
    echo %GREEN%✅ test-full-integration.bat موجود%NC%
)

if exist "START_ALL.bat" (
    echo %GREEN%✅ START_ALL.bat موجود%NC%
)

echo.
echo ==========================================
echo 5. فحص الدلائل...
echo ==========================================
echo.

if exist "دليل_التشغيل_السريع.md" (
    echo %GREEN%✅ دليل_التشغيل_السريع.md موجود%NC%
)

if exist "توثيق_الاتصال_الكامل.md" (
    echo %GREEN%✅ توثيق_الاتصال_الكامل.md موجود%NC%
)

if exist "ملخص_الإنجازات.md" (
    echo %GREEN%✅ ملخص_الإنجازات.md موجود%NC%
)

if exist "اقرأني_بالعربي.md" (
    echo %GREEN%✅ اقرأني_بالعربي.md موجود%NC%
)

echo.
echo ==========================================
echo 6. نصائح سريعة
echo ==========================================
echo.
echo 📝 لتشغيل الموقع:
echo    1. cd server ^&^& npm run dev
echo    2. (في نافذة جديدة) npm run dev
echo.
echo 🧪 لاختبار الاتصال:
echo    test-full-integration.bat
echo.
echo 📊 لعرض قاعدة البيانات:
echo    cd server ^&^& npx prisma studio
echo.
echo 📚 للمساعدة:
echo    اقرأ: اقرأني_بالعربي.md
echo.

pause
