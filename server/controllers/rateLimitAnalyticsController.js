const RedisRateLimiter = require('../services/redisRateLimiter');

class RateLimitAnalyticsController {
  constructor() {
    this.rateLimiter = new RedisRateLimiter();
  }

  /**
   * Get rate limiting analytics dashboard data
   */
  async getDashboard(req, res) {
    try {
      const timeRange = req.query.timeRange || '24h';
      const path = req.query.path;
      
      // Get overall analytics
      const analytics = await this.rateLimiter.getAnalytics(path, timeRange);
      
      // Get top endpoints
      const topEndpoints = await this.getTopEndpoints(timeRange);
      
      // Get system status
      const systemStatus = await this.getSystemStatus();
      
      // Get algorithm performance
      const algorithmPerformance = await this.getAlgorithmPerformance(timeRange);
      
      // Get real-time metrics
      const realTimeMetrics = await this.getRealTimeMetrics();
      
      res.json({
        success: true,
        timeRange,
        data: {
          overview: analytics,
          topEndpoints,
          systemStatus,
          algorithmPerformance,
          realTimeMetrics
        }
      });
    } catch (error) {
      console.error('Analytics dashboard error:', error);
      res.status(500).json({
        error: 'Failed to fetch analytics data',
        message: error.message
      });
    }
  }

  /**
   * Get top endpoints by request count
   */
  async getTopEndpoints(timeRange = '24h') {
    try {
      const keys = await this.rateLimiter.redis.keys('rate_limit:stats:*');
      const endpoints = [];
      
      for (const key of keys) {
        const parts = key.split(':');
        if (parts.length >= 4) {
          const path = parts[2];
          const algorithm = parts[3];
          
          const stats = await this.rateLimiter.redis.hgetall(key);
          if (stats.total_requests) {
            endpoints.push({
              path,
              algorithm,
              totalRequests: parseInt(stats.total_requests),
              blockedRequests: parseInt(stats.blocked_requests || 0),
              blockRate: (parseInt(stats.blocked_requests || 0) / parseInt(stats.total_requests) * 100).toFixed(2)
            });
          }
        }
      }
      
      // Sort by total requests and return top 10
      return endpoints
        .sort((a, b) => b.totalRequests - a.totalRequests)
        .slice(0, 10);
    } catch (error) {
      console.error('Error getting top endpoints:', error);
      return [];
    }
  }

  /**
   * Get system status
   */
  async getSystemStatus() {
    try {
      const redisStatus = await this.rateLimiter.getStatus();
      const memoryUsage = process.memoryUsage();
      const uptime = process.uptime();
      
      // Get Redis info
      let redisInfo = {};
      if (redisStatus.connected) {
        const info = await this.rateLimiter.redis.info('memory');
        redisInfo = this.parseRedisInfo(info);
      }
      
      return {
        redis: {
          connected: redisStatus.connected,
          error: redisStatus.error,
          memory: redisInfo.used_memory_human,
          keys: await this.getActiveKeysCount()
        },
        application: {
          uptime: Math.floor(uptime),
          memory: {
            rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB'
          }
        }
      };
    } catch (error) {
      console.error('Error getting system status:', error);
      return { error: error.message };
    }
  }

  /**
   * Parse Redis INFO response
   */
  parseRedisInfo(info) {
    const lines = info.split('\r\n');
    const result = {};
    
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        result[key] = value;
      }
    }
    
    return result;
  }

  /**
   * Get active keys count
   */
  async getActiveKeysCount() {
    try {
      const keys = await this.rateLimiter.redis.keys('rate_limit:*');
      return keys.length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get algorithm performance comparison
   */
  async getAlgorithmPerformance(timeRange = '24h') {
    try {
      const algorithms = ['fixed', 'sliding', 'token_bucket'];
      const performance = {};
      
      for (const algorithm of algorithms) {
        const analytics = await this.rateLimiter.getAnalytics(null, timeRange);
        const algorithmData = analytics.algorithms[algorithm] || 0;
        
        performance[algorithm] = {
          requests: algorithmData,
          percentage: analytics.total > 0 ? ((algorithmData / analytics.total) * 100).toFixed(2) : 0
        };
      }
      
      return performance;
    } catch (error) {
      console.error('Error getting algorithm performance:', error);
      return {};
    }
  }

  /**
   * Get real-time metrics
   */
  async getRealTimeMetrics() {
    try {
      const now = Date.now();
      const oneMinuteAgo = now - 60000;
      
      // Get recent analytics
      const keys = await this.rateLimiter.redis.keys('rate_limit:analytics:*');
      const recentKeys = keys.filter(key => {
        const timestamp = parseInt(key.split(':').pop());
        return timestamp >= oneMinuteAgo && timestamp <= now;
      });
      
      const recentAnalytics = await this.rateLimiter.redis.mget(recentKeys);
      const data = recentAnalytics.map(item => JSON.parse(item)).filter(Boolean);
      
      const requestsPerSecond = data.length / 60;
      const blockedRate = data.filter(item => !item.isAllowed).length / data.length * 100;
      
      return {
        requestsPerSecond: requestsPerSecond.toFixed(2),
        blockedRate: blockedRate.toFixed(2),
        activeConnections: recentKeys.length,
        timestamp: new Date(now).toISOString()
      };
    } catch (error) {
      console.error('Error getting real-time metrics:', error);
      return {
        requestsPerSecond: '0',
        blockedRate: '0',
        activeConnections: 0,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get detailed analytics for specific endpoint
   */
  async getEndpointAnalytics(req, res) {
    try {
      const { path } = req.params;
      const timeRange = req.query.timeRange || '24h';
      
      const analytics = await this.rateLimiter.getAnalytics(path, timeRange);
      
      // Get hourly breakdown
      const hourlyBreakdown = await this.getHourlyBreakdown(path, timeRange);
      
      // Get IP distribution
      const ipDistribution = await this.getIPDistribution(path, timeRange);
      
      res.json({
        success: true,
        path,
        timeRange,
        data: {
          overview: analytics,
          hourlyBreakdown,
          ipDistribution
        }
      });
    } catch (error) {
      console.error('Endpoint analytics error:', error);
      res.status(500).json({
        error: 'Failed to fetch endpoint analytics',
        message: error.message
      });
    }
  }

  /**
   * Get hourly breakdown for an endpoint
   */
  async getHourlyBreakdown(path, timeRange) {
    try {
      const timeRanges = {
        '1h': 1,
        '24h': 24,
        '7d': 168,
        '30d': 720
      };
      
      const hours = timeRanges[timeRange] || 24;
      const breakdown = [];
      
      for (let i = 0; i < hours; i++) {
        const hourKey = `rate_limit:stats:${path}:hourly:${i}`;
        const stats = await this.rateLimiter.redis.hgetall(hourKey);
        
        breakdown.push({
          hour: i,
          requests: parseInt(stats.requests || 0),
          blocked: parseInt(stats.blocked || 0)
        });
      }
      
      return breakdown;
    } catch (error) {
      console.error('Error getting hourly breakdown:', error);
      return [];
    }
  }

  /**
   * Get IP distribution for an endpoint
   */
  async getIPDistribution(path, timeRange) {
    try {
      const timeRanges = {
        '1h': 1 * 60 * 60,
        '24h': 24 * 60 * 60,
        '7d': 7 * 24 * 60 * 60,
        '30d': 30 * 24 * 60 * 60
      };
      
      const seconds = timeRanges[timeRange] || timeRanges['24h'];
      const endTime = Date.now();
      const startTime = endTime - (seconds * 1000);
      
      const keys = await this.rateLimiter.redis.keys('rate_limit:analytics:*');
      const relevantKeys = keys.filter(key => {
        const timestamp = parseInt(key.split(':').pop());
        return timestamp >= startTime && timestamp <= endTime;
      });
      
      const analytics = await this.rateLimiter.redis.mget(relevantKeys);
      const data = analytics.map(item => JSON.parse(item)).filter(item => 
        item.path === path
      );
      
      const ipCounts = {};
      data.forEach(item => {
        ipCounts[item.ip] = (ipCounts[item.ip] || 0) + 1;
      });
      
      // Return top 10 IPs
      return Object.entries(ipCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([ip, count]) => ({ ip, count }));
    } catch (error) {
      console.error('Error getting IP distribution:', error);
      return [];
    }
  }

  /**
   * Reset rate limit for a specific IP or endpoint
   */
  async resetRateLimit(req, res) {
    try {
      const { key } = req.body;
      
      if (!key) {
        return res.status(400).json({
          error: 'Key is required for reset',
          example: { key: '192.168.1.1' }
        });
      }
      
      const result = await this.rateLimiter.reset(key);
      
      res.json({
        success: true,
        message: `Rate limit reset for key: ${key}`,
        reset: result
      });
    } catch (error) {
      console.error('Reset rate limit error:', error);
      res.status(500).json({
        error: 'Failed to reset rate limit',
        message: error.message
      });
    }
  }

  /**
   * Get rate limiting configuration
   */
  async getConfiguration(req, res) {
    try {
      const { strategies } = require('../config/rateLimitStrategies');
      
      res.json({
        success: true,
        strategies,
        algorithms: ['fixed', 'sliding', 'token_bucket'],
        features: {
          analytics: true,
          dynamicAdjustment: true,
          roleBasedLimits: true,
          circuitBreaker: true,
          progressiveLimits: true
        }
      });
    } catch (error) {
      console.error('Get configuration error:', error);
      res.status(500).json({
        error: 'Failed to get configuration',
        message: error.message
      });
    }
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(req, res) {
    try {
      const { format = 'json', timeRange = '24h', path } = req.query;
      
      const analytics = await this.rateLimiter.getAnalytics(path, timeRange);
      
      if (format === 'csv') {
        const csv = this.convertToCSV(analytics);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="rate-limit-analytics-${Date.now()}.csv"`);
        res.send(csv);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="rate-limit-analytics-${Date.now()}.json"`);
        res.json(analytics);
      }
    } catch (error) {
      console.error('Export analytics error:', error);
      res.status(500).json({
        error: 'Failed to export analytics',
        message: error.message
      });
    }
  }

  /**
   * Convert analytics data to CSV format
   */
  convertToCSV(data) {
    const headers = ['Timestamp', 'IP', 'Method', 'Path', 'Algorithm', 'Total Requests', 'Blocked Requests', 'Is Allowed'];
    const rows = [headers.join(',')];
    
    // This would need to be implemented based on your data structure
    // For now, return basic CSV
    rows.push('No data available');
    
    return rows.join('\n');
  }

  /**
   * Setup analytics routes
   */
  setupRoutes(app) {
    // Analytics dashboard
    app.get('/api/admin/rate-limit/analytics', this.getDashboard.bind(this));
    
    // Endpoint-specific analytics
    app.get('/api/admin/rate-limit/analytics/:path', this.getEndpointAnalytics.bind(this));
    
    // Configuration
    app.get('/api/admin/rate-limit/config', this.getConfiguration.bind(this));
    
    // Reset rate limit
    app.post('/api/admin/rate-limit/reset', this.resetRateLimit.bind(this));
    
    // Export analytics
    app.get('/api/admin/rate-limit/export', this.exportAnalytics.bind(this));
    
    // Health check for analytics service
    app.get('/api/admin/rate-limit/health', async (req, res) => {
      const status = await this.rateLimiter.getStatus();
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'rate-limit-analytics',
        redis: status.connected
      });
    });
  }
}

module.exports = RateLimitAnalyticsController;
