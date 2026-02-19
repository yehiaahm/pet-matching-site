# 🔧 Debugging HTTP 500 - خطوات عملية

## 🔴 الأعراض

```
❌ صفحة التسجيل تفتح بشكل طبيعي
❌ بعد الضغط على Submit، يظهر: HTTP 500
❌ في الكونسول: "Unexpected end of JSON input"
❌ الموقع لا يدخل للصفحة الرئيسية
```

---

## 🔍 خطوات التشخيص

### الخطوة 1: افتح DevTools

```
Windows/Linux: F12
Mac: Cmd + Option + I
```

### الخطوة 2: اذهب إلى Network Tab

1. انقر على **Network**
2. صحّح الـ Filter ليكون فارغ (لعرض جميع الـ requests)
3. قم بـ Register أو Login

### الخطوة 3: شوف الـ Request

```
[Method]  [URL]               [Status]  [Size]
POST      /api/v1/auth/login  500       ??? 
```

### الخطوة 4: انقر على الـ Request

في الـ popup، شوف:

#### ✅ Headers Tab
```
Request Headers:
  Content-Type: application/json
  Authorization: (هتكون فارغة للـ login)

Response Headers:
  Content-Type: application/json
  Status: 500
```

#### ✅ Response Tab
```
# ستشوف إحدى الحالات:

❌ Response فارغ تماماً
❌ Response مشوه أو text بدل JSON
❌ HTML error page بدل JSON

# الـ Response الصحيح يجب أن يكون:
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {...},
    "accessToken": "..."
  }
}
```

#### ✅ Console Tab
```
# اشوف الـ errors:
Uncaught SyntaxError: Unexpected end of JSON input
  at JSON.parse (line XX)
  
# هذا يعني الـ Response مش JSON صحيح
```

---

## 🧬 أسباب شائعة و الحل

### السبب #1: Server لم يبدأ

```bash
# ❌ If you see this in network tab:
Failed to connect to server
NET::ERR_CONNECTION_REFUSED

# الحل:
npm run dev  # في folder server/
```

### السبب #2: URL خاطئ

```bash
# ❌ Request URL shows:
http://localhost:5000/api/auth/login  # ❌ Missing /v1

# الحل: تأكد أن Frontend يستخدم:
/api/v1/auth/login  # ✅ مع /v1
```

### السبب #3: express.json() Middleware مفقود

```javascript
// ❌ WRONG - في server.js
const app = express();
app.use(routes);  // ❌ express.json() مفقود

// ✅ CORRECT
const app = express();
app.use(express.json());  // ✅ قبل الـ routes
app.use(configureGeneralMiddleware);  // يحتوي على express.json()
app.use(routes);
```

### السبب #4: Response يرجع text بدل JSON

```javascript
// ❌ WRONG
app.post('/auth/login', (req, res) => {
  res.send("Login successful");  // ❌ text بدل JSON
});

// ✅ CORRECT
app.post('/auth/login', (req, res) => {
  res.json({ status: 'success', data: {...} });  // ✅ JSON
});
```

### السبب #5: Error في Database

```javascript
// ❌ Response فارغ
const user = await prisma.user.findUnique({...});
res.json({...});  // ❌ قد يرجع undefined أو error

// ✅ CORRECT - مع error handling
try {
  const user = await prisma.user.findUnique({...});
  if (!user) {
    return res.status(404).json({ status: 'fail', message: 'User not found' });
  }
  res.json({ status: 'success', data: { user } });
} catch (error) {
  res.status(500).json({ status: 'error', message: error.message });
}
```

### السبب #6: Response Handler غير موجود

```javascript
// ❌ WRONG - catchAsync بدون error handler
export const login = catchAsync(async (req, res, next) => {
  const user = await prisma.user.findUnique({...});
  // إذا حصل error، catchAsync سيرسله إلى next()
  // لكن ما في global error handler!
});

// ✅ CORRECT - مع global error handler
app.use(errorHandler);  // بعد جميع الـ routes
```

### السبب #7: Cookie و JWT errors

```javascript
// ❌ WRONG
res.cookie('token', accessToken);
res.json({ token: accessToken });  // ❌ Token في الاثنين

// ✅ CORRECT
res.cookie('accessToken', accessToken, {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: 'strict'
});
res.json({ data: { user, accessToken } });  // ✅ فقط في JSON
```

---

## 📋 Checklist للـ HTTP 500 Fix

### Backend Side

- [ ] `express.json()` موجود قبل الـ routes
- [ ] جميع async routes استخدمت `catchAsync()` wrapper
- [ ] جميع endpoints ترجع `.json()` response
- [ ] Global error handler موجود في النهاية:
  ```javascript
  app.use(notFound);
  app.use(errorHandler);
  ```

### Route Level

- [ ] كل route فيها `try/catch`
- [ ] كل route ترجع `{status, message, data}`
- [ ] Validation يحصل قبل database operations
- [ ] Error messages واضحة

### Middleware

- [ ] Security middleware اول شيء
- [ ] General middleware ثاني (express.json)
- [ ] Routes ثالث
- [ ] Error handlers آخر شيء

### Database

- [ ] Prisma connected (أو running in mock mode)
- [ ] Database schema matches the operations
- [ ] Proper error handling for database errors

### Frontend

- [ ] استخدام `/api/v1/` prefix (مش hardcoded URLs)
- [ ] Response validation قبل استخدام البيانات
- [ ] `.json()` call صحيح
- [ ] Navigation بعد successful login

---

## 🧪 اختبار API مباشرة

### استخدام Postman (الأسهل)

```
1. افتح Postman
2. اضغط (+) أو "New"
3. اختار "HTTP Request"
4. اختار Method: POST
5. أكتب URL: http://localhost:5000/api/v1/auth/login
6. اذهب إلى Body → raw → JSON
7. ضع:
{
  "email": "test@example.com",
  "password": "Test123!@"
}
8. اضغط Send
9. شوف الـ Response
```

### استخدام cURL

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@"}' \
  -v
```

### استخدام Browser Console

```javascript
// في DevTools Console
fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'Test123!@'
  })
})
  .then(res => {
    console.log('Status:', res.status);
    console.log('Headers:', res.headers);
    return res.json();
  })
  .then(data => console.log('Response:', data))
  .catch(err => console.error('Error:', err));
```

---

## 📊 Log Debugging

### في Server Console

```bash
# شوف الـ logs:
🚀 Server running on http://localhost:5000
POST /api/v1/auth/login  # الـ request
✅ User found: test@example.com
✅ Password valid
✅ Tokens generated
Response sent: 200 JSON
```

### في Browser Console (F12)

```javascript
// أضف هذا في Frontend قبل fetch:
console.log('📝 Sending request to:', url);
const response = await fetch(url, options);
console.log('📦 Response status:', response.status);
console.log('📦 Response headers:', response.headers);
const data = await response.json();
console.log('📦 Response data:', data);
```

---

## 🎯 Quick Fix Steps

إذا واجهت HTTP 500:

### Step 1: تأكد من البيانات الصحيحة
```javascript
// تأكد أن الـ request body صحيح
const body = {
  email: "valid@email.com",      // ✅ valid email
  password: "SecurePass123!@"    // ✅ 8+ chars, uppercase, lowercase, number, special
};
```

### Step 2: تأكد من الـ URL صحيح
```
❌ http://localhost:5000/api/auth/login
✅ http://localhost:5000/api/v1/auth/login  (مع /v1)
✅ /api/v1/auth/login  (relative path مع Vite proxy)
```

### Step 3: شوف الـ Server Logs
```bash
# في terminal حيث شغلت npm run dev
# يجب تشوف:
POST /api/v1/auth/login 401  (login failed)
POST /api/v1/auth/login 200  (login success)

# إذا ما شفت أي شيء، ممكن:
# - URL خاطئ
# - Server ما بدأ
```

### Step 4: استخدم Postman للـ test
```
- هذا يستبعد المتغيرات من Frontend
- إذا شتغل في Postman وما شتغل في Frontend، المشكلة في Frontend code
- إذا ما شتغل في Postman، المشكلة في Backend
```

### Step 5: اضف error logging
```javascript
// في authController.js
export const login = catchAsync(async (req, res, next) => {
  console.log('🔍 Login attempt:', { email: req.body.email });
  
  const user = await prisma.user.findUnique({
    where: { email: req.body.email },
  });
  
  console.log('🔍 User found:', !!user);
  
  if (!user) {
    console.log('❌ User not found');
    return next(new AuthenticationError('Invalid email or password'));
  }
  
  console.log('✅ Returning user data');
  sendSuccess(res, 200, 'Login successful', { user, accessToken });
});
```

---

## 🚨 Common Error Messages

| الخطأ | السبب | الحل |
|-------|------|------|
| `Unexpected end of JSON input` | Response فارغ أو text | أضف `console.log(response)` بعد fetch |
| `Cannot read property 'user' of undefined` | `data.data?.user` undefined | شوف الـ response structure |
| `401 Unauthorized` | Invalid credentials | تأكد من email/password |
| `409 Conflict` | User exists | استخدم email جديد |
| `Network error` | Server not running | اشغل `npm run dev` في server folder |
| `CORS error` | Different domain | أضف Vite proxy في vite.config.ts |
| `Cannot POST /api/auth/login` | URL خاطئ | استخدم `/api/v1/auth/login` |

---

## 📞 Support

إذا الـ problem ما اتحل:

1. **Check logs**: شوف الـ console output في server و browser
2. **Use Postman**: test الـ API مباشرة
3. **Verify URLs**: تأكد من الـ routes صحيحة
4. **Check middleware**: تأكد أن express.json() موجود
5. **Database**: تأكد من database connection

---

**آخر تحديث**: يناير 2026
