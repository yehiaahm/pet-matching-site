# 🚀 RATE LIMIT CONFIGURATION QUICK REFERENCE

## Environment Variables

Place these in your `.env` file to override defaults:

```bash
# Rate Limiting Configuration

# Time window for rate limit (in milliseconds)
# Default: 3600000 (1 hour)
# Examples:
#   900000 = 15 minutes
#   3600000 = 1 hour
#   86400000 = 24 hours
RATE_LIMIT_WINDOW_MS=3600000

# Max requests allowed per window
# Default: 1000 (for general API)
# Examples:
#   5 = Very strict
#   100 = Development
#   1000 = Generous
#   10000 = No real limit
RATE_LIMIT_MAX_REQUESTS=1000
```

## Code Locations

### General API Rate Limit
**File**: `server/config/index.js` (Lines 73-76)
```javascript
rateLimit: {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60 * 60 * 1000,
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 1000,
}
```

### Auth-Specific Rate Limit
**File**: `server/middleware/security.js` (Lines 76-84)
```javascript
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 30,                    // 30 requests per hour
  message: { status: 'error', message: '...' },
});
```

## Configuration Presets

### Development
```javascript
General API: 1000/hour (~16/min)
Auth: 30/hour (~0.5/min)
Use Case: Local development, testing
```

### Staging
```javascript
General API: 500/hour (~8/min)
Auth: 20/hour (~0.33/min)
Use Case: Pre-production testing
```

### Production
```javascript
General API: 100/hour (~1.67/min)
Auth: 10/hour (~0.17/min)
Use Case: Live server, real users
```

## How to Change Rate Limits

### Option 1: Environment Variables (Recommended)
```bash
# In .env file:
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=1000
```

### Option 2: Code (Quick Testing)
```javascript
// In server/config/index.js:
rateLimit: {
  windowMs: 60 * 60 * 1000,  // Change this
  maxRequests: 1000,         // Change this
}
```

## Request Rate Calculations

```
Formula: (maxRequests * 1000) / windowMs = requests per second

Example 1: 1000 requests per hour
(1000 * 1000) / 3600000 = 0.278 requests/sec
= 16.67 requests/min
= 1000 requests/hour ✅

Example 2: 30 requests per hour
(30 * 1000) / 3600000 = 0.0083 requests/sec
= 0.5 requests/min
= 30 requests/hour ✅

Example 3: 100 requests per 15 minutes
(100 * 1000) / 900000 = 0.111 requests/sec
= 6.67 requests/min
= 100 requests/15min ✅
```

## Troubleshooting Rate Limits

### Problem: Getting 429 Too Many Requests

**Check 1: Verify Configuration**
```javascript
console.log(config.rateLimit);
// Should show: { windowMs: 3600000, maxRequests: 1000 }
```

**Check 2: Count Your Requests**
```javascript
// You might be hitting the limit legitimately
// Try waiting 5 minutes before retrying
// OR increase maxRequests value
```

**Check 3: Check Backend Logs**
```
Server console should show:
"Rate limit exceeded for IP: 127.0.0.1"
```

### Problem: Not Getting Rate Limited (When Should)

**Solution 1: Verify Limiter is Applied**
```javascript
app.use(`${config.api.prefix}/${config.api.version}`, limiter);
```

**Solution 2: Check IP Address**
```javascript
// Rate limiting is per-IP
// Different IP = different counter
// VPN/Proxy changes IP = resets counter
```

**Solution 3: Check Window Expiration**
```
If 1 hour window:
10:00 AM: 1000 requests (limit reached)
11:01 AM: Counter resets, can make 1000 more
```

## Testing Rate Limits

### Bash Script Test
```bash
#!/bin/bash

echo "Testing Rate Limit..."

for i in {1..35}; do
  echo "Request $i:"
  curl -X POST http://localhost:5000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"Password123"}' \
    -s -w "Status: %{http_code}\n"
  sleep 1
done

# After 30 requests, should get 429
```

### Postman Test
```
1. Create new request to POST /api/v1/auth/login
2. Add credentials in body
3. Run > Send multiple times (Alt+Click > Send)
4. Watch status codes
5. After 30 requests, should get 429
```

### Browser DevTools Test
```javascript
// In browser console:
for (let i = 1; i <= 35; i++) {
  fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@test.com',
      password: 'Password123'
    })
  })
  .then(res => console.log(`Request ${i}: ${res.status}`))
  .catch(err => console.error(`Request ${i}: Error`));
  
  await new Promise(resolve => setTimeout(resolve, 1000));
}

// After 30 requests, should see 429
```

## Rate Limit Response Headers

When rate limited, you'll get:

```
HTTP/1.1 429 Too Many Requests

RateLimit-Limit: 30
RateLimit-Remaining: 0
RateLimit-Reset: 1634567890

{
  "status": "error",
  "message": "Too many requests from this IP, please try again later."
}
```

**Header Meanings:**
- `RateLimit-Limit`: Max requests in window
- `RateLimit-Remaining`: Requests left in current window
- `RateLimit-Reset`: Unix timestamp when window resets

## Production Best Practices

### Tier 1: Public API
```javascript
windowMs: 60 * 60 * 1000,  // 1 hour
max: 100,                  // 100 requests/hour
```

### Tier 2: Authenticated Users
```javascript
windowMs: 60 * 60 * 1000,  // 1 hour
max: 500,                  // 500 requests/hour
```

### Tier 3: Premium Subscribers
```javascript
windowMs: 24 * 60 * 60 * 1000,  // 1 day
max: 10000,                     // 10000 requests/day
```

### Tier 4: Internal Services
```javascript
// No rate limit for internal calls
// Or very high limit
windowMs: 24 * 60 * 60 * 1000,
max: 100000,
```

## FAQ

**Q: Why am I getting 429?**
A: You've made more requests than allowed in the time window. Either wait for the window to expire or increase the `max` value.

**Q: Does rate limiting persist across server restarts?**
A: No. Rate limit counters are in-memory. They reset when you restart the server.

**Q: Can I have different rate limits for different endpoints?**
A: Yes! You can create separate limiters for different paths:
```javascript
const globalLimiter = rateLimit({ windowMs: 3600000, max: 1000 });
const authLimiter = rateLimit({ windowMs: 3600000, max: 30 });

app.use('/api/v1', globalLimiter);
app.use('/api/v1/auth', authLimiter);  // Override for auth
```

**Q: Can I exclude certain IPs from rate limiting?**
A: Yes! Use the `skip` option:
```javascript
const limiter = rateLimit({
  windowMs: 3600000,
  max: 1000,
  skip: (req) => req.ip === '127.0.0.1'  // Skip localhost
});
```

**Q: What's the difference between these?**
```
windowMs: Time period for counting
max: Number of requests allowed in that period

Example: windowMs: 3600000, max: 100
= 100 requests per 3600000ms (1 hour)
```

## Related Files

- Config: [server/config/index.js](server/config/index.js)
- Middleware: [server/middleware/security.js](server/middleware/security.js)
- Documentation: [HTTP_429_TOO_MANY_REQUESTS_FIX.md](HTTP_429_TOO_MANY_REQUESTS_FIX.md)

---

**Last Updated**: Just Now
**Status**: ✅ Rate Limiting Configured
**Development Limits**: 1000/hour (general), 30/hour (auth)
