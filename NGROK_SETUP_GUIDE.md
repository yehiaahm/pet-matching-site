# 🌐 ngrok Setup Guide - Full Stack External Access

This guide walks you through setting up your Pet Breeding Matchmaking website to work externally via **ngrok**, allowing external users to access your local development environment.

---

## 📋 Prerequisites

1. **Node.js** and **npm** installed
2. **ngrok** installed ([download here](https://ngrok.com/download))
3. Both frontend and backend source code set up locally
4. Backend running on `localhost:5000`
5. Frontend (Vite) running on `localhost:5173`

---

## 🚀 Step-by-Step Setup

### Step 1: Start the Backend Server

```bash
cd server
npm install  # if not already done
npm start    # or npm run dev
```

**Expected output:**
```
✓ Server running on http://localhost:5000
✓ Database connected
```

### Step 2: Expose Backend with ngrok

In a **new terminal**, run:

```bash
ngrok http 5000
```

**Output will show:**
```
ngrok URL forwarding to: https://YOUR-RANDOM-ID.ngrok.io → http://localhost:5000
```

**⚠️ IMPORTANT:** Copy the `https://YOUR-RANDOM-ID.ngrok.io` URL (you'll need it)

### Step 3: Update Backend Environment Variables

Create or edit `server/.env` and add/update:

```env
# From server/.env.ngrok template
HOST=0.0.0.0
PORT=5000
CORS_ORIGIN=https://YOUR-FRONTEND-NGROK-URL,http://localhost:5173
```

Replace `YOUR-FRONTEND-NGROK-URL` with the ngrok URL from Step 4.

**Restart backend** after updating .env:
```bash
npm restart
```

### Step 4: Start Frontend Dev Server

In a **new terminal**, navigate to frontend:

```bash
cd frontend
npm install  # if not already done
npm run dev
```

### Step 5: Expose Frontend with ngrok

In a **new terminal**, run:

```bash
ngrok http 5173
```

**Output will show:**
```
ngrok URL forwarding to: https://YOUR-RANDOM-ID.ngrok.io → http://localhost:5173
```

**⚠️ IMPORTANT:** Copy this URL

### Step 6: Update Frontend Environment Variables

Create or edit `frontend/.env` and add/update:

```env
# From frontend/.env.ngrok template
VITE_API_BASE=https://YOUR-BACKEND-NGROK-URL/api/v1
VITE_HMR_PROTOCOL=https
VITE_HMR_HOST=YOUR-FRONTEND-NGROK-URL
VITE_HMR_PORT=443
```

Replace placeholders:
- `YOUR-BACKEND-NGROK-URL` = backend ngrok URL from Step 2
- `YOUR-FRONTEND-NGROK-URL` = frontend ngrok URL from Step 5

**Restart frontend** dev server (Vite will hot-reload or you can Ctrl+C and restart)

### Step 7: Verify Local Network Access

1. Open browser to your **frontend ngrok URL**
2. You should see the website
3. Try logging in - it should connect to backend via its ngrok URL

---

## 🔍 Troubleshooting

### "Failed to fetch" when logging in/registering

**Cause:** CORS or API URL issues

**Fix:**
1. Check browser DevTools Network tab:
   - Verify request URL shows ngrok URL (not localhost)
   - Check response headers for `Access-Control-Allow-Origin: <frontend-ngrok-url>`
2. Verify `VITE_API_BASE` in frontend .env points to backend ngrok URL
3. Verify `CORS_ORIGIN` in backend .env includes frontend ngrok URL
4. Check backend console for CORS warnings

### "Cannot GET /api/v1/..."

**Cause:** API endpoint not found

**Fix:**
1. Verify backend `localhost:5000` responds locally first
2. Check backend is running and no errors in console
3. Verify correct ngrok URL pointing to backend

### HMR (Hot Module Replacement) not working

**Cause:** HMR configuration mismatch

**Fix:**
1. Verify `VITE_HMR_HOST` and `VITE_HMR_PORT` in frontend .env
2. Use ngrok's HTTPS protocol and port 443 (not 80)
3. Restart Vite dev server after changing HMR settings

### ngrok URL changes every time

**Note:** Free ngrok tier generates new URLs on each restart. For persistent URLs, upgrade ngrok account.

---

## 📝 Environment Variables Reference

### Backend (`server/.env`)

```env
# Server Config
NODE_ENV=development
HOST=0.0.0.0                    # Listen on all interfaces
PORT=5000

# Database (update as needed)
DATABASE_URL=postgresql://...

# CORS - Accept frontend ngrok URL and localhost
CORS_ORIGIN=https://xxx-yyy.ngrok.io,http://localhost:5173

# JWT Tokens
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d
JWT_SECRET=your-secret-key

# AI Service
AI_SERVICE_API_KEY=your-key
```

### Frontend (`frontend/.env`)

```env
# API Configuration
VITE_API_BASE=https://xxx-yyy.ngrok.io/api/v1

# HMR - For hot module replacement via ngrok
VITE_HMR_PROTOCOL=https
VITE_HMR_HOST=YOUR-FRONTEND-NGROK-URL
VITE_HMR_PORT=443

# Optional: AI Service
VITE_AI_SERVICE_URL=http://localhost:port  # or ngrok URL
```

---

## 🔐 Security Notes

1. **ngrok URLs are public** - treat this like any production URL
2. **Don't commit ngrok URLs to git** - they change and expose sensitive infrastructure
3. **Use environment files** - keep URLs in .env, not in code
4. **Add authentication** - always keep login/JWT token security in place
5. **Rate limiting** - verify backend rate limiting is active (see `server/middleware/security.js`)

---

## ✅ Quick Verification Checklist

- [ ] Backend running on localhost:5000 and responding
- [ ] Backend exposed with ngrok (Step 2)
- [ ] Frontend dev server running on localhost:5173
- [ ] Frontend exposed with ngrok (Step 5)
- [ ] `VITE_API_BASE` in frontend .env set to backend ngrok URL
- [ ] `CORS_ORIGIN` in backend .env includes frontend ngrok URL and localhost
- [ ] Frontend .env includes correct HMR settings
- [ ] Can access frontend via ngrok URL in browser
- [ ] Can log in/register without "Failed to fetch" errors
- [ ] Browser DevTools Network tab shows successful API requests to ngrok URLs

---

## 📚 Additional Resources

- **ngrok Docs:** https://ngrok.com/docs
- **CORS Explanation:** https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- **Vite HMR Config:** https://vitejs.dev/config/server-options.html#server-hmr
- **Node.js CORS Middleware:** https://github.com/expressjs/cors

---

## 🎯 Advanced: Automated ngrok Setup

For repeated use, create a bash script to automate ngrok tunnel management:

```bash
#!/bin/bash
# File: start-ngrok-tunnels.sh

echo "Starting ngrok tunnels..."

# Backend tunnel
ngrok http 5000 --log=stdout > backend-ngrok.log 2>&1 &
BACKEND_PID=$!

# Frontend tunnel (after delay to get backend URL)
sleep 2
ngrok http 5173 --log=stdout > frontend-ngrok.log 2>&1 &
FRONTEND_PID=$!

echo "ngrok tunnels started (PIDs: $BACKEND_PID, $FRONTEND_PID)"
echo "Check logs: backend-ngrok.log and frontend-ngrok.log"

# Trap Ctrl+C to kill tunnels
trap "kill $BACKEND_PID $FRONTEND_PID; echo 'ngrok tunnels stopped'" EXIT

wait
```

Run with: `bash start-ngrok-tunnels.sh`

---

## ❓ Still Having Issues?

1. Check `server/middleware/security.js` CORS handler for ngrok pattern matching
2. Review browser DevTools Network tab for actual request/response headers
3. Verify environment variables are loaded: check running process env
4. Check backend logs for CORS `Access-Control-Allow-Origin` headers
5. Ensure both ngrok tunnels are actively running

---

**Last Updated:** 2024
**Framework:** React (Vite) + Node.js Express
**Status:** ✅ Production-ready ngrok configuration
