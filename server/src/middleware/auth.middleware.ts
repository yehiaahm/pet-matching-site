/**
 * Authentication Middleware
 * JWT token validation and user authentication
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.util';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    permissions?: string[];
  };
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  permissions?: string[];
  iat: number;
  exp: number;
}

/**
 * Authentication middleware
 * Validates JWT tokens and sets user in request
 */
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access token is required',
      timestamp: new Date().toISOString(),
    });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    
    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        timestamp: new Date().toISOString(),
      });
    }

    // Set user in request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions,
    };

    logger.info('User authenticated', { userId: decoded.userId, email: decoded.email });

    next();
  } catch (error) {
    logger.error('Authentication failed', { error: error.message });
    
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Authorization middleware
 * Checks if user has required permissions
 */
export function authorize(permissions: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
    }

    const userPermissions = req.user.permissions || [];
    const hasPermission = permissions.some(permission => 
      userPermissions.includes(permission) || userPermissions.includes('*')
    );

    if (!hasPermission) {
      logger.warn('Authorization failed', { 
        userId: req.user.id, 
        requiredPermissions: permissions,
        userPermissions 
      });

      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
}

/**
 * Role-based authorization middleware
 */
export function authorizeRole(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
    }

    const hasRole = roles.includes(req.user.role) || req.user.role === 'ADMIN';

    if (!hasRole) {
      logger.warn('Role authorization failed', { 
        userId: req.user.id, 
        userRole: req.user.role, 
        requiredRoles: roles 
      });

      return res.status(403).json({
        success: false,
        message: 'Insufficient role permissions',
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
}

/**
 * Optional authentication middleware
 * Allows request to proceed without authentication if no token is provided
 */
export function optionalAuthenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token provided, proceed without authentication
    return next();
  }

  // Token provided, authenticate normally
  authenticate(req, res, next);
}

/**
 * API Key authentication middleware
 * Validates API key from headers
 */
export function authenticateApiKey(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'] || req.headers['X-API-KEY'];
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key is required',
      timestamp: new Date().toISOString(),
    });
  }

  const validApiKeys = (process.env.API_KEYS || '').split(',').map(key => key.trim());
  
  if (!validApiKeys.includes(apiKey)) {
    logger.warn('Invalid API key used', { apiKey: apiKey.substring(0, 10) + '...' });
    
    return res.status(401).json({
      success: false,
      message: 'Invalid API key',
      timestamp: new Date().toISOString(),
    });
  }

  logger.debug('API key authenticated successfully');
  next();
}

/**
 * Rate limiting middleware for authenticated users
 */
export function userRateLimit(options: {
  windowMs?: number;
  max?: number;
  message?: string;
} = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
  const max = options.max || 100;
  const message = options.message || 'Too many requests';

  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const userId = req.user?.id || 'anonymous';
  const now = Date.now();
  const userRequests = requests.get(userId) || { count: 0, resetTime: now };

  // Reset counter if window has passed
  if (now - userRequests.resetTime > windowMs) {
    userRequests.count = 0;
    userRequests.resetTime = now;
  }

  // Check if user has exceeded limit
  if (userRequests.count >= max) {
      logger.warn('Rate limit exceeded', { userId, count: userRequests.count });
      
      return res.status(429).json({
        success: false,
        message,
        timestamp: new Date().toISOString(),
        retryAfter: Math.ceil((windowMs - (now - userRequests.resetTime)) / 1000),
      });
    }

    // Increment counter
    userRequests.count++;
    requests.set(userId, userRequests);

    next();
  };
}

/**
 * Request ID middleware
 * Adds unique ID to each request for tracing
 */
export function addRequestId(req: Request, res: Response, next: NextFunction): void {
  const requestId = req.headers['x-request-id'] || 
                   `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  next();
}

/**
 * Request logging middleware
 * Logs all incoming requests
 */
export function logRequests(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const method = req.method;
    const url = req.originalUrl;
    const statusCode = res.statusCode;
    const requestId = (req as AuthenticatedRequest).requestId;
    const userId = (req as AuthenticatedRequest).user?.id;

    logger.requestStart(method, url, requestId!, userId);
    logger.requestEnd(method, url, requestId!, userId, duration);
    
    if (statusCode >= 400) {
      logger.error('Request failed', { 
        method, url, statusCode, duration, requestId, userId 
      });
    }
  });

  next();
}
