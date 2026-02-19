# Integration Tests Guide

## 🧪 **Overview**

This comprehensive integration test suite covers authentication and matchmaking endpoints using Supertest with proper setup and teardown procedures. The tests ensure your API endpoints work correctly with real database interactions.

## 📁 **Test Structure**

```
tests/
├── integration/
│   ├── auth.test.js              # Authentication endpoint tests
│   └── matchmaking.test.js       # Matchmaking endpoint tests
├── utils/
│   ├── testDatabase.js          # Database utilities for testing
│   └── testHelpers.js            # Test helper functions
├── scripts/
│   └── test-runner.js           # Advanced test runner script
├── jest.config.js               # Jest configuration
├── setup.js                     # Test setup (runs before each file)
├── globalSetup.js               # Global setup (runs once)
└── globalTeardown.js            # Global teardown (runs once)
```

## 🚀 **Quick Start**

### **1. Install Dependencies**
```bash
npm install --save-dev jest supertest @types/jest @types/supertest
```

### **2. Environment Setup**
```bash
# .env.test
NODE_ENV=test
JWT_ACCESS_SECRET=test-access-secret-key
JWT_REFRESH_SECRET=test-refresh-secret-key
DATABASE_URL=postgresql://test:test@localhost:5432/petmat_test
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=1
```

### **3. Start Test Services**
```bash
# Start PostgreSQL test database
docker run -d --name postgres-test \
  -e POSTGRES_DB=petmat_test \
  -e POSTGRES_USER=test \
  -e POSTGRES_PASSWORD=test \
  -p 5432:5432 postgres:15

# Start Redis for tests
docker run -d --name redis-test \
  -p 6379:6379 redis:alpine

# Run database migrations
npx prisma migrate deploy
```

### **4. Run Tests**
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test types
npm run test:unit
npm run test:integration

# Use advanced test runner
npm run test:runner all
```

## 🔧 **Test Configuration**

### **Jest Configuration** (`tests/jest.config.js`)
- **Test Environment**: Node.js for backend testing
- **Coverage**: Collects from server files, excludes test files
- **Timeout**: 30 seconds for database operations
- **Setup**: Global setup/teardown for database management
- **Cleanup**: Automatic mock and connection cleanup

### **Environment Variables**
```javascript
// tests/setup.js
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/petmat_test';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.REDIS_DB = '1';
```

## 📊 **Test Coverage Areas**

### **Authentication Tests** (`tests/integration/auth.test.js`)

#### **Registration Endpoint (`POST /api/auth/register`)**
- ✅ Successful user registration
- ✅ Invalid email validation
- ✅ Weak password rejection
- ✅ Duplicate email handling
- ✅ Missing required fields
- ✅ Rate limiting enforcement

#### **Login Endpoint (`POST /api/auth/login`)**
- ✅ Successful login with valid credentials
- ✅ Invalid email rejection
- ✅ Invalid password rejection
- ✅ Missing credentials handling
- ✅ Login rate limiting
- ✅ Last login timestamp update

#### **Token Refresh (`POST /api/auth/refresh`)**
- ✅ Successful token refresh
- ✅ Invalid token rejection
- ✅ Expired token handling
- ✅ Missing token validation
- ✅ Token rotation mechanism

#### **Logout Endpoints**
- ✅ Single device logout (`POST /api/auth/logout`)
- ✅ All devices logout (`POST /api/auth/logout-all`)
- ✅ Token invalidation verification

#### **User Profile (`GET /api/auth/me`)**
- ✅ Current user profile retrieval
- ✅ Authentication requirement
- ✅ Sensitive data filtering (password exclusion)

#### **Session Management (`GET /api/auth/sessions`)**
- ✅ Active sessions listing
- ✅ Session metadata validation

### **Matchmaking Tests** (`tests/integration/matchmaking.test.js`)

#### **Match Creation (`POST /api/matches`)**
- ✅ Successful match creation
- ✅ Invalid pet ID handling
- ✅ Authentication requirement
- ✅ Duplicate match prevention
- ✅ Score range validation

#### **Match Retrieval (`GET /api/matches/:id`)**
- ✅ Individual match retrieval
- ✅ Pet details inclusion
- ✅ Non-existent match handling
- ✅ Authentication requirement

#### **Match Status Updates (`PUT /api/matches/:id/status`)**
- ✅ Status update success
- ✅ Invalid status rejection
- ✅ Non-existent match handling

#### **Match Recommendations (`GET /api/matches/recommendations/:petId`)**
- ✅ Recommendations generation
- ✅ Preference filtering
- ✅ Result limiting
- ✅ Score-based sorting
- ✅ Non-existent pet handling

#### **Match Scoring (`POST /api/matches/calculate`)**
- ✅ Score calculation between pets
- ✅ Detailed factor breakdown
- ✅ Invalid pet ID handling

#### **Match Management**
- ✅ All matches retrieval (`GET /api/matches`)
- ✅ Status filtering
- ✅ Pagination support
- ✅ Sorting capabilities
- ✅ Match deletion (`DELETE /api/matches/:id`)

#### **Performance & Quality**
- ✅ Large dataset handling
- ✅ Concurrent request processing
- ✅ Score consistency validation
- ✅ Error handling and edge cases

## 🛠️ **Test Utilities**

### **TestDatabase Class** (`tests/utils/testDatabase.js`)
```javascript
const db = new TestDatabase();

// Setup and cleanup
await db.connect();
await db.cleanup();
await db.disconnect();

// Create test data
const user = await db.createTestUser(userData);
const pet = await db.createTestPet(userId, petData);
const match = await db.createTestMatch(petId1, petId2);

// Query helpers
const users = await db.createMultipleTestUsers(3);
const pets = await db.createMultipleTestPets(userId, 2);
```

### **TestHelpers Class** (`tests/utils/testHelpers.js`)
```javascript
const helpers = new TestHelpers(app);

// Authentication helpers
const authData = await helpers.createAuthenticatedUser();
const loginData = await helpers.loginUser(credentials);

// Request helpers
const response = await helpers.get('/api/pets', user);
const response = await helpers.post('/api/pets', data, user);

// Assertion helpers
helpers.expectSuccess(response, 200);
helpers.expectError(response, 400, 'Invalid input');
helpers.expectUser(response);
helpers.expectPet(response);
```

## 🎯 **Advanced Test Runner**

### **Features**
- **Health Checks**: Database and Redis connection validation
- **Dependency Management**: Automatic missing dependency installation
- **Environment Setup**: Test environment configuration
- **Coverage Reports**: HTML and LCOV coverage generation
- **Pattern Matching**: Run tests matching specific patterns
- **Performance Metrics**: Test execution timing

### **Usage Examples**
```bash
# Run all tests with coverage
node tests/scripts/test-runner.js all

# Run only unit tests
node tests/scripts/test-runner.js unit

# Run only integration tests
node tests/scripts/test-runner.js integration

# Generate coverage report
node tests/scripts/test-runner.js coverage

# Run tests matching pattern
node tests/scripts/test-runner.js match --pattern "auth.*login"

# Skip health checks
node tests/scripts/test-runner.js all --skip-health-checks
```

## 📈 **Coverage Reporting**

### **Coverage Configuration**
```javascript
// jest.config.js
collectCoverageFrom: [
  'server/**/*.js',
  '!server/**/*.test.js',
  '!server/**/*.spec.js',
  '!server/node_modules/**',
  '!server/dist/**'
],
coverageDirectory: 'coverage',
coverageReporters: ['text', 'lcov', 'html', 'json-summary']
```

### **View Coverage Reports**
```bash
# Generate and view coverage
npm run test:coverage

# Open HTML report
open coverage/lcov-report/index.html

# View coverage summary
cat coverage/coverage-summary.json
```

## 🔄 **Setup and Teardown**

### **Global Setup** (`tests/globalSetup.js`)
- Runs once before all tests
- Connects to test database
- Cleans up test data
- Initializes Redis connection
- Stores connections for teardown

### **Global Teardown** (`tests/globalTeardown.js`)
- Runs once after all tests
- Cleans up Redis test data
- Disconnects database connections
- Logs completion status

### **Per-Test Setup** (`tests/setup.js`)
- Runs before each test file
- Sets test environment variables
- Configures console mocking
- Clears mocks between tests

### **Per-Test Teardown**
- Automatic cleanup after each test
- Connection cleanup
- Mock restoration
- Memory leak prevention

## 🚨 **Best Practices**

### **Test Organization**
1. **Describe blocks**: Group related tests
2. **Clear test names**: Describe what is being tested
3. **Arrange-Act-Assert**: Structure test logic clearly
4. **Setup/Teardown**: Use beforeEach/afterEach for isolation

### **Data Management**
1. **Test data isolation**: Each test gets fresh data
2. **Cleanup**: Always clean up created data
3. **Realistic data**: Use production-like test data
4. **Edge cases**: Test boundary conditions

### **Error Handling**
1. **Expected errors**: Test error responses
2. **Edge cases**: Test malformed requests
3. **Timeouts**: Handle slow operations
4. **Resource cleanup**: Prevent memory leaks

### **Performance**
1. **Parallel execution**: Tests run in parallel
2. **Connection pooling**: Reuse database connections
3. **Mock external services**: Avoid network calls
4. **Efficient queries**: Use database indexes

## 🔍 **Debugging Tests**

### **Common Issues**

#### **Database Connection Errors**
```bash
# Check database is running
docker ps | grep postgres

# Check connection string
echo $DATABASE_URL

# Test connection manually
psql $DATABASE_URL
```

#### **Redis Connection Errors**
```bash
# Check Redis is running
docker ps | grep redis

# Test connection
redis-cli -h localhost -p 6379 ping
```

#### **Test Timeouts**
```javascript
// Increase timeout for specific tests
test('slow test', async () => {
  // test code
}, 60000); // 60 seconds
```

### **Debugging Techniques**
```javascript
// Log test data
console.log('Created user:', user);

// Pause execution
await new Promise(resolve => setTimeout(resolve, 1000));

// Inspect response
console.log('Response:', JSON.stringify(response.body, null, 2));
```

## 📋 **CI/CD Integration**

### **GitHub Actions Example**
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_USER: test
          POSTGRES_DB: petmat_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/petmat_test
          REDIS_HOST: localhost
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## 🎯 **Test Metrics**

### **Coverage Targets**
- **Overall Coverage**: > 80%
- **Function Coverage**: > 90%
- **Branch Coverage**: > 75%
- **Line Coverage**: > 85%

### **Performance Benchmarks**
- **Test Execution**: < 30 seconds total
- **Database Operations**: < 100ms per query
- **API Responses**: < 200ms average
- **Concurrent Tests**: Handle 10+ parallel

This comprehensive integration test suite provides reliable testing for your authentication and matchmaking systems with proper setup, teardown, and coverage reporting.
