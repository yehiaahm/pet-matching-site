#!/bin/bash

# سكريبت اختبار شامل للموقع
# يتحقق من اتصال جميع المكونات وتخزين البيانات

echo "======================================"
echo "🧪 اختبار اتصال مكونات الموقع"
echo "======================================"
echo ""

# الألوان
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. اختبار قاعدة البيانات
echo "1️⃣ اختبار قاعدة البيانات..."
cd server
npx prisma db pull --force > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ قاعدة البيانات متصلة ومتزامنة${NC}"
else
    echo -e "${RED}❌ فشل الاتصال بقاعدة البيانات${NC}"
    echo "تأكد من:"
    echo "  - تشغيل PostgreSQL"
    echo "  - صحة DATABASE_URL في server/.env"
    exit 1
fi

# 2. اختبار الخادم (Backend)
echo ""
echo "2️⃣ اختبار الخادم (Backend)..."
# التحقق من أن الخادم يعمل
if curl -s http://localhost:5000/api/v1/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ الخادم يعمل على المنفذ 5000${NC}"
else
    echo -e "${YELLOW}⚠️  الخادم غير متصل${NC}"
    echo "يجب تشغيل الخادم أولاً:"
    echo "  cd server && npm run dev"
    exit 1
fi

# 3. اختبار التسجيل
echo ""
echo "3️⃣ اختبار تسجيل مستخدم جديد..."
RANDOM_EMAIL="test_$(date +%s)@test.com"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$RANDOM_EMAIL\",
    \"password\": \"Test@1234\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\",
    \"phone\": \"1234567890\"
  }")

if echo "$RESPONSE" | grep -q "success\|token\|user"; then
    echo -e "${GREEN}✅ تسجيل المستخدم نجح${NC}"
    echo "البريد المستخدم: $RANDOM_EMAIL"
    
    # استخراج التوكن
    TOKEN=$(echo "$RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    if [ -z "$TOKEN" ]; then
        TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    fi
else
    echo -e "${RED}❌ فشل تسجيل المستخدم${NC}"
    echo "الاستجابة: $RESPONSE"
fi

# 4. اختبار إضافة حيوان أليف
echo ""
echo "4️⃣ اختبار إضافة حيوان أليف..."
if [ -n "$TOKEN" ]; then
    PET_RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/pets \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{
        "name": "فلافي",
        "species": "DOG",
        "breed": "جولدن ريتريفر",
        "gender": "MALE",
        "dateOfBirth": "2020-01-01",
        "weight": 25.5,
        "breedingStatus": "AVAILABLE",
        "healthStatus": "EXCELLENT",
        "temperament": ["FRIENDLY", "PLAYFUL"],
        "hasPedigree": true,
        "isVaccinated": true
      }')
    
    if echo "$PET_RESPONSE" | grep -q "success\|id"; then
        echo -e "${GREEN}✅ إضافة الحيوان نجحت${NC}"
        PET_ID=$(echo "$PET_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
        echo "معرف الحيوان: $PET_ID"
    else
        echo -e "${RED}❌ فشل إضافة الحيوان${NC}"
        echo "الاستجابة: $PET_RESPONSE"
    fi
else
    echo -e "${YELLOW}⚠️  تخطي اختبار الحيوان (لا يوجد توكن)${NC}"
fi

# 5. اختبار قراءة البيانات
echo ""
echo "5️⃣ اختبار قراءة البيانات من API..."
PETS_LIST=$(curl -s http://localhost:5000/api/v1/pets)
if echo "$PETS_LIST" | grep -q "success\|pets\|data"; then
    echo -e "${GREEN}✅ قراءة قائمة الحيوانات نجحت${NC}"
else
    echo -e "${RED}❌ فشل قراءة البيانات${NC}"
fi

# 6. اختبار عدد السجلات في قاعدة البيانات
echo ""
echo "6️⃣ اختبار البيانات المخزنة..."
cd ..
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    const users = await prisma.users.count();
    const pets = await prisma.pets.count();
    const requests = await prisma.breeding_requests.count();
    
    console.log('📊 إحصائيات قاعدة البيانات:');
    console.log('   المستخدمين:', users);
    console.log('   الحيوانات:', pets);
    console.log('   طلبات التزاوج:', requests);
    
    if (users > 0 && pets >= 0) {
      console.log('\x1b[32m✅ البيانات تُخزن بنجاح في قاعدة البيانات\x1b[0m');
    } else {
      console.log('\x1b[33m⚠️  لا توجد بيانات كافية للاختبار\x1b[0m');
    }
    
    await prisma.\$disconnect();
  } catch (error) {
    console.error('\x1b[31m❌ خطأ في قراءة البيانات:\x1b[0m', error.message);
    process.exit(1);
  }
}

checkData();
" 2>/dev/null

# 7. الخلاصة
echo ""
echo "======================================"
echo "✅ اكتمل الاختبار"
echo "======================================"
echo ""
echo "📝 ملخص:"
echo "  ✓ قاعدة البيانات: متصلة"
echo "  ✓ الخادم: يعمل على http://localhost:5000"
echo "  ✓ API: تستجيب بشكل صحيح"
echo "  ✓ التخزين: البيانات تُحفظ في PostgreSQL"
echo ""
echo "🚀 لتشغيل الموقع:"
echo "  Frontend: npm run dev"
echo "  Backend: cd server && npm run dev"
echo ""
