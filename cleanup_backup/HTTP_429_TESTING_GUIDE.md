# 🧪 HTTP 429 Fix - Testing Guide

## التحضيرات

### الخطوة 1: تأكد أن السيرفر مُعاد تشغيله

```bash
# Terminal 1 - Backend
cd d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\server
npm run dev

# يجب أن تراى هذه الرسائل:
# ✅ Express server running on port 5000
# ✅ Database connection...
# ✅ Rate limiting configured
```

### الخطوة 2: تأكد أن الـ Frontend يعمل

```bash
# Terminal 2 - Frontend
cd d:\PetMat_Project\Pet Breeding Matchmaking Website (3)
npm run dev

# يجب أن تراى:
# ✅ Vite dev server is running
# ✅ Local: http://localhost:5173
```

### الخطوة 3: افتح التطبيق

```
Browser: http://localhost:5173
```

---

## Test 1: Register and Login Flow

### الخطوات

1. **اضغط على Login Tab** (يجب أن يكون الافتراضي)
   - ✅ يجب أن تراى "Email" و "Password" inputs

2. **اضغط على Register Tab**
   - ✅ يجب أن تراى جميع الحقول

3. **أدخل البيانات**
   ```
   First Name: Test
   Last Name: User
   Email: test@example.com
   Phone: +1234567890
   Password: TestPassword123
   ```
   - ✅ يجب أن يقبل Password123 (بدون special characters)

4. **اضغط Register**
   - ✅ يجب أن ترى "Creating account..." على الزر
   - ✅ بعد ثانية: "Registration successful!" toast
   - ✅ يجب أن تُنقل إلى صفحة Home

5. **تحقق من localStorage**
   ```javascript
   // في DevTools Console:
   localStorage.getItem('user')
   localStorage.getItem('accessToken')
   
   // يجب أن تراى البيانات المحفوظة
   ```

### النتيجة المتوقعة
```
✅ Registration succeeded
✅ Redirected to home
✅ User data stored
✅ Access token saved
```

---

## Test 2: Multiple Login Attempts (429 Test)

### الخطوات

1. **اضغط على Logout** (إن كنت تسجلت)
   - ✅ يجب أن تعود إلى صفحة Login

2. **لا تُدخل بيانات صحيحة**
   ```
   Email: wrongemail@test.com
   Password: WrongPassword123
   ```

3. **اضغط Login 10 مرات متتالية**
   - بعد كل ضغطة، اضغط مرة أخرى مباشرة
   - لا تنتظر النتيجة كاملة

4. **لاحظ النتائج**
   - المحاولة 1-10: ✅ جميعها تعطي "Login failed" (وليس 429)
   - **قبل الحل**: كانت تعطي 429 بعد المحاولة 5-6 ❌
   - **بعد الحل**: جميع 10 محاولات تعمل ✅

5. **افتح DevTools (F12)**
   - انظر إلى Console tab
   - يجب أن تراى رسائل مثل:
     ```
     🔐 Attempting login to: /api/v1/auth/login
     Login failed: Invalid credentials (HTTP 401)
     ```

### النتيجة المتوقعة
```
✅ All 10 attempts return "Login failed" (401)
✅ No 429 error appears
✅ Console shows clear messages
❌ No 500 error
❌ No connection errors
```

---

## Test 3: Rate Limit Enforcement (After 30)

### الخطوات

1. **اجعل سكريبت يعمل 35 مرة**
   ```javascript
   // في DevTools Console:
   
   for (let i = 1; i <= 35; i++) {
     fetch('/api/v1/auth/login', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         email: 'test@test.com',
         password: 'Password123'
       })
     })
     .then(r => r.json())
     .then(d => {
       if (i <= 30) {
         console.log(`Request ${i}: ${d.message || 'OK'}`);
       } else {
         console.warn(`Request ${i}: RATE LIMITED! 429`);
       }
     });
     
     // تأخير بسيط
     await new Promise(r => setTimeout(r, 100));
   }
   ```

2. **لاحظ في الـ Console**
   - Requests 1-30: ✅ جميعها تعمل
   - Request 31-35: ❌ كل واحد يعطي 429

### النتيجة المتوقعة
```
✅ First 30 requests: Work normally
❌ Request 31+: HTTP 429 error
✅ After waiting 1 hour: Can start over
```

---

## Test 4: 429 Error Message Clarity

### الخطوات

1. **بعد الوصول لـ 30 طلب**: 
   - ستحصل على 429

2. **لاحظ على الشاشة**:
   ```
   ❌ Error Alert:
   "Too many login attempts. Please wait a few minutes before trying again."
   ```

3. **تحقق من Toast Notification**:
   - في أعلى الشاشة يجب أن تراى notification حمراء
   - تقول: "Too many login attempts..."

4. **انظر في DevTools Console**:
   ```javascript
   console.warn('⚠️ Rate limited (HTTP 429):', ...)
   ```
   - يجب أن تراى هذه الرسالة

### النتيجة المتوقعة
```
✅ Alert message is clear
✅ Toast notification appears
✅ Console message is descriptive
✅ User understands to wait
```

---

## Test 5: Verify No Infinite Loop

### الخطوات

1. **Open DevTools Console**
2. **Look at Network Tab** (F12 → Network)
3. **اضغط Login مرة واحدة فقط**
4. **لاحظ عدد الـ Requests**
   ```
   Expected: 1 request فقط إلى /api/v1/auth/login
   ❌ WRONG: Multiple requests (3-5) = infinite loop
   ✅ RIGHT: 1 request = normal
   ```

5. **في Console, انظر للرسائل**
   ```
   ✅ يجب أن تراى:
   🔐 Attempting login to: /api/v1/auth/login
   [فقط مرة واحدة]
   
   ❌ لا يجب أن تراى نفس الرسالة مكررة
   ```

### النتيجة المتوقعة
```
✅ Only 1 request per button click
✅ No automatic retries
✅ No infinite loops
✅ Messages appear once
```

---

## Test 6: Password Validation

### الخطوات

1. **في Registration:**
   ```
   جرب الكلمات المرور التالية:
   ```

2. **Should ACCEPT:**
   - `Password123` ✅
   - `MyP@ssw0rd` ✅
   - `Abc123456` ✅
   - أي كلمة مرور: 8+ أحرف، uppercase, lowercase, رقم

3. **Should REJECT:**
   - `password123` ❌ (لا uppercase)
   - `PASSWORD123` ❌ (لا lowercase)
   - `Password` ❌ (لا number)
   - `Pass123` ❌ (أقل من 8 أحرف)

4. **لاحظ رسالة الخطأ**
   ```
   "Password must contain at least..."
   ```

### النتيجة المتوقعة
```
✅ Password123 accepted
✅ Other combinations accepted based on rules
❌ Weak passwords rejected
✅ Error message shown for invalid passwords
```

---

## Test 7: Successful Login and Logout

### الخطوات

1. **Login بـ Credentials الصحيح**
   ```
   Email: test@example.com
   Password: TestPassword123
   (من اختبار Register السابق)
   ```

2. **اضغط Login**
   - ✅ يجب أن ترى "Logging in..." على الزر
   - ✅ بعد ثانية: "Login successful!" toast
   - ✅ تُنقل إلى صفحة Home

3. **في صفحة Home:**
   - ✅ يجب أن تراى محتوى صفحة Home
   - ✅ يجب أن تكون logged in

4. **اضغط Logout** (إن وجدت الزر):
   - ✅ تُرجع إلى صفحة Login

### النتيجة المتوقعة
```
✅ Login succeeds with correct credentials
✅ Redirected to home
✅ Logout works
✅ Can login again
```

---

## Quick Checklist

### Backend ✅
- [ ] `npm run dev` بدأ بدون أخطاء
- [ ] لا توجد 404 errors
- [ ] Database متصلة أو mock mode يعمل
- [ ] لا توجد rسائل permission errors

### Frontend ✅
- [ ] Application loads في `http://localhost:5173`
- [ ] Login/Register forms تظهر
- [ ] Input fields تعمل
- [ ] Toast notifications تظهر

### Auth Flow ✅
- [ ] Register يعمل
- [ ] Login يعمل
- [ ] Logout يعمل
- [ ] Tokens محفوظة في localStorage

### Error Handling ✅
- [ ] Password validation يعمل
- [ ] 429 after 30 requests ✅
- [ ] Clear error messages
- [ ] No infinite loops
- [ ] Console logs are clear

### 429 Specific ✅
- [ ] Can login 10 times بدون 429
- [ ] Clear message when hit 429
- [ ] Toast notification shows
- [ ] Can retry after waiting

---

## Expected Console Logs

### عند Successful Login:
```
🔐 Attempting login to: /api/v1/auth/login
✅ Login successful, data received: {
  user: { email: 'test@example.com', role: 'USER', ... },
  hasToken: true
}
🔐 Calling login() with: { email: '...', role: '...' }
✅ AuthContext updated - redirecting to home
```

### عند 429 Error:
```
🔐 Attempting login to: /api/v1/auth/login
⚠️ Rate limited (HTTP 429): Too many requests...
Login failed: Too many login attempts. Please wait...
```

### عند Invalid Credentials:
```
🔐 Attempting login to: /api/v1/auth/login
Login failed: Invalid credentials (HTTP 401)
```

---

## Troubleshooting Test Issues

### إذا أردت مسح كل شيء والبدء من جديد:

```javascript
// في DevTools Console:
localStorage.clear();
location.reload();
```

### إذا كان السيرفر لا يستجيب:

```bash
# تحقق من السيرفر:
cd server
npm run dev
# ستراى: "Express server running on port 5000"
```

### إذا كنت تحصل على CORS errors:

```
قد تكون الـ Frontend و Backend قيد التشغيل على
نفس الـ ports. تأكد:
- Backend: localhost:5000
- Frontend: localhost:5173
```

---

## ✅ Success Criteria

يجب أن تمر جميع الاختبارات التالية:

```
Test 1: Register Flow ......................... ✅
Test 2: Multiple Login Attempts .............. ✅
Test 3: 429 After 30 Requests ............... ✅
Test 4: Clear Error Message ................. ✅
Test 5: No Infinite Loop .................... ✅
Test 6: Password Validation ................. ✅
Test 7: Login/Logout Flow ................... ✅

Overall Status: ✅ PASSED
```

---

**Testing Date**: January 16, 2026
**Environment**: Development
**Status**: Ready for Testing
**Success Rate Expected**: 100%
