# 🚀 تشغيل الموقع بأمر واحد

## الطريقة الأسهل - نقرة واحدة!

### على Windows:
اضغط مرتين على `START_ALL.bat`

أو في PowerShell:
```powershell
.\START_ALL.ps1
```

أو في Command Prompt:
```cmd
START_ALL.bat
```

### على Mac/Linux:
```bash
chmod +x START_ALL.sh
./START_ALL.sh
```

---

## النتيجة المتوقعة:

سيتم فتح **نافذتا Terminal** جديدتان:

1. **نافذة 1: Backend Server**
   ```
   Server running on http://localhost:5000
   Connected to database ✓
   ```

2. **نافذة 2: Frontend Development Server**
   ```
   VITE v5.0.0 ready in XXX ms
   
   ➜ Local: http://localhost:5173/
   ➜ Network: use --host to access
   ```

---

## فتح الموقع:

افتح المتصفح وروح إلى:
```
http://localhost:5173
```

---

## إيقاف الخوادم:

في أي نافذة اضغط: **Ctrl + C**

---

## الخيارات الأخرى:

### تشغيل Frontend فقط:
```bash
npm run dev
```

### تشغيل Backend فقط:
```bash
npm run backend
```

### تشغيل كلاهما معاً (في نفس النافذة):
```bash
npm run dev:all
```
(يحتاج تثبيت `concurrently` أولاً: `npm install --save-dev concurrently`)

---

## المتطلبات:

✅ Node.js 18+ مثبت
✅ PostgreSQL شغّال (محلي أو اونلاين)
✅ npm نسخة حديثة

---

## الأخطاء الشائعة:

### ❌ "Cannot find module"
```bash
cd server
npm install
cd ..
npm install
```

### ❌ "Database connection refused"
تأكد من أن PostgreSQL شغّال ودرّب نقطة الاتصال في `server/.env`

### ❌ "Port 5000 already in use"
قرّب أي تطبيق آخر يستخدم البورت أو غيّره في `server/.env`

---

**تشغيل سهل وسريع!** 🎉
