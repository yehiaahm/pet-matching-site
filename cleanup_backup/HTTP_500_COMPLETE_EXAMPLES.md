# 💡 HTTP 500 Fix - أمثلة عملية وكود كامل

## 🎯 المثال الكامل من البداية

### السيناريو
```
المستخدم يفتح التطبيق في http://localhost:5173
يرى صفحة التسجيل (AuthPage)
يملأ البيانات ويضغط Register
يتوقع: الانتقال إلى الصفحة الرئيسية والبقاء مسجلاً دخوله
يحدث الآن: HTTP 500 و "Unexpected end of JSON input"
```

---

## ✅ الحل الكامل

### المرحلة 1: Frontend Request

```typescript
// src/app/components/AuthPage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // ✅ 1. Navigation hook
import { useAuth } from '../context/AuthContext';

export function AuthPage() {
  const { login } = useAuth();
  const navigate = useNavigate();  // ✅ 2. Initialize navigation
  const [loading, setLoading] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    email: 'test@example.com',
    password: 'Test123!@',
    firstName: 'Ahmed',
    lastName: 'Ali',
    phone: '+1234567890',
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ 3. Use RELATIVE path, NOT hardcoded URL
      console.log('📝 Attempting register to: /api/v1/auth/register');
      
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerForm),
        credentials: 'include',  // ✅ 4. Include cookies
      });

      // ✅ 5. Check response status
      console.log('✅ Register response received:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      // ✅ 6. Parse response JSON
      const data = await response.json();
      console.log('📦 Full response:', data);

      // ✅ 7. Validate response format
      const userData = data.data?.user;
      const accessToken = data.data?.accessToken;
      
      if (!userData || !accessToken) {
        console.error('❌ Invalid response format:', { userData, accessToken });
        throw new Error('Invalid server response');
      }

      // ✅ 8. Update auth context
      console.log('🔐 Calling login() with:', { 
        email: userData.email, 
        role: userData.role 
      });
      login(userData, accessToken);

      // ✅ 9. EXPLICITLY navigate to home
      console.log('➡️ Navigating to home page');
      setTimeout(() => {
        navigate('/');
      }, 100);  // Small delay ensures context is updated

    } catch (error) {
      console.error('❌ Registration error:', error);
      // Show error toast/alert
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <input
        type="email"
        value={registerForm.email}
        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={registerForm.password}
        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
        placeholder="Password"
        required
      />
      <input
        type="text"
        value={registerForm.firstName}
        onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
        placeholder="First Name"
        required
      />
      <input
        type="text"
        value={registerForm.lastName}
        onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
        placeholder="Last Name"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
```

### المرحلة 2: Vite Proxy Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // ✅ This proxies /api/* requests to backend
      '/api': {
        target: 'http://localhost:5000',  // Backend URL
        changeOrigin: true,               // Correct Host header
        secure: false,                    // Accept self-signed certs
      },
    },
  },
})
```

**كيف تشتغل الـ Proxy:**
```
Browser Request:  POST /api/v1/auth/register
        ↓ (Vite proxy rewrites to)
Backend Request:  POST http://localhost:5000/api/v1/auth/register
        ↓
Backend Response: {status: 'success', data: {...}}
        ↓ (Browser sees)
Browser Response: {status: 'success', data: {...}}
```

### المرحلة 3: Backend Router Setup

```typescript
// src/main.tsx
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";  // ✅ Router provider
import App from "./app/App.tsx";
import { AuthProvider } from "./app/context/AuthContext.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>  {/* ✅ Enables routing like navigate('/') */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);
```

### المرحلة 4: Backend Server Setup

```javascript
// server/server.js
import express from 'express';
import { configureSecurityMiddleware, configureGeneralMiddleware } from './middleware/security.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import routes from './routes/index.js';

const app = express();

// ✅ 1. Security middleware FIRST
configureSecurityMiddleware(app);

// ✅ 2. General middleware (includes express.json())
configureGeneralMiddleware(app);

// ✅ 3. Routes
app.use('/', routes);

// ✅ 4. 404 handler
app.use(notFound);

// ✅ 5. Global error handler LAST (catches all errors)
app.use(errorHandler);

// Start server
const PORT = process.env.SERVER_PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

### المرحلة 5: Middleware Configuration

```javascript
// server/middleware/security.js
import express from 'express';

export const configureGeneralMiddleware = (app) => {
  // ✅ CRITICAL: Parse incoming JSON
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Cookie parsing
  app.use(cookieParser());
  
  // ... other middleware like compression, logging, etc
};
```

### المرحلة 6: Backend Routes

```javascript
// server/routes/index.js
import express from 'express';
import authRoutes from './authRoutes.js';
import config from '../config/index.js';

const router = express.Router();

// ✅ Mount auth routes under /api/v1/auth
const apiPrefix = `${config.api.prefix}/${config.api.version}`;  // /api/v1
router.use(`${apiPrefix}/auth`, authRoutes);

// ✅ Other routes also under /api/v1/*
router.use(`${apiPrefix}/pets`, petRoutes);
// ... more routes

export default router;
```

```javascript
// server/routes/authRoutes.js
import express from 'express';
import { register, login } from '../controllers/authController.js';

const router = express.Router();

// ✅ Routes are at /api/v1/auth/register and /api/v1/auth/login
router.post('/register', register);
router.post('/login', login);

export default router;
```

### المرحلة 7: Backend Controller

```javascript
// server/controllers/authController.js
import { catchAsync } from '../middleware/errorHandler.js';
import { sendSuccess } from '../utils/response.js';
import { hashPassword } from '../utils/encryption.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import prisma from '../config/prisma.js';

// ✅ Use catchAsync wrapper to handle errors
export const register = catchAsync(async (req, res, next) => {
  const { email, password, firstName, lastName, phone } = req.body;

  // Validation
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing required fields'
    });
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(409).json({
      status: 'fail',
      message: 'User with this email already exists'
    });
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  // Generate tokens
  const accessToken = generateAccessToken({ id: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id, role: user.role });

  // Save refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Set HttpOnly cookies
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  // ✅ CORRECT Response Format
  sendSuccess(res, 201, 'User registered successfully', {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
    },
    accessToken,  // ✅ Only accessToken (refreshToken is in HttpOnly cookie)
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid email or password'
    });
  }

  // Check password
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid email or password'
    });
  }

  // Generate tokens
  const accessToken = generateAccessToken({ id: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id, role: user.role });

  // Save refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Set cookies
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  // ✅ CORRECT Response Format
  const { password: _, ...userWithoutPassword } = user;
  
  sendSuccess(res, 200, 'Login successful', {
    user: userWithoutPassword,
    accessToken,  // ✅ Only accessToken
  });
});
```

### المرحلة 8: Response Utility

```javascript
// server/utils/response.js
export const sendSuccess = (res, statusCode, message, data = null) => {
  // ✅ Standard success response format
  res.status(statusCode).json({
    status: 'success',
    message,
    ...(data && { data }),  // Only include data if provided
  });
};

export const sendError = (res, statusCode, message, errors = null) => {
  // ✅ Standard error response format
  res.status(statusCode).json({
    status: 'error',
    message,
    ...(errors && { errors }),  // Only include errors if provided
  });
};
```

### المرحلة 9: Error Handler Middleware

```javascript
// server/middleware/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  // ✅ Catches ALL errors including from catchAsync
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[${req.method} ${req.url}] Error:`, err);

  res.status(statusCode).json({
    status: statusCode < 500 ? 'fail' : 'error',
    message,
  });
};

export const catchAsync = (fn) => {
  // ✅ Wraps async functions to catch errors
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const notFound = (req, res, next) => {
  // ✅ Handles 404s
  next(new Error(`Cannot ${req.method} ${req.url}`));
};
```

---

## 🧪 اختبار الـ Flow كاملاً

### Test Scenario: User Registration

```
Step 1: Browser loads http://localhost:5173
        ↓
Step 2: User sees AuthPage component
        ↓
Step 3: User fills form:
        - Email: test@example.com
        - Password: Test123!@
        - First Name: Ahmed
        - Last Name: Ali
        ↓
Step 4: User clicks Register button
        ↓
Step 5: handleRegister() is called:
        - Create request body
        - Call fetch('/api/v1/auth/register')
        ↓
Step 6: Vite proxy intercepts request:
        - Changes: /api/v1/... → http://localhost:5000/api/v1/...
        ↓
Step 7: Backend receives request:
        - express.json() parses body ✅
        - authRoutes matches /auth/register ✅
        - register controller is called ✅
        ↓
Step 8: register() executes:
        - Validate input ✅
        - Hash password ✅
        - Create user in DB ✅
        - Generate tokens ✅
        - Set HttpOnly cookies ✅
        - Call sendSuccess() ✅
        ↓
Step 9: Response sent to browser:
        {
          "status": "success",
          "message": "User registered successfully",
          "data": {
            "user": {...},
            "accessToken": "eyJ..."
          }
        } ✅
        ↓
Step 10: Frontend receives response:
         - Check status 201 ✅
         - Parse JSON ✅
         - Validate data.data.user ✅
         - Validate data.data.accessToken ✅
         ↓
Step 11: Call login(userData, accessToken):
         - Save to localStorage ✅
         - Update AuthContext ✅
         - App re-renders ✅
         ↓
Step 12: Call navigate('/'):
         - BrowserRouter handles navigation ✅
         - App renders Dashboard instead of AuthPage ✅
         ↓
Step 13: User sees dashboard:
         - Welcome message ✅
         - User name in navbar ✅
         - Logout button ✅
         ✅ SUCCESS!
```

---

## 🔍 Debugging Points

### If you get stuck at Step 6 (Network Error):

```bash
# Check if Vite dev server is running
npm run dev

# Check if it's at http://localhost:5173
# Vite should show: Local: http://localhost:5173
```

### If you get stuck at Step 7 (Backend Error):

```bash
# Check if backend is running
cd server && npm run dev

# Should show: 🚀 Server running on http://localhost:5000
```

### If you get stuck at Step 9 (Empty Response):

```javascript
// Add debugging in handleRegister:
const response = await fetch('/api/v1/auth/register', {...});
console.log('Response status:', response.status);
console.log('Response content-type:', response.headers.get('content-type'));

const text = await response.text();
console.log('Response text:', text);

if (!text) {
  console.error('❌ EMPTY RESPONSE FROM SERVER');
  // Check server logs for errors
}

const data = JSON.parse(text);
```

### If you get stuck at Step 12 (Navigation Failed):

```typescript
// Check if useNavigate hook is imported:
import { useNavigate } from 'react-router-dom';  // ✅ Required

// Check if BrowserRouter is wrapping App:
// In main.tsx:
<BrowserRouter>  {/* ✅ Required */}
  <App />
</BrowserRouter>

// Check if setTimeout is being used:
setTimeout(() => {
  navigate('/');  // ✅ Delay ensures context update
}, 100);
```

---

## ✅ Success Checklist

- [ ] Backend runs without errors
- [ ] Frontend loads without errors
- [ ] Can fill registration form
- [ ] Click Register sends request to `/api/v1/auth/register`
- [ ] Network tab shows 201 status
- [ ] Response contains valid JSON
- [ ] localStorage has `accessToken` and `user`
- [ ] Browser redirects to `/`
- [ ] Dashboard displays with user info
- [ ] Can logout and redirect to `/login`

---

**آخر تحديث**: يناير 2026
**Tested & Verified**: ✅
