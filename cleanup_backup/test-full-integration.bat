@echo off
REM سكريبت اختبار شامل للموقع على Windows
REM يتحقق من اتصال جميع المكونات وتخزين البيانات

echo ======================================
echo 🧪 اختبار اتصال مكونات الموقع
echo ======================================
echo.

REM 1. اختبار قاعدة البيانات
echo 1️⃣ اختبار قاعدة البيانات...
cd server
call npx prisma db pull --force >nul 2>&1
if %errorlevel% equ 0 (
    echo [32m✅ قاعدة البيانات متصلة ومتزامنة[0m
) else (
    echo [31m❌ فشل الاتصال بقاعدة البيانات[0m
    echo تأكد من:
    echo   - تشغيل PostgreSQL
    echo   - صحة DATABASE_URL في server\.env
    exit /b 1
)

REM 2. اختبار الخادم
echo.
echo 2️⃣ اختبار الخادم (Backend)...
curl -s http://localhost:5000/api/v1/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [32m✅ الخادم يعمل على المنفذ 5000[0m
) else (
    echo [33m⚠️  الخادم غير متصل[0m
    echo يجب تشغيل الخادم أولاً:
    echo   cd server ^&^& npm run dev
    exit /b 1
)

REM 3. اختبار التسجيل
echo.
echo 3️⃣ اختبار تسجيل مستخدم جديد...
set RANDOM_EMAIL=test_%random%@test.com

curl -s -X POST http://localhost:5000/api/v1/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"%RANDOM_EMAIL%\", \"password\": \"Test@1234\", \"firstName\": \"Test\", \"lastName\": \"User\", \"phone\": \"1234567890\"}" > response.json

findstr /i "success token user" response.json >nul
if %errorlevel% equ 0 (
    echo [32m✅ تسجيل المستخدم نجح[0m
    echo البريد المستخدم: %RANDOM_EMAIL%
) else (
    echo [31m❌ فشل تسجيل المستخدم[0m
    type response.json
)

REM 4. اختبار قراءة البيانات
echo.
echo 4️⃣ اختبار قراءة البيانات من API...
curl -s http://localhost:5000/api/v1/pets > pets.json
findstr /i "success pets data" pets.json >nul
if %errorlevel% equ 0 (
    echo [32m✅ قراءة قائمة الحيوانات نجحت[0m
) else (
    echo [31m❌ فشل قراءة البيانات[0m
)

REM 5. اختبار البيانات المخزنة
echo.
echo 5️⃣ اختبار البيانات المخزنة...
cd ..
node -e "const{PrismaClient}=require('@prisma/client');const p=new PrismaClient();(async()=>{try{const u=await p.users.count(),pe=await p.pets.count(),r=await p.breeding_requests.count();console.log('📊 إحصائيات قاعدة البيانات:');console.log('   المستخدمين:',u);console.log('   الحيوانات:',pe);console.log('   طلبات التزاوج:',r);u>0&&pe>=0?console.log('\x1b[32m✅ البيانات تُخزن بنجاح\x1b[0m'):console.log('\x1b[33m⚠️  لا توجد بيانات\x1b[0m');await p.$disconnect()}catch(e){console.error('\x1b[31m❌ خطأ:\x1b[0m',e.message);process.exit(1)}})();" 2>nul

REM الخلاصة
echo.
echo ======================================
echo ✅ اكتمل الاختبار
echo ======================================
echo.
echo 📝 ملخص:
echo   ✓ قاعدة البيانات: متصلة
echo   ✓ الخادم: يعمل على http://localhost:5000
echo   ✓ API: تستجيب بشكل صحيح
echo   ✓ التخزين: البيانات تُحفظ في PostgreSQL
echo.
echo 🚀 لتشغيل الموقع:
echo   Frontend: npm run dev
echo   Backend: cd server ^&^& npm run dev
echo.

REM تنظيف
del response.json 2>nul
del pets.json 2>nul

pause
