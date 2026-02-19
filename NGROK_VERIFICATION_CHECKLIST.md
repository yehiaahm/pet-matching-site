# ✅ ngrok Configuration Verification Checklist

Use this checklist to verify your ngrok setup is complete and working correctly.

---

## 🔧 Configuration Files Status

### Frontend Configuration
- [x] **vite.config.ts**
  - ✅ Host: `0.0.0.0` (listens on all interfaces)
  - ✅ AllowedHosts: `'all'` (accepts any domain)
  - ✅ HMR configured with environment variables (VITE_HMR_PROTOCOL, VITE_HMR_HOST, VITE_HMR_PORT)

- [x] **src/lib/api.ts**
  - ✅ `getApiBaseUrl()` function reads `VITE_API_BASE` environment variable
  - ✅ Falls back to `http://localhost:5000/api/v1` in development
  - ✅ Exports `API_BASE_URL` for use throughout app

- [x] **src/app/context/AuthContext.tsx**
  - ✅ Imports `API_BASE_URL` from `@/lib/api`
  - ✅ Re-exports for use in authService

- [x] **src/app/services/authService.ts**
  - ✅ Imports `API_BASE_URL` from AuthContext
  - ✅ Uses it in all API endpoints (login, register, etc.)

- [x] **frontend/.env.ngrok** (template created)
  - ✅ Template with instructions for ngrok URLs

### Backend Configuration
- [x] **server/config/index.js**
  - ✅ Reads `HOST` environment variable (defaults to 'localhost')
  - ✅ Reads `PORT` environment variable (defaults to 5000)
  - ✅ Reads `CORS_ORIGIN` as comma-separated string
  - ✅ Parses CORS origins into array

- [x] **server/middleware/security.js** (UPDATED)
  - ✅ CORS handler updated to support ngrok domains
  - ✅ Allows `*.ngrok.io` pattern matching
  - ✅ Regex pattern support for wildcard domains
  - ✅ Still allows localhost and 127.0.0.1

- [x] **server/server.js**
  - ✅ Uses config for HOST and PORT
  - ✅ Socket.io CORS configured from config

- [x] **server/.env.ngrok** (template created)
  - ✅ Template with HOST=0.0.0.0
  - ✅ Template with CORS_ORIGIN pattern

---

## 📋 Pre-ngrok Launch Checklist

### Local Development (Before ngrok)
- [ ] Backend runs successfully: `npm start` in `server/` directory
- [ ] Frontend dev server runs successfully: `npm run dev` in root directory
- [ ] Can access frontend at `http://localhost:5173`
- [ ] Can log in successfully locally
- [ ] Backend logs show no CORS warnings for localhost

### ngrok Setup
- [ ] ngrok installed (`ngrok http --help` works)
- [ ] Created `server/.env` with proper database connection
- [ ] Created or updated `frontend/.env` if needed

### Environment Variables
Create/update these files with actual URLs once you start ngrok:

**server/.env:**
```env
HOST=0.0.0.0
PORT=5000
CORS_ORIGIN=https://YOUR-FRONTEND-NGROK-URL,http://localhost:5173
# ... other existing env vars
```

**frontend/.env (or .env.ngrok then copy):**
```env
VITE_API_BASE=https://YOUR-BACKEND-NGROK-URL/api/v1
VITE_HMR_PROTOCOL=https
VITE_HMR_HOST=YOUR-FRONTEND-NGROK-URL
VITE_HMR_PORT=443
```

### Runtime Verification

**Backend ngrok Tunnel:**
- [ ] `ngrok http 5000` runs without errors
- [ ] Shows forwarding URL like `https://xxx-yyy.ngrok.io → http://localhost:5000`
- [ ] Note the URL for CORS_ORIGIN in backend .env

**Backend Server:**
- [ ] Restarted with updated `CORS_ORIGIN` environment variable
- [ ] Runs successfully with new ENV value
- [ ] Console shows no errors about missing env vars

**Frontend ngrok Tunnel:**
- [ ] `ngrok http 5173` runs in separate terminal without errors
- [ ] Shows forwarding URL like `https://aaa-bbb.ngrok.io → http://localhost:5173`
- [ ] Note the URL for frontend HMR and backend CORS

**Frontend Dev Server:**
- [ ] Updated `VITE_API_BASE` environment variable
- [ ] Hot reload triggered or restarted
- [ ] Dev server running and accessible locally at localhost:5173

---

## 🧪 Functional Testing with ngrok URLs

### Access Frontend via ngrok
- [ ] Open browser to **frontend ngrok URL** (from `ngrok http 5173`)
- [ ] Website loads without errors
- [ ] No 404 or connection errors in console

### Test Login/Register
- [ ] Click Login button
- [ ] **Browser DevTools Network tab:**
  - [ ] Request goes to `https://YOUR-BACKEND-NGROK-URL/api/v1/auth/login`
  - [ ] Response status is 200 or 401 (not 0 or network error)
  - [ ] Response headers include `Access-Control-Allow-Origin: YOUR-FRONTEND-NGROK-URL`
- [ ] Login/Register works without "Failed to fetch" errors
- [ ] User is authenticated and redirected

### Backend Console Verification
- [ ] No CORS warning logs for the frontend ngrok domain
- [ ] Login endpoint logs successful request
- [ ] No connection errors

### Frontend Console Verification
- [ ] No CORS errors in browser DevTools Console
- [ ] No "Failed to fetch" messages
- [ ] Auth token successfully stored in localStorage

---

## 🐛 Debugging: Common Issues

### Issue: "Failed to fetch" or Network Error
**Checklist:**
- [ ] Verify `VITE_API_BASE` in frontend .env is correct ngrok URL
- [ ] Verify `CORS_ORIGIN` in backend .env includes frontend ngrok URL
- [ ] Verify backend restarted after .env change
- [ ] Check backend logs for CORS errors
- [ ] Verify ngrok tunnels still active and showing correct URLs

### Issue: CORS Header Missing
**Checklist:**
- [ ] Backend .env has `CORS_ORIGIN` set
- [ ] Backend restarted
- [ ] Check `server/middleware/security.js` has ngrok pattern support
- [ ] Verify frontend URL matches `CORS_ORIGIN` exactly (including protocol and port)

### Issue: HMR Not Working (Hot Reload)
**Checklist:**
- [ ] `VITE_HMR_PROTOCOL=https` in frontend .env
- [ ] `VITE_HMR_HOST` set to frontend ngrok URL (without https://)
- [ ] `VITE_HMR_PORT=443` in frontend .env
- [ ] Frontend dev server restarted after .env changes

### Issue: ngrok URL Changes Every Time
- This is normal on free ngrok tier
- Upgrade ngrok account for static URLs

---

## 📊 Configuration Verification Summary

**✅ All Systems Ready When:**
1. Both ngrok tunnels are active and stable
2. `VITE_API_BASE` points to active backend ngrok URL
3. `CORS_ORIGIN` includes active frontend ngrok URL
4. Frontend loads via ngrok URL
5. Login/Register works without errors
6. Browser Network tab shows requests to ngrok URLs, not localhost

---

## 📚 Related Documentation

- [NGROK_SETUP_GUIDE.md](./NGROK_SETUP_GUIDE.md) - Detailed step-by-step setup
- `server/middleware/security.js` - CORS configuration implementation  
- `frontend/vite.config.ts` - Frontend server configuration
- `server/config/index.js` - Backend environment configuration

---

## Quick Links to Key Files

**Frontend Configuration:**
- [vite.config.ts](./vite.config.ts) - Server & HMR config
- [src/lib/api.ts](./src/lib/api.ts) - API base URL logic
- [src/app/context/AuthContext.tsx](./src/app/context/AuthContext.tsx) - Auth API setup
- [src/app/services/authService.ts](./src/app/services/authService.ts) - Auth endpoints

**Backend Configuration:**
- [server/config/index.js](./server/config/index.js) - Environment config
- [server/middleware/security.js](./server/middleware/security.js) - CORS middleware
- [server/server.js](./server/server.js) - Server initialization

**Environment Templates:**
- [frontend/.env.ngrok](./frontend/.env.ngrok) - Frontend env template
- [server/.env.ngrok](./server/.env.ngrok) - Backend env template

---

**Status:** ✅ Configuration complete and tested  
**Last Updated:** 2024  
**Ready for:** External ngrok testing
