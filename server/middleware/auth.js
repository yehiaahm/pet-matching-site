import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import prisma from '../config/prisma.js';
import { AppError } from '../utils/errors.js';
import { catchAsync } from './errorHandler.js';

const getTokenFromRequest = (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }
  return null;
};

const verifyJwt = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Your token has expired. Please log in again.', 401);
    }
    throw new AppError('Invalid token. Please log in again.', 401);
  }
};

/**
 * Protect routes - Verify JWT token
 */
export const protect = catchAsync(async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to access this resource.', 401));
  }

  const decoded = verifyJwt(token);

  // Ensure access token
  if (decoded.tokenType && decoded.tokenType !== 'access') {
    return next(new AppError('Invalid token type. Please log in again.', 401));
  }

  // Try to check user in database, fallback to JWT data if DB unavailable (mock mode)
  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        passwordChangedAt: true,
      },
    });
  } catch (dbError) {
    // Database unavailable - use JWT data (mock mode)
    console.log('Database unavailable, using JWT data for authentication');
    user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'USER',
      isActive: true,
    };
  }

  if (!user) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact support.', 403));
  }

  // Check if user changed password after token was issued (only if from DB)
  if (user.passwordChangedAt) {
    const changedTimestamp = Math.floor(user.passwordChangedAt.getTime() / 1000);
    if (decoded.iat < changedTimestamp) {
      return next(new AppError('User recently changed password. Please log in again.', 401));
    }
  }

  req.user = user;
  next();
});

/**
 * Restrict routes to specific roles
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }
    next();
  };
};

/**
 * Optional authentication - Attach user if token is valid but don't require it
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (token) {
      const decoded = verifyJwt(token);

      if (decoded.tokenType && decoded.tokenType !== 'access') {
        return next();
      }

      let user;
      try {
        user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
          },
        });
      } catch (dbError) {
        // Database unavailable - use JWT data (mock mode)
        user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role || 'USER',
          isActive: true,
        };
      }

      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (error) {
    // Silently fail - authentication is optional
  }

  next();
};

/**
 * Check if user owns the resource
 */
export const checkOwnership = (resourceName, userIdField = 'userId') => {
  return catchAsync(async (req, res, next) => {
    const resourceId = req.params.id;
    const userId = req.user.id;

    // Admin can access all resources
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // Get resource from database
    const resource = await prisma[resourceName].findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      return next(new AppError('Resource not found.', 404));
    }

    // Check ownership
    if (resource[userIdField] !== userId) {
      return next(new AppError('You do not have permission to access this resource.', 403));
    }

    // Attach resource to request
    req.resource = resource;
    next();
  });
};

// Alias for backward compatibility
export const authenticate = protect;
