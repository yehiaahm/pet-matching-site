# Quick Fix Guide - Common Localhost Errors

## 🚨 Error 1: GET .../FeaturesHighlight.tsx 500

### **Cause:** Vite cannot compile the file (syntax error)

### **Quick Fix:**
1. Open the terminal where `npm run dev` is running
2. Look for red error messages showing exact line number
3. Fix the syntax error in that line
4. Hard refresh browser: `Ctrl + Shift + R`

### **Most Common Issues:**

#### Orphaned JSX Props
```tsx
❌ BAD:
</div>
  prop1={value}
>

✅ GOOD:
<div prop1={value}>
```

#### Missing Imports
```tsx
❌ BAD:
import { Card } from './ui/Card'  // Typo

✅ GOOD:
import { Card } from './ui/card'
```

---

## 🚨 Error 2: Failed to fetch (httpStatus: 0)

### **Cause:** Backend server not running OR wrong URL

### **Quick Fix:**

#### Step 1: Check if backend is running
```bash
# Open browser, go to:
http://localhost:5000/api/v1/health

# Should see:
{"status": "ok"}

# If connection refused:
# Backend is NOT running!
```

#### Step 2: Start backend
```bash
# Open NEW terminal:
cd server
npm start

# Wait for message:
"Server running on port 5000"
```

#### Step 3: Test again
Refresh your frontend page.

---

## 🐌 Problem: Localhost is Slow

### **Quick Fixes:**

#### Fix 1: Clear Vite Cache
```bash
# Stop dev server (Ctrl+C)
rm -rf node_modules/.vite
npm run dev
```

#### Fix 2: Check Database Connection
```bash
# If using remote database:
# Slow queries = slow page loads

# Use local database for development
```

#### Fix 3: Reduce Hot Reload Watchers
Edit `vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    watch: {
      usePolling: false
    }
  }
})
```

---

## 🔄 Complete Reset (Nuclear Option)

If nothing works:

```bash
# Stop all servers (Ctrl+C in all terminals)

# Delete everything and reinstall:
rm -rf node_modules
rm -rf server/node_modules
rm -rf node_modules/.vite

npm install
cd server
npm install
cd ..

# Start fresh:
START_PROJECT.bat
```

---

## 📝 Daily Startup Checklist

Before coding each day:

1. **Start backend:** Open terminal → `cd server` → `npm start`
2. **Start frontend:** Open terminal → `npm run dev`
3. **Test backend:** Visit `http://localhost:5000/api/v1/health`
4. **Test frontend:** Visit `http://localhost:5173`
5. **Check console:** F12 → Console tab → No red errors

---

## 🆘 Emergency Commands

### Check what's running on ports:
```bash
# Windows:
netstat -ano | findstr :5000
netstat -ano | findstr :5173

# If port is blocked, kill process:
taskkill /PID <process_id> /F
```

### Force restart:
```bash
# Kill all Node processes:
taskkill /IM node.exe /F

# Restart:
START_PROJECT.bat
```

---

## ✅ Working Configuration

Your project needs:

1. **Backend running on port 5000**
2. **Frontend running on port 5173**
3. **Vite proxy configuration** (already in vite.config.ts)
4. **CORS enabled** (already in server/server.js)

If all 4 are correct, your project will work perfectly!

---

## 🎯 For Your Graduation Defense

If asked about errors during demo:

1. "This is a client-side fetch error, indicating the backend needs to be restarted"
2. "I'll quickly verify the backend service..." (run health check)
3. "The error is resolved by ensuring both services are running"

Shows you understand the architecture! 💪
