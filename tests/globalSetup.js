// Global setup - runs once before all tests
const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');

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

    // Clean up test database
    await cleanupDatabase(prisma);
    console.log('🧹 Test database cleaned');

    // Initialize test Redis
    const redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      db: process.env.REDIS_DB || 1
    });

    await redis.connect();
    console.log('✅ Test Redis connected');

    // Clean up test Redis
    await redis.flushdb();
    console.log('🧹 Test Redis cleaned');

    // Store connections for teardown
    global.testPrisma = prisma;
    global.testRedis = redis;

    await prisma.$disconnect();
    await redis.disconnect();

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
      await prisma.$executeRawUnsafe(`DELETE FROM "${tableName}";`);
      console.log(`🗑️  Cleaned table: ${tableName}`);
    } catch (error) {
      console.warn(`⚠️  Could not clean table ${tableName}:`, error.message);
    }
  }

  // Reset auto-increment counters
  try {
    await prisma.$executeRawUnsafe(`
      SELECT setval(pg_get_serial_sequence('"User"', 'id'), 1, false);
      SELECT setval(pg_get_serial_sequence('"Pet"', 'id'), 1, false);
      SELECT setval(pg_get_serial_sequence('"PetMatch"', 'id'), 1, false);
      SELECT setval(pg_get_serial_sequence('"RefreshToken"', 'id'), 1, false);
      SELECT setval(pg_get_serial_sequence('"SupportTicket"', 'id'), 1, false);
    `);
  } catch (error) {
    console.warn('⚠️  Could not reset sequence counters:', error.message);
  }
}
