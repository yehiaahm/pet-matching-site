const request = require('supertest');
const app = require('../../server/examples/rateLimitingExample');
const TestHelpers = require('../utils/testHelpers');
const TestDatabase = require('../utils/testDatabase');

describe('Matchmaking Integration Tests', () => {
  let helpers;
  let db;
  let users = [];
  let pets = [];

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
    
    // Create test data
    const testData = await db.seedTestData();
    users = testData.users;
    pets = testData.pets;
  });

  describe('POST /api/matches', () => {
    let authenticatedUser;

    beforeEach(async () => {
      authenticatedUser = await helpers.createAuthenticatedUser(users[0]);
    });

    it('should create a match between two pets successfully', async () => {
      const pet1 = pets[0];
      const pet2 = pets[1];

      const response = await request(app)
        .post('/api/matches')
        .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
        .send({
          petId1: pet1.id,
          petId2: pet2.id,
          score: 0.85,
          factors: {
            breed: 0.9,
            age: 0.8,
            location: 0.7,
            temperament: 0.9
          }
        })
        .expect(201);

      // Verify response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('match');

      const match = response.body.match;
      expect(match).toHaveProperty('id');
      expect(match).toHaveProperty('petId1', pet1.id);
      expect(match).toHaveProperty('petId2', pet2.id);
      expect(match).toHaveProperty('score', 0.85);
      expect(match).toHaveProperty('status', 'pending');
      expect(match).toHaveProperty('factors');

      // Verify match was created in database
      const dbMatch = await db.getMatchById(match.id);
      expect(dbMatch).toBeTruthy();
      expect(dbMatch.petId1).toBe(pet1.id);
      expect(dbMatch.petId2).toBe(pet2.id);
    });

    it('should reject match creation with invalid pet IDs', async () => {
      const response = await request(app)
        .post('/api/matches')
        .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
        .send({
          petId1: 'invalid-id',
          petId2: 'invalid-id'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Invalid');
    });

    it('should reject match creation without authentication', async () => {
      const pet1 = pets[0];
      const pet2 = pets[1];

      const response = await request(app)
        .post('/api/matches')
        .send({
          petId1: pet1.id,
          petId2: pet2.id
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Authentication');
    });

    it('should reject duplicate match creation', async () => {
      const pet1 = pets[0];
      const pet2 = pets[1];

      // Create first match
      await request(app)
        .post('/api/matches')
        .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
        .send({
          petId1: pet1.id,
          petId2: pet2.id
        })
        .expect(201);

      // Try to create duplicate match
      const response = await request(app)
        .post('/api/matches')
        .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
        .send({
          petId1: pet1.id,
          petId2: pet2.id
        })
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('already exists');
    });

    it('should validate match score range', async () => {
      const pet1 = pets[0];
      const pet2 = pets[1];

      // Test invalid score (too high)
      const response1 = await request(app)
        .post('/api/matches')
        .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
        .send({
          petId1: pet1.id,
          petId2: pet2.id,
          score: 1.5
        })
        .expect(400);

      expect(response1.body.error).toContain('score');

      // Test invalid score (too low)
      const response2 = await request(app)
        .post('/api/matches')
        .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
        .send({
          petId1: pet1.id,
          petId2: pet2.id,
          score: -0.5
        })
        .expect(400);

      expect(response2.body.error).toContain('score');
    });
  });

  describe('GET /api/matches/:id', () => {
    let authenticatedUser;
    let testMatch;

    beforeEach(async () => {
      authenticatedUser = await helpers.createAuthenticatedUser(users[0]);
      testMatch = await db.createTestMatch(pets[0].id, pets[1].id);
    });

    it('should get match by ID successfully', async () => {
      const response = await request(app)
        .get(`/api/matches/${testMatch.id}`)
        .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('match');

      const match = response.body.match;
      expect(match.id).toBe(testMatch.id);
      expect(match.petId1).toBe(pets[0].id);
      expect(match.petId2).toBe(pets[1].id);
    });

    it('should include pet details in match response', async () => {
      const response = await request(app)
        .get(`/api/matches/${testMatch.id}`)
        .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
        .expect(200);

      const match = response.body.match;
      expect(match).toHaveProperty('pet1');
      expect(match).toHaveProperty('pet2');
      expect(match.pet1).toHaveProperty('name');
      expect(match.pet2).toHaveProperty('name');
    });

    it('should reject request for non-existent match', async () => {
      const response = await request(app)
        .get('/api/matches/non-existent-id')
        .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('not found');
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get(`/api/matches/${testMatch.id}`)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/matches/:id/status', () => {
    let authenticatedUser;
    let testMatch;

    beforeEach(async () => {
      authenticatedUser = await helpers.createAuthenticatedUser(users[0]);
      testMatch = await db.createTestMatch(pets[0].id, pets[1].id, {
        status: 'pending'
      });
    });

    it('should update match status successfully', async () => {
      const response = await request(app)
        .put(`/api/matches/${testMatch.id}/status`)
        .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
        .send({ status: 'accepted' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('match');

      const match = response.body.match;
      expect(match.status).toBe('accepted');

      // Verify in database
      const dbMatch = await db.getMatchById(testMatch.id);
      expect(dbMatch.status).toBe('accepted');
    });

    it('should reject invalid status values', async () => {
      const response = await request(app)
        .put(`/api/matches/${testMatch.id}/status`)
        .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
        .send({ status: 'invalid-status' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('status');
    });

    it('should reject status update for non-existent match', async () => {
      const response = await request(app)
        .put('/api/matches/non-existent-id/status')
        .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
        .send({ status: 'accepted' })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/matches/recommendations/:petId', () => {
    let authenticatedUser;
    let testPet;

    beforeEach(async () => {
      authenticatedUser = await helpers.createAuthenticatedUser(users[0]);
      testPet = pets[0];
    });

    it('should get match recommendations for a pet', async () => {
      const response = await request(app)
        .get(`/api/matches/recommendations/${testPet.id}`)
        .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('recommendations');
      expect(Array.isArray(response.body.recommendations)).toBe(true);

      // Each recommendation should have required fields
      response.body.recommendations.forEach(rec => {
        expect(rec).toHaveProperty('pet');
        expect(rec).toHaveProperty('score');
        expect(rec).toHaveProperty('factors');
        expect(rec.pet).toHaveProperty('id');
        expect(rec.pet).toHaveProperty('name');
      });
    });

    it('should filter recommendations by preferences', async () => {
      const preferences = {
        maxDistance: 50,
        minAge: 1,
        maxAge: 5,
        preferredTypes: ['dog']
      };

      const response = await request(app)
        .get(`/api/matches/recommendations/${testPet.id}`)
        .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
        .query(preferences)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('recommendations');

      // Verify recommendations match preferences
      response.body.recommendations.forEach(rec => {
        expect(rec.pet.age).toBeGreaterThanOrEqual(preferences.minAge);
        expect(rec.pet.age).toBeLessThanOrEqual(preferences.maxAge);
        if (preferences.preferredTypes.length > 0) {
          expect(preferences.preferredTypes).toContain(rec.pet.type);
        }
      });
    });

    it('should limit number of recommendations', async () => {
      const response = await request(app)
        .get(`/api/matches/recommendations/${testPet.id}`)
        .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
        .query({ limit: 5 })
        .expect(200);

      expect(response.body.recommendations.length).toBeLessThanOrEqual(5);
    });

    it('should sort recommendations by score descending', async () => {
      const response = await request(app)
        .get(`/api/matches/recommendations/${testPet.id}`)
        .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
        .expect(200);

      const recommendations = response.body.recommendations;
      for (let i = 1; i < recommendations.length; i++) {
        expect(recommendations[i-1].score).toBeGreaterThanOrEqual(recommendations[i].score);
      }
    });

    it('should reject recommendations for non-existent pet', async () => {
      const response = await request(app)
        .get('/api/matches/recommendations/non-existent-id')
        .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject recommendations without authentication', async () => {
      const response = await request(app)
        .get(`/api/matches/recommendations/${testPet.id}`)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/matches/calculate', () => {
    let authenticatedUser;

    beforeEach(async () => {
      authenticatedUser = await helpers.createAuthenticatedUser(users[0]);
    });

    it('should calculate match score between two pets', async () => {
      const pet1 = pets[0];
      const pet2 = pets[1];

      const response = await request(app)
        .post('/api/matches/calculate')
        .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
        .send({
          petId1: pet1.id,
          petId2: pet2.id
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('score');
      expect(response.body).toHaveProperty('factors');

      expect(typeof response.body.score).toBe('number');
      expect(response.body.score).toBeGreaterThanOrEqual(0);
      expect(response.body.score).toBeLessThanOrEqual(1);

      expect(response.body.factors).toHaveProperty('breed');
      expect(response.body.factors).toHaveProperty('age');
      expect(response.body.factors).toHaveProperty('location');
      expect(response.body.factors).toHaveProperty('temperament');
    });

    it('should include detailed factor breakdown', async () => {
      const pet1 = pets[0];
      const pet2 = pets[1];

      const response = await request(app)
        .post('/api/matches/calculate')
        .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
        .send({
          petId1: pet1.id,
          petId2: pet2.id
        })
        .expect(200);

      const factors = response.body.factors;
      Object.values(factors).forEach(factor => {
        expect(typeof factor).toBe('number');
        expect(factor).toBeGreaterThanOrEqual(0);
        expect(factor).toBeLessThanOrEqual(1);
      });
    });

    it('should reject calculation with invalid pet IDs', async () => {
      const response = await request(app)
        .post('/api/matches/calculate')
        .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
        .send({
          petId1: 'invalid-id',
          petId2: 'invalid-id'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/matches', () => {
    let authenticatedUser;
    let userMatches = [];

    beforeEach(async () => {
      authenticatedUser = await helpers.createAuthenticatedUser(users[0]);
      
      // Create matches for the user's pets
      for (let i = 0; i < 3; i++) {
        const match = await db.createTestMatch(
          pets[i].id,
          pets[i + 1].id,
          { status: i === 0 ? 'accepted' : 'pending' }
        );
        userMatches.push(match);
      }
    });

    it('should get all matches for authenticated user', async () => {
      const response = await request(app)
        .get('/api/matches')
        .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('matches');
      expect(Array.isArray(response.body.matches)).toBe(true);
      expect(response.body.matches.length).toBeGreaterThanOrEqual(3);

      // Verify match structure
      response.body.matches.forEach(match => {
        expect(match).toHaveProperty('id');
        expect(match).toHaveProperty('score');
        expect(match).toHaveProperty('status');
        expect(match).toHaveProperty('pet1');
        expect(match).toHaveProperty('pet2');
      });
    });

    it('should filter matches by status', async () => {
      const response = await request(app)
        .get('/api/matches')
        .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
        .query({ status: 'accepted' })
        .expect(200);

      expect(response.body.matches.length).toBeGreaterThanOrEqual(1);
      response.body.matches.forEach(match => {
        expect(match.status).toBe('accepted');
      });
    });

    it('should paginate matches', async () => {
      const response = await request(app)
        .get('/api/matches')
        .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
        .query({ page: 1, limit: 2 })
        .expect(200);

      expect(response.body.matches.length).toBeLessThanOrEqual(2);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 2);
    });

    it('should sort matches by creation date', async () => {
      const response = await request(app)
        .get('/api/matches')
        .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
        .query({ sortBy: 'createdAt', sortOrder: 'desc' })
        .expect(200);

      const matches = response.body.matches;
      for (let i = 1; i < matches.length; i++) {
        const date1 = new Date(matches[i-1].createdAt);
        const date2 = new Date(matches[i].createdAt);
        expect(date1.getTime()).toBeGreaterThanOrEqual(date2.getTime());
      }
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/matches')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /api/matches/:id', () => {
    let authenticatedUser;
    let testMatch;

    beforeEach(async () => {
      authenticatedUser = await helpers.createAuthenticatedUser(users[0]);
      testMatch = await db.createTestMatch(pets[0].id, pets[1].id);
    });

    it('should delete match successfully', async () => {
      const response = await request(app)
        .delete(`/api/matches/${testMatch.id}`)
        .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');

      // Verify match is deleted from database
      const dbMatch = await db.getMatchById(testMatch.id);
      expect(dbMatch).toBeNull();
    });

    it('should reject deletion of non-existent match', async () => {
      const response = await request(app)
        .delete('/api/matches/non-existent-id')
        .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject deletion without authentication', async () => {
      const response = await request(app)
        .delete(`/api/matches/${testMatch.id}`)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Match Quality and Performance', () => {
    let authenticatedUser;

    beforeEach(async () => {
      authenticatedUser = await helpers.createAuthenticatedUser(users[0]);
    });

    it('should handle large number of matches efficiently', async () => {
      // Create many matches
      const matchPromises = [];
      for (let i = 0; i < 50; i++) {
        matchPromises.push(
          db.createTestMatch(pets[0].id, pets[1].id, {
            score: Math.random(),
            status: 'pending'
          })
        );
      }
      await Promise.all(matchPromises);

      const startTime = Date.now();
      const response = await request(app)
        .get('/api/matches')
        .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
        .expect(200);
      const endTime = Date.now();

      expect(response.body.matches.length).toBeGreaterThanOrEqual(50);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle concurrent match calculations', async () => {
      const pet1 = pets[0];
      const pet2 = pets[1];

      // Make concurrent requests
      const promises = Array(10).fill().map(() =>
        request(app)
          .post('/api/matches/calculate')
          .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
          .send({ petId1: pet1.id, petId2: pet2.id })
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('score');
        expect(response.body).toHaveProperty('factors');
      });
    });

    it('should validate match score consistency', async () => {
      const pet1 = pets[0];
      const pet2 = pets[1];

      // Calculate match score multiple times
      const responses = await Promise.all([
        request(app)
          .post('/api/matches/calculate')
          .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
          .send({ petId1: pet1.id, petId2: pet2.id }),
        request(app)
          .post('/api/matches/calculate')
          .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
          .send({ petId1: pet1.id, petId2: pet2.id })
      ]);

      const score1 = responses[0].body.score;
      const score2 = responses[1].body.score;

      // Scores should be consistent (allowing for minor floating point differences)
      expect(Math.abs(score1 - score2)).toBeLessThan(0.001);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    let authenticatedUser;

    beforeEach(async () => {
      authenticatedUser = await helpers.createAuthenticatedUser(users[0]);
    });

    it('should handle malformed request bodies gracefully', async () => {
      const response = await request(app)
        .post('/api/matches')
        .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
        .send('invalid-json')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should validate required fields in match creation', async () => {
      const response = await request(app)
        .post('/api/matches')
        .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
        .send({ petId1: pets[0].id }) // Missing petId2
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('required');
    });

    it('should handle database connection errors gracefully', async () => {
      // This would require mocking database errors
      // For now, just ensure the endpoint handles unexpected errors
      const response = await request(app)
        .get('/api/matches/non-existent-id')
        .set('Authorization', `Bearer ${authenticatedUser.tokens.accessToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});
