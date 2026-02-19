# ✅ حساب SUPER_ADMIN - Yehia Ahmed

## 📧 معلومات الحساب

```
البريد الإلكتروني: yehiaahmed195200@gmail.com
كلمة المرور: yehia.hema195200
الصلاحية: SUPER_ADMIN
```

## 🚀 خطوات التفعيل

### الطريقة 1: استخدام SQL (الأسرع)

```bash
# 1. افتح PostgreSQL
psql -U postgres -d pets_db

# 2. نفذ السكريبت
\i database/create-yehia-admin.sql

# أو نسخ الأمر مباشرة:
```

```sql
UPDATE users 
SET role = 'SUPER_ADMIN', "emailVerified" = true 
WHERE email = 'yehiaahmed195200@gmail.com';

-- أو إذا لم يكن موجود:
INSERT INTO users (id, email, password, "firstName", "lastName", role, "emailVerified", "createdAt", "updatedAt") 
SELECT gen_random_uuid(), 'yehiaahmed195200@gmail.com', 
'$2b$10$rKz8qXKQH4q5.vXxEjN8POH5JLvQXzGKfYGsE0UX6dEqMPBqhvK1G', 
'Yehia', 'Ahmed', 'SUPER_ADMIN', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'yehiaahmed195200@gmail.com');
```

### الطريقة 2: استخدام Node.js

```bash
ADMIN_EMAIL=yehiaahmed195200@gmail.com \
ADMIN_PASSWORD=yehia.hema195200 \
ADMIN_FIRSTNAME=Yehia \
ADMIN_LASTNAME=Ahmed \
ADMIN_ROLE=SUPER_ADMIN \
node scripts/create-admin.js --env
```

## 🔐 تسجيل الدخول

### API Request:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "yehiaahmed195200@gmail.com",
    "password": "yehia.hema195200"
  }'
```

### Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "email": "yehiaahmed195200@gmail.com",
    "firstName": "Yehia",
    "lastName": "Ahmed",
    "role": "SUPER_ADMIN"
  }
}
```

## ✨ الصلاحيات

كحساب SUPER_ADMIN، لديك:

- ♾️ **طلبات غير محدودة**: بدون أي حدود على عدد الطلبات
- 🚫 **بدون Rate Limiting**: لن تحصل على HTTP 429
- 🔓 **وصول كامل**: لجميع endpoints والموارد
- 👥 **إدارة المشرفين**: يمكنك إضافة/حذف مشرفين آخرين
- ⚡ **أولوية قصوى**: طلباتك لها أعلى أولوية

## 📊 التحقق

```sql
-- التحقق من الحساب
SELECT email, role, "emailVerified" 
FROM users 
WHERE email = 'yehiaahmed195200@gmail.com';
```

النتيجة المتوقعة:
```
email                      | role        | emailVerified
---------------------------+-------------+--------------
yehiaahmed195200@gmail.com | SUPER_ADMIN | true
```

## 🎯 الاستخدام

بعد تسجيل الدخول والحصول على Token:

```javascript
// في جميع الطلبات
fetch('/api/any-endpoint', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE',
    'Content-Type': 'application/json'
  }
})
```

## 📚 للمزيد

راجع [ADMIN_UNLIMITED_GUIDE_AR.md](ADMIN_UNLIMITED_GUIDE_AR.md) للحصول على دليل شامل.

---

**تاريخ الإنشاء**: 3 فبراير 2026  
**الحالة**: ✅ جاهز للاستخدام
