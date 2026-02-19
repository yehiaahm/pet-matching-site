# 🚀 دليل التشغيل السريع

## 1️⃣ تثبيت Dependencies

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd server
npm install
cd ..

# AI Service dependencies
cd ai-service
pip install -r requirements.txt
cd ..
```

## 2️⃣ إعداد المتغيرات البيئية

```bash
cd server
cp .env.example .env
```

ثم عدّل `server/.env`:
- `DATABASE_URL`: اتصال قاعدة البيانات (PostgreSQL)
- `JWT_SECRET`: مفتاح سري
- `AI_SERVICE_URL=http://localhost:8001`

## 3️⃣ التشغيل الفوري

### Windows
```batch
START_ALL.bat
```

### Linux/macOS
```bash
chmod +x START_ALL.sh
./START_ALL.sh
```

## 4️⃣ الوصول للموقع

- 🌐 **Frontend**: http://localhost:5173
- 📡 **Backend API**: http://localhost:5000/api/v1
- 🧠 **AI Service**: http://localhost:8001
- ✨ **عرض الميزات**: http://localhost:5173/showcase

## 5️⃣ خطوات التشغيل اليدوية

إذا أردت تشغيل كل خدمة في نافذة منفصلة:

### نافذة 1: الخادم الخلفي
```bash
cd server
npm start
```

### نافذة 2: خدمة AI
```bash
cd ai-service
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001
```

### نافذة 3: Frontend
```bash
npm run dev
```

## ✅ ما تم تنفيذه

- ✓ خدمة AI مع FastAPI
- ✓ Socket.io للتنبيهات الفورية
- ✓ نظام شارات التحقق
- ✓ جدولة تلقائية للتذكيرات (cron)
- ✓ عقود ذكية Solidity
- ✓ واجهة مستخدم للتنبيهات
- ✓ صفحة عرض الميزات

## 🔍 اختبار الميزات

1. سجّل الدخول
2. اذهب إلى `/showcase`
3. سترى:
   - التنبيهات الفورية (Socket.io)
   - شارة التحقق الخاصة بك
   - معلومات المستخدم

## ⚠️ استكشاف الأخطاء

### خطأ: "AI service unavailable"
```bash
# تأكد من تشغيل خدمة AI
uvicorn main:app --port 8001
```

### خطأ: CORS blocked
```bash
# أضف الـ origin في server/.env
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

### خطأ: Database connection
```bash
# تأكد من البيانات في .env
DATABASE_URL=postgresql://user:password@localhost:5432/petmat_db
```
