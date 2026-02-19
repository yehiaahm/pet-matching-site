const request = require('supertest');
const jwt = require('jsonwebtoken');
const TestDatabase = require('./testDatabase');

class TestHelpers {
  constructor(app) {
    this.app = app;
    this.db = new TestDatabase();
  }

  async setup() {
    await this.db.connect();
    await this.db.cleanup();
  }

  async teardown() {
    await this.db.cleanup();
    await this.db.disconnect();
  }

  // Authentication helpers
  async registerUser(userData = {}) {
    const user = global.testUtils.generateTestUser();
    const response = await request(this.app)
      .post('/api/auth/register')
      .send({ ...user, ...userData })
      .expect(201);

    return {
      user: response.body.user,
      tokens: response.body,
      response
    };
  }

  async loginUser(credentials = {}) {
    const user = global.testUtils.generateTestUser();
    const response = await request(this.app)
      .post('/api/auth/login')
      .send({ ...user, ...credentials })
      .expect(200);

    return {
      user: response.body.user,
      tokens: response.body,
      response
    };
  }

  async createAuthenticatedUser(userData = {}) {
    // Create user in database directly
    const dbUser = await this.db.createTestUser(userData);
    
    // Generate tokens
    const accessToken = jwt.sign(
      { 
        userId: dbUser.id, 
        email: dbUser.email, 
        role: dbUser.role 
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { 
        userId: dbUser.id, 
        family: `test-family-${Date.now()}` 
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Store refresh token in database
    await this.db.createRefreshToken(dbUser.id, {
      token: refreshToken,
      family: `test-family-${Date.now()}`
    });

    return {
      user: dbUser,
      tokens: { accessToken, refreshToken }
    };
  }

  async createAuthenticatedRequest(user = null) {
    if (!user) {
      user = await this.createAuthenticatedUser();
    }

    const agent = request.agent(this.app);
    agent.set('Authorization', `Bearer ${user.tokens.accessToken}`);

    return {
      agent,
      user,
      tokens: user.tokens
    };
  }

  // Pet helpers
  async createPet(userId, petData = {}) {
    const pet = global.testUtils.generateTestPet(userId);
    const response = await request(this.app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${await this.getAccessTokenForUser(userId)}`)
      .send({ ...pet, ...petData })
      .expect(201);

    return {
      pet: response.body.pet || response.body,
      response
    };
  }

  async getAccessTokenForUser(userId) {
    const user = await this.db.getUserById(userId);
    const accessToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );
    return accessToken;
  }

  // Matchmaking helpers
  async createMatch(petId1, petId2, matchData = {}) {
    const response = await request(this.app)
      .post('/api/matches')
      .set('Authorization', `Bearer ${await this.getAccessTokenForUser(petId1)}`)
      .send({
        petId1,
        petId2,
        ...matchData
      })
      .expect(201);

    return {
      match: response.body.match || response.body,
      response
    };
  }

  async getRecommendations(petId, preferences = {}) {
    const response = await request(this.app)
      .get(`/api/matches/recommendations/${petId}`)
      .set('Authorization', `Bearer ${await this.getAccessTokenForUser(petId)}`)
      .query(preferences)
      .expect(200);

    return {
      recommendations: response.body.recommendations || response.body,
      response
    };
  }

  // Generic request helpers
  async get(endpoint, user = null, query = {}) {
    let req = request(this.app).get(endpoint);
    
    if (user) {
      req = req.set('Authorization', `Bearer ${user.tokens.accessToken}`);
    }
    
    if (Object.keys(query).length > 0) {
      req = req.query(query);
    }

    return req;
  }

  async post(endpoint, data = {}, user = null) {
    let req = request(this.app).post(endpoint).send(data);
    
    if (user) {
      req = req.set('Authorization', `Bearer ${user.tokens.accessToken}`);
    }

    return req;
  }

  async put(endpoint, data = {}, user = null) {
    let req = request(this.app).put(endpoint).send(data);
    
    if (user) {
      req = req.set('Authorization', `Bearer ${user.tokens.accessToken}`);
    }

    return req;
  }

  async delete(endpoint, user = null) {
    let req = request(this.app).delete(endpoint);
    
    if (user) {
      req = req.set('Authorization', `Bearer ${user.tokens.accessToken}`);
    }

    return req;
  }

  // Assertion helpers
  expectSuccess(response, expectedStatus = 200) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('success', true);
    return response.body;
  }

  expectError(response, expectedStatus = 400, expectedError = null) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('success', false);
    if (expectedError) {
      expect(response.body.error).toContain(expectedError);
    }
    return response.body;
  }

  expectUser(response) {
    const data = this.expectSuccess(response);
    expect(data).toHaveProperty('user');
    expect(data.user).toHaveProperty('id');
    expect(data.user).toHaveProperty('email');
    expect(data.user).not.toHaveProperty('password'); // Password should not be returned
    return data.user;
  }

  expectPet(response) {
    const data = this.expectSuccess(response);
    expect(data).toHaveProperty('pet');
    expect(data.pet).toHaveProperty('id');
    expect(data.pet).toHaveProperty('name');
    expect(data.pet).toHaveProperty('type');
    return data.pet;
  }

  expectMatch(response) {
    const data = this.expectSuccess(response);
    expect(data).toHaveProperty('match');
    expect(data.match).toHaveProperty('id');
    expect(data.match).toHaveProperty('score');
    expect(data.match).toHaveProperty('petId1');
    expect(data.match).toHaveProperty('petId2');
    return data.match;
  }

  expectTokens(response) {
    const data = this.expectSuccess(response);
    expect(data).toHaveProperty('accessToken');
    expect(data).toHaveProperty('refreshToken');
    expect(data).toHaveProperty('expiresIn');
    return data;
  }

  expectList(response, expectedMinLength = 0) {
    const data = this.expectSuccess(response);
    expect(Array.isArray(data.items || data.pets || data.matches || data)).toBe(true);
    const items = data.items || data.pets || data.matches || data;
    if (expectedMinLength > 0) {
      expect(items.length).toBeGreaterThanOrEqual(expectedMinLength);
    }
    return items;
  }

  // Rate limiting helpers
  async expectRateLimit(endpoint, maxRequests = 5, windowMs = 60000) {
    const responses = [];
    
    // Make requests up to the limit
    for (let i = 0; i < maxRequests; i++) {
      const response = await request(this.app).get(endpoint);
      responses.push(response);
      expect(response.status).not.toBe(429);
    }

    // Next request should be rate limited
    const rateLimitedResponse = await request(this.app).get(endpoint);
    expect(rateLimitedResponse.status).toBe(429);
    expect(rateLimitedResponse.body).toHaveProperty('error');
    expect(rateLimitedResponse.body.error).toContain('Rate limit');

    return responses;
  }

  // File upload helpers
  async uploadFile(endpoint, fieldName, filePath, user = null, additionalData = {}) {
    let req = request(this.app)
      .post(endpoint)
      .attach(fieldName, filePath);
    
    if (user) {
      req = req.set('Authorization', `Bearer ${user.tokens.accessToken}`);
    }

    // Add additional form fields
    Object.entries(additionalData).forEach(([key, value]) => {
      req = req.field(key, value);
    });

    return req;
  }

  // WebSocket helpers (if needed)
  async createWebSocketClient(user = null) {
    const WebSocket = require('ws');
    const wsUrl = `ws://localhost:${process.env.PORT || 5000}`;
    
    const ws = new WebSocket(wsUrl, {
      headers: user ? {
        'Authorization': `Bearer ${user.tokens.accessToken}`
      } : {}
    });

    return new Promise((resolve, reject) => {
      ws.on('open', () => resolve(ws));
      ws.on('error', reject);
      
      setTimeout(() => reject(new Error('WebSocket connection timeout')), 5000);
    });
  }

  // Database helpers for test verification
  async verifyUserExists(userId) {
    const user = await this.db.getUserById(userId);
    expect(user).toBeTruthy();
    expect(user.id).toBe(userId);
    return user;
  }

  async verifyPetExists(petId) {
    const pet = await this.db.getPetById(petId);
    expect(pet).toBeTruthy();
    expect(pet.id).toBe(petId);
    return pet;
  }

  async verifyMatchExists(matchId) {
    const match = await this.db.getMatchById(matchId);
    expect(match).toBeTruthy();
    expect(match.id).toBe(matchId);
    return match;
  }

  async verifyUserCount(expectedCount) {
    const users = await this.db.prisma.user.findMany();
    expect(users.length).toBe(expectedCount);
  }

  async verifyPetCount(expectedCount) {
    const pets = await this.db.prisma.pet.findMany();
    expect(pets.length).toBe(expectedCount);
  }

  async verifyMatchCount(expectedCount) {
    const matches = await this.db.prisma.petMatch.findMany();
    expect(matches.length).toBe(expectedCount);
  }

  // Time helpers
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getCurrentTimestamp() {
    return new Date().toISOString();
  }

  getFutureTimestamp(seconds) {
    return new Date(Date.now() + seconds * 1000).toISOString();
  }

  getPastTimestamp(seconds) {
    return new Date(Date.now() - seconds * 1000).toISOString();
  }
}

module.exports = TestHelpers;
