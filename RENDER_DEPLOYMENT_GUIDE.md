# Render Deployment Guide - PetMat Backend

## 🚀 نشر على Render

هذا الدليل يشرح كيفية نشر تطبيق PetMat على Render بدون أخطاء `ERR_MODULE_NOT_FOUND`.

---

## الخطوة 1: إعدادات Render

### 1.1 إنشاء خدمة جديدة
1. أذهب إلى [render.com](https://render.com)
2. اضغط **New** → **Web Service**
3. اختر repository الخاص بك (وصل GitHub إذا لم تفعل)

### 1.2 إعدادات الخدمة

| الخاصية | القيمة | الملاحظات |
|---------|--------|---------|
| **Name** | `petmat-backend` | أي اسم تفضله |
| **Environment** | `Node` | |
| **Region** | اختر الأقرب | مثلاً: Singapore أو EU |
| **Branch** | `main` | أو أي branch تستخدمه |
| **Build Command** | `cd server && npm install && npm run postinstall` | ⚠️ مهم جداً |
| **Start Command** | `cd server && npm start` | يشغل `node index.js` |
| **Instance Type** | `Starter` أو `Standard` | ابدأ بـ Starter |

---

## الخطوة 2: متغيرات البيئة (Environment Variables)

ضيف هذه المتغيرات في صفحة **Environment** على Render:

### مطلوبة **ضروري** ⚠️

```plaintext
NODE_ENV=production

# قاعدة البيانات (PostgreSQL علي Render أو خارجها)
DATABASE_URL=postgresql://user:password@host:5432/database_name

# JWT Secrets
JWT_SECRET=your_very_long_random_secret_key_here_min_32_chars
JWT_REFRESH_SECRET=another_very_long_random_secret_key_here_min_32_chars

# API Port
PORT=10000
HOST=0.0.0.0

# CORS
CORS_ORIGIN=*

# Email (اختياري لكن موصى به)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=noreply@petmat.com
```

### اختياري (جودة/ميزات إضافية)

```plaintext
# Logging
LOG_LEVEL=info

# API Version
API_VERSION=v1
API_PREFIX=/api

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=1000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your_session_secret_here
```

---

## الخطوة 3: قاعدة البيانات

### الخيار أ: استخدم PostgreSQL من Render (الأسهل)

1. في صفحة الخدمة → **External Render-Managed Database**
2. اختر **PostgreSQL**
3. اختر نفس Region
4. Render سيعطيك `DATABASE_URL` تلقائياً

### الخيار ب: قاعدة بيانات خارجية

1. استخدم قاعدتك (مثلاً AWS RDS أو ElephantSQL)
2. انسخ connection string لـ `DATABASE_URL`
3. تأكد أن firewall يسمح بـ Render IPs

---

## الخطوة 4: تشغيل Migrations

بعد الـ deploy الأول، شغل migrations:

```bash
# من خط الأوامر أثناء SSH إلى Render
cd server
npx prisma migrate deploy
# أو إذا لم تكن migrations موجودة:
npx prisma db push
```

---

## 🔧 المشاكل الشائعة والحلول

### المشكلة: `ERR_MODULE_NOT_FOUND`
**السبب:** missing `.js` extensions أو case-sensitive paths
**الحل:** تم إصلاحه بالفعل في:
- ✅ جميع local imports منتهية بـ `.js`
- ✅ entry point هو `index.js` (يستدعي `server.js`)
- ✅ package.json يستخدم `"type": "module"`

### المشكلة: `PORT already in use`
**الحل:** ملف startup script يقرأ `process.env.PORT` وفالبديل هو 5000
```javascript
const PORT = process.env.PORT || 5000;
```

### المشكلة: `CORS blocked`
**الحل:** تم ضبط CORS على:
```javascript
app.use(cors({ origin: '*' }));
```
يمكن تضييقها لاحقاً بإضافة `CORS_ORIGIN` في environment

### المشكلة: `DATABASE connection refused`
**الحل:**
1. تأكد أن `DATABASE_URL` محفوظة بشكل صحيح في Render
2. تحقق من firewall rules بقاعدة البيانات
3. جرّب connection string محلياً أولاً

### المشكلة: `Prisma generate failed`
**الحل:** تتم تلقائياً في `postinstall` script:
```json
"postinstall": "prisma generate"
```

---

## 📊 التحقق من الـ Deploy

### 1. تحقق من logs على Render:
```
✅ Server running in production mode
📡 Listening on 0.0.0.0:10000
✅ Database connected successfully
```

### 2. اختبر health check:
```bash
curl https://your-render-url.onrender.com/api/v1/health
```

### 3. اختبر API endpoint:
```bash
curl https://your-render-url.onrender.com/api/v1
```

---

## 🌐 ربط الـ Frontend

### ملف `vite.config.ts` أو `vite.config.mjs`:

```typescript
// Development
VITE_API_BASE=http://localhost:5000/api/v1

// Render Production (محلياً أو env)
VITE_API_BASE=https://your-render-url.onrender.com/api/v1
```

### أو بشكل ديناميكي في `src/lib/api.ts`:
```typescript
export const getApiBaseUrl = (): string => {
  const envApiBase = import.meta.env.VITE_API_BASE;
  if (envApiBase) return envApiBase;
  
  if (import.meta.env.DEV) {
    return 'http://localhost:5000/api/v1';
  }
  
  // Production: استخدم origin حالي
  if (typeof window !== 'undefined') {
    return window.location.origin + '/api/v1';
  }
  
  return '/api/v1';
};
```

---

## 🔐 في الإنتاج (Production Checklist)

- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` و `JWT_REFRESH_SECRET` قويين (min 32 char)
- [ ] `DATABASE_URL` موجود وصحيح
- [ ] `PORT` و `HOST` مضبوطين (لا تستخدم localhost)
- [ ] CORS مضبوطة بشكل آمن
- [ ] migrations تمت بنجاح
- [ ] SSL/TLS مفعل (تلقائي على Render)
- [ ] Rate limiting مفعل
- [ ] Logging يعمل

---

## 📝 ملاحظات مهمة

1. **لا تنسى:/** Build command في Render يجب يكون `cd server && npm install && npm run postinstall`
2. **Start command:** يجب يكون `cd server && npm start`
3. **Node Version:** تأكد أن Node >= 18.0.0 (افتراضي على Render)
4. **Build timeout:** الـ default 30 دقيقة كافي
5. **Auto-deploy:** فعّل auto-deploy من GitHub

---

## 🚀 نصيحة: ملف `render.yaml` (اختياري)

يمكنك إنشاء ملف `render.yaml` في root المشروع لأتمتة الإعدادات:

```yaml
services:
  - type: web
    name: petmat-backend
    env: node
    plan: starter
    buildCommand: cd server && npm install && npm run postinstall
    startCommand: cd server && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        scope: backend
      - key: JWT_SECRET
        scope: backend
      - key: JWT_REFRESH_SECRET
        scope: backend
```

---

## 📞 دعم / مشاكل؟

إذا واجهت مشاكل:

1. تحقق من logs في Render dashboard
2. تأكد أن البيئة تطابق ملف `.env.example`
3. جرّب run محلياً: `cd server && npm start`
4. تحقق من firewall/networking

---

**Happy Deploying! 🎉**
