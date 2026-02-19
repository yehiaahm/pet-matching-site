# 🇪🇬 نظام الدفع Paymob - دليل التثبيت الكامل

## لقد أنشأنا نظام دفع كامل يعتمد على Paymob ✨

### المميزات:
✅ توافق كامل مع Paymob (البوابة المصرية الشهيرة)
✅ واجهة دفع آمنة وموثوقة
✅ دعم الفيزا والماستركارد والعملات المصرية
✅ تكامل سلس مع النظام

---

## خطوات التثبيت والتفعيل

### 1️⃣ التسجيل في Paymob (إذا لم تكن مسجلاً)
```
1. اذهب إلى: https://app.paymobsolutions.com/
2. أنشئ حساباً تجارياً جديداً
3. تحقق من بريدك الإلكتروني
```

### 2️⃣ الحصول على مفاتيح Paymob
بعد التسجيل، اتبع هذه الخطوات:

```
1. في لوحة التحكم، اذهب إلى: Settings → API Keys
2. ستجد:
   - API Key (مثل: ZXhhbXBsZWFwaWtleQ==)
   - Merchant ID (رقم مثل: 12345)
3. احفظ هذه المفاتيح بأمان
```

### 3️⃣ إنشاء Integration (طريقة الدفع)
```
1. في لوحة التحكم: Integrations → Create New
2. اختر نوع الدفع: Card Payment (للبطاقات)
3. ستحصل على: Integration ID
4. احفظ جميع المفاتيح
```

### 4️⃣ إضافة المفاتيح إلى التطبيق

أنشئ ملف `.env` في مجلد الـ server:

```env
# Paymob Configuration
PAYMOB_API_KEY=YOUR_API_KEY_HERE
PAYMOB_MERCHANT_ID=YOUR_MERCHANT_ID_HERE
PAYMOB_INTEGRATION_ID=YOUR_INTEGRATION_ID_HERE
PAYMOB_API_URL=https://accept.paymobsolutions.com/api

# URLs
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:3000

# Database
DATABASE_URL=your_database_url

# JWT
JWT_SECRET=your_jwt_secret

# Environment
NODE_ENV=development
```

### 5️⃣ تثبيت الحزم المطلوبة

```bash
# تأكد من تثبيت axios
npm install axios
```

---

## الملفات المضافة

### Backend:
- `server/controllers/paymobSubscriptionController.js` - منطق الدفع
- `server/routes/paymobSubscriptionRoutes.js` - مسارات API

### Frontend:
- `src/app/components/PaymobSubscriptionDialog.tsx` - واجهة الدفع

---

## API Endpoints

### 1. إنشاء أمر دفع
```
POST /api/v1/subscription/create-order
Headers: Authorization: Bearer {token}
Body: { "tier": "professional" | "elite" }

Response:
{
  "data": {
    "paymentKey": "...",
    "orderId": "...",
    "iframeUrl": "...",
    "paymobIntegrationId": "..."
  }
}
```

### 2. التحقق من الدفع
```
POST /api/v1/subscription/verify-payment
Headers: Authorization: Bearer {token}
Body: { "orderId": "..." }

Response:
{
  "data": {
    "tier": "PROFESSIONAL",
    "status": "ACTIVE",
    "message": "تم الترقية بنجاح!"
  }
}
```

### 3. إلغاء الاشتراك
```
POST /api/v1/subscription/cancel
Headers: Authorization: Bearer {token}

Response:
{
  "data": {
    "message": "تم إلغاء الاشتراك بنجاح"
  }
}
```

---

## سير العمل

```
1. المستخدم يضغط "Upgrade Now"
   ↓
2. Frontend يطلب: POST /api/v1/subscription/create-order
   ↓
3. Backend يتصل بـ Paymob ويحصل على payment key
   ↓
4. Frontend يفتح Paymob iframe للدفع
   ↓
5. المستخدم يدخل بيانات البطاقة
   ↓
6. بعد الدفع الناجح، يتم استدعاء: POST /api/v1/subscription/verify-payment
   ↓
7. المستخدم يتم ترقيته إلى الخطة المختارة ✅
```

---

## الخطط المتاحة

### 🎁 Starter (مجاني)
- 1 حيوان
- 1 طلب/الشهر
- رسائل أساسية

### ⚡ Professional - $9.99/شهر
- 5 حيوانات
- 50 طلب/الشهر
- AI Matching
- GPS Search
- رسائل أولوية

### 👑 Elite Breeder - $29.99/شهر
- حيوانات غير محدودة
- طلبات غير محدودة
- جميع المميزات
- دعم 24/7
- تحليلات متقدمة

---

## مثال الدفع (Frontend)

```typescript
const handleUpgradeToPremium = async (tier: 'professional' | 'elite') => {
  // 1. إنشاء الأمر
  const response = await fetch('/api/v1/subscription/create-order', {
    method: 'POST',
    body: JSON.stringify({ tier })
  });
  
  const { data } = await response.json();
  
  // 2. فتح نافذة الدفع
  setPaymentKey(data.paymentKey);
  setIframeUrl(data.iframeUrl);
  setShowPaymentFrame(true);
  
  // 3. بعد الدفع (يتم تلقائياً عبر redirect)
  // المستخدم سيُعاد إلى: /subscription/success?order_id=...
};
```

---

## اختبار النظام

### خيارات الاختبار:

**1. بطاقات تجريبية في وضع Test:**
```
رقم البطاقة: 4012888888881881
الشهر: أي شهر
السنة: 2025
CVC: 123
```

**2. أو استخدم البطاقات المتاحة في Paymob Test Dashboard**

---

## استكشاف الأخطاء

### خطأ: "PAYMOB_API_KEY not found"
- تأكد أن .env يحتوي على جميع المفاتيح
- أعد تشغيل الـ server: `npm run backend`

### خطأ: "Failed to create payment order"
- تحقق من صحة API Key و Merchant ID
- تأكد من الاتصال بالإنترنت
- تحقق من Paymob Dashboard status

### دفع غير مكتمل
- تحقق من order status في Paymob Dashboard
- استخدم POST /verify-payment لإعادة التحقق
- تحقق من Paymob logs

---

## الإنتاج (Production)

عند نشر التطبيق:

```env
# استخدم المفاتيح الحقيقية (Live Keys)
PAYMOB_API_KEY=sk_live_xxxxxxxxx
PAYMOB_MERCHANT_ID=xxxxx
PAYMOB_INTEGRATION_ID=xxxxx

# استخدم URLs الحقيقية
CLIENT_URL=https://yourapp.com
SERVER_URL=https://api.yourapp.com
```

---

## المساعدة

**Documentation Paymob:**
- https://docs.paymobsolutions.com

**Support Paymob:**
- support@paymobsolutions.com
- +20 100 000 0000

---

## التلخيص ✅

الآن لديك:
✅ نظام دفع كامل مع Paymob
✅ واجهة دفع آمنة
✅ إدارة الاشتراكات
✅ دعم العملات المصرية

جاهز للبدء! 🚀
