const JWTService = require('../services/jwtService');
const CookieMiddleware = require('../middleware/cookieMiddleware');

class JWTAuthMiddleware {
  constructor() {
    this.jwtService = new JWTService();
    this.cookieMiddleware = new CookieMiddleware();
  }

  /**
   * Authenticate user using JWT access token
   */
  authenticate() {
    return async (req, res, next) => {
      try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith('Bearer ') 
          ? authHeader.substring(7) 
          : null;

        if (!token) {
          return res.status(401).json({
            error: 'Access token required',
            code: 'TOKEN_MISSING'
          });
        }

        // Validate token format
        if (!this.jwtService.validateTokenFormat(token)) {
          return res.status(401).json({
            error: 'Invalid token format',
            code: 'TOKEN_INVALID_FORMAT'
          });
        }

        // Verify access token
        const decoded = await this.jwtService.verifyAccessToken(token);
        
        // Attach user info to request
        req.user = decoded;
        req.token = token;

        // Log authentication
        console.log(`User authenticated: ${decoded.userId} for ${req.method} ${req.path}`);

        next();
      } catch (error) {
        console.error('Authentication error:', error.message);

        let statusCode = 401;
        let errorCode = 'TOKEN_INVALID';
        let message = 'Invalid or expired access token';

        if (error.message === 'Access token expired') {
          errorCode = 'TOKEN_EXPIRED';
          message = 'Access token has expired';
        } else if (error.message === 'Token has been revoked') {
          errorCode = 'TOKEN_REVOKED';
          message = 'Token has been revoked';
        }

        return res.status(statusCode).json({
          error: message,
          code: errorCode,
          requiresRefresh: errorCode === 'TOKEN_EXPIRED'
        });
      }
    };
  }

  /**
   * Optional authentication - doesn't fail if no token
   */
  optionalAuthenticate() {
    return async (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith('Bearer ') 
          ? authHeader.substring(7) 
          : null;

        if (token && this.jwtService.validateTokenFormat(token)) {
          try {
            const decoded = await this.jwtService.verifyAccessToken(token);
            req.user = decoded;
            req.token = token;
          } catch (error) {
            // Optional auth - continue without user info
            console.warn('Optional auth failed:', error.message);
          }
        }

        next();
      } catch (error) {
        // Optional auth - continue without user info
        next();
      }
    };
  }

  /**
   * Role-based authorization
   */
  authorize(roles = []) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      const userRole = req.user.role;
      const hasRole = roles.includes(userRole) || roles.includes('*');

      if (!hasRole) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: roles,
          current: userRole
        });
      }

      next();
    };
  }

  /**
   * Resource ownership authorization
   */
  authorizeOwner(resourceIdParam = 'id', ownerField = 'userId') {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            error: 'Authentication required',
            code: 'AUTH_REQUIRED'
          });
        }

        const resourceId = req.params[resourceIdParam];
        const userId = req.user.userId;

        // Admin can access any resource
        if (req.user.role === 'admin') {
          return next();
        }

        // Check if user owns the resource
        // This would typically involve a database query
        // For now, we'll assume the resource ID matches the user ID
        if (resourceId !== userId) {
          return res.status(403).json({
            error: 'Access denied - resource ownership required',
            code: 'RESOURCE_ACCESS_DENIED'
          });
        }

        next();
      } catch (error) {
        console.error('Owner authorization error:', error);
        res.status(500).json({
          error: 'Authorization check failed',
          code: 'AUTH_CHECK_FAILED'
        });
      }
    };
  }

  /**
   * Rate limiting for authenticated users
   */
  authenticatedRateLimit(maxRequests = 100, windowMs = 15 * 60 * 1000) {
    const requests = new Map(); // userId -> { count, resetTime }

    return (req, res, next) => {
      if (!req.user) {
        return next(); // Skip if not authenticated
      }

      const userId = req.user.userId;
      const now = Date.now();

      // Clean up expired entries
      for (const [uid, data] of requests.entries()) {
        if (now > data.resetTime) {
          requests.delete(uid);
        }
      }

      // Check current requests
      const userData = requests.get(userId);

      if (userData && now < userData.resetTime) {
        if (userData.count >= maxRequests) {
          const remainingTime = Math.ceil((userData.resetTime - now) / 1000);
          res.set('Retry-After', remainingTime);
          return res.status(429).json({
            error: 'Too many requests',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: remainingTime,
            limit: maxRequests,
            window: windowMs / 1000
          });
        }

        userData.count++;
      } else {
        requests.set(userId, {
          count: 1,
          resetTime: now + windowMs
        });
      }

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': Math.max(0, maxRequests - (userData?.count || 0)),
        'X-RateLimit-Reset': Math.ceil((userData?.resetTime || now + windowMs) / 1000)
      });

      next();
    };
  }

  /**
   * Session validation middleware
   */
  validateSession() {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return next();
        }

        const sessionId = this.cookieMiddleware.getSecureCookie(req, 'session_id');
        
        if (!sessionId) {
          return res.status(401).json({
            error: 'Invalid session',
            code: 'SESSION_INVALID'
          });
        }

        // Validate session matches user session
        if (req.user.sessionId !== sessionId) {
          return res.status(401).json({
            error: 'Session mismatch',
            code: 'SESSION_MISMATCH'
          });
        }

        next();
      } catch (error) {
        console.error('Session validation error:', error);
        res.status(500).json({
          error: 'Session validation failed',
          code: 'SESSION_VALIDATION_FAILED'
        });
      }
    };
  }

  /**
   * Audit logging middleware
   */
  auditLog(action = 'API_CALL') {
    return (req, res, next) => {
      const startTime = Date.now();
      
      // Store original res.json to intercept response
      const originalJson = res.json;
      
      res.json = function(data) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Log audit information
        const auditData = {
          timestamp: new Date().toISOString(),
          action,
          method: req.method,
          path: req.path,
          userId: req.user?.userId || null,
          userRole: req.user?.role || null,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          duration,
          statusCode: res.statusCode,
          success: res.statusCode < 400
        };

        console.log('AUDIT:', JSON.stringify(auditData));

        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    };
  }

  /**
   * Security headers middleware
   */
  securityHeaders() {
    return this.cookieMiddleware.securityHeaders;
  }

  /**
   * CSRF protection middleware
   */
  csrfProtection() {
    return this.cookieMiddleware.csrfProtection;
  }

  /**
   * Origin validation middleware
   */
  validateOrigin() {
    return this.cookieMiddleware.validateOrigin;
  }
}

module.exports = JWTAuthMiddleware;
