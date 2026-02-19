import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true
}));

// In-memory database (for testing without PostgreSQL)
const users = new Map();
const refreshTokens = new Set();

// JWT Secrets
const JWT_SECRET = 'your-super-secret-jwt-access-token-key-change-in-production-12345678';
const JWT_REFRESH_SECRET = 'your-super-secret-jwt-refresh-token-key-change-in-production-12345678';

// Helper functions
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );
};

const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

// Routes

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running (Mock Mode - No Database)' });
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('📝 Register request:', req.body);
    const { email, password, firstName, lastName, phone } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        errors: [
          !email && { field: 'email', message: 'Email is required' },
          !password && { field: 'password', message: 'Password is required' },
          !firstName && { field: 'firstName', message: 'First name is required' },
          !lastName && { field: 'lastName', message: 'Last name is required' }
        ].filter(Boolean)
      });
    }

    // Check if user exists
    if (users.has(email)) {
      return res.status(409).json({
        success: false,
        message: 'User already exists',
        errors: [{ field: 'email', message: 'Email already registered' }]
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userId = 'user_' + Date.now();
    const newUser = {
      id: userId,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone: phone || null,
      role: 'USER',
      createdAt: new Date()
    };

    users.set(email, newUser);

    // Generate tokens
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);
    refreshTokens.add(refreshToken);

    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          phone: newUser.phone,
          role: newUser.role,
          createdAt: newUser.createdAt
        },
        accessToken,
        refreshToken
      }
    });
    console.log('✅ User registered:', newUser.email);
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login request:', req.body);
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password required',
        errors: [
          !email && { field: 'email', message: 'Email is required' },
          !password && { field: 'password', message: 'Password is required' }
        ].filter(Boolean)
      });
    }

    // Find user
    const user = users.get(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.add(refreshToken);

    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt
        },
        accessToken,
        refreshToken
      }
    });
    console.log('✅ User logged in:', user.email);
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Get current user
app.get('/api/auth/me', (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.get(decoded.email);
    
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Refresh token
app.post('/api/auth/refresh', (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token || !refreshTokens.has(token)) {
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    const user = users.get(decoded.email);

    const newAccessToken = generateAccessToken(user);

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000
    });

    res.json({
      success: true,
      message: 'Token refreshed',
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║        Authentication Server (Mock Mode)                ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`✅ Server running on: http://localhost:${PORT}`);
  console.log(`✅ Mode: Development (In-Memory Database)`);
  console.log(`✅ No PostgreSQL required!`);
  console.log('');
  console.log('Endpoints:');
  console.log('  POST   /api/auth/register    - Register new user');
  console.log('  POST   /api/auth/login       - Login user');
  console.log('  POST   /api/auth/logout      - Logout user');
  console.log('  POST   /api/auth/refresh     - Refresh token');
  console.log('  GET    /api/auth/me          - Get current user');
  console.log('  GET    /api/health           - Health check');
  console.log('');
  console.log('⚠️  Note: Data is stored in memory and will be lost on restart');
  console.log('');
});
