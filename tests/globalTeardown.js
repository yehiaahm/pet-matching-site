// Global teardown - runs once after all tests
const Redis = require('ioredis');

module.exports = async () => {
  console.log('🔄 Tearing down test environment...');
  
  try {
    // Clean up Redis test data
    const redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      db: process.env.REDIS_DB || 1
    });

    await redis.connect();
    await redis.flushdb();
    await redis.disconnect();
    console.log('🧹 Test Redis cleaned up');

    // Close any remaining database connections
    if (global.testPrisma) {
      await global.testPrisma.$disconnect();
      console.log('🔌 Test database disconnected');
    }

    console.log('✅ Test environment teardown complete');
  } catch (error) {
    console.error('❌ Test teardown failed:', error);
  }
};
