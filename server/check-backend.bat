@echo off
chcp 65001 >nul
echo 🔍 فحص شامل للباك إند والداتابيس
echo ==================================

echo.
echo 1. فحص Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js مثبت
    node --version
) else (
    echo ❌ Node.js غير مثبت
    echo 💡 قم بتثبيت Node.js من: https://nodejs.org/
)

echo.
echo 2. فحص متغيرات البيئة...
if exist .env (
    echo ✅ ملف .env موجود
    echo 📄 أول 5 أسطر من .env:
    for /f "skip=0 tokens=* delims=" %%a in ('type .env ^| findstr /v "PASSWORD" ^| head -n 5') do echo    %%a
) else (
    echo ❌ ملف .env غير موجود
    echo 💡 انسخ .env.example إلى .env وقم بتكوينه
)

echo.
echo 3. فحص الاعتماديات...
if exist package.json (
    echo ✅ package.json موجود
    if exist node_modules (
        echo ✅ node_modules موجود
    ) else (
        echo ❌ node_modules غير موجود
        echo 💡 قم بتشغيل: npm install
    )
) else (
    echo ❌ package.json غير موجود
)

echo.
echo 4. فحص Prisma...
if exist prisma\schema.prisma (
    echo ✅ schema.prisma موجود
    if exist node_modules\@prisma (
        echo ✅ Prisma client مثبت
    ) else (
        echo ❌ Prisma client غير مثبت
        echo 💡 قم بتشغيل: npm run prisma:generate
    )
) else (
    echo ❌ schema.prisma غير موجود
)

echo.
echo 5. فحص الاتصال بقاعدة البيانات...
node -e "try { const { PrismaClient } = require('@prisma/client'); require('dotenv').config(); const prisma = new PrismaClient(); prisma.$connect().then(() => console.log('✅ الاتصال بقاعدة البيانات ناجح')).then(() => prisma.users.count().then(count => console.log('✅ جدول users يحتوي على ' + count + ' مستخدم'))).then(() => prisma.pets.count().then(count => console.log('✅ جدول pets يحتوي على ' + count + ' حيوان أليف'))).then(() => console.log('🎉 قاعدة البيانات تعمل بشكل ممتاز!')).catch(error => { console.log('❌ خطأ في الاتصال:', error.message); if (error.code === 'ECONNREFUSED') console.log('💡 الحل: تأكد من أن PostgreSQL يعمل'); else if (error.code === '3D000') console.log('💡 الحل: قم بإنشاء قاعدة البيانات'); else if (error.code === '28P01') console.log('💡 الحل: تحقق من اسم المستخدم وكلمة المرور'); }).finally(() => prisma.$disconnect()); } catch(e) { console.log('❌ خطأ في Prisma:', e.message); }"

echo.
echo 6. فحص ملفات السيرفر...
if exist server.js (
    echo ✅ server.js موجود
) else (
    echo ❌ server.js غير موجود
)

if exist server-prisma.js (
    echo ✅ server-prisma.js موجود
) else (
    echo ❌ server-prisma.js غير موجود
)

echo.
echo 7. فحص المسارات (Routes)...
if exist routes (
    echo ✅ مجلد routes موجود
    echo 📁 الملفات في routes:
    dir routes /b | head -n 5
) else (
    echo ❌ مجلد routes غير موجود
)

echo.
echo 8. فحص وحدات التحكم (Controllers)...
if exist controllers (
    echo ✅ مجلد controllers موجود
    echo 📁 عدد الملفات في controllers:
    dir controllers /b ^| find /c /v ""
) else (
    echo ❌ مجلد controllers غير موجود
)

echo.
echo ==================================
echo 🏁 انتهى الفحص الشامل
echo.
echo 📋 الخطوات التالية الموصى بها:
echo 1. تأكد من أن PostgreSQL يعمل
echo 2. تحقق من ملف .env
echo 3. شغل الاعتماديات: npm install
echo 4. توليد Prisma client: npm run prisma:generate
echo 5. تشغيل السيرفر: npm run dev

pause
