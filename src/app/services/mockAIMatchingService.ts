/**
 * Mock AI Matching Service
 * Smart pet breeding matching algorithm with explainable scores
 */

import { Pet } from '../App';

export interface MatchScore {
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
}

export interface MatchRecommendation {
  id: string;
  matchedPetId: string;
  matchedPetName: string;
  matchedPetBreed: string;
  matchedPetAge: number;
  matchedPetGender: 'male' | 'female';
  ownerName: string;
  ownerRating: number;
  previousMatches: number;
  score: MatchScore;
  recommendation: string;
  distance: number;
  location: string;
}

// Mock pet database for matching
const mockPetsDatabase: Pet[] = [
  {
    id: 'mock-1',
    name: 'Bella',
    type: 'dog',
    breed: 'Golden Retriever',
    age: 2,
    gender: 'female',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkZW4lMjByZXRyaWV2ZXJ8ZW58MXx8fHwxNzY2NjY1NzMxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    owner: {
      name: 'Sarah Johnson',
      nationalId: '29101******02',
      phone: '0120*******',
      address: 'Cairo - Zamalek',
      rating: 4.9,
      totalMatches: 8,
      verified: true
    },
    vaccinations: [
      { name: 'Rabies', date: '2024-06-15', nextDue: '2025-06-15' },
      { name: 'Parvovirus', date: '2024-06-15', nextDue: '2025-06-15' }
    ],
    healthCheck: {
      date: '2024-12-01',
      veterinarian: 'Dr. Mohamed Ali - Pet Care Clinic',
      certificate: 'HC-2024-002345'
    },
    availability: {
      from: '2025-01-01',
      to: '2025-06-30'
    },
    description: 'Beautiful Golden Retriever with excellent bloodline',
    verified: true
  },
  {
    id: 'mock-2',
    name: 'Rocky',
    type: 'dog',
    breed: 'German Shepherd',
    age: 3,
    gender: 'male',
    image: 'https://images.unsplash.com/photo-1605725657590-b2cf0d31b1a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnZXJtYW4lMjBzaGVwaGVyZHxlbnwxfHx8fDE3NjY2MzU3NDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    owner: {
      name: 'Ahmed Hassan',
      nationalId: '28905******04',
      phone: '0111*******',
      address: 'Giza - Dokki',
      rating: 4.7,
      totalMatches: 12,
      verified: true
    },
    vaccinations: [
      { name: 'Rabies', date: '2024-05-10', nextDue: '2025-05-10' },
      { name: 'Hepatitis', date: '2024-05-10', nextDue: '2025-05-10' }
    ],
    healthCheck: {
      date: '2024-11-15',
      veterinarian: 'Dr. Laila Nasser - Animal Hospital',
      certificate: 'HC-2024-007890'
    },
    availability: {
      from: '2025-02-01',
      to: '2025-07-31'
    },
    description: 'Strong German Shepherd with champion bloodline',
    verified: true
  },
  {
    id: 'mock-3',
    name: 'Luna',
    type: 'cat',
    breed: 'Persian',
    age: 2,
    gender: 'female',
    image: 'https://images.unsplash.com/photo-1585137173132-cf49e10ad27d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzaWFuJTIwY2F0fGVufDF8fHx8MTc2NjU1NDI5OXww&ixlib=rb-4.1.0&q=80&w=1080',
    owner: {
      name: 'Nora Ibrahim',
      nationalId: '29407******05',
      phone: '0122*******',
      address: 'Alexandria - Smouha',
      rating: 5.0,
      totalMatches: 6,
      verified: true
    },
    vaccinations: [
      { name: 'Rabies', date: '2024-08-05', nextDue: '2025-08-05' },
      { name: 'Panleukopenia', date: '2024-08-05', nextDue: '2025-08-05' }
    ],
    healthCheck: {
      date: '2024-12-10',
      veterinarian: 'Dr. Hany Ramadan - Alexandria Vet Center',
      certificate: 'HC-2024-011234'
    },
    availability: {
      from: '2025-01-15',
      to: '2025-05-15'
    },
    description: 'Purebred Persian cat with championship lineage',
    verified: true
  },
  {
    id: 'mock-4',
    name: 'Charlie',
    type: 'dog',
    breed: 'Labrador',
    age: 4,
    gender: 'male',
    image: 'https://images.unsplash.com/photo-1583337134409-60d4326b91c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYWJyYWRvciUyMHJldHJpZXZlcnxlbnwxfHx8fDE3NjY2NTUyODN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    owner: {
      name: 'Mohamed Said',
      nationalId: '29012******06',
      phone: '0155*******',
      address: 'Cairo - Nasr City',
      rating: 4.8,
      totalMatches: 10,
      verified: true
    },
    vaccinations: [
      { name: 'Rabies', date: '2024-07-20', nextDue: '2025-07-20' },
      { name: 'Distemper', date: '2024-07-20', nextDue: '2025-07-20' }
    ],
    healthCheck: {
      date: '2024-11-20',
      veterinarian: 'Dr. Amal Farouk - Al Amal Clinic',
      certificate: 'HC-2024-009876'
    },
    availability: {
      from: '2025-01-10',
      to: '2025-04-10'
    },
    description: 'Friendly Labrador with excellent temperament',
    verified: true
  },
  {
    id: 'mock-5',
    name: 'Mittens',
    type: 'cat',
    breed: 'Siamese',
    age: 3,
    gender: 'male',
    image: 'https://images.unsplash.com/photo-1568152950566-c1bf43f4ab28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWFtZXNlJTIwY2F0fGVufDF8fHx8MTc2NjY1MzAxNXww&ixlib=rb-4.1.0&q=80&w=1080',
    owner: {
      name: 'Fatma Hassan',
      nationalId: '29203******07',
      phone: '0100*******',
      address: 'Giza - Mohandessin',
      rating: 4.6,
      totalMatches: 7,
      verified: true
    },
    vaccinations: [
      { name: 'Rabies', date: '2024-09-01', nextDue: '2025-09-01' },
      { name: 'Calicivirus', date: '2024-09-01', nextDue: '2025-09-01' }
    ],
    healthCheck: {
      date: '2024-12-05',
      veterinarian: 'Dr. Sarah Ali - Al Rahma Vet Clinic',
      certificate: 'HC-2024-013456'
    },
    availability: {
      from: '2025-02-15',
      to: '2025-06-15'
    },
    description: 'Elegant Siamese cat with striking blue eyes',
    verified: true
  }
];

class MockAIMatchingService {
  private calculateBreedCompatibility(breed1: string, breed2: string, type: string): { score: number; explanation: string } {
    // Same breed = perfect compatibility
    if (breed1.toLowerCase() === breed2.toLowerCase()) {
      return {
        score: 95,
        explanation: `Same breed (${breed1}) ensures consistent traits and characteristics`
      };
    }

    // Same species but different breeds
    const compatibleBreeds: Record<string, string[]> = {
      dog: ['Golden Retriever', 'Labrador', 'German Shepherd'],
      cat: ['Persian', 'Siamese', 'Maine Coon'],
      bird: ['African Grey Parrot', 'Cockatiel', 'Budgerigar']
    };

    const breedGroup = compatibleBreeds[type];
    if (breedGroup && breedGroup.includes(breed1) && breedGroup.includes(breed2)) {
      return {
        score: 75,
        explanation: `Compatible breeds (${breed1} × ${breed2}) with similar characteristics`
      };
    }

    return {
      score: 50,
      explanation: `Different breeds (${breed1} × ${breed2}) - mixed breeding characteristics`
    };
  }

  private calculateAgeCompatibility(age1: number, age2: number): { score: number; explanation: string } {
    const ageDiff = Math.abs(age1 - age2);
    
    if (ageDiff <= 1) {
      return {
        score: 90,
        explanation: `Similar ages (${age1} and ${age2} years) - optimal breeding timing`
      };
    } else if (ageDiff <= 3) {
      return {
        score: 75,
        explanation: `Reasonable age difference (${ageDiff} years) - compatible breeding window`
      };
    } else if (ageDiff <= 5) {
      return {
        score: 60,
        explanation: `Moderate age difference (${ageDiff} years) - acceptable breeding range`
      };
    } else {
      return {
        score: 30,
        explanation: `Significant age difference (${ageDiff} years) - less ideal for breeding`
      };
    }
  }

  private calculateHealthScore(pet1: Pet, pet2: Pet): { score: number; explanation: string } {
    let score = 80; // Base score
    const factors: string[] = [];

    // Check vaccination completeness
    const pet1Vaccines = pet1.vaccinations.length;
    const pet2Vaccines = pet2.vaccinations.length;
    
    if (pet1Vaccines >= 3 && pet2Vaccines >= 3) {
      score += 10;
      factors.push('Both pets have complete vaccination records');
    } else if (pet1Vaccines >= 2 && pet2Vaccines >= 2) {
      score += 5;
      factors.push('Both pets have adequate vaccination coverage');
    } else {
      score -= 10;
      factors.push('One or both pets need more vaccinations');
    }

    // Check health check recency
    const pet1HealthCheck = new Date(pet1.healthCheck.date);
    const pet2HealthCheck = new Date(pet2.healthCheck.date);
    const monthsSinceCheck1 = (Date.now() - pet1HealthCheck.getTime()) / (1000 * 60 * 60 * 24 * 30);
    const monthsSinceCheck2 = (Date.now() - pet2HealthCheck.getTime()) / (1000 * 60 * 60 * 24 * 30);

    if (monthsSinceCheck1 <= 6 && monthsSinceCheck2 <= 6) {
      score += 10;
      factors.push('Recent health checks for both pets');
    } else if (monthsSinceCheck1 <= 12 && monthsSinceCheck2 <= 12) {
      score += 5;
      factors.push('Health checks within last year');
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      explanation: factors.join('. ') || 'Standard health assessment'
    };
  }

  private calculateGeneticScore(pet1: Pet, pet2: Pet): { score: number; explanation: string } {
    // Mock genetic scoring based on breed characteristics
    const breedGenetics: Record<string, { diversity: number; health: number }> = {
      'Golden Retriever': { diversity: 85, health: 90 },
      'German Shepherd': { diversity: 80, health: 85 },
      'Labrador': { diversity: 85, health: 90 },
      'Persian': { diversity: 75, health: 80 },
      'Siamese': { diversity: 80, health: 85 },
      'African Grey Parrot': { diversity: 90, health: 95 }
    };

    const genetics1 = breedGenetics[pet1.breed] || { diversity: 70, health: 75 };
    const genetics2 = breedGenetics[pet2.breed] || { diversity: 70, health: 75 };

    const avgDiversity = (genetics1.diversity + genetics2.diversity) / 2;
    const avgHealth = (genetics1.health + genetics2.health) / 2;
    
    const score = (avgDiversity * 0.6) + (avgHealth * 0.4);

    return {
      score: Math.round(score),
      explanation: `Genetic compatibility based on ${pet1.breed} and ${pet2.breed} breed characteristics`
    };
  }

  private calculateLocationScore(loc1: string, loc2: string): { score: number; explanation: string; distance: number } {
    // Mock distance calculation based on locations
    const locations: Record<string, { lat: number; lng: number }> = {
      'Cairo - Maadi': { lat: 30.0, lng: 31.3 },
      'Cairo - Zamalek': { lat: 30.1, lng: 31.2 },
      'Cairo - Nasr City': { lat: 30.1, lng: 31.4 },
      'Giza - Dokki': { lat: 30.0, lng: 31.2 },
      'Giza - Mohandessin': { lat: 30.1, lng: 31.2 },
      'Alexandria - Smouha': { lat: 31.2, lng: 29.9 }
    };

    const coords1 = locations[loc1] || { lat: 30.0, lng: 31.3 };
    const coords2 = locations[loc2] || { lat: 30.0, lng: 31.3 };

    // Simple distance calculation
    const distance = Math.sqrt(
      Math.pow(coords1.lat - coords2.lat, 2) + 
      Math.pow(coords1.lng - coords2.lng, 2)
    ) * 100; // Convert to km

    let score = 100;
    if (distance > 50) score = 40;
    else if (distance > 20) score = 60;
    else if (distance > 10) score = 80;
    else if (distance > 5) score = 90;

    return {
      score,
      explanation: distance <= 10 ? 'Very close location' : distance <= 20 ? 'Reasonable distance' : 'Longer distance',
      distance: Math.round(distance)
    };
  }

  private calculateHistoryScore(owner1: any, owner2: any): { score: number; explanation: string } {
    const totalMatches = owner1.totalMatches + owner2.totalMatches;
    const avgRating = (owner1.rating + owner2.rating) / 2;

    let score = 50;
    const factors: string[] = [];

    if (totalMatches >= 10) {
      score += 25;
      factors.push('Both owners have extensive breeding experience');
    } else if (totalMatches >= 5) {
      score += 15;
      factors.push('Both owners have good breeding experience');
    } else if (totalMatches >= 2) {
      score += 10;
      factors.push('Owners have some breeding experience');
    }

    if (avgRating >= 4.8) {
      score += 25;
      factors.push('Excellent owner ratings');
    } else if (avgRating >= 4.5) {
      score += 15;
      factors.push('Good owner ratings');
    } else if (avgRating >= 4.0) {
      score += 10;
      factors.push('Decent owner ratings');
    }

    return {
      score: Math.min(100, score),
      explanation: factors.join('. ') || 'Standard owner history'
    };
  }

  private generateRecommendation(score: MatchScore, pet1: Pet, pet2: Pet): string {
    if (score.totalScore >= 85) {
      return `Excellent match! ${pet1.breed} × ${pet2.breed} pairing with high compatibility across all factors. Both pets have great health records and the owners have proven experience.`;
    } else if (score.totalScore >= 70) {
      return `Good match potential between ${pet1.breed} and ${pet2.breed}. Compatible characteristics with solid health backgrounds. Consider discussing breeding goals with the owner.`;
    } else {
      return `Moderate compatibility. While ${pet1.breed} × ${pet2.breed} can work, review the specific factors below and ensure both pets meet your breeding criteria.`;
    }
  }

  async getRecommendations(petId: string, limit: number = 5): Promise<MatchRecommendation[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

    // Find the target pet (in real app, this would come from database)
    const targetPet = mockPetsDatabase.find(p => p.id === petId) || mockPetsDatabase[0];
    
    // Get potential matches (exclude same pet)
    const potentialMatches = mockPetsDatabase.filter(p => p.id !== petId && p.type === targetPet.type);
    
    // Calculate scores for each potential match
    const recommendations: MatchRecommendation[] = potentialMatches.map(matchPet => {
      const breedComp = this.calculateBreedCompatibility(targetPet.breed, matchPet.breed, targetPet.type);
      const ageComp = this.calculateAgeCompatibility(targetPet.age, matchPet.age);
      const healthComp = this.calculateHealthScore(targetPet, matchPet);
      const geneticComp = this.calculateGeneticScore(targetPet, matchPet);
      const locationComp = this.calculateLocationScore(targetPet.owner.address, matchPet.owner.address);
      const historyComp = this.calculateHistoryScore(targetPet.owner, matchPet.owner);

      // Calculate weighted total score
      const totalScore = Math.round(
        breedComp.score * 0.25 +
        ageComp.score * 0.20 +
        healthComp.score * 0.20 +
        geneticComp.score * 0.15 +
        locationComp.score * 0.10 +
        historyComp.score * 0.10
      );

      const score: MatchScore = {
        totalScore,
        breedCompatibility: breedComp.score,
        ageCompatibility: ageComp.score,
        healthScore: healthComp.score,
        geneticScore: geneticComp.score,
        locationScore: locationComp.score,
        historyScore: historyComp.score,
        factors: [
          {
            category: 'Breed',
            explanation: breedComp.explanation,
            sentiment: breedComp.score >= 75 ? 'positive' : breedComp.score >= 50 ? 'neutral' : 'negative',
            weight: 25
          },
          {
            category: 'Age',
            explanation: ageComp.explanation,
            sentiment: ageComp.score >= 75 ? 'positive' : ageComp.score >= 60 ? 'neutral' : 'negative',
            weight: 20
          },
          {
            category: 'Health',
            explanation: healthComp.explanation,
            sentiment: healthComp.score >= 80 ? 'positive' : healthComp.score >= 60 ? 'neutral' : 'negative',
            weight: 20
          },
          {
            category: 'Genetics',
            explanation: geneticComp.explanation,
            sentiment: geneticComp.score >= 80 ? 'positive' : geneticComp.score >= 60 ? 'neutral' : 'negative',
            weight: 15
          },
          {
            category: 'Location',
            explanation: locationComp.explanation,
            sentiment: locationComp.score >= 80 ? 'positive' : locationComp.score >= 60 ? 'neutral' : 'negative',
            weight: 10
          },
          {
            category: 'History',
            explanation: historyComp.explanation,
            sentiment: historyComp.score >= 75 ? 'positive' : historyComp.score >= 50 ? 'neutral' : 'negative',
            weight: 10
          }
        ]
      };

      return {
        id: `rec-${targetPet.id}-${matchPet.id}`,
        matchedPetId: matchPet.id,
        matchedPetName: matchPet.name,
        matchedPetBreed: matchPet.breed,
        matchedPetAge: matchPet.age,
        matchedPetGender: matchPet.gender,
        ownerName: matchPet.owner.name,
        ownerRating: matchPet.owner.rating,
        previousMatches: matchPet.owner.totalMatches,
        score,
        recommendation: this.generateRecommendation(score, targetPet, matchPet),
        distance: locationComp.distance,
        location: matchPet.owner.address
      };
    });

    // Sort by total score and return top matches
    return recommendations
      .sort((a, b) => b.score.totalScore - a.score.totalScore)
      .slice(0, limit);
  }

  async calculateMatchScore(petAId: string, petBId: string): Promise<MatchScore | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const petA = mockPetsDatabase.find(p => p.id === petAId);
    const petB = mockPetsDatabase.find(p => p.id === petBId);

    if (!petA || !petB) return null;

    const breedComp = this.calculateBreedCompatibility(petA.breed, petB.breed, petA.type);
    const ageComp = this.calculateAgeCompatibility(petA.age, petB.age);
    const healthComp = this.calculateHealthScore(petA, petB);
    const geneticComp = this.calculateGeneticScore(petA, petB);
    const locationComp = this.calculateLocationScore(petA.owner.address, petB.owner.address);
    const historyComp = this.calculateHistoryScore(petA.owner, petB.owner);

    const totalScore = Math.round(
      breedComp.score * 0.25 +
      ageComp.score * 0.20 +
      healthComp.score * 0.20 +
      geneticComp.score * 0.15 +
      locationComp.score * 0.10 +
      historyComp.score * 0.10
    );

    return {
      totalScore,
      breedCompatibility: breedComp.score,
      ageCompatibility: ageComp.score,
      healthScore: healthComp.score,
      geneticScore: geneticComp.score,
      locationScore: locationComp.score,
      historyScore: historyComp.score,
      factors: []
    };
  }
}

export const mockAIMatchingService = new MockAIMatchingService();
