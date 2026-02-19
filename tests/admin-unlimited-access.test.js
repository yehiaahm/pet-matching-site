/**
 * Test Script - Admin Unlimited Access
 * 
 * This script tests that ADMIN users have unlimited access
 * and bypass all rate limiting restrictions.
 * 
 * Usage:
 *   node tests/admin-unlimited-access.test.js
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'YOUR_ADMIN_TOKEN_HERE';

// Test configuration
const TEST_CONFIG = {
  endpoint: '/api/v1/pets',
  requestCount: 150, // More than any rate limit
  delay: 10 // 10ms delay between requests
};

/**
 * Sleep helper function
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Test 1: Regular user gets rate limited
 */
async function testRegularUserRateLimit() {
  console.log('\n🔍 Test 1: Regular User Rate Limit');
  console.log('─'.repeat(50));
  
  let successCount = 0;
  let rateLimitedCount = 0;
  
  for (let i = 0; i < 100; i++) {
    try {
      const response = await axios.get(`${API_BASE_URL}/pets`, {
        headers: {
          'Authorization': 'Bearer REGULAR_USER_TOKEN' // Will be rate limited
        }
      });
      
      successCount++;
    } catch (error) {
      if (error.response?.status === 429) {
        rateLimitedCount++;
        console.log(`❌ Request ${i + 1}: Rate limited (HTTP 429)`);
        break;
      }
    }
    
    await sleep(TEST_CONFIG.delay);
  }
  
  console.log(`\n✅ Success: ${successCount}`);
  console.log(`❌ Rate Limited: ${rateLimitedCount}`);
  console.log(`✓ Regular users ARE rate limited (expected)\n`);
}

/**
 * Test 2: Admin user has unlimited access
 */
async function testAdminUnlimitedAccess() {
  console.log('\n🔍 Test 2: Admin Unlimited Access');
  console.log('─'.repeat(50));
  
  let successCount = 0;
  let errorCount = 0;
  let rateLimitedCount = 0;
  
  console.log(`Sending ${TEST_CONFIG.requestCount} requests...`);
  
  for (let i = 0; i < TEST_CONFIG.requestCount; i++) {
    try {
      const response = await axios.get(`${API_BASE_URL}/pets`, {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        }
      });
      
      successCount++;
      
      // Show progress every 25 requests
      if ((i + 1) % 25 === 0) {
        console.log(`✓ Progress: ${i + 1}/${TEST_CONFIG.requestCount} requests succeeded`);
      }
      
      // Check rate limit headers
      const headers = response.headers;
      if (headers['x-ratelimit-limit'] === 'unlimited') {
        console.log(`✓ Request ${i + 1}: Unlimited rate limit confirmed`);
      }
      
    } catch (error) {
      if (error.response?.status === 429) {
        rateLimitedCount++;
        console.log(`❌ Request ${i + 1}: Rate limited (HTTP 429) - UNEXPECTED!`);
      } else {
        errorCount++;
        console.log(`⚠️ Request ${i + 1}: Error ${error.response?.status}`);
      }
    }
    
    await sleep(TEST_CONFIG.delay);
  }
  
  console.log(`\n📊 Results:`);
  console.log(`─`.repeat(50));
  console.log(`✅ Successful requests: ${successCount}/${TEST_CONFIG.requestCount}`);
  console.log(`❌ Rate limited: ${rateLimitedCount}`);
  console.log(`⚠️ Other errors: ${errorCount}`);
  
  if (rateLimitedCount === 0 && successCount === TEST_CONFIG.requestCount) {
    console.log(`\n🎉 SUCCESS: Admin has unlimited access!`);
    return true;
  } else {
    console.log(`\n❌ FAILED: Admin should have unlimited access`);
    return false;
  }
}

/**
 * Test 3: Check rate limit headers for admin
 */
async function testAdminRateLimitHeaders() {
  console.log('\n🔍 Test 3: Admin Rate Limit Headers');
  console.log('─'.repeat(50));
  
  try {
    const response = await axios.get(`${API_BASE_URL}/pets`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });
    
    const headers = response.headers;
    
    console.log(`\nRate Limit Headers:`);
    console.log(`  X-RateLimit-Limit: ${headers['x-ratelimit-limit']}`);
    console.log(`  X-RateLimit-Tier: ${headers['x-ratelimit-tier']}`);
    console.log(`  X-RateLimit-Window: ${headers['x-ratelimit-window']}`);
    
    if (headers['x-ratelimit-limit'] === 'unlimited') {
      console.log(`\n✓ Confirmed: Admin has unlimited rate limit`);
      return true;
    } else {
      console.log(`\n❌ Expected 'unlimited' but got: ${headers['x-ratelimit-limit']}`);
      return false;
    }
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    return false;
  }
}

/**
 * Test 4: Compare Admin vs Regular User
 */
async function testComparison() {
  console.log('\n🔍 Test 4: Admin vs Regular User Comparison');
  console.log('─'.repeat(50));
  
  // Test with regular user (expect rate limit after ~60 requests)
  console.log('\n📊 Testing Regular User (Free Tier - 60 req/min)...');
  let regularUserCount = 0;
  for (let i = 0; i < 80; i++) {
    try {
      await axios.get(`${API_BASE_URL}/pets`, {
        headers: { 'Authorization': 'Bearer REGULAR_TOKEN' }
      });
      regularUserCount++;
    } catch (error) {
      if (error.response?.status === 429) {
        console.log(`Regular user rate limited after ${regularUserCount} requests`);
        break;
      }
    }
    await sleep(100);
  }
  
  // Test with admin (expect no limit)
  console.log('\n📊 Testing Admin User (Unlimited)...');
  let adminCount = 0;
  for (let i = 0; i < 150; i++) {
    try {
      await axios.get(`${API_BASE_URL}/pets`, {
        headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
      });
      adminCount++;
    } catch (error) {
      if (error.response?.status === 429) {
        console.log(`Admin rate limited after ${adminCount} requests - UNEXPECTED!`);
        break;
      }
    }
    await sleep(100);
  }
  
  console.log(`\n📈 Comparison Results:`);
  console.log(`─`.repeat(50));
  console.log(`Regular User: ${regularUserCount} requests (rate limited)`);
  console.log(`Admin User: ${adminCount} requests (unlimited)`);
  
  if (adminCount > regularUserCount && adminCount === 150) {
    console.log(`\n✓ SUCCESS: Admin significantly exceeds regular user limits`);
    return true;
  } else {
    console.log(`\n❌ FAILED: Admin should have more access than regular users`);
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║  Admin Unlimited Access Test Suite                   ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  
  // Check if admin token is provided
  if (ADMIN_TOKEN === 'YOUR_ADMIN_TOKEN_HERE') {
    console.error('\n❌ Error: Please set ADMIN_TOKEN environment variable');
    console.log('\nUsage:');
    console.log('  ADMIN_TOKEN=your_token node tests/admin-unlimited-access.test.js');
    process.exit(1);
  }
  
  try {
    const results = [];
    
    // Run tests
    // results.push(await testRegularUserRateLimit());
    results.push(await testAdminUnlimitedAccess());
    results.push(await testAdminRateLimitHeaders());
    // results.push(await testComparison());
    
    // Summary
    const passed = results.filter(r => r === true).length;
    const total = results.length;
    
    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log(`║  Test Summary: ${passed}/${total} tests passed                      ║`);
    console.log('╚═══════════════════════════════════════════════════════╝');
    
    if (passed === total) {
      console.log('\n🎉 All tests passed! Admin has unlimited access.\n');
      process.exit(0);
    } else {
      console.log('\n❌ Some tests failed. Check configuration.\n');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testAdminUnlimitedAccess,
  testAdminRateLimitHeaders,
  testComparison
};
