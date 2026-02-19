/**
 * Matchmaking Controller
 * Handles pet matching requests and calculations
 */

import { findMatches, calculateMatchScore } from '../utils/matchmaking.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * GET /api/matches/:petId
 * Find compatible matches for a specific pet
 */
export const findPetMatches = async (req, res) => {
  try {
    const { petId } = req.params;
    const {
      minAge,
      maxAge,
      minScore = 50,
      maxDistance,
      minDistance,
      limit = 20,
    } = req.query;

    // Get user's pet (in real implementation, fetch from database)
    // For now, assuming pet is passed or exists in system
    const userPet = await getPetById(petId);

    if (!userPet) {
      return errorResponse(res, 'Pet not found', 404);
    }

    // Validate pet is available for breeding
    if (userPet.breedingStatus !== 'AVAILABLE') {
      return errorResponse(
        res,
        'Pet is not available for breeding',
        400
      );
    }

    // Get all candidate pets
    const candidatePets = await getAllAvailablePets();

    // Build filter criteria
    const filters = {
      minAge: minAge ? parseInt(minAge) : undefined,
      maxAge: maxAge ? parseInt(maxAge) : undefined,
      maxDistance: maxDistance ? parseInt(maxDistance) : undefined,
      minDistance: minDistance ? parseInt(minDistance) : undefined,
    };

    // Find matches
    const matches = findMatches(userPet, candidatePets, filters);

    // Filter by minimum score
    const filteredMatches = matches.filter(
      (match) => match.score >= parseInt(minScore)
    );

    // Limit results
    const limitedMatches = filteredMatches.slice(0, parseInt(limit));

    // Format response
    const formattedMatches = limitedMatches.map((match) => ({
      petId: match.petId,
      petName: match.pet.name,
      species: match.pet.species,
      breed: match.pet.breed,
      gender: match.pet.gender,
      age: match.pet.age,
      matchScore: match.score,
      status: match.status,
      ownerName: match.owner?.firstName + ' ' + match.owner?.lastName,
      ownerEmail: match.owner?.email,
      ownerPhone: match.owner?.phone,
      location: match.owner && {
        latitude: match.owner.latitude,
        longitude: match.owner.longitude,
      },
      breakdown: match.breakdown,
      distance:
        userPet.owner && match.owner
          ? calculateDistance(
              userPet.owner.latitude,
              userPet.owner.longitude,
              match.owner.latitude,
              match.owner.longitude
            )
          : null,
    }));

    return successResponse(res, 'Matches found', {
      totalMatches: filteredMatches.length,
      displayedMatches: formattedMatches.length,
      matches: formattedMatches,
    });
  } catch (error) {
    console.error('Error finding matches:', error);
    return errorResponse(res, 'Failed to find matches', 500);
  }
};

/**
 * GET /api/matches/stats/:petId
 * Get detailed matching statistics for a pet
 */
export const getMatchStatistics = async (req, res) => {
  try {
    const { petId } = req.params;

    const userPet = await getPetById(petId);

    if (!userPet) {
      return errorResponse(res, 'Pet not found', 404);
    }

    const candidatePets = await getAllAvailablePets();
    const matches = findMatches(userPet, candidatePets);

    // Calculate statistics
    const stats = {
      totalCandidates: candidatePets.length,
      compatibleMatches: matches.length,
      byStatus: {
        excellent: matches.filter((m) => m.status === 'excellent').length,
        good: matches.filter((m) => m.status === 'good').length,
        fair: matches.filter((m) => m.status === 'fair').length,
        low: matches.filter((m) => m.status === 'low').length,
      },
      scoreDistribution: {
        90_100: matches.filter((m) => m.score >= 90).length,
        80_89: matches.filter((m) => m.score >= 80 && m.score < 90).length,
        70_79: matches.filter((m) => m.score >= 70 && m.score < 80).length,
        60_69: matches.filter((m) => m.score >= 60 && m.score < 70).length,
        50_59: matches.filter((m) => m.score >= 50 && m.score < 60).length,
        below_50: matches.filter((m) => m.score < 50).length,
      },
      averageScore:
        matches.length > 0
          ? Math.round(
              matches.reduce((sum, m) => sum + m.score, 0) / matches.length
            )
          : 0,
      topMatches: matches.slice(0, 5).map((m) => ({
        petId: m.petId,
        petName: m.pet.name,
        score: m.score,
        status: m.status,
      })),
    };

    return successResponse(res, 'Match statistics retrieved', stats);
  } catch (error) {
    console.error('Error getting match statistics:', error);
    return errorResponse(res, 'Failed to retrieve statistics', 500);
  }
};

/**
 * POST /api/matches/calculate
 * Manually calculate match score between two pets
 */
export const calculatePetMatch = async (req, res) => {
  try {
    const { petId1, petId2 } = req.body;

    if (!petId1 || !petId2) {
      return errorResponse(res, 'Both pet IDs are required', 400);
    }

    if (petId1 === petId2) {
      return errorResponse(res, 'Cannot match a pet with itself', 400);
    }

    const pet1 = await getPetById(petId1);
    const pet2 = await getPetById(petId2);

    if (!pet1 || !pet2) {
      return errorResponse(res, 'One or both pets not found', 404);
    }

    const matchResult = calculateMatchScore(pet1, pet2);

    return successResponse(res, 'Match score calculated', {
      pet1Id: petId1,
      pet1Name: pet1.name,
      pet2Id: petId2,
      pet2Name: pet2.name,
      ...matchResult,
    });
  } catch (error) {
    console.error('Error calculating match score:', error);
    return errorResponse(res, 'Failed to calculate match score', 500);
  }
};

/**
 * Helper: Get pet by ID
 * In real implementation, this would query the database
 */
async function getPetById(petId) {
  // TODO: Implement database query
  // For now, this is a placeholder
  return null;
}

/**
 * Helper: Get all available pets
 * In real implementation, this would query the database
 */
async function getAllAvailablePets() {
  // TODO: Implement database query
  // For now, this returns empty array
  return [];
}

/**
 * Helper: Calculate distance
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}


