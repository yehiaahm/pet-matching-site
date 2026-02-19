/**
 * Jest Test Setup
 * Global test configuration and utilities
 */

import 'jest-extended';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidMatch(): R;
      toBeWithinScoreRange(min: number, max: number): R;
      toHaveValidCompatibilityFactors(): R;
    }
  }
}

// Custom matchers
expect.extend({
  toBeValidMatch(received: any) {
    const pass = received &&
      typeof received.pet === 'object' &&
      typeof received.score === 'number' &&
      typeof received.compatibilityFactors === 'object' &&
      received.matchedAt instanceof Date;

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid match`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid match with pet, score, compatibilityFactors, and matchedAt`,
        pass: false,
      };
    }
  },

  toBeWithinScoreRange(received: number, min: number, max: number) {
    const pass = received >= min && received <= max;
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${min}-${max}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${min}-${max}`,
        pass: false,
      };
    }
  },

  toHaveValidCompatibilityFactors(received: any) {
    const pass = received.compatibilityFactors &&
      typeof received.compatibilityFactors.breed === 'number' &&
      typeof received.compatibilityFactors.age === 'number' &&
      typeof received.compatibilityFactors.location === 'number' &&
      typeof received.compatibilityFactors.health === 'number' &&
      typeof received.compatibilityFactors.pedigree === 'number' &&
      typeof received.compatibilityFactors.price === 'number' &&
      Object.values(received.compatibilityFactors).every((value: any) => 
        typeof value === 'number' && value >= 0 && value <= 100
      );

    if (pass) {
      return {
        message: () => `expected ${received} not to have valid compatibility factors`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to have valid compatibility factors (all numbers between 0-100)`,
        pass: false,
      };
    }
  },
});

// Mock Date.now for consistent testing
const mockDate = new Date('2024-01-01T00:00:00.000Z');
global.Date.now = jest.fn(() => mockDate.getTime());

// Mock performance.now
global.performance = {
  ...global.performance,
  now: jest.fn(() => 0),
};

// Setup and teardown hooks
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

// Error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Export test utilities
export const createMockPet = (overrides: any = {}) => ({
  id: 'pet-1',
  name: 'Buddy',
  species: 'dog',
  breed: 'Golden Retriever',
  gender: 'male' as const,
  dateOfBirth: new Date('2020-01-15'),
  weight: 30,
  height: 55,
  color: 'golden',
  isVaccinated: true,
  isNeutered: true,
  lastHealthCheckDate: new Date('2024-01-01'),
  nextVaccinationDate: new Date('2024-06-01'),
  breedingStatus: 'AVAILABLE' as const,
  breedingPrice: 500,
  nextAvailableDate: new Date('2024-02-01'),
  hasPedigree: true,
  images: ['image1.jpg'],
  videos: [],
  description: 'Friendly and energetic',
  isPublished: true,
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
  ownerId: 'user-1',
  location: { latitude: 40.7128, longitude: -74.0060 },
  healthConditions: 'None',
  microchipNumber: '123456789',
  registrationNumber: 'REG123',
  pedigreeNumber: 'PED456',
  distinctiveFeatures: 'White patch on chest',
  ...overrides,
});

export const createMockPreferences = (overrides: any = {}) => ({
  species: ['dog'],
  breeds: ['Golden Retriever', 'Labrador'],
  gender: 'female' as const,
  ageRange: { min: 2, max: 5 },
  weightRange: { min: 20, max: 40 },
  maxDistance: 50,
  breedingStatus: ['AVAILABLE'],
  hasPedigree: true,
  isVaccinated: true,
  isNeutered: true,
  maxBreedingPrice: 1000,
  healthConditions: 'None',
  minCompatibilityScore: 70,
  ...overrides,
});

export const createMockWeights = (overrides: any = {}) => ({
  breed: 25,
  age: 20,
  location: 20,
  health: 15,
  pedigree: 10,
  price: 10,
  ...overrides,
});

export const createMockPrismaClient = () => ({
  pet: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
  match: {
    findMany: jest.fn(),
    create: jest.fn(),
    groupBy: jest.fn(),
    aggregate: jest.fn(),
    count: jest.fn(),
  },
});

// Performance testing utilities
export const measurePerformance = async (fn: () => Promise<void> | void) => {
  const start = performance.now();
  await fn();
  const end = performance.now();
  return end - start;
};

// Async test utilities
export const waitFor = (condition: () => boolean, timeout: number = 5000) => {
  return new Promise<void>((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Condition not met within ${timeout}ms`));
      } else {
        setTimeout(check, 100);
      }
    };
    
    check();
  });
};

// Error assertion utilities
export const expectError = async (fn: () => Promise<any>, expectedError?: string) => {
  try {
    await fn();
    fail('Expected function to throw an error');
  } catch (error) {
    if (expectedError) {
      expect(error.message).toContain(expectedError);
    }
    return error;
  }
};

// Data generation utilities
export const generatePets = (count: number, basePet: any = {}) => {
  return Array.from({ length: count }, (_, i) => 
    createMockPet({
      id: `pet-${i}`,
      name: `Pet ${i}`,
      ...basePet,
    })
  );
};

export const generateRandomLocation = () => ({
  latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
  longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
});

// Validation utilities
export const isValidMatchResult = (match: any) => {
  return match &&
    typeof match.pet === 'object' &&
    typeof match.score === 'number' &&
    match.score >= 0 && match.score <= 100 &&
    typeof match.compatibilityFactors === 'object' &&
    match.matchedAt instanceof Date;
};

export const isValidCompatibilityFactors = (factors: any) => {
  return factors &&
    typeof factors.breed === 'number' &&
    typeof factors.age === 'number' &&
    typeof factors.location === 'number' &&
    typeof factors.health === 'number' &&
    typeof factors.pedigree === 'number' &&
    typeof factors.price === 'number' &&
    Object.values(factors).every((value: any) => 
      typeof value === 'number' && value >= 0 && value <= 100
    );
};
