import { catchAsync } from '../middleware/errorHandler.js';
import { sendSuccess } from '../utils/response.js';
import config from '../config/index.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Health check endpoint
 */
export const healthCheck = catchAsync(async (req, res, next) => {
  // Check database connection
  let dbStatus = 'connected';
  let dbResponseTime = null;
  
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbResponseTime = Date.now() - start;
  } catch (error) {
    dbStatus = 'disconnected';
  }

  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
    version: '1.0.0',
    database: {
      status: dbStatus,
      responseTime: dbResponseTime ? `${dbResponseTime}ms` : null,
    },
    memory: {
      used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
    },
  };

  const statusCode = dbStatus === 'connected' ? 200 : 503;
  sendSuccess(res, statusCode, 'Health check completed', healthData);
});
