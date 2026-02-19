# 🔑 ngrok Environment Variables Quick Reference

Copy-paste ready environment variable configurations for ngrok deployment.

---

## 📋 Key Principle

**Always update .env files AFTER ngrok tunnels start** because ngrok generates new URLs each time (unless on paid plan).

---

## 🎯 Step 1: Start Backend ngrok Tunnel

```bash
ngrok http 5000
```

**You'll see output like:**
```
Session Status                online
Session Expires               1 hour, 59 minutes
Forwarding                    https://abc123def456.ngrok.io → http://localhost:5000
```

**Copy the Forwarding URL:** `https://abc123def456.ngrok.io`

---

## 🎯 Step 2: Update Backend Environment File

**File:** `server/.env`

Replace with actual values from your ngrok outputs:

```env
# ============================================
# SERVER CONFIGURATION
# ============================================
NODE_ENV=development
HOST=0.0.0.0
PORT=5000

# ============================================
# DATABASE
# ============================================
DATABASE_URL=postgresql://YOUR_DB_USER:YOUR_DB_PASSWORD@localhost:5432/breeding_db

# ============================================
# CORS - ngrok Configuration
# ============================================
# Replace <YOUR-FRONTEND-NGROK-URL> with URL from Step 4
# Include both frontend ngrok URL AND localhost for local testing
CORS_ORIGIN=https://<YOUR-FRONTEND-NGROK-URL>,http://localhost:5173
CORS_CREDENTIALS=true

# ============================================
# JWT TOKENS
# ============================================
JWT_SECRET=your-secure-secret-key-here
JWT_REFRESH_SECRET=your-secure-refresh-secret-key-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ============================================
# RATE LIMITING
# ============================================
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=1000

# ============================================
# FILE UPLOAD
# ============================================
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# ============================================
# LOGGING
# ============================================
LOG_LEVEL=info
LOG_FILE_PATH=./logs

# ============================================
# AI SERVICE (if needed)
# ============================================
AI_SERVICE_API_KEY=your-ai-service-key
AI_SERVICE_BASE_URL=http://localhost:port
```

**Example with real ngrok URLs:**
```env
CORS_ORIGIN=https://abc123def456.ngrok.io,http://localhost:5173
```

**Then restart backend:**
```bash
npm restart  # or Ctrl+C and npm start
```

---

## 🎯 Step 3: Start Frontend ngrok Tunnel

In a **new terminal**, run:

```bash
ngrok http 5173
```

**You'll see output like:**
```
Forwarding                    https://xyz789uvw123.ngrok.io → http://localhost:5173
```

**Copy the Forwarding URL:** `https://xyz789uvw123.ngrok.io`

---

## 🎯 Step 4: Update Frontend Environment File

**File:** `frontend/.env` (or copy from `frontend/.env.ngrok` template)

Replace with actual values from your ngrok outputs:

```env
# ============================================
# API CONFIGURATION
# ============================================
# Replace <YOUR-BACKEND-NGROK-URL> with backend URL from Step 1
VITE_API_BASE=https://<YOUR-BACKEND-NGROK-URL>/api/v1

# ============================================
# HOT MODULE REPLACEMENT (HMR)
# ============================================
# Required for hot reload to work through ngrok
# Replace <YOUR-FRONTEND-NGROK-URL> with URL from Step 3 (without https://)
VITE_HMR_PROTOCOL=https
VITE_HMR_HOST=<YOUR-FRONTEND-NGROK-URL>
VITE_HMR_PORT=443

# ============================================
# OPTIONAL: AI SERVICE
# ============================================
# Only if you have external AI service via ngrok
VITE_AI_SERVICE_URL=https://your-ai-service-ngrok-url
```

**Example with real ngrok URLs:**
```env
VITE_API_BASE=https://abc123def456.ngrok.io/api/v1
VITE_HMR_PROTOCOL=https
VITE_HMR_HOST=xyz789uvw123.ngrok.io
VITE_HMR_PORT=443
```

**Optional:** Restart frontend dev server for changes to take effect
```bash
# Vite usually hot-reloads, but you can force:
# Ctrl+C
# npm run dev
```

---

## 🔄 Complete Setup Sequence (All Steps)

For reference, here's the complete order:

```bash
# Terminal 1: Start backend
cd server
npm start

# Terminal 2: Expose backend
ngrok http 5000
# Copy: https://abc123def456.ngrok.io

# Update: server/.env with CORS_ORIGIN=https://abc123def456.ngrok.io,...
# Restart backend

# Terminal 3: Start frontend
cd ..
npm run dev

# Terminal 4: Expose frontend  
ngrok http 5173
# Copy: https://xyz789uvw123.ngrok.io

# Update: frontend/.env with:
# VITE_API_BASE=https://abc123def456.ngrok.io/api/v1
# VITE_HMR_HOST=xyz789uvw123.ngrok.io

# Test: Open browser to https://xyz789uvw123.ngrok.io
```

---

## 📋 Minimal .env Files (Local Development Only - No ngrok)

If you want to run without ngrok for local-only development:

**server/.env**
```env
NODE_ENV=development
HOST=localhost
PORT=5000
DATABASE_URL=postgresql://...
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
CORS_CREDENTIALS=true
JWT_SECRET=dev-secret-key
JWT_REFRESH_SECRET=dev-refresh-secret-key
```

**frontend/.env**
```env
VITE_API_BASE=http://localhost:5000/api/v1
```

---

## 🔐 Production Environment Variables (For Reference)

When deploying to production, use proper hostnames:

```env
# Backend
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
HOST=0.0.0.0
NODE_ENV=production

# Frontend
VITE_API_BASE=https://api.yourdomain.com/api/v1
VITE_HMR_PROTOCOL=wss  # WebSocket Secure for production
VITE_HMR_HOST=yourdomain.com
VITE_HMR_PORT=443
```

---

## ⚡ Quick Commands

**List active ngrok tunnels (in new terminal):**
```bash
curl http://localhost:4040/api/tunnels | jq '.tunnels[].public_url'
```

**Check backend responds via ngrok:**
```bash
curl https://YOUR-BACKEND-NGROK-URL/api/v1/health
```

**Check frontend accessible via ngrok:**
```bash
curl https://YOUR-FRONTEND-NGROK-URL
```

---

## 🐛 Troubleshooting: Environment Variable Issues

**"API_BASE_URL is localhost but I set VITE_API_BASE"**
- Ensure you're using `.env` not `.env.ngrok`
- Vite only loads `.env` file by default
- Restart dev server after changing .env

**"CORS still blocked even with environment variable set"**
- Ensure backend restarted after .env change
- Check exact URL matches (https vs http, trailing slashes)
- Verify ngrok URL is still active

**"HMR not working"**
- Ensure `VITE_HMR_HOST` doesn't include `https://`
- Use ngrok https URL without protocol
- Example: `xyz789uvw123.ngrok.io` not `https://xyz789uvw123.ngrok.io`

---

## 📚 Related Files

- [NGROK_SETUP_GUIDE.md](./NGROK_SETUP_GUIDE.md) - Full setup instructions
- [NGROK_VERIFICATION_CHECKLIST.md](./NGROK_VERIFICATION_CHECKLIST.md) - Testing checklist
- [server/.env.ngrok](./server/.env.ngrok) - Backend template
- [frontend/.env.ngrok](./frontend/.env.ngrok) - Frontend template

---

**Pro Tip:** Keep ngrok URLs in a text file during development for quick reference. Session permalinks available with ngrok Pro account.

**Status:** ✅ Ready to use  
**Last Updated:** 2024
