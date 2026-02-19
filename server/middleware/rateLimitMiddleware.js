/**
 * Rate Limiting Middleware
 * 
 * IMPORTANT: Admin users (ADMIN & SUPER_ADMIN) have UNLIMITED access
 * and bypass all rate limiting checks. See shouldSkipRequest() method.
 * 
 * For documentation: ADMIN_UNLIMITED_ACCESS.md
 */

const RedisRateLimiter = require('../services/redisRateLimiter');
const { getAdjustedStrategy } = require('../config/rateLimitStrategies');

class RateLimitMiddleware {
  constructor(options = {}) {
    this.rateLimiter = new RedisRateLimiter(options.redis);
    this.defaultOptions = {
      onLimitReached: this.defaultOnLimitReached,
      onSuccess: this.defaultOnSuccess,
      onFailed: this.defaultOnFailed,
      analytics: true,
      ...options
    };
  }

  /**
   * Default handler when rate limit is reached
   */
  defaultOnLimitReached(req, res, options, result) {
    res.status(429).json({
      error: options.message || 'Rate limit exceeded',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      limit: options.maxRequests,
      windowMs: options.windowMs,
      current: result.currentCount,
      remaining: result.remainingRequests
    });
  }

  /**
   * Default success handler
   */
  defaultOnSuccess(req, res, options, result) {
    // Add rate limit headers
    if (options.headers) {
      res.set('X-RateLimit-Limit', options.maxRequests);
      res.set('X-RateLimit-Remaining', result.remainingRequests);
      res.set('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));
      res.set('X-RateLimit-Window', Math.ceil(options.windowMs / 1000));
      
      // Add custom headers
      Object.entries(options.headers).forEach(([key, value]) => {
        res.set(key, value);
      });
    }
  }

  /**
   * Default failed handler
   */
  defaultOnFailed(req, res, options, error) {
    console.error('Rate limiting error:', error);
    // Continue with request if rate limiting fails
    res.set('X-RateLimit-Error', 'Rate limiting service unavailable');
  }

  /**
   * Create rate limiting middleware
   */
  create(strategyOptions = {}) {
    return async (req, res, next) => {
      try {
        // Get strategy based on request
        const strategy = getAdjustedStrategy(req, strategyOptions.systemLoad);
        const options = { ...strategy, ...strategyOptions };
        
        // Check if request should be skipped
        if (this.shouldSkipRequest(req, options)) {
          return next();
        }

        // Check rate limit
        const result = await this.rateLimiter.checkLimit(req, options);
        
        if (!result.isAllowed) {
          // Rate limit exceeded
          await options.onLimitReached(req, res, options, result);
          return;
        }

        // Request allowed
        await options.onSuccess(req, res, options, result);
        
        // Attach rate limit info to request
        req.rateLimit = {
          limit: options.maxRequests,
          remaining: result.remainingRequests,
          resetTime: result.resetTime,
          current: result.currentCount,
          strategy: options.algorithm || 'fixed'
        };

        next();
      } catch (error) {
        await options.onFailed(req, res, options, error);
        next();
      }
    };
  }

  /**
   * Check if request should be skipped
   */
  shouldSkipRequest(req, options) {
    // Skip ADMIN users - no rate limiting for admins
    if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN')) {
      return true;
    }

    // Skip successful requests if configured
    if (options.skipSuccessfulRequests && req.statusCode >= 200 && req.statusCode < 300) {
      return true;
    }

    // Skip failed requests if configured
    if (options.skipFailedRequests && req.statusCode >= 400) {
      return true;
    }

    // Skip based on custom condition
    if (options.skip && typeof options.skip === 'function') {
      return options.skip(req);
    }

    // Skip health checks
    if (req.path === '/health' || req.path === '/api/health') {
      return true;
    }

    // Skip static files
    if (req.path.startsWith('/static/') || req.path.startsWith('/assets/')) {
      return true;
    }

    return false;
  }

  /**
   * Create middleware with specific strategy
   */
  createWithStrategy(strategyName, customOptions = {}) {
    const { strategies } = require('../config/rateLimitStrategies');
    const strategy = this.getNestedStrategy(strategies, strategyName);
    
    if (!strategy) {
      throw new Error(`Rate limit strategy '${strategyName}' not found`);
    }

    return this.create({ ...strategy, ...customOptions });
  }

  /**
   * Get nested strategy by name (e.g., 'auth.login')
   */
  getNestedStrategy(strategies, name) {
    const parts = name.split('.');
    let current = strategies;
    
    for (const part of parts) {
      if (current && current[part]) {
        current = current[part];
      } else {
        return null;
      }
    }
    
    return current;
  }

  /**
   * Create multiple rate limiters for different conditions
   */
  createMultiple(limiters) {
    return async (req, res, next) => {
      for (const limiter of limiters) {
        const { condition, options, handler } = limiter;
        
        // Check if condition matches
        if (condition && typeof condition === 'function' && !condition(req)) {
          continue;
        }

        // Apply rate limiting
        const middleware = this.create(options);
        
        // Create a promise to handle the middleware
        await new Promise((resolve, reject) => {
          middleware(req, res, (error) => {
            if (error) {
              reject(error);
            } else if (res.headersSent) {
              // Rate limit was triggered, stop processing
              resolve();
            } else {
              // Continue to next limiter or next middleware
              resolve();
            }
          });
        });

        // If response was sent, stop processing
        if (res.headersSent) {
          return;
        }
      }

      next();
    };
  }

  /**
   * Create conditional rate limiter
   */
  createConditional(condition, options) {
    return this.create({
      ...options,
      skip: (req) => !condition(req)
    });
  }

  /**
   * Create role-based rate limiter
   */
  createRoleBased(roleLimits) {
    return async (req, res, next) => {
      const userRole = req.user?.role || 'anonymous';
      const options = roleLimits[userRole] || roleLimits.anonymous;
      
      if (!options) {
        return next();
      }

      const middleware = this.create(options);
      middleware(req, res, next);
    };
  }

  /**
   * Create progressive rate limiter (increases limits over time)
   */
  createProgressive(baseOptions, progression) {
    return async (req, res, next) => {
      const key = baseOptions.keyGenerator(req);
      
      // Get request history for this key
      const history = await this.getRequestHistory(key, baseOptions.windowMs * 24); // 24 hours
      const totalRequests = history.length;
      
      // Calculate current level based on total requests
      let currentLevel = 0;
      for (const [level, threshold] of progression.entries()) {
        if (totalRequests >= threshold) {
          currentLevel = level;
        } else {
          break;
        }
      }
      
      // Apply progressive limits
      const progressiveOptions = {
        ...baseOptions,
        maxRequests: baseOptions.maxRequests * (1 + currentLevel * 0.5), // 50% increase per level
        windowMs: baseOptions.windowMs * (1 + currentLevel * 0.2) // 20% longer window per level
      };
      
      const middleware = this.create(progressiveOptions);
      middleware(req, res, next);
    };
  }

  /**
   * Get request history for a key
   */
  async getRequestHistory(key, timeWindow) {
    // This would need to be implemented based on your analytics storage
    // For now, return empty array
    return [];
  }

  /**
   * Create adaptive rate limiter (adjusts based on response times)
   */
  createAdaptive(baseOptions, adaptationConfig = {}) {
    const config = {
      slowResponseThreshold: 1000, // 1 second
      fastResponseThreshold: 100,  // 100ms
      adjustmentFactor: 0.2,       // 20% adjustment
      ...adaptationConfig
    };

    return async (req, res, next) => {
      const startTime = Date.now();
      
      // Store original res.json to measure response time
      const originalJson = res.json;
      const originalEnd = res.end;
      
      res.json = function(data) {
        const responseTime = Date.now() - startTime;
        const key = baseOptions.keyGenerator(req);
        
        // Adjust future limits based on response time
        this.adjustLimits(key, responseTime, config);
        
        return originalJson.call(this, data);
      };
      
      res.end = function(chunk, encoding) {
        const responseTime = Date.now() - startTime;
        const key = baseOptions.keyGenerator(req);
        
        // Adjust future limits based on response time
        this.adjustLimits(key, responseTime, config);
        
        return originalEnd.call(this, chunk, encoding);
      }.bind(this);
      
      const middleware = this.create(baseOptions);
      middleware(req, res, next);
    };
  }

  /**
   * Adjust limits based on response time
   */
  async adjustLimits(key, responseTime, config) {
    // This would implement adaptive logic to adjust future limits
    // based on system performance
    console.log(`Response time for ${key}: ${responseTime}ms`);
  }

  /**
   * Create rate limiter with circuit breaker
   */
  createWithCircuitBreaker(baseOptions, circuitOptions) {
    const circuit = {
      failures: 0,
      lastFailure: 0,
      state: 'closed', // closed, open, half-open
      ...circuitOptions
    };

    return async (req, res, next) => {
      // Check circuit breaker state
      if (circuit.state === 'open') {
        const now = Date.now();
        if (now - circuit.lastFailure > circuit.recoveryTimeout) {
          circuit.state = 'half-open';
        } else {
          return res.status(503).json({
            error: 'Service temporarily unavailable',
            code: 'CIRCUIT_BREAKER_OPEN'
          });
        }
      }

      try {
        const middleware = this.create(baseOptions);
        middleware(req, res, (error) => {
          if (error) {
            circuit.failures++;
            circuit.lastFailure = Date.now();
            
            if (circuit.failures >= circuit.failureThreshold) {
              circuit.state = 'open';
            }
            
            next(error);
          } else {
            // Success in half-open state
            if (circuit.state === 'half-open') {
              circuit.state = 'closed';
              circuit.failures = 0;
            }
            
            next();
          }
        });
      } catch (error) {
        circuit.failures++;
        circuit.lastFailure = Date.now();
        
        if (circuit.failures >= circuit.failureThreshold) {
          circuit.state = 'open';
        }
        
        next(error);
      }
    };
  }

  /**
   * Get rate limiter statistics
   */
  async getStats(path = null, timeRange = '24h') {
    return await this.rateLimiter.getAnalytics(path, timeRange);
  }

  /**
   * Reset rate limit for a specific key
   */
  async reset(key) {
    return await this.rateLimiter.reset(key);
  }

  /**
   * Get Redis status
   */
  async getStatus() {
    return await this.rateLimiter.getStatus();
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    await this.rateLimiter.disconnect();
  }
}

module.exports = RateLimitMiddleware;
