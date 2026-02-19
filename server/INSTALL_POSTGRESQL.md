# تثبيت PostgreSQL على Windows

## الطريقة الأولى: التثبيت المباشر (الأسهل)

### 1. تحميل PostgreSQL
قم بتحميل PostgreSQL من الموقع الرسمي:
https://www.postgresql.org/download/windows/

أو استخدم هذا الرابط المباشر:
https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

### 2. التثبيت
- اضغط مرتين على الملف الذي تم تحميله
- اتبع خطوات التثبيت
- احفظ كلمة المرور التي تدخلها (افتراضياً: postgres)
- اترك Port كما هو: 5432

### 3. بعد التثبيت
افتح "SQL Shell (psql)" من قائمة Start وقم بإنشاء قاعدة البيانات:

```sql
-- اضغط Enter عدة مرات للموافقة على الإعدادات الافتراضية
-- ثم أدخل كلمة المرور: postgres

-- قم بإنشاء قاعدة البيانات
CREATE DATABASE pet_matchmaking;

-- تحقق من إنشاء قاعدة البيانات
\l

-- للخروج
\q
```

---

## الطريقة الثانية: استخدام Docker (إذا كان متاحاً)

### 1. تحميل Docker Desktop
https://www.docker.com/products/docker-desktop/

### 2. بعد تثبيت Docker
```bash
cd server
docker-compose up -d
```

---

## بعد تثبيت PostgreSQL

### 1. تحديث ملف .env (إذا لزم الأمر)
إذا كانت كلمة المرور مختلفة:
```
DATABASE_URL="postgresql://postgres:كلمة_المرور@localhost:5432/pet_matchmaking"
```

### 2. تشغيل Prisma Migrations
```bash
cd server
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 3. إعادة تشغيل السيرفر
اضغط Ctrl+C لإيقاف السيرفر ثم:
```bash
npm start
```

---

## استكشاف الأخطاء

### خطأ في الاتصال؟
1. تأكد من أن PostgreSQL يعمل:
   - افتح "Services" في Windows
   - ابحث عن "postgresql-x64-XX"
   - تأكد أن الحالة "Running"

2. تأكد من كلمة المرور في ملف .env

3. تأكد من أن Port 5432 ليس مستخدماً

### تغيير كلمة المرور؟
```sql
-- في SQL Shell (psql):
ALTER USER postgres WITH PASSWORD 'new_password';
```
