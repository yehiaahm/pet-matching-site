/**
 * Matchmaking Service
 * Core algorithm for pet matchmaking with scoring and preferences
 */

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  gender: 'male' | 'female';
  dateOfBirth: Date;
  weight?: number;
  height?: number;
  color?: string;
  isVaccinated: boolean;
  isNeutered: boolean;
  lastHealthCheckDate?: Date;
  nextVaccinationDate?: Date;
  breedingStatus: 'AVAILABLE' | 'PENDING' | 'BREEDING' | 'RETIRED' | 'NOT_AVAILABLE';
  breedingPrice?: number;
  nextAvailableDate?: Date;
  hasPedigree: boolean;
  images: string[];
  videos: string[];
  description?: string;
  isPublished: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  ownerId: string;
  location?: { latitude: number; longitude: number };
  healthConditions?: string;
  microchipNumber?: string;
  registrationNumber?: string;
  pedigreeNumber?: string;
  distinctiveFeatures?: string;
}

export interface MatchPreferences {
  species: string[];
  breeds: string[];
  gender?: 'male' | 'female';
  ageRange: { min: number; max: number };
  weightRange: { min: number; max: number };
  maxDistance: number;
  breedingStatus: string[];
  hasPedigree?: boolean;
  isVaccinated?: boolean;
  isNeutered?: boolean;
  maxBreedingPrice?: number;
  healthConditions?: string;
  minCompatibilityScore: number;
}

export interface ScoringWeights {
  breed: number;
  age: number;
  location: number;
  health: number;
  pedigree: number;
  price: number;
}

export interface CompatibilityFactors {
  breed: number;
  age: number;
  location: number;
  health: number;
  pedigree: number;
  price: number;
}

export interface MatchResult {
  pet: Pet;
  score: number;
  compatibilityFactors: CompatibilityFactors;
  matchedAt: Date;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedMatches {
  matches: MatchResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MatchStatistics {
  totalMatches: number;
  scoreDistribution: Record<string, number>;
  averageScore: number;
}

/**
 * Calculate the age of a pet in years
 */
function calculateAge(dateOfBirth: Date): number {
  const now = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return Math.max(0, age);
}

/**
 * Calculate distance between two coordinates in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Calculate breed compatibility score
 */
function calculateBreedScore(pet1: Pet, pet2: Pet): number {
  if (pet1.breed === pet2.breed) {
    return 100; // Perfect match
  }
  
  // Same species but different breed
  if (pet1.species === pet2.species) {
    return 70; // Good match
  }
  
  // Different species
  return 20; // Poor match
}

/**
 * Calculate age compatibility score
 */
function calculateAgeScore(pet1: Pet, pet2: Pet): number {
  const age1 = calculateAge(pet1.dateOfBirth);
  const age2 = calculateAge(pet2.dateOfBirth);
  
  // Ideal age difference is within 2 years
  const ageDiff = Math.abs(age1 - age2);
  
  if (ageDiff <= 2) {
    return 100;
  } else if (ageDiff <= 4) {
    return 80;
  } else if (ageDiff <= 6) {
    return 60;
  } else if (ageDiff <= 8) {
    return 40;
  } else {
    return 20;
  }
}

/**
 * Calculate location compatibility score
 */
function calculateLocationScore(pet1: Pet, pet2: Pet): number {
  if (!pet1.location || !pet2.location) {
    return 50; // Neutral score if location data missing
  }
  
  const distance = calculateDistance(
    pet1.location.latitude,
    pet1.location.longitude,
    pet2.location.latitude,
    pet2.location.longitude
  );
  
  if (distance <= 10) {
    return 100;
  } else if (distance <= 25) {
    return 80;
  } else if (distance <= 50) {
    return 60;
  } else if (distance <= 100) {
    return 40;
  } else if (distance <= 200) {
    return 20;
  } else {
    return 10;
  }
}

/**
 * Calculate health compatibility score
 */
function calculateHealthScore(pet1: Pet, pet2: Pet): number {
  let score = 100;
  
  // Penalize pets with health conditions
  if (pet1.healthConditions && pet1.healthConditions !== 'None') {
    score -= 30;
  }
  
  if (pet2.healthConditions && pet2.healthConditions !== 'None') {
    score -= 30;
  }
  
  // Reward vaccination status
  if (pet1.isVaccinated) {
    score += 10;
  }
  
  if (pet2.isVaccinated) {
    score += 10;
  }
  
  // Check recent health check
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  if (pet1.lastHealthCheckDate && pet1.lastHealthCheckDate > threeMonthsAgo) {
    score += 10;
  }
  
  if (pet2.lastHealthCheckDate && pet2.lastHealthCheckDate > threeMonthsAgo) {
    score += 10;
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Calculate pedigree compatibility score
 */
function calculatePedigreeScore(pet1: Pet, pet2: Pet): number {
  if (pet1.hasPedigree && pet2.hasPedigree) {
    return 100;
  } else if (pet1.hasPedigree || pet2.hasPedigree) {
    return 60;
  } else {
    return 30;
  }
}

/**
 * Calculate price compatibility score
 */
function calculatePriceScore(pet1: Pet, pet2: Pet): number {
  if (!pet1.breedingPrice || !pet2.breedingPrice) {
    return 50; // Neutral score if price data missing
  }
  
  const priceDiff = Math.abs(pet1.breedingPrice - pet2.breedingPrice);
  const avgPrice = (pet1.breedingPrice + pet2.breedingPrice) / 2;
  const priceDiffPercent = (priceDiff / avgPrice) * 100;
  
  if (priceDiffPercent <= 10) {
    return 100;
  } else if (priceDiffPercent <= 25) {
    return 80;
  } else if (priceDiffPercent <= 50) {
    return 60;
  } else if (priceDiffPercent <= 100) {
    return 40;
  } else {
    return 20;
  }
}

/**
 * Normalize weights to ensure they sum to 100
 */
function normalizeWeights(weights: ScoringWeights): ScoringWeights {
  const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  
  if (total === 0) {
    return weights; // Avoid division by zero
  }
  
  const normalized = { ...weights };
  Object.keys(normalized).forEach(key => {
    normalized[key as keyof ScoringWeights] = (weights[key as keyof ScoringWeights] / total) * 100;
  });
  
  return normalized;
}

/**
 * Calculate overall match score between two pets
 */
export function calculateMatchScore(
  pet1: Pet,
  pet2: Pet,
  weights: ScoringWeights
): number {
  const normalizedWeights = normalizeWeights(weights);
  
  const factors: CompatibilityFactors = {
    breed: calculateBreedScore(pet1, pet2),
    age: calculateAgeScore(pet1, pet2),
    location: calculateLocationScore(pet1, pet2),
    health: calculateHealthScore(pet1, pet2),
    pedigree: calculatePedigreeScore(pet1, pet2),
    price: calculatePriceScore(pet1, pet2)
  };
  
  const totalScore = 
    (factors.breed * normalizedWeights.breed / 100) +
    (factors.age * normalizedWeights.age / 100) +
    (factors.location * normalizedWeights.location / 100) +
    (factors.health * normalizedWeights.health / 100) +
    (factors.pedigree * normalizedWeights.pedigree / 100) +
    (factors.price * normalizedWeights.price / 100);
  
  return Math.round(totalScore * 100) / 100; // Round to 2 decimal places
}

/**
 * Filter pets based on user preferences
 */
export function filterByPreferences(
  pets: Pet[],
  preferences: MatchPreferences
): Pet[] {
  if (!preferences) {
    return pets;
  }
  
  return pets.filter(pet => {
    // Species filter
    if (preferences.species.length > 0 && !preferences.species.includes(pet.species)) {
      return false;
    }
    
    // Breed filter
    if (preferences.breeds.length > 0 && !preferences.breeds.includes(pet.breed)) {
      return false;
    }
    
    // Gender filter
    if (preferences.gender && pet.gender !== preferences.gender) {
      return false;
    }
    
    // Age filter
    const age = calculateAge(pet.dateOfBirth);
    if (age < preferences.ageRange.min || age > preferences.ageRange.max) {
      return false;
    }
    
    // Weight filter
    if (pet.weight && (pet.weight < preferences.weightRange.min || pet.weight > preferences.weightRange.max)) {
      return false;
    }
    
    // Distance filter (if both pets have location)
    // Note: This would need the user's location in a real implementation
    
    // Breeding status filter
    if (preferences.breedingStatus.length > 0 && !preferences.breedingStatus.includes(pet.breedingStatus)) {
      return false;
    }
    
    // Pedigree filter
    if (preferences.hasPedigree !== undefined && pet.hasPedigree !== preferences.hasPedigree) {
      return false;
    }
    
    // Vaccination filter
    if (preferences.isVaccinated !== undefined && pet.isVaccinated !== preferences.isVaccinated) {
      return false;
    }
    
    // Neutering filter
    if (preferences.isNeutered !== undefined && pet.isNeutered !== preferences.isNeutered) {
      return false;
    }
    
    // Price filter
    if (preferences.maxBreedingPrice && pet.breedingPrice && pet.breedingPrice > preferences.maxBreedingPrice) {
      return false;
    }
    
    // Health conditions filter
    if (preferences.healthConditions && pet.healthConditions !== preferences.healthConditions) {
      return false;
    }
    
    return true;
  });
}

/**
 * Find matches for a pet
 */
export function findMatches(
  pet: Pet,
  candidates: Pet[],
  preferences: MatchPreferences,
  weights: ScoringWeights,
  maxResults: number = 50
): MatchResult[] {
  // Filter candidates based on preferences
  const filteredCandidates = filterByPreferences(candidates, preferences);
  
  // Exclude self and inactive/unpublished/deleted pets
  const validCandidates = filteredCandidates.filter(candidate => 
    candidate.id !== pet.id &&
    candidate.isActive &&
    candidate.isPublished &&
    !candidate.deletedAt
  );
  
  // Calculate scores for all valid candidates
  const matches: MatchResult[] = validCandidates.map(candidate => {
    const score = calculateMatchScore(pet, candidate, weights);
    
    const factors: CompatibilityFactors = {
      breed: calculateBreedScore(pet, candidate),
      age: calculateAgeScore(pet, candidate),
      location: calculateLocationScore(pet, candidate),
      health: calculateHealthScore(pet, candidate),
      pedigree: calculatePedigreeScore(pet, candidate),
      price: calculatePriceScore(pet, candidate)
    };
    
    return {
      pet: candidate,
      score,
      compatibilityFactors: factors,
      matchedAt: new Date()
    };
  });
  
  // Filter by minimum score
  const filteredMatches = matches.filter(match => match.score >= preferences.minCompatibilityScore);
  
  // Sort by score (descending)
  filteredMatches.sort((a, b) => b.score - a.score);
  
  // Limit results
  return filteredMatches.slice(0, maxResults);
}

/**
 * Matchmaking Service Class
 */
export class MatchmakingService {
  private prisma: any;

  constructor() {
    this.prisma = null;
  }

  setPrismaClient(prisma: any) {
    this.prisma = prisma;
  }

  /**
   * Get matches for a specific pet with pagination
   */
  async getMatchesForPet(
    petId: string,
    preferences: MatchPreferences,
    pagination: PaginationOptions
  ): Promise<PaginatedMatches> {
    if (!this.prisma) {
      throw new Error('Prisma client not set');
    }

    // Get the target pet
    const targetPet = await this.prisma.pet.findUnique({
      where: { id: petId }
    });

    if (!targetPet) {
      throw new Error('Pet not found');
    }

    // Get candidate pets
    const candidates = await this.prisma.pet.findMany({
      where: {
        id: { not: petId },
        isActive: true,
        isPublished: true,
        deletedAt: null
      }
    });

    // Find matches
    const weights: ScoringWeights = {
      breed: 25,
      age: 20,
      location: 20,
      health: 15,
      pedigree: 10,
      price: 10
    };

    const allMatches = findMatches(targetPet, candidates, preferences, weights);

    // Apply pagination
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const paginatedMatches = allMatches.slice(startIndex, endIndex);

    return {
      matches: paginatedMatches,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: allMatches.length,
        totalPages: Math.ceil(allMatches.length / pagination.limit)
      }
    };
  }

  /**
   * Update user match preferences
   */
  async updateMatchPreferences(
    userId: string,
    preferences: MatchPreferences
  ): Promise<any> {
    if (!this.prisma) {
      throw new Error('Prisma client not set');
    }

    return await this.prisma.user.update({
      where: { id: userId },
      data: { matchPreferences: preferences }
    });
  }

  /**
   * Get match statistics
   */
  async getMatchStatistics(): Promise<MatchStatistics> {
    if (!this.prisma) {
      throw new Error('Prisma client not set');
    }

    // Get score distribution
    const scoreDistribution = await this.prisma.match.groupBy({
      by: ['score'],
      _count: { _all: true }
    });

    // Get total matches
    const totalMatches = await this.prisma.match.count();

    // Calculate average score
    const avgResult = await this.prisma.match.aggregate({
      _avg: { score: true }
    });

    const distribution: Record<string, number> = {};
    scoreDistribution.forEach(item => {
      const scoreRange = this.getScoreRange(item.score);
      distribution[scoreRange] = (distribution[scoreRange] || 0) + item._count._all;
    });

    return {
      totalMatches,
      scoreDistribution: distribution,
      averageScore: avgResult._avg.score || 0
    };
  }

  /**
   * Helper method to categorize scores
   */
  private getScoreRange(score: number): string {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  }

  /**
   * Batch calculate matches for multiple pets
   */
  async batchCalculateMatches(
    petIds: string[],
    preferences: MatchPreferences,
    weights: ScoringWeights
  ): Promise<Record<string, MatchResult[]>> {
    if (!this.prisma) {
      throw new Error('Prisma client not set');
    }

    const results: Record<string, MatchResult[]> = {};

    for (const petId of petIds) {
      try {
        const matches = await this.getMatchesForPet(petId, preferences, { page: 1, limit: 50 });
        results[petId] = matches.matches;
      } catch (error) {
        console.error(`Error calculating matches for pet ${petId}:`, error);
        results[petId] = [];
      }
    }

    return results;
  }

  /**
   * Get recommended pets for a user
   */
  async getRecommendedPets(
    userId: string,
    preferences: MatchPreferences,
    limit: number = 10
  ): Promise<MatchResult[]> {
    if (!this.prisma) {
      throw new Error('Prisma client not set');
    }

    // Get user's pets
    const userPets = await this.prisma.pet.findMany({
      where: {
        ownerId: userId,
        isActive: true,
        isPublished: true,
        deletedAt: null
      }
    });

    if (userPets.length === 0) {
      return [];
    }

    // Get all candidate pets
    const candidates = await this.prisma.pet.findMany({
      where: {
        ownerId: { not: userId },
        isActive: true,
        isPublished: true,
        deletedAt: null
      }
    });

    // Calculate matches for each user pet and aggregate
    const allMatches: MatchResult[] = [];
    const weights: ScoringWeights = {
      breed: 25,
      age: 20,
      location: 20,
      health: 15,
      pedigree: 10,
      price: 10
    };

    for (const userPet of userPets) {
      const matches = findMatches(userPet, candidates, preferences, weights);
      allMatches.push(...matches);
    }

    // Remove duplicates and sort by score
    const uniqueMatches = allMatches.filter((match, index, self) =>
      index === self.findIndex(m => m.pet.id === match.pet.id)
    );

    uniqueMatches.sort((a, b) => b.score - a.score);

    return uniqueMatches.slice(0, limit);
  }
}
