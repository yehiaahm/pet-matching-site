## 🐘 دليل إعداد PostgreSQL لـ PetMat

### 📋 المتطلبات:
- PostgreSQL 15 أو أحدث
- pgAdmin (اختياري) للإدارة الرسومية
- صلاحيات管理员 على Windows

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
<tool_call>write_to_file
<arg_key>CodeContent</arg_key>
<arg_value>@echo off
title PostgreSQL Quick Setup

echo ========================================
echo       PostgreSQL Quick Commands
echo ========================================

echo 1. Start PostgreSQL service...
net start postgresql-x64-15

echo 2. Create database...
psql -U postgres -c "CREATE DATABASE petmat_db;" 2>nul
if %errorlevel% equ 0 (
    echo ✅ Database created successfully
) else (
    echo ⚠️ Database might already exist
)

echo 3. Setup .env file...
cd /d "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\server"
echo DATABASE_URL="postgresql://postgres:password@localhost:5432/petmat_db?schema=public" > .env.tmp

echo # Add other required settings...
(
echo NODE_ENV=development
echo PORT=5000
echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
echo JWT_REFRESH_SECRET=your-super-secret-refresh-token-key
echo CORS_ORIGIN=http://localhost:5173
echo API_VERSION=v1
echo API_PREFIX=/api
) >> .env.tmp

move .env.tmp .env
echo ✅ .env file configured

echo.
echo 4. Test database connection...
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.\$connect()
  .then(() => {
    console.log('✅ Database connected successfully!');
    return prisma.users.count();
  })
  .then(count => {
    console.log('👥 Current user count:', count);
  })
  .catch(e => {
    console.error('❌ Database connection failed:', e.message);
  })
  .finally(() => prisma.\$disconnect());
"

echo.
echo ========================================
echo Setup complete! You can now run:
echo   npm start    (to start the main server)
echo   npx prisma studio (to manage database)
echo ========================================
pause
