// Global setup - runs once before all tests
require('dotenv').config({ path: './server/.env' });

let PrismaClient;
try {
  ({ PrismaClient } = require('@prisma/client'));
} catch (error) {
  ({ PrismaClient } = require('../server/node_modules/@prisma/client'));
}

// Use ioredis-mock for testing
const Redis = require('ioredis-mock');

module.exports = async () => {
  console.log('🚀 Setting up test environment...');
  
  try {
    // Initialize test database
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });

    // Test database connection
    await prisma.$connect();
    console.log('✅ Test database connected');

    // Push Prisma schema to ensure tables exist
    try {
      const { execSync } = require('child_process');
      const path = require('path');
      const serverPath = path.join(process.cwd(), 'server');
      execSync('npx prisma db push --accept-data-loss --schema=./prisma/schema.prisma', { 
        stdio: 'pipe', 
        cwd: serverPath 
      });
      console.log('✅ Database schema synced');
    } catch (err) {
      console.warn('⚠️  Could not push schema:', err.message);
    }

    // Clean up test database
    await cleanupDatabase(prisma);
    console.log('🧹 Test database cleaned');

    // Initialize test Redis (using mock)
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      db: process.env.REDIS_DB || 1
    });

    try {
      await redis.ping();
      console.log('✅ Test Redis connected');
    } catch (err) {
      console.warn('⚠️  Redis not available, using mock');
    }

    // Clean up test Redis
    try {
      await redis.flushdb();
      console.log('🧹 Test Redis cleaned');
    } catch (err) {
      console.warn('⚠️  Could not flush Redis:', err.message);
    }

    // Store connections for teardown
    global.testPrisma = prisma;
    global.testRedis = redis;

    await prisma.$disconnect();

    console.log('✅ Test environment setup complete');
  } catch (error) {
    console.error('❌ Test setup failed:', error);
    process.exit(1);
  }
};

async function cleanupDatabase(prisma) {
  // Clean up in correct order to respect foreign key constraints
  const tableNames = [
    'RefreshToken',
    'SupportTicket',
    'PetMatch',
    'Pet',
    'User'
  ];

  for (const tableName of tableNames) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tableName}" CASCADE;`);
      console.log(`🗑️  Cleaned table: ${tableName}`);
    } catch (error) {
      if (error.message && error.message.includes('does not exist')) {
        console.log(`ℹ️  Table ${tableName} does not exist yet (schema may need migration)`);
      } else {
        console.warn(`⚠️  Could not clean table ${tableName}: ${error.message}`);
      }
    }
  }

  // Reset auto-increment counters
  try {
    const sequenceResets = [
      `SELECT setval(pg_get_serial_sequence('"User"', 'id'), 1, false);`,
      `SELECT setval(pg_get_serial_sequence('"Pet"', 'id'), 1, false);`,
      `SELECT setval(pg_get_serial_sequence('"PetMatch"', 'id'), 1, false);`,
      `SELECT setval(pg_get_serial_sequence('"RefreshToken"', 'id'), 1, false);`,
      `SELECT setval(pg_get_serial_sequence('"SupportTicket"', 'id'), 1, false);`,
    ];

    for (const query of sequenceResets) {
      try {
        await prisma.$executeRawUnsafe(query);
      } catch (error) {
        console.warn('⚠️  Could not reset a sequence counter:', error.message);
      }
    }
  } catch (error) {
    console.warn('⚠️  Could not reset sequence counters:', error.message);
  }
}
