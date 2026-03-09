// Global teardown - runs once after all tests
const Redis = require('ioredis-mock');

module.exports = async () => {
  console.log('🔄 Tearing down test environment...');
  
  try {
    // Clean up Redis test data (using mock)
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      db: process.env.REDIS_DB || 1
    });

    try {
      await redis.flushdb();
      console.log('🧹 Test Redis cleaned up');
    } catch (err) {
      console.warn('⚠️  Could not flush Redis:', err.message);
    }

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
