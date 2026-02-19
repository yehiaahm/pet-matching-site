/**
 * AI Matching Recommendation System
 * 
 * This module implements a scoring-based matching system that:
 * - Calculates compatibility scores without heavy ML
 * - Factors in breed compatibility, age, health, genetics
 * - Provides explainable recommendations (shows WHY)
 * - Is ML-ready for future upgrades
 */

export interface MatchScore {
  totalScore: number; // 0-100
  breedCompatibility: number; // 0-100
  ageCompatibility: number; // 0-100
  healthScore: number; // 0-100
  geneticScore: number; // 0-100
  locationScore: number; // 0-100
  historyScore: number; // 0-100
  factors: MatchFactor[];
}

export interface MatchFactor {
  category: string;
  score: number;
  weight: number;
  explanation: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface Pet {
  id: string;
  breed: string;
  age: number;
  gender: 'male' | 'female';
  healthScore?: number;
  geneticTests?: string[];
  certifications?: string[];
  previousMatches?: number;
  lastBreedingDate?: Date;
  location?: {
    lat: number;
    lng: number;
  };
  ownerId: string;
  ownerRating?: number;
}

/**
 * Main matching algorithm
 * Returns a comprehensive match score with explanations
 */
export function calculateMatchScore(petA: Pet, petB: Pet): MatchScore {
  // Validate basic requirements
  if (petA.breed !== petB.breed) {
    return createIncompatibleScore('Different breeds cannot be matched');
  }

  if (petA.gender === petB.gender) {
    return createIncompatibleScore('Same gender breeding is not supported');
  }

  if (petA.ownerId === petB.ownerId) {
    return createIncompatibleScore('Cannot match pets from the same owner');
  }

  const factors: MatchFactor[] = [];

  // 1. Breed Compatibility (20% weight)
  const breedScore = calculateBreedCompatibility(petA, petB);
  factors.push({
    category: 'Breed Compatibility',
    score: breedScore,
    weight: 0.2,
    explanation: `Both pets are ${petA.breed}s, perfect genetic match`,
    sentiment: breedScore > 80 ? 'positive' : 'neutral',
  });

  // 2. Age Compatibility (15% weight)
  const ageScore = calculateAgeCompatibility(petA, petB);
  factors.push({
    category: 'Age Compatibility',
    score: ageScore,
    weight: 0.15,
    explanation: getAgeExplanation(petA, petB, ageScore),
    sentiment: ageScore > 70 ? 'positive' : ageScore > 50 ? 'neutral' : 'negative',
  });

  // 3. Health Score (25% weight)
  const healthScore = calculateHealthScore(petA, petB);
  factors.push({
    category: 'Health Status',
    score: healthScore,
    weight: 0.25,
    explanation: getHealthExplanation(petA, petB, healthScore),
    sentiment: healthScore > 75 ? 'positive' : 'neutral',
  });

  // 4. Genetic Compatibility (15% weight)
  const geneticScore = calculateGeneticScore(petA, petB);
  factors.push({
    category: 'Genetic Health',
    score: geneticScore,
    weight: 0.15,
    explanation: getGeneticExplanation(petA, petB, geneticScore),
    sentiment: geneticScore > 70 ? 'positive' : 'neutral',
  });

  // 5. Location Proximity (10% weight)
  const locationScore = calculateLocationScore(petA, petB);
  factors.push({
    category: 'Location Proximity',
    score: locationScore,
    weight: 0.1,
    explanation: getLocationExplanation(locationScore),
    sentiment: locationScore > 60 ? 'positive' : 'neutral',
  });

  // 6. Breeder History (15% weight)
  const historyScore = calculateHistoryScore(petA, petB);
  factors.push({
    category: 'Breeder History',
    score: historyScore,
    weight: 0.15,
    explanation: getHistoryExplanation(petA, petB, historyScore),
    sentiment: historyScore > 70 ? 'positive' : 'neutral',
  });

  // Calculate weighted total score
  const totalScore = factors.reduce((sum, factor) => {
    return sum + (factor.score * factor.weight);
  }, 0);

  return {
    totalScore: Math.round(totalScore),
    breedCompatibility: breedScore,
    ageCompatibility: ageScore,
    healthScore,
    geneticScore,
    locationScore,
    historyScore,
    factors,
  };
}

/**
 * Breed compatibility - same breed = 100
 */
function calculateBreedCompatibility(petA: Pet, petB: Pet): number {
  return petA.breed === petB.breed ? 100 : 0;
}

/**
 * Age compatibility - ideal range is 1-8 years difference for most breeds
 */
function calculateAgeCompatibility(petA: Pet, petB: Pet): number {
  const ageDiff = Math.abs(petA.age - petB.age);

  // Optimal age difference: 1-5 years
  if (ageDiff >= 1 && ageDiff <= 5) return 95;
  if (ageDiff === 0) return 85; // Same age is slightly less ideal
  if (ageDiff > 5 && ageDiff <= 8) return 70;
  if (ageDiff > 8 && ageDiff <= 10) return 50;

  return 30; // Too far apart in age
}

/**
 * Health score based on health records and tests
 */
function calculateHealthScore(petA: Pet, petB: Pet): number {
  let score = 100;

  // Deduct points for missing health records
  if (!petA.healthScore) score -= 15;
  if (!petB.healthScore) score -= 15;

  // Bonus for good health
  if (petA.healthScore && petA.healthScore > 80) score += 10;
  if (petB.healthScore && petB.healthScore > 80) score += 10;

  // Check if either has recent illness (would be flagged in healthScore)
  const avgHealth = ((petA.healthScore || 50) + (petB.healthScore || 50)) / 2;

  return Math.min(100, Math.max(0, score * (avgHealth / 100)));
}

/**
 * Genetic score based on genetic tests and certifications
 */
function calculateGeneticScore(petA: Pet, petB: Pet): number {
  let score = 70; // Baseline for untested pets

  // Genetic tests increase confidence
  const aTests = petA.geneticTests?.length || 0;
  const bTests = petB.geneticTests?.length || 0;

  if (aTests > 0 && bTests > 0) score = 90;
  else if (aTests > 0 || bTests > 0) score = 80;

  // Certifications add confidence
  const aCerts = petA.certifications?.length || 0;
  const bCerts = petB.certifications?.length || 0;

  if (aCerts > 2 && bCerts > 2) score = Math.min(100, score + 10);

  return score;
}

/**
 * Location score - closer is better
 */
function calculateLocationScore(petA: Pet, petB: Pet): number {
  if (!petA.location || !petB.location) {
    return 50; // No location data, neutral score
  }

  const distance = calculateDistance(
    petA.location.lat,
    petA.location.lng,
    petB.location.lat,
    petB.location.lng
  );

  // Distance scoring (in km)
  if (distance < 50) return 100;
  if (distance < 100) return 90;
  if (distance < 200) return 75;
  if (distance < 500) return 50;

  return 30; // Very far apart
}

/**
 * Breeder history score based on rating and previous successful matches
 */
function calculateHistoryScore(petA: Pet, petB: Pet): number {
  const aMatches = petA.previousMatches || 0;
  const bMatches = petB.previousMatches || 0;
  const aRating = petA.ownerRating || 3;
  const bRating = petB.ownerRating || 3;

  // Experience bonus (more matches = more reliable)
  let score = 60;

  if (aMatches > 10 && bMatches > 10) score += 25;
  else if (aMatches > 5 || bMatches > 5) score += 15;
  else if (aMatches > 0) score += 10;

  // Rating bonus (4+ stars = reliable)
  if (aRating >= 4 && bRating >= 4) score += 15;
  else if (aRating >= 3.5 || bRating >= 3.5) score += 8;

  return Math.min(100, score);
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Create an incompatible match result
 */
function createIncompatibleScore(reason: string): MatchScore {
  return {
    totalScore: 0,
    breedCompatibility: 0,
    ageCompatibility: 0,
    healthScore: 0,
    geneticScore: 0,
    locationScore: 0,
    historyScore: 0,
    factors: [
      {
        category: 'Compatibility',
        score: 0,
        weight: 1,
        explanation: reason,
        sentiment: 'negative',
      },
    ],
  };
}

/**
 * Explanation generators for user-friendly messaging
 */
function getAgeExplanation(petA: Pet, petB: Pet, score: number): string {
  const diff = Math.abs(petA.age - petB.age);
  if (diff === 0) return `Both pets are ${petA.age} years old`;
  if (diff <= 5) return `Age difference of ${diff} year(s) is ideal for breeding`;
  if (diff <= 8) return `Age difference of ${diff} year(s) is acceptable`;
  return `Age difference of ${diff} year(s) may present challenges`;
}

function getHealthExplanation(petA: Pet, petB: Pet, score: number): string {
  const avgHealth = ((petA.healthScore || 50) + (petB.healthScore || 50)) / 2;
  if (avgHealth > 85) return 'Both pets have excellent health records';
  if (avgHealth > 70) return 'Good health status for both pets';
  return 'Additional health verification recommended';
}

function getGeneticExplanation(petA: Pet, petB: Pet, score: number): string {
  const aTests = petA.geneticTests?.length || 0;
  const bTests = petB.geneticTests?.length || 0;

  if (aTests > 0 && bTests > 0) return 'Both pets have genetic testing on file';
  if (aTests > 0 || bTests > 0) return 'One pet has genetic testing completed';
  return 'Genetic testing recommended for both pets';
}

function getLocationExplanation(score: number): string {
  if (score >= 90) return 'Very close - minimal travel required';
  if (score >= 75) return 'Reasonable distance for coordination';
  if (score >= 50) return 'Some distance to coordinate';
  return 'Significant distance - arrange logistics carefully';
}

function getHistoryExplanation(petA: Pet, petB: Pet, score: number): string {
  const totalMatches = (petA.previousMatches || 0) + (petB.previousMatches || 0);
  if (totalMatches > 15) return 'Experienced breeders with proven track record';
  if (totalMatches > 5) return 'Both have previous breeding experience';
  if (totalMatches > 0) return 'Some breeding experience on both sides';
  return 'First-time breeders - recommend breeder consultation';
}

/**
 * Generate match recommendations for a pet
 * Returns top N matches sorted by score
 */
export function getTopMatches(
  petA: Pet,
  candidatePets: Pet[],
  topN: number = 5
): Array<{ pet: Pet; score: MatchScore }> {
  return candidatePets
    .map(pet => ({
      pet,
      score: calculateMatchScore(petA, pet),
    }))
    .filter(match => match.score.totalScore > 40) // Only viable matches
    .sort((a, b) => b.score.totalScore - a.score.totalScore)
    .slice(0, topN);
}
