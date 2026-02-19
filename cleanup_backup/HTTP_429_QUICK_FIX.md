# ⚡ HTTP 429 - Quick Fix Reference

## المشكلة
```
❌ HTTP 429: Too Many Requests
❌ بعد 5-6 محاولات تسجيل دخول
```

## الحل (3 خطوات)

### 1. Backend - `server/middleware/security.js` (Line 76-84)
```javascript
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour ✅
  max: 30,                    // 30 requests ✅
});

app.use(`${config.api.prefix}/${config.api.version}/auth`, authLimiter);
```

### 2. Frontend - `src/app/utils/safeFetch.ts`
```typescript
// Handle 429 specifically
if (response.status === 429) {
  return {
    success: false,
    error: 'Too many requests. Please wait a moment.',
    status: 429  // ✅ Return status
  };
}
```

### 3. Frontend - `src/app/components/AuthPage.tsx`
```typescript
if (!response.success) {
  if (response.status === 429) {  // ✅ Check for 429
    const errorMsg = 'Too many attempts. Wait a few minutes.';
    setErrors({ root: errorMsg });
    toast.error(errorMsg);
    return;
  }
  // ... other errors
}
```

## النتيجة
```
✅ 30 requests per hour (= 1 request every 2 minutes)
✅ Clear error message
✅ No more unexpected 429 errors
```

## Test It
1. Restart backend: `npm run dev`
2. Try login 10+ times → No 429 ✅
3. After 30 times → 429 appears ✅

---

**Status**: ✅ FIXED
**Files Modified**: 2 (Backend + Frontend)
**Testing**: Ready
