module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/integration'],
  testMatch: ['**/*.integration.test.cjs'],
  testTimeout: 120000,
  verbose: true,
  clearMocks: true,
};
