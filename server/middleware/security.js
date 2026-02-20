/**
 * Security Middleware Configuration
 * 
 * ⚠️ IMPORTANT: ADMIN and SUPER_ADMIN users have UNLIMITED access
 * and bypass all rate limiting checks.
 * 
 * See ADMIN_UNLIMITED_ACCESS.md for details.
 */

import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import morgan from 'morgan';
import config from '../config/index.js';
import logger from '../config/logger.js';

/**
 * Configure security middleware
 */
export const configureSecurityMiddleware = (app) => {
  // Helmet - Set security HTTP headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS - Enable Cross-Origin Resource Sharing
  app.use(cors({
    origin: [
      'https://pet-matching-site.vercel.app',
      'https://pet-matching-site-git-main-yehiaahms-projects.vercel.app',
      'http://localhost:5173'
    ],
    credentials: true
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
      status: 'error',
      message: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for ADMIN and SUPER_ADMIN users
    skip: (req) => {
      return req.user && (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN');
    },
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        status: 'error',
        message: 'Too many requests from this IP, please try again later.',
      });
    },
  });

  // Apply rate limiting to API routes
  app.use(`${config.api.prefix}/${config.api.version}`, limiter);

  // Stricter rate limiting for auth routes
  const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // 100 requests per hour for auth
    message: {
      status: 'error',
      message: 'Too many authentication attempts, please try again later.',
    },
    // Skip rate limiting for ADMIN and SUPER_ADMIN users
    skip: (req) => {
      return req.user && (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN');
    },
  });

  app.use(`${config.api.prefix}/${config.api.version}/auth`, authLimiter);
};

/**
 * Configure general middleware
 */
export const configureGeneralMiddleware = (app) => {
  // Stripe webhook must receive raw body for signature verification
  app.use(`${config.api.prefix}/${config.api.version}/subscription/webhook`, express.raw({ type: 'application/json' }));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Cookie parsing
  app.use(cookieParser());

  // Compression
  app.use(
    compression({
      level: 6,
      threshold: 1024,
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
    })
  );

  // HTTP request logging
  if (config.isDevelopment) {
    app.use(morgan('dev'));
  } else {
    app.use(
      morgan('combined', {
        stream: logger.stream,
        skip: (req, res) => res.statusCode < 400,
      })
    );
  }

  // Add request ID
  app.use((req, res, next) => {
    req.id = Math.random().toString(36).substring(2, 15);
    res.setHeader('X-Request-Id', req.id);
    next();
  });

  // Add request timestamp
  app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
  });

  // Log incoming requests in production
  if (config.isProduction) {
    app.use((req, res, next) => {
      logger.info({
        message: 'Incoming request',
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        requestId: req.id,
      });
      next();
    });
  }
};

/**
 * Security headers middleware
 */
export const securityHeaders = (req, res, next) => {
  // Remove powered by header
  res.removeHeader('X-Powered-By');

  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  next();
};

/**
 * Request sanitization middleware
 */
export const sanitizeRequest = (req, res, next) => {
  // Remove any $ or . from req.body, req.query, and req.params to prevent NoSQL injection
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (key.includes('$') || key.includes('.')) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      }
    }
  };

  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);

  next();
};
