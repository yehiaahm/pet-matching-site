/**
 * Pet Breeding Platform Backend with GPS-based AI Matching
 * Real Express server with location-based matching using Haversine formula
 */

import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock pet database with GPS coordinates
const pets = [
  {
    id: 'pet-1',
    name: 'Max',
    type: 'dog',
    breed: 'Golden Retriever',
    age: 3,
    gender: 'male',
    latitude: 30.0444,
    longitude: 31.2357,
    owner: {
      name: 'Ahmed Mohamed',
      rating: 4.8,
      verified: true
    },
    images: ['https://images.unsplash.com/photo-1633722715463-d30f4f325e24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkZW4lMjByZXRyaWV2ZXJ8ZW58MXx8fHwxNzY2NjY1NzMxfDA&ixlib=rb-4.1.0&q=80&w=1080'],
    description: 'Purebred Golden Retriever, fully vaccinated, excellent health, and calm temperament.',
    verified: true
  },
  {
    id: 'pet-2',
    name: 'Luna',
    type: 'dog',
    breed: 'Golden Retriever',
    age: 2,
    gender: 'female',
    latitude: 30.0626,
    longitude: 31.2497,
    owner: {
      name: 'Sarah Johnson',
      rating: 4.9,
      verified: true
    },
    images: ['https://images.unsplash.com/photo-1552053831-71594a27632d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fHwxNzY2NjY1NzMxfDA&ixlib=rb-4.1.0&q=80&w=1080'],
    description: 'Beautiful Golden Retriever with champion bloodline.',
    verified: true
  },
  {
    id: 'pet-3',
    name: 'Bella',
    type: 'cat',
    breed: 'Persian',
    age: 4,
    gender: 'female',
    latitude: 30.0478,
    longitude: 31.2345,
    owner: {
      name: 'Nora Ibrahim',
      rating: 4.6,
      verified: true
    },
    images: ['https://images.unsplash.com/photo-1585137173132-cf49e10ad27d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fHwxNzY2NjY1NzMxfDA&ixlib=rb-4.1.0&q=80&w=1080'],
    description: 'Elegant Persian cat with excellent temperament.',
    verified: true
  },
  {
    id: 'pet-4',
    name: 'Charlie',
    type: 'dog',
    breed: 'German Shepherd',
    age: 5,
    gender: 'male',
    latitude: 30.0589,
    longitude: 31.2213,
    owner: {
      name: 'Mohamed Said',
      rating: 4.7,
      verified: true
    },
    images: ['https://images.unsplash.com/photo-1605725657590-b2cf0b31b1a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fHwxNzY2NjY1NzMxfDA&ixlib=rb-4.1.0&q=80&w=1080'],
    description: 'Strong and healthy German Shepherd.',
    verified: true
  },
  {
    id: 'pet-5',
    name: 'Mittens',
    type: 'cat',
    breed: 'Siamese',
    age: 2,
    gender: 'male',
    latitude: 30.0406,
    longitude: 31.2176,
    owner: {
      name: 'Mahmoud Khaled',
      rating: 4.8,
      verified: true
    },
    images: ['https://images.unsplash.com/photo-1568152950566-c1bf43f4ab28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx8fHwxNzY2NjY1NzMxfDA&ixlib=rb-4.1.0&q=80&w=1080'],
    description: 'Playful Siamese cat with great health.',
    verified: true
  }
];

/**
 * Haversine formula to calculate distance between two GPS coordinates
 * Returns distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
}

/**
 * Calculate breed similarity score (0-100)
 */
function calculateBreedSimilarity(breed1, breed2) {
  if (breed1.toLowerCase() === breed2.toLowerCase()) {
    return 100; // Perfect match
  }
  
  // Similar breeds mapping
  const similarBreeds = {
    'golden retriever': ['labrador', 'chow chow', 'bulldog'],
    'persian': ['maine coon', 'ragdoll', 'british shorthair'],
    'german shepherd': ['belgian malinois', 'rottweiler', 'doberman'],
    'siamese': ['bengal', 'abyssinian', 'oriental']
  };
  
  const similar = similarBreeds[breed1.toLowerCase()] || [];
  if (similar.some(b => b.toLowerCase() === breed2.toLowerCase())) {
    return 70; // Similar breed
  }
  
  return 30; // Different breed
}

/**
 * Calculate age compatibility score (0-100)
 */
function calculateAgeCompatibility(age1, age2) {
  const ageDiff = Math.abs(age1 - age2);
  if (ageDiff === 0) return 100;
  if (ageDiff <= 1) return 90;
  if (ageDiff <= 2) return 75;
  if (ageDiff <= 3) return 60;
  if (ageDiff <= 5) return 40;
  return 20;
}

/**
 * Calculate gender compatibility score (0-100)
 */
function calculateGenderCompatibility(gender1, gender2) {
  if (gender1 === gender2) return 50; // Same gender - neutral score
  return 100; // Different gender - optimal for breeding
}

/**
 * Calculate location proximity score (0-100)
 * Closer distance = higher score
 */
function calculateLocationScore(distance) {
  if (distance <= 1) return 100; // Within 1km
  if (distance <= 5) return 90;  // Within 5km
  if (distance <= 10) return 80; // Within 10km
  if (distance <= 25) return 60; // Within 25km
  if (distance <= 50) return 40; // Within 50km
  return 20; // Far away
}

/**
 * Generate human-readable match reason
 */
function generateMatchReason(breedScore, ageScore, genderScore, locationScore, distance) {
  const reasons = [];
  
  if (breedScore >= 100) reasons.push('Same breed');
  else if (breedScore >= 70) reasons.push('Similar breed');
  
  if (ageScore >= 90) reasons.push('Similar age');
  else if (ageScore >= 75) reasons.push('Compatible age');
  
  if (genderScore === 100) reasons.push('Opposite gender');
  
  if (locationScore >= 90) reasons.push('Very close');
  else if (locationScore >= 80) reasons.push('Nearby');
  else if (locationScore >= 60) reasons.push('Local');
  
  return reasons.join(', ') + ` (${distance.toFixed(1)} km away)`;
}

/**
 * AI Matching Algorithm
 * Calculates comprehensive match score based on multiple factors
 */
function calculateMatchScore(userPet, candidatePet, userLat, userLon) {
  const distance = calculateDistance(userLat, userLon, candidatePet.latitude, candidatePet.longitude);
  
  const breedScore = calculateBreedSimilarity(userPet.breed, candidatePet.breed);
  const ageScore = calculateAgeCompatibility(userPet.age, candidatePet.age);
  const genderScore = calculateGenderCompatibility(userPet.gender, candidatePet.gender);
  const locationScore = calculateLocationScore(distance);
  
  // Weighted scoring (adjust weights as needed)
  const weights = {
    breed: 0.3,
    age: 0.2,
    gender: 0.2,
    location: 0.3
  };
  
  const totalScore = Math.round(
    breedScore * weights.breed +
    ageScore * weights.age +
    genderScore * weights.gender +
    locationScore * weights.location
  );
  
  const matchReason = generateMatchReason(breedScore, ageScore, genderScore, locationScore, distance);
  
  return {
    pet: candidatePet,
    distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
    matchScore: Math.min(100, Math.max(0, totalScore)),
    matchReason,
    breakdown: {
      breed: Math.round(breedScore),
      age: Math.round(ageScore),
      gender: Math.round(genderScore),
      location: Math.round(locationScore)
    }
  };
}

/**
 * API Routes
 */

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'PetMate GPS Matching Server is running',
    timestamp: new Date().toISOString()
  });
});

// Get all pets
app.get('/api/pets', (req, res) => {
  res.json({
    success: true,
    data: pets,
    count: pets.length
  });
});

// AI Matching Endpoint
app.post('/api/ai/matches', (req, res) => {
  try {
    const { 
      userPet, 
      userLatitude, 
      userLongitude, 
      maxDistance = 50,
      limit = 10 
    } = req.body;
    
    // Validate required fields
    if (!userPet || !userLatitude || !userLongitude) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userPet, userLatitude, userLongitude'
      });
    }
    
    console.log(`🤖 AI Matching request for ${userPet.name} at (${userLatitude}, ${userLongitude})`);
    
    // Calculate matches for all pets except the user's pet
    const matches = pets
      .filter(pet => pet.id !== userPet.id)
      .map(pet => calculateMatchScore(userPet, pet, userLatitude, userLongitude))
      .filter(match => match.distance <= maxDistance)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
    
    console.log(`✅ Found ${matches.length} matches within ${maxDistance}km`);
    
    res.json({
      success: true,
      data: {
        matches,
        searchParams: {
          userLocation: { latitude: userLatitude, longitude: userLongitude },
          maxDistance,
          totalCandidates: pets.length - 1,
          qualifiedMatches: matches.length
        }
      }
    });
    
  } catch (error) {
    console.error('❌ AI Matching error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during matching'
    });
  }
});

// Analytics Endpoint
app.get('/api/analytics', (req, res) => {
  try {
    const totalPets = pets.length;
    const verifiedPets = pets.filter(p => p.verified).length;
    const averageRating = pets.reduce((sum, p) => sum + p.owner.rating, 0) / pets.length;
    
    // Calculate average distance between all pets
    let totalDistance = 0;
    let distanceCount = 0;
    
    for (let i = 0; i < pets.length; i++) {
      for (let j = i + 1; j < pets.length; j++) {
        totalDistance += calculateDistance(
          pets[i].latitude, pets[i].longitude,
          pets[j].latitude, pets[j].longitude
        );
        distanceCount++;
      }
    }
    
    const averageDistance = distanceCount > 0 ? totalDistance / distanceCount : 0;
    
    res.json({
      success: true,
      data: {
        totalPets,
        verifiedPets,
        verificationRate: Math.round((verifiedPets / totalPets) * 100),
        averageRating: Math.round(averageRating * 10) / 10,
        averageDistance: Math.round(averageDistance * 10) / 10,
        nearbyMatches: Math.round(pets.filter(p => p.latitude >= 29.9 && p.latitude <= 30.2 && p.longitude >= 31.1 && p.longitude <= 31.3).length),
        successRate: 87, // Mock success rate
        lastUpdated: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
});

// Mock authentication endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'test@petmate.com' && password === 'test123') {
    res.json({
      success: true,
      data: {
        user: {
          id: 'user-1',
          email: 'test@petmate.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'USER'
        },
        accessToken: 'mock-jwt-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now()
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  res.status(201).json({
    success: true,
    data: {
      user: {
        id: 'user-' + Date.now(),
        email,
        firstName,
        lastName,
        role: 'USER'
      },
      accessToken: 'mock-jwt-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now()
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PetMate GPS Server running on http://localhost:${PORT}`);
  console.log(`📍 GPS-based AI Matching enabled`);
  console.log(`📊 Analytics endpoint: http://localhost:${PORT}/api/analytics`);
  console.log(`🤖 AI Matching endpoint: http://localhost:${PORT}/api/ai/matches`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
