/**
 * Complete Rate Limiting Implementation Example
 * Shows how to integrate Redis-based rate limiting in Express.js
 */

const express = require('express');
const RedisRateLimiter = require('../services/redisRateLimiter');
const RateLimitMiddleware = require('../middleware/rateLimitMiddleware');
const RateLimitAnalyticsController = require('../controllers/rateLimitAnalyticsController');

// Initialize Express app
const app = express();
app.use(express.json());

// Initialize rate limiting components
const rateLimiter = new RedisRateLimiter({
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  },
  prefix: 'petmat:rate_limit:',
  analytics: true
});

const rateLimitMiddleware = new RateLimitMiddleware({
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  }
});

const analyticsController = new RateLimitAnalyticsController();

// Setup analytics routes
analyticsController.setupRoutes(app);

// ===== AUTHENTICATION ENDPOINTS =====

// Login rate limiting - very strict
app.post('/api/auth/login',
  rateLimitMiddleware.createWithStrategy('auth.login'),
  async (req, res) => {
    // Login logic here
    const { email, password } = req.body;
    
    // Simulate authentication
    if (email === 'user@example.com' && password === 'password') {
      res.json({
        success: true,
        message: 'Login successful',
        rateLimit: req.rateLimit
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  }
);

// Registration rate limiting
app.post('/api/auth/register',
  rateLimitMiddleware.createWithStrategy('auth.register'),
  async (req, res) => {
    // Registration logic here
    const { email, password, firstName, lastName } = req.body;
    
    res.json({
      success: true,
      message: 'Registration successful',
      user: { email, firstName, lastName },
      rateLimit: req.rateLimit
    });
  }
);

// Forgot password rate limiting
app.post('/api/auth/forgot-password',
  rateLimitMiddleware.createWithStrategy('auth.forgotPassword'),
  async (req, res) => {
    const { email } = req.body;
    
    res.json({
      success: true,
      message: 'Password reset email sent',
      rateLimit: req.rateLimit
    });
  }
);

// Token refresh rate limiting
app.post('/api/auth/refresh',
  rateLimitMiddleware.createWithStrategy('auth.refreshToken'),
  async (req, res) => {
    res.json({
      success: true,
      message: 'Token refreshed',
      accessToken: 'new-access-token',
      rateLimit: req.rateLimit
    });
  }
);

// ===== API ENDPOINTS WITH ROLE-BASED LIMITS =====

// Role-based rate limiting middleware
const roleBasedRateLimit = rateLimitMiddleware.createRoleBased({
  anonymous: {
    windowMs: 60 * 1000,
    maxRequests: 30,
    algorithm: 'sliding',
    keyGenerator: (req) => `api:anonymous:${req.ip}`
  },
  user: {
    windowMs: 60 * 1000,
    maxRequests: 60,
    algorithm: 'sliding',
    keyGenerator: (req) => `api:user:${req.user?.userId || req.ip}`
  },
  premium: {
    windowMs: 60 * 1000,
    maxRequests: 300,
    algorithm: 'sliding',
    keyGenerator: (req) => `api:premium:${req.user?.userId || req.ip}`
  },
  admin: {
    windowMs: 60 * 1000,
    maxRequests: 500,
    algorithm: 'sliding',
    keyGenerator: (req) => `api:admin:${req.user?.userId || req.ip}`
  }
});

// Apply role-based rate limiting to API routes
app.use('/api/pets', roleBasedRateLimit);

// Pet endpoints
app.get('/api/pets', async (req, res) => {
  // Mock user for demonstration
  req.user = { userId: 'user123', role: 'user' };
  
  res.json({
    success: true,
    pets: [
      { id: 1, name: 'Fluffy', type: 'cat' },
      { id: 2, name: 'Buddy', type: 'dog' }
    ],
    rateLimit: req.rateLimit
  });
});

app.post('/api/pets', async (req, res) => {
  // Mock user for demonstration
  req.user = { userId: 'user123', role: 'user' };
  
  const { name, type } = req.body;
  
  res.json({
    success: true,
    pet: { id: 3, name, type },
    rateLimit: req.rateLimit
  });
});

// ===== FILE UPLOAD ENDPOINTS =====

// Image upload rate limiting
app.post('/api/upload/image',
  rateLimitMiddleware.createWithStrategy('upload.image'),
  async (req, res) => {
    // Mock user for demonstration
    req.user = { userId: 'user123', role: 'user' };
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      url: 'https://example.com/image.jpg',
      rateLimit: req.rateLimit
    });
  }
);

// Document upload rate limiting
app.post('/api/upload/document',
  rateLimitMiddleware.createWithStrategy('upload.document'),
  async (req, res) => {
    // Mock user for demonstration
    req.user = { userId: 'user123', role: 'user' };
    
    res.json({
      success: true,
      message: 'Document uploaded successfully',
      url: 'https://example.com/document.pdf',
      rateLimit: req.rateLimit
    });
  }
);

// ===== SEARCH ENDPOINTS =====

// General search rate limiting
app.get('/api/search',
  rateLimitMiddleware.createWithStrategy('search.general'),
  async (req, res) => {
    const { q } = req.query;
    
    res.json({
      success: true,
      query: q,
      results: [
        { id: 1, name: 'Fluffy', type: 'cat' },
        { id: 2, name: 'Buddy', type: 'dog' }
      ],
      rateLimit: req.rateLimit
    });
  }
);

// Advanced search rate limiting
app.post('/api/search/advanced',
  rateLimitMiddleware.createWithStrategy('search.advanced'),
  async (req, res) => {
    const { filters, sort } = req.body;
    
    res.json({
      success: true,
      filters,
      sort,
      results: [
        { id: 1, name: 'Fluffy', type: 'cat', age: 2 },
        { id: 2, name: 'Buddy', type: 'dog', age: 3 }
      ],
      rateLimit: req.rateLimit
    });
  }
);

// ===== ADVANCED RATE LIMITING EXAMPLES =====

// Multiple rate limiters for different conditions
app.post('/api/complex-endpoint',
  rateLimitMiddleware.createMultiple([
    {
      condition: (req) => req.user?.role === 'admin',
      options: {
        windowMs: 60 * 1000,
        maxRequests: 1000,
        algorithm: 'token_bucket',
        keyGenerator: (req) => `complex:admin:${req.user.userId}`
      }
    },
    {
      condition: (req) => req.user?.role === 'premium',
      options: {
        windowMs: 60 * 1000,
        maxRequests: 300,
        algorithm: 'sliding',
        keyGenerator: (req) => `complex:premium:${req.user.userId}`
      }
    },
    {
      condition: (req) => true, // Default for all other users
      options: {
        windowMs: 60 * 1000,
        maxRequests: 60,
        algorithm: 'sliding',
        keyGenerator: (req) => `complex:default:${req.ip}`
      }
    }
  ]),
  async (req, res) => {
    res.json({
      success: true,
      message: 'Complex endpoint response',
      rateLimit: req.rateLimit
    });
  }
);

// Progressive rate limiting (increases limits over time)
app.get('/api/progressive',
  rateLimitMiddleware.createProgressive(
    {
      windowMs: 60 * 1000,
      maxRequests: 10,
      algorithm: 'sliding',
      keyGenerator: (req) => `progressive:${req.ip}`
    },
    [10, 50, 100, 500] // Thresholds for progression
  ),
  async (req, res) => {
    res.json({
      success: true,
      message: 'Progressive rate limiting endpoint',
      rateLimit: req.rateLimit
    });
  }
);

// Adaptive rate limiting (adjusts based on response time)
app.get('/api/adaptive',
  rateLimitMiddleware.createAdaptive(
    {
      windowMs: 60 * 1000,
      maxRequests: 100,
      algorithm: 'sliding',
      keyGenerator: (req) => `adaptive:${req.ip}`
    },
    {
      slowResponseThreshold: 500,
      fastResponseThreshold: 50,
      adjustmentFactor: 0.3
    }
  ),
  async (req, res) => {
    // Simulate variable response time
    const delay = Math.random() * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    res.json({
      success: true,
      message: 'Adaptive rate limiting endpoint',
      delay: delay,
      rateLimit: req.rateLimit
    });
  }
);

// Circuit breaker rate limiting
app.get('/api/circuit-breaker',
  rateLimitMiddleware.createWithCircuitBreaker(
    {
      windowMs: 60 * 1000,
      maxRequests: 100,
      algorithm: 'sliding',
      keyGenerator: (req) => `circuit:${req.ip}`
    },
    {
      failureThreshold: 5,
      recoveryTimeout: 30000 // 30 seconds
    }
  ),
  async (req, res) => {
    // Simulate random failures
    if (Math.random() < 0.3) {
      return res.status(500).json({
        success: false,
        message: 'Simulated failure'
      });
    }
    
    res.json({
      success: true,
      message: 'Circuit breaker endpoint',
      rateLimit: req.rateLimit
    });
  }
);

// ===== CUSTOM RATE LIMITING EXAMPLES =====

// Custom key generator for API key based limiting
const apiKeyRateLimit = rateLimitMiddleware.create({
  windowMs: 60 * 1000,
  maxRequests: 1000,
  algorithm: 'token_bucket',
  keyGenerator: (req) => {
    const apiKey = req.get('X-API-Key');
    return `apikey:${apiKey || req.ip}`;
  },
  message: 'API key rate limit exceeded'
});

app.get('/api/protected', apiKeyRateLimit, async (req, res) => {
  res.json({
    success: true,
    message: 'API key protected endpoint',
    rateLimit: req.rateLimit
  });
});

// Conditional rate limiting based on request size
const uploadSizeRateLimit = rateLimitMiddleware.createConditional(
  (req) => {
    const contentLength = req.get('Content-Length');
    return contentLength && parseInt(contentLength) > 1024 * 1024; // 1MB
  },
  {
    windowMs: 60 * 1000,
    maxRequests: 5, // Stricter limit for large uploads
    algorithm: 'sliding',
    keyGenerator: (req) => `large-upload:${req.ip}`,
    message: 'Large upload rate limit exceeded'
  }
);

app.post('/api/upload/large', uploadSizeRateLimit, async (req, res) => {
  res.json({
    success: true,
    message: 'Large upload endpoint',
    rateLimit: req.rateLimit
  });
});

// ===== DEMO ENDPOINTS =====

// Test rate limiting
app.get('/api/test/rate-limit', async (req, res) => {
  const limit = req.rateLimit || {};
  
  res.json({
    success: true,
    message: 'Rate limiting test endpoint',
    rateLimit: limit,
    timestamp: new Date().toISOString(),
    ip: req.ip
  });
});

// Reset rate limit for testing
app.post('/api/test/reset-rate-limit', async (req, res) => {
  const { key } = req.body;
  const resetKey = key || req.ip;
  
  try {
    await rateLimiter.reset(resetKey);
    res.json({
      success: true,
      message: `Rate limit reset for: ${resetKey}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reset rate limit',
      error: error.message
    });
  }
});

// Get current rate limit status
app.get('/api/test/rate-limit-status/:key?', async (req, res) => {
  const key = req.params.key || req.ip;
  
  try {
    const status = await rateLimiter.getStatus(key, 60 * 1000, 100, 'sliding');
    res.json({
      success: true,
      key,
      status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get rate limit status',
      error: error.message
    });
  }
});

// ===== ERROR HANDLING =====

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path
  });
});

// ===== START SERVER =====

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Rate limiting analytics: http://localhost:${PORT}/api/admin/rate-limit/analytics`);
  console.log(`🔧 Rate limiting config: http://localhost:${PORT}/api/admin/rate-limit/config`);
  console.log(`🧪 Test rate limiting: http://localhost:${PORT}/api/test/rate-limit`);
  
  // Test Redis connection
  const redisStatus = await rateLimiter.getStatus();
  if (redisStatus.connected) {
    console.log('✅ Redis connected successfully');
  } else {
    console.error('❌ Redis connection failed:', redisStatus.error);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 Shutting down gracefully...');
  await rateLimiter.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 Shutting down gracefully...');
  await rateLimiter.disconnect();
  process.exit(0);
});

module.exports = app;
