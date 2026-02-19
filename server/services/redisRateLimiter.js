const Redis = require('ioredis');
const crypto = require('crypto');

class RedisRateLimiter {
  constructor(options = {}) {
    this.redis = new Redis(options.redis || {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });

    this.defaultOptions = {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100,
      keyGenerator: this.defaultKeyGenerator,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      headers: true,
      ...options
    };

    this.analyticsEnabled = options.analytics !== false;
    this.prefix = options.prefix || 'rate_limit:';
  }

  /**
   * Default key generator - uses IP address
   */
  defaultKeyGenerator(req) {
    return req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  }

  /**
   * Sliding Window Rate Limiting Algorithm
   */
  async slidingWindow(key, windowMs, maxRequests) {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    const pipeline = this.redis.pipeline();
    
    // Remove expired entries
    pipeline.zremrangebyscore(`${key}:timestamps`, 0, windowStart);
    
    // Add current request
    pipeline.zadd(`${key}:timestamps`, now, `${now}-${crypto.randomBytes(8).toString('hex')}`);
    
    // Count requests in window
    pipeline.zcard(`${key}:timestamps`);
    
    // Set expiration on the sorted set
    pipeline.expire(`${key}:timestamps`, Math.ceil(windowMs / 1000));
    
    const results = await pipeline.exec();
    const currentCount = results[2][1];
    
    return {
      currentCount,
      remainingRequests: Math.max(0, maxRequests - currentCount),
      resetTime: now + windowMs,
      isAllowed: currentCount <= maxRequests
    };
  }

  /**
   * Fixed Window Rate Limiting Algorithm
   */
  async fixedWindow(key, windowMs, maxRequests) {
    const now = Date.now();
    const windowStart = Math.floor(now / windowMs) * windowMs;
    const windowKey = `${key}:${windowStart}`;
    
    const pipeline = this.redis.pipeline();
    
    // Increment counter
    pipeline.incr(windowKey);
    
    // Set expiration
    pipeline.expire(windowKey, Math.ceil(windowMs / 1000));
    
    const results = await pipeline.exec();
    const currentCount = results[0][1];
    
    return {
      currentCount,
      remainingRequests: Math.max(0, maxRequests - currentCount),
      resetTime: windowStart + windowMs,
      isAllowed: currentCount <= maxRequests
    };
  }

  /**
   * Token Bucket Algorithm
   */
  async tokenBucket(key, capacity, refillRate, windowMs) {
    const now = Date.now();
    const bucketKey = `${key}:bucket`;
    
    const script = `
      local key = KEYS[1]
      local capacity = tonumber(ARGV[1])
      local refill_rate = tonumber(ARGV[2])
      local now = tonumber(ARGV[3])
      local window_ms = tonumber(ARGV[4])
      
      local bucket = redis.call('HMGET', key, 'tokens', 'last_refill')
      local tokens = tonumber(bucket[1]) or capacity
      local last_refill = tonumber(bucket[2]) or now
      
      -- Calculate tokens to add
      local time_passed = now - last_refill
      local tokens_to_add = math.floor((time_passed / window_ms) * refill_rate)
      
      -- Update tokens (don't exceed capacity)
      tokens = math.min(capacity, tokens + tokens_to_add)
      
      -- Check if request can be processed
      local can_process = tokens >= 1
      
      if can_process then
        tokens = tokens - 1
      end
      
      -- Update bucket
      redis.call('HMSET', key, 'tokens', tokens, 'last_refill', now)
      redis.call('EXPIRE', key, math.ceil(window_ms / 1000) * 2)
      
      return {tokens, can_process}
    `;
    
    const results = await this.redis.eval(script, 1, bucketKey, capacity, refillRate, now, windowMs);
    const [remainingTokens, canProcess] = results;
    
    return {
      currentCount: capacity - remainingTokens,
      remainingRequests: remainingTokens,
      resetTime: now + windowMs,
      isAllowed: canProcess
    };
  }

  /**
   * Check rate limit for a request
   */
  async checkLimit(req, options = {}) {
    const opts = { ...this.defaultOptions, ...options };
    const key = `${this.prefix}${opts.keyGenerator(req)}`;
    
    let result;
    
    switch (opts.algorithm) {
      case 'sliding':
        result = await this.slidingWindow(key, opts.windowMs, opts.maxRequests);
        break;
      case 'token_bucket':
        result = await this.tokenBucket(key, opts.maxRequests, opts.refillRate || opts.maxRequests, opts.windowMs);
        break;
      case 'fixed':
      default:
        result = await this.fixedWindow(key, opts.windowMs, opts.maxRequests);
        break;
    }
    
    // Log analytics if enabled
    if (this.analyticsEnabled) {
      await this.logAnalytics(req, opts, result);
    }
    
    return result;
  }

  /**
   * Log analytics data
   */
  async logAnalytics(req, options, result) {
    const analyticsKey = `${this.prefix}analytics:${Date.now()}`;
    const data = {
      ip: req.ip,
      method: req.method,
      path: req.path,
      userAgent: req.get('User-Agent'),
      timestamp: Date.now(),
      windowMs: options.windowMs,
      maxRequests: options.maxRequests,
      currentCount: result.currentCount,
      isAllowed: result.isAllowed,
      algorithm: options.algorithm || 'fixed'
    };
    
    // Store analytics with expiration (7 days)
    await this.redis.setex(analyticsKey, 7 * 24 * 60 * 60, JSON.stringify(data));
    
    // Update aggregated stats
    await this.updateAggregatedStats(data);
  }

  /**
   * Update aggregated statistics
   */
  async updateAggregatedStats(data) {
    const statsKey = `${this.prefix}stats:${data.path}:${data.algorithm}`;
    const hour = Math.floor(Date.now() / (60 * 60 * 1000));
    
    const pipeline = this.redis.pipeline();
    
    // Increment total requests
    pipeline.hincrby(statsKey, 'total_requests', 1);
    
    // Increment blocked requests
    if (!data.isAllowed) {
      pipeline.hincrby(statsKey, 'blocked_requests', 1);
    }
    
    // Update hourly breakdown
    pipeline.hincrby(`${statsKey}:hourly:${hour}`, 'requests', 1);
    if (!data.isAllowed) {
      pipeline.hincrby(`${statsKey}:hourly:${hour}`, 'blocked', 1);
    }
    
    // Set expiration for stats (30 days)
    pipeline.expire(statsKey, 30 * 24 * 60 * 60);
    pipeline.expire(`${statsKey}:hourly:${hour}`, 7 * 24 * 60 * 60);
    
    await pipeline.exec();
  }

  /**
   * Get analytics data
   */
  async getAnalytics(path, timeRange = '24h') {
    const timeRanges = {
      '1h': 1 * 60 * 60,
      '24h': 24 * 60 * 60,
      '7d': 7 * 24 * 60 * 60,
      '30d': 30 * 24 * 60 * 60
    };
    
    const seconds = timeRanges[timeRange] || timeRanges['24h'];
    const endTime = Date.now();
    const startTime = endTime - (seconds * 1000);
    
    // Get all analytics keys in time range
    const keys = await this.redis.keys(`${this.prefix}analytics:*`);
    const relevantKeys = keys.filter(key => {
      const timestamp = parseInt(key.split(':').pop());
      return timestamp >= startTime && timestamp <= endTime;
    });
    
    if (relevantKeys.length === 0) {
      return { total: 0, blocked: 0, allowed: 0, byPath: {}, byHour: {} };
    }
    
    const analytics = await this.redis.mget(relevantKeys);
    const data = analytics.map(item => JSON.parse(item)).filter(item => 
      !path || item.path === path
    );
    
    const result = {
      total: data.length,
      blocked: data.filter(item => !item.isAllowed).length,
      allowed: data.filter(item => item.isAllowed).length,
      byPath: {},
      byHour: {},
      topIPs: {},
      algorithms: {}
    };
    
    // Aggregate by path
    data.forEach(item => {
      result.byPath[item.path] = (result.byPath[item.path] || 0) + 1;
    });
    
    // Aggregate by hour
    data.forEach(item => {
      const hour = new Date(item.timestamp).getHours();
      result.byHour[hour] = (result.byHour[hour] || 0) + 1;
    });
    
    // Aggregate by IP
    data.forEach(item => {
      result.topIPs[item.ip] = (result.topIPs[item.ip] || 0) + 1;
    });
    
    // Aggregate by algorithm
    data.forEach(item => {
      result.algorithms[item.algorithm] = (result.algorithms[item.algorithm] || 0) + 1;
    });
    
    return result;
  }

  /**
   * Get current rate limit status for a key
   */
  async getStatus(key, windowMs, maxRequests, algorithm = 'sliding') {
    const fullKey = `${this.prefix}${key}`;
    
    switch (algorithm) {
      case 'sliding':
        return await this.slidingWindow(fullKey, windowMs, maxRequests);
      case 'token_bucket':
        return await this.tokenBucket(fullKey, maxRequests, maxRequests, windowMs);
      case 'fixed':
        return await this.fixedWindow(fullKey, windowMs, maxRequests);
      default:
        return await this.slidingWindow(fullKey, windowMs, maxRequests);
    }
  }

  /**
   * Reset rate limit for a key
   */
  async reset(key) {
    const fullKey = `${this.prefix}${key}`;
    await this.redis.del(`${fullKey}:timestamps`);
    await this.redis.del(`${fullKey}:bucket`);
    return true;
  }

  /**
   * Clear all rate limit data (use with caution)
   */
  async clear() {
    const keys = await this.redis.keys(`${this.prefix}*`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
    return keys.length;
  }

  /**
   * Get Redis connection status
   */
  async getStatus() {
    try {
      await this.redis.ping();
      return { connected: true, info: await this.redis.info() };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }

  /**
   * Close Redis connection
   */
  async disconnect() {
    await this.redis.disconnect();
  }
}

module.exports = RedisRateLimiter;
