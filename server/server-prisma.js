/**
 * Complete Server - Production Ready with Prisma
 * Express server with authentication and pet management
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

// Import routes
const authRoutes = require('./routes/authRoutes-prisma');
const petRoutes = require('./routes/petRoutes-prisma');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for production
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      message: 'Pet Breeding Platform API is running',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      name: 'Pet Breeding Platform API',
      version: '1.0.0',
      description: 'Production-ready API for pet breeding matchmaking platform',
      endpoints: {
        auth: {
          'POST /api/auth/signup': 'Register new user',
          'POST /api/auth/login': 'Login user',
          'GET /api/auth/me': 'Get current user profile',
          'PUT /api/auth/profile': 'Update user profile',
          'PUT /api/auth/change-password': 'Change password',
          'POST /api/auth/logout': 'Logout user',
          'GET /api/auth/verify-token': 'Verify JWT token'
        },
        pets: {
          'POST /api/pets': 'Create new pet (private)',
          'GET /api/pets': 'Get all pets (public)',
          'GET /api/pets/my-pets': 'Get user\'s pets (private)',
          'GET /api/pets/:id': 'Get pet by ID (public)',
          'PUT /api/pets/:id': 'Update pet (private, owner only)',
          'DELETE /api/pets/:id': 'Delete pet (private, owner only)'
        }
      },
      authentication: 'JWT Bearer Token required for private endpoints',
      rateLimit: '5 requests per 15 minutes for auth endpoints',
      timestamp: new Date().toISOString()
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'GET /api/health',
      'GET /api',
      'POST /api/auth/signup',
      'POST /api/auth/login',
      'GET /api/auth/me',
      'PUT /api/auth/profile',
      'PUT /api/auth/change-password',
      'POST /api/auth/logout',
      'GET /api/auth/verify-token',
      'POST /api/pets',
      'GET /api/pets',
      'GET /api/pets/my-pets',
      'GET /api/pets/:id',
      'PUT /api/pets/:id',
      'DELETE /api/pets/:id'
    ],
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Global error handler:', error);

  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized access',
      timestamp: new Date().toISOString()
    });
  }

  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      timestamp: new Date().toISOString()
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token has expired',
      timestamp: new Date().toISOString()
    });
  }

  // Default error response
  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);
  
  // Close server
  server.close(() => {
    console.log('✅ HTTP server closed');
    
    // Close database connections
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    prisma.$disconnect()
      .then(() => {
        console.log('✅ Database connections closed');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Error closing database connections:', error);
        process.exit(1);
      });
  });
  
  // Force close after 30 seconds
  setTimeout(() => {
    console.error('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Handle process signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Pet Breeding Platform Server Started Successfully!`);
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`\n🔐 Authentication Endpoints:`);
  console.log(`   POST /api/auth/signup - Register new user`);
  console.log(`   POST /api/auth/login - Login user`);
  console.log(`   GET  /api/auth/me - Get current user`);
  console.log(`   PUT  /api/auth/profile - Update profile`);
  console.log(`   PUT  /api/auth/change-password - Change password`);
  console.log(`   POST /api/auth/logout - Logout user`);
  console.log(`\n🐕 Pet Management Endpoints:`);
  console.log(`   POST /api/pets - Create pet (private)`);
  console.log(`   GET  /api/pets - Get all pets (public)`);
  console.log(`   GET  /api/pets/my-pets - Get user's pets (private)`);
  console.log(`   GET  /api/pets/:id - Get pet by ID`);
  console.log(`   PUT  /api/pets/:id - Update pet (owner only)`);
  console.log(`   DELETE /api/pets/:id - Delete pet (owner only)`);
  console.log(`\n✅ Features:`);
  console.log(`   - JWT Authentication with Bearer tokens`);
  console.log(`   - Rate limiting (5 requests per 15 minutes for auth)`);
  console.log(`   - Input validation with express-validator`);
  console.log(`   - Prisma ORM with PostgreSQL`);
  console.log(`   - CORS enabled for frontend`);
  console.log(`   - Security headers with Helmet`);
  console.log(`   - Request compression`);
  console.log(`   - Comprehensive error handling`);
  console.log(`   - Graceful shutdown handling`);
  console.log(`   - Production-ready logging`);
  console.log(`\n🔑 Environment Variables:`);
  console.log(`   JWT_SECRET=${process.env.JWT_SECRET ? '✅ Set' : '❌ Not set (using default)'}`);
  console.log(`   JWT_EXPIRE=${process.env.JWT_EXPIRE || '7d'}`);
  console.log(`   DATABASE_URL=${process.env.DATABASE_URL ? '✅ Set' : '❌ Not set'}`);
  console.log(`   FRONTEND_URL=${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`\n🎯 Server is ready to accept connections!\n`);
});

module.exports = app;
