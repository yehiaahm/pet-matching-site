/**
 * Rate Limiting Strategies Configuration
 * Different limits for various endpoint types and user roles
 * 
 * ⚠️ IMPORTANT: Admin users (ADMIN & SUPER_ADMIN) have UNLIMITED access
 * and bypass all rate limiting. See 'admin' strategy below.
 * 
 * For full documentation: ADMIN_UNLIMITED_ACCESS.md
 */

const strategies = {
  // Authentication endpoints - very strict limits
  auth: {
    login: {
      windowMs: 15 * 60 * 1000,      // 15 minutes
      maxRequests: 5,                 // 5 login attempts
      algorithm: 'sliding',           // Sliding window for accuracy
      skipSuccessfulRequests: false,   // Count all attempts
      skipFailedRequests: false,       // Count failed attempts
      keyGenerator: (req) => {
        // Use IP + email combination for login
        const email = req.body?.email || 'unknown';
        return `login:${req.ip}:${email.toLowerCase()}`;
      },
      message: 'Too many login attempts. Please try again later.',
      headers: {
        'X-RateLimit-Limit': 5,
        'X-RateLimit-Window': '15m'
      }
    },
    
    register: {
      windowMs: 60 * 60 * 1000,      // 1 hour
      maxRequests: 3,                 // 3 registration attempts
      algorithm: 'fixed',             // Fixed window for simplicity
      keyGenerator: (req) => `register:${req.ip}`,
      message: 'Too many registration attempts. Please try again later.',
      headers: {
        'X-RateLimit-Limit': 3,
        'X-RateLimit-Window': '1h'
      }
    },
    
    forgotPassword: {
      windowMs: 60 * 60 * 1000,      // 1 hour
      maxRequests: 3,                 // 3 password reset attempts
      algorithm: 'fixed',
      keyGenerator: (req) => {
        const email = req.body?.email || 'unknown';
        return `forgot:${req.ip}:${email.toLowerCase()}`;
      },
      message: 'Too many password reset attempts. Please try again later.',
      headers: {
        'X-RateLimit-Limit': 3,
        'X-RateLimit-Window': '1h'
      }
    },
    
    refreshToken: {
      windowMs: 15 * 60 * 1000,      // 15 minutes
      maxRequests: 20,                // 20 refresh attempts
      algorithm: 'sliding',
      keyGenerator: (req) => `refresh:${req.ip}`,
      message: 'Too many refresh attempts. Please try again later.',
      headers: {
        'X-RateLimit-Limit': 20,
        'X-RateLimit-Window': '15m'
      }
    }
  },

  // API endpoints - role-based limits
  api: {
    // Free tier users
    free: {
      windowMs: 60 * 1000,           // 1 minute
      maxRequests: 60,                // 60 requests per minute
      algorithm: 'sliding',
      keyGenerator: (req) => {
        const userId = req.user?.userId || 'anonymous';
        return `api:free:${userId}:${req.ip}`;
      },
      message: 'Rate limit exceeded. Upgrade your plan for higher limits.',
      headers: {
        'X-RateLimit-Limit': 60,
        'X-RateLimit-Window': '1m',
        'X-RateLimit-Tier': 'free'
      }
    },
    
    // Premium tier users
    premium: {
      windowMs: 60 * 1000,           // 1 minute
      maxRequests: 300,               // 300 requests per minute
      algorithm: 'sliding',
      keyGenerator: (req) => {
        const userId = req.user?.userId || 'anonymous';
        return `api:premium:${userId}:${req.ip}`;
      },
      message: 'Rate limit exceeded. Please wait before making more requests.',
      headers: {
        'X-RateLimit-Limit': 300,
        'X-RateLimit-Window': '1m',
        'X-RateLimit-Tier': 'premium'
      }
    },
    
    // Enterprise tier users
    enterprise: {
      windowMs: 60 * 1000,           // 1 minute
      maxRequests: 1000,              // 1000 requests per minute
      algorithm: 'token_bucket',      // Token bucket for burst handling
      refillRate: 300,                // Refill 300 tokens per minute
      keyGenerator: (req) => {
        const userId = req.user?.userId || 'anonymous';
        return `api:enterprise:${userId}:${req.ip}`;
      },
      message: 'Rate limit exceeded. Please contact support for higher limits.',
      headers: {
        'X-RateLimit-Limit': 1000,
        'X-RateLimit-Window': '1m',
        'X-RateLimit-Tier': 'enterprise'
      }
    },
    
    // Admin users - NO LIMITS (unlimited requests)
    admin: {
      windowMs: 60 * 1000,           // 1 minute
      maxRequests: Infinity,          // UNLIMITED - No rate limiting for admins
      algorithm: 'sliding',
      skip: (req) => {
        // Always skip rate limiting for ADMIN and SUPER_ADMIN
        return req.user && (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN');
      },
      keyGenerator: (req) => {
        const userId = req.user?.userId || 'unknown';
        return `api:admin:${userId}:${req.ip}`;
      },
      message: 'Admin rate limit exceeded. Please wait before making more requests.',
      headers: {
        'X-RateLimit-Limit': 'unlimited',
        'X-RateLimit-Window': '1m',
        'X-RateLimit-Tier': 'admin'
      }
    }
  },

  // File upload endpoints - special limits
  upload: {
    image: {
      windowMs: 60 * 60 * 1000,      // 1 hour
      maxRequests: 50,                // 50 image uploads per hour
      algorithm: 'fixed',
      keyGenerator: (req) => {
        const userId = req.user?.userId || 'anonymous';
        return `upload:image:${userId}:${req.ip}`;
      },
      message: 'Image upload limit exceeded. Please try again later.',
      headers: {
        'X-RateLimit-Limit': 50,
        'X-RateLimit-Window': '1h'
      }
    },
    
    document: {
      windowMs: 60 * 60 * 1000,      // 1 hour
      maxRequests: 20,                // 20 document uploads per hour
      algorithm: 'fixed',
      keyGenerator: (req) => {
        const userId = req.user?.userId || 'anonymous';
        return `upload:document:${userId}:${req.ip}`;
      },
      message: 'Document upload limit exceeded. Please try again later.',
      headers: {
        'X-RateLimit-Limit': 20,
        'X-RateLimit-Window': '1h'
      }
    }
  },

  // Search endpoints - generous limits for good UX
  search: {
    general: {
      windowMs: 60 * 1000,           // 1 minute
      maxRequests: 100,               // 100 searches per minute
      algorithm: 'sliding',
      keyGenerator: (req) => {
        const userId = req.user?.userId || 'anonymous';
        return `search:general:${userId}:${req.ip}`;
      },
      message: 'Search limit exceeded. Please wait before searching again.',
      headers: {
        'X-RateLimit-Limit': 100,
        'X-RateLimit-Window': '1m'
      }
    },
    
    advanced: {
      windowMs: 60 * 1000,           // 1 minute
      maxRequests: 30,                // 30 advanced searches per minute
      algorithm: 'sliding',
      keyGenerator: (req) => {
        const userId = req.user?.userId || 'anonymous';
        return `search:advanced:${userId}:${req.ip}`;
      },
      message: 'Advanced search limit exceeded. Please wait before searching again.',
      headers: {
        'X-RateLimit-Limit': 30,
        'X-RateLimit-Window': '1m'
      }
    }
  },

  // WebSocket connections - connection limits
  websocket: {
    connections: {
      windowMs: 60 * 60 * 1000,      // 1 hour
      maxRequests: 10,                // 10 concurrent connections
      algorithm: 'token_bucket',
      refillRate: 5,                  // Refill 5 connections per hour
      keyGenerator: (req) => {
        const userId = req.user?.userId || 'anonymous';
        return `ws:connections:${userId}:${req.ip}`;
      },
      message: 'WebSocket connection limit exceeded.',
      headers: {
        'X-RateLimit-Limit': 10,
        'X-RateLimit-Window': '1h'
      }
    }
  },

  // Global limits - fallback for uncategorized endpoints
  global: {
    default: {
      windowMs: 60 * 1000,           // 1 minute
      maxRequests: 100,               // 100 requests per minute
      algorithm: 'sliding',
      keyGenerator: (req) => `global:${req.ip}`,
      message: 'Rate limit exceeded. Please slow down your requests.',
      headers: {
        'X-RateLimit-Limit': 100,
        'X-RateLimit-Window': '1m'
      }
    },
    
    anonymous: {
      windowMs: 60 * 1000,           // 1 minute
      maxRequests: 30,                // 30 requests per minute for anonymous users
      algorithm: 'sliding',
      keyGenerator: (req) => `anonymous:${req.ip}`,
      message: 'Anonymous rate limit exceeded. Please login for higher limits.',
      headers: {
        'X-RateLimit-Limit': 30,
        'X-RateLimit-Window': '1m'
      }
    }
  }
};

/**
 * Get rate limit strategy based on request
 */
function getStrategy(req) {
  const path = req.path;
  const method = req.method;
  const userRole = req.user?.role || 'anonymous';
  
  // Authentication endpoints
  if (path.startsWith('/api/auth/')) {
    if (path.includes('/login')) return strategies.auth.login;
    if (path.includes('/register')) return strategies.auth.register;
    if (path.includes('/forgot-password')) return strategies.auth.forgotPassword;
    if (path.includes('/refresh')) return strategies.auth.refreshToken;
  }
  
  // Upload endpoints
  if (path.startsWith('/api/upload/')) {
    if (path.includes('/image')) return strategies.upload.image;
    if (path.includes('/document')) return strategies.upload.document;
  }
  
  // Search endpoints
  if (path.startsWith('/api/search/')) {
    if (path.includes('/advanced')) return strategies.search.advanced;
    return strategies.search.general;
  }
  
  // WebSocket endpoints
  if (path.startsWith('/api/ws/')) {
    return strategies.websocket.connections;
  }
  
  // API endpoints with role-based limits
  if (path.startsWith('/api/')) {
    switch (userRole) {
      case 'admin':
        return strategies.api.admin;
      case 'enterprise':
        return strategies.api.enterprise;
      case 'premium':
        return strategies.api.premium;
      case 'user':
        return strategies.api.free;
      default:
        return strategies.global.anonymous;
    }
  }
  
  // Default global limits
  return strategies.global.default;
}

/**
 * Dynamic rate limit adjustment based on system load
 */
function getDynamicStrategy(baseStrategy, systemLoad = 'normal') {
  const loadMultipliers = {
    low: 1.5,      // 50% more requests when system load is low
    normal: 1.0,   // Normal limits
    high: 0.7,     // 30% fewer requests when system load is high
    critical: 0.3  // 70% fewer requests when system is critical
  };
  
  const multiplier = loadMultipliers[systemLoad] || 1.0;
  
  return {
    ...baseStrategy,
    maxRequests: Math.ceil(baseStrategy.maxRequests * multiplier),
    dynamicAdjustment: {
      originalLimit: baseStrategy.maxRequests,
      currentLimit: Math.ceil(baseStrategy.maxRequests * multiplier),
      systemLoad,
      multiplier
    }
  };
}

/**
 * Get rate limit strategy with dynamic adjustment
 */
function getAdjustedStrategy(req, systemLoad = 'normal') {
  const baseStrategy = getStrategy(req);
  return getDynamicStrategy(baseStrategy, systemLoad);
}

module.exports = {
  strategies,
  getStrategy,
  getDynamicStrategy,
  getAdjustedStrategy
};
