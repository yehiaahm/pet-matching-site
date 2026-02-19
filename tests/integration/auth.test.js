const request = require('supertest');
const app = require('../../server/examples/rateLimitingExample');
const TestHelpers = require('../utils/testHelpers');
const TestDatabase = require('../utils/testDatabase');

describe('Authentication Integration Tests', () => {
  let helpers;
  let db;

  beforeAll(async () => {
    helpers = new TestHelpers(app);
    db = new TestDatabase();
    await helpers.setup();
  });

  afterAll(async () => {
    await helpers.teardown();
  });

  beforeEach(async () => {
    await db.cleanup();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = global.testUtils.generateTestUser();
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Verify response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('expiresIn');

      // Verify user data
      const user = response.body.user;
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email', userData.email);
      expect(user).toHaveProperty('firstName', userData.firstName);
      expect(user).toHaveProperty('lastName', userData.lastName);
      expect(user).toHaveProperty('role', 'user');
      expect(user).toHaveProperty('isActive', true);
      expect(user).toHaveProperty('emailVerified', false);
      expect(user).not.toHaveProperty('password'); // Password should not be returned

      // Verify tokens
      expect(response.body.accessToken).toBeTruthy();
      expect(response.body.refreshToken).toBeTruthy();
      expect(typeof response.body.expiresIn).toBe('number');

      // Verify user was created in database
      const dbUser = await db.getUserByEmail(userData.email);
      expect(dbUser).toBeTruthy();
      expect(dbUser.email).toBe(userData.email);
    });

    it('should reject registration with invalid email', async () => {
      const userData = global.testUtils.generateTestUser();
      userData.email = 'invalid-email';

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('email');
    });

    it('should reject registration with weak password', async () => {
      const userData = global.testUtils.generateTestUser();
      userData.password = '123';

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('password');
    });

    it('should reject registration with duplicate email', async () => {
      const userData = global.testUtils.generateTestUser();
      
      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('email');
      expect(response.body.error).toContain('already exists');
    });

    it('should reject registration with missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('required');
    });

    it('should handle registration rate limiting', async () => {
      const userData = global.testUtils.generateTestUser();
      
      // Make multiple registration attempts
      for (let i = 0; i < 3; i++) {
        userData.email = `test-${i}-${Date.now()}@example.com`;
        await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(201);
      }

      // Next attempt should be rate limited
      userData.email = `test-rate-limit-${Date.now()}@example.com`;
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(429);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Rate limit');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      await db.createTestUser({
        email: 'login-test@example.com',
        password: 'TestPassword123!'
      });
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login-test@example.com',
          password: 'TestPassword123!'
        })
        .expect(200);

      // Verify response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('expiresIn');

      // Verify user data
      const user = response.body.user;
      expect(user).toHaveProperty('email', 'login-test@example.com');
      expect(user).not.toHaveProperty('password');

      // Verify tokens
      expect(response.body.accessToken).toBeTruthy();
      expect(response.body.refreshToken).toBeTruthy();
    });

    it('should reject login with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPassword123!'
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('credentials');
    });

    it('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login-test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('credentials');
    });

    it('should reject login with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('required');
    });

    it('should handle login rate limiting', async () => {
      // Make multiple failed login attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: 'login-test@example.com',
            password: 'wrongpassword'
          })
          .expect(401);
      }

      // Next attempt should be rate limited
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login-test@example.com',
          password: 'TestPassword123!'
        })
        .expect(429);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Rate limit');
    });

    it('should update last login timestamp on successful login', async () => {
      const user = await db.getUserByEmail('login-test@example.com');
      const originalLastLogin = user.lastLoginAt;

      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 100));

      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login-test@example.com',
          password: 'TestPassword123!'
        })
        .expect(200);

      const updatedUser = await db.getUserByEmail('login-test@example.com');
      expect(updatedUser.lastLoginAt).not.toEqual(originalLastLogin);
    });
  });

  describe('POST /api/auth/refresh', () => {
    let user;
    let refreshToken;

    beforeEach(async () => {
      // Create user and get refresh token
      user = await db.createTestUser();
      refreshToken = await db.createRefreshToken(user.id);
    });

    it('should refresh tokens successfully with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: refreshToken.token })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('expiresIn');

      // New tokens should be different
      expect(response.body.accessToken).not.toBe(refreshToken.token);
      expect(response.body.refreshToken).not.toBe(refreshToken.token);
    });

    it('should reject refresh with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('token');
    });

    it('should reject refresh with missing token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('required');
    });

    it('should reject refresh with expired token', async () => {
      // Create expired refresh token
      const expiredToken = await db.createRefreshToken(user.id, {
        expiresAt: new Date(Date.now() - 1000) // Expired 1 second ago
      });

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: expiredToken.token })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('expired');
    });

    it('should handle refresh token rotation', async () => {
      const originalTokenCount = await db.prisma.refreshToken.count({
        where: { userId: user.id }
      });

      await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: refreshToken.token })
        .expect(200);

      // Original token should be invalidated
      const invalidatedToken = await db.prisma.refreshToken.findUnique({
        where: { token: refreshToken.token }
      });
      expect(invalidatedToken).toBeNull();

      // New token should be created
      const newTokenCount = await db.prisma.refreshToken.count({
        where: { userId: user.id }
      });
      expect(newTokenCount).toBe(originalTokenCount);
    });
  });

  describe('POST /api/auth/logout', () => {
    let user;
    let tokens;

    beforeEach(async () => {
      const authData = await helpers.createAuthenticatedUser();
      user = authData.user;
      tokens = authData.tokens;
    });

    it('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });

    it('should reject logout without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('token');
    });

    it('should reject logout with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('token');
    });

    it('should invalidate refresh tokens on logout', async () => {
      // Create refresh token
      await db.createRefreshToken(user.id);

      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .expect(200);

      // Refresh tokens should be invalidated
      const refreshTokens = await db.prisma.refreshToken.findMany({
        where: { userId: user.id }
      });
      expect(refreshTokens).toHaveLength(0);
    });
  });

  describe('POST /api/auth/logout-all', () => {
    let user;
    let tokens;

    beforeEach(async () => {
      const authData = await helpers.createAuthenticatedUser();
      user = authData.user;
      tokens = authData.tokens;

      // Create multiple refresh tokens
      await db.createRefreshToken(user.id, { token: 'token1' });
      await db.createRefreshToken(user.id, { token: 'token2' });
      await db.createRefreshToken(user.id, { token: 'token3' });
    });

    it('should logout from all devices successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout-all')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });

    it('should invalidate all refresh tokens', async () => {
      await request(app)
        .post('/api/auth/logout-all')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .expect(200);

      // All refresh tokens should be invalidated
      const refreshTokens = await db.prisma.refreshToken.findMany({
        where: { userId: user.id }
      });
      expect(refreshTokens).toHaveLength(0);
    });
  });

  describe('GET /api/auth/me', () => {
    let user;
    let tokens;

    beforeEach(async () => {
      const authData = await helpers.createAuthenticatedUser();
      user = authData.user;
      tokens = authData.tokens;
    });

    it('should get current user profile successfully', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');

      const returnedUser = response.body.user;
      expect(returnedUser.id).toBe(user.id);
      expect(returnedUser.email).toBe(user.email);
      expect(returnedUser.firstName).toBe(user.firstName);
      expect(returnedUser.lastName).toBe(user.lastName);
      expect(returnedUser).not.toHaveProperty('password');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('token');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('token');
    });
  });

  describe('GET /api/auth/sessions', () => {
    let user;
    let tokens;

    beforeEach(async () => {
      const authData = await helpers.createAuthenticatedUser();
      user = authData.user;
      tokens = authData.tokens;

      // Create multiple refresh tokens
      await db.createRefreshToken(user.id, { 
        token: 'session1',
        family: 'family1'
      });
      await db.createRefreshToken(user.id, { 
        token: 'session2',
        family: 'family2'
      });
    });

    it('should get active sessions successfully', async () => {
      const response = await request(app)
        .get('/api/auth/sessions')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('sessions');
      expect(Array.isArray(response.body.sessions)).toBe(true);
      expect(response.body.sessions.length).toBeGreaterThanOrEqual(2);
    });

    it('should include session metadata', async () => {
      const response = await request(app)
        .get('/api/auth/sessions')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .expect(200);

      const sessions = response.body.sessions;
      sessions.forEach(session => {
        expect(session).toHaveProperty('sessionId');
        expect(session).toHaveProperty('createdAt');
        expect(session).toHaveProperty('lastUsed');
        expect(session).toHaveProperty('family');
      });
    });
  });

  describe('Token Validation', () => {
    let user;
    let tokens;

    beforeEach(async () => {
      const authData = await helpers.createAuthenticatedUser();
      user = authData.user;
      tokens = authData.tokens;
    });

    it('should accept valid access token', async () => {
      const response = await request(app)
        .get('/api/test/rate-limit')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should reject expired access token', async () => {
      // Create expired token
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '-1s' } // Expired 1 second ago
      );

      const response = await request(app)
        .get('/api/test/rate-limit')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('expired');
    });

    it('should reject malformed token', async () => {
      const response = await request(app)
        .get('/api/test/rate-limit')
        .set('Authorization', 'Bearer malformed.token.here')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject token with invalid signature', async () => {
      const jwt = require('jsonwebtoken');
      const invalidToken = jwt.sign(
        { userId: user.id, email: user.email },
        'invalid-secret',
        { expiresIn: '15m' }
      );

      const response = await request(app)
        .get('/api/test/rate-limit')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});
