// Test setup file - runs before each test file
const { beforeAll, afterAll, beforeEach, afterEach } = require('@jest/globals');
require('dotenv').config({ path: './server/.env' });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-key-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing-only';
// Use same database as server, tests will clean up after themselves
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:yehia.hema195200@localhost:5432/pets_db';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.REDIS_DB = '1'; // Use different DB for tests

// Increase timeout for database operations
jest.setTimeout(30000);

// Global test utilities
global.testUtils = {
  generateTestUser: () => ({
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    phone: '+1234567890'
  }),
  
  generateTestPet: (userId) => ({
    userId,
    name: `TestPet-${Date.now()}`,
    type: 'dog',
    breed: 'Golden Retriever',
    age: 2,
    gender: 'male',
    weight: 30,
    description: 'A test pet for integration testing',
    images: ['https://example.com/test-pet.jpg'],
    location: {
      address: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    healthStatus: {
      vaccinated: true,
      neutered: true,
      lastCheckup: new Date().toISOString()
    }
  }),
  
  generateMatchPreferences: () => ({
    maxDistance: 50,
    minAge: 1,
    maxAge: 10,
    preferredTypes: ['dog', 'cat'],
    preferredBreeds: [],
    genderPreference: 'any',
    healthRequirements: {
      vaccinated: true,
      neutered: true
    },
    compatibilityFactors: {
      temperament: 0.8,
      energy: 0.7,
      size: 0.6
    }
  })
};

// Mock console methods to reduce noise in tests
const originalConsole = global.console;

beforeAll(() => {
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };
});

afterAll(() => {
  global.console = originalConsole;
});

// Cleanup before each test
beforeEach(async () => {
  // Clear any test data
  jest.clearAllMocks();
});

afterEach(async () => {
  // Clean up any remaining connections or resources
  if (global.app && global.app.close) {
    await global.app.close();
  }
});
