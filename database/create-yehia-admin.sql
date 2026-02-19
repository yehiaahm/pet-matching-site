-- ================================================================================
-- إنشاء حساب SUPER_ADMIN لـ Yehia Ahmed
-- البريد: yehiaahmed195200@gmail.com
-- ================================================================================

-- خيار 1: إذا كان الحساب موجود - ترقيته إلى SUPER_ADMIN
-- -----------------------------------------------------------------------------
UPDATE users 
SET 
  role = 'SUPER_ADMIN',
  "emailVerified" = true,
  "profileComplete" = true
WHERE email = 'yehiaahmed195200@gmail.com';


-- خيار 2: إذا كان الحساب غير موجود - إنشاؤه من الصفر
-- -----------------------------------------------------------------------------
-- ملاحظة: كلمة المرور yehia.hema195200 مشفرة بـ bcrypt
INSERT INTO users (
  id,
  email,
  password,
  "firstName",
  "lastName",
  role,
  "emailVerified",
  "profileComplete",
  "createdAt",
  "updatedAt"
) 
SELECT 
  gen_random_uuid(),
  'yehiaahmed195200@gmail.com',
  '$2b$10$rKz8qXKQH4q5.vXxEjN8POH5JLvQXzGKfYGsE0UX6dEqMPBqhvK1G', -- yehia.hema195200
  'Yehia',
  'Ahmed',
  'SUPER_ADMIN',
  true,
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'yehiaahmed195200@gmail.com'
);


-- التحقق من إنشاء الحساب
-- -----------------------------------------------------------------------------
SELECT 
  id,
  email,
  "firstName",
  "lastName",
  role,
  "emailVerified",
  "createdAt"
FROM users 
WHERE email = 'yehiaahmed195200@gmail.com';


-- ================================================================================
-- ✅ تم الإنشاء بنجاح!
-- 
-- معلومات تسجيل الدخول:
-- البريد الإلكتروني: yehiaahmed195200@gmail.com
-- كلمة المرور: yehia.hema195200
-- الصلاحية: SUPER_ADMIN (صلاحيات غير محدودة)
-- 
-- للتسجيل:
-- POST /api/auth/login
-- {
--   "email": "yehiaahmed195200@gmail.com",
--   "password": "yehia.hema195200"
-- }
-- ============================================