import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

/**
 * Custom log format
 */
const customFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  
  if (stack) {
    msg += `\n${stack}`;
  }
  
  return msg;
});

/**
 * Create transports based on environment
 */
const createTransports = () => {
  const transports = [];

  // Console transport (always enabled)
  transports.push(
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        customFormat
      ),
    })
  );

  // File transports (disabled in test environment)
  if (!config.isTest) {
    transports.push(
      new winston.transports.File({
        filename: path.join(config.logging.filePath, 'error.log'),
        level: 'error',
        format: combine(
          timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          errors({ stack: true }),
          json()
        ),
      }),
      new winston.transports.File({
        filename: path.join(config.logging.filePath, 'combined.log'),
        format: combine(
          timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          errors({ stack: true }),
          json()
        ),
      })
    );
  }

  return transports;
};

/**
 * Logger instance
 */
const logger = winston.createLogger({
  level: config.logging.level,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json()
  ),
  transports: createTransports(),
  exitOnError: false,
});

/**
 * Stream object for morgan middleware
 */
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

export default logger;
