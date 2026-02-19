# 📧 نظام خدمة العملاء الكامل - Customer Support System

## 📋 نظرة عامة

تم إنشاء نظام خدمة عملاء متكامل يسمح للمستخدمين بالتواصل مع فريق الدعم من خلال نموذج احترافي مع إمكانيات متعددة.

---

## ✨ المميزات

### 1. **واجهة مستخدم احترافية**
- 🎨 تصميم حديث مع gradients وanimations
- 📱 متجاوب تماماً مع جميع الأجهزة
- 🌐 دعم كامل للغة العربية والإنجليزية
- 🎭 تأثيرات حركية جذابة باستخدام Framer Motion

### 2. **نظام التذاكر (Tickets)**
- 📝 إنشاء تذاكر دعم من المستخدمين المسجلين وغير المسجلين
- 🏷️ تصنيف التذاكر إلى 7 فئات:
  - 🔧 مشكلة تقنية
  - 👤 مشكلة في الحساب
  - 💳 مشكلة في الدفع
  - ❤️ مشكلة في المطابقة
  - 🛡️ قضية أمان
  - 💭 ملاحظات واقتراحات
  - 📋 أخرى

### 3. **نظام الأولويات**
- 🟦 منخفضة (Low)
- 🔵 عادية (Normal) - افتراضي
- 🟠 عالية (High)
- 🔴 عاجلة (Urgent)

### 4. **حالات التذكرة**
- ✅ مفتوحة (OPEN) - جديدة
- 🔄 قيد المعالجة (IN_PROGRESS)
- 💬 تم الرد (REPLIED)
- ✔️ مغلقة (CLOSED)

### 5. **معلومات الاتصال**
- 📧 البريد الإلكتروني: support@petmate.com
- 📱 الهاتف (واتساب): +20 100 123 4567
- ⏰ ساعات العمل: 24/7

---

## 🗂️ الملفات المضافة

### **Frontend**

1. **`src/app/components/CustomerSupportPage.tsx`**
   - صفحة خدمة العملاء الرئيسية
   - نموذج إرسال التذاكر
   - معلومات الاتصال والأسئلة الشائعة

2. **`src/app/components/FAQSection.tsx`** (معدل)
   - إضافة زر "اتصل بنا" الذي يفتح صفحة الدعم
   - دمج CustomerSupportPage

### **Backend**

3. **`server/routes/supportRoutes.js`**
   - POST `/api/v1/support/tickets` - إنشاء تذكرة جديدة
   - GET `/api/v1/support/tickets` - جلب تذاكر المستخدم
   - GET `/api/v1/support/tickets/:id` - جلب تذكرة محددة
   - POST `/api/v1/support/tickets/:id/reply` - إضافة رد
   - PATCH `/api/v1/support/tickets/:id/status` - تحديث حالة التذكرة

4. **`server/prisma/schema.prisma`** (معدل)
   - إضافة Enums: `TicketStatus`, `TicketPriority`, `TicketCategory`
   - إضافة Model: `SupportTicket`
   - إضافة relation في User model

5. **`server/routes/index.js`** (معدل)
   - تسجيل supportRoutes في الـ API

---

## 🔌 API Endpoints

### 1. إنشاء تذكرة جديدة

```http
POST /api/v1/support/tickets
Content-Type: application/json
Authorization: Bearer <token> (اختياري)

{
  "name": "يحيى أحمد",
  "email": "user@example.com",
  "subject": "مشكلة في تسجيل الدخول",
  "category": "technical",
  "message": "لا أستطيع تسجيل الدخول إلى حسابي",
  "priority": "high"
}
```

**الاستجابة:**
```json
{
  "success": true,
  "message": "Support ticket created successfully",
  "ticketId": "clxxx123456"
}
```

### 2. جلب جميع التذاكر للمستخدم

```http
GET /api/v1/support/tickets
Authorization: Bearer <token>
```

**الاستجابة:**
```json
{
  "success": true,
  "tickets": [
    {
      "id": "clxxx123456",
      "name": "يحيى أحمد",
      "email": "user@example.com",
      "subject": "مشكلة في تسجيل الدخول",
      "category": "TECHNICAL",
      "message": "لا أستطيع تسجيل الدخول إلى حسابي",
      "priority": "HIGH",
      "status": "OPEN",
      "createdAt": "2026-01-23T10:30:00Z",
      "updatedAt": "2026-01-23T10:30:00Z"
    }
  ]
}
```

### 3. جلب تذكرة محددة

```http
GET /api/v1/support/tickets/:id
Authorization: Bearer <token>
```

### 4. إضافة رد على تذكرة

```http
POST /api/v1/support/tickets/:id/reply
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "تم حل المشكلة، يرجى المحاولة مرة أخرى"
}
```

### 5. تحديث حالة التذكرة

```http
PATCH /api/v1/support/tickets/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "closed"
}
```

---

## 📊 Database Schema

```prisma
model SupportTicket {
  id        String   @id @default(cuid())
  userId    String?  // يمكن أن يكون null للمستخدمين غير المسجلين
  user      User?    @relation(fields: [userId], references: [id])
  
  name      String
  email     String
  subject   String
  category  TicketCategory
  message   String   @db.Text
  priority  TicketPriority @default(NORMAL)
  status    TicketStatus   @default(OPEN)
  
  replies   Json?    // مصفوفة JSON للردود
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([userId])
  @@index([email])
  @@index([status])
  @@index([createdAt])
  @@map("support_tickets")
}
```

---

## 🚀 كيفية الاستخدام

### من جانب المستخدم:

1. **فتح صفحة الدعم:**
   - من الصفحة الرئيسية، انتقل إلى قسم الأسئلة الشائعة
   - اضغط على زر "📧 اتصل بنا"

2. **ملء النموذج:**
   - أدخل الاسم والبريد الإلكتروني
   - اختر الفئة المناسبة
   - أدخل الموضوع والرسالة
   - اختر الأولوية (عادية بشكل افتراضي)

3. **إرسال التذكرة:**
   - اضغط "إرسال الرسالة"
   - سترى رسالة تأكيد "تم الإرسال بنجاح! ✅"

4. **الاتصال البديل:**
   - يمكن الاتصال عبر البريد الإلكتروني: support@petmate.com
   - أو عبر الواتساب: +20 100 123 4567

---

## 🎨 مميزات التصميم

### الألوان والتأثيرات:
- 🔵 Gradient رئيسي: `from-blue-600 to-green-600`
- 🎭 حركات سلسة باستخدام Framer Motion
- 📱 تصميم متجاوب بالكامل
- 🌗 دعم الوضع الليلي (مستقبلاً)

### الأولويات بالألوان:
- منخفضة: رمادي `bg-gray-200`
- عادية: أزرق `bg-blue-200`
- عالية: برتقالي `bg-orange-200`
- عاجلة: أحمر `bg-red-200`

---

## ⚡ متوسط وقت الاستجابة

- 📊 أقل من ساعة واحدة
- 🚀 استجابة سريعة للأولويات العالية والعاجلة
- 24/7 فريق الدعم متاح دائماً

---

## 🔐 الأمان

- ✅ التحقق من المصادقة (Authentication) عند الحاجة
- ✅ حماية البيانات الشخصية
- ✅ تشفير الاتصالات
- ✅ منع SQL Injection عبر Prisma ORM

---

## 🧪 الاختبار

### 1. اختبار إنشاء تذكرة:
```bash
curl -X POST http://localhost:3000/api/v1/support/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Issue",
    "category": "technical",
    "message": "This is a test ticket",
    "priority": "normal"
  }'
```

### 2. اختبار جلب التذاكر:
```bash
curl -X GET http://localhost:3000/api/v1/support/tickets \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📈 المستقبل

### ميزات قادمة:
- 📧 إشعارات بريد إلكتروني تلقائية
- 💬 نظام دردشة مباشر (Live Chat)
- 📊 لوحة تحكم إدارية للمشرفين
- 📱 إشعارات Push للتذاكر الجديدة
- 🤖 روبوت دعم آلي باستخدام AI
- 📂 إرفاق ملفات مع التذاكر
- ⭐ تقييم جودة الدعم

---

## 🐛 الإبلاغ عن مشاكل

إذا واجهت أي مشكلة:
1. تحقق من Console في المتصفح (F12)
2. تحقق من logs الـ Backend
3. تأكد من تشغيل قاعدة البيانات
4. تأكد من تطبيق Prisma migrations

---

## 📝 ملاحظات

- النظام يدعم المستخدمين المسجلين وغير المسجلين
- التذاكر مرتبطة بـ User ID إذا كان المستخدم مسجلاً
- يمكن للمستخدمين متابعة تذاكرهم من خلال البريد الإلكتروني
- جميع البيانات مشفرة ومحمية

---

## 🎉 تم بنجاح!

نظام خدمة العملاء الآن جاهز ومتكامل بالكامل! ✨
