import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'node:http';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';

import authRoutes from './routes/authRoutes.js';
import petRoutes from './routes/petRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import marketplaceRoutes from './routes/marketplaceRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import vetClinicRoutes from './routes/vetClinicRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import supportRoutes from './routes/supportRoutes.js';

import { initIO } from './sockets/io.js';
import { AppError } from './utils/appError.js';
import { requestLogger } from './middleware/requestLogger.js';
import prisma from './prisma/client.js';

const app = express();
const server = http.createServer(app);

/* =========================
   CORS CONFIGURATION
========================= */

const allowedOrigins =
  process.env.CORS_ORIGINS?.split(',')
    .map((item) => item.trim())
    .filter(Boolean) || [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://pet-matching-site.vercel.app'
    ];

const corsOptions = {
  origin: function (origin, callback) {

    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('CORS not allowed'));
  },

  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-CSRF-Token']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

/* =========================
   SOCKET.IO
========================= */

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET','POST','PUT','PATCH','DELETE']
  }
});

initIO(io);

/* =========================
   SECURITY & MIDDLEWARE
========================= */

app.use(helmet());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use(requestLogger);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* =========================
   HEALTH CHECK
========================= */

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'PETMAT API',
    uptime: Math.round(process.uptime())
  });
});

app.get('/api/v1/health', (_req, res) => {
  res.json({
    status: 'success',
    data: {
      status: 'healthy',
      service: 'PETMAT API',
      database: 'connected',
      uptime: Math.round(process.uptime())
    }
  });
});

app.get('/api/health/live', async (_req, res, next) => {
  try {

    const startedAt = Date.now();

    await prisma.$queryRaw`SELECT 1`;

    const dbLatencyMs = Date.now() - startedAt;

    res.json({
      status: 'ok',
      service: 'PETMAT API',
      database: 'ok',
      dbLatencyMs,
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString()
    });

  } catch (error) {

    next(new AppError(`Health check failed: ${error.message}`, 503));

  }
});

app.get('/api/v1/health/live', async (_req, res, next) => {
  try {

    const startedAt = Date.now();

    await prisma.$queryRaw`SELECT 1`;

    const dbLatencyMs = Date.now() - startedAt;

    res.json({
      status: 'success',
      data: {
        status: 'healthy',
        service: 'PETMAT API',
        database: 'connected',
        dbLatencyMs,
        uptime: Math.round(process.uptime()),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {

    next(new AppError(`Health check failed: ${error.message}`, 503));

  }
});

/* =========================
   API ROUTES
========================= */

app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/subscription', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/vet-clinics', vetClinicRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/support', supportRoutes);

/* =========================
   VERSIONED API
========================= */

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/pets', petRoutes);
app.use('/api/v1/match', matchRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/subscription', paymentRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/marketplace', marketplaceRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/vet-clinics', vetClinicRoutes);
app.use('/api/v1/community', communityRoutes);
app.use('/api/v1/support', supportRoutes);

/* =========================
   ERROR HANDLING
========================= */

app.use((_req, _res, next) => {
  next(new AppError('Route not found', 404));
});

app.use((err, _req, res, _next) => {

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV !== 'production'
      ? { stack: err.stack }
      : {})
  });

});

/* =========================
   START SERVER
========================= */

const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log(`🚀 PETMAT backend running on http://localhost:${port}`);
});