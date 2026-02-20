# 🚀 دليل النشر على Vercel - خطوة بخطوة

## 📋 الإعدادات المطلوبة

### رابط Backend على Render:
```
https://pet-matching-site.onrender.com
```

---

## ✅ الخطوة 1: التحقق من الملفات المُنشأة

تأكد أن الملفات التالية موجودة في المشروع:

- ✅ `.env.production` - يحتوي على `VITE_API_BASE`
- ✅ `vercel.json` - إعدادات Vercel
- ✅ `src/lib/api.ts` - مُحدّث ليقرأ المتغير
- ✅ `src/services/jwtAuthService.ts` - مُحدّث ليقرأ المتغير

---

## ✅ الخطوة 2: رفع التعديلات على Git

```bash
# في terminal اكتب:
cd "D:\PetMat_Project\Pet Breeding Matchmaking Website (3)"

git add .
git commit -m "Configure frontend for Vercel with Render backend"
git push origin main
```

---

## ✅ الخطوة 3: النشر على Vercel (3 طرق)

### الطريقة الأولى: من Dashboard (الأسهل) 🟢

1. اذهب إلى: https://vercel.com/dashboard
2. اضغط **"Add New..."** → **"Project"**
3. اختر repository الخاص بك من GitHub/GitLab/Bitbucket
4. Vercel سيكتشف تلقائياً أنه Vite project

### في **Build & Development Settings**:
```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### في **Environment Variables** (مهم جداً! ⚠️):
أضف المتغير التالي:

| Key | Value | Environment |
|-----|-------|-------------|
| `VITE_API_BASE` | `https://pet-matching-site.onrender.com/api/v1` | Production |

5. اضغط **"Deploy"**
6. انتظر 2-3 دقائق حتى ينتهي البناء

---

### الطريقة الثانية: من الـ Terminal (للمحترفين) 🔵

```bash
# 1. تثبيت Vercel CLI
npm install -g vercel

# 2. تسجيل الدخول
vercel login

# 3. النشر
vercel --prod

# سيسألك أسئلة، اختر:
# - Set up and deploy: Yes
# - Which scope: اختر حسابك
# - Link to existing project: No (إذا أول مرة)
# - Project name: petmat-frontend (أو أي اسم)
# - Directory: ./ (اضغط Enter)
# - Override settings: No (اضغط Enter)
```

---

### الطريقة الثالثة: Auto-deploy من Git (موصى به للمستقبل) 🟡

1. بعد النشر أول مرة، اذهب إلى **Project Settings** في Vercel
2. في قسم **Git**، فعّل **"Auto-deploy on push"**
3. الآن كل مرة تعمل `git push`، Vercel سينشر تلقائياً!

---

## ✅ الخطوة 4: إضافة Environment Variables على Vercel

### إذا نسيت إضافتها أثناء النشر:

1. اذهب إلى: https://vercel.com/dashboard
2. اختر مشروعك
3. اضغط **"Settings"** → **"Environment Variables"**
4. أضف:

```
Key:   VITE_API_BASE
Value: https://pet-matching-site.onrender.com/api/v1
Environments: ✅ Production, ✅ Preview
```

5. اضغط **"Save"**
6. **مهم:** اعمل Redeploy للمشروع:
   - اذهب لـ **"Deployments"**
   - اختر آخر deployment
   - اضغط **"..."** → **"Redeploy"**

---

## ✅ الخطوة 5: تحديث CORS على Render Backend

مهم جداً! Backend يجب يسمح بالطلبات من Vercel:

1. اذهب إلى: https://dashboard.render.com
2. اختر خدمة `pet-matching-site`
3. اذهب لـ **"Environment"**
4. عدّل أو أضف:

```
CORS_ORIGIN=https://your-vercel-app.vercel.app,https://pet-matching-site.onrender.com
```

أو استخدم wildcard (للتطوير):
```
CORS_ORIGIN=*
```

5. احفظ و Backend سيعمل restart تلقائي

---

## ✅ الخطوة 6: الاختبار

### 1. افتح موقع Vercel
```
https://your-vercel-app.vercel.app
```

### 2. افتح Developer Console (F12)
ابحث عن:
```
✅ Using API from VITE_API_BASE: https://pet-matching-site.onrender.com/api/v1
```

### 3. اختبر API request
في Console اكتب:
```javascript
fetch('https://pet-matching-site.onrender.com/api/v1/health')
  .then(r => r.json())
  .then(data => console.log('✅ Backend connected!', data))
  .catch(err => console.error('❌ Error:', err))
```

---

## 🔧 حل المشاكل الشائعة

### المشكلة: "Network Error" أو "CORS blocked"
**الحل:**
1. تأكد أن `CORS_ORIGIN` على Render يشمل رابط Vercel
2. تأكد أن Backend شغال (اذهب لـ https://pet-matching-site.onrender.com/api/v1/health)

### المشكلة: "Cannot connect to backend"
**الحل:**
1. تحقق من `VITE_API_BASE` على Vercel:
   - Dashboard → Project → Settings → Environment Variables
2. تأكد أن القيمة: `https://pet-matching-site.onrender.com/api/v1`
3. اعمل Redeploy

### المشكلة: Build fails على Vercel
**الحل:**
```bash
# اختبر محلياً أولاً:
npm run build

# إذا فشل، صلح الأخطاء ثم:
git add .
git commit -m "Fix build errors"
git push
```

### المشكلة: Environment variable لا تعمل
**الحل:**
1. تأكد أن المتغير يبدأ بـ `VITE_` (مهم جداً!)
2. اعمل **Redeploy** بعد إضافة المتغير
3. تحقق في Console: `console.log(import.meta.env.VITE_API_BASE)`

---

## 📊 Checklist النهائي

قبل ما تنشر، تأكد من:

- [ ] `.env.production` موجود و فيه `VITE_API_BASE`
- [ ] `vercel.json` موجود
- [ ] `git push` تم بنجاح
- [ ] Environment Variables مضافة على Vercel
- [ ] CORS مضبوط على Render Backend
- [ ] Backend شغال على Render
- [ ] Build محلي ينجح (`npm run build`)

---

## 🎉 Expected Result

بعد النشر، يجب تشوف:

✅ Frontend يفتح على: https://your-app.vercel.app
✅ API requests تروح لـ: https://pet-matching-site.onrender.com/api/v1
✅ Login و Registration يشتغلوا بدون مشاكل
✅ جميع الـ API calls تنجح

---

## 📞 للمساعدة

إذا واجهت مشاكل:

1. افتح Console (F12) → Network tab
2. شوف أي request فاشل
3. تحقق من الـ URL المستخدم
4. تأكد أنه بيروح لـ Render مش localhost

---

**Good Luck! 🚀**
