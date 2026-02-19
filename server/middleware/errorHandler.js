import logger from '../config/logger.js';
import { AppError } from '../utils/errors.js';

/**
 * Global error handler middleware
 * Handles all errors thrown in the application
 */
const errorHandler = (err, req, res, next) => {
  // Set default error values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error
  logger.error({
    message: err.message,
    statusCode: err.statusCode,
    status: err.status,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
  });

  // Handle different error types
  if (err.name === 'ValidationError') {
    return handleValidationError(err, res);
  }

  if (err.name === 'JsonWebTokenError') {
    return handleJWTError(err, res);
  }

  if (err.name === 'TokenExpiredError') {
    return handleJWTExpiredError(err, res);
  }

  if (err.code === 'P2002') {
    return handlePrismaUniqueConstraintError(err, res);
  }

  if (err.code === 'P2025') {
    return handlePrismaNotFoundError(err, res);
  }

  if (err.type === 'entity.too.large') {
    return handlePayloadTooLargeError(err, res);
  }

  // Send error response
  sendErrorResponse(err, res);
};

/**
 * Handle validation errors
 */
const handleValidationError = (err, res) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  
  res.status(400).json({
    status: 'fail',
    message,
    errors,
  });
};

/**
 * Handle JWT errors
 */
const handleJWTError = (err, res) => {
  res.status(401).json({
    status: 'fail',
    message: 'Invalid token. Please log in again.',
  });
};

/**
 * Handle JWT expired errors
 */
const handleJWTExpiredError = (err, res) => {
  res.status(401).json({
    status: 'fail',
    message: 'Your token has expired. Please log in again.',
  });
};

/**
 * Handle Prisma unique constraint errors
 */
const handlePrismaUniqueConstraintError = (err, res) => {
  const field = err.meta?.target?.[0] || 'field';
  const message = `A record with this ${field} already exists.`;
  
  res.status(409).json({
    status: 'fail',
    message,
  });
};

/**
 * Handle Prisma not found errors
 */
const handlePrismaNotFoundError = (err, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'The requested resource was not found.',
  });
};

/**
 * Handle payload too large errors
 */
const handlePayloadTooLargeError = (err, res) => {
  res.status(413).json({
    status: 'fail',
    message: 'The request payload is too large.',
  });
};

/**
 * Send error response
 */
const sendErrorResponse = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  } 
  // Programming or unknown error: don't leak error details
  else {
    // Log error details
    logger.error('ERROR 💥', err);
    
    // Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong on the server.',
    });
  }
};

/**
 * Not found middleware
 * Handles requests to undefined routes
 */
const notFound = (req, res, next) => {
  const message = `Cannot ${req.method} ${req.originalUrl}`;
  next(new AppError(message, 404));
};

/**
 * Async error handler wrapper
 * Catches errors in async route handlers
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export { errorHandler, notFound, catchAsync };
