# ⚡ Vercel Deployment - Quick Steps

## 🎯 السريع والمختصر

### 1️⃣ Environment Variable على Vercel
```
Key:   VITE_API_BASE
Value: https://pet-matching-site.onrender.com/api/v1
```

### 2️⃣ CORS على Render Backend
```
CORS_ORIGIN=https://your-vercel-app.vercel.app
أو
CORS_ORIGIN=*
```

### 3️⃣ Git Push
```bash
git add .
git commit -m "Configure for Vercel"
git push
```

### 4️⃣ Deploy على Vercel
```bash
# الطريقة الأولى: Dashboard
https://vercel.com/new

# الطريقة الثانية: CLI
npm i -g vercel
vercel --prod
```

### 5️⃣ اختبار
```
Frontend: https://your-app.vercel.app
Backend:  https://pet-matching-site.onrender.com/api/v1/health
```

---

## 🔍 Quick Debug

```javascript
// في Console (F12):
console.log('API Base:', import.meta.env.VITE_API_BASE)

// اختبار API:
fetch('https://pet-matching-site.onrender.com/api/v1/health')
  .then(r => r.json())
  .then(console.log)
```

---

**للتفاصيل الكاملة:** اقرأ `VERCEL_DEPLOYMENT_GUIDE.md`
