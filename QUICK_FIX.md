# Quick Start - Network Connection Fix

## Problem Was
"Network connection failed. Make sure the backend server is running on http://localhost:5000"

## What Was Wrong
1. Frontend hardcoded URLs to `http://localhost:5000` 
2. Vite had no proxy configuration
3. API endpoint paths were incorrect

## What's Fixed ✅
1. **vite.config.ts** - Added proxy for `/api` → `http://localhost:5000`
2. **AuthPage.tsx** - Changed to relative paths
3. **GPSAnalytics.tsx** - Changed to relative paths  
4. **HealthRecords.tsx** - Changed to relative paths

## Run Now

### Terminal 1: Backend
```bash
cd server
npm run dev
```
Wait for: `📡 Listening on http://localhost:5000`

### Terminal 2: Frontend
```bash
npm run dev
```
Wait for: `Local: http://localhost:5173`

### Browser
Open: `http://localhost:5173`

## Verify It Works

### Method 1: Browser Console
```javascript
// Paste in browser console (F12 → Console)
fetch('/api/v1/health')
  .then(r => r.json())
  .then(d => console.log('✅ Backend connected:', d))
  .catch(e => console.error('❌ Error:', e))
```

### Method 2: Test Login
1. Open http://localhost:5173
2. Go to Network tab (F12 → Network)
3. Click Login
4. Look for `/api/v1/auth/login` request
5. Should see Status: 200, 201, or 400 (not error)

## If It Still Doesn't Work

### Check 1: Backend Running?
```bash
curl http://localhost:5000/api/v1/health
```
Should return JSON with "healthy" status

### Check 2: Port 5000 Free?
```bash
# Windows
netstat -ano | findstr :5000

# Mac/Linux
lsof -i :5000
```
Kill process if found: `taskkill /PID <PID> /F` (Windows)

### Check 3: Vite Proxy Active?
Look at vite.config.ts - should have:
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

### Check 4: Browser Console Errors
Open DevTools (F12) → Console tab
Look for red errors - Google the exact error message

## Key Changes Made

```typescript
// BEFORE
const response = await fetch('http://localhost:5000/api/auth/login')

// AFTER  
const response = await fetch('/api/v1/auth/login')
// Vite proxy handles forwarding to http://localhost:5000
```

## Architecture Now
```
Browser 
  ↓ /api/v1/auth/login
Vite Proxy
  ↓ forwards to
Backend: http://localhost:5000/api/v1/auth/login
  ↓
Returns data to browser
```

## Done! 🎉
The app should now load without the "Network connection failed" error.

For detailed debugging steps, see: **NETWORK_CONNECTION_FIX.md**
