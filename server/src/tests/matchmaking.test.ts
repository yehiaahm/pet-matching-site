/**
 * Matchmaking Algorithm Tests
 * Comprehensive Jest test suite for pet matchmaking
 */

import { 
  calculateMatchScore, 
  findMatches, 
  filterByPreferences,
  MatchmakingService,
  MatchPreferences,
  Pet,
  MatchResult,
  ScoringWeights
} from '../src/services/matchmaking.service';

describe('Matchmaking Algorithm', () => {
  // Test data fixtures
  const mockPet: Pet = {
    id: 'pet-1',
    name: 'Buddy',
    species: 'dog',
    breed: 'Golden Retriever',
    gender: 'male',
    dateOfBirth: new Date('2020-01-15'),
    weight: 30,
    height: 55,
    color: 'golden',
    isVaccinated: true,
    isNeutered: true,
    lastHealthCheckDate: new Date('2024-01-01'),
    nextVaccinationDate: new Date('2024-06-01'),
    breedingStatus: 'AVAILABLE',
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
    distinctiveFeatures: 'White patch on chest'
  };

  const mockCandidatePet: Pet = {
    ...mockPet,
    id: 'pet-2',
    name: 'Luna',
    gender: 'female',
    breed: 'Golden Retriever',
    ownerId: 'user-2'
  };

  const mockPreferences: MatchPreferences = {
    species: ['dog'],
    breeds: ['Golden Retriever', 'Labrador'],
    gender: 'female',
    ageRange: { min: 2, max: 5 },
    weightRange: { min: 20, max: 40 },
    maxDistance: 50,
    breedingStatus: ['AVAILABLE'],
    hasPedigree: true,
    isVaccinated: true,
    isNeutered: true,
    maxBreedingPrice: 1000,
    healthConditions: 'None',
    minCompatibilityScore: 70
  };

  const defaultWeights: ScoringWeights = {
    breed: 25,
    age: 20,
    location: 20,
    health: 15,
    pedigree: 10,
    price: 10
  };

  describe('calculateMatchScore', () => {
    it('should calculate perfect match score for identical pets', () => {
      const score = calculateMatchScore(mockPet, mockCandidatePet, defaultWeights);
      expect(score).toBeGreaterThan(90);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should calculate lower score for different breeds', () => {
      const differentBreedPet = { ...mockCandidatePet, breed: 'Poodle' };
      const score = calculateMatchScore(mockPet, differentBreedPet, defaultWeights);
      expect(score).toBeLessThan(80);
    });

    it('should handle age compatibility correctly', () => {
      const youngPet = { ...mockCandidatePet, dateOfBirth: new Date('2023-01-01') };
      const oldPet = { ...mockCandidatePet, dateOfBirth: new Date('2015-01-01') };
      
      const youngScore = calculateMatchScore(mockPet, youngPet, defaultWeights);
      const oldScore = calculateMatchScore(mockPet, oldPet, defaultWeights);
      
      expect(youngScore).toBeGreaterThan(oldScore);
    });

    it('should calculate distance-based scoring', () => {
      const nearbyPet = { ...mockCandidatePet, location: { latitude: 40.7128, longitude: -74.0060 } };
      const farPet = { ...mockCandidatePet, location: { latitude: 41.8781, longitude: -87.6298 } }; // Chicago
      
      const nearbyScore = calculateMatchScore(mockPet, nearbyPet, defaultWeights);
      const farScore = calculateMatchScore(mockPet, farPet, defaultWeights);
      
      expect(nearbyScore).toBeGreaterThan(farScore);
    });

    it('should handle missing location data gracefully', () => {
      const petWithoutLocation = { ...mockCandidatePet, location: null };
      const score = calculateMatchScore(mockPet, petWithoutLocation, defaultWeights);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should penalize pets with health conditions', () => {
      const healthyPet = { ...mockCandidatePet, healthConditions: 'None' };
      const sickPet = { ...mockCandidatePet, healthConditions: 'Hip dysplasia' };
      
      const healthyScore = calculateMatchScore(mockPet, healthyPet, defaultWeights);
      const sickScore = calculateMatchScore(mockPet, sickPet, defaultWeights);
      
      expect(healthyScore).toBeGreaterThan(sickScore);
    });

    it('should reward pedigree status', () => {
      const pedigreePet = { ...mockCandidatePet, hasPedigree: true };
      const nonPedigreePet = { ...mockCandidatePet, hasPedigree: false };
      
      const pedigreeScore = calculateMatchScore(mockPet, pedigreePet, defaultWeights);
      const nonPedigreeScore = calculateMatchScore(mockPet, nonPedigreePet, defaultWeights);
      
      expect(pedigreeScore).toBeGreaterThan(nonPedigreeScore);
    });

    it('should consider breeding price compatibility', () => {
      const affordablePet = { ...mockCandidatePet, breedingPrice: 300 };
      const expensivePet = { ...mockCandidatePet, breedingPrice: 2000 };
      
      const affordableScore = calculateMatchScore(mockPet, affordablePet, defaultWeights);
      const expensiveScore = calculateMatchScore(mockPet, expensivePet, defaultWeights);
      
      expect(affordableScore).toBeGreaterThan(expensiveScore);
    });

    it('should handle invalid weights gracefully', () => {
      const invalidWeights = { breed: -10, age: 150, location: 0, health: 0, pedigree: 0, price: 0 };
      const score = calculateMatchScore(mockPet, mockCandidatePet, invalidWeights);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should normalize weights that don\'t sum to 100', () => {
      const unnormalizedWeights = { breed: 50, age: 30, location: 20, health: 10, pedigree: 5, price: 5 };
      const score = calculateMatchScore(mockPet, mockCandidatePet, unnormalizedWeights);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('filterByPreferences', () => {
    it('should filter pets by species preference', () => {
      const dogPet = { ...mockCandidatePet, species: 'dog' };
      const catPet = { ...mockCandidatePet, species: 'cat' };
      const pets = [dogPet, catPet];
      
      const filtered = filterByPreferences(pets, mockPreferences);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].species).toBe('dog');
    });

    it('should filter pets by breed preference', () => {
      const goldenRetriever = { ...mockCandidatePet, breed: 'Golden Retriever' };
      const labrador = { ...mockCandidatePet, breed: 'Labrador' };
      const poodle = { ...mockCandidatePet, breed: 'Poodle' };
      const pets = [goldenRetriever, labrador, poodle];
      
      const filtered = filterByPreferences(pets, mockPreferences);
      expect(filtered).toHaveLength(2);
      expect(filtered.map(p => p.breed)).toEqual(['Golden Retriever', 'Labrador']);
    });

    it('should filter pets by gender preference', () => {
      const malePet = { ...mockCandidatePet, gender: 'male' };
      const femalePet = { ...mockCandidatePet, gender: 'female' };
      const pets = [malePet, femalePet];
      
      const filtered = filterByPreferences(pets, mockPreferences);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].gender).toBe('female');
    });

    it('should filter pets by age range', () => {
      const youngPet = { ...mockCandidatePet, dateOfBirth: new Date('2023-01-01') }; // 1 year
      const adultPet = { ...mockCandidatePet, dateOfBirth: new Date('2020-01-01') }; // 4 years
      const oldPet = { ...mockCandidatePet, dateOfBirth: new Date('2015-01-01') }; // 9 years
      const pets = [youngPet, adultPet, oldPet];
      
      const filtered = filterByPreferences(pets, mockPreferences);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].dateOfBirth.getFullYear()).toBe(2020);
    });

    it('should filter pets by weight range', () => {
      const lightPet = { ...mockCandidatePet, weight: 15 };
      const mediumPet = { ...mockCandidatePet, weight: 30 };
      const heavyPet = { ...mockCandidatePet, weight: 50 };
      const pets = [lightPet, mediumPet, heavyPet];
      
      const filtered = filterByPreferences(pets, mockPreferences);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].weight).toBe(30);
    });

    it('should filter pets by maximum distance', () => {
      const nearbyPet = { ...mockCandidatePet, location: { latitude: 40.7128, longitude: -74.0060 } };
      const farPet = { ...mockCandidatePet, location: { latitude: 41.8781, longitude: -87.6298 } };
      const pets = [nearbyPet, farPet];
      
      const filtered = filterByPreferences(pets, mockPreferences);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].location).toEqual(nearbyPet.location);
    });

    it('should filter pets by breeding status', () => {
      const availablePet = { ...mockCandidatePet, breedingStatus: 'AVAILABLE' };
      const pendingPet = { ...mockCandidatePet, breedingStatus: 'PENDING' };
      const retiredPet = { ...mockCandidatePet, breedingStatus: 'RETIRED' };
      const pets = [availablePet, pendingPet, retiredPet];
      
      const filtered = filterByPreferences(pets, mockPreferences);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].breedingStatus).toBe('AVAILABLE');
    });

    it('should filter pets by pedigree requirement', () => {
      const pedigreePet = { ...mockCandidatePet, hasPedigree: true };
      const nonPedigreePet = { ...mockCandidatePet, hasPedigree: false };
      const pets = [pedigreePet, nonPedigreePet];
      
      const filtered = filterByPreferences(pets, mockPreferences);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].hasPedigree).toBe(true);
    });

    it('should filter pets by vaccination status', () => {
      const vaccinatedPet = { ...mockCandidatePet, isVaccinated: true };
      const unvaccinatedPet = { ...mockCandidatePet, isVaccinated: false };
      const pets = [vaccinatedPet, unvaccinatedPet];
      
      const filtered = filterByPreferences(pets, mockPreferences);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].isVaccinated).toBe(true);
    });

    it('should filter pets by neutering status', () => {
      const neuteredPet = { ...mockCandidatePet, isNeutered: true };
      const unneuteredPet = { ...mockCandidatePet, isNeutered: false };
      const pets = [neuteredPet, unneuteredPet];
      
      const filtered = filterByPreferences(pets, mockPreferences);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].isNeutered).toBe(true);
    });

    it('should filter pets by maximum breeding price', () => {
      const affordablePet = { ...mockCandidatePet, breedingPrice: 500 };
      const expensivePet = { ...mockCandidatePet, breedingPrice: 1500 };
      const pets = [affordablePet, expensivePet];
      
      const filtered = filterByPreferences(pets, mockPreferences);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].breedingPrice).toBe(500);
    });

    it('should filter pets by health conditions', () => {
      const healthyPet = { ...mockCandidatePet, healthConditions: 'None' };
      const sickPet = { ...mockCandidatePet, healthConditions: 'Allergies' };
      const pets = [healthyPet, sickPet];
      
      const filtered = filterByPreferences(pets, mockPreferences);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].healthConditions).toBe('None');
    });

    it('should handle empty preferences array', () => {
      const pets = [mockCandidatePet];
      const emptyPreferences = { ...mockPreferences, species: [] };
      
      const filtered = filterByPreferences(pets, emptyPreferences);
      expect(filtered).toHaveLength(1);
    });

    it('should handle null/undefined preferences', () => {
      const pets = [mockCandidatePet];
      const nullPreferences = null as any;
      
      const filtered = filterByPreferences(pets, nullPreferences);
      expect(filtered).toHaveLength(1);
    });

    it('should handle pets with missing data', () => {
      const incompletePet = { ...mockCandidatePet, weight: null, dateOfBirth: null };
      const pets = [incompletePet];
      
      const filtered = filterByPreferences(pets, mockPreferences);
      expect(filtered).toHaveLength(0);
    });
  });

  describe('findMatches', () => {
    const matchmakingService = new MatchmakingService();

    it('should return sorted matches by compatibility score', () => {
      const candidates = [
        { ...mockCandidatePet, breed: 'Poodle' },
        { ...mockCandidatePet, breed: 'Golden Retriever' },
        { ...mockCandidatePet, breed: 'Labrador' }
      ];
      
      const matches = findMatches(mockPet, candidates, mockPreferences, defaultWeights);
      
      expect(matches).toHaveLength(3);
      expect(matches[0].score).toBeGreaterThanOrEqual(matches[1].score);
      expect(matches[1].score).toBeGreaterThanOrEqual(matches[2].score);
    });

    it('should filter out matches below minimum score', () => {
      const candidates = [
        { ...mockCandidatePet, breed: 'Poodle' }, // Low score
        { ...mockCandidatePet, breed: 'Golden Retriever' } // High score
      ];
      
      const matches = findMatches(mockPet, candidates, mockPreferences, defaultWeights);
      
      expect(matches.length).toBeLessThanOrEqual(2);
      if (matches.length > 0) {
        expect(matches[0].score).toBeGreaterThanOrEqual(mockPreferences.minCompatibilityScore);
      }
    });

    it('should limit results to specified maximum', () => {
      const candidates = Array.from({ length: 10 }, (_, i) => ({
        ...mockCandidatePet,
        id: `pet-${i}`,
        breed: 'Golden Retriever'
      }));
      
      const matches = findMatches(mockPet, candidates, mockPreferences, defaultWeights, 5);
      
      expect(matches).toHaveLength(5);
    });

    it('should handle empty candidate list', () => {
      const matches = findMatches(mockPet, [], mockPreferences, defaultWeights);
      expect(matches).toHaveLength(0);
    });

    it('should exclude self from matches', () => {
      const candidates = [mockPet, mockCandidatePet];
      
      const matches = findMatches(mockPet, candidates, mockPreferences, defaultWeights);
      
      expect(matches).toHaveLength(1);
      expect(matches[0].pet.id).toBe(mockCandidatePet.id);
    });

    it('should exclude inactive pets', () => {
      const activePet = { ...mockCandidatePet, isActive: true };
      const inactivePet = { ...mockCandidatePet, isActive: false };
      const candidates = [activePet, inactivePet];
      
      const matches = findMatches(mockPet, candidates, mockPreferences, defaultWeights);
      
      expect(matches).toHaveLength(1);
      expect(matches[0].pet.isActive).toBe(true);
    });

    it('should exclude unpublished pets', () => {
      const publishedPet = { ...mockCandidatePet, isPublished: true };
      const unpublishedPet = { ...mockCandidatePet, isPublished: false };
      const candidates = [publishedPet, unpublishedPet];
      
      const matches = findMatches(mockPet, candidates, mockPreferences, defaultWeights);
      
      expect(matches).toHaveLength(1);
      expect(matches[0].pet.isPublished).toBe(true);
    });

    it('should exclude deleted pets', () => {
      const activePet = { ...mockCandidatePet, deletedAt: null };
      const deletedPet = { ...mockCandidatePet, deletedAt: new Date() };
      const candidates = [activePet, deletedPet];
      
      const matches = findMatches(mockPet, candidates, mockPreferences, defaultWeights);
      
      expect(matches).toHaveLength(1);
      expect(matches[0].pet.deletedAt).toBeNull();
    });

    it('should handle pets with missing location', () => {
      const petWithLocation = { ...mockCandidatePet, location: { latitude: 40.7128, longitude: -74.0060 } };
      const petWithoutLocation = { ...mockCandidatePet, location: null };
      const candidates = [petWithLocation, petWithoutLocation];
      
      const matches = findMatches(mockPet, candidates, mockPreferences, defaultWeights);
      
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });

    it('should include match details in result', () => {
      const candidates = [mockCandidatePet];
      
      const matches = findMatches(mockPet, candidates, mockPreferences, defaultWeights);
      
      if (matches.length > 0) {
        expect(matches[0]).toHaveProperty('pet');
        expect(matches[0]).toHaveProperty('score');
        expect(matches[0]).toHaveProperty('compatibilityFactors');
        expect(matches[0]).toHaveProperty('matchedAt');
        expect(matches[0].compatibilityFactors).toHaveProperty('breed');
        expect(matches[0].compatibilityFactors).toHaveProperty('age');
        expect(matches[0].compatibilityFactors).toHaveProperty('location');
      }
    });
  });

  describe('MatchmakingService', () => {
    let service: MatchmakingService;

    beforeEach(() => {
      service = new MatchmakingService();
    });

    describe('getMatchesForPet', () => {
      it('should return paginated matches', async () => {
        const mockPrisma = {
          pet: {
            findUnique: jest.fn().mockResolvedValue(mockPet),
            findMany: jest.fn().mockResolvedValue([
              mockCandidatePet,
              { ...mockCandidatePet, id: 'pet-3' }
            ])
          }
        } as any;

        service.setPrismaClient(mockPrisma);

        const result = await service.getMatchesForPet('pet-1', mockPreferences, {
          page: 1,
          limit: 10
        });

        expect(result).toHaveProperty('matches');
        expect(result).toHaveProperty('pagination');
        expect(result.pagination).toHaveProperty('page', 1);
        expect(result.pagination).toHaveProperty('limit', 10);
        expect(result.pagination).toHaveProperty('total');
        expect(result.pagination).toHaveProperty('totalPages');
      });

      it('should throw error for non-existent pet', async () => {
        const mockPrisma = {
          pet: {
            findUnique: jest.fn().mockResolvedValue(null)
          }
        } as any;

        service.setPrismaClient(mockPrisma);

        await expect(service.getMatchesForPet('invalid-id', mockPreferences))
          .rejects.toThrow('Pet not found');
      });

      it('should handle database errors gracefully', async () => {
        const mockPrisma = {
          pet: {
            findUnique: jest.fn().mockRejectedValue(new Error('Database error'))
          }
        } as any;

        service.setPrismaClient(mockPrisma);

        await expect(service.getMatchesForPet('pet-1', mockPreferences))
          .rejects.toThrow('Database error');
      });
    });

    describe('updateMatchPreferences', () => {
      it('should update user preferences', async () => {
        const mockPrisma = {
          user: {
            update: jest.fn().mockResolvedValue({ id: 'user-1' })
          }
        } as any;

        service.setPrismaClient(mockPrisma);

        const result = await service.updateMatchPreferences('user-1', mockPreferences);

        expect(result).toEqual({ id: 'user-1' });
        expect(mockPrisma.user.update).toHaveBeenCalledWith({
          where: { id: 'user-1' },
          data: { matchPreferences: mockPreferences }
        });
      });

      it('should handle invalid user ID', async () => {
        const mockPrisma = {
          user: {
            update: jest.fn().mockRejectedValue(new Error('User not found'))
          }
        } as any;

        service.setPrismaClient(mockPrisma);

        await expect(service.updateMatchPreferences('invalid-id', mockPreferences))
          .rejects.toThrow('User not found');
      });
    });

    describe('getMatchStatistics', () => {
      it('should return match statistics', async () => {
        const mockPrisma = {
          match: {
            groupBy: jest.fn().mockResolvedValue([
              { _count: { _all: 10 }, score: 'high' },
              { _count: { _all: 5 }, score: 'medium' },
              { _count: { _all: 2 }, score: 'low' }
            ]),
            count: jest.fn().mockResolvedValue(17)
          }
        } as any;

        service.setPrismaClient(mockPrisma);

        const stats = await service.getMatchStatistics();

        expect(stats).toHaveProperty('totalMatches', 17);
        expect(stats).toHaveProperty('scoreDistribution');
        expect(stats.scoreDistribution).toHaveProperty('high', 10);
        expect(stats.scoreDistribution).toHaveProperty('medium', 5);
        expect(stats.scoreDistribution).toHaveProperty('low', 2);
      });

      it('should handle empty statistics', async () => {
        const mockPrisma = {
          match: {
            groupBy: jest.fn().mockResolvedValue([]),
            count: jest.fn().mockResolvedValue(0)
          }
        } as any;

        service.setPrismaClient(mockPrisma);

        const stats = await service.getMatchStatistics();

        expect(stats.totalMatches).toBe(0);
        expect(stats.scoreDistribution).toEqual({});
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle pets with null/undefined values', () => {
      const incompletePet = {
        ...mockCandidatePet,
        weight: null,
        height: undefined,
        dateOfBirth: null,
        location: null,
        breedingPrice: null
      };

      const score = calculateMatchScore(mockPet, incompletePet, defaultWeights);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should handle extreme age differences', () => {
      const babyPet = { ...mockCandidatePet, dateOfBirth: new Date() }; // Newborn
      const ancientPet = { ...mockCandidatePet, dateOfBirth: new Date('1990-01-01') }; // 34 years old
      
      const babyScore = calculateMatchScore(mockPet, babyPet, defaultWeights);
      const ancientScore = calculateMatchScore(mockPet, ancientPet, defaultWeights);
      
      expect(babyScore).toBeLessThan(50);
      expect(ancientScore).toBeLessThan(50);
    });

    it('should handle extreme weight differences', () => {
      const tinyPet = { ...mockCandidatePet, weight: 1 }; // 1 kg
      const giantPet = { ...mockCandidatePet, weight: 100 }; // 100 kg
      
      const tinyScore = calculateMatchScore(mockPet, tinyPet, defaultWeights);
      const giantScore = calculateMatchScore(mockPet, giantPet, defaultWeights);
      
      expect(tinyScore).toBeLessThan(70);
      expect(giantScore).toBeLessThan(70);
    });

    it('should handle very distant locations', () => {
      const localPet = { ...mockCandidatePet, location: { latitude: 40.7128, longitude: -74.0060 } };
      const internationalPet = { ...mockCandidatePet, location: { latitude: 51.5074, longitude: -0.1278 } }; // London
      
      const localScore = calculateMatchScore(mockPet, localPet, defaultWeights);
      const internationalScore = calculateMatchScore(mockPet, internationalPet, defaultWeights);
      
      expect(localScore).toBeGreaterThan(internationalScore);
      expect(internationalScore).toBeLessThan(30);
    });

    it('should handle zero and negative values', () => {
      const zeroPricePet = { ...mockCandidatePet, breedingPrice: 0 };
      const negativePricePet = { ...mockCandidatePet, breedingPrice: -100 };
      
      const zeroScore = calculateMatchScore(mockPet, zeroPricePet, defaultWeights);
      const negativeScore = calculateMatchScore(mockPet, negativePricePet, defaultWeights);
      
      expect(zeroScore).toBeGreaterThanOrEqual(0);
      expect(negativeScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle invalid date formats', () => {
      const invalidDatePet = {
        ...mockCandidatePet,
        dateOfBirth: new Date('invalid-date')
      };
      
      const score = calculateMatchScore(mockPet, invalidDatePet, defaultWeights);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should handle empty string values', () => {
      const emptyStringPet = {
        ...mockCandidatePet,
        breed: '',
        healthConditions: '',
        distinctiveFeatures: ''
      };
      
      const score = calculateMatchScore(mockPet, emptyStringPet, defaultWeights);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should handle special characters in strings', () => {
      const specialCharPet = {
        ...mockCandidatePet,
        breed: 'German Shepherd/Border Collie Mix',
        healthConditions: 'Mild hip dysplasia (Grade 1)',
        distinctiveFeatures: 'White patch on chest & tail docked'
      };
      
      const score = calculateMatchScore(mockPet, specialCharPet, defaultWeights);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should handle very long strings', () => {
      const longStringPet = {
        ...mockCandidatePet,
        description: 'A'.repeat(10000), // Very long description
        healthConditions: 'B'.repeat(1000)
      };
      
      const score = calculateMatchScore(mockPet, longStringPet, defaultWeights);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should handle circular object references', () => {
      const circularPet = { ...mockCandidatePet };
      (circularPet as any).self = circularPet;
      
      expect(() => {
        calculateMatchScore(mockPet, circularPet, defaultWeights);
      }).not.toThrow();
    });

    it('should handle NaN and Infinity values', () => {
      const nanPet = { ...mockCandidatePet, weight: NaN };
      const infinityPet = { ...mockCandidatePet, breedingPrice: Infinity };
      
      const nanScore = calculateMatchScore(mockPet, nanPet, defaultWeights);
      const infinityScore = calculateMatchScore(mockPet, infinityPet, defaultWeights);
      
      expect(nanScore).toBeGreaterThanOrEqual(0);
      expect(infinityScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance Tests', () => {
    it('should handle large candidate lists efficiently', () => {
      const largeCandidateList = Array.from({ length: 1000 }, (_, i) => ({
        ...mockCandidatePet,
        id: `pet-${i}`,
        breed: i % 2 === 0 ? 'Golden Retriever' : 'Labrador'
      }));
      
      const startTime = Date.now();
      const matches = findMatches(mockPet, largeCandidateList, mockPreferences, defaultWeights, 50);
      const endTime = Date.now();
      
      expect(matches).toHaveLength(50);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle concurrent match calculations', async () => {
      const candidates = Array.from({ length: 100 }, (_, i) => ({
        ...mockCandidatePet,
        id: `pet-${i}`,
        breed: 'Golden Retriever'
      }));
      
      const startTime = Date.now();
      
      const promises = candidates.map(candidate => 
        Promise.resolve(calculateMatchScore(mockPet, candidate, defaultWeights))
      );
      
      const scores = await Promise.all(promises);
      const endTime = Date.now();
      
      expect(scores).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  describe('Integration Tests', () => {
    it('should work end-to-end with realistic data', () => {
      const realisticCandidates = [
        {
          ...mockCandidatePet,
          id: 'pet-2',
          name: 'Luna',
          breed: 'Golden Retriever',
          gender: 'female',
          dateOfBirth: new Date('2020-06-15'),
          weight: 28,
          location: { latitude: 40.7589, longitude: -73.9851 },
          breedingPrice: 600
        },
        {
          ...mockCandidatePet,
          id: 'pet-3',
          name: 'Max',
          breed: 'Labrador',
          gender: 'male',
          dateOfBirth: new Date('2019-03-20'),
          weight: 35,
          location: { latitude: 40.7489, longitude: -73.9680 },
          breedingPrice: 450
        },
        {
          ...mockCandidatePet,
          id: 'pet-4',
          name: 'Bella',
          breed: 'Poodle',
          gender: 'female',
          dateOfBirth: new Date('2021-11-10'),
          weight: 25,
          location: { latitude: 40.7614, longitude: -73.9776 },
          breedingPrice: 800
        }
      ];
      
      const matches = findMatches(mockPet, realisticCandidates, mockPreferences, defaultWeights);
      
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].score).toBeGreaterThanOrEqual(matches[matches.length - 1].score);
      
      // Check that Golden Retriever (Luna) has higher score than Poodle (Bella)
      const lunaMatch = matches.find(m => m.pet.name === 'Luna');
      const bellaMatch = matches.find(m => m.pet.name === 'Bella');
      
      if (lunaMatch && bellaMatch) {
        expect(lunaMatch.score).toBeGreaterThan(bellaMatch.score);
      }
    });

    it('should handle complex preference combinations', () => {
      const complexPreferences = {
        ...mockPreferences,
        species: ['dog', 'cat'],
        breeds: ['Golden Retriever', 'Labrador', 'Persian', 'Siamese'],
        ageRange: { min: 1, max: 10 },
        weightRange: { min: 5, max: 50 },
        maxDistance: 100,
        breedingStatus: ['AVAILABLE', 'PENDING'],
        hasPedigree: false, // No pedigree requirement
        isVaccinated: true,
        isNeutered: true,
        maxBreedingPrice: 2000,
        healthConditions: 'None',
        minCompatibilityScore: 60
      };
      
      const diverseCandidates = [
        { ...mockCandidatePet, id: 'pet-2', species: 'dog', breed: 'Golden Retriever' },
        { ...mockCandidatePet, id: 'pet-3', species: 'cat', breed: 'Persian' },
        { ...mockCandidatePet, id: 'pet-4', species: 'dog', breed: 'Poodle' },
        { ...mockCandidatePet, id: 'pet-5', species: 'cat', breed: 'Siamese' }
      ];
      
      const matches = findMatches(mockPet, diverseCandidates, complexPreferences, defaultWeights);
      
      expect(matches.length).toBeGreaterThanOrEqual(2); // Should include Golden Retriever and Persian
      expect(matches.every(m => m.score >= 60)).toBe(true);
    });
  });
});
