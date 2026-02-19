# 🚀 QUICK COMMANDS - Get Started in 2 Minutes

## Copy & Paste These Commands

### Terminal 1: Start Backend
```bash
cd server
npm install
npm run dev
```

Wait for: `📡 Listening on http://localhost:5000`

---

### Terminal 2: Start Frontend
```bash
npm install
npm run dev
```

Wait for: `Local: http://localhost:5173`

---

### Browser
```
http://localhost:5173
```

---

## Test It Worked

### In Browser Console (F12 → Console)
```javascript
fetch('/api/v1/health').then(r => r.json()).then(d => console.log('✅', d))
```

Should show: `✅ { status: 'success', data: { status: 'healthy', ... } }`

---

## If It Doesn't Work

### Check 1: Backend Running?
```bash
curl http://localhost:5000/api/v1/health
```

### Check 2: Port 5000 Free?
```bash
# Windows
netstat -ano | findstr :5000

# Mac/Linux  
lsof -i :5000
```

### Check 3: Clear Cache & Restart
```bash
# Stop frontend (Ctrl+C)
# Clear browser cache (Ctrl+Shift+Delete)
npm run dev
```

### Check 4: Browser DevTools
- Press F12
- Go to Console tab
- Look for red error messages
- Go to Network tab
- Try login, look for `/api/v1/auth/login` request

---

## What Was Fixed

✅ **vite.config.ts** - Added proxy for `/api` → `http://localhost:5000`
✅ **AuthPage.tsx** - Changed hardcoded URLs to relative paths
✅ **GPSAnalytics.tsx** - Changed hardcoded URLs to relative paths
✅ **HealthRecords.tsx** - Changed hardcoded URLs to relative paths

---

## Key Files

- **vite.config.ts** - Proxy configuration
- **src/app/components/AuthPage.tsx** - Login/Register
- **src/app/components/GPSAnalytics.tsx** - Analytics
- **src/app/components/HealthRecords.tsx** - Health records
- **server/server.js** - Backend server
- **server/routes/index.js** - API endpoints

---

## That's It! 🎉

The app should now work without the "Network connection failed" error.

For detailed info: See **FIX_SUMMARY.md** or **NETWORK_CONNECTION_FIX.md**
