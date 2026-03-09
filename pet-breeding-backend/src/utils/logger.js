const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'pet-breeding-backend' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Write to console in development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
    }),
  ],
  
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
  
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// Add custom methods for different log levels
logger.info = (message, meta = {}) => {
  logger.log('info', message, meta);
};

logger.warn = (message, meta = {}) => {
  logger.log('warn', message, meta);
};

logger.error = (message, meta = {}) => {
  logger.log('error', message, meta);
};

logger.debug = (message, meta = {}) => {
  logger.log('debug', message, meta);
};

// HTTP request logger middleware
logger.httpLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
    };
    
    if (res.statusCode >= 400) {
      logger.warn(`HTTP ${res.statusCode} - ${req.method} ${req.url}`, logData);
    } else {
      logger.info(`HTTP ${res.statusCode} - ${req.method} ${req.url}`, logData);
    }
  });
  
  next();
};

// Database operation logger
logger.database = (operation, data = {}) => {
  logger.info(`Database operation: ${operation}`, {
    operation,
    ...data,
    category: 'DATABASE'
  });
};

// Authentication logger
logger.auth = (action, data = {}) => {
  logger.info(`Auth action: ${action}`, {
    action,
    ...data,
    category: 'AUTH'
  });
};

// Business logic logger
logger.business = (action, data = {}) => {
  logger.info(`Business action: ${action}`, {
    action,
    ...data,
    category: 'BUSINESS'
  });
};

// Security logger
logger.security = (event, data = {}) => {
  logger.warn(`Security event: ${event}`, {
    event,
    ...data,
    category: 'SECURITY'
  });
};

// Performance logger
logger.performance = (operation, duration, data = {}) => {
  const logData = {
    operation,
    duration: `${duration}ms`,
    ...data,
    category: 'PERFORMANCE'
  };
  
  if (duration > 1000) {
    logger.warn(`Slow operation: ${operation}`, logData);
  } else {
    logger.info(`Performance: ${operation}`, logData);
  }
};

// Error logger with context
logger.logError = (error, context = {}) => {
  logger.error(error.message, {
    stack: error.stack,
    ...context,
    category: 'ERROR'
  });
};

module.exports = logger;
