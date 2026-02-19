## 🐘 دليل إعداد PostgreSQL لـ PetMat

### 📋 المتطلبات:
- PostgreSQL 15 أو أحدث
- pgAdmin (اختياري) للإدارة الرسومية
- صلاحيات administrator على Windows

### 🚀 خطوات الإعداد:

#### 1. **تثبيت PostgreSQL**
```bash
# تحميل من الموقع الرسمي
https://www.postgresql.org/download/windows/

# أو استخدام Chocolatey
choco install postgresql

# أو استخدام Docker
docker run --name postgres-db -e POSTGRES_PASSWORD=password -p 5432 -d postgres:15
```

#### 2. **تشغيل PostgreSQL**
```bash
# عبر services.msc
# ابحث عن postgresql-x64-15 service وابدأها

# أو عبر سطر الأوامر
net start postgresql-x64-15
```

#### 3. **إنشاء قاعدة البيانات**
```sql
-- عبر psql command line
psql -U postgres

-- أو عبر pgAdmin
-- افتح http://localhost:5050

CREATE DATABASE petmat_db;
CREATE USER petmat_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE petmat_db TO petmat_user;
```

#### 4. **إعداد ملف .env**
```env
# في مجلد server
DATABASE_URL="postgresql://petmat_user:your_password@localhost:5432/petmat_db?schema=public"
```

#### 5. **تشغيل Prisma Migrations**
```bash
cd server
npx prisma migrate dev
npx prisma generate
```

#### 6. **تشغيل السيرفر**
```bash
cd server
npm start
```

### 🔧 **الأوامر السريعة:**

#### تثبيت PostgreSQL via Chocolatey:
```bash
choco install postgresql
```

#### بدء خدمة PostgreSQL:
```bash
net start postgresql-x64-15
```

#### إنشاء قاعدة البيانات عبر psql:
```bash
psql -U postgres -c "CREATE DATABASE petmat_db;"
```

#### إعداد Prisma:
```bash
cd server
npx prisma migrate dev
npx prisma generate
npx prisma studio
```

#### تشغيل السيرفر:
```bash
cd server
npm start
```

### 🌐 **وصول إداري:**

- **pgAdmin**: http://localhost:5050
- **Prisma Studio**: npx prisma studio (بعد الإعداد)
- **PetMat Frontend**: http://localhost:5173
- **PetMat Backend**: http://localhost:5000

### 🔍 **فحص الاتصال:**

```bash
# فحص اتصال قاعدة البيانات
cd server
node check-user-count.js
```

### 📝 **ملاحظات هامة:**

1. **كلمة المرور الافتراضية لـ PostgreSQL**: غالباً ما تكون فارغة
2. **port الافتراضي**: 5432
3. **مستخدم افتراضي**: postgres
4. **يجب تشغيل PostgreSQL service** قبل محاولة الاتصال
5. **إذا استخدمت Docker**: تأكد من تشغيل الحاوية

### 🚨 **مشاكل شائعة وحلولها:**

#### المشكلة: "FATAL: database "petmat_db" does not exist"
**الحل**: `CREATE DATABASE petmat_db;`

#### المشكلة: "FATAL: password authentication failed for user"
**الحل**: تحقق من كلمة المرور أو استخدم مستخدم postgres

#### المشكلة: "Connection refused"
**الحل**: تأكد من تشغيل PostgreSQL service

#### المشكلة: "prisma: error"
**الحل**: `npx prisma generate` ثم `npx prisma migrate dev`

### 🎯 **الخطوات بالترتيب:**

1. **تثبيت PostgreSQL** (إذا لم يكن مثبتاً)
2. **تشغيل الخدمة**
3. **إنشاء قاعدة البيانات**
4. **تشغيل setup script**
5. **تشغيل migrations**
6. **بدء السيرفر**

**بعد إتمام هذه الخطوات، سيعمل PetMat بشكل كامل مع قاعدة بيانات حقيقية!**
