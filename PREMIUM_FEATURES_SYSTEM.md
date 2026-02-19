# نظام تحديد الميزات المتقدمة (Premium Features System)

## المميزات الرئيسية 🎯

هذا النظام يتتبع محاولات المستخدم لاستخدام الميزات المتقدمة (Premium) ويقيد الوصول بعد محاولتين.

### كيف يعمل:
1. **المحاولة الأولى والثانية**: يسمح للمستخدم باستخدام الميزة بشكل طبيعي
2. **المحاولة الثالثة**: يعرض رسالة تنويه ويفتح صفحة الباقات تلقائياً

## الميزات المحمية:

- ✨ **AI Matching** - المطابقة الذكية بالذكاء الاصطناعي
- 📍 **GPS Search** - البحث بناءً على الموقع الجغرافي
- 📊 **Advanced Analytics** - التحليلات المتقدمة
- ∞ **Unlimited Requests** - الطلبات غير المحدودة
- ⭐ **Featured Profile** - الملف الشخصي المميز
- 🎨 **Custom Branding** - العلامات التجارية المخصصة
- 🏥 **Vet Integration** - التكامل مع العيادات البيطرية
- 🔐 **Priority Support** - الدعم الأولوي 24/7

## كيفية الاستخدام:

### في المكونات:

```tsx
import { usePremiumFeature } from '../hooks/usePremiumFeature';

function MyComponent({ onSubscriptionNeeded }) {
  const { checkAccess } = usePremiumFeature({
    featureName: 'aiMatching',  // أو أي ميزة أخرى
    onRedirect: onSubscriptionNeeded,
  });

  const handleClick = () => {
    if (!checkAccess()) {
      return;  // سيتم فتح صفحة الباقات تلقائياً
    }
    
    // تنفيذ الميزة
  };

  return <button onClick={handleClick}>استخدم الميزة</button>;
}
```

### في App.tsx:

```tsx
<GPSMatching onSubscriptionNeeded={() => setShowSubscription(true)} />
<AIRecommendations onSubscriptionNeeded={() => setShowSubscription(true)} />
```

## الملفات المرتبطة:

- `src/app/context/PremiumFeaturesContext.tsx` - Context للنظام
- `src/app/hooks/usePremiumFeature.ts` - Hook للتحقق من الميزات
- `src/app/components/SubscriptionDialog.tsx` - صفحة الباقات
- `src/app/App.tsx` - تضمين الـ Provider والـ State

## التخصيص:

لتغيير عدد المحاولات المسموحة، عدّل المتغير `MAX_ATTEMPTS` في `PremiumFeaturesContext.tsx`:

```tsx
const MAX_ATTEMPTS = 2; // غيّر هذا الرقم
```

## الرسائل:

الرسائل تظهر بصيغة الموجة (Toast) وتخبر المستخدم بأن الميزة متاحة في الباقات المدفوعة.
