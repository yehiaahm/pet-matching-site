# Redis Rate Limiting Setup Guide

## 🚀 **Quick Start**

### 1. Install Dependencies

```bash
# Core dependencies
npm install express ioredis

# Development dependencies
npm install --save-dev @types/node @types/express

# Optional: Redis for development (Docker)
docker run -d -p 6379:6379 --name redis redis:alpine
```

### 2. Environment Configuration

```bash
# .env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
NODE_ENV=development
PORT=5000
```

### 3. Basic Setup

```javascript
const express = require('express');
const RateLimitMiddleware = require('./middleware/rateLimitMiddleware');

const app = express();
const rateLimiter = new RateLimitMiddleware();

// Apply rate limiting to all routes
app.use(rateLimiter.create({
  windowMs: 60 * 1000,    // 1 minute
  maxRequests: 100,       // 100 requests per minute
  algorithm: 'sliding'
}));

app.listen(5000);
```

## 📋 **Installation & Setup**

### **Redis Setup**

#### Option 1: Local Redis Server
```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis

# Start Redis
redis-server
```

#### Option 2: Docker Redis
```bash
# Pull and run Redis
docker run -d \
  --name redis-rate-limit \
  -p 6379:6379 \
  -v redis-data:/data \
  redis:alpine \
  redis-server --appendonly yes
```

#### Option 3: Redis Cloud (Production)
```bash
# Redis Cloud
# Sign up at https://redis.com/try-free/
# Get connection string and update .env
```

### **Package.json Updates**

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "ioredis": "^5.3.2",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/express": "^4.17.17",
    "nodemon": "^3.0.1"
  },
  "scripts": {
    "dev": "nodemon server/examples/rateLimitingExample.js",
    "start": "node server/examples/rateLimitingExample.js",
    "test": "jest"
  }
}
```

## 🔧 **Configuration Options**

### **Redis Configuration**

```javascript
const rateLimiter = new RateLimitMiddleware({
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    db: 0,                           // Redis database number
    maxRetriesPerRequest: 3,         // Retry attempts
    retryDelayOnFailover: 100,       // Delay between retries (ms)
    lazyConnect: true,               // Connect on first use
    keepAlive: 30000,                // Keep-alive timeout (ms)
    family: 4,                       // IP address family (4=IPv4, 6=IPv6)
    connectTimeout: 10000            // Connection timeout (ms)
  },
  prefix: 'app:rate_limit:',         // Key prefix for Redis
  analytics: true                    // Enable analytics
});
```

### **Rate Limiting Algorithms**

#### **Fixed Window**
```javascript
// Simple, but can have traffic spikes at window boundaries
rateLimiter.create({
  windowMs: 60 * 1000,    // 1 minute window
  maxRequests: 100,       // 100 requests per window
  algorithm: 'fixed'
});
```

#### **Sliding Window** (Recommended)
```javascript
// More accurate, prevents traffic spikes
rateLimiter.create({
  windowMs: 60 * 1000,    // 1 minute sliding window
  maxRequests: 100,       // 100 requests in any 1-minute period
  algorithm: 'sliding'
});
```

#### **Token Bucket**
```javascript
// Good for burst handling
rateLimiter.create({
  windowMs: 60 * 1000,    // 1 minute
  maxRequests: 100,       // Bucket capacity
  refillRate: 50,         // Tokens added per minute
  algorithm: 'token_bucket'
});
```

## 🎯 **Rate Limiting Strategies**

### **Authentication Endpoints**
```javascript
// Login - Very strict
app.post('/api/auth/login',
  rateLimiter.createWithStrategy('auth.login'),
  authController.login
);

// Registration - Medium strict
app.post('/api/auth/register',
  rateLimiter.createWithStrategy('auth.register'),
  authController.register
);

// Password Reset - Strict
app.post('/api/auth/forgot-password',
  rateLimiter.createWithStrategy('auth.forgotPassword'),
  authController.forgotPassword
);
```

### **API Endpoints - Role-Based**
```javascript
const roleBased = rateLimiter.createRoleBased({
  anonymous: { windowMs: 60000, maxRequests: 30 },
  user: { windowMs: 60000, maxRequests: 100 },
  premium: { windowMs: 60000, maxRequests: 500 },
  admin: { windowMs: 60000, maxRequests: 1000 }
});

app.use('/api/*', roleBased);
```

### **File Upload Limits**
```javascript
// Different limits for different file types
app.post('/api/upload/image',
  rateLimiter.createWithStrategy('upload.image'),
  uploadController.uploadImage
);

app.post('/api/upload/document',
  rateLimiter.createWithStrategy('upload.document'),
  uploadController.uploadDocument
);
```

## 📊 **Monitoring & Analytics**

### **Analytics Dashboard**
```javascript
// Get analytics data
GET /api/admin/rate-limit/analytics?timeRange=24h

// Endpoint-specific analytics
GET /api/admin/rate-limit/analytics/api/pets

// Export analytics
GET /api/admin/rate-limit/export?format=json&timeRange=7d
```

### **Real-time Monitoring**
```javascript
// Real-time metrics
const realTime = await rateLimiter.getRealTimeMetrics();

// System status
const status = await rateLimiter.getStatus();

// Top endpoints
const topEndpoints = await rateLimiter.getTopEndpoints('24h');
```

### **Custom Analytics**
```javascript
// Custom analytics endpoint
app.get('/api/admin/custom-analytics', async (req, res) => {
  const analytics = await rateLimiter.getAnalytics(req.query.path, '24h');
  
  res.json({
    total: analytics.total,
    blocked: analytics.blocked,
    allowed: analytics.allowed,
    blockRate: (analytics.blocked / analytics.total * 100).toFixed(2) + '%',
    byPath: analytics.byPath,
    topIPs: analytics.topIPs
  });
});
```

## 🛡️ **Advanced Features**

### **Multiple Rate Limiters**
```javascript
app.post('/api/complex',
  rateLimiter.createMultiple([
    {
      condition: (req) => req.user?.role === 'admin',
      options: { windowMs: 60000, maxRequests: 1000 }
    },
    {
      condition: (req) => req.user?.role === 'premium',
      options: { windowMs: 60000, maxRequests: 500 }
    },
    {
      condition: () => true, // Default
      options: { windowMs: 60000, maxRequests: 100 }
    }
  ]),
  handler
);
```

### **Progressive Rate Limiting**
```javascript
app.get('/api/progressive',
  rateLimiter.createProgressive(
    { windowMs: 60000, maxRequests: 10 },
    [10, 50, 100, 500] // Progression thresholds
  ),
  handler
);
```

### **Adaptive Rate Limiting**
```javascript
app.get('/api/adaptive',
  rateLimiter.createAdaptive(
    { windowMs: 60000, maxRequests: 100 },
    {
      slowResponseThreshold: 1000,  // 1 second
      fastResponseThreshold: 100,   // 100ms
      adjustmentFactor: 0.2         // 20% adjustment
    }
  ),
  handler
);
```

### **Circuit Breaker**
```javascript
app.get('/api/circuit-breaker',
  rateLimiter.createWithCircuitBreaker(
    { windowMs: 60000, maxRequests: 100 },
    {
      failureThreshold: 5,        // 5 failures trigger circuit breaker
      recoveryTimeout: 30000      // 30 seconds recovery time
    }
  ),
  handler
);
```

## 🎛️ **Custom Configuration**

### **Custom Key Generator**
```javascript
const customRateLimit = rateLimiter.create({
  windowMs: 60000,
  maxRequests: 100,
  keyGenerator: (req) => {
    // Use combination of IP, user ID, and endpoint
    const userId = req.user?.userId || 'anonymous';
    const endpoint = req.path.replace(/\//g, ':');
    return `${userId}:${endpoint}:${req.ip}`;
  }
});
```

### **Custom Skip Logic**
```javascript
const conditionalRateLimit = rateLimiter.create({
  windowMs: 60000,
  maxRequests: 100,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || 
           req.path.startsWith('/admin/health') ||
           req.get('X-Internal-Request') === 'true';
  }
});
```

### **Custom Handlers**
```javascript
const customRateLimit = rateLimiter.create({
  windowMs: 60000,
  maxRequests: 100,
  onLimitReached: (req, res, options, result) => {
    res.status(429).json({
      error: 'Custom rate limit message',
      retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      limit: options.maxRequests,
      remaining: result.remainingRequests
    });
  },
  onSuccess: (req, res, options, result) => {
    res.set('X-Custom-Limit-Header', 'active');
    res.set('X-Requests-Remaining', result.remainingRequests);
  },
  onFailed: (req, res, options, error) => {
    console.error('Rate limiting failed:', error);
    // Continue processing if rate limiting fails
  }
});
```

## 🧪 **Testing**

### **Unit Tests**
```javascript
const request = require('supertest');
const app = require('./app');

describe('Rate Limiting', () => {
  test('should allow requests within limit', async () => {
    for (let i = 0; i < 5; i++) {
      const response = await request(app)
        .get('/api/test')
        .expect(200);
      
      expect(response.headers['x-ratelimit-remaining']).toBeDefined();
    }
  });

  test('should block requests exceeding limit', async () => {
    // Make requests up to limit
    for (let i = 0; i < 10; i++) {
      await request(app).get('/api/test');
    }
    
    // Next request should be blocked
    const response = await request(app)
      .get('/api/test')
      .expect(429);
    
    expect(response.body.error).toContain('Rate limit exceeded');
  });
});
```

### **Load Testing**
```bash
# Install artillery for load testing
npm install -g artillery

# artillery.yml config
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50

scenarios:
  - name: "API Load Test"
    requests:
      - get:
          url: "/api/test/rate-limit"

# Run load test
artillery run artillery.yml
```

## 🚨 **Production Deployment**

### **Docker Compose Setup**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - REDIS_HOST=redis
      - NODE_ENV=production
    depends_on:
      - redis

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes

volumes:
  redis-data:
```

### **Environment Variables**
```bash
# Production .env
NODE_ENV=production
REDIS_HOST=redis-cluster.example.com
REDIS_PORT=6379
REDIS_PASSWORD=your-secure-password
REDIS_TLS=true
REDIS_CLUSTER_NODES=node1:6379,node2:6379,node3:6379
```

### **Monitoring Setup**
```javascript
// Health check endpoint
app.get('/health', async (req, res) => {
  const redisStatus = await rateLimiter.getStatus();
  const healthy = redisStatus.connected;
  
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'unhealthy',
    redis: redisStatus,
    timestamp: new Date().toISOString()
  });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  const metrics = await rateLimiter.getMetrics();
  res.json(metrics);
});
```

## 🔧 **Troubleshooting**

### **Common Issues**

#### Redis Connection Failed
```javascript
// Check Redis connection
const status = await rateLimiter.getStatus();
console.log('Redis Status:', status);

// Test Redis manually
redis-cli ping
```

#### Rate Limiting Not Working
```javascript
// Check if middleware is applied correctly
app.use(rateLimiter.create({
  windowMs: 60000,
  maxRequests: 100,
  debug: true // Enable debug logging
}));
```

#### High Memory Usage
```javascript
// Configure Redis memory limits
redis-cli config set maxmemory 256mb
redis-cli config set maxmemory-policy allkeys-lru
```

### **Performance Optimization**

```javascript
// Use connection pooling
const rateLimiter = new RateLimitMiddleware({
  redis: {
    family: 4,
    keepAlive: true,
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100
  }
});

// Enable pipelining for batch operations
rateLimiter.redis.pipeline([
  ['set', 'key1', 'value1'],
  ['set', 'key2', 'value2']
]).exec();
```

## 📈 **Best Practices**

1. **Use Sliding Window** for accurate rate limiting
2. **Set Appropriate Limits** based on your use case
3. **Monitor Analytics** regularly
4. **Test Under Load** before production
5. **Use Redis Cluster** for high availability
6. **Implement Circuit Breakers** for resilience
7. **Log Rate Limit Events** for debugging
8. **Set Up Alerts** for high block rates

This comprehensive setup guide provides everything needed to implement production-ready Redis rate limiting in your Express.js application.
