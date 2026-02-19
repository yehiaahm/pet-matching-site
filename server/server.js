import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import config from './config/index.js';
import logger from './config/logger.js';
import {
  configureSecurityMiddleware,
  configureGeneralMiddleware,
  securityHeaders,
  sanitizeRequest,
} from './middleware/security.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import routes from './routes/index.js';
import jwt from 'jsonwebtoken';
import { notificationService } from './services/notificationService.js';
import { startSchedulers } from './services/scheduler.js';

// Initialize Prisma Client
const prisma = new PrismaClient({
  log: config.isDevelopment 
    ? ['query', 'info', 'warn', 'error']
    : ['warn', 'error'],
});

// Mock data store for when database is unavailable
let mockUsers = new Map();

// Initialize admin user
const adminUser = {
  id: 'admin-1',
  email: 'yehiaahmed195200@gmail.com',
  password: 'yehia.hema195200',
  firstName: 'Yehia',
  lastName: 'Ahmed',
  phone: null,
  role: 'ADMIN',
  createdAt: new Date()
};
mockUsers.set('yehiaahmed195200@gmail.com', adminUser);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || config.server.port || 5000;
const HOST = process.env.HOST || config.server.host || '0.0.0.0';

// Trust proxy (for rate limiting and IP detection behind reverse proxies)
app.set('trust proxy', 1);

/**
 * Configure middleware
 */

// Security middleware (helmet, cors, rate limiting)
configureSecurityMiddleware(app);

// General middleware (body parsing, compression, logging)
configureGeneralMiddleware(app);

// Additional security headers
app.use(securityHeaders);

// Request sanitization
app.use(sanitizeRequest);

/**
 * Routes (loaded from routes directory)
 * All routes are defined in routes/ and imported through routes/index.js
 */
/**
 * Routes (loaded from routes directory)
 * All routes are defined in routes/ and imported through routes/index.js
 */
app.use('/', routes);

/**
 * Error handling
 */

// 404 handler - must be after all routes
app.use(notFound);

// Global error handler - must be last
app.use(errorHandler);

/**
 * Server startup
 */
const startServer = async () => {
  try {
    // Test database connection (warn if fails, don't crash)
    let dbConnected = false;
    try {
      await prisma.$connect();
      logger.info('✅ Database connected successfully');
      dbConnected = true;
    } catch (dbError) {
      logger.warn('⚠️ Database connection failed - running in mock mode');
      logger.warn('Database error:', dbError.message);
    }

    // Create HTTP server and Socket.io
    const httpServer = http.createServer(app);
    const io = new SocketIOServer(httpServer, {
      cors: { origin: config.cors.origin, credentials: config.cors.credentials },
    });

    io.on('connection', (socket) => {
      socket.on('registerUser', (userId) => {
        try {
          socket.join(userId);
          logger.info(`🔌 Socket registered for user ${userId}`);
        } catch (e) {
          logger.warn('Socket registerUser error', e);
        }
      });
    });

    notificationService.init(io);

    // Start server
    const server = httpServer.listen(PORT, HOST, () => {
      logger.info(`🚀 Server running in ${config.env} mode`);
      logger.info(`📡 Listening on http://${HOST}:${PORT}`);
      logger.info(`📚 API documentation: http://${HOST}:${PORT}${config.api.prefix}/${config.api.version}`);
      if (!dbConnected) {
        logger.warn('⚠️ Running without database - using mock data');
      }
      // Start scheduled jobs
      startSchedulers({ prisma, notify: notificationService.notify });
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal) => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('✅ HTTP server closed');

        try {
          await prisma.$disconnect();
          logger.info('✅ Database connection closed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during database disconnect:', error);
          process.exit(0);  // Exit even if disconnect fails
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('⚠️ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('UNHANDLED REJECTION! 💥 Shutting down...', {
        reason,
        promise,
      });
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Export app for testing
export default app;
