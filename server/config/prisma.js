import { PrismaClient } from '@prisma/client';
import config from './index.js';
import logger from './logger.js';

// Use a global singleton in development to prevent exhausting database connections
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: config.isDevelopment ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
  errorFormat: 'pretty',
});

// Attach event listeners only once
if (!globalForPrisma._prismaListenersAttached) {
  prisma.$on('error', (e) => logger.error('Prisma error', e));
  prisma.$on('warn', (e) => logger.warn('Prisma warning', e));
  if (config.isDevelopment) {
    prisma.$on('info', (e) => logger.info('Prisma info', e));
    prisma.$on('query', (e) => logger.debug?.('Prisma query', e) || logger.info('Prisma query', e));
  }
  globalForPrisma._prismaListenersAttached = true;
}

if (config.isDevelopment) {
  globalForPrisma.prisma = prisma;
}

export default prisma;
