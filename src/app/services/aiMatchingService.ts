/**
 * AI Matching Service - Production Ready
 * Connects frontend to the external AI matching microservice
 */

import { safePost, safeGet } from '../utils/safeFetch';
import { getAiServiceUrl, getEnvironmentAiServiceUrl } from '../../env';

// AI Service Configuration
const AI_SERVICE_BASE_URL = getEnvironmentAiServiceUrl();

// Pet Schema matching the AI service contract
export interface AIPet {
  id: string;
  species: 'dog' | 'cat' | 'bird';
  breed: string;
  gender: 'MALE' | 'FEMALE';
  age: number;
  health_score?: number; // 0-100
  genetic_risk?: number; // 0-1
  temperament?: 'calm' | 'active' | 'anxious';
  breeding_history_count?: number;
  location_lat?: number;
  location_lon?: number;
}

// AI Service Response Types
export interface MatchScoreResponse {
  score: number; // 0-100
  probability: number; // 0-1
  contributions: {
    breed: number;
    age: number;
    health: number;
    genetics: number;
    history: number;
  };
  explanation: string;
  timestamp: string;
}

export interface RecommendationResponse {
  petId: string;
  recommendations: Array<{
    matchedPetId: string;
    score: number;
    contributions: {
      breed: number;
      age: number;
      health: number;
      genetics: number;
      history: number;
    };
    explanation: string;
    breedCompatibility: number;
    ageCompatibility: number;
    healthScore: number;
    geneticScore: number;
  }>;
}

export interface TrainingResponse {
  status: 'trained';
  samples: number;
}

// Internal Pet type (from our database)
export interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird';
  breed: string;
  age: number;
  gender: 'male' | 'female';
  image?: string;
  owner: {
    name: string;
    address: string;
    rating: number;
    totalMatches: number;
    verified: boolean;
  };
  vaccinations: Array<{
    name: string;
    date: string;
    nextDue: string;
  }>;
  healthCheck: {
    date: string;
    veterinarian: string;
    certificate: string;
  };
  availability: {
    from: string;
    to: string;
  };
  description?: string;
  verified: boolean;
  temperament?: 'calm' | 'active' | 'anxious';
  breeding_history_count?: number;
  location_lat?: number;
  location_lon?: number;
}

// Enhanced match result for frontend
export interface EnhancedMatchResult {
  id: string;
  matchedPetId: string;
  matchedPetName: string;
  matchedPetBreed: string;
  matchedPetAge: number;
  matchedPetGender: 'male' | 'female';
  matchedPetImage?: string;
  ownerName: string;
  ownerRating: number;
  previousMatches: number;
  score: {
    totalScore: number;
    breedCompatibility: number;
    ageCompatibility: number;
    healthScore: number;
    geneticScore: number;
    locationScore: number;
    historyScore: number;
    factors: Array<{
      category: string;
      explanation: string;
      sentiment: 'positive' | 'negative' | 'neutral';
      weight: number;
    }>;
  };
  recommendation: string;
  distance: number;
  location: string;
  probability: number;
}

class AIMatchingService {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || AI_SERVICE_BASE_URL;
  }

  /**
   * Convert internal Pet to AI service format
   */
  private convertToAIPet(pet: Pet): AIPet {
    // Calculate health score based on vaccinations and health checks
    let healthScore = 75; // Base score
    
    // Boost score for complete vaccinations
    if (pet.vaccinations.length >= 3) healthScore += 15;
    else if (pet.vaccinations.length >= 2) healthScore += 10;
    
    // Boost score for recent health checks
    const healthCheckDate = new Date(pet.healthCheck.date);
    const monthsSinceCheck = (Date.now() - healthCheckDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsSinceCheck <= 6) healthScore += 10;
    else if (monthsSinceCheck <= 12) healthScore += 5;

    // Extract coordinates from address (mock implementation)
    const locationCoords = this.extractCoordinates(pet.owner.address);

    return {
      id: pet.id,
      species: pet.type,
      breed: pet.breed,
      gender: pet.gender.toUpperCase() as 'MALE' | 'FEMALE',
      age: pet.age,
      health_score: Math.min(100, healthScore),
      genetic_risk: this.calculateGeneticRisk(pet.breed),
      temperament: pet.temperament,
      breeding_history_count: pet.breeding_history_count || pet.owner.totalMatches,
      location_lat: locationCoords.lat,
      location_lon: locationCoords.lng,
    };
  }

  /**
   * Extract coordinates from address (mock implementation)
   */
  private extractCoordinates(address: string): { lat: number; lng: number } {
    const locationMap: Record<string, { lat: number; lng: number }> = {
      'Cairo - Maadi': { lat: 30.0, lng: 31.3 },
      'Cairo - Zamalek': { lat: 30.1, lng: 31.2 },
      'Cairo - Nasr City': { lat: 30.1, lng: 31.4 },
      'Giza - Dokki': { lat: 30.0, lng: 31.2 },
      'Giza - Mohandessin': { lat: 30.1, lng: 31.2 },
      'Alexandria - Smouha': { lat: 31.2, lng: 29.9 },
    };

    return locationMap[address] || { lat: 30.0, lng: 31.3 };
  }

  /**
   * Calculate genetic risk based on breed (mock implementation)
   */
  private calculateGeneticRisk(breed: string): number {
    const riskFactors: Record<string, number> = {
      'Golden Retriever': 0.15,
      'German Shepherd': 0.20,
      'Labrador': 0.12,
      'Persian': 0.25,
      'Siamese': 0.18,
    };

    return riskFactors[breed] || 0.20;
  }

  /**
   * Calculate match score between two pets
   */
  async calculateMatchScore(petA: Pet, petB: Pet): Promise<MatchScoreResponse | null> {
    try {
      console.log('🤖 AI Service: Calculating match score between', petA.name, 'and', petB.name);

      const aiPetA = this.convertToAIPet(petA);
      const aiPetB = this.convertToAIPet(petB);

      const response = await safePost<MatchScoreResponse>(
        `${this.baseUrl}/match-score`,
        { petA: aiPetA, petB: aiPetB }
      );

      if (response.success && response.data) {
        console.log('✅ AI Service: Match score calculated successfully');
        return response.data;
      } else {
        console.error('❌ AI Service: Match score calculation failed:', response.error);
        return null;
      }
    } catch (error) {
      console.error('❌ AI Service: Error calculating match score:', error);
      return null;
    }
  }

  /**
   * Get AI recommendations for a pet
   */
  async getRecommendations(
    pet: Pet, 
    candidates: Pet[], 
    limit: number = 5
  ): Promise<EnhancedMatchResult[]> {
    try {
      console.log('🤖 AI Service: Getting recommendations for', pet.name);

      const aiPet = this.convertToAIPet(pet);
      const aiCandidates = candidates.map(candidate => this.convertToAIPet(candidate));

      const response = await safePost<RecommendationResponse>(
        `${this.baseUrl}/recommendations`,
        { 
          pet: aiPet, 
          candidates: aiCandidates, 
          limit 
        }
      );

      if (response.success && response.data) {
        console.log('✅ AI Service: Recommendations received successfully');
        
        // Convert AI response to enhanced format
        const enhancedResults: EnhancedMatchResult[] = response.data.recommendations.map((rec) => {
          const matchedPet = candidates.find(c => c.id === rec.matchedPetId);
          
          if (!matchedPet) {
            throw new Error(`Candidate pet ${rec.matchedPetId} not found`);
          }

          return {
            id: `ai-rec-${pet.id}-${rec.matchedPetId}`,
            matchedPetId: rec.matchedPetId,
            matchedPetName: matchedPet.name,
            matchedPetBreed: matchedPet.breed,
            matchedPetAge: matchedPet.age,
            matchedPetGender: matchedPet.gender,
            matchedPetImage: matchedPet.image,
            ownerName: matchedPet.owner.name,
            ownerRating: matchedPet.owner.rating,
            previousMatches: matchedPet.owner.totalMatches,
            score: {
              totalScore: rec.score,
              breedCompatibility: rec.breedCompatibility,
              ageCompatibility: rec.ageCompatibility,
              healthScore: rec.healthScore,
              geneticScore: rec.geneticScore,
              locationScore: 0, // Not provided by AI service, calculated separately
              historyScore: rec.contributions.history,
              factors: [
                {
                  category: 'Breed',
                  explanation: `${pet.breed} × ${matchedPet.breed} compatibility`,
                  sentiment: rec.breedCompatibility >= 75 ? 'positive' : rec.breedCompatibility >= 50 ? 'neutral' : 'negative',
                  weight: 25
                },
                {
                  category: 'Age',
                  explanation: `Age compatibility: ${pet.age} × ${matchedPet.age}`,
                  sentiment: rec.ageCompatibility >= 75 ? 'positive' : rec.ageCompatibility >= 50 ? 'neutral' : 'negative',
                  weight: 20
                },
                {
                  category: 'Health',
                  explanation: `Health score compatibility`,
                  sentiment: rec.healthScore >= 80 ? 'positive' : rec.healthScore >= 60 ? 'neutral' : 'negative',
                  weight: 20
                },
                {
                  category: 'Genetics',
                  explanation: `Genetic compatibility assessment`,
                  sentiment: rec.geneticScore >= 80 ? 'positive' : rec.geneticScore >= 60 ? 'neutral' : 'negative',
                  weight: 15
                },
                {
                  category: 'History',
                  explanation: `Breeding history compatibility`,
                  sentiment: rec.contributions.history >= 75 ? 'positive' : rec.contributions.history >= 50 ? 'neutral' : 'negative',
                  weight: 10
                }
              ]
            },
            recommendation: rec.explanation,
            distance: this.calculateDistance(pet.owner.address, matchedPet.owner.address),
            location: matchedPet.owner.address,
            probability: rec.score / 100
          };
        });

        return enhancedResults.sort((a, b) => b.score.totalScore - a.score.totalScore);
      } else {
        console.error('❌ AI Service: Recommendations failed:', response.error);
        return [];
      }
    } catch (error) {
      console.error('❌ AI Service: Error getting recommendations:', error);
      return [];
    }
  }

  /**
   * Calculate distance between two addresses (mock implementation)
   */
  private calculateDistance(address1: string, address2: string): number {
    const coords1 = this.extractCoordinates(address1);
    const coords2 = this.extractCoordinates(address2);

    // Simple distance calculation
    const distance = Math.sqrt(
      Math.pow(coords1.lat - coords2.lat, 2) + 
      Math.pow(coords1.lng - coords2.lng, 2)
    ) * 100; // Convert to km

    return Math.round(distance);
  }

  /**
   * Train the AI model with new data
   */
  async trainModel(pairs: Array<{ petA: Pet; petB: Pet; label: 0 | 1 }>): Promise<TrainingResponse | null> {
    try {
      console.log('🤖 AI Service: Training model with', pairs.length, 'samples');

      const aiPairs = pairs.map(pair => ({
        petA: this.convertToAIPet(pair.petA),
        petB: this.convertToAIPet(pair.petB),
        label: pair.label
      }));

      const response = await safePost<TrainingResponse>(
        `${this.baseUrl}/train`,
        { pairs: aiPairs }
      );

      if (response.success && response.data) {
        console.log('✅ AI Service: Model training completed');
        return response.data;
      } else {
        console.error('❌ AI Service: Model training failed:', response.error);
        return null;
      }
    } catch (error) {
      console.error('❌ AI Service: Error training model:', error);
      return null;
    }
  }

  /**
   * Check AI service health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await safeGet(`${this.baseUrl}/health`);
      return response.success;
    } catch (error) {
      console.error('❌ AI Service: Health check failed:', error);
      return false;
    }
  }

  /**
   * Get AI service status and statistics
   */
  async getStatus(): Promise<any> {
    try {
      const response = await safeGet(`${this.baseUrl}/status`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('❌ AI Service: Status check failed:', error);
      return null;
    }
  }
}

// Export singleton instance
export const aiMatchingService = new AIMatchingService();
