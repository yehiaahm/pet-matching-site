#!/bin/bash

echo "🔍 فحص شامل للباك إند والداتابيس"
echo "=================================="

echo ""
echo "1. فحص تثبيت PostgreSQL..."
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL مثبت"
    psql --version
else
    echo "❌ PostgreSQL غير مثبت"
    echo "💡 قم بتثبيت PostgreSQL من: https://www.postgresql.org/download/"
fi

echo ""
echo "2. فحص متغيرات البيئة..."
if [ -f ".env" ]; then
    echo "✅ ملف .env موجود"
    echo "📄 محتويات .env:"
    cat .env | grep -v "PASSWORD" | head -10
else
    echo "❌ ملف .env غير موجود"
    echo "💡 انسخ .env.example إلى .env وقم بتكوينه"
fi

echo ""
echo "3. فحص الاعتماديات..."
if [ -f "package.json" ]; then
    echo "✅ package.json موجود"
    if [ -d "node_modules" ]; then
        echo "✅ node_modules موجود"
    else
        echo "❌ node_modules غير موجود"
        echo "💡 قم بتشغيل: npm install"
    fi
else
    echo "❌ package.json غير موجود"
fi

echo ""
echo "4. فحص Prisma..."
if [ -f "prisma/schema.prisma" ]; then
    echo "✅ schema.prisma موجود"
    if [ -d "node_modules/@prisma" ]; then
        echo "✅ Prisma client مثبت"
    else
        echo "❌ Prisma client غير مثبت"
        echo "💡 قم بتشغيل: npm run prisma:generate"
    fi
else
    echo "❌ schema.prisma غير موجود"
fi

echo ""
echo "5. فحص الاتصال بقاعدة البيانات..."
node -e "
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

prisma.\$connect()
  .then(() => {
    console.log('✅ الاتصال بقاعدة البيانات ناجح');
    return prisma.users.count();
  })
  .then(count => {
    console.log(\`✅ جدول users يحتوي على \${count} مستخدم\`);
    return prisma.pets.count();
  })
  .then(count => {
    console.log(\`✅ جدول pets يحتوي على \${count} حيوان أليف\`);
    console.log('🎉 قاعدة البيانات تعمل بشكل ممتاز!');
  })
  .catch(error => {
    console.log('❌ خطأ في الاتصال بقاعدة البيانات:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 الحل: تأكد من أن PostgreSQL يعمل');
    } else if (error.code === '3D000') {
      console.log('💡 الحل: قم بإنشاء قاعدة البيانات');
    } else if (error.code === '28P01') {
      console.log('💡 الحل: تحقق من اسم المستخدم وكلمة المرور في .env');
    }
  })
  .finally(() => prisma.\$disconnect());
"

echo ""
echo "6. فحص ملفات السيرفر..."
if [ -f "server.js" ]; then
    echo "✅ server.js موجود"
else
    echo "❌ server.js غير موجود"
fi

if [ -f "server-prisma.js" ]; then
    echo "✅ server-prisma.js موجود"
else
    echo "❌ server-prisma.js غير موجود"
fi

echo ""
echo "7. فحص المسارات (Routes)..."
if [ -d "routes" ]; then
    echo "✅ مجلد routes موجود"
    echo "📁 الملفات في routes:"
    ls routes/ | head -5
else
    echo "❌ مجلد routes غير موجود"
fi

echo ""
echo "8. فحص وحدات التحكم (Controllers)..."
if [ -d "controllers" ]; then
    echo "✅ مجلد controllers موجود"
    echo "📁 عدد الملفات في controllers:"
    ls controllers/ | wc -l
else
    echo "❌ مجلد controllers غير موجود"
fi

echo ""
echo "=================================="
echo "🏁 انتهى الفحص الشامل"
echo ""
echo "📋 الخطوات التالية الموصى بها:"
echo "1. تأكد من أن PostgreSQL يعمل"
echo "2. تحقق من ملف .env"
echo "3. شغل الاعتماديات: npm install"
echo "4. توليد Prisma client: npm run prisma:generate"
echo "5. تشغيل السيرفر: npm run dev"
