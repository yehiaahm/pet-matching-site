# ✅ HTTP 500 Fix - Starting Guide

## 📋 ما تم إصلاحه

### 1. Server.js - تنظيف الـ Routes ✅
- ✅ تم إزالة Dual Routes `/api/auth` و `/api/v1/auth`
- ✅ جميع الـ Routes الآن تحت `/api/v1/*` فقط
- ✅ Middleware موجود بترتيب صحيح

### 2. Auth Controller - Error Handling ✅
- ✅ جميع async functions استخدمت `catchAsync()` wrapper
- ✅ Response format موحد: `{status, message, data}`
- ✅ Global error handler في النهاية

### 3. Frontend URLs - Fixed ✅
- ✅ تم استخدام relative paths: `/api/v1/auth/login`
- ✅ لا hardcoded URLs
- ✅ Vite proxy configured

### 4. Router Setup - Fixed ✅
- ✅ BrowserRouter wrapped App
- ✅ Navigation added after login
- ✅ Response validation added

---

## 🚀 الـ Setup اللازم

### Backend Setup

#### 1. تثبيت Dependencies
```bash
cd server
npm install
```

#### 2. إعداد Database

**Option A: استخدام Docker** (الأسهل)
```bash
# في server folder
docker-compose up -d

# تحقق من running container:
docker ps
```

**Option B: استخدام Local Database**
```bash
# إذا عندك PostgreSQL مثبت locally:
# تأكد من الاتصال في .env:
DATABASE_URL="postgresql://user:password@localhost:5432/petmate_db"
```

#### 3. تشغيل Server
```bash
npm run dev

# يجب تشوف:
🚀 Server running in development mode
📡 Listening on http://localhost:5000
```

### Frontend Setup

#### 1. تثبيت Dependencies
```bash
cd ../  # back to root
npm install
```

#### 2. تشغيل Dev Server
```bash
npm run dev

# يجب تشوف:
➜  Local:   http://localhost:5173/
```

---

## 🧪 الاختبار

### Test 1: API Direct Test (Postman)

```
POST http://localhost:5000/api/v1/auth/register

Body:
{
  "email": "test@example.com",
  "password": "Test123!@",
  "firstName": "Ahmed",
  "lastName": "Ali"
}

Expected Response:
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {...},
    "accessToken": "..."
  }
}
```

### Test 2: Browser Test

```
1. افتح http://localhost:5173
2. انقر على Register
3. ملأ الـ form:
   - Email: test@example.com
   - Password: Test123!@
   - First Name: Ahmed
   - Last Name: Ali
4. اضغط Register
5. يجب أن تُرى الصفحة الرئيسية (/)

Expected:
✅ ريدايركت إلى الصفحة الرئيسية
✅ User name في الـ navigation
✅ Logout button موجود
```

### Test 3: Network Debugging

```
1. اضغط F12 → Network
2. Filter: XHR (API requests فقط)
3. اضغط Register أو Login
4. شوف الـ request:
   - URL: /api/v1/auth/register (✅)
   - Method: POST (✅)
   - Status: 201 (✅)
   - Response: JSON valid (✅)
```

---

## 📁 File Structure للـ Backend

```
server/
├── server.js                    ✅ Main entry point
├── config/
│   ├── index.js                ✅ Configuration
│   ├── logger.js               ✅ Logging setup
│   └── prisma.js               ✅ Prisma client
├── controllers/
│   ├── authController.js       ✅ Auth logic
│   └── ...otherControllers
├── middleware/
│   ├── errorHandler.js         ✅ Global error handler
│   ├── auth.js                 ✅ JWT verification
│   ├── security.js             ✅ CORS, express.json()
│   ├── validation.js           ✅ Input validation
│   └── admin.js                ✅ Admin protection
├── routes/
│   ├── index.js                ✅ Route mounting
│   ├── authRoutes.js           ✅ Auth routes
│   └── ...otherRoutes
├── utils/
│   ├── response.js             ✅ sendSuccess, sendError
│   ├── errors.js               ✅ Custom error classes
│   ├── jwt.js                  ✅ Token generation
│   └── encryption.js           ✅ Password hashing
├── prisma/
│   └── schema.prisma           ✅ Database schema
└── package.json                ✅ Dependencies
```

---

## 📁 File Structure للـ Frontend

```
src/
├── main.tsx                    ✅ Entry point + BrowserRouter
├── app/
│   ├── App.tsx                 ✅ Main app with routes
│   ├── components/
│   │   ├── AuthPage.tsx        ✅ Login/Register fixed
│   │   ├── Dashboard.tsx       ✅ Home page
│   │   └── ...otherComponents
│   ├── context/
│   │   └── AuthContext.tsx     ✅ Auth state management
│   ├── hooks/
│   │   └── useAuth.ts          ✅ Auth hook
│   └── styles/
│       └── ...
├── utils/
│   ├── api.ts                  ✅ API helper functions
│   └── ...
├── vite.config.ts              ✅ Proxy configured
└── package.json                ✅ Dependencies
```

---

## 🔧 الـ Environment Variables

### Backend (.env)
```env
# Server
NODE_ENV=development
SERVER_HOST=localhost
SERVER_PORT=5000

# JWT
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_EXPIRES_IN=15m

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/petmate_db"

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

---

## ⚙️ Configuration Files

### vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
```

### server/middleware/security.js
```javascript
export const configureGeneralMiddleware = (app) => {
  // ✅ express.json() is called here
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // ... other middleware
};
```

### server/middleware/errorHandler.js
```javascript
export const errorHandler = (err, req, res, next) => {
  // ✅ This catches all errors
  logger.error(err);
  sendErrorResponse(err, res);
};

export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);  // ✅ Catches async errors
  };
};
```

---

## 🎯 الـ Flow من البداية

### Registration Flow
```
User -> AuthPage.tsx
   ↓
form.handleSubmit()
   ↓
fetch('/api/v1/auth/register')
   ↓
Server:
   - Validate input ✅
   - Check if user exists ✅
   - Hash password ✅
   - Create user ✅
   - Generate tokens ✅
   - Return: {status, data: {user, accessToken}} ✅
   ↓
Frontend:
   - Receive response ✅
   - Validate response ✅
   - Call login() ✅
   - Save to localStorage ✅
   - navigate('/') ✅
   ↓
User -> Dashboard
```

### Login Flow
```
User -> AuthPage.tsx
   ↓
form.handleSubmit()
   ↓
fetch('/api/v1/auth/login')
   ↓
Server:
   - Validate input ✅
   - Find user ✅
   - Check password ✅
   - Generate tokens ✅
   - Return: {status, data: {user, accessToken}} ✅
   ↓
Frontend:
   - Receive response ✅
   - Validate response ✅
   - Call login() ✅
   - Save to localStorage ✅
   - navigate('/') ✅
   ↓
User -> Dashboard
```

---

## 🐛 Troubleshooting

| المشكلة | الحل |
|--------|------|
| Network error | شوف: `npm run dev` في server folder |
| HTTP 500 | اتبع HTTP_500_DEBUG_STEPS.md |
| User stays on /register | تأكد من navigate('/') في AuthPage.tsx |
| CORS error | تأكد من Vite proxy في vite.config.ts |
| Unexpected end of JSON | شوف الـ response format في server |
| Invalid token | تأكد من JWT_SECRET متطابق |

---

## 📊 Verification Checklist

### Backend
- [ ] Server starts without errors
- [ ] Database connected (or mock mode active)
- [ ] `npm run dev` shows: "🚀 Server running"
- [ ] API responds to Postman requests
- [ ] Response format is valid JSON

### Frontend
- [ ] `npm run dev` starts without errors
- [ ] Vite proxy is configured
- [ ] AuthPage loads
- [ ] Can type email and password
- [ ] Register/Login buttons work

### Integration
- [ ] Registration successful redirects to /
- [ ] Login successful redirects to /
- [ ] User info displays in navigation
- [ ] Logout clears auth state
- [ ] Refresh page keeps session

---

## 🎓 Learning Resources

### Understanding the Flow
- [HTTP Requests](HTTP_500_DEBUG_STEPS.md)
- [API Routes](API_ROUTES_REFERENCE.md)
- [Error Handling](HTTP_500_FIX_GUIDE.md)

### Testing
- [Postman Tutorial](https://learning.postman.com/)
- [cURL Examples](https://curl.se/docs/manual.html)
- [DevTools Guide](https://developer.chrome.com/docs/devtools/)

---

## 📞 Common Questions

### Q: كيف أعرف إذا Server يعمل بشكل صحيح؟
**A:** اضغط على هذا الـ link في الـ browser: `http://localhost:5000/api/v1/health`

يجب ترى:
```json
{
  "status": "success",
  "message": "Health check passed",
  "data": {
    "uptime": 123.456,
    "timestamp": "2024-01-16T10:30:00Z"
  }
}
```

### Q: كيف أعرف إذا Frontend متصل مع Backend؟
**A:** في DevTools Console:
```javascript
fetch('/api/v1/health')
  .then(res => res.json())
  .then(data => console.log(data))
```

يجب تشوف الـ health data في console.

### Q: كيف أعرف إذا JWT tokens تعمل؟
**A:** بعد Login، في localStorage:
```javascript
// في DevTools Console:
console.log(localStorage.getItem('accessToken'))
// يجب تشوف: eyJhbGc... (JWT token)
```

---

## 🎬 Next Steps

1. ✅ **تشغيل Backend**: `cd server && npm run dev`
2. ✅ **تشغيل Frontend**: `npm run dev`
3. ✅ **فتح Browser**: `http://localhost:5173`
4. ✅ **Test Registration**: Email + Password + Submit
5. ✅ **Verify**: Should redirect to `/` and show dashboard

---

**آخر تحديث**: يناير 2026
**Status**: ✅ READY FOR TESTING
