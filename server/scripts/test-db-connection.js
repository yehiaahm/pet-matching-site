#!/usr/bin/env node
import prisma from '../config/prisma.js';
import logger from '../config/logger.js';

const test = async () => {
  try {
    await prisma.$connect();
    logger.info('✅ Database connection successful');
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    logger.error('❌ Database connection failed', err?.message || err);
    process.exit(2);
  }
};

test();
