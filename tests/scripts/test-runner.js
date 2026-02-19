#!/usr/bin/env node

/**
 * Test Runner Script
 * Handles test execution with different environments and configurations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestRunner {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '../..');
    this.testResults = [];
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      start: '🚀'
    }[type] || '📋';

    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runCommand(command, description) {
    this.log(`Running: ${description}`, 'start');
    
    try {
      const startTime = Date.now();
      const output = execSync(command, { 
        cwd: this.projectRoot,
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      const duration = Date.now() - startTime;
      this.log(`${description} completed in ${duration}ms`, 'success');
      
      return {
        success: true,
        output,
        duration,
        description
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.log(`${description} failed in ${duration}ms`, 'error');
      
      return {
        success: false,
        error: error.message,
        output: error.stdout,
        duration,
        description
      };
    }
  }

  async checkDependencies() {
    this.log('Checking dependencies...', 'start');
    
    const packageJson = require(path.join(this.projectRoot, 'package.json'));
    const requiredDeps = [
      'jest',
      'supertest',
      '@prisma/client'
    ];
    
    const missingDeps = [];
    
    for (const dep of requiredDeps) {
      if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
        missingDeps.push(dep);
      }
    }
    
    if (missingDeps.length > 0) {
      this.log(`Missing dependencies: ${missingDeps.join(', ')}`, 'error');
      this.log('Installing missing dependencies...', 'warning');
      
      const installResult = await this.runCommand(
        `npm install ${missingDeps.join(' ')} --save-dev`,
        'Installing dependencies'
      );
      
      if (!installResult.success) {
        throw new Error('Failed to install dependencies');
      }
    }
    
    this.log('All dependencies satisfied', 'success');
  }

  async setupTestEnvironment() {
    this.log('Setting up test environment...', 'start');
    
    // Ensure test directories exist
    const testDirs = [
      'tests',
      'tests/integration',
      'tests/unit',
      'tests/utils',
      'coverage'
    ];
    
    for (const dir of testDirs) {
      const dirPath = path.join(this.projectRoot, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    }
    
    // Set environment variables
    process.env.NODE_ENV = 'test';
    process.env.JWT_ACCESS_SECRET = 'test-access-secret-key';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/petmat_test';
    process.env.REDIS_HOST = process.env.REDIS_HOST || 'localhost';
    process.env.REDIS_PORT = process.env.REDIS_PORT || '6379';
    process.env.REDIS_DB = '1';
    
    this.log('Test environment configured', 'success');
  }

  async runUnitTests() {
    this.log('Running unit tests...', 'start');
    
    const result = await this.runCommand(
      'npm test -- --testPathPattern=unit --verbose',
      'Unit Tests'
    );
    
    this.testResults.push(result);
    return result.success;
  }

  async runIntegrationTests() {
    this.log('Running integration tests...', 'start');
    
    const result = await this.runCommand(
      'npm test -- --testPathPattern=integration --verbose',
      'Integration Tests'
    );
    
    this.testResults.push(result);
    return result.success;
  }

  async runAllTests() {
    this.log('Running all tests...', 'start');
    
    const result = await this.runCommand(
      'npm test -- --verbose --coverage',
      'All Tests'
    );
    
    this.testResults.push(result);
    return result.success;
  }

  async generateCoverageReport() {
    this.log('Generating coverage report...', 'start');
    
    const result = await this.runCommand(
      'npm run test:coverage',
      'Coverage Report'
    );
    
    if (result.success) {
      this.log('Coverage report generated', 'success');
      this.log('View report: file://' + path.join(this.projectRoot, 'coverage', 'lcov-report', 'index.html'), 'info');
    }
    
    return result.success;
  }

  async runTestsMatching(pattern) {
    this.log(`Running tests matching: ${pattern}`, 'start');
    
    const result = await this.runCommand(
      `npm test -- --testNamePattern="${pattern}" --verbose`,
      `Tests matching ${pattern}`
    );
    
    this.testResults.push(result);
    return result.success;
  }

  async checkTestDatabase() {
    this.log('Checking test database connection...', 'start');
    
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL
          }
        }
      });
      
      await prisma.$connect();
      await prisma.$disconnect();
      
      this.log('Test database connection successful', 'success');
      return true;
    } catch (error) {
      this.log(`Test database connection failed: ${error.message}`, 'error');
      return false;
    }
  }

  async checkRedisConnection() {
    this.log('Checking Redis connection...', 'start');
    
    try {
      const Redis = require('ioredis');
      const redis = new Redis({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        db: process.env.REDIS_DB || 1
      });
      
      await redis.ping();
      await redis.disconnect();
      
      this.log('Redis connection successful', 'success');
      return true;
    } catch (error) {
      this.log(`Redis connection failed: ${error.message}`, 'error');
      return false;
    }
  }

  async runHealthChecks() {
    this.log('Running health checks...', 'start');
    
    const dbOk = await this.checkTestDatabase();
    const redisOk = await this.checkRedisConnection();
    
    if (!dbOk || !redisOk) {
      this.log('Health checks failed. Please ensure test services are running.', 'error');
      this.log('Database: ' + (dbOk ? '✅' : '❌'), dbOk ? 'success' : 'error');
      this.log('Redis: ' + (redisOk ? '✅' : '❌'), redisOk ? 'success' : 'error');
      return false;
    }
    
    this.log('All health checks passed', 'success');
    return true;
  }

  printSummary() {
    const totalDuration = Date.now() - this.startTime;
    const successfulTests = this.testResults.filter(r => r.success).length;
    const failedTests = this.testResults.filter(r => !r.success).length;
    
    console.log('\n' + '='.repeat(60));
    console.log('🧪 TEST EXECUTION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Duration: ${totalDuration}ms`);
    console.log(`Test Suites: ${this.testResults.length}`);
    console.log(`Successful: ${successfulTests} ✅`);
    console.log(`Failed: ${failedTests} ${failedTests > 0 ? '❌' : '✅'}`);
    
    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`  - ${r.description}: ${r.error}`);
        });
    }
    
    console.log('='.repeat(60));
    
    return failedTests === 0;
  }

  async run(args) {
    try {
      await this.checkDependencies();
      await this.setupTestEnvironment();
      
      const healthOk = await this.runHealthChecks();
      if (!healthOk && !args.skipHealthChecks) {
        process.exit(1);
      }
      
      let success = true;
      
      switch (args.command) {
        case 'unit':
          success = await this.runUnitTests();
          break;
          
        case 'integration':
          success = await this.runIntegrationTests();
          break;
          
        case 'coverage':
          success = await this.generateCoverageReport();
          break;
          
        case 'all':
          success = await this.runAllTests();
          if (success) {
            await this.generateCoverageReport();
          }
          break;
          
        case 'match':
          if (!args.pattern) {
            throw new Error('Pattern required for match command');
          }
          success = await this.runTestsMatching(args.pattern);
          break;
          
        default:
          console.log(`
Usage: node test-runner.js <command> [options]

Commands:
  unit        Run unit tests only
  integration Run integration tests only
  coverage    Generate coverage report
  all         Run all tests with coverage (default)
  match       Run tests matching pattern

Options:
  --skip-health-checks    Skip database/Redis health checks
  --pattern <pattern>     Test pattern for match command

Examples:
  node test-runner.js all
  node test-runner.js unit
  node test-runner.js integration
  node test-runner.js match "auth.*login"
  node test-runner.js coverage
          `);
          return;
      }
      
      const allPassed = this.printSummary();
      process.exit(allPassed && success ? 0 : 1);
      
    } catch (error) {
      this.log(`Test runner failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  if (arg.startsWith('--')) {
    const [key, value] = arg.slice(2).split('=');
    acc[key] = value || true;
  } else {
    acc.command = arg;
  }
  return acc;
}, {});

// Run test runner
const runner = new TestRunner();
runner.run(args);
