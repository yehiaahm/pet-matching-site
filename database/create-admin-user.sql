-- ================================================================================
-- إنشاء حساب المشرف العام (ADMIN / SUPER_ADMIN)
-- ================================================================================

-- خيار 1: تحديث مستخدم موجود ليصبح مشرف عام
-- -----------------------------------------------------------------------------
-- استخدم هذا إذا كان لديك حساب موجود وتريد ترقيته إلى ADMIN

UPDATE users 
SET role = 'ADMIN'
WHERE email = 'your-email@example.com';

-- أو لجعله SUPER_ADMIN (صلاحيات أعلى)
UPDATE users 
SET role = 'SUPER_ADMIN'
WHERE email = 'your-email@example.com';


-- خيار 2: إنشاء حساب مشرف عام جديد
-- -----------------------------------------------------------------------------
-- استخدم هذا لإنشاء حساب جديد مباشرة كمشرف

-- للـ Prisma/PostgreSQL:
INSERT INTO users (
  id,
  email,
  password,
  "firstName",
  "lastName",
  role,
  "emailVerified",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(), -- أو استخدم UUID محدد
  'admin@petmat.com',
  '$2b$10$YourHashedPasswordHere', -- استخدم bcrypt لتشفير كلمة المرور
  'Admin',
  'User',
  'ADMIN', -- أو 'SUPER_ADMIN'
  true,
  NOW(),
  NOW()
);


-- خيار 3: تحديث حسابات متعددة
-- -----------------------------------------------------------------------------
-- استخدم هذا لترقية عدة حسابات دفعة واحدة

UPDATE users 
SET role = 'ADMIN'
WHERE email IN (
  'admin1@petmat.com',
  'admin2@petmat.com',
  'admin3@petmat.com'
);


-- التحقق من حسابات المشرفين
-- -----------------------------------------------------------------------------
-- لعرض جميع حسابات المشرفين الحالية

SELECT 
  id,
  email,
  "firstName",
  "lastName",
  role,
  "createdAt",
  "updatedAt"
FROM users 
WHERE role IN ('ADMIN', 'SUPER_ADMIN')
ORDER BY "createdAt" DESC;


-- خيار 4: إنشاء حساب مشرف بكلمة مرور مشفرة
-- -----------------------------------------------------------------------------
-- يمكنك استخدام Node.js لتشفير كلمة المرور أولاً:
-- 
-- في terminal:
-- node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your-password', 10));"
--
-- ثم استخدم الناتج في الـ SQL أدناه:

INSERT INTO users (
  id,
  email,
  password,
  "firstName",
  "lastName",
  role,
  "emailVerified",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'superadmin@petmat.com',
  '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', -- استبدل بكلمة المرور المشفرة
  'Super',
  'Admin',
  'SUPER_ADMIN',
  true,
  NOW(),
  NOW()
);


-- حذف صلاحيات المشرف (إزالة الصلاحيات)
-- -----------------------------------------------------------------------------
-- لإرجاع حساب المشرف إلى مستخدم عادي

UPDATE users 
SET role = 'USER'
WHERE email = 'admin@petmat.com';


-- إحصائيات حسابات المشرفين
-- -----------------------------------------------------------------------------
-- عرض عدد المشرفين حسب النوع

SELECT 
  role,
  COUNT(*) as count
FROM users 
WHERE role IN ('ADMIN', 'SUPER_ADMIN')
GROUP BY role;


-- نموذج كامل: إنشاء مشرف عام مع معلومات كاملة
-- -----------------------------------------------------------------------------

INSERT INTO users (
  id,
  email,
  password,
  "firstName",
  "lastName",
  phone,
  role,
  "emailVerified",
  "profileComplete",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'yehiaahmed195200@gmail.com',
  '$2b$10$YourHashedPasswordHere',
  'Yehia',
  'Ahmed',
  '+20123456789',
  'SUPER_ADMIN',
  true,
  true,
  NOW(),
  NOW()
);


-- ================================================================================
-- ملاحظات مهمة
-- ================================================================================
--
-- 1. الفرق بين ADMIN و SUPER_ADMIN:
--    - ADMIN: صلاحيات إدارية كاملة، بدون حدود على الطلبات
--    - SUPER_ADMIN: صلاحيات أعلى، يمكنه إدارة المشرفين الآخرين
--
-- 2. كلمة المرور:
--    - يجب تشفير كلمة المرور باستخدام bcrypt
--    - لا تستخدم كلمة مرور عادية (plain text) أبداً
--
-- 3. التحقق من البريد الإلكتروني:
--    - اجعل emailVerified = true للمشرفين
--    - هذا يتجنب الحاجة للتحقق من البريد
--
-- 4. الأمان:
--    - لا تشارك بيانات حسابات المشرفين
--    - استخدم كلمات مرور قوية
--    - سجل نشاط المشرفين للمراجعة
--
-- 5. الصلاحيات غير المحدودة:
--    - المشرفون ليس لديهم حدود على:
--      * عدد الطلبات (API requests)
--      * Rate limiting
--      * Transaction limits
--    - جميع القيود يتم تخطيها تلقائياً
--
-- ================================================================================
-- للمزيد من المعلومات: ADMIN_UNLIMITED_ACCESS.md
-- ================================================================================
