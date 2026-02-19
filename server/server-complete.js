/**
 * Complete Production Server - Pet Breeding Platform
 * Full-featured server with all integrations
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');

// Import routes
const authRoutes = require('./routes/authRoutes-prisma');
const petRoutes = require('./routes/petRoutes-prisma');
const healthRecordRoutes = require('./routes/healthRecordRoutes-prisma');
const messagingRoutes = require('./routes/messagingRoutes');
const vetServicesRoutes = require('./routes/vetServicesRoutes');
const gpsMatchingRoutes = require('./routes/gpsMatchingRoutes');
const emailRoutes = require('./routes/emailRoutes');
const fileUploadRoutes = require('./routes/fileUploadRoutes');
const stripeRoutes = require('./routes/stripeRoutes');

// Import controllers
const { handleSocketConnection } = require('./controllers/messagingController');

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
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      features: {
        authentication: '✅',
        petManagement: '✅',
        healthRecords: '✅',
        messaging: '✅',
        vetServices: '✅',
        gpsMatching: '✅',
        emailVerification: '✅',
        fileUpload: '✅',
        payments: '✅',
        realTime: '✅'
      },
      timestamp: new Date().toISOString()
    }
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      name: 'Pet Breeding Platform API',
      version: '2.0.0',
      description: 'Production-ready API for pet breeding matchmaking platform',
      endpoints: {
        authentication: {
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
        },
        healthRecords: {
          'POST /api/health-records': 'Create health record',
          'GET /api/health-records/pet/:petId': 'Get pet health records',
          'GET /api/health-records/:id': 'Get health record by ID',
          'PUT /api/health-records/:id': 'Update health record',
          'DELETE /api/health-records/:id': 'Delete health record',
          'GET /api/health-records/reminders': 'Get upcoming reminders'
        },
        messaging: {
          'POST /api/messages': 'Send message',
          'GET /api/messages/conversations': 'Get conversations',
          'GET /api/messages/:userId': 'Get messages with user',
          'PUT /api/messages/:id/read': 'Mark message as read',
          'DELETE /api/messages/:id': 'Delete message',
          'GET /api/messages/unread/count': 'Get unread count'
        },
        vetServices: {
          'POST /api/vet-services': 'Create vet service (admin)',
          'GET /api/vet-services': 'Get all vet services',
          'GET /api/vet-services/:id': 'Get vet service by ID',
          'PUT /api/vet-services/:id': 'Update vet service',
          'DELETE /api/vet-services/:id': 'Delete vet service',
          'POST /api/vet-services/:id/reviews': 'Add review'
        },
        gpsMatching: {
          'POST /api/gps/location': 'Update user location',
          'POST /api/gps/find-nearby-pets': 'Find nearby pets',
          'GET /api/gps/location': 'Get user location',
          'PUT /api/gps/pet/:petId/location': 'Update pet location',
          'GET /api/gps/stats': 'Get location statistics'
        },
        email: {
          'POST /api/email/send-verification': 'Send email verification',
          'POST /api/email/verify': 'Verify email',
          'POST /api/email/forgot-password': 'Send password reset',
          'POST /api/email/reset-password': 'Reset password'
        },
        fileUpload: {
          'POST /api/upload/single': 'Upload single file',
          'POST /api/upload/multiple': 'Upload multiple files',
          'GET /api/upload/files': 'Get user files',
          'GET /api/upload/files/:id/info': 'Get file info',
          'DELETE /api/upload/files/:id': 'Delete file'
        },
        payments: {
          'POST /api/payments/create-intent': 'Create payment intent',
          'POST /api/payments/confirm': 'Confirm payment',
          'GET /api/payments/history': 'Get payment history',
          'GET /api/payments/subscription': 'Get subscription status',
          'POST /api/payments/cancel-subscription': 'Cancel subscription',
          'GET /api/payments/plans': 'Get pricing plans',
          'POST /api/payments/webhook': 'Stripe webhook'
        }
      },
      authentication: 'JWT Bearer Token required for private endpoints',
      features: [
        'JWT Authentication',
        'Email Verification',
        'Password Reset',
        'File Upload (Cloudinary)',
        'Stripe Payments',
        'Real-time Messaging (Socket.io)',
        'GPS Location Matching',
        'Health Records Management',
        'Veterinary Services',
        'Advanced Search & Filtering',
        'Rate Limiting',
        'Input Validation',
        'Error Handling',
        'CORS Protection',
        'Security Headers'
      ],
      timestamp: new Date().toISOString()
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/health-records', healthRecordRoutes);
app.use('/api/messages', messagingRoutes);
app.use('/api/vet-services', vetServicesRoutes);
app.use('/api/gps', gpsMatchingRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/upload', fileUploadRoutes);
app.use('/api/payments', stripeRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'Authentication: /api/auth/*',
      'Pets: /api/pets/*',
      'Health Records: /api/health-records/*',
      'Messaging: /api/messages/*',
      'Vet Services: /api/vet-services/*',
      'GPS Matching: /api/gps/*',
      'Email: /api/email/*',
      'File Upload: /api/upload/*',
      'Payments: /api/payments/*',
      'Health: /api/health',
      'Documentation: /api'
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

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Handle Socket.io connections
handleSocketConnection(io);

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
server.listen(PORT, () => {
  console.log(`\n🚀 Pet Breeding Platform Server Started Successfully!`);
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`🔌 Socket.io: Real-time messaging enabled`);
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
  console.log(`\n🏥 Health Records Endpoints:`);
  console.log(`   POST /api/health-records - Create health record`);
  console.log(`   GET  /api/health-records/pet/:petId - Get pet health records`);
  console.log(`   GET  /api/health-records/:id - Get health record by ID`);
  console.log(`   PUT  /api/health-records/:id - Update health record`);
  console.log(`   DELETE /api/health-records/:id - Delete health record`);
  console.log(`   GET  /api/health-records/reminders - Get upcoming reminders`);
  console.log(`\n💬 Messaging Endpoints:`);
  console.log(`   POST /api/messages - Send message`);
  console.log(`   GET  /api/messages/conversations - Get conversations`);
  console.log(`   GET  /api/messages/:userId - Get messages with user`);
  console.log(`   PUT  /api/messages/:id/read - Mark message as read`);
  console.log(`   DELETE /api/messages/:id - Delete message`);
  console.log(`   GET  /api/messages/unread/count - Get unread count`);
  console.log(`\n🏥 Vet Services Endpoints:`);
  console.log(`   POST /api/vet-services - Create vet service (admin)`);
  console.log(`   GET  /api/vet-services - Get all vet services`);
  console.log(`   GET  /api/vet-services/:id - Get vet service by ID`);
  console.log(`   PUT  /api/vet-services/:id - Update vet service`);
  console.log(`   DELETE /api/vet-services/:id - Delete vet service`);
  console.log(`   POST /api/vet-services/:id/reviews - Add review`);
  console.log(`\n🗺️ GPS Matching Endpoints:`);
  console.log(`   POST /api/gps/location - Update user location`);
  console.log(`   POST /api/gps/find-nearby-pets - Find nearby pets`);
  console.log(`   GET  /api/gps/location - Get user location`);
  console.log(`   PUT  /api/gps/pet/:petId/location - Update pet location`);
  console.log(`   GET  /api/gps/stats - Get location statistics`);
  console.log(`\n📧 Email Endpoints:`);
  console.log(`   POST /api/email/send-verification - Send email verification`);
  console.log(`   POST /api/email/verify - Verify email`);
  console.log(`   POST /api/email/forgot-password - Send password reset`);
  console.log(`   POST /api/email/reset-password - Reset password`);
  console.log(`\n📁 File Upload Endpoints:`);
  console.log(`   POST /api/upload/single - Upload single file`);
  console.log(`   POST /api/upload/multiple - Upload multiple files`);
  console.log(`   GET  /api/upload/files - Get user files`);
  console.log(`   GET  /api/upload/files/:id/info - Get file info`);
  console.log(`   DELETE /api/upload/files/:id - Delete file`);
  console.log(`\n💳 Payment Endpoints:`);
  console.log(`   POST /api/payments/create-intent - Create payment intent`);
  console.log(`   POST /api/payments/confirm - Confirm payment`);
  console.log(`   GET  /api/payments/history - Get payment history`);
  console.log(`   GET  /api/payments/subscription - Get subscription status`);
  console.log(`   POST /api/payments/cancel-subscription - Cancel subscription`);
  console.log(`   GET  /api/payments/plans - Get pricing plans`);
  console.log(`   POST /api/payments/webhook - Stripe webhook`);
  console.log(`\n✅ Features:`);
  console.log(`   - JWT Authentication with Bearer tokens`);
  console.log(`   - Email Verification & Password Reset`);
  console.log(`   - File Upload with Cloudinary`);
  console.log(`   - Stripe Payment Processing`);
  console.log(`   - Real-time Messaging (Socket.io)`);
  console.log(`   - GPS Location Matching`);
  console.log(`   - Health Records Management`);
  console.log(`   - Veterinary Services Directory`);
  console.log(`   - Advanced Search & Filtering`);
  console.log(`   - Rate limiting (5 requests per 15 minutes for auth)`);
  console.log(`   - Input validation with express-validator`);
  console.log(`   - Prisma ORM with PostgreSQL`);
  console.log(`   - CORS enabled for frontend`);
  console.log(`   - Security headers with Helmet`);
  console.log(`   - Request compression`);
  console.log(`   - Comprehensive error handling`);
  console.log(`   - Graceful shutdown handling`);
  console.log(`   - Production-ready logging`);
  console.log(`   - Socket.io real-time features`);
  console.log(`\n🔑 Environment Variables:`);
  console.log(`   JWT_SECRET=${process.env.JWT_SECRET ? '✅ Set' : '❌ Not set (using default)'}`);
  console.log(`   DATABASE_URL=${process.env.DATABASE_URL ? '✅ Set' : '❌ Not set'}`);
  console.log(`   FRONTEND_URL=${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`   STRIPE_SECRET_KEY=${process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Not set'}`);
  console.log(`   CLOUDINARY_CLOUD_NAME=${process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Not set'}`);
  console.log(`   SMTP_HOST=${process.env.SMTP_HOST || 'smtp.gmail.com'}`);
  console.log(`\n🎯 Server is ready to accept connections!\n`);
});

module.exports = app;
