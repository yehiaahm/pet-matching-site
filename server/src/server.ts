/**
 * Unified PetMate Server - Configurable & Scalable
 * Merges all server files with feature toggles via environment variables
 */

import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { Server as SocketIOServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';

// Import configuration
import config from './config/index.js';
import logger from './config/logger.js';

// Import middleware
import {
  configureSecurityMiddleware,
  configureGeneralMiddleware,
  securityHeaders,
  sanitizeRequest,
} from './middleware/security.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import petRoutes from './routes/petRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import aiMatchingRoutes from './routes/aiMatchingRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import breedingRequestRoutes from './routes/breedingRequestRoutes.js';
import healthRecordRoutes from './routes/healthRecordRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import paymobSubscriptionRoutes from './routes/paymobSubscriptionRoutes.js';
import clinicRoutes from './routes/clinicRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import fileUploadRoutes from './routes/fileUploadRoutes.js';
import stripeRoutes from './routes/stripeRoutes.js';
import gpsMatchingRoutes from './routes/gpsMatchingRoutes.js';
import vetServicesRoutes from './routes/vetServicesRoutes.js';
import messagingRoutes from './routes/messagingRoutes.js';

// Import services
import { notificationService } from './services/notificationService.js';
import { startSchedulers } from './services/scheduler.js';
import { handleSocketConnection } from './controllers/messagingController.js';

// ============================================================================
// ENVIRONMENT CONFIGURATION
// ============================================================================

interface ServerConfig {
  port: number;
  nodeEnv: string;
  frontendUrl: string;
  databaseUrl: string;
  jwtSecret: string;
  
  // Feature toggles
  enableAuth: boolean;
  enableSockets: boolean;
  enableLogging: boolean;
  enableCompression: boolean;
  enableRateLimit: boolean;
  enableSecurity: boolean;
  enableCors: boolean;
  enableMockData: boolean;
  enableDatabase: boolean;
  enableNotifications: boolean;
  enableSchedulers: boolean;
  enableFileUpload: boolean;
  enablePayments: boolean;
  enableEmail: boolean;
  enableGPS: boolean;
  enableAI: boolean;
  enableAnalytics: boolean;
  enableVetServices: boolean;
  enableMessaging: boolean;
  
  // Rate limiting
  rateLimitWindowMs: number;
  rateLimitMax: number;
  
  // Logging
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  
  // Database
  dbLogLevel: string[];
}

const serverConfig: ServerConfig = {
  port: parseInt(process.env.PORT || '5000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  
  // Feature toggles
  enableAuth: process.env.ENABLE_AUTH !== 'false',
  enableSockets: process.env.ENABLE_SOCKETS === 'true',
  enableLogging: process.env.ENABLE_LOGGING !== 'false',
  enableCompression: process.env.ENABLE_COMPRESSION !== 'false',
  enableRateLimit: process.env.ENABLE_RATE_LIMIT !== 'false',
  enableSecurity: process.env.ENABLE_SECURITY !== 'false',
  enableCors: process.env.ENABLE_CORS !== 'false',
  enableMockData: process.env.ENABLE_MOCK_DATA === 'true',
  enableDatabase: process.env.ENABLE_DATABASE !== 'false',
  enableNotifications: process.env.ENABLE_NOTIFICATIONS === 'true',
  enableSchedulers: process.env.ENABLE_SCHEDULERS === 'true',
  enableFileUpload: process.env.ENABLE_FILE_UPLOAD === 'true',
  enablePayments: process.env.ENABLE_PAYMENTS === 'true',
  enableEmail: process.env.ENABLE_EMAIL === 'true',
  enableGPS: process.env.ENABLE_GPS === 'true',
  enableAI: process.env.ENABLE_AI === 'true',
  enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
  enableVetServices: process.env.ENABLE_VET_SERVICES === 'true',
  enableMessaging: process.env.ENABLE_MESSAGING === 'true',
  
  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  
  // Logging
  logLevel: (process.env.LOG_LEVEL as any) || 'info',
  
  // Database
  dbLogLevel: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['warn', 'error'],
};

// ============================================================================
// DATABASE & MOCK DATA SETUP
// ============================================================================

let prisma: PrismaClient | null = null;
let mockUsers = new Map();
let mockPets = new Map();
let loginAttempts = new Map();

// Initialize database if enabled
if (serverConfig.enableDatabase && !serverConfig.enableMockData) {
  prisma = new PrismaClient({
    log: serverConfig.dbLogLevel as any,
  });
}

// Initialize mock data if enabled
if (serverConfig.enableMockData) {
  // Mock users
  mockUsers.set('test@petmate.com', {
    id: 'user-1',
    email: 'test@petmate.com',
    password: 'test123',
    firstName: 'Test',
    lastName: 'User',
    phone: '01012345678',
    role: 'USER',
    createdAt: new Date().toISOString()
  });

  mockUsers.set('yehiaahmed195200@gmail.com', {
    id: 'admin-1',
    email: 'yehiaahmed195200@gmail.com',
    password: 'yehia.hema195200',
    firstName: 'Yehia',
    lastName: 'Ahmed',
    phone: null,
    role: 'ADMIN',
    createdAt: new Date()
  });

  // Mock pets with GPS coordinates
  mockPets.set('pet-1', {
    id: 'pet-1',
    name: 'Max',
    type: 'dog',
    breed: 'Golden Retriever',
    age: 3,
    gender: 'male',
    latitude: 30.0444,
    longitude: 31.2357,
    image: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkZW4lMjByZXRyaWV2ZXJ8ZW58MXx8fHwxNzY2NjY1NzMxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    owner: {
      name: 'Ahmed Mohamed',
      phone: '01012345678',
      address: 'Cairo - Maadi',
      rating: 4.8,
      verified: true
    },
    vaccinations: [
      { name: 'Rabies', date: '2024-06-15', nextDue: '2025-06-15' },
      { name: 'Parvovirus', date: '2024-06-15', nextDue: '2025-06-15' },
      { name: 'Distemper', date: '2024-06-15', nextDue: '2025-06-15' }
    ],
    healthCheck: {
      date: '2024-12-01',
      veterinarian: 'Dr. Mohamed Ali'
    },
    description: 'Purebred Golden Retriever, fully vaccinated, excellent health, and calm temperament.',
    verified: true
  });

  mockPets.set('pet-2', {
    id: 'pet-2',
    name: 'Luna',
    type: 'dog',
    breed: 'Golden Retriever',
    age: 2,
    gender: 'female',
    latitude: 30.0626,
    longitude: 31.2497,
    image: 'https://images.unsplash.com/photo-1601758228042-f3b279525292?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkZW4lMjByZXRyaWV2ZXJ8ZW58MXx8fHwxNzY2NjY1NzMxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    owner: {
      name: 'Sarah Johnson',
      phone: '01098765432',
      address: 'Cairo - Nasr City',
      rating: 4.9,
      verified: true
    },
    vaccinations: [
      { name: 'Rabies', date: '2024-08-20', nextDue: '2025-08-20' },
      { name: 'Parvovirus', date: '2024-08-20', nextDue: '2025-08-20' }
    ],
    healthCheck: {
      date: '2024-12-15',
      veterinarian: 'Dr. Sara Hassan'
    },
    description: 'Beautiful female Golden Retriever, playful and friendly with kids.',
    verified: true
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateToken(user: any): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    serverConfig.jwtSecret,
    { expiresIn: '24h' }
  );
}

function checkRateLimit(email: string): boolean {
  if (!serverConfig.enableRateLimit) return true;
  
  const now = Date.now();
  const attempts = loginAttempts.get(email) || [];
  
  // Remove attempts older than rate limit window
  const recentAttempts = attempts.filter((time: number) => 
    now - time < serverConfig.rateLimitWindowMs
  );
  
  if (recentAttempts.length >= serverConfig.rateLimitMax) {
    return false; // Rate limited
  }
  
  recentAttempts.push(now);
  loginAttempts.set(email, recentAttempts);
  return true;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// ============================================================================
// EXPRESS APP SETUP
// ============================================================================

const app = express();
const server = http.createServer(app);
let io: SocketIOServer | null = null;

// Trust proxy for production
app.set('trust proxy', 1);

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

// Security middleware
if (serverConfig.enableSecurity) {
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
  configureSecurityMiddleware(app);
}

// CORS middleware
if (serverConfig.enableCors) {
  app.use(cors({
    origin: serverConfig.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
}

// Compression middleware
if (serverConfig.enableCompression) {
  app.use(compression());
}

// Rate limiting middleware
if (serverConfig.enableRateLimit) {
  const limiter = rateLimit({
    windowMs: serverConfig.rateLimitWindowMs,
    max: serverConfig.rateLimitMax,
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(serverConfig.rateLimitWindowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);
}

// Logging middleware
if (serverConfig.enableLogging) {
  const logFormat = serverConfig.nodeEnv === 'production' ? 'combined' : 'dev';
  app.use(morgan(logFormat));
}

// General middleware
configureGeneralMiddleware(app);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================================
// SOCKET.IO SETUP
// ============================================================================

if (serverConfig.enableSockets) {
  io = new SocketIOServer(server, {
    cors: {
      origin: serverConfig.frontendUrl,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);
    
    if (serverConfig.enableMessaging) {
      handleSocketConnection(socket, io);
    }
    
    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected:', socket.id);
    });
  });
}

// ============================================================================
// ROUTE CONFIGURATION
// ============================================================================

const apiPrefix = `/api/${config.api.version}`;

// Health check (always enabled)
app.use(`${apiPrefix}/health`, healthRoutes);

// Authentication routes
if (serverConfig.enableAuth) {
  app.use(`${apiPrefix}/auth`, authRoutes);
}

// Core pet functionality
app.use(`${apiPrefix}/pets`, petRoutes);
app.use(`${apiPrefix}/matches`, matchRoutes);

// Feature-based routes
if (serverConfig.enableAI) {
  app.use(`${apiPrefix}/ai-matches`, aiMatchingRoutes);
}

if (serverConfig.enableAnalytics) {
  app.use(`${apiPrefix}/analytics`, analyticsRoutes);
}

if (serverConfig.enableGPS) {
  app.use(`${apiPrefix}/gps-matching`, gpsMatchingRoutes);
}

if (serverConfig.enableVetServices) {
  app.use(`${apiPrefix}/vet-services`, vetServicesRoutes);
}

if (serverConfig.enableMessaging) {
  app.use(`${apiPrefix}/messaging`, messagingRoutes);
  app.use(`${apiPrefix}/messages`, messageRoutes);
}

// Additional features
app.use(`${apiPrefix}/breeding-requests`, breedingRequestRoutes);
app.use(`${apiPrefix}/health-records`, healthRecordRoutes);
app.use(`${apiPrefix}/reviews`, reviewRoutes);
app.use(`${apiPrefix}/subscription`, paymobSubscriptionRoutes);
app.use(`${apiPrefix}/clinic`, clinicRoutes);
app.use(`${apiPrefix}/bookings`, bookingRoutes);
app.use(`${apiPrefix}/verification`, verificationRoutes);
app.use(`${apiPrefix}/support`, supportRoutes);

// Optional features
if (serverConfig.enableFileUpload) {
  app.use(`${apiPrefix}/upload`, fileUploadRoutes);
}

if (serverConfig.enablePayments) {
  app.use(`${apiPrefix}/payments`, stripeRoutes);
}

if (serverConfig.enableEmail) {
  app.use(`${apiPrefix}/email`, emailRoutes);
}

// ============================================================================
// API ENDPOINT
// ============================================================================

app.get(`${apiPrefix}`, (req, res) => {
  const enabledFeatures = {
    auth: serverConfig.enableAuth,
    sockets: serverConfig.enableSockets,
    logging: serverConfig.enableLogging,
    compression: serverConfig.enableCompression,
    rateLimit: serverConfig.enableRateLimit,
    security: serverConfig.enableSecurity,
    cors: serverConfig.enableCors,
    mockData: serverConfig.enableMockData,
    database: serverConfig.enableDatabase,
    notifications: serverConfig.enableNotifications,
    schedulers: serverConfig.enableSchedulers,
    fileUpload: serverConfig.enableFileUpload,
    payments: serverConfig.enablePayments,
    email: serverConfig.enableEmail,
    gps: serverConfig.enableGPS,
    ai: serverConfig.enableAI,
    analytics: serverConfig.enableAnalytics,
    vetServices: serverConfig.enableVetServices,
    messaging: serverConfig.enableMessaging,
  };

  res.json({
    status: 'success',
    message: 'PetMat API is running',
    version: config.api.version,
    environment: serverConfig.nodeEnv,
    features: enabledFeatures,
    endpoints: {
      health: `${apiPrefix}/health`,
      auth: serverConfig.enableAuth ? `${apiPrefix}/auth` : 'disabled',
      pets: `${apiPrefix}/pets`,
      matches: `${apiPrefix}/matches`,
      ai: serverConfig.enableAI ? `${apiPrefix}/ai-matches` : 'disabled',
      analytics: serverConfig.enableAnalytics ? `${apiPrefix}/analytics` : 'disabled',
      gps: serverConfig.enableGPS ? `${apiPrefix}/gps-matching` : 'disabled',
      messaging: serverConfig.enableMessaging ? `${apiPrefix}/messaging` : 'disabled',
      fileUpload: serverConfig.enableFileUpload ? `${apiPrefix}/upload` : 'disabled',
      payments: serverConfig.enablePayments ? `${apiPrefix}/payments` : 'disabled',
      email: serverConfig.enableEmail ? `${apiPrefix}/email` : 'disabled',
    },
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use(notFound);
app.use(errorHandler);

// ============================================================================
// SERVER STARTUP
// ============================================================================

async function startServer() {
  try {
    // Initialize database if enabled
    if (serverConfig.enableDatabase && prisma) {
      await prisma.$connect();
      console.log('🗄️  Database connected successfully');
    }

    // Start schedulers if enabled
    if (serverConfig.enableSchedulers) {
      startSchedulers();
      console.log('⏰ Schedulers started');
    }

    // Start notification service if enabled
    if (serverConfig.enableNotifications) {
      // Initialize notification service
      console.log('🔔 Notification service enabled');
    }

    // Start server
    server.listen(serverConfig.port, () => {
      console.log(`🚀 PetMate Server running on port ${serverConfig.port}`);
      console.log(`🌍 Environment: ${serverConfig.nodeEnv}`);
      console.log(`🔗 Frontend URL: ${serverConfig.frontendUrl}`);
      console.log(`📊 Database: ${serverConfig.enableDatabase ? 'Enabled' : 'Disabled'}`);
      console.log(`🎭 Mock Data: ${serverConfig.enableMockData ? 'Enabled' : 'Disabled'}`);
      console.log(`🔌 Sockets: ${serverConfig.enableSockets ? 'Enabled' : 'Disabled'}`);
      console.log(`📝 Logging: ${serverConfig.enableLogging ? 'Enabled' : 'Disabled'}`);
      console.log(`🔒 Security: ${serverConfig.enableSecurity ? 'Enabled' : 'Disabled'}`);
      console.log(`🚦 Rate Limit: ${serverConfig.enableRateLimit ? 'Enabled' : 'Disabled'}`);
      console.log(`📧 Email: ${serverConfig.enableEmail ? 'Enabled' : 'Disabled'}`);
      console.log(`💳 Payments: ${serverConfig.enablePayments ? 'Enabled' : 'Disabled'}`);
      console.log(`📁 File Upload: ${serverConfig.enableFileUpload ? 'Enabled' : 'Disabled'}`);
      console.log(`🤖 AI: ${serverConfig.enableAI ? 'Enabled' : 'Disabled'}`);
      console.log(`📍 GPS: ${serverConfig.enableGPS ? 'Enabled' : 'Disabled'}`);
      console.log(`📈 Analytics: ${serverConfig.enableAnalytics ? 'Enabled' : 'Disabled'}`);
      console.log(`🏥 Vet Services: ${serverConfig.enableVetServices ? 'Enabled' : 'Disabled'}`);
      console.log(`💬 Messaging: ${serverConfig.enableMessaging ? 'Enabled' : 'Disabled'}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  
  if (prisma) {
    await prisma.$disconnect();
  }
  
  server.close(() => {
    console.log('🔌 Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  
  if (prisma) {
    await prisma.$disconnect();
  }
  
  server.close(() => {
    console.log('🔌 Server closed');
    process.exit(0);
  });
});

// Start the server
startServer();

// ============================================================================
// EXPORTS FOR TESTING
// ============================================================================

export { app, server, io, prisma, serverConfig };
export default app;
