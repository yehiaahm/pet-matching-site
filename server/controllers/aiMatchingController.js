/**
 * AI Matching Controller
 * Handles intelligent pet matching recommendations
 */

import { successResponse, errorResponse } from '../utils/response.js';
import config from '../config/index.js';

const callAIService = async (path, body) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.aiService.timeoutMs);
  try {
    const res = await fetch(`${config.aiService.url}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI service error ${res.status}: ${text}`);
    }
    return await res.json();
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
};

/**
 * GET /api/v1/matches/recommendations/:petId
 * Get AI-powered match recommendations for a specific pet
 * 
 * Query params:
 * - limit: number of recommendations (default: 5, max: 20)
 * - radius: search radius in km (default: 100)
 */
export const getMatchRecommendations = async (req, res) => {
  try {
    const { petId } = req.params;
    const { limit = 5, radius = 100 } = req.query;

    console.log(`📊 Getting match recommendations for pet ${petId}`);

    // Validation
    if (!petId) {
      return errorResponse(res, 'Pet ID is required', 400);
    }

    // TODO: Load pet and candidate pets from DB; for now use minimal stub
    const pet = {
      id: petId,
      species: 'dog',
      breed: 'Golden Retriever',
      gender: 'MALE',
      age: 3,
      health_score: 85,
      genetic_risk: 0.2,
      temperament: 'active',
      breeding_history_count: 2,
    };
    const candidates = [
      {
        id: 'pet-456', species: 'dog', breed: 'Golden Retriever', gender: 'FEMALE', age: 3,
        health_score: 88, genetic_risk: 0.15, temperament: 'calm', breeding_history_count: 1,
      },
      {
        id: 'pet-789', species: 'dog', breed: 'Labrador', gender: 'FEMALE', age: 4,
        health_score: 82, genetic_risk: 0.22, temperament: 'active', breeding_history_count: 3,
      },
    ];

    try {
      const aiRes = await callAIService('/recommendations', { pet, candidates, limit: Number(limit) });
      return successResponse(res, 'Match recommendations retrieved', {
        petId,
        timestamp: new Date().toISOString(),
        recommendations: aiRes.recommendations,
        explanation: 'AI-driven recommendations based on engineered features',
        nextUpdateIn: 24 * 60 * 60 * 1000,
      }, 200);
    } catch (err) {
      console.warn('AI service unavailable, falling back to mock:', err.message);
      return errorResponse(res, 'AI service unavailable', 503);
    }
  } catch (error) {
    console.error('❌ Error getting recommendations:', error);
    return errorResponse(res, 'Failed to get match recommendations', 500);
  }
};

/**
 * POST /api/v1/matches/calculate-score
 * Calculate detailed match score between two specific pets
 * 
 * Body:
 * {
 *   petAId: string;
 *   petBId: string;
 * }
 */
export const calculateMatchScore = async (req, res) => {
  try {
    const { petAId, petBId } = req.body;

    console.log(`📊 Calculating match score between ${petAId} and ${petBId}`);

    if (!petAId || !petBId) {
      return errorResponse(res, 'Both pet IDs are required', 400);
    }

    if (petAId === petBId) {
      return errorResponse(res, 'Cannot match a pet with itself', 400);
    }

    // TODO: Fetch pets by ID from DB; using stubs
    const petA = { id: petAId, species: 'dog', breed: 'Golden Retriever', gender: 'MALE', age: 3, health_score: 85, genetic_risk: 0.2, temperament: 'active', breeding_history_count: 2 };
    const petB = { id: petBId, species: 'dog', breed: 'Golden Retriever', gender: 'FEMALE', age: 3, health_score: 90, genetic_risk: 0.12, temperament: 'calm', breeding_history_count: 1 };

    try {
      const aiRes = await callAIService('/match-score', { petA, petB });
      const matchScore = {
        petAId,
        petBId,
        timestamp: aiRes.timestamp,
        score: {
          totalScore: Math.round(aiRes.score),
          breedCompatibility: Math.round(aiRes.contributions.breed * 100) / 100,
          ageCompatibility: Math.round(aiRes.contributions.age * 100) / 100,
          healthScore: Math.round(aiRes.contributions.health * 100) / 100,
          geneticScore: Math.round(aiRes.contributions.genetics * 100) / 100,
          locationScore: 0,
          historyScore: Math.round(aiRes.contributions.history * 100) / 100,
          factors: [
            { category: 'Breed', score: aiRes.contributions.breed, weight: 0.2, explanation: 'Breed compatibility contribution', sentiment: 'positive' },
            { category: 'Age', score: aiRes.contributions.age, weight: 0.15, explanation: 'Age compatibility contribution', sentiment: 'positive' },
            { category: 'Health', score: aiRes.contributions.health, weight: 0.25, explanation: 'Health status contribution', sentiment: 'positive' },
            { category: 'Genetics', score: aiRes.contributions.genetics, weight: 0.15, explanation: 'Genetic risk contribution', sentiment: 'neutral' },
            { category: 'History', score: aiRes.contributions.history, weight: 0.1, explanation: 'Breeding history contribution', sentiment: 'neutral' },
          ],
        },
        recommendedAction: aiRes.score >= 75 ? 'Proceed with breeding request' : 'Consider alternative matches',
        confidence: aiRes.probability >= 0.8 ? 'High' : aiRes.probability >= 0.6 ? 'Medium' : 'Low',
        explanation: aiRes.explanation,
      };
      return successResponse(res, 'Match score calculated', matchScore, 200);
    } catch (err) {
      console.warn('AI service unavailable, using heuristic fallback:', err.message);
      return errorResponse(res, 'AI service unavailable', 503);
    }
  } catch (error) {
    console.error('❌ Error calculating match score:', error);
    return errorResponse(res, 'Failed to calculate match score', 500);
  }
};

/**
 * GET /api/v1/matches/search
 * Search for compatible pets with filtering and pagination
 * 
 * Query params:
 * - breed: required, filter by breed
 * - gender: male | female (opposite of current pet)
 * - ageMin: minimum age in years
 * - ageMax: maximum age in years
 * - location: search location
 * - radius: search radius in km
 * - page: page number (default: 1)
 * - limit: results per page (default: 10, max: 50)
 * - minScore: minimum match score (0-100, default: 50)
 * - sortBy: totalScore | distance | rating (default: totalScore)
 */
export const searchMatches = async (req, res) => {
  try {
    const {
      breed,
      gender,
      ageMin = 1,
      ageMax = 12,
      location,
      radius = 100,
      page = 1,
      limit = 10,
      minScore = 50,
      sortBy = 'totalScore',
    } = req.query;

    console.log(`🔍 Searching matches for breed ${breed}`);

    if (!breed) {
      return errorResponse(res, 'Breed filter is required', 400);
    }

    // Validate pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    // TODO: In production, implement database query with:
    // - Pagination with skip/limit
    // - Filters (breed, gender, age, location, minScore)
    // - Sorting options
    // - AI score calculation for each result

    const searchResults = {
      query: {
        breed,
        gender,
        ageRange: [ageMin, ageMax],
        location,
        radius,
        minScore,
        sortBy,
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        skip,
        total: 24, // Mock total
        pages: Math.ceil(24 / limitNum),
      },
      results: [
        {
          id: 'pet-match-1',
          name: 'Luna',
          breed: 'Golden Retriever',
          age: 3,
          gender: 'female',
          owner: {
            id: 'user-123',
            name: 'Sarah Johnson',
            rating: 4.8,
            verified: true,
          },
          matchScore: {
            totalScore: 92,
            explanation: 'Excellent match - high compatibility across all factors',
          },
          distance: 32,
          location: 'San Francisco, CA',
          lastBreedingDate: '2024-06-15',
          certifications: ['Pedigree', 'Genetic Test', 'Health Certificate'],
        },
      ],
      message: `Found ${24} compatible pets${
        minScore > 50 ? ` matching your criteria` : ''
      }`,
    };

    return successResponse(res, 'Search results retrieved', searchResults, 200);
  } catch (error) {
    console.error('❌ Error searching matches:', error);
    return errorResponse(res, 'Failed to search matches', 500);
  }
};
