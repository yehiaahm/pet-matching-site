const crypto = require('crypto');

class CookieMiddleware {
  constructor() {
    this.cookieOptions = {
      // Security settings
      httpOnly: true, // Prevent JavaScript access
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict', // CSRF protection
      
      // Domain and path
      domain: process.env.COOKIE_DOMAIN || 'localhost',
      path: '/',
      
      // Expiration
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      
      // Additional security
      partitioned: true, // CHIPS (Cookies Having Independent Partitioned State)
      
      // Don't allow JavaScript to modify
      // Note: 'partitioned' is experimental, use with caution
    };
  }

  /**
   * Set secure cookie with additional security measures
   */
  setSecureCookie(res, name, value, options = {}) {
    const cookieValue = this.encryptCookieValue(value);
    const finalOptions = { ...this.cookieOptions, ...options };

    // Add integrity hash
    const integrityHash = this.generateIntegrityHash(cookieValue, finalOptions);
    const finalValue = `${cookieValue}:${integrityHash}`;

    res.cookie(name, finalValue, finalOptions);
  }

  /**
   * Get and validate secure cookie
   */
  getSecureCookie(req, name) {
    const cookieValue = req.cookies?.[name];
    
    if (!cookieValue) {
      return null;
    }

    try {
      // Split value and integrity hash
      const [value, hash] = cookieValue.split(':');
      
      if (!value || !hash) {
        console.warn(`Invalid cookie format for ${name}`);
        return null;
      }

      // Verify integrity
      const expectedHash = this.generateIntegrityHash(value, this.cookieOptions);
      if (!crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash))) {
        console.warn(`Cookie integrity check failed for ${name}`);
        return null;
      }

      // Decrypt value
      return this.decryptCookieValue(value);
    } catch (error) {
      console.error(`Error reading secure cookie ${name}:`, error);
      return null;
    }
  }

  /**
   * Clear secure cookie
   */
  clearSecureCookie(res, name) {
    res.clearCookie(name, {
      ...this.cookieOptions,
      maxAge: 0,
      expires: new Date(0)
    });
  }

  /**
   * Encrypt cookie value (additional security layer)
   */
  encryptCookieValue(value) {
    const algorithm = 'aes-256-gcm';
    const secretKey = process.env.COOKIE_ENCRYPTION_KEY || crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, secretKey);
    cipher.setAAD(Buffer.from('petmat-cookie'));
    
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt cookie value
   */
  decryptCookieValue(encryptedValue) {
    try {
      const algorithm = 'aes-256-gcm';
      const secretKey = process.env.COOKIE_ENCRYPTION_KEY || crypto.randomBytes(32);
      
      const [ivHex, authTagHex, encrypted] = encryptedValue.split(':');
      
      if (!ivHex || !authTagHex || !encrypted) {
        throw new Error('Invalid encrypted cookie format');
      }
      
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      
      const decipher = crypto.createDecipher(algorithm, secretKey);
      decipher.setAAD(Buffer.from('petmat-cookie'));
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Cookie decryption failed:', error);
      return null;
    }
  }

  /**
   * Generate integrity hash for cookie
   */
  generateIntegrityHash(value, options) {
    const secret = process.env.COOKIE_INTEGRITY_SECRET || 'default-integrity-secret';
    const data = `${value}:${JSON.stringify(options)}`;
    
    return crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('hex');
  }

  /**
   * Middleware to set security headers
   */
  securityHeaders(req, res, next) {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Content Security Policy
    res.setHeader('Content-Security-Policy', [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.petmat.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; '));
    
    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions Policy
    res.setHeader('Permissions-Policy', [
      'geolocation=()',
      'microphone=()',
      'camera=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()'
    ].join(', '));
    
    // Strict Transport Security (HTTPS only)
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    
    next();
  }

  /**
   * Middleware to validate request origin
   */
  validateOrigin(req, res, next) {
    const origin = req.get('Origin');
    const referer = req.get('Referer');
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173', // Vite default
      'https://petmat.com',
      'https://www.petmat.com'
    ];
    
    // Check Origin header
    if (origin && !allowedOrigins.includes(origin)) {
      return res.status(403).json({ error: 'Origin not allowed' });
    }
    
    // Check Referer header as fallback
    if (referer && !allowedOrigins.some(allowed => referer.startsWith(allowed))) {
      return res.status(403).json({ error: 'Referer not allowed' });
    }
    
    next();
  }

  /**
   * Rate limiting middleware for auth endpoints
   */
  createAuthRateLimit(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    const attempts = new Map(); // IP -> { count, resetTime }
    
    return (req, res, next) => {
      const ip = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      
      // Clean up expired entries
      for (const [clientIp, data] of attempts.entries()) {
        if (now > data.resetTime) {
          attempts.delete(clientIp);
        }
      }
      
      // Check current attempts
      const clientData = attempts.get(ip);
      
      if (clientData && now < clientData.resetTime) {
        if (clientData.count >= maxAttempts) {
          const remainingTime = Math.ceil((clientData.resetTime - now) / 1000);
          res.set('Retry-After', remainingTime);
          return res.status(429).json({
            error: 'Too many authentication attempts',
            retryAfter: remainingTime
          });
        }
        
        clientData.count++;
      } else {
        attempts.set(ip, {
          count: 1,
          resetTime: now + windowMs
        });
      }
      
      next();
    };
  }

  /**
   * CSRF protection middleware
   */
  csrfProtection(req, res, next) {
    // Skip for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }
    
    const csrfToken = req.get('X-CSRF-Token');
    const sessionToken = this.getSecureCookie(req, 'csrf_token');
    
    if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
      return res.status(403).json({ error: 'CSRF token mismatch' });
    }
    
    next();
  }

  /**
   * Generate CSRF token
   */
  generateCSRFToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Set CSRF token cookie
   */
  setCSRFToken(res) {
    const token = this.generateCSRFToken();
    this.setSecureCookie(res, 'csrf_token', token, {
      maxAge: 60 * 60 * 1000 // 1 hour
    });
    return token;
  }
}

module.exports = CookieMiddleware;
