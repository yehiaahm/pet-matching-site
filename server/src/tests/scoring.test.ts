/**
 * Scoring Algorithm Tests
 * Focused tests for the scoring logic components
 */

import { 
  calculateAge,
  calculateDistance,
  calculateBreedScore,
  calculateAgeScore,
  calculateLocationScore,
  calculateHealthScore,
  calculatePedigreeScore,
  calculatePriceScore,
  normalizeWeights
} from '../src/services/matchmaking.service';
import { createMockPet } from './setup';

describe('Scoring Algorithm Components', () => {
  describe('calculateAge', () => {
    it('should calculate age correctly for recent birth', () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 2);
      expect(calculateAge(birthDate)).toBe(2);
    });

    it('should calculate age correctly for exact birthday', () => {
      const birthDate = new Date('2020-01-15');
      const currentDate = new Date('2024-01-15');
      jest.spyOn(global, 'Date').mockImplementation(() => currentDate);
      
      expect(calculateAge(birthDate)).toBe(4);
      
      jest.restoreAllMocks();
    });

    it('should handle future dates gracefully', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      expect(calculateAge(futureDate)).toBe(0);
    });

    it('should handle very old dates', () => {
      const oldDate = new Date('1990-01-01');
      const currentDate = new Date('2024-01-01');
      jest.spyOn(global, 'Date').mockImplementation(() => currentDate);
      
      expect(calculateAge(oldDate)).toBe(34);
      
      jest.restoreAllMocks();
    });

    it('should handle leap years correctly', () => {
      const leapYearDate = new Date('2020-02-29');
      const currentDate = new Date('2024-02-28');
      jest.spyOn(global, 'Date').mockImplementation(() => currentDate);
      
      expect(calculateAge(leapYearDate)).toBe(3);
      
      jest.restoreAllMocks();
    });
  });

  describe('calculateDistance', () => {
    it('should calculate zero distance for same coordinates', () => {
      const distance = calculateDistance(40.7128, -74.0060, 40.7128, -74.0060);
      expect(distance).toBeCloseTo(0, 2);
    });

    it('should calculate distance between NYC and LA', () => {
      const nycLat = 40.7128;
      const nycLon = -74.0060;
      const laLat = 34.0522;
      const laLon = -118.2437;
      
      const distance = calculateDistance(nycLat, nycLon, laLat, laLon);
      expect(distance).toBeCloseTo(3944, 0); // Approximately 3944 km
    });

    it('should handle very small distances', () => {
      const distance = calculateDistance(40.7128, -74.0060, 40.7129, -74.0061);
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(1);
    });

    it('should handle antipodal points (opposite sides of Earth)', () => {
      const distance = calculateDistance(0, 0, 0, 180);
      expect(distance).toBeCloseTo(20015, 0); // Approximately half Earth's circumference
    });

    it('should handle coordinates at poles', () => {
      const distance = calculateDistance(90, 0, -90, 0);
      expect(distance).toBeCloseTo(20015, 0); // Approximately half Earth's circumference
    });
  });

  describe('calculateBreedScore', () => {
    it('should return perfect score for identical breeds', () => {
      const pet1 = createMockPet({ breed: 'Golden Retriever' });
      const pet2 = createMockPet({ breed: 'Golden Retriever' });
      
      expect(calculateBreedScore(pet1, pet2)).toBe(100);
    });

    it('should return good score for same species different breed', () => {
      const pet1 = createMockPet({ breed: 'Golden Retriever', species: 'dog' });
      const pet2 = createMockPet({ breed: 'Labrador', species: 'dog' });
      
      expect(calculateBreedScore(pet1, pet2)).toBe(70);
    });

    it('should return poor score for different species', () => {
      const pet1 = createMockPet({ breed: 'Golden Retriever', species: 'dog' });
      const pet2 = createMockPet({ breed: 'Persian', species: 'cat' });
      
      expect(calculateBreedScore(pet1, pet2)).toBe(20);
    });

    it('should handle case sensitivity', () => {
      const pet1 = createMockPet({ breed: 'golden retriever' });
      const pet2 = createMockPet({ breed: 'Golden Retriever' });
      
      expect(calculateBreedScore(pet1, pet2)).toBeLessThan(100);
    });

    it('should handle mixed breed names', () => {
      const pet1 = createMockPet({ breed: 'Golden Retriever/Labrador Mix' });
      const pet2 = createMockPet({ breed: 'Golden Retriever' });
      
      const score = calculateBreedScore(pet1, pet2);
      expect(score).toBeGreaterThan(20);
      expect(score).toBeLessThan(100);
    });
  });

  describe('calculateAgeScore', () => {
    it('should return perfect score for identical ages', () => {
      const pet1 = createMockPet({ dateOfBirth: new Date('2020-01-01') });
      const pet2 = createMockPet({ dateOfBirth: new Date('2020-06-01') });
      
      expect(calculateAgeScore(pet1, pet2)).toBe(100);
    });

    it('should return high score for small age differences', () => {
      const pet1 = createMockPet({ dateOfBirth: new Date('2020-01-01') }); // 4 years
      const pet2 = createMockPet({ dateOfBirth: new Date('2021-01-01') }); // 3 years
      
      expect(calculateAgeScore(pet1, pet2)).toBe(100);
    });

    it('should return lower score for large age differences', () => {
      const pet1 = createMockPet({ dateOfBirth: new Date('2020-01-01') }); // 4 years
      const pet2 = createMockPet({ dateOfBirth: new Date('2010-01-01') }); // 14 years
      
      expect(calculateAgeScore(pet1, pet2)).toBeLessThan(50);
    });

    it('should handle very young pets', () => {
      const baby = createMockPet({ dateOfBirth: new Date() }); // 0 years
      const adult = createMockPet({ dateOfBirth: new Date('2020-01-01') }); // 4 years
      
      expect(calculateAgeScore(baby, adult)).toBeLessThan(50);
    });

    it('should handle very old pets', () => {
      const ancient = createMockPet({ dateOfBirth: new Date('1990-01-01') }); // 34 years
      const adult = createMockPet({ dateOfBirth: new Date('2020-01-01') }); // 4 years
      
      expect(calculateAgeScore(ancient, adult)).toBeLessThan(50);
    });
  });

  describe('calculateLocationScore', () => {
    it('should return perfect score for same location', () => {
      const location = { latitude: 40.7128, longitude: -74.0060 };
      const pet1 = createMockPet({ location });
      const pet2 = createMockPet({ location });
      
      expect(calculateLocationScore(pet1, pet2)).toBe(100);
    });

    it('should return high score for nearby locations', () => {
      const pet1 = createMockPet({ location: { latitude: 40.7128, longitude: -74.0060 } });
      const pet2 = createMockPet({ location: { latitude: 40.7200, longitude: -74.0100 } });
      
      expect(calculateLocationScore(pet1, pet2)).toBeGreaterThan(80);
    });

    it('should return lower score for distant locations', () => {
      const pet1 = createMockPet({ location: { latitude: 40.7128, longitude: -74.0060 } }); // NYC
      const pet2 = createMockPet({ location: { latitude: 34.0522, longitude: -118.2437 } }); // LA
      
      expect(calculateLocationScore(pet1, pet2)).toBeLessThan(30);
    });

    it('should return neutral score for missing location data', () => {
      const pet1 = createMockPet({ location: null });
      const pet2 = createMockPet({ location: { latitude: 40.7128, longitude: -74.0060 } });
      
      expect(calculateLocationScore(pet1, pet2)).toBe(50);
    });

    it('should return neutral score for both missing locations', () => {
      const pet1 = createMockPet({ location: null });
      const pet2 = createMockPet({ location: null });
      
      expect(calculateLocationScore(pet1, pet2)).toBe(50);
    });
  });

  describe('calculateHealthScore', () => {
    it('should return perfect score for healthy vaccinated pets', () => {
      const pet1 = createMockPet({ 
        healthConditions: 'None', 
        isVaccinated: true,
        lastHealthCheckDate: new Date()
      });
      const pet2 = createMockPet({ 
        healthConditions: 'None', 
        isVaccinated: true,
        lastHealthCheckDate: new Date()
      });
      
      expect(calculateHealthScore(pet1, pet2)).toBe(100);
    });

    it('should penalize pets with health conditions', () => {
      const healthy = createMockPet({ healthConditions: 'None', isVaccinated: true });
      const sick = createMockPet({ healthConditions: 'Hip dysplasia', isVaccinated: true });
      
      expect(calculateHealthScore(healthy, sick)).toBeLessThan(80);
    });

    it('should reward vaccination status', () => {
      const vaccinated = createMockPet({ isVaccinated: true, healthConditions: 'None' });
      const unvaccinated = createMockPet({ isVaccinated: false, healthConditions: 'None' });
      
      const vaccinatedScore = calculateHealthScore(vaccinated, vaccinated);
      const unvaccinatedScore = calculateHealthScore(unvaccinated, unvaccinated);
      
      expect(vaccinatedScore).toBeGreaterThan(unvaccinatedScore);
    });

    it('should reward recent health checks', () => {
      const recentCheck = createMockPet({ 
        lastHealthCheckDate: new Date(),
        healthConditions: 'None',
        isVaccinated: true
      });
      const oldCheck = createMockPet({ 
        lastHealthCheckDate: new Date('2020-01-01'),
        healthConditions: 'None',
        isVaccinated: true
      });
      
      const recentScore = calculateHealthScore(recentCheck, recentCheck);
      const oldScore = calculateHealthScore(oldCheck, oldCheck);
      
      expect(recentScore).toBeGreaterThan(oldScore);
    });

    it('should cap scores at 100', () => {
      const perfectPet = createMockPet({ 
        healthConditions: 'None', 
        isVaccinated: true,
        lastHealthCheckDate: new Date()
      });
      
      expect(calculateHealthScore(perfectPet, perfectPet)).toBeLessThanOrEqual(100);
    });

    it('should not go below 0', () => {
      const veryUnhealthyPet = createMockPet({ 
        healthConditions: 'Multiple severe conditions', 
        isVaccinated: false
      });
      
      expect(calculateHealthScore(veryUnhealthyPet, veryUnhealthyPet)).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculatePedigreeScore', () => {
    it('should return perfect score for both pets with pedigree', () => {
      const pet1 = createMockPet({ hasPedigree: true });
      const pet2 = createMockPet({ hasPedigree: true });
      
      expect(calculatePedigreeScore(pet1, pet2)).toBe(100);
    });

    it('should return medium score for one pet with pedigree', () => {
      const pedigreePet = createMockPet({ hasPedigree: true });
      const nonPedigreePet = createMockPet({ hasPedigree: false });
      
      expect(calculatePedigreeScore(pedigreePet, nonPedigreePet)).toBe(60);
    });

    it('should return low score for both pets without pedigree', () => {
      const pet1 = createMockPet({ hasPedigree: false });
      const pet2 = createMockPet({ hasPedigree: false });
      
      expect(calculatePedigreeScore(pet1, pet2)).toBe(30);
    });
  });

  describe('calculatePriceScore', () => {
    it('should return perfect score for identical prices', () => {
      const pet1 = createMockPet({ breedingPrice: 500 });
      const pet2 = createMockPet({ breedingPrice: 500 });
      
      expect(calculatePriceScore(pet1, pet2)).toBe(100);
    });

    it('should return high score for similar prices', () => {
      const pet1 = createMockPet({ breedingPrice: 500 });
      const pet2 = createMockPet({ breedingPrice: 550 });
      
      expect(calculatePriceScore(pet1, pet2)).toBeGreaterThan(80);
    });

    it('should return lower score for very different prices', () => {
      const pet1 = createMockPet({ breedingPrice: 500 });
      const pet2 = createMockPet({ breedingPrice: 2000 });
      
      expect(calculatePriceScore(pet1, pet2)).toBeLessThan(60);
    });

    it('should return neutral score for missing price data', () => {
      const pet1 = createMockPet({ breedingPrice: null });
      const pet2 = createMockPet({ breedingPrice: 500 });
      
      expect(calculatePriceScore(pet1, pet2)).toBe(50);
    });

    it('should handle zero prices', () => {
      const freePet = createMockPet({ breedingPrice: 0 });
      const paidPet = createMockPet({ breedingPrice: 500 });
      
      expect(calculatePriceScore(freePet, paidPet)).toBeLessThan(50);
    });

    it('should handle very high prices', () => {
      const pet1 = createMockPet({ breedingPrice: 1000 });
      const pet2 = createMockPet({ breedingPrice: 10000 });
      
      expect(calculatePriceScore(pet1, pet2)).toBeLessThan(40);
    });
  });

  describe('normalizeWeights', () => {
    it('should normalize weights that sum to 100', () => {
      const weights = { breed: 25, age: 20, location: 20, health: 15, pedigree: 10, price: 10 };
      const normalized = normalizeWeights(weights);
      
      expect(normalized).toEqual(weights);
    });

    it('should normalize weights that don\'t sum to 100', () => {
      const weights = { breed: 50, age: 30, location: 20, health: 0, pedigree: 0, price: 0 };
      const normalized = normalizeWeights(weights);
      
      const total = Object.values(normalized).reduce((sum, weight) => sum + weight, 0);
      expect(total).toBeCloseTo(100, 2);
    });

    it('should handle zero weights', () => {
      const weights = { breed: 0, age: 0, location: 0, health: 0, pedigree: 0, price: 0 };
      const normalized = normalizeWeights(weights);
      
      expect(normalized).toEqual(weights);
    });

    it('should handle negative weights', () => {
      const weights = { breed: -10, age: 50, location: 30, health: 20, pedigree: 10, price: 0 };
      const normalized = normalizeWeights(weights);
      
      const total = Object.values(normalized).reduce((sum, weight) => sum + weight, 0);
      expect(total).toBeCloseTo(100, 2);
    });

    it('should handle very large weights', () => {
      const weights = { breed: 1000, age: 500, location: 300, health: 200, pedigree: 100, price: 50 };
      const normalized = normalizeWeights(weights);
      
      const total = Object.values(normalized).reduce((sum, weight) => sum + weight, 0);
      expect(total).toBeCloseTo(100, 2);
    });
  });
});

describe('Scoring Edge Cases', () => {
  it('should handle invalid date objects', () => {
    const pet1 = createMockPet({ dateOfBirth: new Date('invalid') });
    const pet2 = createMockPet({ dateOfBirth: new Date() });
    
    expect(() => calculateAgeScore(pet1, pet2)).not.toThrow();
  });

  it('should handle extreme coordinate values', () => {
    const pet1 = createMockPet({ location: { latitude: 90, longitude: 180 } });
    const pet2 = createMockPet({ location: { latitude: -90, longitude: -180 } });
    
    expect(() => calculateLocationScore(pet1, pet2)).not.toThrow();
  });

  it('should handle NaN values in prices', () => {
    const pet1 = createMockPet({ breedingPrice: NaN });
    const pet2 = createMockPet({ breedingPrice: 500 });
    
    expect(() => calculatePriceScore(pet1, pet2)).not.toThrow();
  });

  it('should handle Infinity values in prices', () => {
    const pet1 = createMockPet({ breedingPrice: Infinity });
    const pet2 = createMockPet({ breedingPrice: 500 });
    
    expect(() => calculatePriceScore(pet1, pet2)).not.toThrow();
  });

  it('should handle empty strings in health conditions', () => {
    const pet1 = createMockPet({ healthConditions: '' });
    const pet2 = createMockPet({ healthConditions: 'None' });
    
    expect(() => calculateHealthScore(pet1, pet2)).not.toThrow();
  });

  it('should handle null values gracefully', () => {
    const pet1 = createMockPet({ 
      location: null, 
      breedingPrice: null, 
      lastHealthCheckDate: null 
    });
    const pet2 = createMockPet();
    
    expect(() => {
      calculateLocationScore(pet1, pet2);
      calculatePriceScore(pet1, pet2);
      calculateHealthScore(pet1, pet2);
    }).not.toThrow();
  });
});
