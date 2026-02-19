# PetMate Project - Debugging Guide

## 🚨 Error: GET /src/.../FeaturesHighlight.tsx 500 (Internal Server Error)

### What This Error Means:
- Vite dev server **cannot compile** your TypeScript file
- Usually caused by **syntax errors** or **import errors**

### How to Debug:

#### 1. Check Vite Terminal (CRITICAL!)
Look at the terminal where you ran `npm run dev`:

```bash
# ✅ GOOD OUTPUT:
VITE v6.3.5  ready in 500 ms
➜ Local:   http://localhost:5173/

# ❌ BAD OUTPUT (This is what you're looking for):
[error] Failed to parse src/app/components/FeaturesHighlight.tsx
SyntaxError: Unexpected token (line 346)
```

#### 2. Common Causes & Fixes:

**A. Orphaned JSX Attributes**
```tsx
❌ WRONG:
</motion.div>
  whileInView={{ y: 0 }}  ← Props with no element!
>

✅ RIGHT:
<motion.div
  whileInView={{ y: 0 }}
>
  content
</motion.div>
```

**B. Missing Closing Tags**
```tsx
❌ WRONG:
<div>
  <motion.div>
    content
  </div>  ← Wrong closing tag

✅ RIGHT:
<div>
  <motion.div>
    content
  </motion.div>
</div>
```

**C. Import Path Errors**
```tsx
❌ WRONG:
import { Card } from './ui/Card'  ← Typo in filename

✅ RIGHT:
import { Card } from './ui/card'  ← Match exact filename
```

---

## 🚨 Error: TypeError: Failed to fetch (httpStatus: 0)

### What This Error Means:
- JavaScript tried to call an API but **request never reached server**
- Status 0 = Network request failed completely (not a 404 or 500)

### Common Causes:

#### 1. Backend Server Not Running ❌

**How to check:**
```bash
# Open browser and go to:
http://localhost:5000/api/v1/health

# ✅ Should see:
{"status": "ok", "timestamp": "..."}

# ❌ If you see:
"This site can't be reached" → Backend is offline!
```

**How to fix:**
```bash
# Open NEW terminal:
cd "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)"
npm run backend

# Or use combined command:
npm run dev:all
```

#### 2. CORS Issues ❌

**Symptoms:**
- Browser console shows: "CORS policy: No 'Access-Control-Allow-Origin' header"
- Fetch works in backend tests but fails in browser

**How to fix:**
Check `server/server.js` has CORS configured:
```javascript
import cors from 'cors';
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

#### 3. Wrong API URL ❌

**Check your API calls:**
```tsx
❌ WRONG:
fetch('http://localhost:5000/api/v1/pets')  ← Hardcoded URL

✅ RIGHT:
fetch('/api/v1/pets')  ← Vite proxy handles it
```

---

## 🛠️ Quick Debugging Workflow

### Step 1: Check Backend
```bash
# Terminal 1:
cd server
npm start

# Wait for:
"Server running on port 5000"
```

### Step 2: Check Frontend
```bash
# Terminal 2:
npm run dev

# Wait for:
"Local: http://localhost:5173"
```

### Step 3: Test API Connection
```bash
# Browser console (F12 → Console tab):
fetch('/api/v1/health').then(r => r.json()).then(console.log)

# ✅ Should log:
{status: "ok", timestamp: "..."}
```

### Step 4: Check Browser DevTools
```
F12 → Network Tab
- Look for failed requests (red)
- Click on them to see:
  - Request URL
  - Response headers
  - Error message
```

---

## 🚀 Startup Commands

### Option 1: Use Startup Script (Easiest)
```bash
# Double-click:
START_PROJECT.bat

# Opens 2 terminals:
# 1. Backend (port 5000)
# 2. Frontend (port 5173)
```

### Option 2: Manual Start (More Control)
```bash
# Terminal 1 - Backend:
cd "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)\server"
npm start

# Terminal 2 - Frontend:
cd "d:\PetMat_Project\Pet Breeding Matchmaking Website (3)"
npm run dev
```

### Option 3: Combined Command
```bash
npm run dev:all
# Runs both backend and frontend in one terminal
```

---

## 🔧 Performance Optimization

### Why Localhost Might Be Slow:

#### 1. Too Many Dependencies Loading
**Solution:** Clear Vite cache
```bash
# Stop dev server (Ctrl+C)
rm -rf node_modules/.vite
npm run dev
```

#### 2. Database Connection Slow
**Check:** `.env` file in server folder
```env
DATABASE_URL="your_postgres_url"
```

If database is remote (not localhost), it will be slower.

#### 3. Hot Module Reload Issues
**Solution:** Reduce file watchers
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    watch: {
      usePolling: false,  // Disable if on Windows
    }
  }
})
```

---

## 📋 Checklist Before Testing

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 5173
- [ ] Can access http://localhost:5000/api/v1/health
- [ ] Can access http://localhost:5173
- [ ] No red errors in Vite terminal
- [ ] No 500 errors in browser console

---

## 🆘 Still Having Issues?

### Check These Files:

1. **vite.config.ts** - Proxy configuration
2. **server/server.js** - CORS and routes
3. **server/.env** - Database URL
4. **package.json** - Scripts are correct

### Get Detailed Logs:

```bash
# Backend with verbose logging:
cd server
DEBUG=* npm start

# Frontend with detailed errors:
npm run dev -- --debug
```

### Hard Reset (Last Resort):

```bash
# Stop all servers
# Delete cache and reinstall:
rm -rf node_modules
rm -rf server/node_modules
rm -rf node_modules/.vite
npm install
cd server && npm install
cd ..

# Restart:
START_PROJECT.bat
```

---

## 🎓 For Your Graduation Project Defense

When presenting, explain:
1. "The project uses **Vite** for fast frontend development with HMR (Hot Module Reload)"
2. "Backend runs on **Express + Node.js** on port 5000"
3. "Vite proxies API requests from `/api` to the backend automatically"
4. "This separation allows independent scaling in production"

Good luck! 🚀
