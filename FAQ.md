# ❓ FAQ - Network Connection Fix

## Q: Why did the app crash with "Network connection failed"?

**A:** The frontend had hardcoded URLs pointing directly to `http://localhost:5000`, but the browser blocks these cross-origin requests due to CORS. The Vite dev server (which runs the frontend on `localhost:5173`) can't directly access `localhost:5000` without a proxy.

---

## Q: What is a proxy and why do I need one?

**A:** A proxy acts as an intermediary:
- Frontend sends request to `/api/v1/auth/login` (local path)
- Vite proxy intercepts and forwards to `http://localhost:5000/api/v1/auth/login`
- Backend responds, proxy returns response to frontend

This solves CORS issues and allows you to keep frontend code URL-agnostic.

---

## Q: Will my production code work with these changes?

**A:** Yes! The relative paths work in any environment:
- **Development:** Vite proxy forwards to localhost:5000
- **Production:** Reverse proxy/API gateway forwards to real backend

Just update `vite.config.ts` or create `.env` file for production URL.

---

## Q: What files did you actually change?

**A:** Only 4 files:

1. **vite.config.ts** - Added proxy configuration
2. **src/app/components/AuthPage.tsx** - Removed hardcoded URL variable, updated API calls
3. **src/app/components/GPSAnalytics.tsx** - Updated API call URL
4. **src/app/components/HealthRecords.tsx** - Updated 3 API call URLs

**Total changes:** ~30 lines. No breaking changes.

---

## Q: Can I still hardcode URLs if I want?

**A:** Not recommended, but technically yes. However:
- ❌ Won't work in CORS-restricted environments
- ❌ Can't change server URL without code change
- ❌ Not production-ready
- ✅ Using relative paths is industry standard

---

## Q: What if I want to use a different backend URL?

**A:** Update `vite.config.ts`:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://your-backend-server.com:5000',
      // ... rest of config
    },
  },
}
```

That's it. No code changes needed.

---

## Q: Do I need to install additional packages?

**A:** No! Vite proxy is built-in. No additional dependencies needed.

---

## Q: Will this slow down my app?

**A:** No. Vite's proxy is efficient:
- Minimal overhead
- Same performance as direct requests
- Caching still works
- No extra network round trips

---

## Q: What if backend is running on a different port?

**A:** Update target in vite.config.ts:

```typescript
target: 'http://localhost:3000', // Change from 5000
```

---

## Q: Can I debug API requests with DevTools?

**A:** Yes! Network tab shows all requests:
1. F12 → Network tab
2. Perform action (e.g., login)
3. Look for `/api/v1/...` requests
4. Click request to see details
5. Response tab shows JSON returned

---

## Q: What does "changeOrigin: true" do?

**A:** It changes the Origin header to match the target server. This prevents "origin mismatch" CORS errors. Essential for development.

---

## Q: Is my app secure now?

**A:** Security status unchanged:
- ✅ JWT tokens still work
- ✅ Authorization headers sent
- ✅ No credentials exposed
- ✅ Backend validates everything
- ✅ Relative URLs don't expose secrets

---

## Q: What if I forget to start the backend?

**A:** You'll get "Failed to fetch" error. Solution:
```bash
cd server
npm run dev
```
Then refresh browser.

---

## Q: Can I use this in production?

**A:** Yes, with configuration:

**Dev:** Vite proxy to localhost:5000
**Production:** Reverse proxy to real backend

Update vite.config.ts for production:
```typescript
server: {
  proxy: {
    '/api': {
      target: process.env.VITE_API_URL,
      changeOrigin: true,
      secure: true, // Use HTTPS
    },
  },
}
```

---

## Q: Why does the error message still say "http://localhost:5000"?

**A:** That's just an error message. The actual request uses the proxy (relative path). Message updated in some components but doesn't affect functionality.

---

## Q: What's the difference between /api and /api/v1/?

**A:** API versioning:
- `/api` - Old (not in use)
- `/api/v1/` - Version 1 (current)
- `/api/v2/` - Future version (if needed)

This allows running multiple API versions simultaneously.

---

## Q: Can I test the API without the frontend?

**A:** Yes! Use curl or Postman:

```bash
curl http://localhost:5000/api/v1/health
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

---

## Q: What if I get CORS error in production?

**A:** Add backend CORS headers. In server/.env:
```env
CORS_ORIGIN=https://your-frontend-domain.com
```

Backend already handles this - just configure correctly.

---

## Q: How do I know the proxy is working?

**A:** Check these:

1. **Browser console** (F12 → Console):
```javascript
fetch('/api/v1/health').then(r => r.json()).then(console.log)
```

2. **Network tab** (F12 → Network):
   - Should show `/api/v1/...` requests
   - Status should be 200, 201, 400, etc. (not network error)

3. **Backend logs**:
   - Should show `GET /api/v1/health` requests
   - No 404 errors

---

## Q: Do I need to update package.json?

**A:** No changes needed. Vite already has proxy support built-in.

---

## Q: What if I want to use a different proxy tool?

**A:** You could use:
- Express proxy middleware
- nginx reverse proxy
- API Gateway
- But Vite's built-in proxy is simplest for development

---

## Q: Can multiple frontends share the same backend?

**A:** Yes! Just update proxy target in each frontend:

**Frontend 1 (port 5173):**
```typescript
target: 'http://localhost:5000'
```

**Frontend 2 (port 5174):**
```typescript
target: 'http://localhost:5000'
```

Both can access the same backend.

---

## Q: What if frontend and backend are on different machines?

**A:** Update target IP:

```typescript
target: 'http://192.168.1.100:5000' // Backend machine IP
```

Proxy forwards requests to remote machine.

---

## Q: Is the proxy needed in production?

**A:** No. Production uses real reverse proxy (nginx, Apache, API Gateway). Frontend code stays the same - just configuration changes.

---

## Q: How do I debug proxy issues?

**A:** Enable Vite debug logging:

```bash
# Start with debug flag
VITE_DEBUG=* npm run dev
```

Or check:
1. vite.config.ts proxy config correct
2. Backend actually running on target URL
3. Network tab shows request details
4. Browser console shows fetch error details

---

## Q: What about cookies and authentication?

**A:** Preserved automatically:
```typescript
fetch('/api/v1/auth/login', {
  credentials: 'include', // ← This sends cookies
})
```

Proxy passes cookies through automatically.

---

## Q: Will this work with GraphQL?

**A:** Yes! Proxy works with any HTTP request:
```typescript
server: {
  proxy: {
    '/graphql': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
  },
}
```

---

## Q: Can I proxy multiple endpoints?

**A:** Yes:
```typescript
server: {
  proxy: {
    '/api': { target: 'http://localhost:5000' },
    '/auth': { target: 'http://localhost:3000' },
    '/media': { target: 'http://cdn.example.com' },
  },
}
```

---

## Q: What if backend takes time to start?

**A:** Just wait and refresh browser. Vite proxy will eventually connect. No need to restart frontend.

---

## Q: Is there a way to see what proxy is doing?

**A:** Check browser DevTools:
1. F12 → Network tab
2. Look at Request URL
3. It should show `/api/v1/...` (the local request)
4. Look at timing to see round-trip time

---

## Q: Can I disable proxy for certain requests?

**A:** Yes, but not recommended. Better to keep all API requests going through proxy.

---

## Q: What if I need to add authentication tokens?

**A:** Already done in components:
```typescript
fetch('/api/v1/...', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
})
```

Proxy passes headers through.

---

## Q: Anything else I should know?

**A:** Key points:
- ✅ Keep vite.config.ts proxy updated
- ✅ Always start backend first
- ✅ Use relative paths in frontend
- ✅ Check Network tab when debugging
- ✅ Restart frontend if proxy config changes
- ✅ Production needs different proxy setup

---

## Q: Where can I find more help?

**A:** Check these files:
- **START_HERE.md** - Quick start
- **NETWORK_CONNECTION_FIX.md** - Complete guide
- **ARCHITECTURE_DIAGRAM.md** - How it works
- **CODE_CHANGES.md** - What changed

---

**✅ Still have questions? Check the documentation or server logs for error details.**
