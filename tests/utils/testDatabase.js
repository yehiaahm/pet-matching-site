let PrismaClient;
try {
  ({ PrismaClient } = require('@prisma/client'));
} catch (error) {
  ({ PrismaClient } = require('../../server/node_modules/@prisma/client'));
}
const bcrypt = require('bcryptjs');
const Redis = require('ioredis-mock');

class TestDatabase {
  constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
    
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      db: process.env.REDIS_DB || 1
    });
  }

  async connect() {
    await this.prisma.$connect();
    await this.redis.ping();
  }

  async disconnect() {
    await this.prisma.$disconnect();
    await this.redis.disconnect();
  }

  async cleanup() {
    // Clean up Redis
    await this.redis.flushdb();

    // Clean up database in correct order
    const tableNames = [
      'RefreshToken',
      'SupportTicket',
      'PetMatch',
      'Pet',
      'User'
    ];

    for (const tableName of tableNames) {
      try {
        await this.prisma.$executeRawUnsafe(`DELETE FROM "${tableName}";`);
      } catch (error) {
        console.warn(`Could not clean table ${tableName}:`, error.message);
      }
    }

    // Reset sequences
    try {
      const sequenceResets = [
        `SELECT setval(pg_get_serial_sequence('"User"', 'id'), 1, false);`,
        `SELECT setval(pg_get_serial_sequence('"Pet"', 'id'), 1, false);`,
        `SELECT setval(pg_get_serial_sequence('"PetMatch"', 'id'), 1, false);`,
        `SELECT setval(pg_get_serial_sequence('"RefreshToken"', 'id'), 1, false);`,
        `SELECT setval(pg_get_serial_sequence('"SupportTicket"', 'id'), 1, false);`,
      ];

      for (const query of sequenceResets) {
        try {
          await this.prisma.$executeRawUnsafe(query);
        } catch (sequenceError) {
          console.warn('Could not reset a sequence:', sequenceError.message);
        }
      }
    } catch (error) {
      console.warn('Could not reset sequences:', error.message);
    }
  }

  async createTestUser(userData = {}) {
    const defaultUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
      phone: '+1234567890',
      role: 'user',
      isActive: true,
      emailVerified: true,
      ...userData
    };

    const hashedPassword = await bcrypt.hash(defaultUser.password, 12);

    const user = await this.prisma.user.create({
      data: {
        ...defaultUser,
        password: hashedPassword
      }
    });

    return {
      ...user,
      plainPassword: defaultUser.password
    };
  }

  async createTestPet(userId, petData = {}) {
    const defaultPet = {
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
      },
      ...petData
    };

    return await this.prisma.pet.create({
      data: defaultPet
    });
  }

  async createTestMatch(petId1, petId2, matchData = {}) {
    const defaultMatch = {
      petId1,
      petId2,
      score: 0.85,
      factors: {
        breed: 0.9,
        age: 0.8,
        location: 0.7,
        temperament: 0.9
      },
      status: 'pending',
      ...matchData
    };

    return await this.prisma.petMatch.create({
      data: defaultMatch
    });
  }

  async createRefreshToken(userId, tokenData = {}) {
    const defaultToken = {
      userId,
      token: `refresh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      family: `family-${Date.now()}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      ...tokenData
    };

    return await this.prisma.refreshToken.create({
      data: defaultToken
    });
  }

  async getUserByEmail(email) {
    return await this.prisma.user.findUnique({
      where: { email }
    });
  }

  async getUserById(id) {
    return await this.prisma.user.findUnique({
      where: { id }
    });
  }

  async getPetById(id) {
    return await this.prisma.pet.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  }

  async getPetsByUserId(userId) {
    return await this.prisma.pet.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  }

  async getMatchById(id) {
    return await this.prisma.petMatch.findUnique({
      where: { id },
      include: {
        pet1: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        pet2: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });
  }

  async getMatchesByPetId(petId) {
    return await this.prisma.petMatch.findMany({
      where: {
        OR: [
          { petId1: petId },
          { petId2: petId }
        ]
      },
      include: {
        pet1: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        pet2: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });
  }

  async createMultipleTestUsers(count = 3) {
    const users = [];
    for (let i = 0; i < count; i++) {
      const user = await this.createTestUser({
        email: `test-user-${i}-${Date.now()}@example.com`,
        firstName: `Test${i}`,
        lastName: `User${i}`
      });
      users.push(user);
    }
    return users;
  }

  async createMultipleTestPets(userId, count = 3) {
    const pets = [];
    for (let i = 0; i < count; i++) {
      const pet = await this.createTestPet(userId, {
        name: `TestPet${i}-${Date.now()}`,
        type: i % 2 === 0 ? 'dog' : 'cat',
        breed: `TestBreed${i}`,
        age: 1 + i
      });
      pets.push(pet);
    }
    return pets;
  }

  async seedTestData() {
    // Create test users
    const users = await this.createMultipleTestUsers(3);
    
    // Create test pets for each user
    const allPets = [];
    for (const user of users) {
      const pets = await this.createMultipleTestPets(user.id, 2);
      allPets.push(...pets);
    }

    // Create some test matches
    const matches = [];
    if (allPets.length >= 2) {
      for (let i = 0; i < Math.min(3, Math.floor(allPets.length / 2)); i++) {
        const match = await this.createTestMatch(
          allPets[i * 2].id,
          allPets[i * 2 + 1].id,
          {
            score: 0.7 + (i * 0.1),
            status: i === 0 ? 'accepted' : 'pending'
          }
        );
        matches.push(match);
      }
    }

    return {
      users,
      pets: allPets,
      matches
    };
  }

  async getRedisData(key) {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async setRedisData(key, data, ttl = 3600) {
    await this.redis.setex(key, ttl, JSON.stringify(data));
  }

  async deleteRedisData(key) {
    await this.redis.del(key);
  }

  async getRedisKeys(pattern) {
    return await this.redis.keys(pattern);
  }
}

module.exports = TestDatabase;
