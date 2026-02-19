# 🎨 دليل تخصيص مكونات وضوح الصفحة الرئيسية

## 📝 جدول المحتويات
1. [تخصيص النصوص](#تخصيص-النصوص)
2. [تغيير الألوان](#تغيير-الألوان)
3. [إضافة البيانات الحقيقية](#إضافة-البيانات-الحقيقية)
4. [تحرير القصص والأمثلة](#تحرير-القصص-والأمثلة)
5. [تحديث الإحصائيات](#تحديث-الإحصائيات)

---

## 🔤 تخصيص النصوص

### تخصيص عناوين MainBenefits

```tsx
// في MainBenefits.tsx، ابحث عن:
const benefits = [
  {
    icon: <Wand2 className="w-6 h-6" />,
    titleAr: 'مطابقات مثالية',  // غيّر هنا
    titleEn: 'Perfect Matches',   // وهنا
    descAr: 'الخوارزمية الذكية تجد الحيوان الأمثل لك',
    descEn: 'Smart algorithm finds your perfect pet',
    color: 'from-purple-400 to-purple-600'
  },
  // ... بقية المزايا
];
```

### تخصيص خطوات ClearStepGuide

```tsx
// في ClearStepGuide.tsx:
const steps = [
  {
    number: 1,
    titleAr: 'التسجيل',        // غيّر العنوان
    descAr: 'أنشئ حسابك بسهولة',  // غيّر الوصف
    timeAr: '30 ثانية',           // غيّر الوقت
    icon: <UserPlus className="w-6 h-6" />,
    color: 'from-blue-400 to-blue-600'
  },
  // ...
];
```

### تخصيص الأسئلة الشائعة

```tsx
// في FAQSection.tsx:
const faqAr = [
  {
    id: '1',
    q: 'هل PetMate حقاً مجاني؟',        // غيّر السؤال
    a: 'نعم! التسجيل والبحث مجاني 100%'  // غيّر الجواب
  },
  // ...
];
```

---

## 🎨 تغيير الألوان

### تغيير ألوان Gradient

```tsx
// البحث عن gradient من هذا الشكل:
className="bg-gradient-to-r from-blue-600 to-green-600"

// وتغييره إلى:
className="bg-gradient-to-r from-purple-600 to-pink-600"

// الألوان المتوفرة:
// - blue, green, purple, pink, orange, red, yellow, indigo
// - الأرقام: 400 (فاتح), 600 (عادي), 700 (غامق)
```

### تغيير ألوان الخلفية

```tsx
// قبل:
className="bg-gradient-to-b from-white to-gray-50"

// بعد:
className="bg-gradient-to-b from-white to-blue-50"
```

### تغيير ألوان الأيقونات

```tsx
// في بطاقات المزايا:
<div className="inline-flex p-4 rounded-xl bg-gradient-to-r from-blue-400 to-blue-600">
  {/* يمكن تغيير blue إلى purple, pink, green, etc. */}
</div>
```

---

## 💾 إضافة البيانات الحقيقية

### استبدال البيانات الثابتة بـ API

#### مثال: إحصائيات حقيقية في TrustAndSafety

```tsx
// الطريقة الحالية (بيانات ثابتة):
{[
  { number: '5,234', labelAr: 'مستخدم موثوق', labelEn: 'Verified Users', icon: '👥' },
  // ...
]}

// الطريقة الجديدة (بيانات من API):
import { useState, useEffect } from 'react';

export function TrustAndSafety() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // جلب الإحصائيات من API
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  if (!stats) return <div>جاري التحميل...</div>;

  return (
    <div>
      {[
        { number: stats.verified_users.toString(), labelAr: 'مستخدم موثوق', ... },
        { number: stats.successful_matches.toString(), labelAr: 'عملية نجحت', ... },
        { number: stats.satisfaction_rate + '%', labelAr: 'رضا العملاء', ... }
      ]}
    </div>
  );
}
```

### استبدال القصص المثالية بقصص حقيقية

```tsx
// في RealExamples.tsx:
import { useState, useEffect } from 'react';

export function RealExamples() {
  const [examples, setExamples] = useState([]);

  useEffect(() => {
    // جلب قصص النجاح من قاعدة البيانات
    fetch('/api/success-stories?limit=6')
      .then(res => res.json())
      .then(data => setExamples(data));
  }, []);

  return (
    <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {examples.map((story) => (
        <motion.div key={story.id} className="rounded-2xl p-6 bg-white border border-gray-200">
          <img 
            src={story.user_image} 
            alt={story.user_name}
            className="w-20 h-20 rounded-full object-cover mb-4"
          />
          <h4 className="font-bold text-gray-900">{story.user_name}</h4>
          <p className="text-sm text-gray-600 mb-2">{story.pet_info}</p>
          <p className="text-blue-600 font-semibold">{story.success_message}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
```

---

## ✏️ تحرير القصص والأمثلة

### تحديث ملف شخصي واحد

```tsx
// البحث عن هذا في RealExamples.tsx:
const examples = [
  {
    id: 1,
    name: 'أم سارة',
    pet: 'كلبة جولدن 3 سنوات',
    location: 'الرياض',
    rating: 4.9,
    reviews: 23,
    story: 'وجدت كلبتي الأصيلة في يومين فقط!',
    badges: ['Verified', 'Featured'],
    image: '/images/user-1.jpg'
  },
  // ... المزيد
];

// تحديثه بـ:
{
  id: 1,
  name: 'اسم جديد',           // غيّر الاسم
  pet: 'نوع حيوان جديد',       // غيّر الحيوان
  location: 'مدينة جديدة',      // غيّر الموقع
  rating: 4.8,                // غيّر التقييم
  reviews: 45,                // غيّر عدد التعليقات
  story: 'قصة نجاح جديدة',      // غيّر القصة
  badges: ['Verified', 'Premium'],  // غيّر الشارات
  image: '/images/new-user.jpg'     // غيّر الصورة
}
```

---

## 📊 تحديث الإحصائيات

### تحديث أرقام MainBenefits

```tsx
// في MainBenefits.tsx، ابحث عن:
const stats = [
  { number: '5,234', labelAr: 'مستخدم فعال' },
  { number: '8,912', labelAr: 'عملية نجحت' },
  { number: '2.3', labelAr: 'أيام متوسط الوقت' },
  { number: '98%', labelAr: 'رضا العملاء' }
];

// وحدّث الأرقام الجديدة:
const stats = [
  { number: '10,000', labelAr: 'مستخدم فعال' },  // رقم جديد
  { number: '20,000', labelAr: 'عملية نجحت' },   // رقم جديد
  { number: '1.8', labelAr: 'أيام متوسط الوقت' }, // رقم جديد
  { number: '99%', labelAr: 'رضا العملاء' }      // رقم جديد
];
```

### تحديث أوقات الخطوات

```tsx
// في ClearStepGuide.tsx:
const steps = [
  {
    number: 1,
    titleAr: 'التسجيل',
    timeAr: '30 ثانية',      // غيّر إلى '1 دقيقة' إذا لزم
    minutesAr: 0.5,
    // ...
  },
  {
    number: 2,
    titleAr: 'إضافة الحيوان',
    timeAr: '2-3 دقائق',     // غيّر إذا لزم
    minutesAr: 2.5,
    // ...
  }
];
```

---

## 🎥 تخصيص الفيديو

### تحديث نص الفيديو التوضيحي

```tsx
// في AIVideoGuide.tsx:
const videoSteps = [
  {
    time: '0:00',
    titleAr: 'مرحباً بك في PetMate',      // غيّر
    descAr: 'اكتشف كيف تجد حيوانك الأليف',  // غيّر
    titleEn: 'Welcome to PetMate',          // غيّر
    descEn: 'Discover how to find your pet'  // غيّر
  },
  // ... بقية الخطوات
];
```

### استبدال الفيديو الوهمي بفيديو حقيقي

```tsx
// البحث عن هذا:
<div className="relative w-full bg-gray-900 rounded-xl overflow-hidden">
  <div className="absolute inset-0 flex items-center justify-center">
    {/* فيديو وهمي */}
  </div>
</div>

// واستبدله بـ:
<video
  controls
  poster="/images/video-poster.jpg"
  className="w-full rounded-xl"
>
  <source src="/videos/petmate-guide.mp4" type="video/mp4" />
  البراوزر لا يدعم الفيديو
</video>
```

---

## 🔧 أمثلة عملية شاملة

### مثال 1: تخصيص كامل MainBenefits

```tsx
// src/app/components/MainBenefits.tsx
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export function MainBenefits() {
  const { language } = useLanguage();

  const benefits = [
    {
      icon: '🎯',  // استخدم emoji بدل Icon component
      titleAr: 'مطابقات مثالية',
      titleEn: 'Perfect Matches',
      descAr: 'الخوارزمية الذكية تجد الحيوان الأمثل',
      descEn: 'Smart algorithm finds the best pet for you'
    },
    // ... 5 مزايا أخرى
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">
          {language === 'ar' ? 'مزايا PetMate' : 'PetMate Benefits'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, idx) => (
            <motion.div
              key={idx}
              className="p-6 bg-white rounded-xl border border-gray-200"
            >
              <div className="text-4xl mb-4">{benefit.icon}</div>
              <h3 className="font-bold text-lg mb-2">
                {language === 'ar' ? benefit.titleAr : benefit.titleEn}
              </h3>
              <p className="text-gray-600 text-sm">
                {language === 'ar' ? benefit.descAr : benefit.descEn}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### مثال 2: تحديث الأسئلة الشائعة ديناميكياً

```tsx
// تحديث FAQSection.tsx لتحميل الأسئلة من API
import { useEffect, useState } from 'react';

export function FAQSection() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // جلب الأسئلة من خادم API
    fetch('/api/faqs')
      .then(res => res.json())
      .then(data => {
        setFaqs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('خطأ في تحميل الأسئلة:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-10">جاري التحميل...</div>;

  return (
    <section className="py-20">
      {faqs.map(faq => (
        <FAQItem key={faq.id} question={faq.question} answer={faq.answer} />
      ))}
    </section>
  );
}
```

---

## 📋 قائمة التحقق للتخصيص

- [ ] تحديث جميع النصوص بلغتك المحلية
- [ ] تغيير الألوان لتطابق هويتك البصرية
- [ ] إضافة شعارك بدل صور الموقع
- [ ] تحديث الإحصائيات بأرقام حقيقية
- [ ] إضافة قصص نجاح حقيقية من مستخدميك
- [ ] تحديث روابط الأزرار للعمل مع نظامك
- [ ] اختبار على أجهزة مختلفة (موبايل، تابلت، ديسكتوب)
- [ ] التحقق من أن النصوص باللغة الصحيحة
- [ ] اختبار الحركات والتأثيرات
- [ ] التأكد من أن جميع الصور تحمل بسرعة

---

## 🚀 نصائح للأداء الأفضل

### استخدام صور محسّنة
```tsx
// بدل:
<img src="/images/user.jpg" />

// استخدم:
<img 
  src="/images/user-small.jpg" 
  srcSet="/images/user-small.jpg 480w, /images/user-large.jpg 1920w"
  sizes="(max-width: 640px) 100px, 200px"
  loading="lazy"
  alt="User profile"
/>
```

### تأخير تحميل الفيديو
```tsx
// استخدم Intersection Observer لتحميل الفيديو عند الوصول إليه
useEffect(() => {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // حمّل الفيديو هنا
      }
    });
  });
  observer.observe(videoRef.current);
}, []);
```

---

## 🆘 حل المشاكل الشائعة

### مشكلة: النصوص العربية معكوسة
```tsx
// تأكد من وجود:
className={direction === 'rtl' ? 'rtl' : 'ltr'}

// وأن useLanguage يرجع direction الصحيح
```

### مشكلة: الحركات بطيئة
```tsx
// قلل عدد الحركات أو استخدم:
transition={{ duration: 0.3 }}  // بدل 0.6
```

### مشكلة: الصور لا تظهر
```tsx
// تأكد من المسار الصحيح:
/public/images/image.jpg  // صحيح
./images/image.jpg         // خطأ
```

---

**آخر تحديث**: 2024  
**الإصدار**: 1.0
