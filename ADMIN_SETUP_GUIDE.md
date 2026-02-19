# 🚀 دليل الإعداد والتفعيل - نظام الإدارة

## ⚙️ خطوات الإعداد

### الخطوة 1: تحديث قاعدة البيانات

```bash
# في مجلد الـ server
cd server

# تشغيل Migration الجديد
npx prisma migrate deploy

# أو إنشاء migration جديد
npx prisma migrate dev --name add_admin_system
```

### الخطوة 2: تحديث البيانات الموجودة

```bash
# إنشاء سجل إعدادات النظام الأولي
npx prisma db seed --preview-feature

# أو يدويًا عبر database query:
# INSERT INTO system_settings (id) VALUES (uuid_generate_v4());
```

### الخطوة 3: تحعديث Routes في index.js

```javascript
// تأكد من أن هذا السطر موجود في server/routes/index.js
router.use(`${apiPrefix}/admin`, adminRoutes);
```

---

## 👥 إنشاء حسابات الإدارة الأولى

### عبر Database مباشرة:

```sql
-- تحديث مستخدم موجود ليصبح Super Admin
UPDATE users 
SET role = 'SUPER_ADMIN'
WHERE email = 'admin@example.com';

-- أو إنشاء مستخدم جديد
INSERT INTO users (
  id, email, password, firstName, lastName, role, isVerified, createdAt, updatedAt
) VALUES (
  'admin-001',
  'admin@petmat.local',
  'hashed_password_here',  -- استخدم bcrypt أو نفس طريقة التشفير المستخدمة
  'Admin',
  'User',
  'SUPER_ADMIN',
  true,
  NOW(),
  NOW()
);
```

### عبر API (بعد التشغيل):

```bash
# 1. إنشاء حساب عادي (تسجيل)
POST /api/v1/auth/register
{
  "email": "admin@petmat.local",
  "password": "SecurePassword123!",
  "firstName": "Admin",
  "lastName": "User"
}

# 2. تحديث الدور في Database (من Super Admin آخر)
POST /api/v1/admin/users/change-role
{
  "userId": "the-new-admin-id",
  "newRole": "SUPER_ADMIN"
}
```

---

## 🧪 اختبار الإعداد

### اختبار 1: التحقق من Endpoints

```bash
# الحصول على قائمة المستخدمين
curl -X GET "http://localhost:3000/api/v1/admin/users" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# النتيجة المتوقعة:
{
  "success": true,
  "users": [...],
  "pagination": {...}
}
```

### اختبار 2: التحقق من الصلاحيات

```bash
# محاولة الوصول بدون token (يجب أن يفشل)
curl -X GET "http://localhost:3000/api/v1/admin/users"

# النتيجة المتوقعة:
{
  "success": false,
  "message": "Unauthorized"
}
```

### اختبار 3: التحقق من الأدوار

```bash
# محاولة الوصول كمستخدم عادي (يجب أن يفشل)
curl -X GET "http://localhost:3000/api/v1/admin/users" \
  -H "Authorization: Bearer REGULAR_USER_TOKEN"

# النتيجة المتوقعة:
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

---

## 🌐 الوصول إلى لوحة التحكم

### في المتصفح:

```
http://localhost:5173/admin
```

### المتطلبات:
- ✅ يجب أن تكون مسجل دخول
- ✅ يجب أن يكون دورك `ADMIN` أو أعلى
- ✅ التوكن يجب أن يكون صالح

### إذا رأيت رسالة "Access Denied":
1. تحقق من أنك مسجل دخول
2. تحقق من دورك (يجب أن يكون ADMIN أو SUPER_ADMIN)
3. امسح الـ localStorage وجرّب مجددًا

---

## 📋 قائمة التحقق الأولية

### الإعداد:
- [ ] تشغيل Migration بنجاح
- [ ] إنشاء حساب Super Admin
- [ ] التحقق من إضافة admin routes في index.js
- [ ] تشغيل الـ Backend بدون أخطاء
- [ ] تشغيل الـ Frontend بدون أخطاء

### الاختبار:
- [ ] الوصول إلى /admin بنجاح
- [ ] ظهور Dashboard الرئيسي
- [ ] ظهور الإحصائيات بشكل صحيح
- [ ] القدرة على البحث عن المستخدمين
- [ ] ظهور أزرار الحظر والتحذير

### الأمان:
- [ ] عدم القدرة على الوصول بدون token
- [ ] عدم القدرة على الوصول بدور منخفض
- [ ] تسجيل الأنشطة في audit_logs
- [ ] عمل middleware الحماية بشكل صحيح

---

## 🔧 استكشاف المشاكل الشائعة

### مشكلة: "Cannot find module adminController"

**الحل:**
```bash
# تأكد من أن الملف موجود:
# server/controllers/adminController.js

# إذا كان ناقصًا، أعد إنشاء الملف
cp server/controllers/petController.js server/controllers/adminController.js
# ثم استبدل المحتوى بالكود الصحيح
```

### مشكلة: "Cannot find module adminRoutes"

**الحل:**
```bash
# تأكد من أن الملف موجود:
# server/routes/adminRoutes.js

# تحقق من import في index.js:
# import adminRoutes from './adminRoutes.js';
```

### مشكلة: "Access Denied" في Admin Dashboard

**الحل:**
```sql
-- تحقق من دورك
SELECT role FROM users WHERE id = 'your-user-id';

-- إذا كان المشكلة، قم بالتحديث:
UPDATE users 
SET role = 'ADMIN' 
WHERE id = 'your-user-id';
```

### مشكلة: الإحصائيات لا تظهر

**الحل:**
1. تحقق من اتصال قاعدة البيانات
2. تأكد من وجود بيانات في الجداول
3. تحقق من الـ Browser Console للأخطاء
4. امسح الـ Cache (F5 أو Ctrl+Shift+Delete)

### مشكلة: لا يمكن حظر المستخدمين

**الحل:**
```javascript
// تحقق من أن middleware الحماية في adminRoutes.js صحيح
// يجب أن يكون req.user محدد بشكل صحيح

// في حالة المشكلة، تحقق من:
// 1. التوكن الذي يتم إرساله
// 2. أن الـ authorization middleware موجود
// 3. أن معرف المستخدم الهدف صحيح
```

---

## 🔄 التحديثات المستقبلية

### ميزات يمكن إضافتها:

```javascript
// 1. إشعارات للمستخدمين
router.post('/users/ban/notify', requireAdmin, (req, res) => {
  // إرسال email للمستخدم المحظور
});

// 2. نظام الاستئناف
router.post('/bans/appeal', protect, (req, res) => {
  // السماح للمستخدمين بالاستئناف
});

// 3. تقارير دورية تلقائية
router.post('/reports/schedule', requireSuperAdmin, (req, res) => {
  // إرسال تقارير يومية/أسبوعية
});

// 4. إشعارات فورية
router.post('/notifications/broadcast', requireSuperAdmin, (req, res) => {
  // إرسال رسالة لجميع المستخدمين
});
```

---

## 📊 نماذج البيانات المتوقعة

### Response من GET /api/v1/admin/dashboard/stats:

```json
{
  "success": true,
  "stats": {
    "users": {
      "total": 2450,
      "breeders": 650,
      "banned": 15
    },
    "content": {
      "totalPets": 8230,
      "totalBreedingRequests": 523,
      "pendingReports": 8
    },
    "activity": {
      "messagesLastMonth": 15420,
      "newUsersLastMonth": 187
    }
  }
}
```

### Response من GET /api/v1/admin/users:

```json
{
  "success": true,
  "users": [
    {
      "id": "user-001",
      "email": "user@example.com",
      "firstName": "Ahmed",
      "lastName": "Mohamed",
      "phone": "+20123456789",
      "role": "BREEDER",
      "isBanned": false,
      "warnings": 0,
      "rating": 4.5,
      "totalMatches": 12,
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2450,
    "pages": 245
  }
}
```

---

## 🎯 الخطوات الموصى بها بعد الإعداد

### أسبوع الأول:
1. ✅ اختبار جميع الـ endpoints
2. ✅ إنشاء عدة حسابات إدارة
3. ✅ تجربة جميع العمليات
4. ✅ مراقبة سجلات التدقيق

### شهر الأول:
1. ✅ مراجعة الإحصائيات يومياً
2. ✅ معالجة البلاغات بسرعة
3. ✅ ضبط الإعدادات حسب الحاجة
4. ✅ توثيق السياسات

### المستقبل:
1. ✅ مراقبة النشاط أسبوعياً
2. ✅ تحديث الإعدادات حسب الحاجة
3. ✅ إضافة ميزات جديدة
4. ✅ تحسين الأمان

---

## 📞 الدعم

### إذا واجهت مشاكل:

1. **تحقق من الأخطاء:**
   ```bash
   # في Terminal (Backend)
   npm run dev

   # في Browser Console (Frontend)
   F12 → Console tab
   ```

2. **تفقد الملفات:**
   - `server/controllers/adminController.js` ✅
   - `server/routes/adminRoutes.js` ✅
   - `src/app/components/admin/*.tsx` ✅
   - `server/prisma/schema.prisma` ✅

3. **اختبر الـ APIs:**
   - استخدم `test-admin-api.js`
   - أو استخدم Postman

---

## ✨ الخلاصة

بعد اتباع هذه الخطوات، سيكون لديك:
- ✅ نظام إدارة متكامل
- ✅ لوحة تحكم احترافية
- ✅ إدارة مستخدمين متقدمة
- ✅ نظام بلاغات شامل
- ✅ تحليلات وإحصائيات
- ✅ سجلات تدقيق كاملة

**النظام جاهز للإنتاج!** 🚀

