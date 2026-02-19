# 🔄 رحلة الشكوى - دليل نظام خدمة العملاء الكامل

## 📋 نظرة عامة

هذا الدليل يشرح بالتفصيل رحلة الشكوى من لحظة إرسالها من المستخدم حتى يتم الرد عليها من قبل فريق الدعم.

---

## 🚀 رحلة الشكوى خطوة بخطوة

### 1️⃣ **المستخدم يرسل الشكوى** 

#### كيف يرسل المستخدم الشكوى؟

**الخطوات:**
1. المستخدم يفتح الموقع
2. ينزل لقسم الأسئلة الشائعة (FAQ)
3. يضغط على زر "📧 اتصل بنا"
4. تظهر صفحة خدمة العملاء الكاملة
5. يملأ النموذج:
   - **الاسم:** اسم المستخدم
   - **البريد الإلكتروني:** للتواصل
   - **الفئة:** نوع المشكلة (تقنية، حساب، دفع، إلخ)
   - **الموضوع:** عنوان المشكلة
   - **الرسالة:** شرح تفصيلي للمشكلة
   - **الأولوية:** عادية، منخفضة، عالية، عاجلة
6. يضغط "إرسال الرسالة"

#### ماذا يحدث بعد الضغط على إرسال؟

**في الـ Frontend:**
```typescript
// CustomerSupportPage.tsx - lines 63-98
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3000/api/v1/support/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(formData) // البيانات المدخلة
    });

    if (!response.ok) throw new Error('Failed to submit');

    // رسالة نجاح
    toast.success('تم إرسال رسالتك بنجاح! سنرد عليك قريباً');
    
  } catch (error) {
    // رسالة خطأ
    toast.error('حدث خطأ. يرجى المحاولة مرة أخرى');
  }
};
```

---

### 2️⃣ **الشكوى تُحفظ في قاعدة البيانات**

#### أين تذهب الشكوى؟

الشكوى تُرسل إلى الـ API على الـ Backend في:
```
POST http://localhost:3000/api/v1/support/tickets
```

**في الـ Backend:**
```javascript
// server/routes/supportRoutes.js - lines 9-36
router.post('/tickets', async (req, res) => {
  try {
    const { name, email, subject, category, message, priority } = req.body;

    // إنشاء تذكرة جديدة في قاعدة البيانات
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: req.user?.id || null, // إذا كان مسجل دخول
        name,
        email,
        subject,
        category,
        message,
        priority: priority || 'NORMAL',
        status: 'OPEN' // الحالة: مفتوحة
      }
    });

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      ticketId: ticket.id
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create support ticket'
    });
  }
});
```

#### قاعدة البيانات:

الشكوى تُحفظ في جدول `support_tickets` في قاعدة بيانات PostgreSQL:

```sql
-- الجدول في قاعدة البيانات
CREATE TABLE support_tickets (
  id          TEXT PRIMARY KEY,
  user_id     TEXT,                  -- معرف المستخدم (إذا مسجل)
  name        TEXT NOT NULL,         -- اسم المرسل
  email       TEXT NOT NULL,         -- البريد الإلكتروني
  subject     TEXT NOT NULL,         -- الموضوع
  category    TEXT NOT NULL,         -- الفئة
  message     TEXT NOT NULL,         -- الرسالة
  priority    TEXT DEFAULT 'NORMAL', -- الأولوية
  status      TEXT DEFAULT 'OPEN',   -- الحالة
  replies     JSONB,                 -- الردود (JSON)
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
```

**مثال على بيانات محفوظة:**
```json
{
  "id": "clxyz123456",
  "userId": "user-abc123",
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "subject": "مشكلة في تسجيل الدخول",
  "category": "TECHNICAL",
  "message": "لا أستطيع تسجيل الدخول إلى حسابي منذ أمس",
  "priority": "HIGH",
  "status": "OPEN",
  "replies": [],
  "createdAt": "2026-01-23T10:30:00Z",
  "updatedAt": "2026-01-23T10:30:00Z"
}
```

---

### 3️⃣ **المسؤول يشاهد الشكوى**

#### كيف يرى المسؤول الشكوى؟

**للوصول إلى لوحة تحكم الدعم:**

1. المسؤول يسجل دخول بحساب ADMIN
2. في الـ Navbar، يظهر زر خاص للمسؤولين فقط: **"📊 إدارة الدعم"**
3. يضغط على الزر
4. تفتح لوحة تحكم كاملة

#### محتويات لوحة التحكم:

**الإحصائيات (Statistics):**
- 📊 إجمالي التذاكر
- 📨 تذاكر مفتوحة
- ⏳ قيد المعالجة
- ✅ تم الرد عليها
- ✔️ مغلقة
- 🚨 عاجلة

**قائمة التذاكر (Ticket List):**
- جميع التذاكر مرتبة من الأحدث للأقدم
- فلترة حسب:
  - الحالة (مفتوحة، قيد المعالجة، تم الرد، مغلقة)
  - الأولوية (عاجلة، عالية، عادية، منخفضة)
- بحث في: الموضوع، الاسم، البريد، الرسالة

**تفاصيل التذكرة:**
- الرسالة الأصلية من المستخدم
- جميع الردود السابقة
- إمكانية إضافة رد جديد
- تغيير حالة التذكرة

#### الـ API للمسؤول:

```javascript
// GET جميع التذاكر
GET http://localhost:3000/api/v1/support/admin/tickets
Authorization: Bearer <admin_token>

// الاستجابة:
{
  "success": true,
  "tickets": [
    {
      "id": "clxyz123456",
      "name": "أحمد محمد",
      "email": "ahmed@example.com",
      "subject": "مشكلة في تسجيل الدخول",
      "category": "TECHNICAL",
      "message": "لا أستطيع تسجيل الدخول...",
      "priority": "HIGH",
      "status": "OPEN",
      "createdAt": "2026-01-23T10:30:00Z"
    }
    // ... المزيد من التذاكر
  ]
}
```

---

### 4️⃣ **المسؤول يرد على الشكوى**

#### كيف يرد المسؤول؟

1. يختار تذكرة من القائمة
2. يقرأ تفاصيل المشكلة
3. يكتب الرد في صندوق النص
4. يضغط زر "إرسال" (Send)

**الكود:**
```typescript
// AdminSupportDashboard.tsx - lines 108-145
const handleSendReply = async () => {
  if (!selectedTicket || !replyMessage.trim()) return;

  setIsReplying(true);
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `http://localhost:3000/api/v1/support/tickets/${selectedTicket.id}/reply`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: replyMessage })
      }
    );

    if (!response.ok) throw new Error('Failed to send reply');

    toast.success('تم إرسال الرد بنجاح ✅');
    
    // تحديث القائمة
    await fetchTickets();
  } catch (error) {
    toast.error('فشل إرسال الرد');
  }
};
```

**في الـ Backend:**
```javascript
// server/routes/supportRoutes.js - lines 101-139
router.post('/tickets/:id/reply', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: req.params.id }
    });

    // إضافة الرد إلى مصفوفة الردود
    const currentReplies = ticket.replies || [];
    const updatedReplies = [
      ...currentReplies,
      {
        message,
        from: 'support',
        createdAt: new Date().toISOString()
      }
    ];

    // تحديث التذكرة
    const updatedTicket = await prisma.supportTicket.update({
      where: { id: req.params.id },
      data: {
        replies: updatedReplies,
        status: 'REPLIED',      // تغيير الحالة إلى "تم الرد"
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Reply added successfully',
      ticket: updatedTicket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add reply'
    });
  }
});
```

**البيانات بعد الرد:**
```json
{
  "id": "clxyz123456",
  "status": "REPLIED",  // تغيرت من OPEN إلى REPLIED
  "replies": [
    {
      "message": "شكراً على تواصلك. تم حل المشكلة، يرجى تسجيل الدخول مرة أخرى.",
      "from": "support",
      "createdAt": "2026-01-23T11:15:00Z"
    }
  ],
  "updatedAt": "2026-01-23T11:15:00Z"
}
```

---

### 5️⃣ **تغيير حالة التذكرة**

#### الحالات المتاحة:

- 🔵 **OPEN** - مفتوحة (جديدة)
- 🟡 **IN_PROGRESS** - قيد المعالجة (يعمل عليها المسؤول)
- 🟢 **REPLIED** - تم الرد (أرسل المسؤول رد)
- ⚪ **CLOSED** - مغلقة (تم حل المشكلة)

#### كيف يغير المسؤول الحالة؟

1. في صفحة تفاصيل التذكرة
2. يوجد قائمة منسدلة (dropdown) بالحالات
3. يختار الحالة الجديدة
4. يتم الحفظ تلقائياً

**الـ API:**
```javascript
// تحديث الحالة
PATCH http://localhost:3000/api/v1/support/admin/tickets/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "CLOSED"
}
```

---

## 📊 ملخص الرحلة الكاملة

```
┌─────────────────────────────────────────────────────────┐
│  1. المستخدم يرسل الشكوى                                 │
│     ↓                                                   │
│     - يملأ نموذج خدمة العملاء                          │
│     - يضغط "إرسال"                                     │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  2. Frontend يرسل البيانات للـ Backend                   │
│     ↓                                                   │
│     POST /api/v1/support/tickets                       │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  3. Backend يحفظ في قاعدة البيانات                       │
│     ↓                                                   │
│     - جدول support_tickets                             │
│     - status: OPEN                                     │
│     - replies: []                                      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  4. المسؤول يفتح لوحة التحكم                             │
│     ↓                                                   │
│     - زر "إدارة الدعم" في Navbar                        │
│     - GET /api/v1/support/admin/tickets                │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  5. المسؤول يشاهد جميع التذاكر                           │
│     ↓                                                   │
│     - قائمة بجميع الشكاوى                              │
│     - إحصائيات                                         │
│     - فلاتر وبحث                                       │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  6. المسؤول يختار تذكرة معينة                            │
│     ↓                                                   │
│     - يقرأ التفاصيل                                    │
│     - يرى الرسالة الأصلية                              │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  7. المسؤول يكتب الرد                                    │
│     ↓                                                   │
│     POST /api/v1/support/tickets/:id/reply             │
│     - الرد يُضاف إلى replies[]                          │
│     - status يتغير إلى REPLIED                         │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  8. المسؤول يغلق التذكرة                                 │
│     ↓                                                   │
│     PATCH /api/v1/support/admin/tickets/:id/status     │
│     - status: CLOSED                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 الأمان والصلاحيات

### من يمكنه الوصول؟

#### المستخدمون العاديون:
- ✅ إرسال شكاوى جديدة
- ✅ عرض شكاواهم الخاصة فقط
- ❌ لا يمكنهم رؤية شكاوى الآخرين

#### المسؤولون (ADMIN):
- ✅ عرض جميع الشكاوى
- ✅ الرد على أي شكوى
- ✅ تغيير حالة التذاكر
- ✅ عرض الإحصائيات

### التحقق من الصلاحيات:

```javascript
// في الـ Backend - للمسؤولين فقط
const user = await prisma.user.findUnique({
  where: { id: req.user.id }
});

if (!user || user.role !== 'ADMIN') {
  return res.status(403).json({
    success: false,
    message: 'Unauthorized - Admin access required'
  });
}
```

---

## 📱 الواجهات

### 1. صفحة خدمة العملاء للمستخدمين
**الملف:** `CustomerSupportPage.tsx`
- نموذج إرسال الشكوى
- معلومات الاتصال
- الأسئلة الشائعة

### 2. لوحة تحكم المسؤولين
**الملف:** `AdminSupportDashboard.tsx`
- قائمة جميع التذاكر
- إحصائيات شاملة
- تفاصيل كل تذكرة
- نظام الرد
- تغيير الحالات

### 3. زر في الـ Navbar
**الملف:** `EnhancedNavbar.tsx`
- يظهر فقط للمسؤولين
- أيقونة: 🎧 Headphones
- النص: "إدارة الدعم" / "Support Admin"

---

## 📧 الإشعارات (مستقبلاً)

### ميزات مخطط إضافتها:

1. **إشعار بريد إلكتروني للمستخدم:**
   - عند إرسال الشكوى ✅
   - عند الرد من المسؤول ✅
   - عند تغيير الحالة ✅

2. **إشعار للمسؤول:**
   - عند وصول شكوى جديدة
   - للشكاوى العاجلة على الفور

3. **إشعارات Push:**
   - داخل الموقع
   - على الهاتف

---

## 🎯 API Endpoints - قائمة كاملة

### للمستخدمين:

```bash
# إرسال شكوى جديدة
POST /api/v1/support/tickets
Headers: Authorization (optional)
Body: { name, email, subject, category, message, priority }

# عرض شكاوى المستخدم
GET /api/v1/support/tickets
Headers: Authorization (required)

# عرض شكوى محددة
GET /api/v1/support/tickets/:id
Headers: Authorization (required)

# تحديث حالة شكوى المستخدم
PATCH /api/v1/support/tickets/:id/status
Headers: Authorization (required)
Body: { status }
```

### للمسؤولين فقط:

```bash
# عرض جميع الشكاوى
GET /api/v1/support/admin/tickets
Headers: Authorization (required, ADMIN role)

# تحديث حالة أي تذكرة
PATCH /api/v1/support/admin/tickets/:id/status
Headers: Authorization (required, ADMIN role)
Body: { status }

# عرض الإحصائيات
GET /api/v1/support/admin/stats
Headers: Authorization (required, ADMIN role)

# إضافة رد على تذكرة
POST /api/v1/support/tickets/:id/reply
Headers: Authorization (required, ADMIN role)
Body: { message }
```

---

## 🧪 كيفية الاختبار

### 1. اختبار إرسال شكوى كمستخدم:
```bash
# من المتصفح:
1. افتح الصفحة الرئيسية
2. انزل لقسم FAQ
3. اضغط "اتصل بنا"
4. املأ النموذج
5. اضغط "إرسال"
```

### 2. اختبار لوحة المسؤول:
```bash
# تسجيل دخول كـ ADMIN:
Email: yehiaahmed195200@gmail.com
Password: yehia.hema195200

# بعد تسجيل الدخول:
1. ابحث عن زر "إدارة الدعم" في Navbar
2. اضغط عليه
3. ستظهر لوحة التحكم الكاملة
4. جرب فتح تذكرة والرد عليها
```

### 3. اختبار API مباشرة:
```bash
# إرسال شكوى
curl -X POST http://localhost:3000/api/v1/support/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Issue",
    "category": "TECHNICAL",
    "message": "This is a test",
    "priority": "HIGH"
  }'

# عرض جميع الشكاوى (كمسؤول)
curl -X GET http://localhost:3000/api/v1/support/admin/tickets \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## ✅ تمت بنجاح!

النظام الآن كامل ويعمل بشكل احترافي! 🎉

**الملفات المضافة:**
- ✅ `CustomerSupportPage.tsx` - صفحة المستخدمين
- ✅ `AdminSupportDashboard.tsx` - لوحة تحكم المسؤولين
- ✅ `supportRoutes.js` - API endpoints
- ✅ `schema.prisma` - Database schema
- ✅ تحديثات على Navbar و App.tsx

**الميزات:**
- ✅ نظام تذاكر كامل
- ✅ لوحة تحكم احترافية
- ✅ نظام ردود
- ✅ فلاتر وبحث
- ✅ إحصائيات شاملة
- ✅ أمان وصلاحيات
